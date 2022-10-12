import React, { useState, useEffect, useContext, useRef } from "react";
import useSync, { usePersonalSync } from "../../hooks/sync";
import Avatar from "./avatar";
import RoomContext from "../../contexts/room";
import useSocket from "../../hooks/socket";
import type { UserTemplate } from "../../../server/user";
import { MessageTemplate } from "../../../server/sync";
import useSession from "../../contexts/session";

function randomInt(max = 0, min = 0) {
  return min + Math.floor(Math.random() * max);
}

function randomFromArray(arr) {
  return arr[randomInt(arr.length)];
}

const Message = ({ data: { author, content } }: { data: MessageTemplate }) => {
  return (
    <li className="message">
      <Avatar user={author} />
      <div className="message-container">
        <div className="message-author">{author.name}</div>
        <div className="message-content">{content}</div>
      </div>
    </li>
  );
};

const MessageEntry = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState(-99999);
  const [error, setError] = useState<string>();

  //Deprecated anti-amogus filter
  // const rejectionMessages = ["No.", "Stop.", "Nope!", "Nevermind"];
  function onMessageChange(text) {
    // if (text.match(/amogus/i)) {
    //   setContent(randomFromArray(rejectionMessages));
    //   return;
    // }
    setContent(text);
  }

  const onCooldown = () => {
    const time = Date.now();

    //Return true if it hasn't been 0.5s since last message
    const delay = 0.5;
    return lastMessageTime + delay * 1000 > time;
  };
  function handleSubmit(e) {
    e.preventDefault();

    //If the message contains no content other than whitespace
    if (!content.replace(/\s/g, "").length) return false;
    if (onCooldown()) {
      setError("You're sending messages too fast!");
      return false;
    }

    setLastMessageTime(Date.now());
    onSubmit(content);
    setContent("");
  }

  return (
    <form className="message-entry" onSubmit={handleSubmit}>
      <input
        value={content}
        onChange={(e) => onMessageChange(e.target.value)}
      />
      <button />
    </form>
  );
};

const MessageList = ({
  messages,
  loading
}: {
  messages?: { [key: string]: MessageTemplate };
  loading: boolean;
}) => {
  const ref = useRef<HTMLDivElement>();

  const msgAmt = messages ? Object.values(messages).length : 0;
  useEffect(() => {
    const messageList = ref.current;
    const { scrollTop, scrollHeight, offsetHeight } = messageList;

    const isScrolledToBottom = scrollHeight - offsetHeight - scrollTop < 100;

    if (isScrolledToBottom) {
      messageList.scrollTop = scrollHeight;
    }
  }, [msgAmt, loading]);

  if (loading || !messages) return <div className="message-list" ref={ref} />;

  const messageComponents = Object.values(messages).map((m) => {
    return <Message data={m} />;
  });

  return (
    <div className="message-list" ref={ref}>
      {messageComponents}
    </div>
  );
};

const Chat = () => {
  const code = useContext(RoomContext);
  const [loading, messages] = usePersonalSync(code, "chat_log");
  const socket = useSocket(`${code}/chat`);

  const submitMessage = (content) => socket.emit("message-send", content);

  return (
    <div className="chat">
      <MessageList messages={messages} loading={loading} />
      <MessageEntry onSubmit={submitMessage} />
    </div>
  );
};

export default Chat;
