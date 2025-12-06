
import type {  DashboardData } from "@/types/dashboard";

const sample_dashboard_data: DashboardData = {
                "cards": [
                    {
                        "id": "total-employees",
                        "icon": "Users",
                        "color": "blue",
                        "title": "Total Employees",
                        "value": "512"
                    },
                    {
                        "id": "active-employee-percentage",
                        "icon": "TrendingUp",
                        "color": "green",
                        "title": "Active Employees",
                        "value": "68.2%"
                    },
                    {
                        "id": "average-annual-salary",
                        "icon": "BarChart",
                        "color": "purple",
                        "title": "Average Annual Salary",
                        "value": "$58,560"
                    },
                    {
                        "id": "gender-diversity",
                        "icon": "Activity",
                        "color": "orange",
                        "title": "Female Representation",
                        "value": "50.2%"
                    },
                    {
                        "id": "employee-type-distribution",
                        "icon": "Briefcase",
                        "color": "red",
                        "title": "Full-Time Employees",
                        "value": "65.6%"
                    },
                    {
                        "id": "remote-work-percentage",
                        "icon": "Globe",
                        "color": "teal",
                        "title": "Remote Work Adoption",
                        "value": "100.0%"
                    },
                    {
                        "id": "average-employee-tenure",
                        "icon": "Clock",
                        "color": "blue",
                        "title": "Average Employee Tenure",
                        "value": "2,018"
                    },
                    {
                        "id": "ethnic-diversity",
                        "icon": "Award",
                        "color": "green",
                        "title": "Ethnic Diversity",
                        "value": "8"
                    }
                ],
                "charts":[
                    {
                        "id": "chart::ethnic-diversity::percentage",
                        "title": "Ethnic Diversity Distribution",
                        "type": "pie",
                        "field": "ethnicity",
                        "icon": "Globe",
                        "data": [
                            {
                                "name": "Black",
                                "value": 38.48,
                                "percentage": 38.5
                            },
                            {
                                "name": "White",
                                "value": 34.57,
                                "percentage": 34.6
                            },
                            {
                                "name": "Hispanic",
                                "value": 21.29,
                                "percentage": 21.3
                            },
                            {
                                "name": "Asian",
                                "value": 2.54,
                                "percentage": 2.5
                            },
                            {
                                "name": "Irish",
                                "value": 2.54,
                                "percentage": 2.5
                            },
                            {
                                "name": "Polish",
                                "value": 0.2,
                                "percentage": 0.2
                            },
                            {
                                "name": "German",
                                "value": 0.2,
                                "percentage": 0.2
                            },
                            {
                                "name": "Native American",
                                "value": 0.2,
                                "percentage": 0.2
                            }
                        ],
                        "colors": [
                            "#3b82f6",
                            "#10b981",
                            "#f43f5e",
                            "#8b5cf6",
                            "#22d3ee"
                        ],
                        "drillDownData": {
                            "filters": [
                                {
                                    "field": "employee_type",
                                    "label": "Employment Type",
                                    "type": "multiselect",
                                    "options": [
                                        "Full-Time",
                                        "Part-Time",
                                        "Contract"
                                    ],
                                    "whereClause": {
                                        "field": "employee_type",
                                        "operator": "IN",
                                        "paramNames": [
                                            "$employee_type_values"
                                        ],
                                        "type": "dynamic"
                                    }
                                },
                                {
                                    "field": "region",
                                    "label": "Work Region",
                                    "type": "multiselect",
                                    "options": [
                                        "Northeast",
                                        "Southeast",
                                        "Midwest",
                                        "West",
                                        "Southwest"
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
                            ],
                            "charts": [
                                {
                                    "id": "drilldown::chart::ethnic-diversity-by-department",
                                    "title": "Ethnic Diversity by Department",
                                    "type": "bar",
                                    "field": "department",
                                    "icon": "BarChart",
                                    "description": "Percentage distribution of ethnic groups across different departments",
                                    "data": [
                                        {
                                            "name": "Sales",
                                            "value": 35.16,
                                            "percentage": 35.2
                                        },
                                        {
                                            "name": "Customer Service",
                                            "value": 21.68,
                                            "percentage": 21.7
                                        },
                                        {
                                            "name": "Management",
                                            "value": 16.21,
                                            "percentage": 16.2
                                        },
                                        {
                                            "name": "Inventory",
                                            "value": 10.94,
                                            "percentage": 10.9
                                        },
                                        {
                                            "name": "Security",
                                            "value": 9.38,
                                            "percentage": 9.4
                                        },
                                        {
                                            "name": "Maintenance",
                                            "value": 6.64,
                                            "percentage": 6.6
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "COALESCE(department, 'Unknown')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "2 DESC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::ethnic-diversity-trend",
                                    "title": "Ethnic Diversity Trend by Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Ethnic diversity representation trend over hiring years",
                                    "data": [
                                        {
                                            "name": "0001",
                                            "value": 2.73,
                                            "percentage": 2.7
                                        },
                                        {
                                            "name": "0002",
                                            "value": 2.15,
                                            "percentage": 2.1
                                        },
                                        {
                                            "name": "0003",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0004",
                                            "value": 4.1,
                                            "percentage": 4.1
                                        },
                                        {
                                            "name": "0005",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0006",
                                            "value": 2.93,
                                            "percentage": 2.9
                                        },
                                        {
                                            "name": "0007",
                                            "value": 3.71,
                                            "percentage": 3.7
                                        },
                                        {
                                            "name": "0008",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0009",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0010",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0011",
                                            "value": 3.13,
                                            "percentage": 3.1
                                        },
                                        {
                                            "name": "0012",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0016",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0017",
                                            "value": 4.69,
                                            "percentage": 4.7
                                        },
                                        {
                                            "name": "0018",
                                            "value": 6.25,
                                            "percentage": 6.2
                                        },
                                        {
                                            "name": "0019",
                                            "value": 7.62,
                                            "percentage": 7.6
                                        },
                                        {
                                            "name": "0020",
                                            "value": 8.59,
                                            "percentage": 8.6
                                        },
                                        {
                                            "name": "0021",
                                            "value": 10.55,
                                            "percentage": 10.5
                                        },
                                        {
                                            "name": "0022",
                                            "value": 7.81,
                                            "percentage": 7.8
                                        },
                                        {
                                            "name": "0023",
                                            "value": 11.52,
                                            "percentage": 11.5
                                        },
                                        {
                                            "name": "0024",
                                            "value": 1.37,
                                            "percentage": 1.4
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "STRFTIME(COALESCE(TRY_CAST(original_hire_date AS DATE), TRY_STRPTIME(original_hire_date, '%m/%d/%Y'), TRY_STRPTIME(original_hire_date, '%Y-%m-%d')), '%Y')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "1 ASC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Potential ethnic representation imbalance with no breakdown of ethnic diversity percentages",
                                    "Limited visibility into ethnic distribution across departments and leadership roles",
                                    "No clear data on ethnic retention rates or progression pathways"
                                ],
                                "recommended_actions": [
                                    "Conduct comprehensive ethnic diversity audit across all organizational levels",
                                    "Develop targeted recruitment strategies to enhance ethnic representation",
                                    "Implement mentorship programs focusing on ethnic minority career development"
                                ]
                            }
                        }
                    },
                    {
                        "id": "chart::ethnic-diversity::department",
                        "title": "Ethnic Diversity by Department",
                        "type": "bar",
                        "field": "department",
                        "icon": "BarChart",
                        "data": [
                            {
                                "name": "Inventory",
                                "value": 80.36,
                                "percentage": 20.4
                            },
                            {
                                "name": "Sales",
                                "value": 70.56,
                                "percentage": 18
                            },
                            {
                                "name": "Security",
                                "value": 66.67,
                                "percentage": 17
                            },
                            {
                                "name": "Maintenance",
                                "value": 61.76,
                                "percentage": 15.7
                            },
                            {
                                "name": "Management",
                                "value": 57.83,
                                "percentage": 14.7
                            },
                            {
                                "name": "Customer Service",
                                "value": 55.86,
                                "percentage": 14.2
                            }
                        ],
                        "colors": [
                            "#3b82f6",
                            "#10b981",
                            "#f43f5e",
                            "#8b5cf6",
                            "#22d3ee"
                        ],
                        "drillDownData": {
                            "filters": [
                                {
                                    "field": "department",
                                    "label": "Department Filter",
                                    "type": "multiselect",
                                    "options": [
                                        "Management",
                                        "Sales",
                                        "Customer Service",
                                        "Inventory"
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
                                    "field": "employee_type",
                                    "label": "Employment Type",
                                    "type": "multiselect",
                                    "options": [
                                        "Full-Time",
                                        "Part-Time",
                                        "Contract"
                                    ],
                                    "whereClause": {
                                        "field": "employee_type",
                                        "operator": "IN",
                                        "paramNames": [
                                            "$employee_type_values"
                                        ],
                                        "type": "dynamic"
                                    }
                                }
                            ],
                            "charts": [
                                {
                                    "id": "drilldown::chart::ethnic-diversity-by-job-title",
                                    "title": "Ethnic Diversity by Job Title",
                                    "type": "bar",
                                    "field": "job_title",
                                    "icon": "Users",
                                    "description": "Ethnic representation across different job titles",
                                    "data": [
                                        {
                                            "name": "Sales Associate",
                                            "value": 25.98,
                                            "percentage": 26
                                        },
                                        {
                                            "name": "Customer Service Rep",
                                            "value": 21.68,
                                            "percentage": 21.7
                                        },
                                        {
                                            "name": "Inventory Specialist",
                                            "value": 10.94,
                                            "percentage": 10.9
                                        },
                                        {
                                            "name": "Security Guard",
                                            "value": 9.38,
                                            "percentage": 9.4
                                        },
                                        {
                                            "name": "Senior Sales Associate",
                                            "value": 9.18,
                                            "percentage": 9.2
                                        },
                                        {
                                            "name": "Assistant Manager",
                                            "value": 8.4,
                                            "percentage": 8.4
                                        },
                                        {
                                            "name": "Store Manager",
                                            "value": 7.81,
                                            "percentage": 7.8
                                        },
                                        {
                                            "name": "Maintenance Technician",
                                            "value": 6.64,
                                            "percentage": 6.6
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "COALESCE(job_title, 'Unknown')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "2 DESC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::ethnic-diversity-trend",
                                    "title": "Ethnic Diversity Trend by Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Ethnic diversity trend over hiring years",
                                    "data": [
                                        {
                                            "name": "0001",
                                            "value": 2.73,
                                            "percentage": 2.7
                                        },
                                        {
                                            "name": "0002",
                                            "value": 2.15,
                                            "percentage": 2.1
                                        },
                                        {
                                            "name": "0003",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0004",
                                            "value": 4.1,
                                            "percentage": 4.1
                                        },
                                        {
                                            "name": "0005",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0006",
                                            "value": 2.93,
                                            "percentage": 2.9
                                        },
                                        {
                                            "name": "0007",
                                            "value": 3.71,
                                            "percentage": 3.7
                                        },
                                        {
                                            "name": "0008",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0009",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0010",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0011",
                                            "value": 3.13,
                                            "percentage": 3.1
                                        },
                                        {
                                            "name": "0012",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0016",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0017",
                                            "value": 4.69,
                                            "percentage": 4.7
                                        },
                                        {
                                            "name": "0018",
                                            "value": 6.25,
                                            "percentage": 6.2
                                        },
                                        {
                                            "name": "0019",
                                            "value": 7.62,
                                            "percentage": 7.6
                                        },
                                        {
                                            "name": "0020",
                                            "value": 8.59,
                                            "percentage": 8.6
                                        },
                                        {
                                            "name": "0021",
                                            "value": 10.55,
                                            "percentage": 10.5
                                        },
                                        {
                                            "name": "0022",
                                            "value": 7.81,
                                            "percentage": 7.8
                                        },
                                        {
                                            "name": "0023",
                                            "value": 11.52,
                                            "percentage": 11.5
                                        },
                                        {
                                            "name": "0024",
                                            "value": 1.37,
                                            "percentage": 1.4
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "STRFTIME(COALESCE(TRY_CAST(original_hire_date AS DATE), TRY_STRPTIME(original_hire_date, '%m/%d/%Y'), TRY_STRPTIME(original_hire_date, '%Y-%m-%d')), '%Y')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "1 ASC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Sales department overrepresented at 35.16% of workforce, potential diversity concentration risk",
                                    "Customer Service shows 21.68% workforce share with potential ethnic representation imbalance",
                                    "Management department at 16.21% suggests potential ethnic leadership diversity gap"
                                ],
                                "recommended_actions": [
                                    "Conduct comprehensive ethnic diversity audit across Sales department hiring practices",
                                    "Develop targeted recruitment strategies to enhance ethnic representation in Management roles",
                                    "Create mentorship program focusing on ethnic minority advancement in Customer Service"
                                ]
                            }
                        }
                    },
                    {
                        "id": "chart::employee-type-distribution",
                        "title": "Employment Type Distribution",
                        "type": "pie",
                        "field": "employee_type",
                        "icon": "Users",
                        "data": [
                            {
                                "name": "Full-Time",
                                "value": 65.63,
                                "percentage": 65.6
                            },
                            {
                                "name": "Part-Time",
                                "value": 34.38,
                                "percentage": 34.4
                            }
                        ],
                        "colors": [
                            "#3b82f6",
                            "#10b981"
                        ],
                        "drillDownData": {
                            "filters": [
                                {
                                    "field": "department",
                                    "label": "Department Filter",
                                    "type": "multiselect",
                                    "options": [
                                        "Management",
                                        "Sales",
                                        "Customer Service",
                                        "Inventory"
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
                                    "field": "employee_status",
                                    "label": "Employment Status",
                                    "type": "multiselect",
                                    "options": [
                                        "Active",
                                        "Terminated"
                                    ],
                                    "whereClause": {
                                        "field": "employee_status",
                                        "operator": "IN",
                                        "paramNames": [
                                            "$employee_status_values"
                                        ],
                                        "type": "dynamic"
                                    }
                                }
                            ],
                            "charts": [
                                {
                                    "id": "drilldown::chart::type::department",
                                    "title": "Employment Type by Department",
                                    "type": "bar",
                                    "field": "department",
                                    "icon": "BarChart",
                                    "description": "Breakdown of employment types across different departments",
                                    "data": [
                                        {
                                            "name": "Sales",
                                            "value": 35.16,
                                            "percentage": 35.2
                                        },
                                        {
                                            "name": "Customer Service",
                                            "value": 21.68,
                                            "percentage": 21.7
                                        },
                                        {
                                            "name": "Management",
                                            "value": 16.21,
                                            "percentage": 16.2
                                        },
                                        {
                                            "name": "Inventory",
                                            "value": 10.94,
                                            "percentage": 10.9
                                        },
                                        {
                                            "name": "Security",
                                            "value": 9.38,
                                            "percentage": 9.4
                                        },
                                        {
                                            "name": "Maintenance",
                                            "value": 6.64,
                                            "percentage": 6.6
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "COALESCE(department, 'Unknown')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "2 DESC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::type::temporal",
                                    "title": "Employment Type Trend by Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Annual trend of employment type distribution",
                                    "data": [
                                        {
                                            "name": "0001",
                                            "value": 2.73,
                                            "percentage": 2.7
                                        },
                                        {
                                            "name": "0002",
                                            "value": 2.15,
                                            "percentage": 2.1
                                        },
                                        {
                                            "name": "0003",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0004",
                                            "value": 4.1,
                                            "percentage": 4.1
                                        },
                                        {
                                            "name": "0005",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0006",
                                            "value": 2.93,
                                            "percentage": 2.9
                                        },
                                        {
                                            "name": "0007",
                                            "value": 3.71,
                                            "percentage": 3.7
                                        },
                                        {
                                            "name": "0008",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0009",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0010",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0011",
                                            "value": 3.13,
                                            "percentage": 3.1
                                        },
                                        {
                                            "name": "0012",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0016",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0017",
                                            "value": 4.69,
                                            "percentage": 4.7
                                        },
                                        {
                                            "name": "0018",
                                            "value": 6.25,
                                            "percentage": 6.2
                                        },
                                        {
                                            "name": "0019",
                                            "value": 7.62,
                                            "percentage": 7.6
                                        },
                                        {
                                            "name": "0020",
                                            "value": 8.59,
                                            "percentage": 8.6
                                        },
                                        {
                                            "name": "0021",
                                            "value": 10.55,
                                            "percentage": 10.5
                                        },
                                        {
                                            "name": "0022",
                                            "value": 7.81,
                                            "percentage": 7.8
                                        },
                                        {
                                            "name": "0023",
                                            "value": 11.52,
                                            "percentage": 11.5
                                        },
                                        {
                                            "name": "0024",
                                            "value": 1.37,
                                            "percentage": 1.4
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "STRFTIME(COALESCE(TRY_CAST(original_hire_date AS DATE), TRY_STRPTIME(original_hire_date, '%m/%d/%Y'), TRY_STRPTIME(original_hire_date, '%Y-%m-%d')), '%Y')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "1 ASC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Part-time employees represent significant workforce segment with potential instability (31.84% non-full-time)",
                                    "High termination rate of 31.84% suggests potential employment type retention challenges",
                                    "Diverse employment types across departments indicate non-uniform workforce composition"
                                ],
                                "recommended_actions": [
                                    "Develop targeted retention strategy for part-time employees in high-turnover departments like Sales and Customer Service",
                                    "Create career progression pathways to convert part-time to full-time employees",
                                    "Conduct comprehensive exit interviews to understand employment type transition motivations"
                                ]
                            }
                        }
                    },
                    {
                        "id": "chart::employee-type-status",
                        "title": "Employment Type by Status",
                        "type": "bar",
                        "field": "employee_status",
                        "icon": "BarChart",
                        "data": [
                            {
                                "name": "Full-Time - Active",
                                "value": 49.8,
                                "percentage": 49.8
                            },
                            {
                                "name": "Part-Time - Active",
                                "value": 18.36,
                                "percentage": 18.4
                            },
                            {
                                "name": "Part-Time - Terminated",
                                "value": 16.02,
                                "percentage": 16
                            },
                            {
                                "name": "Full-Time - Terminated",
                                "value": 15.82,
                                "percentage": 15.8
                            }
                        ],
                        "colors": [
                            "#3b82f6",
                            "#10b981",
                            "#f43f5e",
                            "#8b5cf6"
                        ],
                        "drillDownData": {
                            "filters": [
                                {
                                    "field": "employee_type",
                                    "label": "Employment Type",
                                    "type": "multiselect",
                                    "options": [
                                        "Full-Time",
                                        "Part-Time",
                                        "Contract"
                                    ],
                                    "whereClause": {
                                        "field": "employee_type",
                                        "operator": "IN",
                                        "paramNames": [
                                            "$employee_type_values"
                                        ],
                                        "type": "dynamic"
                                    }
                                },
                                {
                                    "field": "region",
                                    "label": "Work Region",
                                    "type": "multiselect",
                                    "options": [
                                        "Northeast",
                                        "Southeast",
                                        "Midwest",
                                        "West"
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
                            ],
                            "charts": [
                                {
                                    "id": "drilldown::chart::type::department",
                                    "title": "Employment Type by Department",
                                    "type": "bar",
                                    "field": "department",
                                    "icon": "BarChart",
                                    "description": "Distribution of employment types across different departments",
                                    "data": [
                                        {
                                            "name": "Sales",
                                            "value": 35.16,
                                            "percentage": 35.2
                                        },
                                        {
                                            "name": "Customer Service",
                                            "value": 21.68,
                                            "percentage": 21.7
                                        },
                                        {
                                            "name": "Management",
                                            "value": 16.21,
                                            "percentage": 16.2
                                        },
                                        {
                                            "name": "Inventory",
                                            "value": 10.94,
                                            "percentage": 10.9
                                        },
                                        {
                                            "name": "Security",
                                            "value": 9.38,
                                            "percentage": 9.4
                                        },
                                        {
                                            "name": "Maintenance",
                                            "value": 6.64,
                                            "percentage": 6.6
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "COALESCE(department, 'Unknown')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "2 DESC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::type::temporal",
                                    "title": "Employment Type Trend by Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Annual trend of employment type distribution",
                                    "data": [
                                        {
                                            "name": "0001",
                                            "value": 2.73,
                                            "percentage": 2.7
                                        },
                                        {
                                            "name": "0002",
                                            "value": 2.15,
                                            "percentage": 2.1
                                        },
                                        {
                                            "name": "0003",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0004",
                                            "value": 4.1,
                                            "percentage": 4.1
                                        },
                                        {
                                            "name": "0005",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0006",
                                            "value": 2.93,
                                            "percentage": 2.9
                                        },
                                        {
                                            "name": "0007",
                                            "value": 3.71,
                                            "percentage": 3.7
                                        },
                                        {
                                            "name": "0008",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0009",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0010",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0011",
                                            "value": 3.13,
                                            "percentage": 3.1
                                        },
                                        {
                                            "name": "0012",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0016",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0017",
                                            "value": 4.69,
                                            "percentage": 4.7
                                        },
                                        {
                                            "name": "0018",
                                            "value": 6.25,
                                            "percentage": 6.2
                                        },
                                        {
                                            "name": "0019",
                                            "value": 7.62,
                                            "percentage": 7.6
                                        },
                                        {
                                            "name": "0020",
                                            "value": 8.59,
                                            "percentage": 8.6
                                        },
                                        {
                                            "name": "0021",
                                            "value": 10.55,
                                            "percentage": 10.5
                                        },
                                        {
                                            "name": "0022",
                                            "value": 7.81,
                                            "percentage": 7.8
                                        },
                                        {
                                            "name": "0023",
                                            "value": 11.52,
                                            "percentage": 11.5
                                        },
                                        {
                                            "name": "0024",
                                            "value": 1.37,
                                            "percentage": 1.4
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "STRFTIME(COALESCE(TRY_CAST(original_hire_date AS DATE), TRY_STRPTIME(original_hire_date, '%m/%d/%Y'), TRY_STRPTIME(original_hire_date, '%Y-%m-%d')), '%Y')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "1 ASC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "31.84% termination rate indicates significant workforce churn across organization",
                                    "Part-time employees likely driving higher turnover with 163 terminations",
                                    "Sales department shows highest potential turnover risk with 35.16% representation"
                                ],
                                "recommended_actions": [
                                    "Develop targeted retention strategy for part-time employee segments",
                                    "Conduct exit interviews to understand termination drivers in Sales department",
                                    "Design stabilization program for employees with <2 years tenure"
                                ]
                            }
                        }
                    },
                    {
                        "id": "chart::gender::distribution",
                        "title": "Gender Distribution",
                        "type": "pie",
                        "field": "gender",
                        "icon": "Users",
                        "data": [
                            {
                                "name": "Female",
                                "value": 50.2,
                                "percentage": 50.2
                            },
                            {
                                "name": "Male",
                                "value": 49.8,
                                "percentage": 49.8
                            }
                        ],
                        "colors": [
                            "#3b82f6",
                            "#10b981"
                        ],
                        "drillDownData": {
                            "filters": [
                                {
                                    "field": "employee_type",
                                    "label": "Employment Type",
                                    "type": "multiselect",
                                    "options": [
                                        "Full-Time",
                                        "Part-Time",
                                        "Contract"
                                    ],
                                    "whereClause": {
                                        "field": "employee_type",
                                        "operator": "IN",
                                        "paramNames": [
                                            "$employee_type_values"
                                        ],
                                        "type": "dynamic"
                                    }
                                },
                                {
                                    "field": "region",
                                    "label": "Work Region",
                                    "type": "multiselect",
                                    "options": [
                                        "Northeast",
                                        "Southeast",
                                        "Midwest",
                                        "West",
                                        "Southwest"
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
                            ],
                            "charts": [
                                {
                                    "id": "drilldown::chart::gender::department",
                                    "title": "Gender Distribution by Department",
                                    "type": "bar",
                                    "field": "department",
                                    "icon": "BarChart",
                                    "description": "Percentage of employees by gender across different departments",
                                    "data": [
                                        {
                                            "name": "Sales",
                                            "value": 35.16,
                                            "percentage": 35.2
                                        },
                                        {
                                            "name": "Customer Service",
                                            "value": 21.68,
                                            "percentage": 21.7
                                        },
                                        {
                                            "name": "Management",
                                            "value": 16.21,
                                            "percentage": 16.2
                                        },
                                        {
                                            "name": "Inventory",
                                            "value": 10.94,
                                            "percentage": 10.9
                                        },
                                        {
                                            "name": "Security",
                                            "value": 9.38,
                                            "percentage": 9.4
                                        },
                                        {
                                            "name": "Maintenance",
                                            "value": 6.64,
                                            "percentage": 6.6
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "COALESCE(department, 'Unknown')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "2 DESC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::gender::trend",
                                    "title": "Gender Composition Over Time",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Annual trend of gender representation",
                                    "data": [
                                        {
                                            "name": "0001",
                                            "value": 2.73,
                                            "percentage": 2.7
                                        },
                                        {
                                            "name": "0002",
                                            "value": 2.15,
                                            "percentage": 2.1
                                        },
                                        {
                                            "name": "0003",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0004",
                                            "value": 4.1,
                                            "percentage": 4.1
                                        },
                                        {
                                            "name": "0005",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0006",
                                            "value": 2.93,
                                            "percentage": 2.9
                                        },
                                        {
                                            "name": "0007",
                                            "value": 3.71,
                                            "percentage": 3.7
                                        },
                                        {
                                            "name": "0008",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0009",
                                            "value": 3.32,
                                            "percentage": 3.3
                                        },
                                        {
                                            "name": "0010",
                                            "value": 2.54,
                                            "percentage": 2.5
                                        },
                                        {
                                            "name": "0011",
                                            "value": 3.13,
                                            "percentage": 3.1
                                        },
                                        {
                                            "name": "0012",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0016",
                                            "value": 4.3,
                                            "percentage": 4.3
                                        },
                                        {
                                            "name": "0017",
                                            "value": 4.69,
                                            "percentage": 4.7
                                        },
                                        {
                                            "name": "0018",
                                            "value": 6.25,
                                            "percentage": 6.2
                                        },
                                        {
                                            "name": "0019",
                                            "value": 7.62,
                                            "percentage": 7.6
                                        },
                                        {
                                            "name": "0020",
                                            "value": 8.59,
                                            "percentage": 8.6
                                        },
                                        {
                                            "name": "0021",
                                            "value": 10.55,
                                            "percentage": 10.5
                                        },
                                        {
                                            "name": "0022",
                                            "value": 7.81,
                                            "percentage": 7.8
                                        },
                                        {
                                            "name": "0023",
                                            "value": 11.52,
                                            "percentage": 11.5
                                        },
                                        {
                                            "name": "0024",
                                            "value": 1.37,
                                            "percentage": 1.4
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "STRFTIME(COALESCE(TRY_CAST(original_hire_date AS DATE), TRY_STRPTIME(original_hire_date, '%m/%d/%Y'), TRY_STRPTIME(original_hire_date, '%Y-%m-%d')), '%Y')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM {{PARQUET_SOURCE}}), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "1 ASC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "Gender representation lacks clear diversity balance across departments",
                                    "Potential gender-based disparities in termination rates require investigation",
                                    "Management roles may exhibit gender representation imbalances"
                                ],
                                "recommended_actions": [
                                    "Conduct comprehensive gender representation audit across all departments",
                                    "Develop targeted retention strategies for underrepresented gender groups",
                                    "Implement blind recruitment processes to mitigate potential gender bias"
                                ]
                            }
                        }
                    },
                    {
                        "id": "chart::gender::employment-status",
                        "title": "Gender by Employment Status",
                        "type": "bar",
                        "field": "employee_status",
                        "icon": "BarChart",
                        "data": [
                            {
                                "name": "Male - Active",
                                "value": 35.35,
                                "percentage": 35.4
                            },
                            {
                                "name": "Female - Active",
                                "value": 32.81,
                                "percentage": 32.8
                            },
                            {
                                "name": "Female - Terminated",
                                "value": 17.38,
                                "percentage": 17.4
                            },
                            {
                                "name": "Male - Terminated",
                                "value": 14.45,
                                "percentage": 14.5
                            }
                        ],
                        "colors": [
                            "#3b82f6",
                            "#10b981",
                            "#f43f5e",
                            "#8b5cf6"
                        ],
                        "drillDownData": {
                            "filters": [
                                {
                                    "field": "employee_type",
                                    "label": "Employment Type",
                                    "type": "multiselect",
                                    "options": [
                                        "Full-Time",
                                        "Part-Time",
                                        "Contract"
                                    ],
                                    "whereClause": {
                                        "field": "employee_type",
                                        "operator": "IN",
                                        "paramNames": [
                                            "$employee_type_values"
                                        ],
                                        "type": "dynamic"
                                    }
                                },
                                {
                                    "field": "region",
                                    "label": "Work Region",
                                    "type": "multiselect",
                                    "options": [
                                        "Northeast",
                                        "Southeast",
                                        "Midwest",
                                        "West"
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
                            ],
                            "charts": [
                                {
                                    "id": "drilldown::chart::gender::department",
                                    "title": "Gender Distribution by Department",
                                    "type": "bar",
                                    "field": "department",
                                    "icon": "Users",
                                    "description": "Gender breakdown across different departments",
                                    "data": [
                                        {
                                            "name": "Management",
                                            "value": 0,
                                            "percentage": 0
                                        },
                                        {
                                            "name": "Customer Service",
                                            "value": 0,
                                            "percentage": 0
                                        },
                                        {
                                            "name": "Sales",
                                            "value": 0,
                                            "percentage": 0
                                        },
                                        {
                                            "name": "Security",
                                            "value": 0,
                                            "percentage": 0
                                        },
                                        {
                                            "name": "Inventory",
                                            "value": 0,
                                            "percentage": 0
                                        },
                                        {
                                            "name": "Maintenance",
                                            "value": 0,
                                            "percentage": 0
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "COALESCE(department, 'Unknown')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(CASE WHEN gender = 'Female' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2)",
                                                    "alias": "female_percentage"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "2 DESC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::gender::employment_trend",
                                    "title": "Gender Employment Trend by Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Annual trend of gender employment status",
                                    "data": [
                                        {
                                            "name": "0001",
                                            "value": 35.71,
                                            "percentage": 3.6
                                        },
                                        {
                                            "name": "0002",
                                            "value": 45.45,
                                            "percentage": 4.6
                                        },
                                        {
                                            "name": "0003",
                                            "value": 38.46,
                                            "percentage": 3.9
                                        },
                                        {
                                            "name": "0004",
                                            "value": 80.95,
                                            "percentage": 8.2
                                        },
                                        {
                                            "name": "0005",
                                            "value": 38.46,
                                            "percentage": 3.9
                                        },
                                        {
                                            "name": "0006",
                                            "value": 53.33,
                                            "percentage": 5.4
                                        },
                                        {
                                            "name": "0007",
                                            "value": 57.89,
                                            "percentage": 5.8
                                        },
                                        {
                                            "name": "0008",
                                            "value": 52.94,
                                            "percentage": 5.3
                                        },
                                        {
                                            "name": "0009",
                                            "value": 41.18,
                                            "percentage": 4.1
                                        },
                                        {
                                            "name": "0010",
                                            "value": 61.54,
                                            "percentage": 6.2
                                        },
                                        {
                                            "name": "0011",
                                            "value": 37.5,
                                            "percentage": 3.8
                                        },
                                        {
                                            "name": "0012",
                                            "value": 45.45,
                                            "percentage": 4.6
                                        },
                                        {
                                            "name": "0016",
                                            "value": 63.64,
                                            "percentage": 6.4
                                        },
                                        {
                                            "name": "0017",
                                            "value": 12.5,
                                            "percentage": 1.3
                                        },
                                        {
                                            "name": "0018",
                                            "value": 21.88,
                                            "percentage": 2.2
                                        },
                                        {
                                            "name": "0019",
                                            "value": 48.72,
                                            "percentage": 4.9
                                        },
                                        {
                                            "name": "0020",
                                            "value": 54.55,
                                            "percentage": 5.5
                                        },
                                        {
                                            "name": "0021",
                                            "value": 46.3,
                                            "percentage": 4.7
                                        },
                                        {
                                            "name": "0022",
                                            "value": 45,
                                            "percentage": 4.5
                                        },
                                        {
                                            "name": "0023",
                                            "value": 83.05,
                                            "percentage": 8.4
                                        },
                                        {
                                            "name": "0024",
                                            "value": 28.57,
                                            "percentage": 2.9
                                        }
                                    ],
                                    "colors": [
                                        "#3b82f6",
                                        "#10b981",
                                        "#f43f5e",
                                        "#8b5cf6",
                                        "#22d3ee"
                                    ],
                                    "queryObject": {
                                        "dialect": "duckdb",
                                        "select": {
                                            "columns": [
                                                {
                                                    "expression": "STRFTIME(COALESCE(TRY_CAST(original_hire_date AS DATE), TRY_STRPTIME(original_hire_date, '%m/%d/%Y'), TRY_STRPTIME(original_hire_date, '%Y-%m-%d')), '%Y')",
                                                    "alias": "name"
                                                },
                                                {
                                                    "expression": "ROUND(COUNT(CASE WHEN gender = 'Female' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2)",
                                                    "alias": "value"
                                                }
                                            ]
                                        },
                                        "where": [],
                                        "groupBy": [
                                            1
                                        ],
                                        "orderBy": [
                                            "1 ASC"
                                        ],
                                        "from": {
                                            "type": "parquet",
                                            "source": "https://hr-houdini-cdn.s3.us-east-1.amazonaws.com/sample-file/masked.parquet"
                                        }
                                    }
                                }
                            ],
                            "insights": {
                                "critical_issues": [
                                    "31.84% employee termination rate indicates significant workforce instability",
                                    "Sales department (35.16% of workforce) may have highest turnover risk",
                                    "Part-time employees potentially more vulnerable to termination status"
                                ],
                                "recommended_actions": [
                                    "Conduct targeted retention analysis for Sales department employees",
                                    "Develop stabilization program for part-time employee engagement",
                                    "Implement exit interview protocol to understand termination drivers"
                                ]
                            }
                        }
                    }
                ],
                "metadata": {
                    "filename": "SharpMedian.csv",
                    "totalRows": 512,
                }
}

export default  sample_dashboard_data