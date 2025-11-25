import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // User joins with their user ID
      socket.on('join', (userId) => {
        socket.userId = userId;
        socket.join(userId);
        console.log(`User ${userId} joined with socket ${socket.id}`);
      });

      // Initiate call
      socket.on('call-user', ({ to, from, offer, callType, callerName }) => {
        console.log(`Call from ${from} to ${to}`);
        io.to(to).emit('incoming-call', {
          from,
          offer,
          callType,
          callerName,
          callerId: socket.id
        });
      });

      // Answer call
      socket.on('answer-call', ({ to, answer }) => {
        console.log(`Call answered by ${socket.userId} to ${to}`);
        io.to(to).emit('call-answered', { answer });
      });

      // Reject call
      socket.on('reject-call', ({ to }) => {
        console.log(`Call rejected by ${socket.userId} to ${to}`);
        io.to(to).emit('call-rejected');
      });

      // End call
      socket.on('end-call', ({ to }) => {
        console.log(`Call ended by ${socket.userId} to ${to}`);
        io.to(to).emit('call-ended');
      });

      // ICE candidate exchange
      socket.on('ice-candidate', ({ to, candidate }) => {
        io.to(to).emit('ice-candidate', { candidate });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
