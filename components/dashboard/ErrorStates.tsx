// components/dashboard/ErrorStates.tsx
// ============================================
// BEAUTIFUL ERROR STATE DISPLAYS
// ============================================

"use client";

import React from 'react';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Card Generation Error Display
 */
export const CardsError: React.FC<ErrorDisplayProps> = ({ 
  message = "Unable to generate KPI cards",
  onRetry 
}) => (
  <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
    {Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="bg-red-50 rounded-lg shadow-md p-6 border-l-4 border-red-400">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            {idx === 0 && (
              <p className="text-xs text-red-600 font-medium">Failed to load</p>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Chart Generation Error Display
 */
export const ChartsError: React.FC<ErrorDisplayProps> = ({ 
  message = "Unable to generate charts",
  onRetry 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div key={idx} className="bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-700 font-semibold mb-2">Chart Generation Failed</p>
          <p className="text-sm text-red-600 text-center max-w-xs">
            {idx === 0 ? message : "Unable to display this chart"}
          </p>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Inline Section Error (smaller, for partial failures)
 */
export const SectionError: React.FC<ErrorDisplayProps> = ({ 
  message = "Failed to load section",
  onRetry 
}) => (
  <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-6 flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-red-800">
          {message}
        </p>
        <p className="text-xs text-red-600 mt-1">
          Some data could not be generated. Other sections are still available.
        </p>
      </div>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    )}
  </div>
);
/**
 * Inline Complete Failure (smaller, for partial failures)
 */
export const CompleteFailure: React.FC<ErrorDisplayProps> = ({ 
  message = "Failed to load section",
  onRetry 
}) => (
  <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-6 flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-red-800">
          {message}
        </p>
        <p className="text-xs text-red-600 mt-1">
          Sorry for the inconvinience caused. You can try uploading the file again.
        </p>
      </div>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    )}
  </div>
);