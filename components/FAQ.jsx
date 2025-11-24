'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'What services do you provide?',
    answer: 'We provide a wide range of home healthcare services including injections, ECG, blood tests, physiotherapy, nursing care, and more. All services are delivered by qualified healthcare professionals at your doorstep.'
  },
  {
    question: 'How do I book a service?',
    answer: 'You can book a service by filling out the booking form on our website, calling our helpline, or through our mobile app. Simply select the service you need, choose a convenient time, and our team will confirm your appointment.'
  },
  {
    question: 'Are your healthcare professionals qualified?',
    answer: 'Yes, all our healthcare professionals are fully qualified, licensed, and experienced. They undergo regular training and background checks to ensure the highest quality of care.'
  },
  {
    question: 'What areas do you serve?',
    answer: 'We currently serve major cities and surrounding areas. Please check our service area on the booking page or contact us to confirm if we serve your location.'
  },
  {
    question: 'How much do your services cost?',
    answer: 'Our pricing varies depending on the service and location. You can view detailed pricing on our services page or contact us for a custom quote. We offer transparent pricing with no hidden fees.'
  },
  {
    question: 'Can I cancel or reschedule my appointment?',
    answer: 'Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time without any charges. Please contact us as soon as possible to make changes.'
  },
  {
    question: 'Do you accept insurance?',
    answer: 'We work with several insurance providers. Please contact us with your insurance details, and we\'ll verify coverage for your specific service.'
  },
  {
    question: 'What safety measures do you follow?',
    answer: 'We follow strict safety protocols including sanitization, use of PPE, regular health screenings of staff, and adherence to all healthcare guidelines to ensure your safety.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-emerald-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">Find answers to common questions about our services</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-emerald-50 transition"
              >
                <span className="text-left font-semibold text-gray-800">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-emerald-600 flex-shrink-0" size={24} />
                ) : (
                  <ChevronDown className="text-emerald-600 flex-shrink-0" size={24} />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 bg-emerald-50">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
