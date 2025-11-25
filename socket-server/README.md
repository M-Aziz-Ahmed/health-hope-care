# Socket.IO Server for Health Hope Care

This is a standalone Socket.IO server for handling real-time call signaling.

## Local Development

```bash
npm install
npm start
```

Server runs on port 3001 by default.

## Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this folder
5. Add environment variable:
   - `ALLOWED_ORIGINS`: Your Vercel URL (e.g., `https://your-app.vercel.app`)
6. Deploy!

## Deploy to Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Root Directory: `socket-server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variable:
   - `ALLOWED_ORIGINS`: Your Vercel URL
8. Deploy!

## Environment Variables

- `PORT`: Port to run on (default: 3001)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (e.g., `https://app1.vercel.app,https://app2.vercel.app`)

## Testing

Once deployed, you'll get a URL like:
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`

Use this URL in your Next.js app's `NEXT_PUBLIC_SOCKET_URL` environment variable.
