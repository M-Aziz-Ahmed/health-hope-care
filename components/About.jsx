'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <section className="bg-gradient-to-br from-emerald-50 to-sky-100 min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-500 leading-tight">
            Welcome to <span className="text-sky-600">Hope Health Care</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Delivering trusted healthcare services with{' '}
            <span className="text-blue-500 font-medium">compassion</span>,{' '}
            <span className="text-blue-500 font-medium">innovation</span>, and{' '}
            <span className="text-blue-500 font-medium">professional care</span>.
          </p>
        </motion.div>
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <motion.div
            className="overflow-hidden rounded-3xl shadow-2xl border border-blue-300"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="/about.jpg"
              alt="Doctors working"
              width={1000}
              height={1000}
              className="w-full h-auto object-cover"
              priority
            />
          </motion.div>

          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              At <strong>Hope Health Care</strong>, we strive to make quality healthcare accessible right at your doorstep.
              Whether it's elderly care, diagnostic services, or urgent nursing needs — we deliver care that comforts, heals, and empowers.
            </p>

            <h2 className="text-2xl font-semibold text-sky-800 mb-4">Why Patients Trust Us</h2>
            <ul className="space-y-3 text-gray-700">
              {[
                'Certified & licensed healthcare professionals',
                'Personalized care plans and follow-ups',
                'Emergency support & medicine delivery',
                'Trusted by families across Lahore and beyond',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  ✅ <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-xl font-medium text-gray-800 mb-4">Need trusted care at home?</p>
          <a href="/booking">
            <button className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 hover:shadow-xl transition duration-300">
              Book a Service Now
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
