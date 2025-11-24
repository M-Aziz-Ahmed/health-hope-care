'use client';
import { useState } from 'react';
import { Search, MapPin, Calendar, User, Phone, Mail } from 'lucide-react';

export default function TrackBookingPage() {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!bookingId.trim()) return;

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const res = await fetch('/api/fetchBooking');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      const found = data.find(b => b._id === bookingId.trim() || b.id === bookingId.trim());
      
      if (found) {
        setBooking(found);
      } else {
        setError('Booking not found. Please check your booking ID.');
      }
    } catch (err) {
      setError('Failed to fetch booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-100 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">Track Your Booking</h1>
          <p className="text-gray-600 text-lg">Enter your booking ID to check the status</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter your booking ID"
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {booking && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className={`p-6 text-white text-center ${
              booking.status === 'Confirmed' ? 'bg-green-600' :
              booking.status === 'Cancelled' ? 'bg-red-600' :
              'bg-yellow-600'
            }`}>
              <div className="text-sm opacity-90 mb-1">Booking Status</div>
              <div className="text-3xl font-bold">{booking.status}</div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">Booking Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="text-emerald-600 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-500">Patient Name</div>
                    <div className="font-medium text-gray-800">{booking.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="text-emerald-600 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-500">Phone Number</div>
                    <div className="font-medium text-gray-800">{booking.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-emerald-600 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-800">{booking.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-emerald-600 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-500">Appointment Date</div>
                    <div className="font-medium text-gray-800">
                      {new Date(booking.date).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="text-emerald-600 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="font-medium text-gray-800">{booking.address}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="text-sm text-gray-500 mb-2">Service</div>
                <div className="text-xl font-semibold text-emerald-700">{booking.service}</div>
              </div>

              {booking.assignedStaff && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Assigned Staff</div>
                  <div className="font-medium text-emerald-800">
                    {booking.assignedStaff.name || booking.assignedStaff.email}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Booking Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full mt-1"></div>
                    <div>
                      <div className="font-medium">Booking Created</div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {booking.status === 'Confirmed' && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
                      <div>
                        <div className="font-medium">Booking Confirmed</div>
                        <div className="text-sm text-gray-500">Your appointment is confirmed</div>
                      </div>
                    </div>
                  )}
                  {booking.status === 'Cancelled' && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-red-600 rounded-full mt-1"></div>
                      <div>
                        <div className="font-medium">Booking Cancelled</div>
                        <div className="text-sm text-gray-500">This booking has been cancelled</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help with your booking?</p>
          <a
            href="/contact"
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
