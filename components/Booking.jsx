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
  AlertCircle
} from 'lucide-react';

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

  const selectedService = servicesList.find(s => s.name === formData.service);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-50 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <Stethoscope className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            Book Your Healthcare Service
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional healthcare services delivered to your doorstep. Available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <User className="text-emerald-600" size={24} />
                Your Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-emerald-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Mail size={16} className="text-emerald-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.email}</p>}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-emerald-600" />
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="+92 300 1234567"
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.phone}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" />
                    Service Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="House #, Street, City"
                  />
                  {errors.address && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.address}</p>}
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Stethoscope size={16} className="text-emerald-600" />
                    Select Service
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none bg-white"
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-600" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    {errors.date && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={14} />{errors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Clock size={16} className="text-emerald-600" />
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
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
                  className={`w-full py-4 mt-4 ${
                    submitting 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  } text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2`}
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
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-white/20">
                    <span className="text-emerald-100">Service</span>
                    <span className="font-semibold">{selectedService.icon} {selectedService.name}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/20">
                    <span className="text-emerald-100">Price</span>
                    <span className="font-bold text-2xl">{selectedService.price}</span>
                  </div>
                  {formData.date && (
                    <div className="flex items-center justify-between pb-3 border-b border-white/20">
                      <span className="text-emerald-100">Date</span>
                      <span className="font-semibold">{new Date(formData.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {formData.time && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">Time</span>
                      <span className="font-semibold">{formData.time}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Why Choose Us */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Why Choose Us?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-slate-800">Certified Professionals</div>
                    <div className="text-sm text-slate-600">Licensed and experienced healthcare staff</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-slate-800">24/7 Availability</div>
                    <div className="text-sm text-slate-600">Round-the-clock service at your convenience</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-slate-800">Affordable Pricing</div>
                    <div className="text-sm text-slate-600">Transparent pricing with no hidden costs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-slate-800">Quick Response</div>
                    <div className="text-sm text-slate-600">Fast booking confirmation and service delivery</div>
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
      </div>
    </div>
  );
}
