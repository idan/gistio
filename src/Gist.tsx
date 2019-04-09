import React from 'react'
import './paraiso-hljs.css'
import 'isomorphic-fetch'
import {Helmet} from 'react-helmet'
import Markdown from './Markdown'
import { RouteComponentProps } from 'react-router-dom'

import useFetch from './useFetch'

function useFetchGist(user:string, id: string) {
  const url = `https://gist.githubusercontent.com/${user}/${id}/raw`
  return useFetch(url)
} 

type GistRouteParams = {
  user: string
  id: string
}

interface GistProps extends RouteComponentProps<GistRouteParams> {}

const Gist = (props: GistProps) => {
  const { user, id } = props.match.params
  const raw = useFetchGist(user, id)
  const content = raw
    ? <Markdown raw={raw}/>
    : <p>Loading…</p>
  return (
    <article className='mw7-ns center ph2 mv4'>
      <Helmet>
        <title>Gist.io • @{user}/{id}</title>
      </Helmet>
      <header className='mv4 f6'>
        <a href={`https://github.com/${user}/`} target='_blank'>@&thinsp;{user}</a>&thinsp;/&thinsp;<a href={`https://gist.github.com/${user}/${id}`} target='_blank'>{id}</a>
      </header>
      <div className='content f3-ns f4'>
        {content}      
      </div>
      <footer>
        <div className='pt3 mt5 bt b--light-gray gray i'>
          <a href='/'>gist.io</a> &middot; writing for hackers &middot; zero setup &middot; publish in seconds
        </div>
      </footer>
    </article>
  )
}
export default Gist
  
