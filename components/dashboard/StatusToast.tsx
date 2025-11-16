// components/dashboard/StatusToast.tsx
// ============================================
// STATUS NOTIFICATION TOAST COMPONENT
// ============================================

"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useDashboard } from '@/contexts/dashboard-context';

export type ToastType = 'loading' | 'success' | 'error';

interface StatusToastProps {
  type: ToastType;
  message: string;
  onDismiss?: () => void;
  persistent?: boolean; // Can't be dismissed when true
  autoHideDuration?: number; // Auto-hide after ms (for success/error)
}

/**
 * Beautiful Status Toast Notification
 * Shows below header, above dashboard content
 */
export const StatusToast: React.FC<StatusToastProps> = ({
  type,
  message,
  onDismiss,
  persistent = false,
  autoHideDuration = 0
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0 && type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, type, onDismiss]);

  if (!isVisible) return null;

  const styles = {
    loading: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
      text: 'text-blue-800',
      closeBtn: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      text: 'text-green-800',
      closeBtn: 'text-green-600 hover:text-green-800 hover:bg-green-100'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      text: 'text-red-800',
      closeBtn: 'text-red-600 hover:text-red-800 hover:bg-red-100'
    }
  };

  const style = styles[type];

  return (
    <div 
      className={`${style.bg} border rounded-lg px-4 py-3 mb-6 flex items-center justify-between shadow-sm animate-slideDown`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <p className={`text-sm font-medium ${style.text}`}>
          {message}
        </p>
      </div>
      
      {!persistent && onDismiss && (
        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
          className={`flex-shrink-0 ml-4 p-1 rounded-lg transition-colors ${style.closeBtn}`}
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * Toast Container - manages multiple toasts
 */
interface ToastContainerProps {
  cardsLoading: boolean;
  cardsError: string | null;
  chartsLoading: boolean;
  chartsError: string | null;
  onDismissCardsError?: () => void;
  onDismissChartsError?: () => void;
}

export const DashboardToasts: React.FC<ToastContainerProps> = ({
  cardsLoading,
  cardsError,
  chartsLoading,
  chartsError,
  onDismissCardsError,
  onDismissChartsError
}) => {
  const [showCardsSuccess, setShowCardsSuccess] = useState(false);
  const [showChartsSuccess, setShowChartsSuccess] = useState(false);
  const { athenaCreated} = useDashboard();

  // Show success toast when loading completes
  useEffect(() => {
    if (!cardsLoading && !cardsError && showCardsSuccess === false) {
      setShowCardsSuccess(true);
    }
  }, [cardsLoading, cardsError]);

  useEffect(() => {
    if (!chartsLoading && !chartsError && showChartsSuccess === false) {
      setShowChartsSuccess(true);
    }
  }, [chartsLoading, chartsError]);

  return (
    <div className="space-y-2">
      {/* Cards Status */}
      {cardsLoading && (
        <StatusToast
          type="loading"
          message="Loading KPI cards... meanwhile u can interact with the chat bot below"
          persistent={true}
        />
      )}
      {cardsError && !chartsError && (
        <StatusToast
          type="error"
          message={`Cards Error: ${cardsError}`}
          onDismiss={onDismissCardsError}
        />
      )}
      {!cardsLoading && !cardsError && showCardsSuccess && (
        <StatusToast
          type="success"
          message="KPI cards loaded successfully"
          autoHideDuration={3000}
          onDismiss={() => setShowCardsSuccess(false)}
        />
      )}

      {/* Charts Status */}
      {chartsLoading && (
        <StatusToast
          type="loading"
          message="Loading analytical charts... meanwhile u can interact with the chat bot below"
          persistent={true}
        />
      )}
      {chartsError && !cardsError && (
        <StatusToast
          type="error"
          message={`Charts Error: ${chartsError}.`}
          onDismiss={onDismissChartsError}
        />
      )}
      {!chartsLoading && !chartsError && showChartsSuccess && (
        <StatusToast
          type="success"
          message="Charts loaded successfully"
          autoHideDuration={3000}
          onDismiss={() => setShowChartsSuccess(false)}
        />
      )}
      {chartsError && cardsError && (
        <StatusToast
          type="error"
          message={`Error generating the dashboard ${athenaCreated? "but you can still interact with chatbot below or ": ', '} try uploading the file again`}
          onDismiss={onDismissCardsError}
        />
      )}
      {!athenaCreated && (
        <StatusToast
          type="error"
          message={`Error displaying the chat bot`}
          onDismiss={onDismissCardsError}
        />
      )}
    </div>
  );
};

// Add animation styles
export const ToastStyles = () => (
  <style jsx global>{`
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
  `}</style>
);