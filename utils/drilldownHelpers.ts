import type { DashboardData, DrillDownData, KPICard, ChartConfig } from '@/types/dashboard';


/**
 * Attach drilldown data to parent chart or card
 */
// export function attachDrilldownToParent(
//   dashboardData: DashboardData,
//   parentChartId: string | null,
//   kpiId: string | null,
//   drilldownData: DrillDownData
// ): DashboardData {
//   const updated = { ...dashboardData };
  
//   // Case 1: Attach to KPI card
//   if (kpiId && updated.cards) {
//     updated.cards = updated.cards.map(card => {
//       // Match by ID or title (depending on your structure)
//       if (card.id === kpiId || card.title.toLowerCase().includes(kpiId.toLowerCase())) {
//         console.log(`✅ Attaching drilldown to card: ${card.title}`);
//         return {
//           ...card,
//           drillDown: drilldownData
//         };
//       }
//       return card;
//     });
//   }
  
//   // Case 2: Attach to main chart
//   if (parentChartId && updated.charts) {
//     updated.charts = updated.charts.map(chart => {
//       // Match by ID or semantic_id
//       if (chart.id === parentChartId || chart.id?.includes(parentChartId)) {
//         console.log(`✅ Attaching drilldown to chart: ${chart.title}`);
//         return {
//           ...chart,
//           drillDownData: drilldownData
//         };
//       }
//       return chart;
//     });
//     console.log("Updated dashboard data", updated)
//   }
  
//   return updated;
// }
export function attachDrilldownToParent(
  dashboardData: DashboardData,
  parentChartId: string | null,
  kpiId: string | null,
  drilldownData: DrillDownData
): DashboardData {
  const updated = { ...dashboardData };
  
  console.log("🔍 Attempting to attach drilldown:");
  console.log("  - Parent Chart ID:", parentChartId);
  console.log("  - KPI ID:", kpiId);
  console.log("  - Available chart IDs:", updated.charts?.map(c => c.id));
  
  // Case 1: Attach to KPI card
  if (kpiId && updated.cards) {
    updated.cards = updated.cards.map(card => {
      const matches = 
        card.id === kpiId || 
        card.title?.toLowerCase().includes(kpiId.toLowerCase());
      
      if (matches) {
        console.log(`✅ Attaching drilldown to card: ${card.title}`);
        return {
          ...card,
          drillDownData: drilldownData  // Use drillDownData only
        };
      }
      return card;
    });
  }
  
  // Case 2: Attach to main chart
  if (parentChartId && updated.charts) {
    let found = false;
    updated.charts = updated.charts.map(chart => {
      // ✅ IMPROVED: Try multiple matching strategies
      const matches = 
        chart.id === parentChartId ||
        chart.id?.includes(parentChartId) ||
        parentChartId.includes(chart.id || '') ||
        chart.title?.toLowerCase().includes(parentChartId.toLowerCase());
      
      if (matches) {
        console.log(`✅ Attaching drilldown to chart: ${chart.title} (ID: ${chart.id})`);
        found = true;
        return {
          ...chart,
          drillDownData: drilldownData  // Use drillDownData only
        };
      }
      return chart;
    });
    console.log("Updated dashboard_data", updated);
    
    if (!found) {
      console.warn(`⚠️ No chart found matching parent_chart_id: ${parentChartId}`);
    }
  }
  
  return updated;
}
/**
 * Transform filter structure from API to UI format
 */
export function transformFilters(filters: any[]): any[] {
  return filters.map(filter => {
    const transformed: any = {
      field: filter.field,
      label: filter.label,
      type: filter.type === 'select' && filter.options ? 'multiselect' : filter.type
    };
    
    // Add options for select/multiselect
    if (filter.options) {
      transformed.options = filter.options;
    }
    
    // Add range bounds
    if (filter.min !== undefined) transformed.min = filter.min;
    if (filter.max !== undefined) transformed.max = filter.max;
    
    // Keep whereClause for query building
    if (filter.whereClause) {
      transformed.whereClause = filter.whereClause;
    }
    
    return transformed;
  });
}