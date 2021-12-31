import React from 'react';

//Game-related stuff
import useRoom from '../hooks/room';
import RoomContext from '../contexts/room';
import CardPackContext from '../contexts/cardPack';

//Game components
import SideBar from '../components/game/side-bar'
import MiddleContent from '../components/game/middle-content'

//Style
import '../styles/game.css'

export default function RoomMain({params}) {
  const {code} = params;
  const { cardPack } = useRoom(code);
  
  return (
    <>
      <RoomContext.Provider value={code}>
        <CardPackContext.Provider value={cardPack}>
          <SideBar/>
          <MiddleContent/>
        </CardPackContext.Provider>
      </RoomContext.Provider>
    </>
  )
}