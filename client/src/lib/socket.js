import io from 'socket.io-client';

const socket = io('https://handup.onrender.com/api', {
  withCredentials: true,
  transports: ['websocket'] 
});

export default socket;
