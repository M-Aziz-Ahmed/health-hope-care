'use client';
import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Plus,
  History,
  X,
  MessageCircle
} from 'lucide-react';

import dynamic from 'next/dynamic';
import ChatWindow from '@/components/ChatWindow';
import VideoCall from '@/components/VideoCall';

// Dynamically import MapComponent
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
});

const servicesList = [
  { name: 'Injection at Home', icon: '💉', price: '$25' },
  { name: 'Infusion & Drips', icon: '💧', price: '$45' },
  { name: 'Wound Dressing', icon: '🩹', price: '$30' },
  { name: 'NG Tube Feeding', icon: '🏥', price: '$40' },
  { name: 'Foley Catheterization', icon: '⚕️', price: '$35' },
  { name: 'ECG at Home', icon: '❤️', price: '$50' },
  { name: 'X-Ray & Ultrasound', icon: '📷', price: '$80' },
  { name: 'Physiotherapy', icon: '🤸', price: '$60' },
  { name: 'Doctor Visit at Home', icon: '👨‍⚕️', price: '$100' },
  { name: 'Home Nursing Care', icon: '👩‍⚕️', price: '$70' },
  { name: 'Medicine Delivery', icon: '💊', price: '$10' },
  { name: 'Lab Test Sampling', icon: '🔬', price: '$40' },
  { name: 'Counselling & Rehab', icon: '🧠', price: '$90' },
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

  // Tab and booking history states
  const [activeTab, setActiveTab] = useState('new');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Tracking Modal State
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [coordinates, setCoordinates] = useState({ start: null, end: null });
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
      setCurrentUser(user);
      // Fetch user bookings
      if (user.email) {
        fetchBookings(user.email);
      }
    }
  }, []);

  const fetchBookings = async (emailOverride) => {
    const emailToUse = (emailOverride || formData.email)?.trim().toLowerCase();
    if (!emailToUse) {
      console.warn('No email provided to fetchBookings');
      return;
    }

    setLoadingBookings(true);
    try {
      const res = await fetch(`/api/getUserBookings?email=${encodeURIComponent(emailToUse)}`);
      const data = await res.json();
      
      if (res.ok) {
        setBookings(Array.isArray(data) ? data : []);
        console.log(`Fetched ${Array.isArray(data) ? data.length : 0} bookings for ${emailToUse}`);
      } else {
        console.error('Failed to fetch bookings:', data.error || 'Unknown error');
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleTrackStaff = async (booking) => {
    setTrackingBooking(booking);

    // Get user's current location (patient location)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const end = [position.coords.latitude, position.coords.longitude];
          // Geocode staff location or use booking address
          await geocodeAndSetRoute(booking.address, end);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback: geocode booking address
          geocodeAndSetRoute(booking.address, null);
        }
      );
    } else {
      // Fallback: geocode booking address
      geocodeAndSetRoute(booking.address, null);
    }
  };

  const geocodeAndSetRoute = async (address, endLocation) => {
    try {
      const query = address.toLowerCase().includes('pakistan') ? address : `${address}, Pakistan`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'HealthHopeCare/1.0 (healthhopecare24by7@gmail.com)'
        }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const end = endLocation || [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        // For staff location, use a mock location (in production, get from real GPS)
        const start = [parseFloat(data[0].lat) + 0.01, parseFloat(data[0].lon) + 0.01];
        setCoordinates({ start, end });
      } else {
        // Fallback coordinates
        const fallbackEnd = endLocation || [31.5204, 74.3587];
        setCoordinates({ start: [fallbackEnd[0] + 0.01, fallbackEnd[1] + 0.01], end: fallbackEnd });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      const fallbackEnd = endLocation || [31.5204, 74.3587];
      setCoordinates({ start: [fallbackEnd[0] + 0.01, fallbackEnd[1] + 0.01], end: fallbackEnd });
    }
  };

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

      const currentEmail = formData.email;

      // If logged in, keep user details, otherwise clear everything
      if (isLoggedIn) {
        setFormData(prev => ({
          ...prev,
          service: '',
          date: '',
          time: ''
        }));
      } else {
        setFormData({ name: '', email: '', phone: '', address: '', service: '', date: '', time: '' });
      }

      // Refresh bookings with the captured email
      fetchBookings(currentEmail);
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

  const selectedService = servicesList.find(s => s.name === formData.service);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
  <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen py-20 px-4">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-xl">
          <Stethoscope className="text-white" size={32} />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold font-heading text-blue-700 mb-4">
          Healthcare Bookings
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Book new services or manage your existing bookings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-10">
        <div className="bg-white rounded-2xl shadow-xl p-2 inline-flex gap-2 border-2 border-blue-200">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold font-heading transition-all duration-300 ${activeTab === 'new'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
          >
            <Plus size={20} />
            New Booking
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold font-heading transition-all duration-300 ${activeTab === 'history'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
          >
            <History size={20} />
            My Bookings
            {bookings.length > 0 && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {bookings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-2xl rounded-2xl p-8 border-2 border-blue-200">
              <h2 className="text-3xl font-bold font-heading text-blue-700 mb-6 flex items-center gap-2">
                <User className="text-blue-600" size={24} />
                Your Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 font-heading">
                    <User size={16} className="text-blue-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 font-heading">
                      <Mail size={16} className="text-blue-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.email}</p>}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 font-heading">
                      <Phone size={16} className="text-blue-600" />
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="+92 306 1706085"
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.phone}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 font-heading">
                    <MapPin size={16} className="text-blue-600" />
                    Service Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="House #, Street, City"
                  />
                  {errors.address && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.address}</p>}
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 font-heading">
                    <Stethoscope size={16} className="text-blue-600" />
                    Select Service
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
                  >
                    <option value="">-- Choose a Service --</option>
                    {servicesList.map((service, idx) => (
                      <option key={idx} value={service.name}>
                        {service.icon} {service.name} - {service.price}
                      </option>
                    ))}
                  </select>
                  {errors.service && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.service}</p>}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 font-heading">
                      <Calendar size={16} className="text-blue-600" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    {errors.date && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2 font-heading">
                      <Clock size={16} className="text-blue-600" />
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    {errors.time && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.time}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                {errors.form && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{errors.form}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-700">
                    <CheckCircle size={20} />
                    <p className="text-sm font-medium">{successMessage}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 mt-4 ${submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                    } text-white font-bold font-heading rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Booking
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Info & Summary */}
          <div className="space-y-6">
            {/* Booking Summary */}
            {selectedService && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 text-white">
                <h3 className="text-2xl font-bold font-heading mb-6">Booking Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/20">
                    <span className="text-blue-100">Service</span>
                    <span className="font-semibold">{selectedService.icon} {selectedService.name}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/20">
                    <span className="text-blue-100">Price</span>
                    <span className="font-bold text-2xl">{selectedService.price}</span>
                  </div>
                  {formData.date && (
                    <div className="flex items-center justify-between pb-3 border-b border-white/20">
                      <span className="text-blue-100">Date</span>
                      <span className="font-semibold">{new Date(formData.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {formData.time && (
                    <div className="flex items-center justify-between">
                      <span className="text-blue-100">Time</span>
                      <span className="font-semibold">{formData.time}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Why Choose Us */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-cyan-200">
              <h3 className="text-2xl font-bold font-heading text-blue-700 mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800">Certified Professionals</div>
                    <div className="text-sm text-gray-600">Licensed and experienced healthcare staff</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800">24/7 Availability</div>
                    <div className="text-sm text-gray-600">Round-the-clock service at your convenience</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800">Affordable Pricing</div>
                    <div className="text-sm text-gray-600">Transparent pricing with no hidden costs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800">Quick Response</div>
                    <div className="text-sm text-gray-600">Fast booking confirmation and service delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Phone size={20} />
                Need Help?
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Our support team is available 24/7 to assist you with your booking
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-800">
                  <Phone size={16} />
                  <span className="font-semibold">+92 3061706085</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <Mail size={16} />
                  <span className="font-semibold">healthhopecare24by7@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // BOOKING HISTORY TAB
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-3xl font-bold font-heading text-blue-800 flex items-center gap-3">
                <History className="text-blue-600" />
                Your Booking History
              </h2>
              <p className="text-gray-600 mt-2">View and track your past and upcoming appointments</p>
            </div>

            <div className="p-8">
              {loadingBookings ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
                  <p className="text-gray-500 mb-6">You haven't made any appointments yet.</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
                        if (user.email) {
                          fetchBookings(user.email);
                        } else if (formData.email) {
                          fetchBookings(formData.email);
                        }
                      }}
                      className="bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group border-l-4 border-l-blue-500"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {servicesList.find(s => s.name === booking.service)?.icon || '🏥'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{booking.service}</h3>
                            <p className="text-sm text-gray-500 font-medium">ID: {booking._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusBadgeColor(booking.status)}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={18} className="text-blue-500" />
                          <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={18} className="text-blue-500" />
                          <span className="font-medium">{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={18} className="text-blue-500" />
                          <span className="truncate font-medium">{booking.address}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3 flex-wrap">
                        {booking.assignedStaff && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBookingForChat(booking);
                                setShowChat(true);
                              }}
                              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium shadow-sm hover:shadow-md"
                            >
                              <MessageCircle size={18} />
                              Chat
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBookingForChat(booking);
                                setShowCall(true);
                              }}
                              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-sm hover:shadow-md"
                            >
                              <Phone size={18} />
                              Call
                            </button>
                            <button
                              onClick={() => handleTrackStaff(booking)}
                              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
                            >
                              <MapPin size={18} />
                              Track Staff
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Tracking Modal */}
    {trackingBooking && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-blue-50">
            <div>
              <h3 className="text-xl font-bold text-blue-800">Live Staff Tracking</h3>
              <p className="text-sm text-blue-600">Tracking staff for {trackingBooking.service}</p>
            </div>
            <button
              onClick={() => setTrackingBooking(null)}
              className="p-2 hover:bg-blue-100 rounded-full transition text-blue-800"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            {/* Staff Profile Sidebar */}
            <div className="w-full md:w-80 bg-white border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner">
                  👨‍⚕️
                </div>
                <h4 className="text-xl font-bold text-gray-800">{trackingBooking.assignedStaff?.name || 'Assigned Staff'}</h4>
                <p className="text-blue-600 font-medium">{trackingBooking.assignedStaff?.role || 'Healthcare Professional'}</p>
                <div className="flex justify-center gap-1 mt-2 text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Contact</div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-blue-500" />
                    <span className="font-medium">{trackingBooking.assignedStaff?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Status</div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    On the way
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800 italic">
                    "Your health is my priority. I'm on my way to provide the best care."
                  </p>
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-gray-100">
              {coordinates.start && coordinates.end ? (
                <MapComponent
                  startLocation={coordinates.start}
                  endLocation={coordinates.end}
                  showRoute={true}
                  staffName={trackingBooking.assignedStaff?.name || "Staff"}
                  patientName="You"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Chat Window */}
    {showChat && selectedBookingForChat && (
      <ChatWindow
        bookingId={selectedBookingForChat._id}
        booking={selectedBookingForChat}
        currentUser={currentUser}
        onClose={() => {
          setShowChat(false);
          setSelectedBookingForChat(null);
        }}
      />
    )}

    {/* Video Call */}
    {showCall && selectedBookingForChat && (
      <VideoCall
        booking={selectedBookingForChat}
        currentUser={currentUser}
        onClose={() => {
          setShowCall(false);
          setSelectedBookingForChat(null);
        }}
        onCallEnd={() => {
          setShowCall(false);
          setSelectedBookingForChat(null);
        }}
      />
    )}
  </div>
);
}
