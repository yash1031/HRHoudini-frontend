// Insight structure
interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

// Card structure
interface KPICard {
  id: string;
  title: string;
  value: string;
  field?: string;
  icon: string;
  color: string;
  note?: string;
  drillDown?: DrillDownData;
}

// Chart structure
interface ChartDataItem {
  name: string;
  value: number;
  percentage?: number;
}

interface ChartConfig {
  id: string;
  title: string;
  type: "bar" | "pie" | "line" | "horizontalBar";
  field: string;
  icon: string;
  data: ChartDataItem[];
  colors: string[];
  drillDown?: DrillDownData;
}

// DrillDown structure (nested cards, charts, insights)
interface DrillDownData {
  cards?: KPICard[];
  charts?: ChartConfig[];
  insights?: Insight;
}

// Analytics metadata
interface AnalyticsMetadata {
  totalRows: number;
  filename: string;
  totalColumns: number;
  generatedAt: string;
  numericFields: number;
  categoricalFields: number;
}

// Full dashboard data matching API response
interface DashboardData {
  cards: KPICard[];
  charts: ChartConfig[];
  metadata: AnalyticsMetadata;
}


const sample_dashboard_data: DashboardData = {
                "cards": [
                    {
                        "id": "c1",
                        "icon": "Users",
                        "color": "blue",
                        "title": "Total Employees",
                        "value": "512"
                    },
                    {
                        "id": "c2",
                        "icon": "Activity",
                        "color": "green",
                        "field": "employee_status",
                        "title": "Active Employees",
                        "value": "349 (68.2%)"
                    },
                    {
                        "id": "c3",
                        "icon": "Briefcase",
                        "color": "indigo",
                        "field": "employee_type",
                        "title": "Full-Time Workforce",
                        "value": "336 (65.6%)"
                    },
                    {
                        "id": "c4",
                        "icon": "AlertTriangle",
                        "color": "orange",
                        "field": "termination_type",
                        "title": "Voluntary Terminations",
                        "value": "89 (54.6%)"
                    }
                ],
                "charts": [
                    {
                        "id": "ch1",
                        "data": [
                            {
                                "name": "Full-Time",
                                "value": 336,
                                "percentage": 65.6
                            },
                            {
                                "name": "Part-Time",
                                "value": 176,
                                "percentage": 34.4
                            }
                        ],
                        "icon": "PieChart",
                        "type": "pie",
                        "field": "employee_type",
                        "title": "Employee Type Distribution",
                        "colors": [
                            "#3b82f6",
                            "#10b981"
                        ]
                    },
                    {
                        "id": "ch2",
                        "data": [
                            {
                                "name": "Sales",
                                "value": 180,
                                "percentage": 35.2
                            },
                            {
                                "name": "Customer Service",
                                "value": 111,
                                "percentage": 21.7
                            },
                            {
                                "name": "Management",
                                "value": 83,
                                "percentage": 16.2
                            },
                            {
                                "name": "Inventory",
                                "value": 56,
                                "percentage": 10.9
                            },
                            {
                                "name": "Security",
                                "value": 48,
                                "percentage": 9.4
                            },
                            {
                                "name": "Maintenance",
                                "value": 34,
                                "percentage": 6.6
                            }
                        ],
                        "icon": "BarChart",
                        "type": "bar",
                        "field": "department",
                        "title": "Department Breakdown",
                        "colors": [
                            "#3b82f6",
                            "#10b981",
                            "#f43f5e",
                            "#8b5cf6",
                            "#22d3ee"
                        ]
                    },
                    {
                        "id": "ch3",
                        "data": [
                            {
                                "name": "Voluntary",
                                "value": 89,
                                "percentage": 54.6
                            },
                            {
                                "name": "Involuntary",
                                "value": 74,
                                "percentage": 45.4
                            }
                        ],
                        "icon": "PieChart",
                        "type": "pie",
                        "field": "termination_type",
                        "title": "Termination Types",
                        "colors": [
                            "#10b981",
                            "#f43f5e"
                        ]
                    },
                    {
                        "id": "ch4",
                        "data": [
                            {
                                "name": "Southeast",
                                "value": 165,
                                "percentage": 32.2
                            },
                            {
                                "name": "Midwest",
                                "value": 141,
                                "percentage": 27.5
                            },
                            {
                                "name": "West",
                                "value": 128,
                                "percentage": 25
                            },
                            {
                                "name": "Northeast",
                                "value": 78,
                                "percentage": 15.2
                            }
                        ],
                        "icon": "BarChart",
                        "type": "bar",
                        "field": "region",
                        "title": "Regional Employee Distribution",
                        "colors": [
                            "#3b82f6",
                            "#10b981",
                            "#f43f5e",
                            "#8b5cf6"
                        ]
                    }
                ],
                "metadata": {
                    "filename": "sharpmedian.csv",
                    "totalRows": 512,
                    "generatedAt": "2025-10-19T10:37:23.832988",
                    "totalColumns": 39,
                    "numericFields": 0,
                    "categoricalFields": 21
                }
}

export default  sample_dashboard_data