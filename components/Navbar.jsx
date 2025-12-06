'use client';
import Link from 'next/link';
import { Menu, X, Bell } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const notesRef = useRef();

  useEffect(() => {
    let user = null;
    try {
      const raw = localStorage.getItem('currentUser');
      user = raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Invalid currentUser in localStorage', err);
      user = null;
    }
    if (user) {
      setIsLoggedIn(true);
      setIsAdmin(user.role === 'admin' || user.role === 'owner');
      setIsStaff(user.role === 'staff');
    }
  }, []);

  // Keep navbar in sync when localStorage changes (login/logout, switch accounts)
  useEffect(() => {
    function updateUserFromStorage() {
      try {
        const raw = localStorage.getItem('currentUser');
        const user = raw ? JSON.parse(raw) : null;
        if (user) {
          setIsLoggedIn(true);
          setIsAdmin(user.role === 'admin' || user.role === 'owner');
          setIsStaff(user.role === 'staff');
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
          setIsStaff(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsStaff(false);
      }
    }

    updateUserFromStorage();
    window.addEventListener('storage', updateUserFromStorage);
    window.addEventListener('focus', updateUserFromStorage);
    return () => {
      window.removeEventListener('storage', updateUserFromStorage);
      window.removeEventListener('focus', updateUserFromStorage);
    };
  }, []);

  // fetch notifications for logged-in users
  useEffect(() => {
    if (!isLoggedIn) return;
    let mounted = true;
    async function loadNotes() {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
          setNotifications([]);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        const notesArray = Array.isArray(data) ? data : [];
        setNotifications(notesArray);
        setUnreadCount(notesArray.filter(n => !n.read).length);
      } catch (err) {
        console.error('Failed to load notifications', err);
        setNotifications([]);
        setUnreadCount(0);
      }
    }
    loadNotes();
    const id = setInterval(loadNotes, 30000); // refresh every 30s
    return () => { mounted = false; clearInterval(id); };
  }, [isLoggedIn]);

  // close dropdown when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (notesRef.current && !notesRef.current.contains(e.target)) setShowNotes(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/booking', label: 'Booking' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <nav className="bg-blue-400 text-white shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
        <h1 className="text-2xl font-bold tracking-wide">
          <Link href={'/'}>
            <Image src={'/logo.png'} alt="Logo" width={200} height={200} className='inline mr-2 w-30' />
          </Link>
        </h1>
        <div className="md:hidden cursor-pointer" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-lg font-medium items-center">
          {navLinks.map(({ href, label }) => (
            <li key={label}>
              <Link href={href} className="hover:text-sky-200 transition duration-200">
                {label}
              </Link>
            </li>
          ))}

          {isAdmin && (
            <li>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block py-2 text-yellow-300 font-semibold"
              >
                Admin
              </Link>
            </li>
          )}

          {(isAdmin || isStaff) && (
            <li>
              <Link href="/notifications" className="hover:text-sky-200 transition duration-200">Notifications</Link>
            </li>
          )}

        </ul>
        <div className="hidden md:block">
          <div className="flex items-center gap-4">
            {!isAdmin && <Link href={'/booking'} className='bg-white p-2 rounded-xl px-6 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all duration-300'>Appointment</Link>}
            {isStaff && <Link className="ml-3 text-sm text-white/90" href={'/staff'}>Staff</Link>}
            {isLoggedIn && !isStaff && !isAdmin && (
              <span className="ml-3 text-sm text-white/90">User</span>
            )}

            {/* Notification bell */}
            <div className="relative" ref={notesRef}>
              <button onClick={() => setShowNotes(s => !s)} className="p-2 rounded-full hover:bg-white/10">
                <Bell className="text-white" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">{unreadCount}</span>
                )}
              </button>

              {showNotes && (
                <div className="absolute right-0 mt-2 w-96 bg-white text-black rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b font-medium">Notifications</div>
                  <div className="max-h-80 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="p-3 text-sm text-gray-600">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`p-3 border-b flex justify-between items-start ${n.read ? '' : 'bg-emerald-50'}`}>
                          <div className="mr-3">
                            <div className="text-sm">{n.message}</div>
                            {n.booking && <div className="text-xs text-gray-500">Booking: {n.booking._id}</div>}
                            <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                          <div>
                            {!n.read && <button onClick={async () => {
                              await fetch('/api/notifications/markRead', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: n._id })});
                              setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
                              setUnreadCount(c => Math.max(0, c - 1));
                            }} className="text-xs text-blue-600">Mark</button>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 text-center border-t">
                    <Link href="/notifications" className="text-sm text-blue-600">View all</Link>
                  </div>
                </div>
              )}
            </div>
            {/* show login/logout on the right for desktop too */}
            <div className="ml-4 flex items-center gap-3">
              {/* WhatsApp quick contact (uses phone from Footer: +92 306 1706085 -> wa.me/923061706085) */}
              {!isStaff && !isAdmin && <Link
                href="https://wa.me/923061706085?text=Hello%20Health%20Hope%20Care"
                target="_blank"
                rel="noopener noreferrer"
                title="Contact us on WhatsApp"
                aria-label="Contact us on WhatsApp"
                className=" flex items-center justify-center  text-green-600 rounded-full scale-120 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 animate-bounce" fill="currentColor" aria-hidden>
                  <path d="M20.52 3.48A11.85 11.85 0 0 0 12.01.1C6.19.1 1.62 4.68 1.62 10.5c0 1.86.48 3.66 1.39 5.26L.1 23.2l7.74-2.31c1.56.86 3.34 1.31 5.17 1.31 5.82 0 10.4-4.57 10.4-10.4 0-2.79-1.09-5.41-3.89-7.3zM12.01 21.6c-1.5 0-2.96-.4-4.22-1.16l-.3-.18-4.6 1.37 1.34-4.22-.2-.34A8.05 8.05 0 0 1 3 10.5c0-4.48 3.64-8.12 8.01-8.12 2.14 0 4.15.83 5.66 2.34 1.5 1.5 2.33 3.52 2.33 5.67 0 4.48-3.64 8.12-8.01 8.12z" />
                  <path d="M17.57 14.28c-.34-.17-2.02-.99-2.33-1.1-.31-.11-.53-.17-.75.17-.22.34-.86 1.1-1.05 1.32-.19.22-.38.25-.72.09-.34-.17-1.43-.53-2.72-1.67-1.01-.91-1.69-2.03-1.89-2.37-.2-.34-.02-.52.14-.69.14-.14.31-.38.47-.57.15-.19.2-.34.3-.56.1-.22.05-.41-.02-.57-.07-.17-.75-1.8-1.03-2.46-.27-.64-.54-.55-.75-.56-.19-.01-.41-.01-.63-.01-.22 0-.57.08-.87.41-.3.33-1.15 1.12-1.15 2.72 0 1.59 1.18 3.13 1.34 3.35.17.22 2.33 3.7 5.65 5.2 3.32 1.5 3.32 1.0 3.92.94.6-.07 1.95-.8 2.23-1.57.28-.77.28-1.43.2-1.57-.08-.14-.31-.22-.65-.39z" fill="#fff"/>
                </svg>
              </Link>}
              

              {isLoggedIn ? (
                <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded-lg">Logout</button>
              ) : (
                <Link href="/login" className="bg-white text-blue-600 px-3 py-1 rounded-lg">Login</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <ul className="md:hidden bg-blue-500 px-4 py-2 space-y-2">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="block py-2 hover:text-sky-200"
              >
                {label}
              </Link>
            </li>
          ))}

          {isAdmin && (
            <li>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block py-2 text-yellow-300 font-semibold"
              >
                Admin
              </Link>
            </li>
          )}

          <li>
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left py-2 hover:text-sky-200"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block py-2 hover:text-sky-200"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
