# Real-Time Staff Location Tracking

## Overview
The system now tracks staff location in real-time and displays it to patients on the booking tracking page.

## How It Works

### 1. Staff Side (Location Broadcasting)
When staff clicks "Navigate" on a booking:
1. Browser requests GPS permission
2. Staff's location is tracked continuously (every few seconds)
3. Location is sent via Socket.IO to the booking room
4. Distance and ETA are calculated automatically

### 2. Patient Side (Location Receiving)
When patient views booking tracking page:
1. Connects to Socket.IO server
2. Joins the booking room
3. Receives real-time location updates from staff
4. Map and ETA update automatically

### 3. Socket.IO Events

**Staff emits:**
```javascript
socket.emit('update-staff-location', {
  bookingId: '...',
  location: { lat: 24.8607, lng: 67.0011 },
  estimatedTime: 15 // minutes
});
```

**Patient receives:**
```javascript
socket.on('staff-location-update', ({ location, estimatedTime }) => {
  // Update map marker
  // Update ETA display
});
```

## Features

✅ **Real GPS Tracking**: Uses browser's Geolocation API
✅ **Live Updates**: Location sent every time it changes
✅ **Accurate ETA**: Calculated using Haversine formula
✅ **Room-Based**: Only relevant patient sees the location
✅ **Automatic**: No manual refresh needed

## Privacy & Security

- Location only shared when staff actively navigating
- Only visible to the specific patient for that booking
- Location tracking stops when navigation ends
- No location history stored

## Browser Requirements

### Staff:
- Must allow location permissions
- GPS/Location services enabled
- Modern browser (Chrome, Firefox, Safari, Edge)

### Patient:
- Any modern browser
- No special permissions needed
- Works on mobile and desktop

## Testing

### 1. As Staff:
1. Login and go to staff dashboard
2. Click "Navigate" on a booking
3. Allow location permissions
4. Your location will be tracked

### 2. As Patient:
1. Login and go to booking tracking page
2. If staff is navigating, you'll see:
   - Live location marker on map
   - Real-time ETA updates
   - Distance to your location

### 3. Check Console:
**Staff console:**
```
Connected to location tracking
Staff location update for booking [id]: { lat: ..., lng: ... }
```

**Patient console:**
```
Connected to location tracking
Received staff location: { lat: ..., lng: ... }
```

## Troubleshooting

### Location not updating:

**Staff side:**
1. Check if location permission is granted
2. Verify GPS is enabled on device
3. Check browser console for errors
4. Try refreshing and allowing permissions again

**Patient side:**
1. Check Socket.IO connection (console logs)
2. Verify you're on the correct booking page
3. Check if staff has started navigation
4. Refresh the page

### Inaccurate location:

1. **Enable High Accuracy**: Already enabled in code
2. **Check GPS Signal**: Works better outdoors
3. **Wait for GPS Lock**: Takes 10-30 seconds initially
4. **Use Mobile Device**: Better GPS than laptops

### ETA not showing:

1. Staff must have started navigation
2. Destination must be set
3. Check if distance calculation is working
4. Verify Socket.IO connection

## Technical Details

### Distance Calculation (Haversine Formula):
```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};
```

### ETA Calculation:
```javascript
estimatedTime = Math.ceil(distance * 3); // 3 minutes per km
```
This assumes average speed of 20 km/h (city traffic).

### Update Frequency:
- Location updates: Every time GPS reports new position
- Typical frequency: Every 3-5 seconds
- High accuracy mode: More frequent, more battery usage

## Future Enhancements

Possible improvements:
- [ ] Show route path on map
- [ ] Traffic-aware ETA
- [ ] Multiple staff tracking
- [ ] Location history/breadcrumbs
- [ ] Offline mode with last known location
- [ ] Push notifications when staff is nearby
- [ ] Geofencing alerts

## Production Deployment

When deploying to production:

1. **Socket.IO Server**: Must support location events
2. **HTTPS Required**: Geolocation API requires secure context
3. **Environment Variables**: Set `NEXT_PUBLIC_SOCKET_URL`
4. **Mobile Testing**: Test on actual mobile devices with GPS

## Summary

✅ Real-time GPS tracking implemented
✅ Accurate distance and ETA calculation
✅ Socket.IO for live updates
✅ Privacy-focused (room-based)
✅ Works on mobile and desktop
✅ No manual refresh needed

The location tracking is now live and accurate!
