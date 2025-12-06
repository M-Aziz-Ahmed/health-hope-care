'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function ChatWindow({ bookingId, booking, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

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
    if ((!newMessage.trim()) || sending) return;

    setSending(true);
    let mediaUrl = null;
    let mediaFileName = null;
    let mediaSize = null;
    let messageType = 'text';

    try {
      // Only send text messages here. Location messages are handled by sendLocation().
      const messageText = newMessage.trim();
      setNewMessage('');

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            bookingId,
            message: messageText,
            senderName: currentUser?.name || 'User',
            senderRole: currentUser?.role || 'user',
            messageType: 'text'
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

  // send current location as a chat message (only text + maps link)
  const sendLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setUploading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      try {
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            message: `Location: ${mapsUrl}`,
            senderName: currentUser?.name || 'User',
            senderRole: currentUser?.role || 'user',
            messageType: 'location'
          }),
        });

        if (res.ok) {
          const newMsg = await res.json();
          setMessages(prev => [...prev, newMsg]);
        } else {
          alert('Failed to send location.');
        }
      } catch (err) {
        console.error('Failed to send location', err);
        alert('Failed to send location.');
      } finally {
        setUploading(false);
      }
    }, (err) => {
      console.error('Geolocation error', err);
      alert('Unable to get your location.');
      setUploading(false);
    });
  };

  const handleCall = () => {
    // Call functionality is kept but UI will show it only for admin/staff.
    alert('Call feature is restricted. Use chat or contact support.');
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
            {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
              <button
                onClick={handleCall}
                className="p-2 hover:bg-white/20 rounded-full transition"
                title="Call"
              >
                <Phone size={20} />
              </button>
            )}
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
                    
                    {/* Media messages removed — chat supports text and location only */}
                    
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

        {/* (Removed voice/file sharing UI) */}

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />

            <button
              type="button"
              onClick={sendLocation}
              disabled={uploading}
              title="Send current location"
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              <MapPin size={20} />
            </button>

            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Text chat only • Use the location pin to share your current location</p>
        </form>
      </div>
    </div>
  );
}

