import os
import json

from redis import StrictRedis
from markdown2 import markdown
import requests
import bleach

from flask import Flask, render_template, make_response, abort
app = Flask(__name__)

HEROKU = 'HEROKU' in os.environ

if HEROKU:
    cache = StrictRedis.from_url(os.environ['REDISTOGO_URL'])
    PORT = int(os.environ.get('PORT', 5000))
    STATIC_URL = '//static.gist.io/'
else:
    cache = StrictRedis()  # local development
    PORT = 5000
    STATIC_URL = ''

CACHE_EXPIRATION = 60  # seconds

RENDERABLE = [u'Markdown', u'Text']

ALLOWED_TAGS = [
    "a", "abbr", "acronym", "b", "blockquote", "code", "em", "i", "li", "ol", "strong",
    "ul", "br", "img", "span", "div", "pre", "p", "dl", "dd", "dt", "tt", "cite", "h1",
    "h2", "h3", "h4", "h5", "h6", "table", "col", "tr", "td", "th", "tbody", "thead",
    "colgroup",
]

ALLOWED_ATTRIBUTES = {
    "a": ["href", "title"],
    "acronym": ["title"],
    "abbr": ["title"],
    "img": ["src"],
}

@app.route('/')
def homepage():
    return render_template('home.html', static_url=STATIC_URL)


@app.route('/<int:id>')
def render_gist(id):
    return render_template('gist.html', gist_id=id, static_url=STATIC_URL)


@app.route('/<int:id>/content')
def gist_contents(id):
    content = cache.get(id) or fetch_and_render(id)
    if content is None:
        abort(404)
    resp = make_response(cache.get(id) or fetch_and_render(id), 200)
    resp.headers['Content-Type'] = 'application/json'
    resp.headers['X-Expire-TTL-Seconds'] = cache.ttl(id)
    return resp


def fetch_and_render(id):
    """Fetch and render a post from the Github API"""
    r = requests.get('https://api.github.com/gists/{}'.format(id))
    if r.status_code != 200:
        return None
    decoded = r.json.copy()
    for f in decoded['files'].values():
        if f['language'] in RENDERABLE:
            f['rendered'] = bleach.clean(markdown(f['content']),
                tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES)
    encoded = json.dumps(decoded)
    cache.setex(id, CACHE_EXPIRATION, encoded)
    return encoded


if __name__ == '__main__':
    cache.flushall()
    app.run(host='0.0.0.0', debug=True, port=PORT)
