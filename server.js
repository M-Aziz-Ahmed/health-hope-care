const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.userId = userId;
      socket.join(userId);
      console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    socket.on('call-user', ({ to, from, offer, callType, callerName, booking }) => {
      console.log(`Call from ${from} (${callerName}) to ${to}, type: ${callType}`);
      console.log(`Rooms for user ${to}:`, io.sockets.adapter.rooms.get(to));
      console.log(`Total connected sockets:`, io.sockets.sockets.size);
      
      const sent = io.to(to).emit('incoming-call', {
        from,
        offer,
        callType,
        callerName,
        booking
      });
      
      console.log(`Call signal sent to room ${to}`);
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

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Socket.IO server is running');
  });
});
