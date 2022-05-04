import useVolatileState from './volatile-state';
import useSocketCallbacks from './socket-callbacks'

const useUser = () => {
  const [state, updateState] = useVolatileState({
    name: '',
    cardId: -1,
    id: null,
    playing: false,
    host: false
  })

  useSocketCallbacks({
    'changed': (diff) => {
      Object.entries(diff).forEach(([prop, value]) => updateState(user => {
        user[prop] = value;
        return user}));
    }
  })

  state.update = (prop, value) => updateState(s => {s[prop] = value;return s})
  return state
}

export default useUser