// components/dashboard/Skeletons.tsx
// ============================================
// BEAUTIFUL SKELETON LOADERS
// ============================================

"use client";

import React from 'react';

/**
 * Base Skeleton Animation Component
 */
const SkeletonPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] ${className}`} 
       style={{ animation: 'shimmer 2s infinite' }} />
);

/**
 * KPI Card Skeleton
 */
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-slate-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {/* Label skeleton */}
        <SkeletonPulse className="h-4 w-32 rounded mb-2" />
        {/* Value skeleton */}
        <SkeletonPulse className="h-8 w-24 rounded" />
      </div>
      {/* Icon skeleton */}
      <SkeletonPulse className="w-12 h-12 rounded-full" />
    </div>
  </div>
);

/**
 * Chart Skeleton
 */
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <SkeletonPulse className="w-5 h-5 rounded" />
        <SkeletonPulse className="h-5 w-48 rounded" />
      </div>
      <SkeletonPulse className="h-7 w-36 rounded-full" />
    </div>
    
    {/* Chart body - single blinking block aligned with header */}
    <SkeletonPulse className="w-full h-[320px] rounded-lg" />
  </div>
);

/**
 * Cards Grid Skeleton - 8 cards (2 rows of 4)
 */
export const CardsGridSkeleton: React.FC = () => (
  <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
    {Array.from({ length: 4 }).map((_, idx) => (
      <CardSkeleton key={idx} />
    ))}
  </div>
);

/**
 * Charts Grid Skeleton - 4 charts (2x2 grid)
 */
export const ChartsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {Array.from({ length: 2 }).map((_, idx) => (
      <ChartSkeleton key={idx} />
    ))}
  </div>
);

/**
 * Add shimmer animation to global styles
 */
export const SkeletonStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `}</style>
);