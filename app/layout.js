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
  metadataBase: new URL('https://www.healthhopecare.com')
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="cijNQwF8Jjqne8MIeez6Fai9Buj8ntK_xoqlhSNsam0" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Analytics/>
        <SpeedInsights/>
        <AnalyticsTracker />
        {/* LocalBusiness structured data for SEO (replace values if needed) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HomeAndConstructionBusiness",
          "name": "Health Hope Care",
          "description": "Compassionate in-home nursing, therapy and caregiver services in Lahore. Book trusted local professionals for home visits and ongoing care.",
          "url": (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.healthhopecare.com'),
          "telephone": "+92 306 1706085",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "1st floor, Akbar Chowk, Umer Plaza, College Road, Township",
            "addressLocality": "Lahore",
            "addressRegion": "Punjab",
            "postalCode": "54000",
            "addressCountry": "PK"
          },
          "areaServed": "Lahore",
          "openingHours": "Mo-Su 00:00-23:59",
          "sameAs": [],
          "image": (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.healthhopecare.com') + '/og-image.png'
        }) }} />
          <Navbar />
          {children}
          <Footer />
      </body>
    </html>
  );
}
