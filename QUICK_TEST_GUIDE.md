# Quick Test Guide - Call System

## ✅ Fixed Issue
The call system now works **from any page**! Users will receive incoming call notifications even when not on the booking detail page.

## How to Test

### Setup (2 Browser Windows)
1. **Window 1**: Login as Staff → Go to `/staff` dashboard
2. **Window 2**: Login as Patient → Go to `/user` dashboard

### Test Call Flow

#### From Staff Dashboard:
1. **Window 1** (Staff): 
   - On `/staff` page
   - Find a booking in the list
   - Click the **Phone icon** or **Video icon** on the booking card
   - Choose "Voice Call" or "Video Call"
   - Allow camera/microphone permissions

2. **Window 2** (Patient):
   - Can be on `/user` dashboard (doesn't need to be on booking page!)
   - Will see an **animated green notification** in bottom-right corner
   - Shows: "Incoming Voice/Video Call" with caller's name
   - Click **"Answer"** → Redirects to booking page and connects
   - Or click **"Reject"** → Declines the call

#### From Patient Booking Page:
1. **Window 2** (Patient):
   - Go to `/user/booking/[booking-id]`
   - Click the **"Call"** button
   - Choose "Voice Call" or "Video Call"

2. **Window 1** (Staff):
   - Can be on `/staff` dashboard
   - Will see **animated green notification** in bottom-right corner
   - Click **"Answer"** → Opens call window and connects
   - Or click **"Reject"** → Declines the call

### What You Should See

#### Caller's Screen:
```
1. "Connecting..." (getting media)
2. "Ringing..." (waiting for answer)
3. "Connected" (call active)
```

#### Receiver's Screen:
```
1. Animated green notification pops up (bottom-right)
2. Shows caller name and call type
3. Answer/Reject buttons
4. After answering: "Connected"
```

### Browser Console Logs

#### Both Users Should See:
```javascript
Socket connected: [socket-id]
User [user-id] joined with socket [socket-id]
```

#### Caller Should See:
```javascript
Sending call to: { to: "...", from: "...", callType: "audio/video" }
```

#### Receiver Should See:
```javascript
Incoming call from: [Caller Name]
```

#### Server Terminal Should Show:
```
Call from [caller-id] (Name) to [receiver-id], type: audio/video
Rooms for user [receiver-id]: Set { ... }
Call signal sent to room [receiver-id]
```

## Key Features Now Working

✅ **Global Call Reception**: Users receive calls from any page (staff dashboard, user dashboard)
✅ **Animated Notifications**: Eye-catching green bouncing notification
✅ **Auto-Navigation**: Patient clicking "Answer" auto-navigates to booking page
✅ **Staff In-Place Answer**: Staff can answer directly from dashboard
✅ **Call Details**: Shows caller name, call type, and service
✅ **Reject Functionality**: Properly notifies caller when rejected

## Troubleshooting

### No notification appears:
1. Check browser console for "Socket connected" message
2. Verify both users are logged in
3. Check server terminal for "Call from ... to ..." message
4. Make sure booking has valid userId and assignedStaff

### Call doesn't connect after answering:
1. Grant camera/microphone permissions
2. Check that both users are on the booking page after answering
3. Look for WebRTC errors in console
4. Try refreshing both pages

### "otherUserId is null" error:
1. Check that booking has userId (for patient) or assignedStaff (for staff)
2. Verify user IDs in database match
3. Check console logs for user ID values

## Success Indicators

✅ Green notification appears within 1-2 seconds of call initiation
✅ Notification shows correct caller name and call type
✅ Answer button navigates/opens call window
✅ Both users see "Connected" status
✅ Audio/video works in both directions
✅ Reject button properly ends call for both users

## Notes

- **Patient Answer**: Redirects to booking page (needed for full call context)
- **Staff Answer**: Opens call window directly on staff dashboard
- **Notification Persists**: Until answered, rejected, or caller ends call
- **Multiple Calls**: Only one call notification at a time (latest call)
- **Auto-Cleanup**: Notifications disappear when call ends

## Next Steps

If everything works:
- ✅ System is production-ready for basic calling
- Consider adding call history tracking
- Consider adding missed call notifications
- Consider adding ringtone sounds

If issues persist:
- Check CALL_SYSTEM_STATUS.md for detailed debugging
- Review server logs for Socket.IO connection issues
- Verify database has correct user IDs in bookings
