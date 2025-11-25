'use client';
import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X } from 'lucide-react';

// Simple WebRTC implementation for peer-to-peer calling
export default function WebRTCall({ booking, currentUser, onClose, onCallEnd }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, ringing, connected
  const [callType, setCallType] = useState('audio'); // 'audio' or 'video'
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);

    // Handle incoming stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this to the other peer via signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    return pc;
  };

  const startCall = async (type = 'audio') => {
    try {
      setCallType(type);
      setCallStatus('connecting');
      setIsCallActive(true);

      // Get user media
      const constraints = {
        audio: true,
        video: type === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Display local stream
      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create data channel for signaling (simplified)
      const dataChannel = pc.createDataChannel('signaling');
      dataChannelRef.current = dataChannel;

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // In a real implementation, you'd send the offer to a signaling server
      // For now, we'll simulate a connection
      setCallStatus('ringing');
      
      // Simulate answer after 2 seconds
      setTimeout(async () => {
        try {
          // In production, this would come from the other peer via signaling
          // For demo, we'll create a mock answer
          const answer = {
            type: 'answer',
            sdp: pc.localDescription.sdp // Simplified - in real app, this comes from other peer
          };
          
          // For demo purposes, we'll just set the connection as connected
          // In a real app, you'd do: await pc.setRemoteDescription(new RTCSessionDescription(answer));
          setCallStatus('connected');
        } catch (error) {
          console.error('Error setting remote description:', error);
          setCallStatus('failed');
        }
      }, 2000);

    } catch (error) {
      console.error('Error starting call:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Please allow camera and microphone access to make calls.');
      } else {
        alert('Failed to start call. Please try again.');
      }
      setCallStatus('failed');
      endCall();
    }
  };

  const endCall = (shouldClose = false) => {
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
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    setIsCallActive(false);
    setCallStatus('idle');
    
    // Only call onCallEnd if explicitly requested (user clicked end call button)
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

  const otherPerson = currentUser?.role === 'staff' 
    ? { name: booking?.name || 'Patient' }
    : { name: (typeof booking?.assignedStaff === 'object' ? booking.assignedStaff.name : null) || 'Staff' };

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

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
      <div className="w-full h-full relative">
        {/* Remote video/audio */}
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
                {callStatus === 'failed' && 'Call Failed'}
              </p>
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
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

        {/* Hidden audio elements */}
        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />

        {/* Call info overlay */}
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

        {/* Controls */}
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

        {/* Status message */}
        {callStatus === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center text-white p-8">
              <PhoneOff size={64} className="mx-auto mb-4 text-red-500" />
              <p className="text-xl font-bold mb-2">Call Failed</p>
              <p className="text-gray-300 mb-4">Unable to establish connection</p>
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

