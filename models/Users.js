// models/User.js
import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: false },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true }, // Optional phone number for staff/users
  // Add 'owner' and 'staff' roles so the application can have an owner and staff users
  role: { type: String, required: true, enum: ['owner', 'admin', 'staff', 'user'], default: 'user' },
  },
  { timestamps: true }
);

// Avoid recompiling model on hot reload
export default mongoose.models.User || mongoose.model("User", User);