//Lets the user set their name when joining via link w/ code
import { useState, useContext } from 'react';
import { useSocket } from '../../hooks/socket';

import UserContext from '../../contexts/user';

const NameEntryPrompt = () => {
  const [content, setContent] = useState('');
  const { setName } = useContext(UserContext);
  const socket = useSocket();
  
  function onSubmit(e) {
    e.preventDefault();
    
    //If the name contains no content other than whitespace
    if (!content.replace(/\s/g, "").length) return setContent('');
    
    setName(content);
    socket.emit('set nickname', content)
  }
  
  return (
    <form onSubmit={onSubmit}>
      <input type='text' value={content} onChange={e=>setContent(e.target.value)}/>
      <input type='submit'/>
    </form>
  )
}

const NameEntryScreen = () => {
  const user = useContext(UserContext);
  
  const active = !user.name
  
  return (
    <div class='name-entry-screen' active={+active}>
      <h1>Set Your Name:</h1>
      <br/>
      <NameEntryPrompt/>
    </div>
  )
}

export default NameEntryScreen;