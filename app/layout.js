// app/layout.js
import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next"
import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import Footer from '@/components/Footer';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata = {
  title: 'Health Hope Care',
  description: 'Providing home health care services with care and compassion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Analytics/>
          <Navbar />
          {children}
          <Footer />
      </body>
    </html>
  );
}
