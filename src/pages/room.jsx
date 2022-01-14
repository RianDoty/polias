import React from 'react';

//Game-related stuff
import useRoom from '../hooks/room';
import RoomContext from '../contexts/room';
import CardPackContext from '../contexts/cardPack';

//Game components
import LeftSideBar from '../components/game/left-side-bar'
import MiddleContent from '../components/game/middle-content'
import NameEntryScreen from '../components/game/name-entry-screen';

//Style
import '../styles/game.css'

export default function RoomMain({params}) {
  const {code} = params;
  const { cardPack } = useRoom(code);
  
  return (
    <>
      <RoomContext.Provider value={code}>
        <CardPackContext.Provider value={cardPack}>
          <LeftSideBar/>
          <MiddleContent/>
          <NameEntryScreen/>
        </CardPackContext.Provider>
      </RoomContext.Provider>
    </>
  )
}