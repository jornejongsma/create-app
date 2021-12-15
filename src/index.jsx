import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';


ReactDOM.render(<App />, container('root'));

function container(name) {
  if (!document.getElementById(name)) {
    const root = document.createElement('div');
    root.setAttribute('id', name);
    document.body.appendChild(root);
  }
  return document.getElementById(name);
}
