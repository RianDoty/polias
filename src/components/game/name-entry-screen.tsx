//Lets the user set their name when joining via link w/ code
import React, { useState, useContext } from "react";
import socket from "../../socket";

const NameEntryPrompt = () => {
  const [content, setContent] = useState("");

  function onSubmit(e) {
    e.preventDefault();

    //If the name contains no content other than whitespace
    if (!content.replace(/\s/g, "").length) return setContent("");

    socket.emit("set nickname", content);
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={20}
      />
    </form>
  );
};

const NameEntryScreen = () => {
  const active = false;

  if (active)
    return (
      <div className="name-entry-screen">
        <h1>Set Your Name:</h1>
        <NameEntryPrompt />
      </div>
    );

  return null;
};

export default NameEntryScreen;
