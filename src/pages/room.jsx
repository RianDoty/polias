import React from "react";

//Game-related stuff
import useRoom from "../hooks/room";
import RoomContext from "../contexts/room";
import CardPackContext from "../contexts/cardPack";

//Game components
import LeftSideBar from "../components/game/left-side-bar";
import MiddleContent from "../components/game/middle-content";
import Console from "../components/game/console/console";
import NameEntryScreen from "../components/game/name-entry-screen";

//Style
import "../styles/game.css";

export default function RoomMain({ params: { code } }) {
  const { cardPack } = useRoom(code);

  return (
    <RoomContext.Provider value={code}>
      <CardPackContext.Provider value={cardPack}>
        <LeftSideBar />
        <MiddleContent />
        <Console />
        <NameEntryScreen />
      </CardPackContext.Provider>
    </RoomContext.Provider>
  );
}
