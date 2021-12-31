import { useState } from 'react';
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from 'react/cjs/react.production.min';
import { useSocketCallbacks } from '../hooks/socket'

const useUser = () => {
  const [name, setName] = useState();
  const [cardId, setCardId] = useState();
  const [id, setId] = useState()
  
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
  
  return {name, setName, cardId, setCardId};
}

export default useUser