import React from 'react'
import './paraiso-hljs.css'
import 'isomorphic-fetch'
import {Helmet} from 'react-helmet'
import Markdown from './Markdown'
import { RouteComponentProps } from 'react-router-dom'

import useFetch from './useFetch'

interface GistReponseFile extends Object {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  truncated: boolean,
  content: string;
}

interface GistReponse extends Object {
  id: string;
  html_url: string;
  files: {
    [key: string]: GistReponseFile;
  };
  public: boolean;
  created_at: string;
  updated_at: string;
  description:  string;
  comments: number;
  comments_url: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  truncated: boolean;
}

function useFetchGist(user:string, id: string) {

    const url = `https://api.github.com/gists/${id}`
    const response = useFetch(url) as unknown as GistReponse

    if (typeof response == 'object') {
      // @TODO: Verify that response.owner.login.toLowerCase() === user.toLowerCase()
      const files : Array<GistReponseFile> = Object.values(response!.files)
      const subjects = Object.entries(files).filter(([key, value]) => {
          // @TODO: Replace with lookup function to support more languages
          return value.language == 'Markdown'
        }
      );

      // @TODO: If nothing found, grab first file (as previously done)
      const subject = Object.values(subjects)[0][1]
      console.log(subject)

      return {
        comments: response.comments,
        comments_url: response.comments_url,
        created_at: response.created_at,
        image: response.owner.avatar_url,
        public: response.public,
        raw: subject.content,
        title: response.description,
        updated_at: response.updated_at,
      }
    }
}

type GistRouteParams = {
  user: string
  id: string
}

interface GistProps extends RouteComponentProps<GistRouteParams> {}

const Gist = (props: GistProps) => {
  const { user, id } = props.match.params

  const response = useFetchGist(user, id)

  const content = response
    ? <Markdown raw={response.raw}/>
    : <p>Loading…</p>

  return (
    <article className='mw7-ns center ph2 mv4'>
      <Helmet>
        <title>Gist.io • @{user} • {response ? response.title : ''}</title>
        <meta name="robots" content={response && response.public ? 'index' :'noindex'} />
      </Helmet>
      <header className='mv4 f6'>
        <img
            src={response ? `${response.image}` : 'https://avatars.githubusercontent.com/u/0'}
            className="br-100 ba h3 w3 dib"
            alt="avatar"
        />
        <a href={`https://github.com/${user}/`} target='_blank'>@&thinsp;{user}</a>&thinsp;/&thinsp;<a href={`https://gist.github.com/${user}/${id}`} target='_blank'>{id}</a>
        -
        <span>
          {response ? new Date(response.created_at).toISOString().slice(0, 10) : ''}
        </span>
        <span>
          &nbsp;(updated {response ? new Date(response.updated_at).toISOString().slice(0, 10) : ''})
        </span>
      </header>
      <div className='content f3-ns f4'>
        {content}
      </div>

{response ?
      <aside>
        <a href={response ? response.comments_url : ''}
          className="ba bg-animate bg-white br-pill dib hover-bg-black hover-white mid-gray no-underline ph3 pv2 "
        >
        There are {response ? response.comments:'no'} comments
        </a>
      </aside>
: ''}

      <footer>
        <div className='pt3 mt5 bt b--light-gray gray i'>
          <a href='/'>gist.io</a> &middot; writing for hackers &middot; zero setup &middot; publish in seconds
        </div>
      </footer>
    </article>
  )
}

export default Gist
