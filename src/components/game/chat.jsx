import React, { useState, useEffect, useContext, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import useSync from "../../hooks/sync";
import { useSocket } from '../../hooks/socket';
import Avatar from './avatar'

import RoomContext from '../../contexts/room';
import UserContext from '../../contexts/user'

function randomInt(max=0, min=0) {
  return min + Math.floor(Math.random() * max)
}

function randomFromArray(arr) {
  return arr[randomInt(arr.length)]
}

const Chat = ({chatRoomName='lobby'}) => {
  const code = useContext(RoomContext)
  const user = useContext(UserContext)
  const keyword = `room chat ${chatRoomName} ${code}`;
  const [messages, setMessages] = useSync(`room chat ${chatRoomName} ${code}`)
  const socket = useSocket();
  const [oldScroll, setOldScroll] = useState(0);
  const messageListRef = useRef();
  const messageList = messageListRef.current;
  
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
  
  useEffect(()=>{
    if (!messageList) return;
    const currentLength = messageList.scrollHeight;
    
    messageList.scrollTop = currentLength;
  },[Object.values(messages).length])
  
  return (
    <div className="chat">
      <MessageList messages={messages}/>
      <MessageEntry onSubmit={submitMessage}/>
    </div>
  );
};

const MessageList = ({messages={}}) => {
  const messageComponents = Object.values(messages).map(m => {return (<Message data={m}/>)})
  
  return (
    <div className='message-list'>
      {messageComponents}
    </div>
  )
}

const Message = ({data: {author, content}}) => {
  const ref = useRef()
  
  useEffect(()=>{
    ref.current.scrollIntoView();
  },[ref.current])
  
  return (
    <li className='message' ref={ref}>
      <Avatar user={author}/>
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
  
  const rejectionMessages = [
    'No.',
    'Stop.',
    'Nope!',
    'Nevermind'
  ]
  function onMessageChange(text) {
    if (/*text.match(/amogus/i)*/ false) {
      setContent(randomFromArray(rejectionMessages))
      return
    }
    setContent(text);
  }
  
  const onCooldown = () => {
    const time = Date.now()
  }
  function handleSubmit(e) {
    e.preventDefault();
    
    //If the message contains no content other than whitespace
    if (!content.replace(/\s/g, "").length) return false;

    onSubmit(content);
    setContent('');
  }
  
  return (
    <form className='message-entry' onSubmit={handleSubmit}>
      <input value={content} onChange={(e)=>onMessageChange(e.target.value)}/>
      <button/>
    </form>
  )
}

export default Chat;