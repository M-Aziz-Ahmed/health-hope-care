'use client';
import WebRTCallWithSocket from './WebRTCallWithSocket';

export default function VideoCall({ booking, currentUser, onClose, onCallEnd, incomingCallData = null }) {
  return (
    <WebRTCallWithSocket
      booking={booking}
      currentUser={currentUser}
      onClose={onClose}
      onCallEnd={onCallEnd}
      incomingCallData={incomingCallData}
    />
  );
}

