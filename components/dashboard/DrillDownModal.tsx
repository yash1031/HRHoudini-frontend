// components/dashboard/DrillDownModal.tsx
// ============================================
// DRILLDOWN MODAL COMPONENT
// ============================================

"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from 'lucide-react';
import type { ModalState, ChartConfig, ChartDataItem } from '@/types/dashboard';

interface DrillDownModalProps {
  modal: ModalState;
  onClose: () => void;
}

/**
 * Get Lucide icon component by name
 */
const getIcon = (iconName: string): React.ComponentType<any> => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Users: LucideIcons.Users,
    BarChart: LucideIcons.BarChart3,
    TrendingUp: LucideIcons.TrendingUp,
    Globe: LucideIcons.Globe,
    Briefcase: LucideIcons.Briefcase,
    PieChart: LucideIcons.PieChart
  };
  return iconMap[iconName] || LucideIcons.BarChart3;
};

/**
 * Generate unique colors for pie chart segments
 */
const generatePieColors = (count: number): string[] => {
  const colors: string[] = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    const hue = (step * i + Math.random() * 30) % 360;
    colors.push(`hsl(${hue}, 70%, 75%)`);
  }
  return colors;
};

/**
 * Render chart based on type
 */
const renderChart = (
  chartData: ChartDataItem[], 
  chartConfig: Partial<ChartConfig>
): React.ReactNode => {
  
  // PIE CHART
  if (chartConfig.type === 'pie') {
    const pieColors = generatePieColors(chartData.length);

    const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 50;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      const textAnchor = x > cx ? 'start' : 'end';
      const isLongLabel = name?.length > 15;

      if (isLongLabel) {
        return (
          <g>
            <text
              x={x} y={y - 8}
              fill="#64748b"
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="12px"
              fontWeight="500"
            >
              {name}
            </text>
            <text
              x={x} y={y + 8}
              fill="#64748b"
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="11px"
            >
              {`${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
          </g>
        );
      }
      
      return (
        <text
          x={x} y={y}
          fill="#64748b"
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize="12px"
        >
          {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      );
    };

    return (
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={110}
          fill="#8884d8"
          dataKey={chartConfig.valueKey || 'value'}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  }

  // LINE CHART
  if (chartConfig.type === 'line') {
    return (
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey={chartConfig.xDataKey || 'name'} 
          tick={{ fill: '#64748b', fontSize: 12 }} 
        />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px' 
          }} 
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={chartConfig.yDataKey || 'value'}
          stroke={chartConfig.color || '#f59e0b'}
          strokeWidth={3}
          dot={{ r: 6, fill: chartConfig.color || '#f59e0b' }}
          name={chartConfig.lineName || 'Value'}
        />
      </LineChart>
    );
  }

  // BAR CHART (default)
  const isHorizontal = chartConfig.layout === 'horizontal';
  
  return (
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      {isHorizontal ? (
        <>
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            type="category" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            width={100} 
          />
        </>
      ) : (
        <>
          <XAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        </>
      )}
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px' 
        }} 
      />
      <Bar
        dataKey="value"
        fill={chartConfig.color || '#3b82f6'}
        radius={isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
      />
    </BarChart>
  );
};

/**
 * Drilldown Modal Component
 * Displays detailed charts for a specific KPI or chart
 */
export const DrillDownModal: React.FC<DrillDownModalProps> = ({ modal, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (modal.isOpen) {
      setLoading(false);
      setLoadError(null);
    }
  }, [modal.isOpen]);

  if (!modal.isOpen || !modal.drillDownData) {
    return null;
  }

  const { drillDownData } = modal;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col"
        style={{ maxHeight: 'calc(100vh - 64px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-slate-800">{modal.title}</h2>
          <button 
            onClick={onClose} 
            className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="space-y-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading data...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{loadError}</p>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            {!loading && drillDownData.charts && drillDownData.charts.length > 0 && (
              <div 
                className="grid gap-6"
                style={{ 
                  gridTemplateColumns: `repeat(${Math.min(drillDownData.charts.length, 2)}, 1fr)` 
                }}
              >
                {drillDownData.charts.map((chart, idx) => {
                  const Icon = getIcon(chart.icon);
                  const chartData = chart.data || [];
                  
                  return (
                    <div 
                      key={idx} 
                      className="bg-white rounded-lg shadow-md p-6 transition-all duration-300"
                    >
                      {/* Chart Header */}
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Icon 
                          className="w-5 h-5 mr-2" 
                          style={{ color: chart.color || '#3b82f6' }} 
                        />
                        {chart.title}
                        
                        {/* Data Badge */}
                        {chartData.length > 0 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                            {chartData.length} records
                          </Badge>
                        )}
                      </h3>

                      {/* Chart Content */}
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={chart.height || 300}>
                          {renderChart(chartData, chart)}
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                          <div className="text-center">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && (!drillDownData.charts || drillDownData.charts.length === 0) && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No drilldown data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};