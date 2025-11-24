'use client';
import { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/fetchStaff');
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      console.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-800">Staff Management</h1>
          <div className="bg-white px-6 py-3 rounded-lg shadow">
            <div className="flex items-center gap-2">
              <Users className="text-emerald-600" size={24} />
              <div>
                <div className="text-sm text-gray-500">Total Staff</div>
                <div className="text-2xl font-bold text-emerald-700">{staff.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">Loading staff...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Role</th>
                    <th className="px-6 py-4 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member, idx) => (
                    <tr key={member._id} className="border-b hover:bg-emerald-50 transition">
                      <td className="px-6 py-4">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium">{member.name}</td>
                      <td className="px-6 py-4 text-gray-600">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && filteredStaff.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No staff members found.
          </div>
        )}
      </div>
    </div>
  );
}
