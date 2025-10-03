'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-emerald-50 to-sky-100 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        
        {/* Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <motion.h1
            className="text-4xl md:text-5xl font-bold leading-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your Health, <span className="text-sky-700">Our Priority</span>
          </motion.h1>

          <motion.p
            className="mt-4 text-gray-700 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            We provide quality healthcare services with compassion, care, and commitment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Link href="/booking">
              <button className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-800 hover:shadow-lg transition duration-300 ease-in-out">
                Book Appointment
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="/doctor.avif"
            alt="Health care illustration"
            width={500}
            height={500}
            className="w-full h-auto rounded-xl shadow-lg"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
