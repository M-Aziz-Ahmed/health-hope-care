import { Server } from 'socket.io';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO');
    const io = new Server(res.socket.server);

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join', (userId) => {
        socket.userId = userId;
        socket.join(userId);
        console.log(`User ${userId} joined with socket ${socket.id}`);
      });

      socket.on('call-user', ({ to, from, offer, callType, callerName, booking }) => {
        console.log(`Call from ${from} (${callerName}) to ${to}, type: ${callType}`);
        io.to(to).emit('incoming-call', {
          from,
          offer,
          callType,
          callerName,
          booking
        });
      });

      socket.on('answer-call', ({ to, answer }) => {
        console.log(`Call answered, sending to ${to}`);
        io.to(to).emit('call-answered', { answer });
      });

      socket.on('reject-call', ({ to }) => {
        console.log(`Call rejected, notifying ${to}`);
        io.to(to).emit('call-rejected');
      });

      socket.on('end-call', ({ to }) => {
        console.log(`Call ended, notifying ${to}`);
        io.to(to).emit('call-ended');
      });

      socket.on('ice-candidate', ({ to, candidate }) => {
        io.to(to).emit('ice-candidate', { candidate });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export const GET = ioHandler;
export const POST = ioHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
