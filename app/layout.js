// app/layout.js
import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css';
import AnalyticsTracker from '@/components/AnalyticsTracker';

import { Geist, Geist_Mono } from 'next/font/google';
import Footer from '@/components/Footer';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata = {
  title: '24-Hour Home Care Services in Lahore - Call us at +92 306 1706085',
  description: 'Health Hope Care provides compassionate in-home nursing, therapy, and caregiver services. Book trusted local professionals for home visits, consultations and ongoing care.',
  openGraph: {
    title: '24-Hour Home Care Services in Lahore - Call us at +92 306 1706085',
    description: 'Compassionate in-home nursing, therapy, and caregiver services. Book trusted local professionals for home visits and ongoing care.',
    url: 'https://healthhopecare.com',
    siteName: 'Health Hope Care',
    images: [
      {
        url: 'https://www.healthhopecare.com/_next/image?url=%2Flogo.png',
        width: 1200,
        height: 630,
        alt: 'Health Hope Care'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Health Hope Care — Home Health Care',
    description: 'Compassionate in-home nursing & caregiver services.',
    images: ['https://www.healthhopecare.com/_next/image?url=%2Flogo.png'],
  },
  metadataBase: new URL('https://your-production-domain.com')
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Analytics/>
        <SpeedInsights/>
        <AnalyticsTracker />
          <Navbar />
          {children}
          <Footer />
      </body>
    </html>
  );
}
