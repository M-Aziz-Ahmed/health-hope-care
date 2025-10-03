// app/layout.js
import Navbar from '@/components/Navbar';
import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import Footer from '@/components/Footer';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata = {
  title: 'Hope Health Care',
  description: 'Providing home healthcare services with care and compassion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-screen">
  <Navbar />
  <main className="flex-grow">{children}</main>
  <Footer />
</div>        
      </body>
    </html>
  );
}
