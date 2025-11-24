'use client';
import { useState } from 'react';
import { Settings, Mail, Clock, DollarSign, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    businessName: 'Health Hope Care',
    email: 'admin@healthhope.com',
    phone: '+1 (555) 123-4567',
    address: '123 Healthcare St, Medical City',
    businessHours: '9:00 AM - 6:00 PM',
    emergencyContact: '+1 (555) 911-0000',
    bookingAdvanceTime: '24',
    cancellationPolicy: 'Cancellations must be made 24 hours in advance',
    serviceRadius: '50',
    currency: 'USD',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // In production, save to database via API
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="text-emerald-700" size={36} />
          <h1 className="text-4xl font-bold text-emerald-800">Admin Settings</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={settings.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={settings.emergencyContact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Operational Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Operational Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                <input
                  type="text"
                  name="businessHours"
                  value={settings.businessHours}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Advance Time (hours)</label>
                <input
                  type="number"
                  name="bookingAdvanceTime"
                  value={settings.bookingAdvanceTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
                <input
                  type="number"
                  name="serviceRadius"
                  value={settings.serviceRadius}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PKR">PKR (₨)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
                <textarea
                  name="cancellationPolicy"
                  value={settings.cancellationPolicy}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 flex items-center gap-2"
            >
              <Save size={20} />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
