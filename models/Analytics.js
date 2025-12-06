import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  type: { type: String, enum: ['pageview','click','session'], required: true },
  url: { type: String },
  path: { type: String },
  title: { type: String },
  event: { type: String },
  duration: { type: Number, default: 0 }, // seconds
  userAgent: { type: String },
  platform: { type: String },
  ip: { type: String },
  country: { type: String },
}, { timestamps: true });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
