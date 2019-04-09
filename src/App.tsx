import React from 'react'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
import Gist from './Gist'
import Home from './Home'

export default function App() {
  return (
    <Router>
      <Route path='/' exact component={Home}/>
      <Route path='/@:user/:id' component={Gist}/>
    </Router>
  )
}

