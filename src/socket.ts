import io from "socket.io-client";
const socket = io.connect("https://bakery.the-watcher.uz");
setTimeout(() => console.log(socket), 3000);
export default socket;
