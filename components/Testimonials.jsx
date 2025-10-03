'use client';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Ali Raza',
    location: 'Lahore',
    review:
      'Hope Health Care provided amazing home nursing service. The staff was polite, punctual, and extremely professional!',
    rating: 5,
  },
  {
    name: 'Fatima Noor',
    location: 'Islamabad',
    review:
      'The doctor came on time and helped my elderly mother feel comfortable. Highly recommended!',
    rating: 4,
  },
  {
    name: 'Usman Khan',
    location: 'Karachi',
    review:
      'Very convenient service. Got an ECG done at home without any hassle. Great team!',
    rating: 5,
  },
  {
    name: 'Saba Khan',
    location: 'Lahore',
    review:
      'I had a great experience with Hope Health Care. The staff was friendly and helpful. Highly recommended!',
    rating: 4,
  }
];

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
              key={i}
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
              <div className="text-sm text-gray-500">{t.location}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
