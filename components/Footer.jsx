'use client';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-blue-400 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand Info */}
        <div>
          <h2 className="text-2xl font-bold mb-3">Hope Health Care</h2>
          <p className="text-sm text-gray-100">
            Providing compassionate and professional healthcare services for every stage of life.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li><Link href="/services" className="hover:underline">Services</Link></li>
            <li><Link href="/booking" className="hover:underline">Book Appointment</Link></li>
            <li><Link href="/login" className="hover:underline">Login</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} /> +92 300 1234567
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> contact@hopehealth.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Lahore, Pakistan
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-10 border-t border-blue-700 pt-4 text-center text-sm text-gray-100">
        © {new Date().getFullYear()} Hope Health Care. All rights reserved.
      </div>
    </footer>
  );
}
