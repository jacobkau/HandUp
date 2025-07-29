import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
        credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
