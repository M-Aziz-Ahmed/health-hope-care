'use client';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  // ✅ Automatically add default admin on first load
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (isLogin) {
      const found = users.find(
        (user) =>
          user.email === formData.email && user.password === formData.password
      );

      if (found) {
        localStorage.setItem('currentUser', JSON.stringify(found));
        alert(`✅ Welcome, ${found.role === 'admin' ? 'Admin' : found.name}!`);
        window.location.href = found.role === 'admin' ? '/admin' : '/';
      } else {
        setError('❌ Incorrect email or password');
      }
    } else {
      const userExists = users.some((u) => u.email === formData.email);
      if (userExists) {
        setError('❌ Email already registered');
        return;
      }

      const newUser = { ...formData, role: 'user' };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      alert('✅ Account created! Now you can login.');
      setIsLogin(true);
    }
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
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
            type="submit"
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
      </div>
    </div>
  );
}
