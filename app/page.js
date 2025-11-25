import React from 'react';
import Hero from '@/components/Hero';
import ServicesPage from '@/components/Services';
import AboutPage from '@/components/About';
import Testimonials from '@/components/Testimonials';
import BookingPage from '@/components/Booking';
import Analytics from '@/components/Analytics';
import FAQ from '@/components/FAQ';
import AIChatbot from '@/components/AIChatbot';

const page = () => {
  return (
    <main className='transition-all duration-300'>
      <Hero />
      <AboutPage />
      <ServicesPage />
      <Analytics />
      <BookingPage />
      <Testimonials />
      <FAQ />
      <AIChatbot />
    </main>
  );
}

export default page;
