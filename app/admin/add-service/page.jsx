'use client';
import { useState } from 'react';

export default function AddServicePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('✅ Service submitted (you need backend to save it)');
    console.log(formData);
    setFormData({ title: '', description: '', icon: '' });
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

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 transition"
          >
            Submit Service
          </button>
        </form>
      </div>
    </div>
  );
}
