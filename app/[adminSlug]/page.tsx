'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from '../admin/AdminLogin';
import AdminDashboard from '../admin/AdminDashboard';

export async function generateStaticParams() {
  return [
    { adminSlug: 'admin' },
    { adminSlug: 'liza' },
    { adminSlug: 'manager' },
  ];
}

export default function CustomAdminPage({ params }: { params: { adminSlug: string } }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isValidAdmin, setIsValidAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if this slug matches the admin settings
    const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{"customUrl":"admin","enableFooterIcon":true}');
    
    if (params.adminSlug === adminSettings.customUrl) {
      setIsValidAdmin(true);
      
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
    } else {
      // Invalid admin URL, redirect to 404
      router.push('/not-found');
    }
    
    setLoading(false);
  }, [params.adminSlug, router]);

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

  if (!isValidAdmin) {
    return null; // Will redirect to 404
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