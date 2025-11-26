'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

interface SurveySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurveySuccessModal({ isOpen, onClose}: SurveySuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after modal mounts
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-close after 5 seconds (optional)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
        //To close current modal
        onClose();
        // //To close parent modal
        // closeModal()
    }, 300); // Wait for fade-out animation
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl transition-all duration-500 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Animated checkmark with sparkles */}
          <div className="relative inline-block mb-6">
            {/* Sparkles animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles 
                className={`absolute text-yellow-400 transition-all duration-1000 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{
                  top: '-10px',
                  left: '-10px',
                  animation: isVisible ? 'sparkle 2s ease-in-out infinite' : 'none'
                }}
                size={20}
              />
              <Sparkles 
                className={`absolute text-yellow-400 transition-all duration-1000 delay-100 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{
                  top: '-10px',
                  right: '-10px',
                  animation: isVisible ? 'sparkle 2s ease-in-out infinite 0.3s' : 'none'
                }}
                size={16}
              />
              <Sparkles 
                className={`absolute text-yellow-400 transition-all duration-1000 delay-200 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  animation: isVisible ? 'sparkle 2s ease-in-out infinite 0.6s' : 'none'
                }}
                size={18}
              />
            </div>

            {/* Checkmark circle */}
            <div 
              className={`relative transition-all duration-700 ${
                isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}
            >
              <CheckCircle2 
                size={80} 
                className="text-green-500"
                strokeWidth={2}
              />
              
              {/* Animated ring */}
              <div 
                className={`absolute inset-0 rounded-full border-4 border-green-300 transition-all duration-1000 ${
                  isVisible ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
                }`}
              />
            </div>
          </div>

          {/* Text content with staggered animation */}
          <h2 
            className={`text-3xl font-bold text-gray-900 mb-3 transition-all duration-500 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Thank You! 🎉
          </h2>
          
          <p 
            className={`text-gray-600 mb-6 transition-all duration-500 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Your feedback has been successfully submitted. We truly appreciate you taking the time to help us improve HR Houdini!
          </p>

          {/* Action button */}
          <button
            onClick={handleClose}
            className={`w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            Continue
          </button>

          {/* Auto-close hint */}
          <p 
            className={`text-xs text-gray-400 mt-4 transition-all duration-500 delay-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            This will close automatically in 5 seconds
          </p>
        </div>
      </div>

      {/* Confetti-like particles (optional enhancement) */}
      {isVisible && (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full animate-float"
              style={{
                left: `${50 + (Math.random() - 0.5) * 40}%`,
                top: `${50 + (Math.random() - 0.5) * 40}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}