'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck2,
  Users,
  Briefcase,
  UserCheck,
  Clock,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalServices: 0,
    staffCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/current-user', {
          method: 'GET',
          credentials: 'include',
        });
        const user = await res.json();
        if (!user || user.role !== 'admin') {
          router.push('/login');
          return;
        }
        setAdminName(user.name);
        fetchUsers();
        fetchStats();
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    async function fetchUsers() {
      try {
        const res = await fetch('/api/fetchUser');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users');
      }
    }

    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats');
      }
    }

    checkAdmin();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Checking admin access...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Welcome back, {adminName}</p>
            </div>
          </div>
          <SendNotification users={users} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Users size={28} />
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Total Users</p>
                <p className="text-4xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <TrendingUp size={16} />
              <span>Active users</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <CalendarCheck2 size={28} />
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Total Bookings</p>
                <p className="text-4xl font-bold">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border hover:shadow-lg p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="text-yellow-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border hover:shadow-lg p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <UserCheck className="text-purple-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Staff Members</p>
                <p className="text-3xl font-bold text-purple-600">{stats.staffCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/analytics">
              <div className="bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl p-5 rounded-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-2 rounded-lg group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all">
                    <BarChart3 className="text-emerald-600 group-hover:text-white" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Analytics</h3>
                </div>
                <p className="text-sm text-slate-600">View insights</p>
              </div>
            </Link>

            <Link href="/admin/services">
              <div className="bg-white border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl p-5 rounded-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-lg group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                    <Briefcase className="text-blue-600 group-hover:text-white" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Services</h3>
                </div>
                <p className="text-sm text-slate-600">Manage services</p>
              </div>
            </Link>

            <Link href="/admin/bookings">
              <div className="bg-white border-2 border-slate-200 hover:border-purple-500 hover:shadow-xl p-5 rounded-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-2 rounded-lg group-hover:from-purple-500 group-hover:to-purple-600 transition-all">
                    <CalendarCheck2 className="text-purple-600 group-hover:text-white" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Bookings</h3>
                </div>
                <p className="text-sm text-slate-600">Manage bookings</p>
              </div>
            </Link>

            <Link href="/admin/staff">
              <div className="bg-white border-2 border-slate-200 hover:border-indigo-500 hover:shadow-xl p-5 rounded-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 rounded-lg group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all">
                    <UserCheck className="text-indigo-600 group-hover:text-white" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Staff</h3>
                </div>
                <p className="text-sm text-slate-600">View staff</p>
              </div>
            </Link>
          </div>
        </div>



        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          {users.length === 0 ? (
            <p className="text-gray-500">No users registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">#</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Name</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Role</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(user =>
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.role.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user, i) => (
                      <tr
                        key={user.email}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' || user.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RoleControls user={user} onRoleChange={(newRole) => {
                            setUsers((prev) => prev.map(u => u.email === user.email ? { ...u, role: newRole } : u));
                          }} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleControls({ user, onRoleChange }) {
  const [loading, setLoading] = useState(false);

  const changeRole = async (role) => {
    if (user.role === 'owner' && role !== 'owner') {
      alert('Owner role cannot be changed by admins');
      return;
    }

    if (!confirm(`Change role of ${user.email} to ${role}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/updateUserRole', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id || user.id, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onRoleChange(role);
      alert('Role updated');
    } catch (err) {
      console.error(err);
      alert('Failed to update role: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button disabled={loading} onClick={() => changeRole('admin')} className="px-2 py-1 bg-emerald-600 text-white rounded text-sm">Make Admin</button>
      <button disabled={loading} onClick={() => changeRole('user')} className="px-2 py-1 bg-gray-400 text-white rounded text-sm">Make User</button>
    </div>
  );
}

function SendNotification({ users }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState('all');
  const [recipients, setRecipients] = useState(''); // comma-separated emails
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return alert('Message required');
    setSending(true);
    try {
      let userIds = [];
      if (target === 'one' || target === 'some') {
        const emails = recipients.split(',').map(s => s.trim()).filter(Boolean);
        const matched = users.filter(u => emails.includes(u.email));
        if (matched.length === 0) return alert('No matching users found for given emails');
        userIds = matched.map(m => m._id || m.id);
      }

      const body = { target, users: userIds, message };
      const res = await fetch('/api/sendNotification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Send failed');
      alert('Notification sent');
      setOpen(false);
      setMessage('');
      setRecipients('');
    } catch (err) {
      console.error(err);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md">Send Notification</button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Send Notification</h3>
            <div className="mb-2">
              <label className="block text-sm">Target</label>
              <select value={target} onChange={e => setTarget(e.target.value)} className="w-full mt-1 p-2 border rounded">
                <option value="all">All registered users</option>
                <option value="users">Only regular users</option>
                <option value="admins">Only admins/owner</option>
                <option value="staff">Only staff</option>
                <option value="one">One user (email)</option>
                <option value="some">Some users (emails comma-separated)</option>
              </select>
            </div>
            {(target === 'one' || target === 'some') && (
              <div className="mb-2">
                <label className="block text-sm">Recipient emails</label>
                <input value={recipients} onChange={e => setRecipients(e.target.value)} placeholder="email1@example.com, email2@example.com" className="w-full mt-1 p-2 border rounded" />
              </div>
            )}
            <div className="mb-2">
              <label className="block text-sm">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full mt-1 p-2 border rounded h-28" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2">Cancel</button>
              <button disabled={sending} onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded">{sending ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
