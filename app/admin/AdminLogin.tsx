'use client';

import { useState } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check credentials
    if (email === 'md16201620@gmail.com' && password === 'admin') {
      // Create session
      const session = {
        email: email,
        loginTime: new Date().toISOString(),
        expires: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('adminSession', JSON.stringify(session));
      
      setTimeout(() => {
        setLoading(false);
        onLogin();
      }, 1000);
    } else {
      setTimeout(() => {
        setError('Invalid email or password');
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shield-user-line text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h1>
            <p className="text-gray-600">Pi Network Balance Claim System</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-colors"
                placeholder="Enter admin email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <i className="ri-information-line text-yellow-600 text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Admin Access</h3>
                <p className="text-sm text-yellow-700">
                  This portal is restricted to authorized administrators only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}