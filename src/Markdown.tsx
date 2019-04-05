import React from 'react'
import marked, { Renderer } from 'marked'
import hljs from 'highlight.js'

const escapeMap: {[k:string]: string} = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}

function escapeForHTML(input: string) {
  return input.replace(/([&<>'"])/g, char => escapeMap[char]);
}

const renderer = new Renderer()
renderer.code = (code, language) => {
  // Check whether the given language is valid for highlight.js.
  const validLang = !!(language && hljs.getLanguage(language));

  // Highlight only if the language is valid.
  // highlight.js escapes HTML in the code, but we need to escape by ourselves
  // when we don't use it.
  const highlighted = validLang
    ? hljs.highlight(language, code).value
    : escapeForHTML(code);

  // Render the highlighted code with `hljs` class.
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
}

// Set the renderer to marked.
marked.setOptions({ renderer });

interface MarkdownProps {
  raw: string,
}

const Markdown = ({ raw }: MarkdownProps) => (
  <div dangerouslySetInnerHTML={{__html: marked(raw)}}/>
)

export default Markdown
