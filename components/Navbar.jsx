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
            {isStaff && <span className="ml-3 text-sm text-white/90">Staff</span>}
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
            <div className="ml-4">
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
