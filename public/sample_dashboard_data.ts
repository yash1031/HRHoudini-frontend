// Insight structure
interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

// Card structure
interface KPICard {
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
                        "value": "512",
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Users",
                                    "color": "blue",
                                    "field": "employee_status",
                                    "title": "Average Employee Tenure",
                                    "value": "3.2 years"
                                },
                                {
                                    "icon": "TrendingUp",
                                    "color": "green",
                                    "field": "employee_status",
                                    "title": "Employee Growth Rate",
                                    "value": "5.6%"
                                }
                            ],
                            "charts": [
                                {
                                    "data": [
                                        {
                                            "name": "Active",
                                            "value": 349,
                                            "percentage": 68.2
                                        },
                                        {
                                            "name": "Terminated",
                                            "value": 163,
                                            "percentage": 31.8
                                        }
                                    ],
                                    "icon": "BarChart",
                                    "type": "bar",
                                    "field": "employee_status",
                                    "title": "Employee Headcount by Year",
                                    "colors": [
                                        "#3b82f6"
                                    ]
                                },
                                {
                                    "data": [
                                        {
                                            "name": "Active",
                                            "value": 349,
                                            "percentage": 68.2
                                        },
                                        {
                                            "name": "Terminated",
                                            "value": 163,
                                            "percentage": 31.8
                                        }
                                    ],
                                    "icon": "PieChart",
                                    "type": "pie",
                                    "field": "employee_status",
                                    "title": "Employee Status Composition",
                                    "colors": [
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Slow employee growth rate",
                                    "High turnover potential",
                                    "Limited workforce expansion"
                                ],
                                "recommended_actions": [
                                    "Implement aggressive recruitment strategies",
                                    "Develop comprehensive retention programs",
                                    "Enhance employee value proposition"
                                ]
                            }
                        }
                    },
                    {
                        "id": "c2",
                        "icon": "Activity",
                        "color": "green",
                        "field": "employee_status",
                        "title": "Active Employees",
                        "value": "349 (68.2%)",
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Activity",
                                    "color": "green",
                                    "field": "employee_status",
                                    "title": "Active Employee Productivity",
                                    "value": "92%"
                                },
                                {
                                    "icon": "Users",
                                    "color": "blue",
                                    "field": "ethnicity",
                                    "title": "Active Employee Diversity",
                                    "value": "4 ethnicities"
                                }
                            ],
                            "charts": [
                                {
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
                                    "title": "Active Employees by Department",
                                    "colors": [
                                        "#3b82f6"
                                    ]
                                },
                                {
                                    "data": [
                                        {
                                            "name": "Female",
                                            "value": 257,
                                            "percentage": 50.2
                                        },
                                        {
                                            "name": "Male",
                                            "value": 255,
                                            "percentage": 49.8
                                        }
                                    ],
                                    "icon": "PieChart",
                                    "type": "pie",
                                    "field": "gender",
                                    "title": "Active Employee Gender Distribution",
                                    "colors": [
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Potential productivity plateau",
                                    "Uneven department staffing",
                                    "Limited management pipeline"
                                ],
                                "recommended_actions": [
                                    "Implement cross-departmental training",
                                    "Develop leadership development programs",
                                    "Balance workforce allocation"
                                ]
                            }
                        }
                    },
                    {
                        "id": "c3",
                        "icon": "Briefcase",
                        "color": "indigo",
                        "field": "employee_type",
                        "title": "Full-Time Workforce",
                        "value": "336 (65.6%)",
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Activity",
                                    "color": "green",
                                    "field": "annual_salary",
                                    "title": "Full-Time Employee Compensation",
                                    "value": "$47,500 avg"
                                },
                                {
                                    "icon": "Users",
                                    "color": "blue",
                                    "field": "salary_or_hourly",
                                    "title": "Full-Time Employee Benefits",
                                    "value": "98% Benefits"
                                }
                            ],
                            "charts": [
                                {
                                    "data": [
                                        {
                                            "name": "SLS001",
                                            "value": 133,
                                            "percentage": 26
                                        },
                                        {
                                            "name": "CS001",
                                            "value": 111,
                                            "percentage": 21.7
                                        },
                                        {
                                            "name": "INV001",
                                            "value": 56,
                                            "percentage": 10.9
                                        },
                                        {
                                            "name": "SEC001",
                                            "value": 48,
                                            "percentage": 9.4
                                        },
                                        {
                                            "name": "SLS002",
                                            "value": 47,
                                            "percentage": 9.2
                                        },
                                        {
                                            "name": "AMGR001",
                                            "value": 43,
                                            "percentage": 8.4
                                        },
                                        {
                                            "name": "MGR001",
                                            "value": 40,
                                            "percentage": 7.8
                                        },
                                        {
                                            "name": "MNT001",
                                            "value": 34,
                                            "percentage": 6.6
                                        }
                                    ],
                                    "icon": "BarChart",
                                    "type": "bar",
                                    "field": "job_code",
                                    "title": "Full-Time Employees by Job Code",
                                    "colors": [
                                        "#3b82f6"
                                    ]
                                },
                                {
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
                                    "icon": "PieChart",
                                    "type": "pie",
                                    "field": "region",
                                    "title": "Full-Time Employee Location Distribution",
                                    "colors": [
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Compensation variability",
                                    "Uneven regional distribution",
                                    "Limited job code diversity"
                                ],
                                "recommended_actions": [
                                    "Standardize compensation packages",
                                    "Expand regional recruitment",
                                    "Create more specialized job roles"
                                ]
                            }
                        }
                    },
                    {
                        "id": "c4",
                        "icon": "AlertTriangle",
                        "color": "orange",
                        "field": "termination_type",
                        "title": "Voluntary Terminations",
                        "value": "89 (54.6%)",
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Activity",
                                    "color": "red",
                                    "field": "termination_type",
                                    "title": "Voluntary Termination Rate",
                                    "value": "12%"
                                },
                                {
                                    "icon": "TrendingUp",
                                    "color": "blue",
                                    "field": "termination_type",
                                    "title": "Termination Cost Impact",
                                    "value": "$450K/year"
                                }
                            ],
                            "charts": [
                                {
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
                                    "title": "Voluntary Terminations by Department",
                                    "colors": [
                                        "#3b82f6"
                                    ]
                                },
                                {
                                    "data": [
                                        {
                                            "name": "Active",
                                            "value": 349,
                                            "percentage": 68.2
                                        },
                                        {
                                            "name": "Terminated",
                                            "value": 163,
                                            "percentage": 31.8
                                        }
                                    ],
                                    "icon": "PieChart",
                                    "type": "pie",
                                    "field": "employee_status",
                                    "title": "Voluntary Termination by Tenure",
                                    "colors": [
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "High early-stage employee turnover",
                                    "Significant departmental attrition",
                                    "Substantial termination-related costs"
                                ],
                                "recommended_actions": [
                                    "Enhance onboarding and integration programs",
                                    "Develop targeted retention strategies",
                                    "Conduct comprehensive exit interviews"
                                ]
                            }
                        }
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
                        ],
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Users",
                                    "color": "blue",
                                    "field": "employee_type",
                                    "title": "Employee Type Diversity",
                                    "value": "2 Types"
                                },
                                {
                                    "icon": "TrendingUp",
                                    "color": "green",
                                    "field": "employee_type",
                                    "title": "Part-Time to Full-Time Conversion",
                                    "value": "18%"
                                }
                            ],
                            "charts": [
                                {
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
                                    "title": "Employee Type by Department",
                                    "colors": [
                                        "#3b82f6"
                                    ]
                                },
                                {
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
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Limited part-time workforce flexibility",
                                    "Uneven department employment types",
                                    "Potential underutilization of part-time talent"
                                ],
                                "recommended_actions": [
                                    "Develop flexible work arrangements",
                                    "Create part-time career progression paths",
                                    "Implement strategic part-time hiring"
                                ]
                            }
                        }
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
                        ],
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Activity",
                                    "color": "green",
                                    "field": "department",
                                    "title": "Department Productivity Index",
                                    "value": "87%"
                                },
                                {
                                    "icon": "Users",
                                    "color": "blue",
                                    "field": "department",
                                    "title": "Department Diversity Score",
                                    "value": "4/5"
                                }
                            ],
                            "charts": [
                                {
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
                                    "title": "Department Employee Distribution",
                                    "colors": [
                                        "#3b82f6"
                                    ]
                                },
                                {
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
                                    "icon": "PieChart",
                                    "type": "pie",
                                    "field": "department",
                                    "title": "Department Performance Ratio",
                                    "colors": [
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Unbalanced department staffing",
                                    "Performance variations across departments",
                                    "Limited management representation"
                                ],
                                "recommended_actions": [
                                    "Optimize department resource allocation",
                                    "Implement cross-departmental training",
                                    "Develop leadership development programs"
                                ]
                            }
                        }
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
                        ],
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Activity",
                                    "color": "red",
                                    "field": "termination_type",
                                    "title": "Termination Cost Impact",
                                    "value": "$450K/year"
                                },
                                {
                                    "icon": "TrendingUp",
                                    "color": "blue",
                                    "field": "termination_type",
                                    "title": "Termination Risk Index",
                                    "value": "Medium"
                                }
                            ],
                            "charts": [
                                {
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
                                    "title": "Termination Types by Department",
                                    "colors": [
                                        "#3b82f6"
                                    ]
                                },
                                {
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
                                    "title": "Termination Type Distribution",
                                    "colors": [
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "High voluntary termination rate",
                                    "Significant termination-related expenses",
                                    "Potential workplace satisfaction issues"
                                ],
                                "recommended_actions": [
                                    "Conduct comprehensive exit interviews",
                                    "Develop targeted retention strategies",
                                    "Improve employee engagement programs"
                                ]
                            }
                        }
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
                        ],
                        "drillDown": {
                            "cards": [
                                {
                                    "icon": "Users",
                                    "color": "blue",
                                    "field": "region",
                                    "title": "Regional Workforce Diversity",
                                    "value": "4 Regions"
                                },
                                {
                                    "icon": "Activity",
                                    "color": "green",
                                    "field": "region",
                                    "title": "Regional Performance Variance",
                                    "value": "±12%"
                                }
                            ],
                            "charts": [
                                {
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
                                        "#3b82f6"
                                    ]
                                },
                                {
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
                                    "icon": "PieChart",
                                    "type": "pie",
                                    "field": "region",
                                    "title": "Regional Performance Ratio",
                                    "colors": [
                                        "#10b981",
                                        "#ef4444"
                                    ]
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Uneven regional employee distribution",
                                    "Performance variations across regions",
                                    "Limited geographic talent pool"
                                ],
                                "recommended_actions": [
                                    "Develop region-specific recruitment strategies",
                                    "Implement standardized performance metrics",
                                    "Create regional talent development programs"
                                ]
                            }
                        }
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