import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
  dashboardCode: string | null;
  setDashboardCode: (code: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorDash: string | null;
  setErrorDash: (errorDash: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardCode, setDashboardCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDash, setErrorDash] = useState<string | null>(null);

  return (
    <DashboardContext.Provider
      value={{
        dashboardCode,
        setDashboardCode,
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