'use client';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // ✅ Automatically add default admin on first load
  async function LoginUser(params) {
    try {
      const response = await fetch('/api/loginUser', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(`❌ ${result.error}`);
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(result));
      alert(`✅ Welcome, ${result.role === 'admin' ? 'Admin' : result.name}!`);
      window.location.href = result.role === 'admin' ? '/admin' : result.role === 'staff' ? '/staff' : '/';

    } catch (err) {
      setError('❌ Failed to login. Try again later.');
    }
  }

   async function CreateUser(params) {
      try {
        // Instead of creating user directly, request an OTP for account creation
        const identifier = formData.email;
        const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, registration: { name: formData.name, email: formData.email, password: formData.password, role: 'user' } })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request signup OTP');
        // Switch to OTP mode and prefill identifier so user can enter code
        setOtpMode(true);
        setOtpIdentifier(identifier);
        setOtpRequested(true);
        alert('✅ OTP sent to your email. Enter the code to complete signup.');
      } catch (error) {
        alert(`❌ ${error.message}`);
      }
    
   }

  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = existingUsers.some(user => user.email === 'admin@gmail.com');

    if (!adminExists) {
      existingUsers.push({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
      });
      localStorage.setItem('users', JSON.stringify(existingUsers));
    }
  }, []);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setError('');
  };

  const toggleOtpMode = () => {
    setOtpMode(!otpMode);
    setOtpRequested(false);
    setOtpIdentifier('');
    setOtpCode('');
    setError('');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };


  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          {isLogin ? 'Login to Your Account' : 'Create an Account'}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5">
          <div className="flex flex-col gap-3 mb-4">
            <a href="/api/auth/google" className="w-full inline-flex items-center justify-center gap-3 border border-slate-300 rounded-lg px-4 py-3 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Continue with Google</span>
            </a>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
          {otpMode ? (
            <>
              <div>
                <label className="block text-sm text-gray-700">Email or Phone</label>
                <input
                  type="text"
                  name="otpIdentifier"
                  value={otpIdentifier}
                  onChange={(e) => setOtpIdentifier(e.target.value)}
                  required
                  placeholder="you@example.com or +92306..."
                  className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {!otpRequested ? (
                <button type="button" onClick={async () => {
                  setError('');
                  try {
                    const res = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: otpIdentifier }) });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
                    setOtpRequested(true);
                    alert('OTP sent if provider configured.');
                  } catch (err) { setError(err.message || 'Failed to request OTP'); }
                }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold rounded-md transition duration-300">Request OTP</button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-700">Enter Code</label>
                    <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full mt-1 px-4 py-2 border rounded-md" />
                  </div>
                  <button type="button" onClick={async () => {
                    setError('');
                    try {
                      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: otpIdentifier, code: otpCode }), credentials: 'include' });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'OTP verify failed');
                      localStorage.setItem('currentUser', JSON.stringify(data));
                      window.location.href = data.role === 'admin' ? '/admin' : data.role === 'staff' ? '/staff' : '/';
                    } catch (err) { setError(err.message || 'Failed to verify OTP'); }
                  }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold rounded-md transition duration-300">Verify & Login</button>
                </>
              )}
            </>
          ) : !isLogin && (
            <div>
              <label className="block text-sm text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={isLogin ? LoginUser : CreateUser}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold rounded-md transition duration-300"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={toggleMode}
            className="text-blue-600 font-medium hover:underline"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
        <p className="text-sm text-center mt-2">
          <button onClick={toggleOtpMode} className="text-emerald-600 hover:underline">{otpMode ? 'Use password' : 'Use OTP'}</button>
        </p>
      </div>
    </div>
  );
}
