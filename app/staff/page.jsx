'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckCircle, Clock, User, MapPin, Phone, Navigation, X, Bell, MessageCircle, Video, PhoneOff } from 'lucide-react';
import dynamic from 'next/dynamic';
import ChatWindow from '@/components/ChatWindow';
import VideoCall from '@/components/VideoCall';
import { io } from 'socket.io-client';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
});

export default function StaffDashboard() {
  const [bookings, setBookings] = useState([]);
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null); // For navigation modal
  const [coordinates, setCoordinates] = useState({ start: null, end: null });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [socket, setSocket] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkStaff() {
      try {
        const res = await fetch('/api/current-user', {
          method: 'GET',
          credentials: 'include',
        });
        const user = await res.json();
        if (!user || user.role !== 'staff') {
          router.push('/login');
          return;
        }
        setStaffInfo(user);
        fetchAssignedBookings(user._id);
        fetchNotifications();
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    async function fetchAssignedBookings(staffId) {
      try {
        const res = await fetch('/api/fetchBooking');
        const data = await res.json();
        const assigned = data.filter(b => b.assignedStaff?._id === staffId || b.assignedStaff === staffId);
        setBookings(assigned);
      } catch (err) {
        console.error('Failed to fetch bookings');
      }
    }

    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const notesArray = Array.isArray(data) ? data : [];
          setNotifications(notesArray);
          setUnreadCount(notesArray.filter(n => !n.read).length);
        }
      } catch (err) {
        console.error('Failed to fetch notifications');
      }
    }

    checkStaff();
    // Refresh notifications every 30 seconds
    const notificationInterval = setInterval(fetchNotifications, 30000);
    // Refresh bookings every 60 seconds to check for new assignments
    const bookingsInterval = setInterval(() => {
      if (staffInfo?._id) {
        fetchAssignedBookings(staffInfo._id);
      }
    }, 60000);
    return () => {
      clearInterval(notificationInterval);
      clearInterval(bookingsInterval);
    };
  }, [router, staffInfo?._id]);

  // Socket.IO for incoming calls
  useEffect(() => {
    if (!staffInfo?._id) return;

    const socketInstance = io();
    
    socketInstance.on('connect', () => {
      console.log('Staff socket connected:', socketInstance.id);
      socketInstance.emit('join', staffInfo._id);
    });

    socketInstance.on('incoming-call', async ({ from, offer, callType, callerName, booking: bookingId }) => {
      console.log('Incoming call from:', callerName);
      
      // Fetch the booking details
      try {
        const res = await fetch('/api/fetchBooking');
        const allBookings = await res.json();
        const booking = allBookings.find(b => b._id === bookingId);
        
        if (booking) {
          setIncomingCall({ from, offer, callType, callerName, booking });
        }
      } catch (error) {
        console.error('Error fetching booking for call:', error);
      }
    });

    socketInstance.on('call-ended', () => {
      setIncomingCall(null);
      setShowCall(false);
    });

    socketInstance.on('call-rejected', () => {
      setIncomingCall(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [staffInfo?._id]);

  const answerCall = () => {
    if (incomingCall) {
      setSelectedBookingForChat(incomingCall.booking);
      setIncomingCallData(incomingCall); // Store the incoming call data
      setShowCall(true);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (socket && incomingCall) {
      socket.emit('reject-call', { to: incomingCall.from });
      setIncomingCall(null);
    }
  };

  const [routeInfo, setRouteInfo] = useState(null);
  const [locationWatchId, setLocationWatchId] = useState(null);

  const handleNavigate = async (booking) => {
    setSelectedBooking(booking);
    setRouteInfo(null);

    // 1. Get Staff's Current Location (Browser Geolocation) with high accuracy
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const start = [position.coords.latitude, position.coords.longitude];
          console.log(`Staff location: [${start[0]}, ${start[1]}]`);
          
          // 2. Geocode Patient Address
          await geocodeAndSetRoute(start, booking.address);
          
          // 3. Start watching position for real-time updates
          const watchId = navigator.geolocation.watchPosition(
            (newPosition) => {
              const newStart = [newPosition.coords.latitude, newPosition.coords.longitude];
              setCoordinates(prev => {
                if (prev.end) {
                  return { ...prev, start: newStart };
                }
                return prev;
              });
            },
            (error) => {
              console.error("Location watch error:", error);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
          );
          setLocationWatchId(watchId);
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMsg = "Could not get your location. ";
          if (error.code === 1) {
            errorMsg += "Please allow location access in your browser settings.";
          } else if (error.code === 2) {
            errorMsg += "Location unavailable. Please check your GPS/network.";
          } else {
            errorMsg += "Please try again.";
          }
          alert(errorMsg);
          // Fallback to Lahore default if permission denied
          const start = [31.5204, 74.3587];
          geocodeAndSetRoute(start, booking.address);
        },
        options
      );
    } else {
      alert("Geolocation is not supported by this browser. Please use a modern browser.");
      const start = [31.5204, 74.3587];
      geocodeAndSetRoute(start, booking.address);
    }
  };

  // Cleanup location watch when modal closes
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        setLocationWatchId(null);
      }
    };
  }, [locationWatchId]);

  const geocodeAndSetRoute = async (start, address) => {
    try {
      // Improved geocoding with multiple attempts
      let query = address.trim();
      
      // Add 'Pakistan' to context if missing to improve accuracy
      if (!query.toLowerCase().includes('pakistan')) {
        query = `${query}, Pakistan`;
      }

      // Try geocoding with Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=3&addressdetails=1&q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'HealthHopeCare/1.0 (healthhopecare24by7@gmail.com)'
        }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        // Use the first result (most relevant)
        const result = data[0];
        const end = [parseFloat(result.lat), parseFloat(result.lon)];
        
        // Verify coordinates are valid
        if (!isNaN(end[0]) && !isNaN(end[1]) && end[0] >= -90 && end[0] <= 90 && end[1] >= -180 && end[1] <= 180) {
          setCoordinates({ start, end });
          console.log(`Geocoded address: ${address} -> [${end[0]}, ${end[1]}]`);
        } else {
          throw new Error('Invalid coordinates');
        }
      } else {
        // Try alternative geocoding with just the address parts
        const addressParts = address.split(',').map(p => p.trim()).filter(p => p);
        if (addressParts.length > 0) {
          const lastPart = addressParts[addressParts.length - 1];
          const altQuery = `${lastPart}, Pakistan`;
          const altRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(altQuery)}`, {
            headers: {
              'User-Agent': 'HealthHopeCare/1.0 (healthhopecare24by7@gmail.com)'
            }
          });
          const altData = await altRes.json();
          
          if (altData && altData.length > 0) {
            const end = [parseFloat(altData[0].lat), parseFloat(altData[0].lon)];
            setCoordinates({ start, end });
            console.log(`Geocoded with alternative method: ${altQuery} -> [${end[0]}, ${end[1]}]`);
          } else {
            throw new Error('Could not geocode address');
          }
        } else {
          throw new Error('Invalid address format');
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert(`Could not find exact location for: ${address}\n\nPlease use "Open in Google Maps" button for accurate navigation.`);
      // Don't set invalid coordinates - let user use Google Maps instead
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome, {staffInfo?.name} 👋</h1>
          <p className="text-slate-600 text-lg">Staff Dashboard - Manage your assigned bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="text-blue-600" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Assigned</div>
                <div className="text-3xl font-bold text-slate-800">{bookings.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="text-yellow-600" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Pending</div>
                <div className="text-3xl font-bold text-slate-800">{pendingBookings}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Confirmed</div>
                <div className="text-3xl font-bold text-slate-800">{confirmedBookings}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Bell className="text-purple-600" size={28} />
              </div>
              <div>
                <div className="text-sm text-slate-600">Notifications</div>
                <div className="text-3xl font-bold text-slate-800 relative">
                  {notifications.length}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-6 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="text-purple-600" size={24} />
              My Notifications
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.slice(0, 5).map((note) => (
                <div
                  key={note._id}
                  className={`p-4 rounded-lg border ${
                    note.read ? 'bg-slate-50 border-slate-200' : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{note.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!note.read && (
                      <button
                        onClick={async () => {
                          await fetch('/api/notifications/markRead', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: note._id }),
                          });
                          fetchNotifications();
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {notifications.length > 5 && (
              <div className="mt-4 text-center">
                <a
                  href="/notifications"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all notifications ({notifications.length})
                </a>
              </div>
            )}
          </div>
        )}

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <User className="text-blue-600" size={24} />
              My Assigned Bookings
            </h2>
            <button
              onClick={() => {
                if (staffInfo?._id) {
                  fetchAssignedBookings(staffInfo._id);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Clock size={16} />
              Refresh
            </button>
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="mx-auto mb-4 text-slate-300" size={64} />
              <p className="text-lg font-medium mb-2">No bookings assigned yet</p>
              <p className="text-sm">You'll see your assigned bookings here when admin assigns them to you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings
                .sort((a, b) => {
                  // Sort by status: Pending first, then Confirmed, then Cancelled
                  const statusOrder = { Pending: 1, Confirmed: 2, Cancelled: 3 };
                  return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
                })
                .map((booking) => (
                <div 
                  key={booking._id} 
                  className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
                    booking.status === 'Pending' 
                      ? 'border-yellow-300 bg-yellow-50/30' 
                      : booking.status === 'Confirmed'
                      ? 'border-green-300 bg-green-50/30'
                      : 'border-red-300 bg-red-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        booking.status === 'Pending' 
                          ? 'bg-yellow-100' 
                          : booking.status === 'Confirmed'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        <User className={`${
                          booking.status === 'Pending' 
                            ? 'text-yellow-600' 
                            : booking.status === 'Confirmed'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`} size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{booking.name}</h3>
                        <p className="text-sm text-slate-600 font-medium">{booking.service}</p>
                        <p className="text-xs text-slate-500 mt-1">Booking ID: {booking._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                        : booking.status === 'Cancelled' 
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2 rounded-lg">
                      <Phone size={16} className="text-blue-500" />
                      <a href={`tel:${booking.phone}`} className="hover:text-blue-600 font-medium">
                        {booking.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2 rounded-lg">
                      <Calendar size={16} className="text-blue-500" />
                      <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                      <span className="text-slate-400">•</span>
                      <Clock size={14} className="text-blue-500" />
                      <span className="font-medium">{booking.time || 'Not specified'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600 md:col-span-2 bg-white p-2 rounded-lg">
                      <MapPin size={16} className="mt-1 text-blue-500 flex-shrink-0" />
                      <span className="font-medium">{booking.address}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-3 justify-end">
                    <button
                      onClick={() => {
                        setSelectedBookingForChat(booking);
                        setShowChat(true);
                      }}
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium shadow-sm hover:shadow-md"
                    >
                      <MessageCircle size={18} />
                      Chat
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBookingForChat(booking);
                        setShowCall(true);
                      }}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium shadow-sm hover:shadow-md"
                    >
                      <Phone size={18} />
                      Call
                    </button>
                    <button
                      onClick={() => {
                        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.address)}`;
                        window.open(googleMapsUrl, '_blank');
                      }}
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm hover:shadow-md"
                    >
                      <MapPin size={18} />
                      Google Maps
                    </button>
                    <button
                      onClick={() => handleNavigate(booking)}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
                    >
                      <Navigation size={18} />
                      Live Navigation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div>
                <h3 className="text-xl font-bold">Live Navigation to Patient</h3>
                <p className="text-sm text-blue-100 flex items-center gap-2 mt-1">
                  <User size={14} />
                  {selectedBooking.name} • {selectedBooking.service}
                </p>
                <p className="text-xs text-blue-200 mt-1 flex items-center gap-1">
                  <MapPin size={12} />
                  {selectedBooking.address}
                </p>
              </div>
              <button
                onClick={() => {
                  if (locationWatchId !== null) {
                    navigator.geolocation.clearWatch(locationWatchId);
                    setLocationWatchId(null);
                  }
                  setSelectedBooking(null);
                  setCoordinates({ start: null, end: null });
                  setRouteInfo(null);
                }}
                className="p-2 hover:bg-white/20 rounded-full transition text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 relative flex flex-col">
              {coordinates.start && coordinates.end ? (
                <>
                  <div className="p-4 bg-blue-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="font-medium text-slate-700">Your Location</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                          <span className="font-medium text-slate-700">Patient Location</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedBooking.address)}`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                      >
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <MapComponent
                      startLocation={coordinates.start}
                      endLocation={coordinates.end}
                      showRoute={true}
                      staffName="You (Staff)"
                      patientName={selectedBooking.name}
                      onRouteCalculated={(info) => {
                        setRouteInfo(info);
                      }}
                    />
                  </div>
                  {routeInfo && (
                    <div className="p-4 bg-blue-50 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-blue-600 font-semibold">Distance</div>
                          <div className="text-lg font-bold text-slate-800">{routeInfo.distance} km</div>
                        </div>
                        <div>
                          <div className="text-blue-600 font-semibold">Estimated Time</div>
                          <div className="text-lg font-bold text-slate-800">~{routeInfo.duration} min</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-slate-600">Getting your location and patient address...</p>
                  <p className="text-xs text-slate-400 mt-2">Please allow location access</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {showChat && selectedBookingForChat && (
        <ChatWindow
          bookingId={selectedBookingForChat._id}
          booking={selectedBookingForChat}
          currentUser={staffInfo}
          onClose={() => {
            setShowChat(false);
            setSelectedBookingForChat(null);
          }}
        />
      )}

      {/* Video Call */}
      {showCall && selectedBookingForChat && (
        <VideoCall
          booking={selectedBookingForChat}
          currentUser={staffInfo}
          incomingCallData={incomingCallData}
          onClose={() => {
            setShowCall(false);
            setSelectedBookingForChat(null);
            setIncomingCallData(null);
          }}
          onCallEnd={() => {
            setShowCall(false);
            setSelectedBookingForChat(null);
            setIncomingCallData(null);
          }}
        />
      )}

      {/* Incoming Call Notification */}
      {incomingCall && !showCall && (
        <div className="fixed bottom-4 right-4 z-[10000] animate-bounce">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-500 min-w-[320px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone size={24} className="text-green-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">
                  Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
                </h4>
                <p className="text-sm text-gray-600">{incomingCall.callerName}</p>
                <p className="text-xs text-gray-500">{incomingCall.booking?.service}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={rejectCall}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <PhoneOff size={18} />
                Reject
              </button>
              <button
                onClick={answerCall}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
