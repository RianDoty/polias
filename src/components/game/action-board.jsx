import { useContext } from "react";
import UserContext from "../../contexts/user";
import RoomContext from "../../contexts/room";
import { useSocket } from "../../hooks/socket";
import useRoom from "../../hooks/room";

import "../../styles/action-board.css";

const ActionGroup = ({ name, children }) => (
  <div className="action-group">
    <div className="action-group-name muted">{name}</div>
    {children}
  </div>
);

const SwapSpectatePlayButton = () => {
  const { playing, setPlaying } = useContext(UserContext);
  const socket = useSocket();

  const onClick = (e) => {
    //Toggle whether or not the player is playing or not
    const newState = !playing;
    setPlaying(newState);
    socket.emit("toggle-ready", newState);
  };

  return (
    <button className="button" onClick={onClick}>
      {playing ? "Spectate" : "Play"}
    </button>
  );
};

const StartGameButton = () => {
  const {} = useContext(RoomContext);
};

const UserGroup = () => (
  <ActionGroup name="User">
    <SwapSpectatePlayButton />
  </ActionGroup>
);

const HostGroup = () => <ActionGroup name="Host"></ActionGroup>;

const ActionBoard = () => {
  const user = useContext(UserContext);

  return (
    <div className="action-board">
      <div className="action-board-header">Actions</div>
      <UserGroup />
      <ActionGroup name="Host">
        <button className="button">Start Game</button>
      </ActionGroup>
    </div>
  );
};

export default ActionBoard;
