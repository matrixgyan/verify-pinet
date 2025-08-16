'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      const now = new Date().getTime();
      if (now < session.expires) {
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('adminSession');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoggedIn ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}