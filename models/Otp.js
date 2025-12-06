import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // email or phone
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false }
  ,
  meta: { type: Object }
}, { timestamps: true });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
