# Quick Deployment Guide

## Step 1: Deploy Socket.IO Server to Railway (5 minutes)

### A. Sign up for Railway
1. Go to https://railway.app
2. Click "Login" → Sign in with GitHub
3. Authorize Railway

### B. Deploy Socket Server
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Click "Add variables" and add:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
   (Replace with your actual Vercel URL after Step 2)
5. Railway will auto-detect the `socket-server` folder and deploy
6. Wait for deployment (1-2 minutes)
7. Click on your service → "Settings" → Copy the public URL
   - Example: `https://socket-server-production-xxxx.up.railway.app`

### C. Alternative: Deploy to Render (Free)
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repo
5. Settings:
   - Name: `socket-server`
   - Root Directory: `socket-server`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://your-vercel-app.vercel.app`
7. Click "Create Web Service"
8. Copy the URL (e.g., `https://socket-server.onrender.com`)

---

## Step 2: Deploy Next.js App to Vercel

### A. Push to GitHub
```bash
git add .
git commit -m "Update for Vercel deployment with separate Socket.IO server"
git push
```

### B. Deploy to Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### C. Add Environment Variables
Click "Environment Variables" and add:

```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
```
(Use the URL from Step 1)

Also add your other environment variables:
```
MONGODB_URI=your_mongodb_connection_string
```

### D. Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## Step 3: Update Socket Server CORS

Go back to Railway/Render and update the `ALLOWED_ORIGINS` variable:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

This allows both production and local development.

---

## Step 4: Test Your Deployment

1. Open your Vercel URL in two browser windows
2. Login as staff in one, patient in another
3. Try making a call
4. Should work! 🎉

---

## Local Development Setup

### Terminal 1: Socket.IO Server
```bash
cd socket-server
npm install
npm start
```
Runs on http://localhost:3001

### Terminal 2: Next.js App
```bash
npm run dev
```
Runs on http://localhost:3000

### .env.local
Create this file in your project root:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
MONGODB_URI=your_mongodb_connection_string
```

---

## Troubleshooting

### Calls don't work on Vercel
1. Check browser console for Socket.IO connection errors
2. Verify `NEXT_PUBLIC_SOCKET_URL` is set in Vercel
3. Check Railway/Render logs for connection attempts
4. Verify CORS origins include your Vercel URL

### Socket.IO won't connect
1. Make sure Socket server is running (check Railway/Render dashboard)
2. Check if URL is correct (no trailing slash)
3. Try accessing the Socket URL directly in browser (should show "Cannot GET /")
4. Check browser console for CORS errors

### "Mixed Content" error
- Make sure Socket.IO server URL uses HTTPS in production
- Railway and Render provide HTTPS by default

---

## Cost

- **Railway**: Free tier (500 hours/month, plenty for this app)
- **Render**: Free tier (750 hours/month)
- **Vercel**: Free tier (100GB bandwidth/month)

Total cost: **$0/month** 🎉

---

## Summary

✅ Socket.IO server deployed separately (Railway/Render)
✅ Next.js app deployed to Vercel
✅ Connected via environment variable
✅ Works in production!

**Deployment time:** ~15 minutes
**Monthly cost:** Free
