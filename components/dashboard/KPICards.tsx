// components/dashboard/KPICards.tsx
// ============================================
// KPI CARDS GRID COMPONENT
// ============================================

"use client";

import React from 'react';
import type { KPICard } from '@/types/dashboard';
import * as LucideIcons from 'lucide-react';

interface KPICardsProps {
  cards: KPICard[];
  onCardClick?: (card: KPICard) => void;
}

/**
 * Get Lucide icon component by name
 */
const getIcon = (iconName: string): React.ComponentType<any> => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Users: LucideIcons.Users,
    UserCheck: LucideIcons.UserCheck,
    TrendingUp: LucideIcons.TrendingUp,
    TrendingDown: LucideIcons.TrendingDown,
    Globe: LucideIcons.Globe,
    MapPin: LucideIcons.MapPin,
    AlertTriangle: LucideIcons.AlertTriangle,
    CheckCircle: LucideIcons.CheckCircle,
    Info: LucideIcons.Info,
    DollarSign: LucideIcons.DollarSign,
    Activity: LucideIcons.Activity,
    Briefcase: LucideIcons.Briefcase,
    Clock: LucideIcons.Clock,
    Award: LucideIcons.Award,
    BarChart: LucideIcons.BarChart3
  };
  return iconMap[iconName] || LucideIcons.Users;
};

/**
 * Color mapping for card borders
 */
const colorMap: Record<string, string> = {
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  teal: '#14b8a6',
  indigo: '#6366f1',
  red: '#ef4444',
  pink: '#ec4899'
};

/**
 * KPI Cards Grid Component
 * Displays a responsive grid of KPI cards with optional click handlers
 */
export const KPICards: React.FC<KPICardsProps> = ({ cards, onCardClick }) => {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div 
      className="grid gap-6 mb-8" 
      style={{ 
        gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, 1fr)` 
      }}
    >
      {cards.map((card, idx) => {
        const Icon = getIcon(card.icon);
        const hasInteraction = card.drillDownData || card.drillDown;
        const borderColor = card.color || '#ef4444';
        // console.log("In KPICards", card)

        return (
          <div
            key={idx}
            onClick={() => hasInteraction && onCardClick?.(card)}
            className={`
              bg-white rounded-lg shadow-md p-6 border-l-4 
              ${hasInteraction ? 'cursor-pointer hover:shadow-lg' : ''} 
              transition-shadow
            `}
            style={{ borderLeftColor: borderColor }}
          >
            <div className="flex items-center justify-between">
              {/* Card Content */}
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  {card.title || card.label}
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {card.value}
                </p>
              </div>
              
              {/* Icon */}
              <Icon 
                className="w-12 h-12 opacity-80" 
                style={{ color: borderColor }} 
              />
            </div>
            
            {/* Optional Note */}
            {card.note && (
              <p className="text-xs text-slate-500 mt-2">{card.note}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};