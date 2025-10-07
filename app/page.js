import React from 'react';
import Hero from '@/components/Hero';
import ServicesPage from '@/components/Services';
import AboutPage from '@/components/About';
import Testimonials from '@/components/Testimonials';
import BookingPage from '@/components/Booking';

const page = () => {
  return (
    <main className='transition-all duration-300'>
      <Hero />
      <AboutPage />
      <ServicesPage />
      <BookingPage />
      <Testimonials />
    </main>
  );
}

export default page;
