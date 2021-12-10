import { useState } from 'react';

const useForceUpdate = () => {
  const [, updateIndex] = useState(0);
  
  return () => updateIndex(i=>{console.log(i); return i+1;});
}

function useVolatileState(def) {
  //A state that refreshes EVERY time a change is made.
  const [state, setState] = useState(def);
  const forceUpdate = useForceUpdate()
  
  return [state, (v) => {setState(v); forceUpdate()}];
}

export default useVolatileState;