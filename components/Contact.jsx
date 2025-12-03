'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const servicesList = [
    'Injection at Home',
    'Infusion & Drips',
    'Wound Dressing',
    'NG Tube Feeding',
    'Foley Catheterization',
    'ECG at Home',
    'X-Ray & Ultrasound',
    'Physiotherapy',
    'Doctor Visit at Home',
    'Home Nursing Care',
    'Medicine Delivery',
    'Lab Test Sampling',
    'Counselling & Rehab',
];

export default function BookingPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactNumber: '',
        address: '',
        service: '',
        date: '',
        time: '',
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        let user = null;
        try {
            const raw = localStorage.getItem('currentUser');
            user = raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.warn('Invalid currentUser in localStorage', err);
            user = null;
        }
        setIsLoggedIn(!!user);
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            window.location.href = '/login';
            return;
        }

        console.log('✅ Booking Submitted:', formData);
        alert('✅ Your booking has been submitted!');
        setFormData({
            name: '',
            email: '',
            contactNumber: '',
            address: '',
            service: '',
            date: '',
            time: '',
        });
    };

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-sky-100 min-h-screen py-16 px-4">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
            >
                <div className="md:mx-20 lg:mx-auto lg:w-[50%] bg-white shadow-md rounded-xl p-8">

                    <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
                        Book a Home Healthcare Service
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                required
                                onChange={handleChange}
                                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                required
                                onChange={handleChange}
                                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="john@example.com"
                            />
                        </div>

                        {/* Contact Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                required
                                onChange={handleChange}
                                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="+92 306 1706085"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <textarea
                                name="message"
                                type="text"
                                value={formData.address}
                                required
                                onChange={handleChange}
                                className="mt-1 h-60 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Your Message:"
                            />
                        </div>


                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-300"
                        >
                            Confirm Booking
                        </button>

                    </form>

                </div>
            </motion.div>
        </div >
    );
}
