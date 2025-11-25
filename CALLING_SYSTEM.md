# Real-Time Video/Audio Calling System

## Overview
The application now has a real-time WebRTC-based calling system with Socket.IO signaling.

## Features
- **Voice Calls**: Audio-only calls between users
- **Video Calls**: Full video calling with camera and microphone
- **Real-time Signaling**: Socket.IO handles call initiation, ringing, and connection
- **Incoming Call Notifications**: Users receive animated notifications when someone calls them
- **Call Controls**: Mute/unmute, video on/off, end call

## How It Works

### 1. Starting the Server
The app now uses a custom Node.js server with Socket.IO:
```bash
npm run dev
```

This starts the server on `http://localhost:3000` with Socket.IO enabled.

### 2. Making a Call
1. Navigate to a booking detail page
2. Click the "Call" button
3. Choose "Voice Call" or "Video Call"
4. The system will:
   - Request camera/microphone permissions
   - Create a WebRTC peer connection
   - Send a call signal to the other user via Socket.IO
   - Show "Ringing..." status

### 3. Receiving a Call
When someone calls you:
1. An animated notification appears with the caller's name
2. You can choose to "Answer" or "Reject"
3. If you answer, the call connects automatically
4. If you reject, the caller is notified

### 4. During the Call
- **Mute/Unmute**: Click the microphone button
- **Video On/Off**: Click the camera button (video calls only)
- **End Call**: Click the red phone button

## Technical Details

### Socket.IO Events
- `join`: User joins with their user ID
- `call-user`: Initiates a call with offer
- `answer-call`: Accepts a call with answer
- `reject-call`: Rejects an incoming call
- `end-call`: Ends an active call
- `ice-candidate`: Exchanges ICE candidates for NAT traversal

### WebRTC Configuration
- Uses Google STUN servers for NAT traversal
- Peer-to-peer connection for low latency
- Automatic ICE candidate exchange

### User Identification
- Staff calls patients using `booking.userId`
- Patients call staff using `booking.assignedStaff._id`

## Browser Requirements
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera and microphone permissions required
- HTTPS required in production (localhost works for development)

## Troubleshooting

### Call doesn't connect
- Check browser console for errors
- Ensure both users are online and connected to Socket.IO
- Verify camera/microphone permissions are granted

### No ringing on other side
- Check that Socket.IO server is running
- Verify user IDs are correct in the booking
- Check browser console for Socket.IO connection status

### Audio/Video not working
- Grant camera/microphone permissions
- Check device settings
- Try refreshing the page
