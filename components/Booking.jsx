'use client';
import { useState, useEffect } from 'react';

const servicesList = [
  'Injection at Home',
  'Infusion & Drips',
  'Wound Dressing',
  'NG Tube Feeding',
  'Foley Catheterization',
  'ECG at Home',
  'X-Ray & Ultrasound',
  'Physiotherapy',
  'Doctor Visit at Home',
  'Home Nursing Care',
  'Medicine Delivery',
  'Lab Test Sampling',
  'Counselling & Rehab',
];

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    service: '',
    date: '',
    time: '',
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let user = null;
    try {
      const raw = localStorage.getItem('currentUser');
      user = raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Invalid currentUser in localStorage', err);
      user = null;
    }
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
      setIsLoggedIn(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear field error
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Name is required';
    if (!formData.email.trim()) err.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) err.email = 'Enter a valid email';
    if (!formData.phone.trim()) err.phone = 'Contact number is required';
    else if (!/^[+\d][\d\s-]{7,}$/.test(formData.phone)) err.phone = 'Enter a valid phone number';
    if (!formData.address.trim()) err.address = 'Address is required';
    if (!formData.service) err.service = 'Please select a service';
    if (!formData.date) err.date = 'Please choose a preferred date';
    if (!formData.time) err.time = 'Please choose a preferred time';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/createbooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccessMessage('✅ Booking successful! We will contact you soon.');
        setFormData({ name: '', email: '', phone: '', address: '', service: '', date: '', time: '' });
      } else {
        const data = await res.json();
        setErrors({ form: data.error || 'Failed to submit booking. Try again later.' });
      }
    } catch (err) {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  console.log('✅ Booking Submitted:', formData);

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-sky-100 min-h-screen py-16 px-4">
      <div className="lg:w-170 md:mx-10  lg:mx-auto bg-white shadow-md rounded-xl p-8">
        <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
          Book a Home Healthcare Service
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              required
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              required
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              required
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="+92 300 1234567"
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              required
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="House #, Street, City"
            />
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Service</label>
            <select
              name="service"
              value={formData.service}
              required
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Service --</option>
              {servicesList.map((service, idx) => (
                <option key={idx} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                required
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                required
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.time && <p className="text-sm text-red-600 mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Date & Time */}
          {/* <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                required
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                required
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div> */}

          {/* Submit Button */}
          {errors.form && <p className="text-center text-sm text-red-600">{errors.form}</p>}
          {successMessage && <p className="text-center text-sm text-emerald-700">{successMessage}</p>}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 mt-4 ${submitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} text-white font-semibold rounded-md transition duration-300`}
          >
            {submitting ? 'Sending...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
