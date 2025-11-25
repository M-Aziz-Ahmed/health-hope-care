import { Server } from 'socket.io';

let io;

export async function GET(req) {
  if (!io) {
    const httpServer = req.socket.server;
    
    io = new Server(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join', (userId) => {
        socket.userId = userId;
        socket.join(userId);
        console.log(`User ${userId} joined`);
      });

      socket.on('call-user', ({ to, from, offer, callType, callerName }) => {
        console.log(`Call from ${from} to ${to}`);
        io.to(to).emit('incoming-call', {
          from,
          offer,
          callType,
          callerName
        });
      });

      socket.on('answer-call', ({ to, answer }) => {
        io.to(to).emit('call-answered', { answer });
      });

      socket.on('reject-call', ({ to }) => {
        io.to(to).emit('call-rejected');
      });

      socket.on('end-call', ({ to }) => {
        io.to(to).emit('call-ended');
      });

      socket.on('ice-candidate', ({ to, candidate }) => {
        io.to(to).emit('ice-candidate', { candidate });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  return new Response('Socket server running', { status: 200 });
}
