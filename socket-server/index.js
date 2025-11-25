const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://*.vercel.app'
    ];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
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
    
    io.to(to).emit('incoming-call', {
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on port ${PORT}`);
  console.log(`📡 Allowed origins:`, allowedOrigins);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
