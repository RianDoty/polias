import { useState, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import useSync from "../../hooks/sync";
import { useSocket } from '../../hooks/socket';
import Avatar from './avatar'

import RoomContext from '../../contexts/room';
import UserContext from '../../contexts/user'

const Chat = ({chatRoomName='lobby'}) => {
  const code = useContext(RoomContext)
  const user = useContext(UserContext)
  const keyword = `room chat ${chatRoomName} ${code}`;
  const [messages, setMessages] = useSync(`room chat ${chatRoomName} ${code}`)
  const socket = useSocket();
  
  const currentKey = () => Object.keys(messages).reduce(((big, cur) => cur > big ? cur : big), 0)
  const submitMessage = (content) => {
    const id = uuidv4();
    //Locally cache the message
    setMessages(m => {
      m[id] = {author: user, content, key: currentKey() + 1};
      return m;
    })
    
    //Send the message to the server
    socket.emit(`send-message ${keyword}`, id, content)
  }
  
  return (
    <div className="chat">
      <MessageList messages={messages}/>
      <MessageEntry onSubmit={submitMessage}/>
    </div>
  );
};

const MessageList = ({messages={}}) => {
  const messageComponents = Object.values(messages).map(m => (<Message data={m}/>))
  
  return (
    <div className='message-list'>
      {messageComponents}
    </div>
  )
}

const Message = ({data: {author, content}}) => {
  return (
    <li className='message'>
      <Avatar cardId = {author.cardId}/>
      <div className='message-container'>
        <div className='message-author'>{author.name}</div>
        <div className='message-content'>{content}</div>
      </div>
    </li>
  )
}

const MessageEntry = ({onSubmit}) => {
  const [content, setContent] = useState('')
  const [lastMessageTime, setLastMessageTime] = useState();
  
  const onCooldown = () => {
    const time = Date.now()
  }
  function handleSubmit(e) {
    e.preventDefault();
    
    onSubmit(content);
    setContent('');
  }
  
  return (
    <form className='message-entry' onSubmit={handleSubmit}>
      <input value={content} onChange={(e)=>setContent(e.target.value)}/>
      <button/>
    </form>
  )
}

export default Chat;