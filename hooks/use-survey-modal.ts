'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch } from "@/lib/api/client";

interface UseSurveyModalReturn {
  showSurvey: boolean;
  closeSurvey: () => void;
}

export function useSurveyModal(): UseSurveyModalReturn {
  const [showSurvey, setShowSurvey] = useState(false);
  const [hasShownSurvey, setHasShownSurvey] = useState(false);
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount (page load/refresh)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPathRef.current = pathname;
      return;
    }

    // Skip if already shown survey this session
    if (hasShownSurvey) {
      previousPathRef.current = pathname;
      return;
    }

    const previousPath = previousPathRef.current;
    const currentPath = pathname;

    // Check if user was on EXACT /dashboard path (not subpages)
    const wasOnMainDashboard = previousPath === '/dashboard';
    const isNavigatingAway = currentPath !== '/dashboard';

    // Show modal when leaving main dashboard to anywhere else
    if (wasOnMainDashboard && isNavigatingAway) {
      checkAndShowSurvey();
    }

    // Update previous path for next navigation
    previousPathRef.current = currentPath;
  }, [pathname, hasShownSurvey]);

  const checkAndShowSurvey = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      console.log("Checking if should-show survey, userId", userId)
      if (!userId) {
        console.error('User not authenticated');
        return;
      }

      // For testing api failure
    //   throw new Error('Error connecting to api for submit survey');

      const response = await apiFetch('/api/survey/should-show', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
        }),
      }).catch((error) => {
        const parsedError = JSON.parse(error.message);
        console.error('Failed to check survey preference', parsedError);
        return;
      });

      if(response){
        console.log("Response from should-show-survey", response)

        if (response.shouldShow) {
          setTimeout(() => {
            setShowSurvey(true);
            setHasShownSurvey(true);
          }, 300);
        }
      }
    } catch (error) {
      console.error('Error checking survey preference:', error);
    }
  };

  const closeSurvey = () => {
    setShowSurvey(false);
  };

  return {
    showSurvey,
    closeSurvey,
  };
}