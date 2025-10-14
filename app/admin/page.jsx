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
