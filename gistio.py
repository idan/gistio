import os
import json
import urlparse

from redis import StrictRedis
from markdown2 import markdown
import requests

from flask import Flask, render_template, make_response, abort
app = Flask(__name__)

HEROKU = 'HEROKU' in os.environ

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
    STATIC_URL = ''

CACHE_EXPIRATION = 60  # seconds


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
    decoded = json.loads(r.content)
    for f in decoded['files'].values():
        if f['language'] == u'Markdown':
            f['rendered'] = markdown(f['content'])
    encoded = json.dumps(decoded)
    cache.setex(id, CACHE_EXPIRATION, encoded)
    return encoded


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
