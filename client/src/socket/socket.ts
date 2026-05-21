import { io, Socket } from 'socket.io-client';

const SERVER_URL = `http://${window.location.hostname}:3001`;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: true,
      transports: ['websocket'],
    });
  }
  return socket;
}
