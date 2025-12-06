/*
  Calls have been disabled for Vercel-friendly deployment.
  This file previously implemented WebRTC + Socket.IO logic.
  Keeping a lightweight stub here prevents runtime import errors
  while preventing long-lived socket connections from being created.
*/

'use client';
import React from 'react';

export default function WebRTCallWithSocket() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white/90 text-center p-4 rounded-lg shadow-md pointer-events-auto">
        <h3 className="font-bold">Calls Disabled</h3>
        <p className="text-sm text-gray-600">Real-time voice & video calls have been disabled in this deployment. Use chat or contact support.</p>
      </div>
    </div>
  );
}

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
