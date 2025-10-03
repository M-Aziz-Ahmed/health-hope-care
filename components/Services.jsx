'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Syringe,
  Droplet,
  Bandage,
  Stethoscope,
  HeartPulse,
  Hospital,
  X,
  Thermometer,
  Baby,
  Bone,
  UserPlus,
} from 'lucide-react';

const services = [
  {
    title: 'Injection at Home',
    description: 'Safe and professional injection services provided at your doorstep.',
    icon: Syringe,
    
  },
  {
    title: 'Infusion & Drips',
    description: 'IV infusions and drips administered by experienced nurses at home.',
    icon: Droplet,
    
  },
  {
    title: 'Doctor Visit at Home',
    description: 'General physician and specialist visits at your home.',
    icon: Stethoscope,
    
  },
  {
    title: 'Home Nursing Care',
    description: 'Full-time or part-time nursing care for elderly or chronically ill patients.',
    icon: Hospital,
    
  },
  {
    title: 'Medicine Delivery',
    description: 'Prompt delivery of prescribed medicines to your home.',
    icon: Baby,
      },
  {
    title: 'Lab Test Sampling',
    description: 'Sample collection for lab tests done at your home.',
    icon: Hospital,
      },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-emerald-50 py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Our Services</h1>
          <p className="text-gray-700 max-w-xl mx-auto">
            Explore the healthcare services we offer to help you and your family stay healthy.
          </p>
        </header>

        {/* Services Grid */}
        <section className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.title}
              href={`/booking?service=${encodeURIComponent(service.title)}`}
              passHref
            >
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-lg border border-blue-300"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
              >
                <div className="mb-4">
                  <service.icon size={32} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-blue-500">{service.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{service.description}</p>
                <p className="mt-2 text-blue-500 font-semibold">
                  Book Now &rarr;
                </p>
              </motion.div>
            </Link>
          ))}
        </section>

        {/* CTA Section */}
        <section className="flex justify-center mt-15">
          <Link
            href="/services"
            className="bg-blue-500 text-white px-10 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center"
          >
            More Services
          </Link>
        </section>
      </div>
    </div>
  );
}