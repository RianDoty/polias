import { Namespace } from "socket.io";

export default class Base {
  readonly io!: Namespace;

  constructor(io: Namespace) {
    Object.defineProperty(this, "io", { value: io });
  }
}
