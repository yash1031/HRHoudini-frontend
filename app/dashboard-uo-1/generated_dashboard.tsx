"use client"
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, Rectangle, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Users, UserCheck, TrendingUp, Globe, MapPin, X, AlertTriangle, CheckCircle, Info, DollarSign, Activity, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge"

interface FilterOption {
  field: string;
  label: string;
  type: 'multiselect' | 'select' | 'range';
  options?: string[];
  min?: number;
  max?: number;
}

// Filter state interface
interface FilterState {
  [key: string]: any;
}

// Type Definitions
interface DataItem {
  [key: string]: any;
}

interface ChartDataItem {
  name?: string;
  value?: number;
  [key: string]: any;
}

// UPDATED: New insights structure
interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

interface DrillDownData {
  filters?: FilterOption[];
  cards: KPICard[];
  charts: ChartConfig[];
  insights?: Insight; // UPDATED: Changed from InsightItem[] to Insights
}

interface KPICard {
  label: string;
  icon: string;
  color: string;
  description?: string;
  calculationType: 'count' | 'average' | 'distinct' | 'custom';
  dataKey?: string;
  extractValue?: (item: DataItem) => number;
  format?: (value: number) => string | number;
  filterCondition?: (item: DataItem) => boolean;
  calculate?: (data: DataItem[]) => string | number;
  drillDownData?: DrillDownData;
}

interface ChartConfig {
  title: string;
  icon: string;
  type: 'bar' | 'pie' | 'line';
  color: string;
  dataKey?: string;
  xDataKey?: string;
  yDataKey?: string;
  valueKey?: string;
  layout?: 'vertical' | 'horizontal';
  height?: number;
  sort?: 'asc' | 'desc';
  lineName?: string;
  customDataGenerator?: (data: DataItem[]) => ChartDataItem[];
  drillDownData?: DrillDownData;
}

interface TableColumn {
  label: string;
  dataKey: string;
  className?: string;
  render?: (value: any, row: DataItem) => React.ReactNode;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  drillDownData?: DrillDownData;
}

interface ConfigurableDashboardProps {
  title?: string;
  subtitle?: string;
  data?: DataItem[];
  kpiCards?: KPICard[];
  charts?: ChartConfig[];
  rowCount?: string;
  filename?: string;
  tableColumns?: TableColumn[];
  colors?: string[];
}

// FilterControls Component
const FilterControls: React.FC<{
  filters: FilterOption[];
  onFilterChange: (filters: FilterState) => void;
}> = ({ filters, onFilterChange }) => {
  const [filterValues, setFilterValues] = useState<FilterState>({});

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filterValues, [field]: value };
    setFilterValues(newFilters);
    onFilterChange(newFilters);
  };

  const handleMultiSelectToggle = (field: string, option: string) => {
    const current = filterValues[field] || [];
    const newValue = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    handleFilterChange(field, newValue);
  };

  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case 'multiselect':
        return (
          <div key={filter.field} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{filter.label}</label>
            <div className="flex flex-wrap gap-2">
              {filter.options?.map((option) => {
                const isSelected = (filterValues[filter.field] || []).includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleMultiSelectToggle(filter.field, option)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={filter.field} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{filter.label}</label>
            <select
              value={filterValues[filter.field] || ''}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              {filter.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'range':
        return (
          <div key={filter.field} className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              {filter.label}: {filterValues[filter.field]?.[0] || filter.min} - {filterValues[filter.field]?.[1] || filter.max}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                value={filterValues[filter.field]?.[0] || filter.min}
                onChange={(e) =>
                  handleFilterChange(filter.field, [
                    parseInt(e.target.value),
                    filterValues[filter.field]?.[1] || filter.max,
                  ])
                }
                className="flex-1"
              />
              <input
                type="range"
                min={filter.min}
                max={filter.max}
                value={filterValues[filter.field]?.[1] || filter.max}
                onChange={(e) =>
                  handleFilterChange(filter.field, [
                    filterValues[filter.field]?.[0] || filter.min,
                    parseInt(e.target.value),
                  ])
                }
                className="flex-1"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Min: {filter.min}</span>
              <span>Max: {filter.max}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">Filters</h4>
        {Object.keys(filterValues).length > 0 && (
          <button
            onClick={() => {
              setFilterValues({});
              onFilterChange({});
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filters.map(renderFilter)}
      </div>
    </div>
  );
};

const Generated_Dashboard: React.FC<ConfigurableDashboardProps> = ({
  title = "Employee Analytics Dashboard",
  subtitle = "Interactive insights and analytics",
  data = [],
  kpiCards = [],
  charts = [],
  rowCount,
  filename,
  tableColumns = [],
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']
}) => {
  
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: ''
  });

  // console.log("kpiCards data is", kpiCards)

  console.log("filename recieved in generated_dashboard is", filename)
  console.log("rowCount recieved in generated_dashboard is", rowCount)

  const [card1, card2, card3, card4]= kpiCards;

  const calculateKPI = (kpi: KPICard): string | number => {
    if (kpi?.calculationType === 'custom' && kpi?.calculate) {
      return kpi.calculate(data);
    }
    
    switch (kpi?.calculationType) {
      case 'count':
        if (kpi?.filterCondition) {
          return data.filter(kpi.filterCondition).length;
        }
        return data?.length;
        
      case 'average':
        if (kpi?.dataKey) {
          const values = data.map(item => {
            const val = kpi.extractValue ? kpi.extractValue(item) : item[kpi.dataKey!];
            return parseFloat(val) || 0;
          });
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          return kpi.format ? kpi.format(avg) : avg.toFixed(1);
        }
        return 0;
        
      case 'distinct':
        if (kpi?.dataKey) {
          const uniqueValues = new Set(data.map(item => item[kpi.dataKey!]));
          return uniqueValues.size;
        }
        return 0;
        
      default:
        return 0;
    }
  };

  const generateChartData = (chart: ChartConfig): ChartDataItem[] => {
    if (chart.customDataGenerator) {
      return chart.customDataGenerator(data);
    }
    
    const groups: Record<string, number> = {};
    data.forEach(item => {
      const key = item[chart.dataKey!];
      groups[key] = (groups[key] || 0) + 1;
    });
    
    let chartData = Object.entries(groups).map(([name, value]) => ({ 
      name, 
      value,
      [chart.valueKey || 'value']: value 
    }));
    
    if (chart.sort === 'desc') {
      chartData.sort((a, b) => (b.value || 0) - (a.value || 0));
    } else if (chart.sort === 'asc') {
      chartData.sort((a, b) => (a.value || 0) - (b.value || 0));
    }
    
    return chartData;
  };

  const closeModal = (): void => {
    setModal({ isOpen: false, title: '' });
  };

  const handleKPIClick = (kpi: KPICard): void => {
    if (!kpi.drillDownData) return;
    
    setModal({
      isOpen: true,
      title: `${kpi.label} - Detailed Analysis`,
      drillDownData: kpi.drillDownData
    });
  };

  const handleChartClick = (chart: ChartConfig): void => {
    if (!chart.drillDownData) return;
    
    setModal({
      isOpen: true,
      title: `${chart.title} - Detailed Analysis`,
      drillDownData: chart.drillDownData
    });
  };

  const getIcon = (iconName: string): React.ComponentType<any> => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Users, UserCheck, TrendingUp, Globe, MapPin, AlertTriangle, CheckCircle, Info, DollarSign, Activity
    };
    return iconMap[iconName] || Users;
  };

  const getRandomLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 75%)`;
  };

  // Generate unique light colors for pie chart segments
  const generatePieColors = (count: number): string[] => {
    const colors: string[] = [];
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      const hue = (step * i + Math.random() * 30) % 360;
      colors.push(`hsl(${hue}, 70%, 75%)`);
    }
    return colors;
  };

  const renderChart = (chartData: ChartDataItem[], chartConfig: Partial<ChartConfig>): React.ReactNode => {
    // console.log("kpiCards data is", kpiCards)

    if (chartConfig.type === 'pie') {
      const pieColors = generatePieColors(chartData.length);
      
      // Custom label with smart multi-line support based on label length
      const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 50; // Position labels further outside
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        
        // Determine text anchor based on position
        const textAnchor = x > cx ? 'start' : 'end';
        
        // Determine if label is too long (more than 15 characters)
        const isLongLabel = name.length > 15;
        
        if (isLongLabel) {
          // Multi-line for long labels
          return (
            <g>
              <text
                x={x}
                y={y - 8}
                fill="#64748b"
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize="12px"
                fontWeight="500"
              >
                {name}
              </text>
              <text
                x={x}
                y={y + 8}
                fill="#64748b"
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize="11px"
              >
                {`${value} (${(percent * 100).toFixed(0)}%)`}
              </text>
            </g>
          );
        } else {
          // Single line for short labels
          return (
            <text
              x={x}
              y={y}
              fill="#64748b"
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="12px"
            >
              {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
          );
        }
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
              <Cell 
                key={`cell-${index}`} 
                fill={pieColors[index]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      );
    }
    
    if (chartConfig.type === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={chartConfig.xDataKey || 'name'} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
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

    // Bar chart - use single consistent color
    const barColor = getRandomLightColor();
    return (
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        {chartConfig.layout === 'horizontal' ? (
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
        <Bar 
          dataKey={'value'} 
          fill={barColor}
          radius={chartConfig.layout === 'horizontal' ? [0, 8, 8, 0] : [8, 8, 0, 0]}
        />
      </BarChart>
    );
  };

  // UPDATED: New InsightsSection component matching the image format
  const InsightsSection: React.FC<{ insights: Insight }> = ({ insights }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Key Insights & Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critical Issues Section */}
          <div>
            <h4 className="text-md font-semibold text-slate-800 mb-4">Critical Issues:</h4>
            {insights.critical_issues && insights.critical_issues.length > 0 ? (
              <ul className="space-y-2">
                {insights.critical_issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No critical issues identified</p>
            )}
          </div>

          {/* Recommended Actions Section */}
          <div>
            <h4 className="text-md font-semibold text-slate-800 mb-4">Recommended Actions:</h4>
            {insights.recommended_actions && insights.recommended_actions.length > 0 ? (
              <ul className="space-y-2">
                {insights.recommended_actions.map((action, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No recommended actions</p>
            )}
          </div>
        </div>
      </div>
    );
  };

// const DrillDownModal: React.FC = () => {
//   const [activeFilters, setActiveFilters] = useState<FilterState>({});

//   if (!modal.isOpen || !modal.drillDownData) return null;

//   const handleFilterChange = (filters: FilterState) => {
//     setActiveFilters(filters);
//     // Note: Filtering logic would need to be implemented based on your data structure
//     // For now, just storing the filter state
//     console.log('Active filters:', filters);
//     console.log('Drilldown data in modal is', modal.drillDownData)
//   };

//   return (
//     <div 
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//       onClick={closeModal}
//     >
//       <div 
//         className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col"
//         style={{ maxHeight: 'calc(100vh - 64px)' }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
//           <h2 className="text-2xl font-bold text-slate-800">{modal.title}</h2>
//           <button 
//             onClick={closeModal} 
//             className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
        
//         <div className="overflow-y-auto flex-1 px-6 py-6">
//           <div className="space-y-6">
//             {console.log("modal.drillDownData is", modal.drillDownData)}
//             {/* Filters Section - ADD THIS */}
//             {modal.drillDownData.filters && modal.drillDownData.filters.length > 0 && (
//               <FilterControls 
//                 filters={modal.drillDownData.filters} 
//                 onFilterChange={handleFilterChange}
//               />
//             )}

//             {/* Charts Row */}
//             {modal.drillDownData.charts && modal.drillDownData.charts.length > 0 && (
//               <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(modal.drillDownData.charts.length, 2)}, 1fr)` }}>
//                 {modal.drillDownData.charts.map((chart, idx) => {
//                   const Icon = getIcon(chart.icon);
//                   const chartData = generateChartData(chart);
                  
//                   return (
//                     <div key={idx} className="bg-white rounded-lg shadow-md p-6">
//                       <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
//                         <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
//                         {chart.title}
//                       </h3>
//                       <ResponsiveContainer width="100%" height={chart.height || 300}>
//                         {renderChart(chartData, chart)}
//                       </ResponsiveContainer>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Insights Row */}
//             {modal.drillDownData.insights && (
//               <InsightsSection insights={modal.drillDownData.insights} />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const DrillDownModal: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  if (!modal.isOpen || !modal.drillDownData) return null;

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
    console.log('Active filters:', filters);
  };

  // NEW: Filter chart data based on active filters
  const getFilteredChartData = (chart: ChartConfig): ChartDataItem[] => {
    const originalData = generateChartData(chart);
    
    // If no filters are active, return original data
    if (Object.keys(activeFilters).length === 0) {
      return originalData;
    }

    // Apply filters to chart data
    return originalData.filter((dataPoint) => {
      let includePoint = true;

      // Check each active filter
      Object.entries(activeFilters).forEach(([field, filterValue]) => {
        // Skip if filter value is empty/null
        if (!filterValue || 
            (Array.isArray(filterValue) && filterValue.length === 0) || 
            filterValue === '') {
          return;
        }

        // Get the corresponding filter config
        const filterConfig = modal.drillDownData?.filters?.find(f => f.field === field);
        if (!filterConfig) return;

        switch (filterConfig.type) {
          case 'multiselect':
            // For multiselect: check if dataPoint.name is in the selected options
            if (Array.isArray(filterValue) && !filterValue.includes(dataPoint.name)) {
              includePoint = false;
            }
            break;

          case 'select':
            // For select: check if dataPoint.name matches the selected option
            if (filterValue && dataPoint.name !== filterValue) {
              includePoint = false;
            }
            break;

          case 'range':
            // For range: check if dataPoint.name (converted to number) is within range
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const [min, max] = filterValue;
              const pointValue = parseFloat(dataPoint.name || '0');
              if (pointValue < min || pointValue > max) {
                includePoint = false;
              }
            }
            break;
        }
      });

      return includePoint;
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeModal}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col"
        style={{ maxHeight: 'calc(100vh - 64px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-slate-800">{modal.title}</h2>
          <button 
            onClick={closeModal} 
            className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="space-y-6">
            {/* Filters Section */}
            {modal.drillDownData.filters && modal.drillDownData.filters.length > 0 && (
              <FilterControls 
                filters={modal.drillDownData.filters} 
                onFilterChange={handleFilterChange}
              />
            )}

            {/* KPI Cards Row - UPDATED to show filtered count */}
            {/* {modal.drillDownData.cards && modal.drillDownData.cards.length > 0 && (
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(modal.drillDownData.cards.length, 3)}, 1fr)` }}>
                {modal.drillDownData.cards.map((kpi, idx) => {
                  const Icon = getIcon(kpi.icon);
                  const value = calculateKPI(kpi);
                  
                  return (
                    <div 
                      key={idx}
                      className="bg-white rounded-lg shadow-md p-6 border-l-4"
                      style={{ borderLeftColor: kpi.color || '#3b82f6' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">{kpi.label}</p>
                          <p className="text-3xl font-bold text-slate-800">{value}</p>
                          {kpi.description && (
                            <p className="text-xs mt-1" style={{ color: kpi.color || '#3b82f6' }}>
                              {kpi.description}
                            </p>
                          )}
                        </div>
                        <Icon className="w-12 h-12 opacity-80" style={{ color: kpi.color || '#3b82f6' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )} */}

            {/* Charts Row - UPDATED to use filtered data */}
            {modal.drillDownData.charts && modal.drillDownData.charts.length > 0 && (
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(modal.drillDownData.charts.length, 2)}, 1fr)` }}>
                {modal.drillDownData.charts.map((chart, idx) => {
                  const Icon = getIcon(chart.icon);
                  const filteredChartData = getFilteredChartData(chart); // CHANGED: Use filtered data
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
                        {chart.title}
                        {/* Show filtered indicator */}
                        {Object.keys(activeFilters).length > 0 && filteredChartData.length < generateChartData(chart).length && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                            Filtered: {filteredChartData.length}/{generateChartData(chart).length}
                          </Badge>
                        )}
                      </h3>
                      {filteredChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={chart.height || 300}>
                          {renderChart(filteredChartData, chart)}
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                          <div className="text-center">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No data matches the current filters</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Insights Row */}
            {modal.drillDownData.insights && (
              <InsightsSection insights={modal.drillDownData.insights} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl mb-6">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">HR Houdini</h1>
                  <p className="text-blue-100">
                    Your AI workforce analyst - Ready to dive deeper into {filename} data
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-white/20 text-white border-white/30">Analysis Completed</Badge>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2 text-white">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{filename}</span>
                    {/* <span className="font-medium">{localStorage.getItem("file_name")}</span> */}
                    <span className="text-blue-200">•</span>
                    <span className="text-blue-200">{rowCount} records</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <h2 className="text-xl font-semibold text-white mb-3">3 Critical Insights Found</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  {/* <span className="font-medium text-white">Turnover:</span>
                  <span className="text-blue-100">{"24.3%"} rate</span> */}
                  <span className="font-medium text-white">{card2?.label}</span>
                  <span className="text-blue-100">{calculateKPI(card2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="font-medium text-white">{card3?.label}</span>
                  <span className="text-blue-100">{calculateKPI(card3)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="font-medium text-white">{card4?.label}</span>
                  <span className="text-blue-100">{calculateKPI(card4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {kpiCards.length > 0 && (
          <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${Math.min(kpiCards.length, 4)}, 1fr)` }}>
            {kpiCards.map((kpi, idx) => {
              const Icon = getIcon(kpi.icon);
              const value = calculateKPI(kpi);
              
              return (
                <div 
                  key={idx}
                  onClick={() => kpi.drillDownData && handleKPIClick(kpi)}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${kpi.drillDownData ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow`}
                  style={{ borderLeftColor: kpi.color || '#3b82f6' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-slate-800">{value}</p>
                      {kpi.description && (
                        <p className="text-xs mt-1" style={{ color: kpi.color || '#3b82f6' }}>
                          {kpi.description}
                        </p>
                      )}
                    </div>
                    <Icon className="w-12 h-12 opacity-80" style={{ color: kpi.color || '#3b82f6' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {charts.map((chart, idx) => {
            const chartData = generateChartData(chart);
            const Icon = getIcon(chart.icon);
            
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-lg shadow-md p-6 ${chart.drillDownData ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow`}
                onClick={() => chart.drillDownData && handleChartClick(chart)}
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
                  {chart.title}
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  {renderChart(chartData, chart)}
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Dashboard generated from {rowCount} total records</p>
        </div>

      </div>

      <DrillDownModal />
    </div>
  );
};

export default Generated_Dashboard;