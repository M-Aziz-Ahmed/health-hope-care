# Start Local Development

## Quick Start (2 Terminals)

### Terminal 1: Socket.IO Server
```bash
cd socket-server
npm install
npm start
```
✅ Socket server running on http://localhost:3001

### Terminal 2: Next.js App
```bash
npm run dev
```
✅ Next.js app running on http://localhost:3000

## Test It
1. Open http://localhost:3000 in two browser windows
2. Login as staff in one, patient in another
3. Make a call - should work! 🎉

## For Production
Follow the steps in `DEPLOY_TO_VERCEL.md`
