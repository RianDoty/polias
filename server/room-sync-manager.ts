import BaseManager from "./base-manager";
import { Diff, SyncHost } from "./sync";

import type Room from "./room";
import type User from "./user";
import { UserTemplate } from "./user";

export default class RoomSyncManager extends BaseManager {
  usersSync: SyncHost<"room_users">;
  stateSync: SyncHost<"room_state">;
  listSync: SyncHost<"rooms">;
  optionsSync: SyncHost<"room_options">;

  constructor(room: Room) {
    super(room);

    const { io } = this;

    this.usersSync = new SyncHost(io, "room_users", {});
    this.stateSync = new SyncHost(io, "room_state", {
      state: "lobby"
    });
    this.optionsSync = new SyncHost(io, "room_options", {
      cardPack: "fruits"
    });
    this.listSync = room.manager.roomListSync;
  }

  addUser(user: User) {
    this.usersSync.update({ [user.userID]: user.template() });
  }

  deleteUser(user: User) {
    this.usersSync.update({ [user.userID]: undefined });
  }

  updateUser(user: User, pathThenValue: Diff<UserTemplate>) {
    this.usersSync.update({ [user.userID]: pathThenValue });
  }

  updateState(key: string, value: any) {
    this.stateSync.update({ [key]: value });
  }

  updateList() {
    this.listSync.update({ [this.code]: this.room.template() });
  }
}
