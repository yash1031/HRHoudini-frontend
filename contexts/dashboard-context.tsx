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

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  industryStandardContent?: string
  messageType?: "history" | "current" 
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

  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>

  // Filters (from backend)
  filters: any[];
  setFilters: (filters: any[]) => void;
  dateFilter: any | null;
  setDateFilter: (dateFilter: any | null) => void;
  currentDateRange: { start: string; end: string } | null;
  setCurrentDateRange: (range: { start: string; end: string } | null) => void;

  // Legacy loading & error (kept for backward compatibility)
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorDash: string | null;
  setErrorDash: (error: string | null) => void;
  
  // Sample questions (for chat)
  recommendedQuestions: string[] ;
  setRecommendedQuestions: (recommendedQuestions: string[]) => void;

  athenaCreated: boolean;
  setAthenaCreated: (athenaCreated: boolean) => void;
}

// ============================================
// CREATE CONTEXT
// ============================================

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // const [cardsState, setCardsState] = useState(() => {
  //   // Initialize from sessionStorage
  //   try {
  //     console.log("cardsState fetched From session Storage")
  //     const saved = sessionStorage.getItem('cardsState');
  //     return saved ? JSON.parse(saved) : { data: [], loading: false, error: null };
  //   } catch {
  //     console.log("Error loading cardsState from dashboard-context")
  //     return { data: [], loading: false, error: null };
  //   }
  // });

  // const [chartsState, setChartsState] = useState(() => {
  //   // Initialize from sessionStorage
  //   try {
  //     console.log("chartsState fetched From session Storage")
  //     const saved = sessionStorage.getItem('chartsState');
  //     return saved ? JSON.parse(saved) : { data: [], loading: false, error: null };
  //   } catch {
  //     console.log("Error loading chartsState from dashboard-context")
  //     return { data: [], loading: false, error: null };
  //   }
  // });
  
  // const [metadata, setMetadata] = useState<any>(()=>{
  //   try {
  //     console.log("metadata fetched From session Storage")
  //     const saved = sessionStorage.getItem('metadata');
  //     return saved ? JSON.parse(saved) : { "filename":"", "totalRows":""};
  //   } catch {
  //     console.log("Error loading metadata from dashboard-context")
  //     return { "filename":"", "totalRows":""};
  //   }
  // });

  // const [messages, setMessages] = useState<Message[]>(()=>{
  //   // Initialize from sessionStorage
  //   try {
  //     console.log("fetching chats from session Storage")
  //     const saved = sessionStorage.getItem('chats');
  //     return saved ? JSON.parse(saved) : [];
  //   } catch {
  //     console.log("Error fetching chats from dashboard-context")
  //     return [];
  //   }
  // })
  const [cardsState, setCardsState] = useState<SectionState<KPICard[]>>({
    data: [],
    loading: false,
    error: null
  });

  const [chartsState, setChartsState] = useState<SectionState<ChartConfig[]>>({
    data: [],
    loading: false,
    error: null
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const [metadata, setMetadata] = useState<any>({
    filename: "",
    totalRows: ""
  });

  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([]);

  // Filters state
  const [filters, setFilters] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<any | null>(null);
  const [currentDateRange, setCurrentDateRange] = useState<{ start: string; end: string } | null>(null);

  // const [suggestedQueries, setSuggestedQueries]= useState<String[]>([]);

  // Add a single useEffect to hydrate from sessionStorage after mount:
  useEffect(() => {
    console.log("Running dashboard-context useEffect")
    // Only run on client side after mount
    if (typeof window !== 'undefined') {
      try {
        const savedCards = sessionStorage.getItem('cardsState');
        if (savedCards) {
          // console.log("cardsState fetched from sessionStorage");
          setCardsState(JSON.parse(savedCards));
        }

        const savedCharts = sessionStorage.getItem('chartsState');
        if (savedCharts) {
          // console.log("chartsState fetched from sessionStorage");
          setChartsState(JSON.parse(savedCharts));
        }

        const savedMetadata = sessionStorage.getItem('metadata');
        if (savedMetadata) {
          // console.log("metadata fetched from sessionStorage");
          setMetadata(JSON.parse(savedMetadata));
        }

        const savedChats = sessionStorage.getItem('chats');
        console.log("savedChats are", savedChats)
        if (savedChats) {
          console.log("chats fetched from sessionStorage");
          setMessages(JSON.parse(savedChats));
        }

        const savedRecommendedQuestions = sessionStorage.getItem('recommendedQuestions');
        console.log("savedRecommendedQuestions are", savedRecommendedQuestions)
        if (savedRecommendedQuestions) {
          console.log("recommendedQuestions fetched from sessionStorage");
          setRecommendedQuestions(JSON.parse(savedRecommendedQuestions));
        }
      } catch (error) {
        console.error("Error loading from sessionStorage:", error);
      }
    }
  }, []); // Empty dependency array - runs once after mount

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

  // Save cardsState to sessionStorage whenever it changes
  useEffect(() => {
    console.log("Saving metadata to sessionStorage");
    sessionStorage.setItem("metadata", JSON.stringify(metadata));
  }, [metadata]);

  // Save recommendedQuestions to sessionStorage whenever it changes
  useEffect(() => {
    console.log("Saving recommendedQuestions to sessionStorage");
    sessionStorage.setItem("recommendedQuestions", JSON.stringify(recommendedQuestions));
  }, [recommendedQuestions]);
  
  const [drilldownsState, setDrilldownsState] = useState<DrilldownState>({});
  
  const [athenaCreated, setAthenaCreated] = useState<boolean>(true);
  
  // Legacy states
  const [isLoading, setIsLoading] = useState(false);
  const [errorDash, setErrorDash] = useState<string | null>(null);

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
        filters,
        setFilters,
        dateFilter,
        setDateFilter,
        currentDateRange,
        setCurrentDateRange,
        isLoading,
        setIsLoading,
        errorDash,
        setErrorDash,
        recommendedQuestions,
        setRecommendedQuestions,
        athenaCreated,
        setAthenaCreated,
        messages,
        setMessages,
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