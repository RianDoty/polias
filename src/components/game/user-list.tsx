import React, { useContext } from "react";
import useSync from "../../hooks/sync";
import RoomContext from "../../contexts/room";
import Avatar from "./avatar";
import useUsername from "../../contexts/username";
import type { UserTemplate } from "../../../server/user";
import useSession from "../../contexts/session";

const UserInfo = ({ user: { name = "Unknown", role = "Chillin'" } }) => {
  return (
    <div className="user-info">
      <div>{name}</div>
      <div className="muted">{role}</div>
    </div>
  );
};

const UserEntry = ({ user, me }: { user: UserTemplate; me: boolean }) => {
  return (
    <div className={`user-entry${me ? " this-user" : ""}`}>
      <Avatar user={user} />
      <UserInfo user={user} />
    </div>
  );
};

const UserList = () => {
  const code = useContext(RoomContext);
  const [loading, users] = useSync(code, "room_users");
  const [username] = useUsername();
  const { userId: myUserId } = useSession();

  if (loading)
    return (
      <div className="user-list">
        <UserEntry
          user={{
            name: username,
            role: "...",
            ready: false,
            isHost: false,
            userId: "",
            cardId: -1,
            present: true
          }}
          me={true}
          key={username}
        />
      </div>
    );

  const entries = Object.values(users).map((u) => (
    <UserEntry user={u} me={u.userId === myUserId} key={u.name} />
  ));

  return <div className="user-list">{entries}</div>;
};

export default UserList;
