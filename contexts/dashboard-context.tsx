"use client";

// contexts/DashboardContext.tsx
// ============================================
// ENHANCED DASHBOARD CONTEXT WITH GRANULAR STATES
// ============================================

import React, { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import type { DashboardData, KPICard, ChartConfig } from '@/types/dashboard';

// Re-export for convenience
export type { DashboardData };

// ============================================
// SECTION STATE TYPES
// ============================================

export interface SectionState<T> {
  loading: boolean;
  error: string | null;
  data: T;
}

export interface DrilldownState {
  [chartId: string]: {
    loading: boolean;
    error: boolean;
  };
}

// ============================================
// CONTEXT TYPE DEFINITION
// ============================================

interface DashboardContextType {
  // Granular section states
  cardsState: SectionState<KPICard[]>;
  setCardsState: React.Dispatch<React.SetStateAction<SectionState<KPICard[]>>>;
  
  chartsState: SectionState<ChartConfig[]>;
  setChartsState: React.Dispatch<React.SetStateAction<SectionState<ChartConfig[]>>>;
  
  drilldownsState: DrilldownState;
  setDrilldownsState: React.Dispatch<React.SetStateAction<DrilldownState>>;
  
  // Metadata
  metadata: any;
  setMetadata: (metadata: any) => void;
  
  // Legacy compatibility - combines cards + charts
  // dashboard_data: DashboardData | null;
  // setDashboard_data: (data: DashboardData | null | ((prev: DashboardData | null) => DashboardData | null)) => void;
  
  // Legacy loading & error (kept for backward compatibility)
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorDash: string | null;
  setErrorDash: (error: string | null) => void;
  
  // Sample questions (for chat)
  sample_questions: string[] | null;
  setSample_questions: (questions: string[] | null) => void;

  athenaCreated: boolean;
  setAthenaCreated: (athenaCreated: boolean) => void;
  
  // Dashboard code (legacy)
  // dashboardCode: string | null;
  // setDashboardCode: (code: string | null) => void;
  
  // WebSocket instance (legacy)
  // wb: any;
  // setWb: any;
}

// ============================================
// CREATE CONTEXT
// ============================================

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cardsState, setCardsState] = useState(() => {
    // Initialize from sessionStorage
    try {
      console.log("cardsState fetched From session Storage")
      const saved = sessionStorage.getItem('cardsState');
      return saved ? JSON.parse(saved) : { data: [], loading: false, error: null };
    } catch {
      console.log("Error loading cardsState from dashboard-context")
      return { data: [], loading: false, error: null };
    }
  });

  const [chartsState, setChartsState] = useState(() => {
    // Initialize from sessionStorage
    try {
      console.log("chartsState fetched From session Storage")
      const saved = sessionStorage.getItem('chartsState');
      return saved ? JSON.parse(saved) : { data: [], loading: false, error: null };
    } catch {
      console.log("Error loading chartsState from dashboard-context")
      return { data: [], loading: false, error: null };
    }
  });

  // Save cardsState to sessionStorage whenever it changes
  useEffect(() => {
    console.log("Saving cardsState to sessionStorage");
    sessionStorage.setItem("cardsState", JSON.stringify(cardsState));
  }, [cardsState]);

  // Save chartsState to sessionStorage whenever it changes
  useEffect(() => {
    console.log("Saving chartsState to sessionStorage");
    sessionStorage.setItem("chartsState", JSON.stringify(chartsState));
  }, [chartsState]);
  
  const [drilldownsState, setDrilldownsState] = useState<DrilldownState>({});
  
  const [metadata, setMetadata] = useState<any>(()=>{
    try {
      console.log("metadata fetched From session Storage")
      const saved = sessionStorage.getItem('metadata');
      return saved ? JSON.parse(saved) : { "filename":"", "totalRows":""};
    } catch {
      console.log("Error loading metadata from dashboard-context")
      return { "filename":"", "totalRows":""};
    }
  });

  // Save cardsState to sessionStorage whenever it changes
  useEffect(() => {
    console.log("Saving metadata to sessionStorage");
    sessionStorage.setItem("metadata", JSON.stringify(metadata));
  }, [metadata]);
  
  const [athenaCreated, setAthenaCreated] = useState<boolean>(true);
  
  // Legacy states
  const [isLoading, setIsLoading] = useState(false);
  const [errorDash, setErrorDash] = useState<string | null>(null);
  const [sample_questions, setSample_questions] = useState<string[] | null>(null);

  // Computed dashboard_data from granular states
  const dashboard_data: DashboardData | null = 
    (cardsState.data.length > 0 || chartsState.data.length > 0 || metadata)
      ? {
          cards: cardsState.data,
          charts: chartsState.data,
          metadata: metadata || {}
        }
      : null;

  // Enhanced setDashboard_data that updates granular states
  // const setDashboard_data = (
  //   data: DashboardData | null | ((prev: DashboardData | null) => DashboardData | null)
  // ) => {
  //   if (typeof data === 'function') {
  //     // Handle functional update
  //     // Build current data from granular states
  //     const currentData: DashboardData | null = 
  //       (cardsState.data.length > 0 || chartsState.data.length > 0 || metadata)
  //         ? {
  //             cards: cardsState.data,
  //             charts: chartsState.data,
  //             metadata: metadata || {}
  //           }
  //         : null;
      
  //     const newData = data(currentData);
      
  //     if (newData) {
  //       setCardsState(prev => ({ ...prev, data: newData.cards || [] }));
  //       setChartsState(prev => ({ ...prev, data: newData.charts || [] }));
  //       setMetadata(newData.metadata || null);
  //     } else {
  //       setCardsState(prev => ({ ...prev, data: [] }));
  //       setChartsState(prev => ({ ...prev, data: [] }));
  //       setMetadata(null);
  //     }
  //   } else {
  //     // Handle direct update
  //     if (data) {
  //       setCardsState(prev => ({ ...prev, data: data.cards || [] }));
  //       setChartsState(prev => ({ ...prev, data: data.charts || [] }));
  //       setMetadata(data.metadata || null);
  //     } else {
  //       setCardsState(prev => ({ ...prev, data: [] }));
  //       setChartsState(prev => ({ ...prev, data: [] }));
  //       setMetadata(null);
  //     }
  //   }
  // };

  return (
    <DashboardContext.Provider
      value={{
        cardsState,
        setCardsState,
        chartsState,
        setChartsState,
        drilldownsState,
        setDrilldownsState,
        metadata,
        setMetadata,
        // dashboard_data,
        // setDashboard_data,
        isLoading,
        setIsLoading,
        errorDash,
        setErrorDash,
        sample_questions,
        setSample_questions,
        athenaCreated,
        setAthenaCreated,
        // dashboardCode,
        // setDashboardCode,
        // wb,
        // setWb,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};