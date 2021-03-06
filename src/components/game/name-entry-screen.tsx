//Lets the user set their name when joining via link w/ code
import React, { useState, useContext } from "react";
import socket from '../../socket'

import UserContext from "../../contexts/user";

const NameEntryPrompt = () => {
  const [content, setContent] = useState("");
  const user = useContext(UserContext);

  function onSubmit(e) {
    e.preventDefault();

    //If the name contains no content other than whitespace
    if (!content.replace(/\s/g, "").length) return setContent("");

    user.update('name', content);
    socket.emit("set nickname", content);
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength="20"
      />
    </form>
  );
};

const NameEntryScreen = () => {
  const user = useContext(UserContext);

  const active = !user.name;

  return (
    <div className="name-entry-screen" active={+active}>
      <h1>Set Your Name:</h1>
      <NameEntryPrompt/>
    </div>
  );
};

export default NameEntryScreen;
