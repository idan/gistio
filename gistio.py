import datetime
import json

from redis import StrictRedis
from markdown2 import markdown
import requests

from flask import Flask, render_template, make_response
app = Flask(__name__)

cache = StrictRedis()
CACHE_EXPIRATION = 60  # seconds


@app.route('/')
def homepage():
    return render_template('home.html')


@app.route('/<int:id>')
def render_gist(id):
    return render_template('gist.html', gist_id=id)


@app.route('/<int:id>/content')
def gist_contents(id):
    resp = cache.get(id) or fetch_and_render(id)
    resp.headers['Content-Type'] = 'application/json'
    resp.headers['X-Expire-TTL-Seconds'] = cache.ttl(id)
    return resp


def fetch_and_render(id):
    """Fetch and render a post from the Github API"""
    r = requests.get('https://api.github.com/gists/{}'.format(id))
    decoded = json.loads(r.content)
    for f in decoded['files'].values():
        if f['language'] == u'Markdown':
            f['rendered'] = markdown(f['content'])
    encoded = json.dumps(decoded)
    cache.setexp(id, CACHE_EXPIRATION, encoded)
    return encoded


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
