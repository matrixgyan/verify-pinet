
'use client';

import { useState } from 'react';

interface KYCFormProps {
  onNext: (data: any) => void;
}

export default function KYCForm({ onNext }: KYCFormProps) {
  const [kycName, setKycName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kycName.trim()) {
      onNext({ kycName: kycName.trim() });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-user-line text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification</h2>
        <p className="text-gray-600">Enter your Pi Network KYC name</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name (as registered in Pi Network KYC)
          </label>
          <input
            type="text"
            value={kycName}
            onChange={(e) => setKycName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <i className="ri-information-line text-yellow-600 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Important</h3>
              <p className="text-sm text-yellow-700">
                Please enter your exact name as it appears in your Pi Network KYC verification.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!kycName.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          Next Step
        </button>
      </form>
    </div>
  );
}
