import logging
import json

import iso8601
import requests
import smartypants
from docutils.core import publish_parts as render_rst
import rethinkdb as rdb

from django.shortcuts import render, redirect
from django.http import Http404

from gistio.rethink import rethinkdb_connect
from gistio.utils import get_setting

logger =  logging.getLogger(__name__)

FORMAT_RST = 'rst'
FORMAT_MD = 'md'

RENDERABLE = {
                u'Text': FORMAT_MD,
                u'Markdown': FORMAT_MD,
                u'Literate CoffeeScript': FORMAT_MD,
                u'reStructuredText': FORMAT_RST,
                None: FORMAT_MD,
             }

GITHUB_AUTH_PARAMS = get_setting('GITHUB_AUTH_PARAMS')

class GistFetchError(Exception): pass


@rethinkdb_connect
def gist(request, id):
    gist = rdb.table('gists').get(unicode(id)).run(request.rdbconn)
    if gist is None:
        try:
            user, gist = fetch_and_render(request, id)
        except GistFetchError:
            raise Http404()
    else:
        user = rdb.table('users').get(gist['author_id']).run(request.rdbconn)

    return render(request, 'gist.html', {'user': user, 'gist': gist})


@rethinkdb_connect
def usergist(request, user, id):
    print('rendered {} / {}'.format(user, id))
    return gist(request, id)


def fetch_and_render(request, id):
    """Fetch and render a post from the Github API"""
    req_gist = requests.get('https://api.github.com/gists/{}'.format(id),
                     params=GITHUB_AUTH_PARAMS)
    if req_gist.status_code != 200:
        logger.warning('Fetch {} failed: {}'.format(id, req_gist.status_code))
        raise GistFetchError()

    try:
        raw = req_gist.json()
    except ValueError:
        logger.error('Fetch {} failed: unable to decode JSON response'.format(id))
        raise GistFetchError()

    user = {}
    for prop in ['id', 'login', 'avatar_url', 'html_url', 'type']:
        user[prop] = raw['user'][prop]
    user['fetched_at'] = rdb.now()
    rdb.table('users').insert(user, upsert=True).run(request.rdbconn)

    gist = {
        'id': raw['id'],
        'html_url': raw['html_url'],
        'public': raw['public'],
        'description': raw['description'],
        'created_at': iso8601.parse_date(raw['created_at']),
        'updated_at': iso8601.parse_date(raw['updated_at']),
        'author_id': user['id'],
        'author_login': user['login'],
        'files': [],
    }


    for gistfile in raw['files'].values():
        format = RENDERABLE.get(gistfile['language'], None)

        if format is None:
            continue

        output = None

        if format is FORMAT_MD:
            payload = {
                'mode': 'gfm',
                'text': gistfile['content'],
            }
            req_render = requests.post('https://api.github.com/markdown',
                                       params=GITHUB_AUTH_PARAMS,
                                       data=unicode(json.dumps(payload)))
            if req_render.status_code != 200:
                logger.warn('Render {} file {} failed: {}'.format(id, gistfile['filename'], req_render.status_code))
                continue
            else:
                output = smartypants.smartypants(req_render.text)

        if format is FORMAT_RST:
            rendered = render_rst(gistfile['content'], writer_name='html')['fragment']
            output = smartypants.smartypants(rendered)

        if output is not None:
                gistfile['rendered'] = output
                gist['files'].append(gistfile)


    rdb.table('gists').insert(gist, upsert=True).run(request.rdbconn)
    return user, gist