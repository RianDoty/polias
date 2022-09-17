import { Namespace } from "socket.io";

const off = true;
export default function debugNSP(nsp: Namespace) {
  if (off) return;
  console.log(`NSP ${nsp.name} created`);
  nsp.on("connection", (socket) => {
    console.log(`[${nsp.name}] connection`);

    socket.onAny((ev: string, ...args) => {
      console.log(`[${nsp.name}] ⇒ ${ev}, %O`, args);
    });

    socket.onAnyOutgoing((ev: string, ...args) => {
      console.log(`[${nsp.name}] ⇐ ${ev}, %O`, args);
    });

    socket.on("disconnect", (r) =>
      console.log(`[${nsp.name}] disconnect: ${r}`)
    );
  });
}
