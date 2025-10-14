'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    // { href: '/', label: 'Blogs' },
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

          {/* <li>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="hover:text-sky-200 transition duration-200"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="hover:text-sky-200 transition">
                Login
              </Link>
            )}
          </li> */}

        </ul>
        <div className="hidden md:block">
          <Link href={'/booking'} className='bg-white p-2 rounded-xl px-6 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all duration-300'>Appointment</Link>
          {isStaff && <span className="ml-3 text-sm text-white/90">Staff</span>}
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
