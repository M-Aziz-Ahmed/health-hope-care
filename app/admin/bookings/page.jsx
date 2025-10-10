'use client';

import { useEffect, useState } from 'react';

export default function BookingTablePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Optional: Dummy fallback data (for local dev)
  const dummyBookings = [
    {
      id: 'B001',
      name: 'Ali Raza',
      service: 'Injection at Home',
      date: '2025-06-25',
      status: 'Pending',
    },
    {
      id: 'B002',
      name: 'Sara Khan',
      service: 'ECG at Home',
      date: '2025-06-24',
      status: 'Confirmed',
    },
  ];

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/fetchBooking');
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const data = await res.json();
        setBookings(data); // Update state with fetched bookings
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings(dummyBookings); // Use dummy data if fetch fails
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-sky-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-sky-800 mb-6 text-center">Manage Bookings</h2>

        <div className="overflow-auto shadow-xl rounded-lg">
          <table className="min-w-full bg-white border rounded-md">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Booking ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Service</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Address</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{booking.id}</td>
                    <td className="px-6 py-4 text-sm">{booking.name}</td>
                    <td className="px-6 py-4 text-sm">{booking.service}</td>
                    <td className="px-6 py-4 text-sm">{booking.address}</td>
                    <td className="px-6 py-4 text-sm">{booking.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                          booking.status === 'Confirmed'
                            ? 'bg-emerald-600'
                            : 'bg-yellow-500'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                        onClick={() =>
                          alert('Change status feature needs backend')
                        }
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
