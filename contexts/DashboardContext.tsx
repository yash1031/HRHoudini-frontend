import React, { createContext, useContext, useState, ReactNode } from 'react';

// Insight structure
export interface Insight {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
}

// Card structure
export interface KPICard {
  title: string;
  value: string;
  field?: string;
  icon: string;
  color: string;
  note?: string;
  drillDown?: DrillDownData;
}

// Chart structure
export interface ChartDataItem {
  name: string;
  value: number;
  percentage?: number;
}

export interface ChartConfig {
  title: string;
  type: "bar" | "pie" | "line" | "horizontalBar";
  field: string;
  icon: string;
  data: ChartDataItem[];
  colors: string[];
  drillDown?: DrillDownData;
}

// DrillDown structure (nested cards, charts, insights)
export interface DrillDownData {
  cards?: KPICard[];
  charts?: ChartConfig[];
  insights?: Insight[];
}

// Analytics metadata
export interface AnalyticsMetadata {
  totalRows: number;
  totalColumns: number;
  generatedAt: string;
  numericFields: number;
  categoricalFields: number;
}

// Full dashboard data matching API response
export interface DashboardData {
  cards: KPICard[];
  charts: ChartConfig[];
  metadata: AnalyticsMetadata;
}

interface DashboardContextType {
  sample_questions: string[] | null;
  setSample_questions: (questions: string[] | null) => void;
  dashboardCode: string | null;
  setDashboardCode: (code: string | null) => void;
  dashboard_data: DashboardData | null;
  setDashboard_data: (data: DashboardData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorDash: string | null;
  setErrorDash: (errorDash: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardCode, setDashboardCode] = useState<string | null>(null);
  const [dashboard_data, setDashboard_data] = useState<DashboardData | null>(null);
  const [sample_questions, setSample_questions] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDash, setErrorDash] = useState<string | null>(null);

  return (
    <DashboardContext.Provider
      value={{
        dashboardCode,
        setDashboardCode,
        dashboard_data,
        sample_questions, 
        setSample_questions,
        setDashboard_data,
        isLoading,
        setIsLoading,
        errorDash,
        setErrorDash,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};