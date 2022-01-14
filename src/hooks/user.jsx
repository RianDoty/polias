import { useState } from 'react';
import { useSocketCallbacks } from '../hooks/socket'

const useUser = () => {
  const [name, setName] = useState();
  const [cardId, setCardId] = useState();
  const [id, setId] = useState()
  const [playing, setPlaying] = useState(false);
  
  const stateCallbacks = {
    cardId: cardId => setCardId(cardId),
    id: id => setId(id),
    name: name => setName(name)
  }
  
  useSocketCallbacks({
    'changed': (diff) => {
      Object.entries(diff).forEach(([prop,value]) =>{
        const callback = stateCallbacks[prop];
        
        if (!callback) return false;
        
        callback(value);
      })
    }
  })
  
  return {name, setName, cardId, setCardId, playing, setPlaying, id, setId};
}

export default useUser