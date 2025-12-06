'use client';
import { X } from 'lucide-react';

export default function VideoCall({ booking, currentUser, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
            <X size={28} className="text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">Calls Disabled</h3>
        <p className="text-sm text-gray-600 mb-4">Real-time voice/video calls are disabled in this deployment. Use chat or contact support to arrange calls.</p>
        <div className="flex justify-center">
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}

