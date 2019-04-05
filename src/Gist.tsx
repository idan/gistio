import React from 'react'
import './paraiso-hljs.css'
import 'isomorphic-fetch'
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
    <div>
      <pre>@{user} / {id}</pre>
      {content}      
    </div>
  )
}
export default Gist
  
