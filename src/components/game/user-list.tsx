import React, { useContext } from "react";
import useSync from "../../hooks/sync";
import RoomContext from "../../contexts/room";
import Avatar from "./avatar";

const UserInfo = ({ user: { name = "Unknown", role = "Chillin'" } }) => {
  return (
    <div className="user-info">
      <div>{name}</div>
      <div className="muted">{role}</div>
    </div>
  );
};

const UserEntry = ({ user, me }) => {
  return (
    <div className={`user-entry${me ? " this-user" : ""}`} key={user.name}>
      <Avatar user={user} />
      <UserInfo user={user} />
    </div>
  );
};

const UserList = () => {
  const code = useContext(RoomContext);
  const [loading, users, updateUsers] = useSync(code, "room_users");

  if (loading)
    return (
      <div className="user-list">
        <UserEntry user={null} me={true} />
      </div>
    );

  const thisUserId = null; //TODO: grab session
  const entries = Object.values(users).map((u) => (
    <UserEntry user={u} me={u.userID === thisUserId} />
  ));

  return <div className="user-list">{entries}</div>;
};

export default UserList;
