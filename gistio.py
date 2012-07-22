import os

from flask import Flask, render_template, make_response, abort
app = Flask(__name__)

HEROKU = 'HEROKU' in os.environ

if HEROKU:
    PORT = int(os.environ.get('PORT', 5000))
    STATIC_URL = '//static.gist.io/'
else:
    PORT = 5000
    STATIC_URL = ''

@app.route('/')
def homepage():
    return render_template('home.html', static_url=STATIC_URL)

@app.route('/<int:id>')
def render_gist(id):
    return render_template('gist.html', gist_id=id, static_url=STATIC_URL)

if __name__ == '__main__':
    if HEROKU:
        app.run(host='0.0.0.0', port=PORT)
    else:
        app.run(host='0.0.0.0', debug=True, port=PORT)
