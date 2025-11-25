'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface SurveyErrorFallbackProps {
  onReset?: () => void;
}

export default function SurveyErrorFallback({ onReset }: SurveyErrorFallbackProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[70] max-w-sm">
      <div className="bg-white border border-red-200 rounded-lg shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Survey Unavailable
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              We couldn't load the feedback survey. Don't worry - your work is not affected.
            </p>
            {onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}