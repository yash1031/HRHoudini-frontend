'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function BfcacheHandler() {
  const router = useRouter();

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // If page is loaded from bfcache, refresh it
      if (event.persisted) {
        console.log('Page loaded from bfcache, refreshing...');
        router.refresh();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [router]);

  return null;
}