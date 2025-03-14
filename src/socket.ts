import io from "socket.io-client";
const socket = io.connect("https://bakery.the-watcher.uz");
socket.on("error", () => {});
socket.on("exception", (e: Error) => {
  console.error(e);
});
export default socket;
