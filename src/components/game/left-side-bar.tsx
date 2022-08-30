import React from "react";
import UserList from "./user-list";
import ActionBoard from "./action-board";

const SideBar = () => {
  return (
    <div className="left-side-bar">
      <UserList />
      <ActionBoard />
    </div>
  );
};

export default SideBar;
