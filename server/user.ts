import { v4 as uuidv4 } from "uuid";
import BaseRoomStructure from './base-room-structure';
import type Room from "./room";

const maxNicknameLength = 20;

export interface UserTemplate {
  //{ name, userID, isHost, ready, role }
  name: string
  userID: string
  isHost: boolean
  ready: boolean
  role: string
}

//Represents a Socket inside of a Room
class User extends BaseRoomStructure {
  name!: string;
  userID!: string;
  ready!: boolean;
  inGame!: false;
  room!: Room;
  role!: string;

  constructor(room: Room, { userID, name = "Unknown" }: { userID: string, name: string }) {
    super(room);

    if (!userID) userID = uuidv4();

    Object.assign(this, {
      name,
      userID,
      ready: false,
      inGame: false,
      room,
      role: "Chillin'",
    })
  }

  getSockets() {
    return
  }

  setNickname(nickname: string) {
    //Verification
    if (nickname.length > maxNicknameLength) return false;

    this.name = nickname;
  }

  setReady(ready = !this.ready) {
    this.ready = ready;

    if (!this.inGame) {
      const role = ready ? "Ready" : "Chillin'";
      this.role = role;
    }
  }

  template(): UserTemplate {
    const {
      name,
      userID,
      ready,
      role
    } = this;

    const isHost = this.isHost()
    return { name, userID, isHost, ready, role };
  }

  isHost() {
    return this.room.isHost(this);
  }

  hasAdmin() {
    //Determines if a user has perms to change parts of the game
    return this.isHost;
  }
}

export default User
