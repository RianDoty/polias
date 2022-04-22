import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import socket from './socket'

//Replace console.log with a mock that sends its messages to the server
console.log = (msg) => socket.emit('log', msg)

console.log('hehehehe')

ReactDOM.render(
  <React.StrictMode><App /></React.StrictMode>, 
document.getElementById('root'));