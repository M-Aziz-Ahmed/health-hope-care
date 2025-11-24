'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Phone, Mail, FileText } from 'lucide-react';

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/current-user', {
          method: 'GET',
          credentials: 'include',
        });
        const user = await res.json();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserInfo(user);
        fetchUserBookings(user.email);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserBookings(email) {
      try {
        const res = await fetch('/api/fetchBooking');
        const data = await res.json();
        const userBookings = data.filter(b => b.email === email);
        setBookings(userBookings);
      } catch (err) {
        console.error('Failed to fetch bookings');
      }
    }

    checkUser();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome, {userInfo?.name} 👋</h1>
          <p className="text-slate-600 text-lg">Your Personal Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Calendar className="text-emerald-600" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Bookings</div>
                <div className="text-3xl font-bold text-slate-800">{bookings.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="text-yellow-600" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Pending</div>
                <div className="text-3xl font-bold text-slate-800">
                  {bookings.filter(b => b.status === 'Pending').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <FileText className="text-green-600" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Completed</div>
                <div className="text-3xl font-bold text-slate-800">
                  {bookings.filter(b => b.status === 'Confirmed').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">My Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="mx-auto mb-4 text-slate-300" size={64} />
              <p>No bookings yet</p>
              <a href="/booking" className="mt-4 inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700">
                Book a Service
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{booking.service}</h3>
                      <p className="text-sm text-slate-600">Booking ID: {booking._id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={16} />
                      <span>{new Date(booking.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={16} />
                      <span>{booking.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600 md:col-span-2">
                      <MapPin size={16} className="mt-1" />
                      <span>{booking.address}</span>
                    </div>
                  </div>

                  <a 
                    href={`/user/booking/${booking._id}`}
                    className="block w-full bg-emerald-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
                  >
                    Track Booking
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
