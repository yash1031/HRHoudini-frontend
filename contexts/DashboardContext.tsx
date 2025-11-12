// contexts/DashboardContext.tsx
// ============================================
// DASHBOARD CONTEXT WITH CENTRALIZED TYPES
// ============================================

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { DashboardData } from '@/types/dashboard';

// Re-export for convenience
export type { DashboardData };

// ============================================
// CONTEXT TYPE DEFINITION
// ============================================

interface DashboardContextType {
  // Dashboard data
  dashboard_data: DashboardData | null;
  setDashboard_data: (data: DashboardData | null) => void;
  
  // Loading & error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorDash: string | null;
  setErrorDash: (error: string | null) => void;
  
  // Sample questions (for chat)
  sample_questions: string[] | null;
  setSample_questions: (questions: string[] | null) => void;
  
  // Dashboard code (legacy - can be removed if not used)
  dashboardCode: string | null;
  setDashboardCode: (code: string | null) => void;
  
  // WebSocket instance (legacy - can be removed if not used)
  wb: any;
  setWb: any;
}

// ============================================
// CREATE CONTEXT
// ============================================

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

/**
 * Dashboard Context Provider
 * Manages global state for dashboard data, loading, and errors
 */
export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Dashboard data
  const [dashboard_data, setDashboard_data] = useState<DashboardData | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorDash, setErrorDash] = useState<string | null>(null);
  
  // Chat-related
  const [sample_questions, setSample_questions] = useState<string[] | null>(null);
  
  // Legacy fields (can be removed if not used)
  const [dashboardCode, setDashboardCode] = useState<string | null>(null);
  const [wb, setWb] = useState<any>(null);

  return (
    <DashboardContext.Provider
      value={{
        dashboard_data,
        setDashboard_data,
        isLoading,
        setIsLoading,
        errorDash,
        setErrorDash,
        sample_questions,
        setSample_questions,
        dashboardCode,
        setDashboardCode,
        wb,
        setWb,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * Hook to access dashboard context
 * Must be used within DashboardProvider
 */
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};