import os
import json
import urlparse

import rethinkdb as r
from rethinkdb.errors import RqlRuntimeError, RqlDriverError
from redis import StrictRedis
import requests
import iso8601

from flask import Flask, g, render_template, make_response, abort, request
app = Flask(__name__)

HEROKU = 'HEROKU' in os.environ

GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')

AUTH_PARAMS = {'client_id': GITHUB_CLIENT_ID,
               'client_secret': GITHUB_CLIENT_SECRET}

if 'RETHINKDB_URL' in os.environ:
    urlparse.uses_netloc.append('rethinkdb')
    rethink_url = urlparse.urlparse(os.environ['RETHINKDB_URL'])
    RETHINK_CONNARGS = {}
    rethink_argmap = {'hostname': 'host',
                      'port': 'port',
                      'username': 'db',
                      'password': 'auth_key'}
    for k,v in rethink_argmap.items():
        p = getattr(rethink_url, k, None)
        if p is not None:
            RETHINK_CONNARGS[v] = p

if HEROKU:
    urlparse.uses_netloc.append('redis')
    redis_url = urlparse.urlparse(os.environ['REDISTOGO_URL'])
    cache = StrictRedis(host=redis_url.hostname,
                        port=redis_url.port,
                        password=redis_url.password)

    PORT = int(os.environ.get('PORT', 5000))
    STATIC_URL = '//static.gist.io/'
else:
    cache = StrictRedis()  # local development
    PORT = 5000
    STATIC_URL = '/static/'

CACHE_EXPIRATION = 60  # seconds

RENDERABLE = (u'Markdown', u'Text', u'Literate CoffeeScript', None)


@app.before_request
def before_request():
    try:

        g.rethink = r.connect(**RETHINK_CONNARGS)
    except RqlDriverError:
        abort(503, "No database connection could be established.")

@app.teardown_request
def teardown_request(exception):
    try:
        g.rethink.close()
    except AttributeError:
        pass


@app.route('/oauth')
def oauth():
    app.logger.warning("Method: {}".format(request.method))
    app.logger.warning("Args: {}".format(request.args))
    return(u"oauth")

@app.route('/')
def homepage():
    return render_template('home.html', STATIC_URL=STATIC_URL)


@app.route('/<int:id>')
def render_gist(id):
    return render_template('gist.html', gist_id=id, STATIC_URL=STATIC_URL)


@app.route('/<int:id>/content')
def gist_contents(id):
    cache_hit = True
    content = cache.get(id)
    if not content:
        cache_hit = False
        content = fetch_and_render(id)
    if content is None:
        abort(404)
    resp = make_response(content, 200)
    resp.headers['Content-Type'] = 'application/json'
    resp.headers['X-Cache-Hit'] = cache_hit
    resp.headers['X-Expire-TTL-Seconds'] = cache.ttl(id)
    return resp


def fetch_and_render(id):
    """Fetch and render a post from the Github API"""
    req_gist = requests.get('https://api.github.com/gists/{}'.format(id),
                     params=AUTH_PARAMS)
    if req_gist.status_code != 200:
        app.logger.warning('Fetch {} failed: {}'.format(id, r.status_code))
        return None

    try:
        raw = req_gist.json()
    except ValueError:
        app.logger.error('Fetch {} failed: unable to decode JSON response'.format(id))
        return None

    user = {}
    for prop in ['id', 'login', 'avatar_url', 'html_url', 'type']:
        user[prop] = raw['user'][prop]
    user['fetched_at'] = r.now()
    r.table('users').insert(user, upsert=True).run(g.rethink)

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
        if gistfile['language'] in RENDERABLE:
            payload = {
                'mode': 'gfm',
                'text': gistfile['content'],
            }
            req_render = requests.post('https://api.github.com/markdown',
                                       params=AUTH_PARAMS,
                                       data=unicode(json.dumps(payload)))
            if req_render.status_code != 200:
                app.logger.warn('Render {} file {} failed: {}'.format(id, gistfile['filename'], req_render.status_code))
                continue
            else:
                gistfile['rendered'] = req_render.text
                gist['files'].append(gistfile)


    r.table('gists').insert(gist, upsert=True).run(g.rethink)
    encoded = json.dumps(raw)
    cache.setex(id, CACHE_EXPIRATION, encoded)
    return encoded


if __name__ == '__main__':
    if HEROKU:
        app.run(host='0.0.0.0', port=PORT)
    else:
        cache.flushall()
        app.run(host='0.0.0.0', debug=True, port=PORT)
