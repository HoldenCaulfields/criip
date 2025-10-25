// src/socket.ts
import { io, Socket } from "socket.io-client";

const API_URL = "http://192.168.1.12:5000/api";
const SOCKET_URL = "http://192.168.1.12:5000";

// single shared socket instance
const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually where needed
  transports: ["websocket"],
});

export { socket, API_URL, SOCKET_URL };
