import React from 'react';
import { Switch, Route, } from 'wouter';

//Page imports
import Home from '../pages/home'
import Room from '../pages/room'

export default function PageRouter() {
  return (
    <Switch>
      <Route path='/' component={Home}/>
      <Route path='/game/:code' component={Room}/>
    </Switch>
  )
}