import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserCheck, TrendingUp, Globe, Filter, MapPin, X } from 'lucide-react';

// Type Definitions
interface DataItem {
  [key: string]: any;
}

interface FilterConfig {
  key: string;
  label: string;
  dataKey: string;
  options: string[];
}

interface ChartDataItem {
  name?: string;
  value?: number;
  [key: string]: any;
}

interface DrillDownChart {
  title: string;
  type: 'bar' | 'pie' | 'line';
  dataGenerator: (data: DataItem[]) => ChartDataItem[];
  filterFunction: (item: DataItem, clicked: ChartDataItem) => boolean;
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
  drillDownChart?: DrillDownChart;
}

interface ChartDrillDown {
  titlePrefix?: string;
  filterFunction: (item: DataItem, clicked: ChartDataItem) => boolean;
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
  drillDown?: ChartDrillDown;
}

interface TableColumn {
  label: string;
  dataKey: string;
  className?: string;
  render?: (value: any, row: DataItem) => React.ReactNode;
}

interface ModalState {
  isOpen: boolean;
  type: 'kpi' | 'detail' | null;
  data: ChartDataItem[] | DataItem[] | null;
  title: string;
  chartType: 'bar' | 'pie' | 'line' | null;
  drillDownConfig?: DrillDownChart;
}

interface SecondaryModalState {
  isOpen: boolean;
  data: DataItem[] | null;
  title: string;
}

interface ConfigurableDashboardProps {
  title?: string;
  subtitle?: string;
  data?: DataItem[];
  filters?: FilterConfig[];
  kpiCards?: KPICard[];
  charts?: ChartConfig[];
  tableColumns?: TableColumn[];
  colors?: string[];
}

const Generated_Dashboard: React.FC<ConfigurableDashboardProps> = ({
  title = "Employee Analytics Dashboard",
  subtitle = "Interactive insights and analytics",
  data = [],
  filters = [],
  kpiCards = [],
  charts = [],
  tableColumns = [],
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']
}) => {
  
  const [filterState, setFilterState] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    filters.forEach(filter => {
      initialState[filter.key] = 'All';
    });
    return initialState;
  });

  const [primaryModal, setPrimaryModal] = useState<ModalState>({
    isOpen: false,
    type: null,
    data: null,
    title: '',
    chartType: null
  });
  
  const [secondaryModal, setSecondaryModal] = useState<SecondaryModalState>({
    isOpen: false,
    data: null,
    title: ''
  });

  const filteredData = useMemo(() => {
    return data.filter(row => {
      return filters.every(filter => {
        const currentFilterValue = filterState[filter.key];
        if (currentFilterValue === 'All') return true;
        return row[filter.dataKey] === currentFilterValue;
      });
    });
  }, [data, filterState, filters]);

  const calculateKPI = (kpi: KPICard): string | number => {
    if (kpi.calculationType === 'custom' && kpi.calculate) {
      return kpi.calculate(filteredData);
    }
    
    switch (kpi.calculationType) {
      case 'count':
        if (kpi.filterCondition) {
          return filteredData.filter(kpi.filterCondition).length;
        }
        return filteredData.length;
        
      case 'average':
        if (kpi.dataKey) {
          const values = filteredData.map(item => {
            const val = kpi.extractValue ? kpi.extractValue(item) : item[kpi.dataKey!];
            return parseFloat(val) || 0;
          });
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          return kpi.format ? kpi.format(avg) : avg.toFixed(1);
        }
        return 0;
        
      case 'distinct':
        if (kpi.dataKey) {
          const uniqueValues = new Set(filteredData.map(item => item[kpi.dataKey!]));
          return uniqueValues.size;
        }
        return 0;
        
      default:
        return 0;
    }
  };

  const generateChartData = (chart: ChartConfig): ChartDataItem[] => {
    if (chart.customDataGenerator) {
      return chart.customDataGenerator(filteredData);
    }
    
    const groups: Record<string, number> = {};
    filteredData.forEach(item => {
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

  const handleResetFilters = (): void => {
    const resetState: Record<string, string> = {};
    filters.forEach(filter => {
      resetState[filter.key] = 'All';
    });
    setFilterState(resetState);
  };

  const closePrimaryModal = (): void => {
    setPrimaryModal({ isOpen: false, type: null, data: null, title: '', chartType: null });
    setSecondaryModal({ isOpen: false, data: null, title: '' });
  };

  const closeSecondaryModal = (): void => {
    setSecondaryModal({ isOpen: false, data: null, title: '' });
  };

  const handleKPIClick = (kpi: KPICard): void => {
    if (!kpi.drillDownChart) return;
    
    const chartData = kpi.drillDownChart.dataGenerator(filteredData);
    
    setPrimaryModal({
      isOpen: true,
      type: 'kpi',
      data: chartData,
      title: kpi.drillDownChart.title,
      chartType: kpi.drillDownChart.type,
      drillDownConfig: kpi.drillDownChart
    });
  };

  const handleMainChartClick = (chart: ChartConfig, clickedItem: ChartDataItem): void => {
    if (!chart.drillDown) return;
    
    const detailData = filteredData.filter(item => {
      if (chart.drillDown!.filterFunction) {
        return chart.drillDown!.filterFunction(item, clickedItem);
      }
      return item[chart.dataKey!] === clickedItem.name;
    });
    
    setPrimaryModal({
      isOpen: true,
      type: 'detail',
      data: detailData,
      title: `${chart.drillDown.titlePrefix || 'Employees'} - ${clickedItem.name || clickedItem[chart.xDataKey!]}`,
      chartType: null
    });
  };

  const handleModalChartClick = (clickedItem: ChartDataItem): void => {
    if (!primaryModal.drillDownConfig || !primaryModal.drillDownConfig.filterFunction) return;
    
    const detailData = filteredData.filter(item => 
      primaryModal.drillDownConfig!.filterFunction(item, clickedItem)
    );
    
    if (detailData.length > 0) {
      setSecondaryModal({
        isOpen: true,
        data: detailData,
        title: `Employees - ${clickedItem.name}`
      });
    }
  };

  const getIcon = (iconName: string): React.ComponentType<any> => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Users, UserCheck, TrendingUp, Globe, Filter, MapPin
    };
    return iconMap[iconName] || Users;
  };

  const EmployeeTable: React.FC<{ employees: DataItem[] }> = ({ employees }) => (
    <div className="w-full">
      <div className="mb-4 text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-800">{employees.length}</span> employees
      </div>
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {tableColumns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider sticky top-0 bg-slate-50">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {employees.map((emp, empIdx) => (
              <tr key={empIdx} className="hover:bg-slate-50 transition-colors">
                {tableColumns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm">
                    {col.render ? col.render(emp[col.dataKey], emp) : (
                      <span className={col.className || 'text-slate-600'}>
                        {emp[col.dataKey]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChart = (chartData: ChartDataItem[], chartConfig: Partial<ChartConfig> & { onClick?: ((data: ChartDataItem) => void) | null }): React.ReactNode => {
    if (chartConfig.type === 'pie') {
      return (
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }: any) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120}
            fill="#8884d8"
            dataKey={chartConfig.valueKey || 'value'}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                onClick={() => chartConfig.onClick && chartConfig.onClick(entry)}
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
            onClick={(data: any) => chartConfig.onClick && chartConfig.onClick(data)}
            cursor="pointer"
          />
        </LineChart>
      );
    }
    
    return (
      <BarChart data={chartData} layout={chartConfig.layout || 'vertical'}>
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
          dataKey={chartConfig.yDataKey || 'value'} 
          fill={chartConfig.color || '#3b82f6'} 
          radius={chartConfig.layout === 'horizontal' ? [0, 8, 8, 0] : [8, 8, 0, 0]}
          onClick={(data: any) => chartConfig.onClick && chartConfig.onClick(data)}
          cursor="pointer"
        />
      </BarChart>
    );
  };

  const PrimaryModal: React.FC = () => {
    if (!primaryModal.isOpen) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={closePrimaryModal}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 64px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
            <h2 className="text-2xl font-bold text-slate-800">{primaryModal.title}</h2>
            <button 
              onClick={closePrimaryModal} 
              className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 px-6 py-6">
            {primaryModal.type === 'kpi' && Array.isArray(primaryModal.data) && (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={400}>
                  {renderChart(primaryModal.data as ChartDataItem[], { 
                    type: primaryModal.chartType!,
                    xDataKey: 'name',
                    yDataKey: 'value',
                    valueKey: 'value',
                    onClick: null
                  })}
                </ResponsiveContainer>
                
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Click below to view employee details:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(primaryModal.data as ChartDataItem[]).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleModalChartClick(item)}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
                      >
                        {item.name}
                        <span className="block text-xs mt-1 opacity-90">({item.value} employees)</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {primaryModal.type === 'detail' && Array.isArray(primaryModal.data) && (
              <EmployeeTable employees={primaryModal.data as DataItem[]} />
            )}
          </div>
        </div>
      </div>
    );
  };

  const SecondaryModal: React.FC = () => {
    if (!secondaryModal.isOpen || !secondaryModal.data) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4"
        onClick={closeSecondaryModal}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 64px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
            <h2 className="text-2xl font-bold text-slate-800">{secondaryModal.title}</h2>
            <button 
              onClick={closeSecondaryModal} 
              className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 px-6 py-6">
            <EmployeeTable employees={secondaryModal.data} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{title}</h1>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        {filters.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
              >
                Reset All Filters
              </button>
            </div>
            
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(filters.length, 4)}, 1fr)` }}>
              {filters.map((filter, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{filter.label}</label>
                  <select
                    value={filterState[filter.key]}
                    onChange={(e) => setFilterState({...filterState, [filter.key]: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All</option>
                    {filter.options.map((opt, optIdx) => (
                      <option key={optIdx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredData.length}</span> of <span className="font-semibold text-slate-800">{data.length}</span> records
            </div>
          </div>
        )}

        {kpiCards.length > 0 && (
          <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${Math.min(kpiCards.length, 4)}, 1fr)` }}>
            {kpiCards.map((kpi, idx) => {
              const Icon = getIcon(kpi.icon);
              const value = calculateKPI(kpi);
              
              return (
                <div 
                  key={idx}
                  onClick={() => kpi.drillDownChart && handleKPIClick(kpi)}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${kpi.drillDownChart ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow`}
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

        {charts.map((chart, idx) => {
          const chartData = generateChartData(chart);
          const Icon = getIcon(chart.icon);
          
          return (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
                {chart.title}
                {chart.drillDown && <span className="text-sm text-slate-500 ml-2">(Click for details)</span>}
              </h3>
              <ResponsiveContainer width="100%" height={chart.height || 400}>
                {renderChart(chartData, {
                  ...chart,
                  onClick: (data: ChartDataItem) => chart.drillDown && handleMainChartClick(chart, data)
                })}
              </ResponsiveContainer>
            </div>
          );
        })}

        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Dashboard generated from {data.length} total records • Filtered view showing {filteredData.length} records</p>
        </div>

      </div>

      <PrimaryModal />
      <SecondaryModal />
    </div>
  );
};

export default Generated_Dashboard;