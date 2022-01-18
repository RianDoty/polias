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
  const user = useContext(UserContext);
  const {playing} = user;
  const socket = useSocket();

  const onClick = (e) => {
    //Toggle whether or not the player is playing or not
    const newState = !playing;
    user.update('playing', newState);
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

const HostGroup = () => {
  const user = useContext(UserContext);
  const show = user.host;

  if (show) return (<ActionGroup name="Host">

  </ActionGroup>);
  return null;
};

const ActionBoard = () => (
  <div className="action-board">
    <div className="action-board-header">Actions</div>
    <UserGroup />
    <HostGroup />
  </div>
);

export default ActionBoard;
