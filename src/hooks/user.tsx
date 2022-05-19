import useVolatileState from './volatile-state';
import useSocketCallbacks from './socket-callbacks'
import { RoomSocket } from '../socket-types';

const useUser = (socket: RoomSocket) => {
  const [state, updateState] = useVolatileState({
    name: '',
    cardId: -1,
    id: null,
    playing: false,
    host: false
  })

  useSocketCallbacks(socket, {
    
  })

  state.update = (prop, value) => updateState(s => {s[prop] = value;return s})
  return state
}

export default useUser