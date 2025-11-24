'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Navigation,
  Calendar,
  ArrowLeft,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function BookingTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffLocation, setStaffLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  useEffect(() => {
    fetchBooking();
    // Simulate real-time location updates every 10 seconds
    const locationInterval = setInterval(() => {
      if (booking?.assignedStaff) {
        updateStaffLocation();
      }
    }, 10000);

    return () => clearInterval(locationInterval);
  }, [params.id, booking?.assignedStaff]);

  const fetchBooking = async () => {
    try {
      const res = await fetch('/api/fetchBooking');
      const data = await res.json();
      const found = data.find(b => b._id === params.id);
      
      if (found) {
        setBooking(found);
        if (found.assignedStaff) {
          updateStaffLocation();
        }
      } else {
        router.push('/user');
      }
    } catch (error) {
      console.error('Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const updateStaffLocation = () => {
    // Simulate staff location (in production, this would come from real GPS)
    const mockLocation = {
      lat: 24.8607 + (Math.random() - 0.5) * 0.01,
      lng: 67.0011 + (Math.random() - 0.5) * 0.01,
    };
    setStaffLocation(mockLocation);
    
    // Calculate estimated time (mock calculation)
    const distance = Math.random() * 5; // km
    const timeInMinutes = Math.ceil(distance * 3); // 3 min per km
    setEstimatedTime(timeInMinutes);
  };

  const getProgressSteps = () => {
    if (!booking) return [];

    const steps = [
      {
        id: 1,
        title: 'Booking Received',
        description: 'Your booking has been received successfully',
        completed: true,
        icon: CheckCircle,
        time: new Date(booking.date).toLocaleString(),
      },
      {
        id: 2,
        title: 'Assigning Staff',
        description: booking.assignedStaff 
          ? `${booking.assignedStaff.name} has been assigned`
          : 'Finding the best staff member for you',
        completed: !!booking.assignedStaff,
        icon: User,
        time: booking.assignedStaff ? 'Assigned' : 'In progress',
      },
      {
        id: 3,
        title: 'Staff En Route',
        description: booking.status === 'Confirmed' && booking.assignedStaff
          ? `${booking.assignedStaff.name} is on the way`
          : 'Waiting for confirmation',
        completed: booking.status === 'Confirmed' && booking.assignedStaff,
        icon: Navigation,
        time: estimatedTime ? `ETA: ${estimatedTime} mins` : 'Pending',
      },
      {
        id: 4,
        title: 'Service Completed',
        description: 'Service will be marked complete after visit',
        completed: false,
        icon: CheckCircle,
        time: 'Pending',
      },
    ];

    return steps;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">Booking not found</div>
      </div>
    );
  }

  const steps = getProgressSteps();
  const currentStep = steps.findIndex(s => !s.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/user" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Track Your Booking</h1>
          <p className="text-slate-600">Booking ID: {booking._id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Banner */}
            <div className={`rounded-2xl p-6 text-white ${
              booking.status === 'Confirmed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              booking.status === 'Cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              'bg-gradient-to-r from-yellow-500 to-yellow-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Current Status</div>
                  <div className="text-3xl font-bold">{booking.status}</div>
                </div>
                {booking.status === 'Confirmed' && estimatedTime && (
                  <div className="text-right">
                    <div className="text-sm opacity-90 mb-1">Estimated Arrival</div>
                    <div className="text-3xl font-bold">{estimatedTime} min</div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Booking Progress</h2>
              <div className="space-y-6">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === currentStep;
                  
                  return (
                    <div key={step.id} className="relative">
                      {index < steps.length - 1 && (
                        <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                          step.completed ? 'bg-emerald-500' : 'bg-slate-200'
                        }`} />
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-emerald-500 text-white' :
                          isActive ? 'bg-yellow-500 text-white animate-pulse' :
                          'bg-slate-200 text-slate-400'
                        }`}>
                          <StepIcon size={24} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-lg font-semibold ${
                              step.completed ? 'text-emerald-700' :
                              isActive ? 'text-yellow-700' :
                              'text-slate-400'
                            }`}>
                              {step.title}
                            </h3>
                            <span className="text-sm text-slate-500">{step.time}</span>
                          </div>
                          <p className="text-slate-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map Section */}
            {booking.assignedStaff && booking.status === 'Confirmed' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Live Location</h2>
                <div className="relative bg-slate-100 rounded-xl overflow-hidden" style={{ height: '400px' }}>
                  {/* Mock Map - In production, integrate Google Maps or Mapbox */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="mx-auto mb-4 text-emerald-600" size={64} />
                      <p className="text-slate-600 mb-2">Staff Location Tracking</p>
                      {staffLocation && (
                        <div className="text-sm text-slate-500">
                          <p>Lat: {staffLocation.lat.toFixed(4)}</p>
                          <p>Lng: {staffLocation.lng.toFixed(4)}</p>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-4">
                        Map integration: Google Maps / Mapbox
                      </p>
                    </div>
                  </div>
                  
                  {/* Animated marker */}
                  {staffLocation && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" style={{ width: '40px', height: '40px' }} />
                        <div className="relative bg-emerald-600 rounded-full p-2">
                          <Navigation className="text-white" size={24} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Staff & Booking Info */}
          <div className="space-y-6">
            {/* Staff Profile */}
            {booking.assignedStaff && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Your Healthcare Professional</h2>
                <div className="text-center mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="text-white" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{booking.assignedStaff.name}</h3>
                  <p className="text-sm text-slate-600 capitalize">{booking.assignedStaff.role}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-slate-600 ml-2">(4.9)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="text-emerald-600" size={20} />
                    <div className="text-sm">
                      <div className="text-slate-500">Email</div>
                      <div className="font-medium text-slate-800">{booking.assignedStaff.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="text-emerald-600" size={20} />
                    <div className="text-sm">
                      <div className="text-slate-500">Phone</div>
                      <div className="font-medium text-slate-800">+92 300 1234567</div>
                    </div>
                  </div>

                  {estimatedTime && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <Clock className="text-emerald-600" size={20} />
                      <div className="text-sm">
                        <div className="text-slate-500">Estimated Arrival</div>
                        <div className="font-bold text-emerald-700">{estimatedTime} minutes</div>
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                  <Phone size={20} />
                  Call Staff
                </button>
              </div>
            )}

            {/* Booking Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-500">Service</div>
                  <div className="font-semibold text-slate-800">{booking.service}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Scheduled Date & Time</div>
                  <div className="font-semibold text-slate-800">
                    {new Date(booking.date).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Address</div>
                  <div className="font-semibold text-slate-800">{booking.address}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Contact</div>
                  <div className="font-semibold text-slate-800">{booking.phone}</div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Our support team is available 24/7 to assist you
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
