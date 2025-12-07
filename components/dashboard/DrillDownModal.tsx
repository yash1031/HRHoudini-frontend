// components/dashboard/DrillDownModal.tsx
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
import type { ModalState, ChartConfig, ChartDataItem, FilterOption, FilterState } from '@/types/dashboard';
import { DynamicQueryBuilder } from '@/utils/queryBuilder';
import { executeBatchQueries } from '@/utils/parquetLoader';
import { FilterControls } from "./FilterControls";

interface DrillDownModalProps {
  modal: ModalState;
  onClose: () => void;
}

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

const generatePieColors = (count: number): string[] => {
  const colors: string[] = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    const hue = (step * i + Math.random() * 30) % 360;
    colors.push(`hsl(${hue}, 70%, 75%)`);
  }
  return colors;
};

const renderChart = (
  chartData: ChartDataItem[], 
  chartConfig: Partial<ChartConfig>
): React.ReactNode => {
  
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
            <text x={x} y={y - 8} fill="#64748b" textAnchor={textAnchor} dominantBaseline="central" fontSize="12px" fontWeight="500">
              {name}
            </text>
            <text x={x} y={y + 8} fill="#64748b" textAnchor={textAnchor} dominantBaseline="central" fontSize="11px">
              {`${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
          </g>
        );
      }
      
      return (
        <text x={x} y={y} fill="#64748b" textAnchor={textAnchor} dominantBaseline="central" fontSize="12px">
          {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      );
    };

    return (
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={110} fill="#8884d8" dataKey={chartConfig.valueKey || 'value'}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  }

  if (chartConfig.type === 'line') {
      const dataPointCount = chartData.length;
      const shouldShowDots = dataPointCount <= 15;
      const shouldSkipLabels = dataPointCount > 15; // Skip labels if more than 50 points
      
      return (
        <LineChart 
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
  
          {/* X-Axis with arrow indicator */}
          <XAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            ticks={shouldSkipLabels ? chartData
              .map((_, idx) => idx)
              .filter((_, idx) => idx === 0 || idx % Math.ceil(dataPointCount / 10) === 0 || idx === dataPointCount - 1)
              .map(idx => chartData[idx][chartConfig.xDataKey || 'name'])
              : undefined}
            label={{ 
              value: `${chartConfig.xLabel || ''}${chartConfig.xUnit ? ` (${chartConfig.xUnit})` : ''}`,
              position: 'insideBottom',
              offset: -10,
              style: { fill: '#475569', fontSize: 13, fontWeight: 600 }
            }}
          />
  
          {/* Y-Axis with arrow indicator */}
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            label={{ 
              value: `${chartConfig.yLabel || ''}${chartConfig.yUnit ? ` (${chartConfig.yUnit})` : ''}`,
              angle: -90, 
              position: 'insideLeft',
              offset: 5,
              style: { fill: '#475569', fontSize: 13, fontWeight: 600, textAnchor: 'middle' }
            }}
          />
  
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any) => {
              if (chartConfig.yUnit) {
                return [value + ' ' + chartConfig.yUnit, chartConfig.yLabel || 'Value'];
              }
              return [value, chartConfig.yLabel || 'Value'];
            }}
          />
  
          <Line
            type="monotone"
            dataKey={chartConfig.yDataKey || 'value'}
            stroke={chartConfig.color || '#f59e0b'}
            strokeWidth={shouldShowDots ? 2 : 2.5}
            dot={shouldShowDots ? { 
              r: 5, 
              fill: chartConfig.color || '#f59e0b',
              strokeWidth: 2,
              stroke: '#fff'
            } : false}
            activeDot={!shouldShowDots ? { 
              r: 6, 
              fill: chartConfig.color || '#f59e0b',
              stroke: '#fff',
              strokeWidth: 2
            } : { r: 7 }}
            name={chartConfig.lineName || chartConfig.yLabel || 'Value'}
          />
        </LineChart>
      );
  }

  const isHorizontal = chartConfig.layout === 'horizontal';
  
  return (
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      {isHorizontal ? (
        <>
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis dataKey={chartConfig.xDataKey || 'name'} type="category" tick={{ fill: '#64748b', fontSize: 12 }} width={100} />
        </>
      ) : (
        <>
          <XAxis dataKey={chartConfig.xDataKey || 'name'} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        </>
      )}
      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
      <Bar dataKey="value" fill={chartConfig.color || '#3b82f6'} radius={isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]} />
    </BarChart>
  );
};

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ modal, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [chartData, setChartData] = useState<Record<number, any[]>>({});
  const [originalChartData, setOriginalChartData] = useState<Record<number, any[]>>({});

  // Store original data on first load
  useEffect(() => {
    if (modal.isOpen && modal.drillDownData?.charts) {
      const initial: Record<number, any[]> = {};
      modal.drillDownData.charts.forEach((chart, idx) => {
        initial[idx] = chart.data || [];
      });
      setChartData(initial);
      setOriginalChartData(initial);
      setActiveFilters({});
    }
  }, [modal.isOpen]);

  // Handle filter changes
  const handleFilterChange = async (filters: FilterState) => {
    console.log("Filters received in handleFilterChange", filters)
    if (!modal.drillDownData?.charts) return;
    
    setLoading(true);
    setLoadError(null);
    
    try {
      const parquetUrl = localStorage.getItem("presigned-parquet-url") || "";
      console.log('Using filters directly:', filters);
    
      // Build queries with filters
      const queries = modal.drillDownData.charts.map(chart => {
            if (!chart.queryObject) return '';
            const query = DynamicQueryBuilder.buildSQL(chart.queryObject, filters);
            console.log('Generated query with filters:', query); 
            return query;
      });

      console.log('Built queries:', queries);
      
      const validQueries = queries.filter(q => q !== '');

      console.log('Built validQueries:', validQueries);
      
      if (validQueries.length === 0) {
        setLoadError('No valid queries');
        setLoading(false);
        return;
      }
      
      // Execute queries
      const results = await executeBatchQueries(validQueries);
      
      // Update chart data
      const newChartData: Record<number, any[]> = {};
      let validQueryIndex = 0;
      
      queries.forEach((query, idx) => {
        if (query !== '') {
          const data = results[validQueryIndex] || [];
          const total = data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
          
          newChartData[idx] = data.map((item: any) => ({
            name: item.name,
            value: item.value || 0,
            percentage: total > 0 ? parseFloat(((item.value / total) * 100).toFixed(1)) : 0
          }));
          validQueryIndex++;
        } else {
          newChartData[idx] = [];
        }
      });
      
      setChartData(newChartData);
      setActiveFilters(filters);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to apply filters:', error);
      setLoadError('Failed to apply filters');
      setLoading(false);
    }
  };

  // Clear filters - restore original data
  const handleClearFilters = () => {
    setChartData(originalChartData);
    setActiveFilters({});
  };

  const handleRemoveFilterValue = async (filterField: string, valueToRemove: string) => {
    const updatedFilters = { ...activeFilters };
    
    if (updatedFilters[filterField]?.operator === 'IN') {
      // Remove specific value from array
      const currentValues = updatedFilters[filterField].value as string[];
      const newValues = currentValues.filter(v => v !== valueToRemove);
      
      if (newValues.length === 0) {
        // If no values left, remove entire filter
        delete updatedFilters[filterField];
      } else {
        updatedFilters[filterField].value = newValues;
      }
    } else {
      // For non-array filters (BETWEEN, =, etc.), remove entire filter
      delete updatedFilters[filterField];
    }
    
    // Re-apply filters
    await handleFilterChange(updatedFilters);
  };

  if (!modal.isOpen || !modal.drillDownData) return null;

  const { drillDownData } = modal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col" style={{ maxHeight: 'calc(100vh - 64px)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-slate-800">{modal.title}</h2>
          <button onClick={onClose} className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="space-y-6">
            
            {/* Filters */}
            {drillDownData.filters && drillDownData.filters.length > 0 && (
              <FilterControls 
                filters={drillDownData.filters} 
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                currentFilters={activeFilters}
              />
            )}

            {/* Active Filters Display */}
            {Object.keys(activeFilters).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700 flex items-center">
                    Active Filters ({Object.keys(activeFilters).length})
                  </h4>
                  <button 
                    onClick={handleClearFilters} 
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(activeFilters).map(([field, filter]) => (
                    <div key={field} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-slate-600 min-w-[100px] capitalize">
                        {field}:
                      </span>
                      <div className="flex flex-wrap gap-2 flex-1">
                        {/* Render individual badges based on operator type */}
                        {filter.operator === 'IN' && Array.isArray(filter.value) ? (
                          filter.value.map((val, idx) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                              {val}
                              <X 
                                className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                onClick={() => handleRemoveFilterValue(field, val)}
                              />
                            </Badge>
                          ))
                        ) : filter.operator === 'BETWEEN' ? (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            {filter.value.min} - {filter.value.max}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-600" 
                              onClick={() => handleRemoveFilterValue(field, '')}
                            />
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            {String(filter.value)}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-red-600" 
                              onClick={() => handleRemoveFilterValue(field, '')}
                            />
                          </Badge>
                        )}
                      </div>
                      {/* Clear button for this specific filter */}
                      <button
                        onClick={async () => {
                          const updatedFilters = { ...activeFilters };
                          delete updatedFilters[field];
                          await handleFilterChange(updatedFilters);
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium ml-2"
                      >
                        Clear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Applying filters...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{loadError}</p>
                </div>
              </div>
            )}

            {/* Charts */}
            {!loading && drillDownData.charts && drillDownData.charts.length > 0 && (
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(drillDownData.charts.length, 2)}, 1fr)` }}>
                {drillDownData.charts.map((chart, idx) => {
                  const Icon = getIcon(chart.icon);
                  const data = chartData[idx] || [];
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
                        {chart.title}
                        {data.length > 0 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                            {data.length} records
                          </Badge>
                        )}
                      </h3>
                      {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={chart.height || 300}>
                          {renderChart(data, chart)}
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

            {/* Insights */}
            {!loading && drillDownData.insights && (drillDownData.insights.critical_issues?.length > 0 || drillDownData.insights.recommended_actions?.length > 0) && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-md p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <LucideIcons.Lightbulb className="w-6 h-6 mr-2 text-amber-500" />
                  Key Insights & Recommendations
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Critical Issues */}
                  {drillDownData.insights.critical_issues && drillDownData.insights.critical_issues.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                        Critical Issues:
                      </h4>
                      <ul className="space-y-2">
                        {drillDownData.insights.critical_issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-700">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Recommended Actions */}
                  {drillDownData.insights.recommended_actions && drillDownData.insights.recommended_actions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                        <LucideIcons.CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                        Recommended Actions:
                      </h4>
                      <ul className="space-y-2">
                        {drillDownData.insights.recommended_actions.map((action, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-700">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};