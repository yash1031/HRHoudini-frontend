// components/dashboard/HTMLReportModal.tsx
"use client";

import React from 'react';
import { X } from 'lucide-react';

interface HTMLReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  reportTitle?: string;
  reportDescription?: string;
  isLoading?: boolean;
  error?: string | null;
}

export const HTMLReportModal: React.FC<HTMLReportModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  reportTitle,
  reportDescription,
  isLoading = false,
  error = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {reportTitle || 'Dashboard Report'}
            </h2>
            {reportDescription && (
              <p className="text-sm text-gray-500 mt-1">
                {reportDescription}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Error Loading Dashboard
                </h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              title={reportTitle || "Dashboard Report"}
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
};