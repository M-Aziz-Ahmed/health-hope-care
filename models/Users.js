// models/User.js
import mongoose from "mongoose";

const User = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: false },
    email: { type: String, required: true, unique: true, lowercase: true },
  // Add 'owner' role so the application can have a single owner with elevated rights
  role: { type: String, required: true, enum: ['owner', 'admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

// Avoid recompiling model on hot reload
export default mongoose.models.User || mongoose.model("User", User);