import mongoose from 'mongoose';

const Service = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'Stethoscope' },
  price: { type: Number, default: 0 },
  duration: { type: String, default: '30 mins' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Service || mongoose.model('Service', Service);
