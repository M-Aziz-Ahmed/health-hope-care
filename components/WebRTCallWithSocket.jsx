'use client';
import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { io } from 'socket.io-client';

export default function WebRTCallWithSocket({ booking, currentUser, onClose, onCallEnd, incomingCallData = null }) {
  const [socket, setSocket] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callType, setCallType] = useState('audio');
  const [incomingCall, setIncomingCall] = useState(incomingCallData);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);

  // Determine the other user's ID and info
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherPerson, setOtherPerson] = useState({ name: 'User' });

  // Fetch other user's ID if needed
  useEffect(() => {
    const fetchOtherUser = async () => {
      // If we have incoming call data, use the caller's ID
      if (incomingCallData) {
        setOtherUserId(incomingCallData.from);
        setOtherPerson({ name: incomingCallData.callerName || 'User' });
        return;
      }

      // Otherwise, determine based on role
      if (currentUser?.role === 'staff') {
        // Staff calling patient
        if (booking?.userId) {
          setOtherUserId(booking.userId);
          setOtherPerson({ name: booking.name || 'Patient' });
        } else if (booking?.email) {
          // Fetch user by email
          try {
            const res = await fetch(`/api/users?email=${booking.email}`);
            if (res.ok) {
              const user = await res.json();
              if (user?._id) {
                setOtherUserId(user._id);
                setOtherPerson({ name: user.name || booking.name || 'Patient' });
              }
            }
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }
      } else {
        // Patient calling staff
        const staffId = typeof booking?.assignedStaff === 'object' 
          ? booking.assignedStaff._id 
          : booking?.assignedStaff;
        
        setOtherUserId(staffId);
        setOtherPerson({
          name: typeof booking?.assignedStaff === 'object' 
            ? booking.assignedStaff.name 
            : 'Staff'
        });
      }
    };

    fetchOtherUser();
  }, [currentUser, booking, incomingCallData]);

  // Debug logging
  useEffect(() => {
    console.log('Call component initialized:', {
      currentUser: currentUser?._id,
      currentUserRole: currentUser?.role,
      otherUserId,
      booking: booking?._id,
      bookingUserId: booking?.userId,
      assignedStaff: booking?.assignedStaff
    });
  }, [currentUser, otherUserId, booking]);

  // Auto-answer if incoming call data is provided
  useEffect(() => {
    if (incomingCallData && socket && !isCallActive) {
      console.log('Auto-answering incoming call');
      setIncomingCall(incomingCallData);
      // Automatically answer after socket is ready
      setTimeout(() => {
        answerCall();
      }, 500);
    }
  }, [incomingCallData, socket]);

  // Initialize Socket.IO
  useEffect(() => {
    const socketInstance = io();
    
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      socketInstance.emit('join', currentUser?._id);
    });

    // Handle incoming call
    socketInstance.on('incoming-call', async ({ from, offer, callType: incomingCallType, callerName }) => {
      console.log('Incoming call from:', callerName);
      setIncomingCall({ from, offer, callType: incomingCallType, callerName });
    });

    // Handle call answered
    socketInstance.on('call-answered', async ({ answer }) => {
      console.log('Call answered');
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('connected');
      }
    });

    // Handle call rejected
    socketInstance.on('call-rejected', () => {
      console.log('Call rejected');
      setCallStatus('rejected');
      setTimeout(() => {
        endCall(false);
        onClose();
      }, 2000);
    });

    // Handle call ended
    socketInstance.on('call-ended', () => {
      console.log('Call ended by other user');
      endCall(false);
      onClose();
    });

    // Handle ICE candidates
    socketInstance.on('ice-candidate', async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser?._id]);

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log('Received remote stream');
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          to: otherUserId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallStatus('failed');
      }
    };

    return pc;
  };

  const startCall = async (type = 'audio') => {
    try {
      setCallType(type);
      setCallStatus('connecting');
      setIsCallActive(true);

      const constraints = {
        audio: true,
        video: type === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setCallStatus('ringing');
      
      console.log('Sending call to:', {
        to: otherUserId,
        from: currentUser._id,
        callType: type,
        callerName: currentUser.name
      });
      
      // Send call offer via Socket.IO
      if (!socket) {
        console.error('Socket not connected!');
        alert('Connection error. Please refresh the page.');
        endCall(false);
        return;
      }

      if (!otherUserId) {
        console.error('Other user ID not found!');
        alert('Cannot find the other user. Please try again.');
        endCall(false);
        return;
      }

      socket.emit('call-user', {
        to: otherUserId,
        from: currentUser._id,
        offer,
        callType: type,
        callerName: currentUser.name,
        booking: booking._id
      });

    } catch (error) {
      console.error('Error starting call:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Please allow camera and microphone access to make calls.');
      } else {
        alert('Failed to start call. Please try again.');
      }
      setCallStatus('failed');
      endCall(false);
    }
  };

  const answerCall = async () => {
    try {
      setCallStatus('connecting');
      setIsCallActive(true);
      setCallType(incomingCall.callType);

      const constraints = {
        audio: true,
        video: incomingCall.callType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      if (localVideoRef.current && incomingCall.callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer-call', {
        to: incomingCall.from,
        answer
      });

      setIncomingCall(null);
      setCallStatus('connected');

    } catch (error) {
      console.error('Error answering call:', error);
      alert('Failed to answer call. Please try again.');
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit('reject-call', { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  const endCall = (shouldClose = false) => {
    if (socket && otherUserId) {
      socket.emit('end-call', { to: otherUserId });
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsCallActive(false);
    setCallStatus('idle');
    
    if (shouldClose && onCallEnd) {
      onCallEnd();
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Incoming call notification
  if (incomingCall && !isCallActive) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-pulse">
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Phone size={48} className="text-green-600 animate-bounce" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call</h3>
          <p className="text-gray-600 mb-8">{incomingCall.callerName}</p>
          
          <div className="flex gap-3">
            <button
              onClick={rejectCall}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <PhoneOff size={20} />
              Reject
            </button>
            <button
              onClick={answerCall}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Answer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Call selection screen
  if (!isCallActive) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Phone size={48} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Call {otherPerson.name}</h3>
          <p className="text-gray-600 mb-8">{booking?.service}</p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => startCall('audio')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Voice Call
            </button>
            <button
              onClick={() => startCall('video')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Video size={20} />
              Video Call
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Active call screen
  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
      <div className="w-full h-full relative">
        {callType === 'video' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Phone size={64} />
              </div>
              <h3 className="text-3xl font-bold mb-2">{otherPerson.name}</h3>
              <p className="text-lg text-gray-300">
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'ringing' && 'Ringing...'}
                {callStatus === 'connected' && 'Connected'}
                {callStatus === 'rejected' && 'Call Rejected'}
                {callStatus === 'failed' && 'Call Failed'}
              </p>
            </div>
          </div>
        )}

        {callType === 'video' && localStream && !isVideoOff && (
          <div className="absolute bottom-24 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />

        {callType === 'video' && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center text-white bg-black/50 px-4 py-2 rounded-lg">
            <h3 className="text-xl font-bold">{otherPerson.name}</h3>
            <p className="text-sm text-gray-300">
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'ringing' && 'Ringing...'}
              {callStatus === 'connected' && 'Connected'}
            </p>
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isMuted ? 'bg-red-600' : 'bg-gray-700'
            } text-white hover:bg-opacity-80`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                isVideoOff ? 'bg-red-600' : 'bg-gray-700'
              } text-white hover:bg-opacity-80`}
              title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          )}
          
          <button
            onClick={() => {
              endCall(false);
              onClose();
            }}
            className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {(callStatus === 'failed' || callStatus === 'rejected') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-8">
              <PhoneOff size={64} className="mx-auto mb-4 text-red-500" />
              <p className="text-xl font-bold mb-2">
                {callStatus === 'rejected' ? 'Call Rejected' : 'Call Failed'}
              </p>
              <p className="text-gray-300 mb-4">
                {callStatus === 'rejected' ? 'The other user rejected the call' : 'Unable to establish connection'}
              </p>
              <button
                onClick={() => {
                  endCall(false);
                  onClose();
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
