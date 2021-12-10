import { useContext } from 'react';
import useSync from '../../hooks/sync';
import UserContext from '../../contexts/user';
import RoomContext from '../../contexts/room';
import { useSocket } from '../../hooks/socket';
import Avatar from './avatar'

const UserList = () => {
  const code = useContext(RoomContext);
  const user = useContext(UserContext);
  const socket = useSocket();
  const [users] = useSync(`room users ${code}`, {
    [socket.id]: {
      name: user.name,
      socketId: socket.id
    }
  });
  
  const entries = Object.values(users).map(u => (<UserEntry user={u} me={u.socketId === socket.id}/>))
  
  return (
  <div className='user-list'>
      {entries}
  </div>
  )
}

const UserEntry = ({user: {name='Unknown', cardID, role}, me}) => {
  return (
    <div className={`user-entry${me ? ' this-user' : ''}`}>
      <Avatar cardID={cardID}/>
      <UserInfo name={name} role={role}/>
    </div>
  )
}

const UserInfo = ({name='Unknown', role='Chillin\''}) => {
  return (
    <div class='user-info'>
      <div>{name}</div>
      <div className='muted'>{role}</div>
    </div>
  )
}

export default UserList