import { useState } from 'react';

const useForceUpdate = () => {
  const [, updateIndex] = useState(0);
  
  return () => updateIndex(i=>i+1);
}

function useVolatileState(def) {
  //A state that refreshes EVERY time a change is made.
  const [state] = useState(def);
  const forceUpdate = useForceUpdate()
  
  return [state, (v) => {
    //Check if the callback returns false
    const newState = v(state);
    if (newState === false) return forceUpdate();
    forceUpdate() //The table mutations were already made
  }];
}

export default useVolatileState;