'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, PhoneOff, Mic, Image as ImageIcon, Paperclip, Play, Pause } from 'lucide-react';
import Image from 'next/image';

export default function ChatWindow({ bookingId, booking, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRefs = useRef({});

  useEffect(() => {
    if (bookingId) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?bookingId=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        // Mark messages as read
        if (data.length > 0) {
          await fetch('/api/chat/markRead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !audioBlob) || sending) return;

    setSending(true);
    let mediaUrl = null;
    let mediaFileName = null;
    let mediaSize = null;
    let messageType = 'text';

    try {
      // If there's a voice message, upload it first
      if (audioBlob) {
        messageType = 'voice';
        const formData = new FormData();
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        formData.append('file', audioFile);
        formData.append('messageType', 'voice');

        const uploadRes = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          mediaUrl = uploadData.url;
          mediaFileName = uploadData.fileName;
          mediaSize = uploadData.size;
        } else {
          throw new Error('Failed to upload voice message');
        }
      }

      const messageText = newMessage.trim();
      setNewMessage('');
      setAudioBlob(null);

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          message: messageText,
          senderName: currentUser?.name || 'User',
          senderRole: currentUser?.role || 'user',
          messageType,
          mediaUrl,
          mediaFileName,
          mediaSize,
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      } else {
        alert('Failed to send message. Please try again.');
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream?.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
    setMediaRecorder(null);
    setAudioBlob(null);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Determine message type
      let messageType = 'file';
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      }

      formData.append('messageType', messageType);

      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const uploadData = await res.json();
        
        // Send message with media
        const messageRes = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            message: '',
            senderName: currentUser?.name || 'User',
            senderRole: currentUser?.role || 'user',
            messageType,
            mediaUrl: uploadData.url,
            mediaFileName: uploadData.fileName,
            mediaSize: uploadData.size,
          }),
        });

        if (messageRes.ok) {
          const newMsg = await messageRes.json();
          setMessages(prev => [...prev, newMsg]);
        }
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const playAudio = (audioUrl, messageId) => {
    // Stop currently playing audio
    if (playingAudio) {
      const currentAudio = audioRefs.current[playingAudio];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    // Play new audio
    if (playingAudio === messageId) {
      setPlayingAudio(null);
    } else {
      const audio = audioRefs.current[messageId];
      if (audio) {
        audio.play();
        setPlayingAudio(messageId);
        audio.onended = () => setPlayingAudio(null);
      }
    }
  };

  const handleCall = () => {
    // Determine phone number based on who is calling
    let phoneNumber = '';
    
    if (currentUser?.role === 'staff') {
      // Staff is calling the patient
      phoneNumber = booking?.phone || '';
    } else {
      // Patient is calling the staff
      phoneNumber = (typeof booking?.assignedStaff === 'object' && booking.assignedStaff?.phone) || 
                   booking?.assignedStaff?.phone ||
                   '';
    }

    if (phoneNumber && phoneNumber.trim()) {
      // Clean and format phone number
      let cleanedNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
      let formattedNumber = cleanedNumber;
      
      if (!cleanedNumber.startsWith('+')) {
        if (cleanedNumber.startsWith('92')) {
          formattedNumber = `+${cleanedNumber}`;
        } else if (cleanedNumber.startsWith('0')) {
          formattedNumber = `+92${cleanedNumber.substring(1)}`;
        } else {
          formattedNumber = `+92${cleanedNumber}`;
        }
      }
      
      // Check if we're on a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        window.location.href = `tel:${formattedNumber}`;
      } else {
        // On desktop, copy to clipboard
        navigator.clipboard.writeText(formattedNumber).then(() => {
          alert(`Phone number copied: ${formattedNumber}\n\nPaste it into your calling app.`);
        }).catch(() => {
          alert(`Phone number: ${formattedNumber}\n\nPlease copy this number manually.`);
        });
      }
    } else {
      alert('Phone number not available. Please use the chat feature to communicate.');
    }
  };

  const otherPerson = currentUser?.role === 'staff' 
    ? { name: booking?.name, role: 'patient' }
    : { name: booking?.assignedStaff?.name || 'Staff', role: 'staff' };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold">Chat with {otherPerson.name}</h3>
              <p className="text-xs text-blue-100">{booking?.service}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCall}
              className="p-2 hover:bg-white/20 rounded-full transition"
              title="Call"
            >
              <Phone size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3"
        >
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUser?._id || 
                           (msg.senderRole === currentUser?.role && msg.senderName === currentUser?.name);
              
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {!isOwn && (
                      <div className="text-xs font-semibold mb-1 opacity-80">
                        {msg.senderName}
                      </div>
                    )}
                    
                    {/* Text message */}
                    {msg.message && (
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    )}
                    
                    {/* Voice message */}
                    {msg.messageType === 'voice' && msg.mediaUrl && (
                      <div className="flex items-center gap-2 mt-2">
                        <audio
                          ref={el => audioRefs.current[msg._id] = el}
                          src={msg.mediaUrl}
                          preload="metadata"
                        />
                        <button
                          onClick={() => playAudio(msg.mediaUrl, msg._id)}
                          className={`p-2 rounded-full transition ${
                            isOwn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {playingAudio === msg._id ? (
                            <Pause size={16} className={isOwn ? 'text-white' : 'text-gray-700'} />
                          ) : (
                            <Play size={16} className={isOwn ? 'text-white' : 'text-gray-700'} />
                          )}
                        </button>
                        <span className="text-xs opacity-80">Voice message</span>
                      </div>
                    )}
                    
                    {/* Image message */}
                    {msg.messageType === 'image' && msg.mediaUrl && (
                      <div className="mt-2">
                        <Image
                          src={msg.mediaUrl}
                          alt={msg.mediaFileName || 'Shared image'}
                          width={200}
                          height={200}
                          className="rounded-lg max-w-full h-auto cursor-pointer"
                          onClick={() => window.open(msg.mediaUrl, '_blank')}
                        />
                      </div>
                    )}
                    
                    {/* File message */}
                    {msg.messageType === 'file' && msg.mediaUrl && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-black/10 rounded">
                        <Paperclip size={16} />
                        <a
                          href={msg.mediaUrl}
                          download={msg.mediaFileName}
                          className="text-sm underline hover:no-underline"
                        >
                          {msg.mediaFileName || 'Download file'}
                        </a>
                        {msg.mediaSize && (
                          <span className="text-xs opacity-60">
                            ({(msg.mediaSize / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice message preview */}
        {audioBlob && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-blue-600" />
              <span className="text-sm text-blue-700">Voice message recorded</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelRecording}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || sending}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Attach file"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <Paperclip size={20} />
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || sending}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Send image"
            >
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending || recording}
            />
            {!recording ? (
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                title="Hold to record voice"
              >
                <Mic size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="p-2 text-red-600 bg-red-50 rounded-lg animate-pulse"
                title="Recording... Click to stop"
              >
                <Mic size={20} />
              </button>
            )}
            <button
              type="submit"
              disabled={sending || (!newMessage.trim() && !audioBlob)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Hold mic button to record voice • Click 📎 to share files
          </p>
        </form>
      </div>
    </div>
  );
}

