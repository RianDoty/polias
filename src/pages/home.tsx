import React from "react";
import { useState, useContext } from "react";
import { useLocation, Link } from "wouter";
import useSync from "../hooks/sync";

import useUsername from "../contexts/username";

import "../styles/home.css";

import useSocket from "../contexts/socket";
import useSocketCallbacks from '../hooks/socket-callbacks'

//Components
const Section = ({ children }) => (
  <div className="dash-section">{children}</div>
);

const BottomLogo = () => <h3 className="bottom-logo">Polias</h3>;

const Cell = ({ children, wClass, header }) => (
  <div className={`cell ${wClass}`}>
    <div className="dash-box">
      <CellHeader>{header}</CellHeader>
      {children}
    </div>
  </div>
);

const CellHeader = ({ children }) => (
  <div className="cell-header">{children}</div>
);

const Error = ({ children }) => <span className="error">{children}</span>;

//Displays a form for the user to enter their name
const NameEntry = ({ setUsername }) => {
  const socket = useSocket()
  const [inpVal, updateInpVal] = useState("");
  const [err, setErr] = useState("");
  
  function onSubmit(e) {
    e.preventDefault();

    try {
      if (inpVal) {
        const username = inpVal
        //The input is valid, set the user's name
        setUsername(username)

        //Submit username to server
        socket.emit('username', username)
      } else throw "Invalid name!";

      setErr("")
    } catch (err) {
      setErr(err.message);
    }
  }

  let errComponent;
  if (err) {
    errComponent = <Error>{err}</Error>;
  }

  return (
    <form onSubmit={onSubmit} className="name-entry-form">
      <input
        type="text"
        className="transparent-input"
        value={inpVal}
        maxLength={20}
        onChange={(e) => {
          try {
            updateInpVal(e.target.value);
          } catch (error) {
            setErr(error);
          }
        }}
      />
      <input type="submit" className="button" value="✓" />
      <br />
      {errComponent}
    </form>
  );
};

//Displays a form for naming and creating a room
const RoomCreator = () => {
  const socket = useSocket()
  const [err, setErr] = useState('');
  const [name, setName] = useState("");
  const [username] = useUsername();

  const onSubmit = (e) => {
    e.preventDefault();

    if (!username || username === "Unnamed") {
      setErr("Set your name!");
      return false;
    }

    console.log("submitted");
    //Tell the server to create a room with the given name
    socket.emit("room_create", name);
  };

  let errComponent;
  if (err) {
    errComponent = <Error>{err}</Error>;
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        className="transparent-input"
        placeholder="Room Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input type="submit" className="button" value="Create" />
      {errComponent}
    </form>
  );
};

//Displays a list of every ongoing room
const RoomList = () => {
  const [rooms] = useSync("rooms");

  const e = Object.entries(rooms).map(([i, r]) => (
    <div key={i}>
      <RoomEntry room={r} />
    </div>
  ));

  return <div className="dashboard-list">{e}</div>;
};

const RoomEntry = ({ room }) => {
  const { code, name, hostName, pCount, pMax } = room;
  return (
    <Link href={`/game/${code}`}>
      <strong>{name}</strong>
      <div className="muted">
        Hosted by {hostName}{"  "}
        <span className="p-4px">
          <strong>
            {pCount}
            <span className="f-80"> OF </span>
            {pMax}
          </strong>
        </span>
      </div>
    </Link>
  );
};

//Page
export default function Home() {
  const [username, setUsername] = useUsername();
  const [connected, setConnected] = useState(false)
  const [, setLocation] = useLocation()
  
  useSocketCallbacks({
    connect: () => {setConnected(true); console.log('conn')},
    disconnect: () => setConnected(false),
    connect_error: (e) => {setConnected(false); console.log('err', e.message)},
    room_send: (code) => setLocation(`/game/${code}`)
  })
  
  
  let middleSection;
  if (connected) {
    middleSection = (
      <Section>
        <Cell wClass="w-3-5" header="Current Games">
          <RoomList />
        </Cell>
        <Cell wClass="w-2-5" header="Make a game">
          <RoomCreator />
        </Cell>
      </Section>
    );
  }

  return (
    <div className="narrow">
      <Section>
        <h1>Welcome to Polias!</h1>
        <p>
          Polias is a deception game (very early in development) where{" "}
          <em>everyone</em> gets to have fun.
        </p>
        <p>
          Scheme, steal, and work to make bank the fastest to buy the legendary
          idol and ascend to greatness!
        </p>
        <p>
          If you just want to use the chat and not the more experimental parts
          of the site, visit{" "}
          <a className="default" href="https://www.erhschat.glitch.me">
            ERHSchat.
          </a>
        </p>
      </Section>
      <h2>Get Started</h2>
      <Section>
        <Cell wClass="w-1-2 center-float" header="Enter your Name">
          <NameEntry setUsername={setUsername} />
        </Cell>
      </Section>
      {middleSection}
      <Section>
        <BottomLogo />
      </Section>
    </div>
  );
}
