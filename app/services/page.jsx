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
  },
  {
    title: 'Infusion & Drips',
    description: 'IV infusions and drips administered by experienced nurses at home.',
    icon: Droplet,
  },
  {
    title: 'Wound Dressing',
    description: 'Sterile and hygienic dressing for wounds and injuries.',
    icon: Bandage,
  },
  {
    title: 'NG Tube Feeding',
    description: 'Nasogastric tube insertion and feeding for patients in need.',
    icon: Thermometer,
  },
  {
    title: 'Foley Catheterization',
    description: 'Urinary catheterization services provided in the comfort of home.',
    icon: UserPlus,
  },
  {
    title: 'ECG at Home',
    description: 'Electrocardiogram testing without leaving your house.',
    icon: HeartPulse,
  },
  {
    title: 'X-Ray & Ultrasound',
    description: 'On-site radiology services including X-rays and ultrasounds.',
    icon: X,
  },
  {
    title: 'Physiotherapy',
    description: 'Rehabilitation and physiotherapy plans tailored to your needs.',
    icon: Bone,
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
  {
    title: 'Counselling & Rehab',
    description: 'Mental health counselling and addiction rehabilitation support.',
    icon: HeartPulse,
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

          <div className="flex flex-wrap gap-5">
            {services.map((card, index) => (
              <div className="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10 text-blue-600] hover:text-white" key={card.title}>
                <span className="absolute left-10 top-10 z-0 h-20 w-20 rounded-full bg-blue-400  transition-all duration-300 group-hover:scale-[10]"></span>
                <div className="relative z-10 mx-auto max-w-md">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-[#FEF1F2] group-hover:bg-white transition-all duration-300 border-[1px] border-blue-400 text-blue-400 hover:border-white hover:text-white">
                    <card.icon size={50} className="text" />
                  </span>

                  <div className="text-3xl font-bold my-3  text-blue-400 transition-all duration-300 group-hover:text-white/90">
                    {card.title}
                  </div>
                  <div className="text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90">
                    <p>
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div >
    </div>

  );
}
