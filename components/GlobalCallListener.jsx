'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Phone, PhoneOff } from 'lucide-react';
import WebRTCallWithSocket from './WebRTCallWithSocket';

export default function GlobalCallListener({ currentUser }) {
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallWindow, setShowCallWindow] = useState(false);

  useEffect(() => {
    if (!currentUser?._id) return;

    const socketInstance = io();
    
    socketInstance.on('connect', () => {
      console.log('Global call listener connected:', socketInstance.id);
      socketInstance.emit('join', currentUser._id);
    });

    socketInstance.on('incoming-call', ({ from, offer, callType, callerName, booking }) => {
      console.log('Global incoming call from:', callerName);
      setIncomingCall({ from, offer, callType, callerName, booking });
    });

    socketInstance.on('call-ended', () => {
      setIncomingCall(null);
      setShowCallWindow(false);
    });

    socketInstance.on('call-rejected', () => {
      setIncomingCall(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser?._id]);

  const answerCall = async () => {
    // Fetch booking details
    try {
      const res = await fetch(`/api/fetchBooking`);
      const bookings = await res.json();
      const booking = bookings.find(b => b._id === incomingCall.booking);
      
      if (booking) {
        setShowCallWindow(true);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Failed to load call details');
    }
  };

  const rejectCall = () => {
    if (socket && incomingCall) {
      socket.emit('reject-call', { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  if (showCallWindow && incomingCall) {
    return (
      <div className="fixed inset-0 z-[10000]">
        {/* This would need the full booking object - simplified for now */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Call in Progress</h3>
            <p className="text-gray-600 mb-4">Please use the booking page to manage calls</p>
            <button
              onClick={() => {
                setShowCallWindow(false);
                setIncomingCall(null);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (incomingCall) {
    return (
      <div className="fixed bottom-4 right-4 z-[10000] animate-bounce">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-500 min-w-[300px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Phone size={24} className="text-green-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call</h4>
              <p className="text-sm text-gray-600">{incomingCall.callerName}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={rejectCall}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <PhoneOff size={18} />
              Reject
            </button>
            <button
              onClick={answerCall}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Answer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
