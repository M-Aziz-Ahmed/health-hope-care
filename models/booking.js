import mongoose from 'mongoose';

const Booking = new mongoose.Schema({
    name: { type: String, required: true, },
    email: { type: String, required: true, },
    phone: { type: String, required: true, },
    address: { type: String, required: true, },
    service: { type: String, required: true, },
    date: { type: Date, default: Date.now },
    time: { type: String, default: '' }, // Preferred time (e.g., "14:30")
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Link to user who created the booking
    // simple location field (e.g., city or coordinates string). Real geo-querying would use coordinates and indexes.
    location: { type: String, default: '' }
});

// Avoid recompiling model on hot reload
export default mongoose.models.Booking || mongoose.model("Booking", Booking);
