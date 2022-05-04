import useSync from './sync'

export default function useGame(code) {
  const [state] = useSync(`game state ${code}`)
  const [players] = useSync(`game players ${code}`)
  
  return {state, players}
}