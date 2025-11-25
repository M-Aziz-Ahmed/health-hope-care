# Deploying to Vercel with Socket.IO

## ⚠️ Important: Vercel Limitation

Vercel's serverless architecture **does not support WebSocket connections** (which Socket.IO requires). You have two options:

---

## Option 1: Deploy Socket.IO Server Separately (Recommended)

### Step 1: Keep Next.js on Vercel
Your main app stays on Vercel as normal.

### Step 2: Deploy Socket.IO Server to Railway/Render/Heroku

#### A. Create a separate Socket.IO server project:

Create a new folder `socket-server/` with these files:

**socket-server/package.json:**
```json
{
  "name": "socket-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "socket.io": "^4.7.2",
    "cors": "^2.8.5"
  }
}
```

**socket-server/index.js:**
```javascript
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://your-vercel-app.vercel.app', // Replace with your Vercel URL
    ],
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
```

#### B. Deploy to Railway (Free & Easy):

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your socket-server folder
5. Railway will auto-detect Node.js and deploy
6. Copy the deployment URL (e.g., `https://your-app.railway.app`)

#### C. Update Your Next.js App:

In your Next.js components, update the Socket.IO connection:

**components/WebRTCallWithSocket.jsx:**
```javascript
// Change this line:
const socketInstance = io();

// To this:
const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
```

**app/staff/page.jsx and app/user/page.jsx:**
```javascript
// Change this line:
const socketInstance = io();

// To this:
const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
```

#### D. Add Environment Variable to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - Key: `NEXT_PUBLIC_SOCKET_URL`
   - Value: `https://your-app.railway.app` (your Railway URL)
4. Redeploy your Vercel app

---

## Option 2: Use Pusher or Ably (Managed WebSocket Service)

Instead of Socket.IO, use a managed service:

### Using Pusher:

1. Sign up at https://pusher.com (free tier available)
2. Create a new Channels app
3. Install: `npm install pusher pusher-js`
4. Replace Socket.IO code with Pusher

**Pros:**
- Works perfectly with Vercel
- Managed infrastructure
- Free tier available

**Cons:**
- Requires code changes
- Limited free tier

---

## Option 3: Deploy Everything to a VPS (Not Vercel)

If you want to keep the custom server:

1. Deploy to DigitalOcean, AWS EC2, or Linode
2. Use PM2 to run your Node.js server
3. Set up Nginx as reverse proxy
4. Use your custom `server.js` as-is

---

## Recommended Approach for Your App

**For Development:**
- Keep using `npm run dev` with custom server locally

**For Production:**
1. Deploy Socket.IO server to Railway (5 minutes, free)
2. Deploy Next.js app to Vercel (as normal)
3. Connect them via environment variable

This gives you:
- ✅ Free hosting for both
- ✅ Automatic deployments
- ✅ Scalability
- ✅ SSL certificates
- ✅ Global CDN (Vercel)

---

## Quick Fix for Vercel (Temporary)

If you need a quick fix right now:

1. **Revert package.json:**
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

2. **Remove custom server for Vercel build**

3. **Deploy Socket.IO separately** (see Option 1)

4. **Update Socket.IO connections** to point to separate server

---

## Testing Locally with Separate Socket Server

1. Start Socket.IO server:
```bash
cd socket-server
npm install
npm start
# Runs on port 3001
```

2. Start Next.js app:
```bash
npm run dev
# Runs on port 3000
```

3. Both should work together!

---

## Environment Variables Needed

**.env.local (for local development):**
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Vercel Environment Variables:**
```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
```

---

## Summary

**The Problem:** Vercel doesn't support WebSocket/Socket.IO in serverless functions

**The Solution:** Deploy Socket.IO server separately (Railway/Render) and connect via URL

**Time to Fix:** ~15 minutes

**Cost:** Free (Railway free tier)
