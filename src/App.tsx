import React from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
import Gist from './Gist'

function Index() {
  return <h1>Home</h1>
}

function About() {
  return <h1>About</h1>
}

export default function App() {
  return (
    <Router>
      <Route path='/' exact component={Index}/>
      <Route path='/about' component={About}/>
      <Route path='/@:user/:id' component={Gist}/>
    </Router>
  )
}

