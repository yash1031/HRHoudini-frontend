// Insight structure
interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

// Card structure
interface KPICard {
  id?: string;
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
  id?: string;
  title: string;
  type: "bar" | "pie" | "line" | "horizontalBar";
  field: string;
  icon: string;
  queryObject?: any;
  data: ChartDataItem[];
  colors: string[];
  drillDown?: DrillDownData;
  _debugSQL?: string;
}

// DrillDown structure (nested cards, charts, insights)
interface DrillDownData {
  cards?: KPICard[];
  charts?: ChartConfig[];
  insights?: Insight;
  filters?: any;
}

// Analytics metadata
interface AnalyticsMetadata {
  totalRows: number;
  filename: string;
  totalColumns: number;
  generatedAt: string;
  parquetDataUrl?: string;
  numericFields: number;
  numericFieldsList?: any;
  columnTypes?: any;
  categoricalFields: number;
  categoricalFieldsList: string[];
  columns?: string[];
  piiFields?: string[];
  tokenMapsUrl?: string;
}

// Full dashboard data matching API response
interface DashboardData {
  cards: KPICard[];
  charts: ChartConfig[];
  metadata: AnalyticsMetadata;
}


// const sample_dashboard_data: DashboardData = {
//                 "cards": [
//                     {
//                         "id": "c1",
//                         "icon": "Users",
//                         "color": "blue",
//                         "title": "Total Employees",
//                         "value": "512"
//                     },
//                     {
//                         "id": "c2",
//                         "icon": "Activity",
//                         "color": "green",
//                         "field": "employee_status",
//                         "title": "Active Employees",
//                         "value": "349 (68.2%)"
//                     },
//                     {
//                         "id": "c3",
//                         "icon": "Briefcase",
//                         "color": "indigo",
//                         "field": "employee_type",
//                         "title": "Full-Time Workforce",
//                         "value": "336 (65.6%)"
//                     },
//                     {
//                         "id": "c4",
//                         "icon": "AlertTriangle",
//                         "color": "orange",
//                         "field": "termination_type",
//                         "title": "Voluntary Terminations",
//                         "value": "89 (54.6%)"
//                     }
//                 ],
//                 "charts": [
//                     {
//                         "id": "ch1",
//                         "data": [
//                             {
//                                 "name": "Full-Time",
//                                 "value": 336,
//                                 "percentage": 65.6
//                             },
//                             {
//                                 "name": "Part-Time",
//                                 "value": 176,
//                                 "percentage": 34.4
//                             }
//                         ],
//                         "icon": "PieChart",
//                         "type": "pie",
//                         "field": "employee_type",
//                         "title": "Employee Type Distribution",
//                         "colors": [
//                             "#3b82f6",
//                             "#10b981"
//                         ]
//                     },
//                     {
//                         "id": "ch2",
//                         "data": [
//                             {
//                                 "name": "Sales",
//                                 "value": 180,
//                                 "percentage": 35.2
//                             },
//                             {
//                                 "name": "Customer Service",
//                                 "value": 111,
//                                 "percentage": 21.7
//                             },
//                             {
//                                 "name": "Management",
//                                 "value": 83,
//                                 "percentage": 16.2
//                             },
//                             {
//                                 "name": "Inventory",
//                                 "value": 56,
//                                 "percentage": 10.9
//                             },
//                             {
//                                 "name": "Security",
//                                 "value": 48,
//                                 "percentage": 9.4
//                             },
//                             {
//                                 "name": "Maintenance",
//                                 "value": 34,
//                                 "percentage": 6.6
//                             }
//                         ],
//                         "icon": "BarChart",
//                         "type": "bar",
//                         "field": "department",
//                         "title": "Department Breakdown",
//                         "colors": [
//                             "#3b82f6",
//                             "#10b981",
//                             "#f43f5e",
//                             "#8b5cf6",
//                             "#22d3ee"
//                         ]
//                     },
//                     {
//                         "id": "ch3",
//                         "data": [
//                             {
//                                 "name": "Voluntary",
//                                 "value": 89,
//                                 "percentage": 54.6
//                             },
//                             {
//                                 "name": "Involuntary",
//                                 "value": 74,
//                                 "percentage": 45.4
//                             }
//                         ],
//                         "icon": "PieChart",
//                         "type": "pie",
//                         "field": "termination_type",
//                         "title": "Termination Types",
//                         "colors": [
//                             "#10b981",
//                             "#f43f5e"
//                         ]
//                     },
//                     {
//                         "id": "ch4",
//                         "data": [
//                             {
//                                 "name": "Southeast",
//                                 "value": 165,
//                                 "percentage": 32.2
//                             },
//                             {
//                                 "name": "Midwest",
//                                 "value": 141,
//                                 "percentage": 27.5
//                             },
//                             {
//                                 "name": "West",
//                                 "value": 128,
//                                 "percentage": 25
//                             },
//                             {
//                                 "name": "Northeast",
//                                 "value": 78,
//                                 "percentage": 15.2
//                             }
//                         ],
//                         "icon": "BarChart",
//                         "type": "bar",
//                         "field": "region",
//                         "title": "Regional Employee Distribution",
//                         "colors": [
//                             "#3b82f6",
//                             "#10b981",
//                             "#f43f5e",
//                             "#8b5cf6"
//                         ]
//                     }
//                 ],
//                 "metadata": {
//                     "filename": "sharpmedian.csv",
//                     "totalRows": 512,
//                     "generatedAt": "2025-10-19T10:37:23.832988",
//                     "totalColumns": 39,
//                     "numericFields": 0,
//                     "categoricalFields": 21
//                 }
// }
const sample_dashboard_data: DashboardData =
{
    "cards": [
        {
            "id": "c1",
            "title": "Total Employees",
            "icon": "Users",
            "color": "blue",
            "value": "512",
            "drillDown": {
                "cards": [
                    {
                        "title": "Total Employees",
                        "icon": "Users",
                        "color": "blue",
                        "value": "512",
                        "field": "employee_status"
                    },
                    {
                        "title": "Employee Distribution",
                        "icon": "Activity",
                        "color": "green",
                        "value": "6 Departments",
                        "field": "department"
                    }
                ],
                "charts": [
                    {
                        "title": "Employees by Department",
                        "icon": "BarChart",
                        "type": "bar",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    },
                    {
                        "title": "Employees by Region",
                        "icon": "PieChart",
                        "type": "pie",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "region",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"region\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "region",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "region"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"region\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"region\" IS NOT NULL GROUP BY \"region\" ORDER BY value DESC"
                    }
                ],
                "insights": {
                    "critical_issues": [
                        "High employee count across multiple departments",
                        "Diverse regional distribution",
                        "Mixed employment type composition"
                    ],
                    "recommended_actions": [
                        "Optimize workforce allocation",
                        "Review regional staffing strategies",
                        "Analyze employment type effectiveness"
                    ]
                },
                "filters": [
                    {
                        "field": "department",
                        "label": "Department",
                        "type": "multiselect",
                        "options": [
                            "Sales",
                            "Customer Service",
                            "Management",
                            "Inventory",
                            "Security",
                            "Maintenance"
                        ],
                        "whereClause": {
                            "field": "department",
                            "operator": "IN",
                            "paramNames": [
                                "$department_values"
                            ],
                            "type": "dynamic"
                        }
                    },
                    {
                        "field": "region",
                        "label": "Region",
                        "type": "multiselect",
                        "options": [
                            "Southeast",
                            "Midwest",
                            "West",
                            "Northeast"
                        ],
                        "whereClause": {
                            "field": "region",
                            "operator": "IN",
                            "paramNames": [
                                "$region_values"
                            ],
                            "type": "dynamic"
                        }
                    }
                ]
            }
        },
        {
            "id": "c2",
            "title": "Active Employees",
            "icon": "Activity",
            "color": "green",
            "field": "employee_status",
            "value": "349",
            "drillDown": {
                "cards": [
                    {
                        "title": "Active Employees",
                        "icon": "Users",
                        "color": "green",
                        "value": "Active",
                        "field": "employee_status"
                    },
                    {
                        "title": "Active Employee Percentage",
                        "icon": "TrendingUp",
                        "color": "blue",
                        "value": "80%",
                        "field": "employee_status"
                    }
                ],
                "charts": [
                    {
                        "title": "Active Employees by Department",
                        "icon": "BarChart",
                        "type": "bar",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    },
                    {
                        "title": "Active Employees by Job Title",
                        "icon": "PieChart",
                        "type": "pie",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "job_title",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"job_title\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "job_title",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "job_title"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"job_title\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"job_title\" IS NOT NULL GROUP BY \"job_title\" ORDER BY value DESC"
                    }
                ],
                "insights": {
                    "critical_issues": [
                        "Variation in active employee distribution",
                        "Potential departmental staffing imbalances",
                        "Diverse job title representation"
                    ],
                    "recommended_actions": [
                        "Investigate active employee distribution",
                        "Balance departmental staffing",
                        "Review job title effectiveness"
                    ]
                },
                "filters": [
                    {
                        "field": "department",
                        "label": "Department",
                        "type": "multiselect",
                        "options": [
                            "Sales",
                            "Customer Service",
                            "Management",
                            "Inventory",
                            "Security",
                            "Maintenance"
                        ],
                        "whereClause": {
                            "field": "department",
                            "operator": "IN",
                            "paramNames": [
                                "$department_values"
                            ],
                            "type": "dynamic"
                        }
                    },
                    {
                        "field": "job_title",
                        "label": "Job Title",
                        "type": "multiselect",
                        "options": [
                            "Sales Associate",
                            "Customer Service Rep",
                            "Inventory Specialist",
                            "Security Guard",
                            "Senior Sales Associate",
                            "Assistant Manager",
                            "Store Manager",
                            "Maintenance Technician"
                        ],
                        "whereClause": {
                            "field": "job_title",
                            "operator": "IN",
                            "paramNames": [
                                "$job_title_values"
                            ],
                            "type": "dynamic"
                        }
                    }
                ]
            }
        },
        {
            "id": "c3",
            "title": "Turnover Rate",
            "icon": "TrendingUp",
            "color": "red",
            "field": "termination_type",
            "value": "31.8%",
            "drillDown": {
                "cards": [
                    {
                        "title": "Turnover Rate",
                        "icon": "TrendingUp",
                        "color": "red",
                        "value": "20%",
                        "field": "termination_type"
                    },
                    {
                        "title": "Termination Type Distribution",
                        "icon": "Activity",
                        "color": "orange",
                        "value": "Voluntary/Involuntary",
                        "field": "termination_type"
                    }
                ],
                "charts": [
                    {
                        "title": "Turnover by Department",
                        "icon": "BarChart",
                        "type": "bar",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    },
                    {
                        "title": "Termination Type Breakdown",
                        "icon": "PieChart",
                        "type": "pie",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "termination_type",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"termination_type\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "termination_type",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "termination_type"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"termination_type\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"termination_type\" IS NOT NULL GROUP BY \"termination_type\" ORDER BY value DESC"
                    }
                ],
                "insights": {
                    "critical_issues": [
                        "Significant turnover across departments",
                        "Mixed termination type patterns",
                        "Potential retention challenges"
                    ],
                    "recommended_actions": [
                        "Develop targeted retention strategies",
                        "Analyze termination type root causes",
                        "Implement employee engagement programs"
                    ]
                },
                "filters": [
                    {
                        "field": "department",
                        "label": "Department",
                        "type": "multiselect",
                        "options": [
                            "Sales",
                            "Customer Service",
                            "Management",
                            "Inventory",
                            "Security",
                            "Maintenance"
                        ],
                        "whereClause": {
                            "field": "department",
                            "operator": "IN",
                            "paramNames": [
                                "$department_values"
                            ],
                            "type": "dynamic"
                        }
                    },
                    {
                        "field": "termination_type",
                        "label": "Termination Type",
                        "type": "select",
                        "options": [
                            "Voluntary",
                            "Involuntary"
                        ],
                        "whereClause": {
                            "field": "termination_type",
                            "operator": "IN",
                            "paramNames": [
                                "$termination_type_values"
                            ],
                            "type": "dynamic"
                        }
                    }
                ]
            }
        },
        {
            "id": "c4",
            "title": "Gender Balance",
            "icon": "Globe",
            "color": "purple",
            "value": "50.2% Female, 49.8% Male",
            "drillDown": {
                "cards": [
                    {
                        "title": "Gender Diversity",
                        "icon": "Users",
                        "color": "purple",
                        "value": "Balanced",
                        "field": "gender"
                    },
                    {
                        "title": "Gender Representation",
                        "icon": "Award",
                        "color": "green",
                        "value": "50/50 Split",
                        "field": "gender"
                    }
                ],
                "charts": [
                    {
                        "title": "Gender Distribution by Department",
                        "icon": "BarChart",
                        "type": "bar",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    },
                    {
                        "title": "Gender Distribution by Job Title",
                        "icon": "PieChart",
                        "type": "pie",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [],
                        "field": "job_title",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"job_title\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "job_title",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "job_title"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"job_title\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"job_title\" IS NOT NULL GROUP BY \"job_title\" ORDER BY value DESC"
                    }
                ],
                "insights": {
                    "critical_issues": [
                        "Gender representation varies by department",
                        "Potential departmental gender imbalances",
                        "Need for inclusive hiring practices"
                    ],
                    "recommended_actions": [
                        "Monitor gender distribution across roles",
                        "Implement diversity and inclusion initiatives",
                        "Review hiring and promotion practices"
                    ]
                },
                "filters": [
                    {
                        "field": "department",
                        "label": "Department",
                        "type": "multiselect",
                        "options": [
                            "Sales",
                            "Customer Service",
                            "Management",
                            "Inventory",
                            "Security",
                            "Maintenance"
                        ],
                        "whereClause": {
                            "field": "department",
                            "operator": "IN",
                            "paramNames": [
                                "$department_values"
                            ],
                            "type": "dynamic"
                        }
                    },
                    {
                        "field": "job_title",
                        "label": "Job Title",
                        "type": "multiselect",
                        "options": [
                            "Sales Associate",
                            "Customer Service Rep",
                            "Inventory Specialist",
                            "Security Guard",
                            "Senior Sales Associate",
                            "Assistant Manager",
                            "Store Manager",
                            "Maintenance Technician"
                        ],
                        "whereClause": {
                            "field": "job_title",
                            "operator": "IN",
                            "paramNames": [
                                "$job_title_values"
                            ],
                            "type": "dynamic"
                        }
                    }
                ]
            }
        }
    ],
    "charts": [
        {
            "id": "ch1",
            "title": "Gender Distribution",
            "icon": "PieChart",
            "type": "pie",
            "colors": [
                "#3b82f6",
                "#10b981"
            ],
            "field": "gender",
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
            "queryObject": {
                "select": {
                    "columns": [
                        {
                            "expression": "\"gender\"",
                            "alias": "name"
                        },
                        {
                            "expression": "COUNT(*)",
                            "alias": "value"
                        },
                        {
                            "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                            "alias": "percentage"
                        }
                    ]
                },
                "from": {
                    "type": "parquet",
                    "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                },
                "where": [
                    {
                        "field": "gender",
                        "operator": "IS NOT NULL",
                        "type": "static"
                    }
                ],
                "groupBy": [
                    "gender"
                ],
                "orderBy": [
                    {
                        "field": "value",
                        "direction": "DESC"
                    }
                ],
                "parameters": {}
            },
            "_debugSQL": "SELECT \"gender\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"gender\" IS NOT NULL GROUP BY \"gender\" ORDER BY value DESC",
            "drillDown": {
                "cards": [
                    {
                        "title": "Gender Representation",
                        "icon": "Users",
                        "color": "blue",
                        "value": "50/50 Split",
                        "field": "gender"
                    },
                    {
                        "title": "Gender Diversity Score",
                        "icon": "Award",
                        "color": "green",
                        "value": "High",
                        "field": "gender"
                    }
                ],
                "charts": [
                    {
                        "title": "Gender Distribution by Department",
                        "icon": "BarChart",
                        "type": "bar",
                        "colors": [
                            "#3b82f6"
                        ],
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
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    },
                    {
                        "title": "Gender Distribution by Job Title",
                        "icon": "PieChart",
                        "type": "pie",
                        "colors": [
                            "#3b82f6"
                        ],
                        "data": [
                            {
                                "name": "Sales Associate",
                                "value": 133,
                                "percentage": 26
                            },
                            {
                                "name": "Customer Service Rep",
                                "value": 111,
                                "percentage": 21.7
                            },
                            {
                                "name": "Inventory Specialist",
                                "value": 56,
                                "percentage": 10.9
                            },
                            {
                                "name": "Security Guard",
                                "value": 48,
                                "percentage": 9.4
                            },
                            {
                                "name": "Senior Sales Associate",
                                "value": 47,
                                "percentage": 9.2
                            },
                            {
                                "name": "Assistant Manager",
                                "value": 43,
                                "percentage": 8.4
                            },
                            {
                                "name": "Store Manager",
                                "value": 40,
                                "percentage": 7.8
                            },
                            {
                                "name": "Maintenance Technician",
                                "value": 34,
                                "percentage": 6.6
                            }
                        ],
                        "field": "job_title",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"job_title\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "job_title",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "job_title"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"job_title\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"job_title\" IS NOT NULL GROUP BY \"job_title\" ORDER BY value DESC"
                    }
                ],
                "insights": {
                    "critical_issues": [
                        "Gender distribution varies by department",
                        "Potential job title gender disparities",
                        "Need for continued diversity efforts"
                    ],
                    "recommended_actions": [
                        "Analyze gender representation across roles",
                        "Develop targeted diversity programs",
                        "Ensure equal opportunities for all"
                    ]
                },
                "filters": [
                    {
                        "field": "department",
                        "label": "Department",
                        "type": "multiselect",
                        "options": [
                            "Sales",
                            "Customer Service",
                            "Management",
                            "Inventory",
                            "Security",
                            "Maintenance"
                        ],
                        "whereClause": {
                            "field": "department",
                            "operator": "IN",
                            "paramNames": [
                                "$department_values"
                            ],
                            "type": "dynamic"
                        }
                    },
                    {
                        "field": "job_title",
                        "label": "Job Title",
                        "type": "multiselect",
                        "options": [
                            "Sales Associate",
                            "Customer Service Rep",
                            "Inventory Specialist",
                            "Security Guard",
                            "Senior Sales Associate",
                            "Assistant Manager",
                            "Store Manager",
                            "Maintenance Technician"
                        ],
                        "whereClause": {
                            "field": "job_title",
                            "operator": "IN",
                            "paramNames": [
                                "$job_title_values"
                            ],
                            "type": "dynamic"
                        }
                    }
                ]
            }
        },
        {
            "id": "ch2",
            "title": "Employee Turnover by Department",
            "icon": "BarChart",
            "type": "bar",
            "colors": [
                "#3b82f6",
                "#10b981"
            ],
            "field": "department",
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
            "queryObject": {
                "select": {
                    "columns": [
                        {
                            "expression": "\"department\"",
                            "alias": "name"
                        },
                        {
                            "expression": "COUNT(*)",
                            "alias": "value"
                        },
                        {
                            "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                            "alias": "percentage"
                        }
                    ]
                },
                "from": {
                    "type": "parquet",
                    "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                },
                "where": [
                    {
                        "field": "department",
                        "operator": "IS NOT NULL",
                        "type": "static"
                    }
                ],
                "groupBy": [
                    "department"
                ],
                "orderBy": [
                    {
                        "field": "value",
                        "direction": "DESC"
                    }
                ],
                "parameters": {}
            },
            "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC",
            "drillDown": {
                "cards": [
                    {
                        "title": "Turnover by Department",
                        "icon": "TrendingUp",
                        "color": "red",
                        "value": "Varies",
                        "field": "department"
                    },
                    {
                        "title": "Department Retention Rate",
                        "icon": "Activity",
                        "color": "green",
                        "value": "80%",
                        "field": "department"
                    }
                ],
                "charts": [
                    {
                        "title": "Employee Turnover by Department",
                        "icon": "BarChart",
                        "type": "bar",
                        "colors": [
                            "#3b82f6"
                        ],
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
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    },
                    {
                        "title": "Termination Type by Department",
                        "icon": "PieChart",
                        "type": "pie",
                        "colors": [
                            "#3b82f6"
                        ],
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
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    }
                ],
                "insights": {
                    "critical_issues": [
                        "Inconsistent turnover rates across departments",
                        "Variation in termination types",
                        "Potential departmental retention challenges"
                    ],
                    "recommended_actions": [
                        "Investigate departmental turnover patterns",
                        "Develop targeted retention strategies",
                        "Address department-specific retention issues"
                    ]
                },
                "filters": [
                    {
                        "field": "department",
                        "label": "Department",
                        "type": "multiselect",
                        "options": [
                            "Sales",
                            "Customer Service",
                            "Management",
                            "Inventory",
                            "Security",
                            "Maintenance"
                        ],
                        "whereClause": {
                            "field": "department",
                            "operator": "IN",
                            "paramNames": [
                                "$department_values"
                            ],
                            "type": "dynamic"
                        }
                    }
                ]
            }
        },
        {
            "id": "ch3",
            "title": "Termination Type",
            "icon": "PieChart",
            "type": "pie",
            "colors": [
                "#3b82f6",
                "#10b981"
            ],
            "field": "termination_type",
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
            "queryObject": {
                "select": {
                    "columns": [
                        {
                            "expression": "\"termination_type\"",
                            "alias": "name"
                        },
                        {
                            "expression": "COUNT(*)",
                            "alias": "value"
                        },
                        {
                            "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                            "alias": "percentage"
                        }
                    ]
                },
                "from": {
                    "type": "parquet",
                    "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                },
                "where": [
                    {
                        "field": "termination_type",
                        "operator": "IS NOT NULL",
                        "type": "static"
                    }
                ],
                "groupBy": [
                    "termination_type"
                ],
                "orderBy": [
                    {
                        "field": "value",
                        "direction": "DESC"
                    }
                ],
                "parameters": {}
            },
            "_debugSQL": "SELECT \"termination_type\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"termination_type\" IS NOT NULL GROUP BY \"termination_type\" ORDER BY value DESC",
            "drillDown": {
                "cards": [
                    {
                        "title": "Termination Type Distribution",
                        "icon": "Activity",
                        "color": "red",
                        "value": "Voluntary/Involuntary",
                        "field": "termination_type"
                    },
                    {
                        "title": "Termination Rate",
                        "icon": "TrendingUp",
                        "color": "orange",
                        "value": "20%",
                        "field": "termination_type"
                    }
                ],
                "charts": [
                    {
                        "title": "Termination Type by Department",
                        "icon": "BarChart",
                        "type": "bar",
                        "colors": [
                            "#3b82f6"
                        ],
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
                        "field": "department",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"department\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "department",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "department"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"department\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"department\" IS NOT NULL GROUP BY \"department\" ORDER BY value DESC"
                    },
                    {
                        "title": "Termination Type Breakdown",
                        "icon": "PieChart",
                        "type": "pie",
                        "colors": [
                            "#3b82f6"
                        ],
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
                        "field": "termination_type",
                        "queryObject": {
                            "select": {
                                "columns": [
                                    {
                                        "expression": "\"termination_type\"",
                                        "alias": "name"
                                    },
                                    {
                                        "expression": "COUNT(*)",
                                        "alias": "value"
                                    },
                                    {
                                        "expression": "ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)",
                                        "alias": "percentage"
                                    }
                                ]
                            },
                            "from": {
                                "type": "parquet",
                                "source": process.env.NEXT_PUBLIC_PARQUET_DATA_URL
                            },
                            "where": [
                                {
                                    "field": "termination_type",
                                    "operator": "IS NOT NULL",
                                    "type": "static"
                                }
                            ],
                            "groupBy": [
                                "termination_type"
                            ],
                            "orderBy": [
                                {
                                    "field": "value",
                                    "direction": "DESC"
                                }
                            ],
                            "parameters": {}
                        },
                        "_debugSQL": "SELECT \"termination_type\" as name, COUNT(*) as value, ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage FROM read_parquet('https://hrhoudini-cdn.s3.us-east-1.amazonaws.com/sample_file_data/masked-rdata/data_masked.parquet') WHERE \"termination_type\" IS NOT NULL GROUP BY \"termination_type\" ORDER BY value DESC"
                    }
                ],
                "insights": {
                    "critical_issues": [
                        "Mixed termination type patterns",
                        "Variation across departments",
                        "Potential retention challenges"
                    ],
                    "recommended_actions": [
                        "Analyze termination type root causes",
                        "Develop targeted retention strategies",
                        "Implement employee engagement programs"
                    ]
                },
                "filters": [
                    {
                        "field": "department",
                        "label": "Department",
                        "type": "multiselect",
                        "options": [
                            "Sales",
                            "Customer Service",
                            "Management",
                            "Inventory",
                            "Security",
                            "Maintenance"
                        ],
                        "whereClause": {
                            "field": "department",
                            "operator": "IN",
                            "paramNames": [
                                "$department_values"
                            ],
                            "type": "dynamic"
                        }
                    },
                    {
                        "field": "termination_type",
                        "label": "Termination Type",
                        "type": "select",
                        "options": [
                            "Voluntary",
                            "Involuntary"
                        ],
                        "whereClause": {
                            "field": "termination_type",
                            "operator": "IN",
                            "paramNames": [
                                "$termination_type_values"
                            ],
                            "type": "dynamic"
                        }
                    }
                ]
            }
        }
    ],
    "metadata": {
        "filename": "sharpmedian.parquet",
        "totalRows": 512,
        "totalColumns": 39,
        "generatedAt": "2025-11-13T13:32:52.270198",
        "numericFields": 0,
        "categoricalFields": 21,
        "parquetDataUrl": process.env.NEXT_PUBLIC_PARQUET_DATA_URL,
        "columns": [
            "employee_id",
            "employee_status",
            "employee_type",
            "employee_name",
            "original_hire_date",
            "last_hire_date",
            "seniority_date",
            "termination_date",
            "termination_reason_code",
            "termination_reason",
            "termination_type",
            "company",
            "organization",
            "department",
            "job_code",
            "job_title",
            "supervisor_employee_number",
            "supervisor_name",
            "location",
            "region",
            "address___work",
            "city___work",
            "stateorprovince___work",
            "postalcode___work",
            "country___work",
            "address___home",
            "city___home",
            "stateorprovince___home",
            "postalcode___home",
            "country___home",
            "salary_or_hourly",
            "hourly_rate",
            "annual_salary",
            "local_currency_code",
            "gender",
            "ethnicity",
            "date_of_birth",
            "email_address",
            "remoteflag"
        ],
        "numericFieldsList": [],
        "categoricalFieldsList": [
            "employee_status",
            "employee_type",
            "termination_type",
            "department",
            "job_code",
            "job_title",
            "supervisor_employee_number",
            "supervisor_name",
            "location",
            "region",
            "address___work",
            "city___work",
            "stateorprovince___work",
            "postalcode___work",
            "stateorprovince___home",
            "country___home",
            "salary_or_hourly",
            "hourly_rate",
            "annual_salary",
            "gender",
            "ethnicity"
        ],
        "columnTypes": {
            "employee_id": "high_cardinality",
            "employee_status": "categorical",
            "employee_type": "categorical",
            "employee_name": "high_cardinality",
            "original_hire_date": "high_cardinality",
            "last_hire_date": "high_cardinality",
            "seniority_date": "high_cardinality",
            "termination_date": "high_cardinality",
            "termination_reason_code": "high_cardinality",
            "termination_reason": "high_cardinality",
            "termination_type": "categorical",
            "company": "single_value",
            "organization": "single_value",
            "department": "categorical",
            "job_code": "categorical",
            "job_title": "categorical",
            "supervisor_employee_number": "categorical",
            "supervisor_name": "categorical",
            "location": "categorical",
            "region": "categorical",
            "address___work": "categorical",
            "city___work": "categorical",
            "stateorprovince___work": "categorical",
            "postalcode___work": "categorical",
            "country___work": "single_value",
            "address___home": "high_cardinality",
            "city___home": "high_cardinality",
            "stateorprovince___home": "categorical",
            "postalcode___home": "high_cardinality",
            "country___home": "categorical",
            "salary_or_hourly": "categorical",
            "hourly_rate": "categorical",
            "annual_salary": "categorical",
            "local_currency_code": "single_value",
            "gender": "categorical",
            "ethnicity": "categorical",
            "date_of_birth": "high_cardinality",
            "email_address": "high_cardinality",
            "remoteflag": "single_value"
        },
        "piiFields": [
            "employee_id",
            "employee_name",
            "supervisor_name",
            "address___work",
            "postalcode___work",
            "address___home",
            "postalcode___home",
            "date_of_birth",
            "email_address"
        ],
        "tokenMapsUrl": process.env.NEXT_PUBLIC_TOKENS_MAP_URL
    }
}

export default  sample_dashboard_data