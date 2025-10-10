import mongoose from 'mongoose';

const Booking = new mongoose.Schema({
    name: { type: String, required: true, },
    email: { type: String, required: true, },
    phone: { type: String, required: true, },
    address: { type: String, required: true, },
    service: { type: String, required: true, },
    date: { type: Date, default: Date.now }
});

// Avoid recompiling model on hot reload
export default mongoose.models.Booking || mongoose.model("Booking", Booking);
