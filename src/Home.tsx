import React from 'react'
import {Helmet} from 'react-helmet'

export default function Home() {
  return (<div className='mw7-ns center ph2 mv4 f3-ns f4 content'>
    <Helmet>
      <title>Gist.io • Writing for Hackers</title>
    </Helmet>

    <h1 className='f-5-ns f1 mt5 mt6-ns noligs'>Gist.io <span className='fw3 i f2-ns f3 moon-gray'>is</span><br/>Writing for Hackers</h1>
    <p>There’s a scale of permanence to writing on the web. On one end, we have the tweet: brief and ephemeral. On the other end of the scale, we have longform blog writing: unlimited in length and hopefully impervious to the passage of time.</p>
    <p>Sometimes, we just want to share a bit of writing that is neither. Maybe we want to write for a specific audience, but don’t want to address the people who usually read our blogs. Maybe it’s just something that doesn’t fit into 140 characters.</p>
    <p>Gist.io is a solution for that, inspired by Mike Bostock’s delightful <a href="https://bl.ocks.org" target="_blank">bl.ocks.org</a></p>
    <h3>Usage</h3>
    <ol>
      <li><a href="https://gist.github.com">Create a gist</a> on GitHub with a single <a href="https://commonmark.org/help/">Markdown</a>-syntax file.</li>
      <li>In the URL bar, replace <code>gist.github.com</code> with <code>gist.io</code>.</li>
      <li>Enjoy your beautifully-presented writing.</li>
    </ol>

    <p>Happy writing!</p>
    <p>Idan Gazit</p>
    <p><a href="https://gazit.me">Web</a> / <a href="https://twitter.com/idangazit">Twitter</a> / <a href="https://github.com/idan">GitHub</a></p>
  </div>)
}