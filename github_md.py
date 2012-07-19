"""
Taken from https://gist.github.com/710689
Credit to mvasilkov
Modifed by @b1naryth1ef to include fenced code blocks.
"""

import re
from hashlib import md5

FENCED = re.compile(r'(?P<fence>^`{3,})[ ]*(?P<lang>[a-zA-Z0-9_-]*)[ ]*\n(?P<code>.*?)(?P=fence)[ ]*$', re.MULTILINE|re.DOTALL)
CODE_WRAP = '<pre><code%s>%s</code></pre>'
LANG_TAG = ' class="%s"'

def gfm(text):
    # Extract pre blocks.
    def test(text):
        m = FENCED.search(text)
        if m:
            lang = LANG_TAG % m.group('lang')
            text = CODE_WRAP % (lang, m.group('code'))
        return text
    text = test(text)    

    extractions = {}
    def pre_extraction_callback(matchobj):
        digest = md5(matchobj.group(0).encode('utf-8')).hexdigest()
        extractions[digest] = matchobj.group(0)
        return "{gfm-extraction-%s}" % digest
    pattern = re.compile(r'<pre>.*?</pre>', re.MULTILINE | re.DOTALL)
    text = re.sub(pattern, pre_extraction_callback, text)

    # Prevent foo_bar_baz from ending up with an italic word in the middle.
    def italic_callback(matchobj):
        s = matchobj.group(0)
        if list(s).count('_') >= 2:
            return s.replace('_', '\_')
        return s
    pattern = re.compile(r'^(?! {4}|\t).*\w+(?<!_)_\w+_\w[\w_]*', re.MULTILINE | re.UNICODE)
    text = re.sub(pattern, italic_callback, text)

    # In very clear cases, let newlines become <br /> tags.
    def newline_callback(matchobj):
        if len(matchobj.group(1)) == 1:
            return matchobj.group(0).rstrip() + '  \n'
        else:
            return matchobj.group(0)
    pattern = re.compile(r'^[\w\<][^\n]*(\n+)', re.MULTILINE | re.UNICODE)
    text = re.sub(pattern, newline_callback, text)

    # Insert pre block extractions.
    def pre_insert_callback(matchobj):
        return '\n\n' + extractions[matchobj.group(1)]
    text = re.sub(r'{gfm-extraction-([0-9a-f]{32})\}', pre_insert_callback, text)
    
    return text
