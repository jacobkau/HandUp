import io from 'socket.io-client';

const socket = io(
  import.meta.env.DEV
    ? 'http://localhost:5000'
    : 'https://handup.onrender.com',
  {
    withCredentials: true,
    transports: ['websocket'],
  }
);

export default socket;
