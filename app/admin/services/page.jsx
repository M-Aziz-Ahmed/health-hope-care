'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, DollarSign, Clock } from 'lucide-react';

export default function ServicesManagementPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setServices(prev => prev.filter(s => s._id !== id));
      alert('Service deleted');
    } catch (error) {
      alert('Failed to delete service');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      setServices(prev => prev.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s));
    } catch (error) {
      alert('Failed to update service');
    }
  };

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-800">Services Management</h1>
          <Link href="/admin/add-service">
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-emerald-700">
              <Plus size={20} /> Add Service
            </button>
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <div key={service._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-emerald-700">{service.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <DollarSign size={16} />
                    <span>${service.price || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{service.duration}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(service._id, service.isActive)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteService(service._id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No services found. <Link href="/admin/add-service" className="text-emerald-600 underline">Add your first service</Link>
          </div>
        )}
      </div>
    </div>
  );
}
