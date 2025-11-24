'use client';

import { useEffect, useState } from 'react';

export default function BookingTablePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

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

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/updateBookingStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setBookings((prev) => prev.map(b => (b._id === id || b.id === id) ? { ...b, status } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const res = await fetch('/api/deleteBooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setBookings((prev) => prev.filter(b => b._id !== id && b.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete booking.');
    }
  };

  const assignStaffToBooking = async (bookingId) => {
    try {
      const res = await fetch('/api/fetchStaff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const staffList = await res.json();
      if (staffList.length === 0) return alert('No staff available');

      const choice = prompt('Enter staff email to assign (available: ' + staffList.map(s => s.email).join(', ') + ')');
      if (!choice) return;
      const selected = staffList.find(s => s.email === choice.trim());
      if (!selected) return alert('Staff not found');

      const r2 = await fetch('/api/assignStaff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, staffId: selected._id })
      });
      if (!r2.ok) throw new Error('Assign failed');
      setBookings(prev => prev.map(b => (b._id === bookingId ? { ...b, assignedStaff: selected, status: 'Confirmed' } : b)));
      alert('Staff assigned');
    } catch (err) {
      console.error(err);
      alert('Failed to assign staff');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Service', 'Address', 'Date', 'Status'];
    const rows = filteredBookings.map(b => [
      b._id || b.id,
      b.name,
      b.phone,
      b.service,
      b.address,
      new Date(b.date).toLocaleDateString(),
      b.status
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-sky-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-sky-800">Manage Bookings</h2>
          <button
            onClick={exportToCSV}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, service, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-auto shadow-xl rounded-lg">
          <table className="min-w-full bg-white border rounded-md">
            <thead className="bg-emerald-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Booking ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
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
                  <td colSpan="8" className="text-center py-8 text-gray-500">Loading bookings...</td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking, idx) => (
                  <tr key={booking._id || booking.id || idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{booking._id || booking.id}</td>
                    <td className="px-6 py-4 text-sm">{booking.name}</td>
                    <td className="px-6 py-4 text-sm">{booking.phone}</td>
                    <td className="px-6 py-4 text-sm">{booking.service}</td>
                    <td className="px-6 py-4 text-sm">{booking.address}</td>
                    <td className="px-6 py-4 text-sm">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-emerald-600' : booking.status === 'Cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                        {booking.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700" onClick={() => setSelectedBooking(booking)}>View</button>
                      <button className="bg-emerald-600 text-white px-3 py-1 rounded-md text-sm hover:bg-emerald-700" onClick={() => updateStatus(booking._id || booking.id, 'Confirmed')}>Confirm</button>
                      <button className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600" onClick={() => updateStatus(booking._id || booking.id, 'Cancelled')}>Cancel</button>
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700" onClick={() => assignStaffToBooking(booking._id || booking.id)}>Assign Staff</button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700" onClick={() => deleteBooking(booking._id || booking.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading bookings...</div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking, idx) => (
              <div key={booking._id || booking.id || idx} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">ID: {booking._id || booking.id}</div>
                    <h3 className="text-lg font-semibold">{booking.name}</h3>
                    <div className="text-sm text-gray-600">{booking.service}</div>
                    <div className="text-sm text-gray-600">{booking.phone}</div>
                    <div className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-emerald-600' : booking.status === 'Cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-md text-sm" onClick={() => updateStatus(booking._id || booking.id, 'Confirmed')}>Confirm</button>
                  <button className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-md text-sm" onClick={() => updateStatus(booking._id || booking.id, 'Cancelled')}>Cancel</button>
                  <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm" onClick={() => assignStaffToBooking(booking._id || booking.id)}>Assign Staff</button>
                  <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm" onClick={() => deleteBooking(booking._id || booking.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No bookings found.</div>
          )}
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-emerald-700">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="font-medium">{selectedBooking._id || selectedBooking.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${selectedBooking.status === 'Confirmed' ? 'bg-emerald-600' : selectedBooking.status === 'Cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-medium">{selectedBooking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedBooking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{selectedBooking.service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedBooking.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(selectedBooking.date).toLocaleString()}</p>
                </div>
                {selectedBooking.assignedStaff && (
                  <div>
                    <p className="text-sm text-gray-500">Assigned Staff</p>
                    <p className="font-medium">{selectedBooking.assignedStaff.name || selectedBooking.assignedStaff.email}</p>
                  </div>
                )}
                {selectedBooking.location && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{selectedBooking.location}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => { updateStatus(selectedBooking._id || selectedBooking.id, 'Confirmed'); setSelectedBooking(null); }} className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">Confirm</button>
                <button onClick={() => { updateStatus(selectedBooking._id || selectedBooking.id, 'Cancelled'); setSelectedBooking(null); }} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Cancel</button>
                <button onClick={() => { assignStaffToBooking(selectedBooking._id || selectedBooking.id); }} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Assign Staff</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
