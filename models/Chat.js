import mongoose from 'mongoose';

const ChatMessage = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true }, // 'user', 'staff', 'admin'
  message: { type: String, default: '' }, // Optional text message
  messageType: { 
    type: String, 
    enum: ['text', 'voice', 'image', 'file'], 
    default: 'text' 
  },
  mediaUrl: { type: String, default: null }, // URL to uploaded media file
  mediaFileName: { type: String, default: null }, // Original filename
  mediaSize: { type: Number, default: null }, // File size in bytes
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null }
}, { timestamps: true });

// Index for faster queries
ChatMessage.index({ bookingId: 1, createdAt: -1 });

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessage);

