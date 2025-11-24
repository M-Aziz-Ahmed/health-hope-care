'use client';
import { useState } from 'react';
import { Star, Send } from 'lucide-react';

export default function ReviewsPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    review: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In production, send to API
    console.log({ ...formData, rating });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', service: '', review: '' });
      setRating(0);
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-100 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">Share Your Experience</h1>
          <p className="text-gray-600 text-lg">Your feedback helps us improve our services</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-emerald-700 mb-2">Thank You!</h3>
              <p className="text-gray-600">Your review has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Used</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a service</option>
                  <option value="Injection at Home">Injection at Home</option>
                  <option value="ECG at Home">ECG at Home</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Nursing Care">Nursing Care</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={40}
                        className={`transition ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <button
                type="submit"
                disabled={rating === 0}
                className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Submit Review
              </button>
            </form>
          )}
        </div>

        {/* Recent Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-emerald-800 mb-6">Recent Reviews</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', rating: 5, service: 'Injection at Home', review: 'Excellent service! The nurse was professional and caring. Highly recommend.' },
              { name: 'Michael Chen', rating: 5, service: 'ECG at Home', review: 'Very convenient and the staff was knowledgeable. Great experience overall.' },
              { name: 'Emily Davis', rating: 4, service: 'Blood Test', review: 'Quick and painless. The results were delivered on time. Good service.' }
            ].map((review, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{review.name}</h3>
                    <p className="text-sm text-gray-500">{review.service}</p>
                  </div>
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.review}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
