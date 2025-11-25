'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, User, MapPin, Phone, X, Search, Filter, Download } from 'lucide-react';

export default function BookingTablePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null); // View Details
  const [assigningBooking, setAssigningBooking] = useState(null); // Assign Staff
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch('/api/fetchBooking');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/updateBookingStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update');
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

  const openAssignModal = async (booking) => {
    setAssigningBooking(booking);
    setLoadingStaff(true);
    try {
      const res = await fetch('/api/fetchStaff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load staff list');
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAssignStaff = async (staffId) => {
    if (!assigningBooking) return;
    try {
      const res = await fetch('/api/assignStaff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: assigningBooking._id || assigningBooking.id, staffId })
      });
      if (!res.ok) throw new Error('Assign failed');

      const selectedStaff = staffList.find(s => s._id === staffId);
      setBookings(prev => prev.map(b => (b._id === assigningBooking._id || b.id === assigningBooking.id) ? { ...b, assignedStaff: selectedStaff, status: 'Confirmed' } : b));

      setAssigningBooking(null);
      alert(`Staff assigned successfully!`);
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
    const headers = ['ID', 'Name', 'Phone', 'Service', 'Address', 'Date', 'Status', 'Assigned Staff'];
    const rows = filteredBookings.map(b => [
      b._id || b.id,
      b.name,
      b.phone,
      b.service,
      b.address,
      new Date(b.date).toLocaleDateString(),
      b.status,
      b.assignedStaff?.name || 'Unassigned'
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Manage Bookings</h2>
            <p className="text-slate-500 mt-1">View and manage all patient appointments</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, service, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Staff</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-500">Loading bookings...</td>
                  </tr>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking, idx) => (
                    <tr key={booking._id || booking.id || idx} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {booking.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{booking.name}</div>
                            <div className="text-sm text-slate-500">{booking.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{booking.service}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{booking.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{booking.time || 'Time not set'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {booking.assignedStaff ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs text-purple-600 font-bold">
                              {booking.assignedStaff.name?.charAt(0) || 'S'}
                            </div>
                            <span>{booking.assignedStaff.name || booking.assignedStaff.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => setSelectedBooking(booking)} className="text-blue-600 hover:text-blue-900">View</button>
                        <button onClick={() => openAssignModal(booking)} className="text-purple-600 hover:text-purple-900">Assign</button>
                        <button onClick={() => deleteBooking(booking._id || booking.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-500">No bookings found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredBookings.map((booking, idx) => (
            <div key={booking._id || booking.id || idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {booking.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{booking.name}</h3>
                    <p className="text-xs text-slate-500">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}>
                  {booking.status || 'Pending'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{booking.service}</span>
                </div>
                <div className="flex justify-between">
                  <span>Staff:</span>
                  <span className="font-medium text-purple-600">{booking.assignedStaff?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setSelectedBooking(booking)} className="py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">View</button>
                <button onClick={() => openAssignModal(booking)} className="py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">Assign</button>
                <button onClick={() => deleteBooking(booking._id || booking.id)} className="py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-800">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Patient Name</label>
                    <p className="text-lg font-medium text-slate-800">{selectedBooking.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Status</label>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedBooking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          selectedBooking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Service</label>
                    <p className="text-base text-slate-800">{selectedBooking.service}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Date & Time</label>
                    <p className="text-base text-slate-800">{new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Address</label>
                    <p className="text-base text-slate-800">{selectedBooking.address}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Contact Info</label>
                    <div className="flex gap-4 text-slate-600">
                      <span className="flex items-center gap-2"><Phone size={16} /> {selectedBooking.phone}</span>
                      <span className="flex items-center gap-2">✉️ {selectedBooking.email}</span>
                    </div>
                  </div>
                </div>

                {selectedBooking.assignedStaff && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2">Assigned Staff</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold">
                        {selectedBooking.assignedStaff.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-purple-900">{selectedBooking.assignedStaff.name}</p>
                        <p className="text-sm text-purple-700">{selectedBooking.assignedStaff.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
                <button onClick={() => updateStatus(selectedBooking._id || selectedBooking.id, 'Cancelled')} className="px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-medium transition">
                  Cancel Booking
                </button>
                <button onClick={() => { setSelectedBooking(null); openAssignModal(selectedBooking); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition shadow-sm">
                  Assign Staff
                </button>
                <button onClick={() => updateStatus(selectedBooking._id || selectedBooking.id, 'Confirmed')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition shadow-sm">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Staff Modal */}
        {assigningBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Assign Staff</h3>
                <button onClick={() => setAssigningBooking(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-500 mb-4">
                  Select a staff member to assign to <strong>{assigningBooking.name}</strong> for <strong>{assigningBooking.service}</strong>.
                </p>

                {loadingStaff ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <User className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p>No staff members found.</p>
                    <p className="text-xs mt-1">Make sure users have the 'staff' role.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {staffList.map(staff => (
                      <button
                        key={staff._id}
                        onClick={() => handleAssignStaff(staff._id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 border border-transparent hover:border-purple-100 transition group text-left"
                      >
                        <div className="w-10 h-10 bg-slate-100 group-hover:bg-purple-200 rounded-full flex items-center justify-center text-slate-600 group-hover:text-purple-700 font-bold transition">
                          {staff.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 group-hover:text-purple-900">{staff.name}</p>
                          <p className="text-xs text-slate-500 group-hover:text-purple-700">{staff.email}</p>
                        </div>
                        {staff.location && (
                          <div className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                            <MapPin size={12} />
                            {staff.location}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
