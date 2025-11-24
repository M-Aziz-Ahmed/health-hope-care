'use client';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      console.log('Testimonials: Fetching reviews...');
      const res = await fetch('/api/reviews');
      console.log('Testimonials: Response status:', res.status);
      const data = await res.json();
      console.log('Testimonials: Reviews data:', data);
      const reviews = Array.isArray(data) ? data.slice(0, 6) : [];
      setTestimonials(reviews);
    } catch (error) {
      console.error('Testimonials: Failed to fetch reviews:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-white to-emerald-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="bg-gradient-to-br from-white to-emerald-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-blue-800 mb-4">What Our Patients Say</h2>
          <p className="text-gray-600">Be the first to share your experience!</p>
        </div>
      </section>
    );
  }
  return (
    <section className="bg-gradient-to-br from-white to-emerald-50 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-4xl font-bold text-blue-800 mb-4"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          What Our Patients Say
        </motion.h2>
        <motion.p
          className="text-gray-600 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Real feedback from people we’ve cared for
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t._id || i}
              className="bg-white p-6 rounded-2xl shadow-lg border border-blue-300"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              whileHover={{ scale: 1.03, boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-center mb-4">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 text-yellow-400 fill-yellow-300" />
                ))}
              </div>
              <p className="text-gray-700 italic">“{t.review}”</p>
              <div className="mt-4 text-blue-500 font-semibold">{t.name}</div>
              <div className="text-sm text-gray-500">{t.service}</div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8">
          <a 
            href="/reviews" 
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Share Your Experience
          </a>
        </div>
      </div>
    </section>
  );
}
