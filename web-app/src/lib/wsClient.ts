import { io, Socket } from 'socket.io-client';

export function createSocket(): Socket {
  // через proxy достаточно io() без URL
  return io('/', { withCredentials: true });
}

export function createSocketWithUrl(url: string): Socket {
  return io(url, { withCredentials: true });
}
