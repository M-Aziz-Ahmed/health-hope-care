'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddServicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    price: '',
    duration: '30 mins',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create service');
      alert('✅ Service created successfully!');
      router.push('/admin/services');
    } catch (error) {
      console.error(error);
      alert('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-emerald-700 mb-6 text-center">Add New Service</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-emerald-500 focus:ring-2"
              placeholder="e.g., Injection at Home"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-emerald-500 focus:ring-2"
              placeholder="Short description about the service"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Icon (Lucide Icon Name)</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-emerald-500 focus:ring-2"
              placeholder="e.g., Syringe, Droplet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-emerald-500 focus:ring-2"
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-emerald-500 focus:ring-2"
              placeholder="e.g., 30 mins, 1 hour"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Submit Service'}
          </button>
        </form>
      </div>
    </div>
  );
}
