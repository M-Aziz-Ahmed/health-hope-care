# Testing the Call System

## Setup
1. Server is running on `http://localhost:3000` with Socket.IO
2. Open two browser windows/tabs (or use two different browsers)
3. Log in as different users in each window:
   - Window 1: Staff member
   - Window 2: Patient

## Test Steps

### 1. Check Socket Connection
Open browser console (F12) in both windows and look for:
```
Socket connected: [socket-id]
```

### 2. Navigate to Booking
- In Window 1 (Staff): Go to a booking detail page
- In Window 2 (Patient): Go to the same booking detail page

### 3. Check User IDs
In the console, you should see:
```
Call component initialized: {
  currentUser: "...",
  currentUserRole: "staff" or "patient",
  otherUserId: "...",
  booking: "...",
  ...
}
```

**Important**: Make sure `otherUserId` is NOT null!

### 4. Initiate Call
- Click the "Call" button
- Choose "Voice Call" or "Video Call"
- Allow camera/microphone permissions when prompted

### 5. Check Console Logs
You should see:
```
Sending call to: {
  to: "[other-user-id]",
  from: "[your-user-id]",
  callType: "audio" or "video",
  callerName: "Your Name"
}
```

### 6. Check Server Logs
In the terminal running the server, you should see:
```
Call from [user-id] (Name) to [other-user-id], type: audio/video
Rooms for user [other-user-id]: Set { ... }
Call signal sent to room [other-user-id]
```

### 7. Receive Call
In Window 2, you should see an animated incoming call notification with:
- Caller's name
- Call type (Voice/Video)
- Answer and Reject buttons

## Troubleshooting

### Issue: otherUserId is null
**Cause**: The booking doesn't have a userId or assignedStaff
**Solution**: 
1. Check the booking in MongoDB
2. Make sure `userId` field exists for patient bookings
3. Make sure `assignedStaff` field exists for staff assignments

### Issue: No incoming call notification
**Possible causes**:
1. **Socket not connected**: Check console for "Socket connected" message
2. **Wrong user ID**: Check that `otherUserId` matches the logged-in user's ID
3. **Not on same booking**: Both users must be viewing the same booking
4. **Browser tab inactive**: Some browsers pause JavaScript in inactive tabs

**Solutions**:
1. Refresh both pages
2. Check browser console for errors
3. Verify both users are logged in
4. Make sure both windows are active/visible

### Issue: Call connects but no audio/video
**Causes**:
1. Permissions not granted
2. Camera/microphone in use by another app
3. Browser doesn't support WebRTC

**Solutions**:
1. Grant camera/microphone permissions
2. Close other apps using camera/mic
3. Use Chrome, Firefox, or Edge (latest versions)

## Debug Commands

### Check Socket Rooms (in browser console)
```javascript
// This won't work directly, but server logs will show it
```

### Check Current User
```javascript
console.log('Current user:', currentUser);
```

### Check Booking Data
```javascript
console.log('Booking:', booking);
```

## Expected Flow

1. **User A** clicks Call → Sees "Connecting..." → Sees "Ringing..."
2. **User B** sees animated incoming call notification
3. **User B** clicks Answer → Both users see "Connected"
4. **Both users** can now talk/see each other
5. **Either user** clicks End Call → Call ends for both

## Notes

- Calls are peer-to-peer (WebRTC) after initial signaling
- Socket.IO is only used for signaling (call setup)
- Both users must have camera/microphone permissions
- Works best on localhost or HTTPS (required for WebRTC)
