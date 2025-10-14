'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  CalendarCheck2,
  Users,
} from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);

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

    checkAdmin();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Checking admin access...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <SendNotification users={users} />
        </div>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-emerald-800 mb-2">Welcome, {adminName} 👋</h1>
          <p className="text-gray-600 text-lg">Here is your admin dashboard</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Link href="/admin/add-service">
            <div className="bg-white border hover:shadow-lg p-6 rounded-xl flex items-start gap-4">
              <div className="bg-emerald-100 p-2 rounded-full">
                <Plus className="text-emerald-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-700">Add New Service</h3>
                <p className="text-sm text-gray-500 mt-1">Publish healthcare services.</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/bookings">
            <div className="bg-white border hover:shadow-lg p-6 rounded-xl flex items-start gap-4">
              <div className="bg-emerald-100 p-2 rounded-full">
                <CalendarCheck2 className="text-emerald-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-700">Manage Bookings</h3>
                <p className="text-sm text-gray-500 mt-1">Approve or cancel bookings.</p>
              </div>
            </div>
          </Link>

          <div className="bg-white border p-6 rounded-xl flex items-start gap-4">
            <div className="bg-emerald-100 p-2 rounded-full">
              <Users className="text-emerald-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700">Total Users</h3>
              <p className="text-sm text-gray-500 mt-1">{users.length} registered users</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-emerald-700 mb-4">Registered User Info</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">No users registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-emerald-100 text-emerald-700">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr
                      key={user.email}
                      className="border-t hover:bg-emerald-50 transition"
                    >
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2 capitalize">{user.role}</td>
                      <td className="px-4 py-2">
                        <RoleControls user={user} onRoleChange={(newRole) => {
                          // update local state optimistically
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
                <option value="all">All users</option>
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
