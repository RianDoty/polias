import { useState } from 'react';
import { useSocketCallbacks } from '../hooks/socket'

const useUser = () => {
  const [name, setName] = useState();
  const [cardId, setCardId] = useState();
  const [id, setId] = useState()
  const [playing, setPlaying] = useState(false);
  
  useSocketCallbacks({
    'assign-card': (card) => {
      setCardId(card)
      console.log(`card assigned from server to ${card}`)
    },
    'assign-uuid': (id) => {
      setId(id);
      console.log(`uuid recieved as: ${id}`)
    }
  })
  
  return {name, setName, cardId, setCardId, playing, setPlaying, id, setId};
}

export default useUser