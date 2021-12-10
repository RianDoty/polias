import { useState } from 'react';
import { useSocketCallbacks } from '../hooks/socket'

const useUser = () => {
  const [name, setName] = useState();
  const [cardId, setCardId] = useState();
  
  useSocketCallbacks({
    'assign-card': (card) => setCardId(card)
  })
  
  return {name, setName, cardId, setCardId};
}

export default useUser