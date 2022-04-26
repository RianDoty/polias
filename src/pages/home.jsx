import React from "react";
import { useState, useContext } from "react";
import { useLocation, Link } from "wouter";
import useSync from "../hooks/sync";

import UserContext from "../contexts/user";

import "../styles/home.css";

import socket from "../socket";

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
const NameEntry = ({ user }) => {
  const [inpVal, updateInpVal] = useState("");
  const [err, setErr] = useState("");
  
  function onSubmit(e) {
    e.preventDefault();

    try {
      if (inpVal) {
        //The input is valid, set the user's name
        user.update("name", inpVal);

        //Connect to the server
        socket.auth = { username: inpVal };
        socket.connect();
      } else throw Error("Invalid name!");

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
        maxLength="20"
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
  const [err, setErr] = useState();
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();
  const user = useContext(UserContext);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!user.name || user.name === "Unnamed") {
      setErr("Set your name!");
      return false;
    }

    console.log("submitted");
    //Tell the server to create a room with the given name
    socket.emit("room:create", name, ([success, code]) => {
      //After the room is created with a random code, join that room
      if (success) setLocation(`/game/${code}`);
      else {/*Handle error*/}
    });
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
        Hosted by {hostName}{" "}
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
  const user = useContext(UserContext);

  let middleSection;
  if (user.name) {
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
          <NameEntry user={user} />
        </Cell>
      </Section>
      {middleSection}
      <Section>
        <BottomLogo />
      </Section>
    </div>
  );
}