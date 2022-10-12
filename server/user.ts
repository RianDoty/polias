import { v4 as uuidv4 } from "uuid";
import BaseRoomStructure from "./base-room-structure";
import type Room from "./room";

const maxNicknameLength = 20;

export interface UserTemplate {
  //{ name, userID, isHost, ready, role }
  name: string;
  userId: string;
  isHost: boolean;
  ready: boolean;
  role: string;
  cardId: number;
  present: boolean;
}

//Represents a Socket inside of a Room
class User extends BaseRoomStructure {
  name: string;
  userId: string;
  ready: boolean;
  inGame: false;
  role: string;
  present: boolean;

  constructor(
    room: Room,
    {
      userId = uuidv4(),
      name = "Unknown"
    }: {
      userId?: string;
      name: string;
    }
  ) {
    super(room);

    this.name = name;
    this.userId = userId;
    this.ready = false;
    this.inGame = false;
    this.role = "Chillin'";
    this.present = true;
  }

  getSockets() {
    return;
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

  isHost() {
    return this === this.room.users.getHost();
  }

  template(): UserTemplate {
    const { name, userId, ready, role, present } = this;

    const isHost = this.isHost();
    //TODO: fetch cardId properly
    return { name, userId, isHost, ready, role, cardId: 1, present };
  }

  hasAdmin() {
    //Determines if a user has perms to change parts of the game
    return this.isHost;
  }
}

export default User;
