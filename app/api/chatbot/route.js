import { NextResponse } from 'next/server';

// Knowledge base for Health Hope Care services
const knowledgeBase = {
  services: [
    'Injection at Home - $25',
    'Infusion & Drips - $45',
    'Wound Dressing - $30',
    'NG Tube Feeding - $40',
    'Foley Catheterization - $35',
    'ECG at Home - $50',
    'X-Ray & Ultrasound - $80',
    'Physiotherapy - $60',
    'Doctor Visit at Home - $100',
    'Home Nursing Care - $70',
    'Medicine Delivery - $10',
    'Lab Test Sampling - $40',
    'Counselling & Rehab - $90',
  ],
  contact: {
    phone: '+92 3061706085',
    email: 'healthhopecare24by7@gmail.com',
  },
  booking: {
    process: 'You can book a service by filling out the booking form with your details, selecting a service, choosing a date and time, and submitting. Our team will confirm your booking shortly.',
    requirements: 'You need to provide your name, email, phone number, address, preferred service, date, and time.',
  },
  hours: 'We are available 24/7 for your healthcare needs.',
  location: 'We provide home healthcare services throughout Pakistan.',
};

// Simple AI-like response generator
function generateResponse(userMessage) {
  const message = userMessage.toLowerCase().trim();

  // Service inquiries
  if (message.includes('service') || message.includes('what services') || message.includes('offer')) {
    return `We offer the following home healthcare services:\n\n${knowledgeBase.services.join('\n')}\n\nAll services are available 24/7. Would you like to know more about any specific service?`;
  }

  // Pricing inquiries
  if (message.includes('price') || message.includes('cost') || message.includes('how much') || message.includes('fee')) {
    return `Here are our service prices:\n\n${knowledgeBase.services.join('\n')}\n\nPrices are transparent with no hidden costs. Would you like to book a service?`;
  }

  // Booking inquiries
  if (message.includes('book') || message.includes('appointment') || message.includes('schedule') || message.includes('how to book')) {
    return `To book a service:\n\n1. Fill out the booking form with your details\n2. Select your preferred service\n3. Choose a date and time\n4. Submit the form\n\n${knowledgeBase.booking.process}\n\nYou can also call us at ${knowledgeBase.contact.phone} for immediate assistance.`;
  }

  // Contact inquiries
  if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('reach') || message.includes('call')) {
    return `You can reach us at:\n\n📞 Phone: ${knowledgeBase.contact.phone}\n📧 Email: ${knowledgeBase.contact.email}\n\n${knowledgeBase.hours} We're here to help!`;
  }

  // Hours/availability
  if (message.includes('hours') || message.includes('available') || message.includes('when') || message.includes('time')) {
    return `${knowledgeBase.hours} You can book a service anytime, and our healthcare professionals will visit you at your preferred time.`;
  }

  // Location inquiries
  if (message.includes('location') || message.includes('where') || message.includes('area') || message.includes('city')) {
    return `${knowledgeBase.location} We provide services at your home, so you don't need to travel. Just provide your address when booking.`;
  }

  // Injection specific
  if (message.includes('injection')) {
    return `Injection at Home service costs $25. Our certified healthcare professionals will come to your home to administer injections safely. This service is perfect for regular medication injections, vaccinations, or any prescribed injections.`;
  }

  // Doctor visit
  if (message.includes('doctor') || message.includes('physician') || message.includes('consultation')) {
    return `Doctor Visit at Home costs $100. Our licensed doctors will visit you at home for consultations, check-ups, and medical examinations. This is convenient for elderly patients, those with mobility issues, or anyone who prefers home consultations.`;
  }

  // Emergency
  if (message.includes('emergency') || message.includes('urgent') || message.includes('immediate')) {
    return `For urgent healthcare needs, please call us immediately at ${knowledgeBase.contact.phone}. We provide 24/7 emergency home healthcare services. For life-threatening emergencies, please also call your local emergency services (1122 in Pakistan).`;
  }

  // Payment
  if (message.includes('payment') || message.includes('pay') || message.includes('cash') || message.includes('card')) {
    return `We accept cash payments on service delivery. Payment methods and details will be confirmed when you book. All prices are transparent with no hidden fees.`;
  }

  // General health questions
  if (message.includes('health') || message.includes('care') || message.includes('medical')) {
    return `Health Hope Care provides professional home healthcare services. We have certified nurses, doctors, and healthcare professionals ready to assist you at home. Our services include medical procedures, consultations, nursing care, and more. How can we help you today?`;
  }

  // Greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('greetings')) {
    return `Hello! Welcome to Health Hope Care. I'm here to help you with:\n\n• Service information and pricing\n• Booking assistance\n• General health questions\n• Contact information\n\nWhat would you like to know?`;
  }

  // Help
  if (message.includes('help') || message.includes('assist')) {
    return `I can help you with:\n\n✅ Information about our services and pricing\n✅ How to book a service\n✅ Contact information\n✅ General questions about home healthcare\n\nWhat would you like to know?`;
  }

  // Default response
  return `I understand you're asking about "${userMessage}". I can help you with:\n\n• Our home healthcare services and pricing\n• How to book a service\n• Contact information\n• General health-related questions\n\nCould you rephrase your question, or would you like to know about any of these topics? You can also call us at ${knowledgeBase.contact.phone} for immediate assistance.`;
}

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simulate a small delay for more natural conversation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = generateResponse(message);

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

