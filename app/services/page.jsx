'use client';
import { motion } from 'framer-motion';

import Link from 'next/link';
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
    price: 1000,
  },
  {
    title: 'Infusion & Drips',
    description: 'IV infusions and drips administered by experienced nurses at home.',
    icon: Droplet,
    price: 2500,
  },
  {
    title: 'Wound Dressing',
    description: 'Sterile and hygienic dressing for wounds and injuries.',
    icon: Bandage,
    price: 1200,
  },
  {
    title: 'NG Tube Feeding',
    description: 'Nasogastric tube insertion and feeding for patients in need.',
    icon: Thermometer,
    price: 2000,
  },
  {
    title: 'Foley Catheterization',
    description: 'Urinary catheterization services provided in the comfort of home.',
    icon: UserPlus,
    price: 1800,
  },
  {
    title: 'ECG at Home',
    description: 'Electrocardiogram testing without leaving your house.',
    icon: HeartPulse,
    price: 1500,
  },
  {
    title: 'X-Ray & Ultrasound',
    description: 'On-site radiology services including X-rays and ultrasounds.',
    icon: X,
    price: 3000,
  },
  {
    title: 'Physiotherapy',
    description: 'Rehabilitation and physiotherapy plans tailored to your needs.',
    icon: Bone,
    price: 2000,
  },
  {
    title: 'Doctor Visit at Home',
    description: 'General physician and specialist visits at your home.',
    icon: Stethoscope,
    price: 2500,
  },
  {
    title: 'Home Nursing Care',
    description: 'Full-time or part-time nursing care for elderly or chronically ill patients.',
    icon: Hospital,
    price: 5000,
  },
  {
    title: 'Medicine Delivery',
    description: 'Prompt delivery of prescribed medicines to your home.',
    icon: Baby,
    price: 300,
  },
  {
    title: 'Lab Test Sampling',
    description: 'Sample collection for lab tests done at your home.',
    icon: Hospital,
    price: 800,
  },
  {
    title: 'Counselling & Rehab',
    description: 'Mental health counselling and addiction rehabilitation support.',
    icon: HeartPulse,
    price: 2200,
  },
];

export default function ServicesPage() {
  return (

    <div className="min-h-screen bg-emerald-50 py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Our Services</h1>
          <p className="text-gray-700 mb-12 max-w-xl mx-auto">
            Explore the healthcare services we offer to help you and your family stay healthy.
          </p>

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link
                  key={idx}
                  href={`/booking?service=${encodeURIComponent(service.title)}`}
                  className="block"
                >
                  <div className="cursor-pointer bg-white shadow-md rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition duration-300">
                    <div className="mb-4">
                      <Icon size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-blue-500">{service.title}</h3>
                    <p className="mt-2 text-gray-600 text-sm">{service.description}</p>
                    <p className="mt-2 text-blue-500 font-semibold">Price: Rs. {service.price}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div >
    </div>

  );
}
