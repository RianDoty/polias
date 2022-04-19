import { useState } from 'react';
import isEqual from 'lodash.isequal';
import clone from 'lodash.clonedeep';

const useForceUpdate = () => {
  const [, updateIndex] = useState(0);
  
  return () => updateIndex(i=>i+1);
}

function useVolatileState(def) {
  //A state that refreshes every time a change is made, but using lodash.isEqual to test equality.
  const [state, setState] = useState(def);
  const forceUpdate = useForceUpdate()
  
  return [state, (v) => {
    const oldState = clone(state)
    setState(v)
    if (!isEqual(oldState, state)) {
      forceUpdate()
    };
  }];
}

export default useVolatileState;