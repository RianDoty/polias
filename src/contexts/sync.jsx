import React from 'react';

const contexts = {};

function getContext(keyword) {
  let context = contexts[keyword]
  if (!context) context = React.createContext();
  return context
}

export default getContext;