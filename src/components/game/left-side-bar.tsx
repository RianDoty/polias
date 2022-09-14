import React from "react";
import UserList from "./user-list";
import ActionBoard from "./action-board";
import useSession from '../../contexts/session'

const SideBar = () => {
    const { userId } = useSession()
    
  return (
    <div className="left-side-bar">
      <UserList />
      {userId}
      <ActionBoard />
    </div>
  );
};

export default SideBar;
