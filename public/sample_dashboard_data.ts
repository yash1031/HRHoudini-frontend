
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
                    "id": "active-employees",
                    "icon": "TrendingUp",
                    "color": "green",
                    "title": "Active Employees",
                    "value": "68.2%"
                    },
                    {
                    "id": "avg-annual-salary",
                    "icon": "BarChart",
                    "color": "purple",
                    "title": "Average Annual Salary",
                    "value": "$58,560"
                    },
                    {
                    "id": "gender-ratio",
                    "icon": "Activity",
                    "color": "orange",
                    "title": "Female Employees",
                    "value": "50.2%"
                    },
                    {
                    "id": "employee-types",
                    "icon": "Briefcase",
                    "color": "red",
                    "title": "Full-Time Employees",
                    "value": "65.6%"
                    },
                    {
                    "id": "remote-workers",
                    "icon": "Globe",
                    "color": "teal",
                    "title": "Remote Employees",
                    "value": "100.0%"
                    },
                    {
                    "id": "avg-tenure",
                    "icon": "Clock",
                    "color": "blue",
                    "title": "Average Tenure",
                    "value": "2,018"
                    },
                    {
                    "id": "departments",
                    "icon": "Award",
                    "color": "green",
                    "title": "Unique Departments",
                    "value": "6"
                    }
                ],
                "charts": [
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::gender::temporal",
                                    "title": "Gender Composition by Hire Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Gender representation trend over hiring years",
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "id": "chart::gender::department",
                        "title": "Gender by Department",
                        "type": "bar",
                        "field": "department",
                        "icon": "BarChart",
                        "data": [
                            {
                                "name": "Management",
                                "value": 78.31,
                                "percentage": 29.8
                            },
                            {
                                "name": "Customer Service",
                                "value": 65.77,
                                "percentage": 25
                            },
                            {
                                "name": "Sales",
                                "value": 46.67,
                                "percentage": 17.7
                            },
                            {
                                "name": "Security",
                                "value": 29.17,
                                "percentage": 11.1
                            },
                            {
                                "name": "Inventory",
                                "value": 28.57,
                                "percentage": 10.9
                            },
                            {
                                "name": "Maintenance",
                                "value": 14.71,
                                "percentage": 5.6
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
                                        "Part-Time"
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
                                    "id": "drilldown::chart::gender::job_title",
                                    "title": "Gender Distribution by Job Title",
                                    "type": "bar",
                                    "field": "job_title",
                                    "icon": "Users",
                                    "description": "Breakdown of gender representation across different job titles",
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::gender::temporal",
                                    "title": "Gender Representation Over Years",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Trend of gender diversity by hire year",
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "id": "chart::ethnic-diversity::distribution",
                        "title": "Ethnic Diversity Breakdown",
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
                                    "id": "drilldown::chart::ethnic::department",
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::ethnic::trend",
                                    "title": "Ethnic Diversity Trend by Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Ethnic diversity distribution over hiring years",
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "id": "chart::ethnic-diversity::job-level",
                        "title": "Ethnic Representation by Job Level",
                        "type": "bar",
                        "field": "job_title",
                        "icon": "BarChart",
                        "data": [
                            {
                                "name": "Inventory Specialist",
                                "value": 80.36,
                                "percentage": 15.3
                            },
                            {
                                "name": "Senior Sales Associate",
                                "value": 74.47,
                                "percentage": 14.2
                            },
                            {
                                "name": "Sales Associate",
                                "value": 69.17,
                                "percentage": 13.2
                            },
                            {
                                "name": "Security Guard",
                                "value": 66.67,
                                "percentage": 12.7
                            },
                            {
                                "name": "Assistant Manager",
                                "value": 62.79,
                                "percentage": 12
                            },
                            {
                                "name": "Maintenance Technician",
                                "value": 61.76,
                                "percentage": 11.8
                            },
                            {
                                "name": "Customer Service Rep",
                                "value": 55.86,
                                "percentage": 10.7
                            },
                            {
                                "name": "Store Manager",
                                "value": 52.5,
                                "percentage": 10
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
                                    "field": "ethnicity",
                                    "label": "Ethnic Group",
                                    "type": "multiselect",
                                    "options": [
                                        "White",
                                        "Hispanic",
                                        "Black",
                                        "Asian",
                                        "Other"
                                    ],
                                    "whereClause": {
                                        "field": "ethnicity",
                                        "operator": "IN",
                                        "paramNames": [
                                            "$ethnicity_values"
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
                                    "id": "drilldown::chart::ethnicity::department",
                                    "title": "Ethnic Representation by Department",
                                    "type": "bar",
                                    "field": "department",
                                    "icon": "BarChart",
                                    "description": "Ethnic diversity distribution across different departments",
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                },
                                {
                                    "id": "drilldown::chart::ethnicity::temporal",
                                    "title": "Ethnic Diversity Trend by Year",
                                    "type": "line",
                                    "field": "original_hire_date",
                                    "icon": "TrendingUp",
                                    "description": "Annual trend of ethnic diversity representation",
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
                                                    "expression": "ROUND(COUNT(DISTINCT employee_id) * 100.0 / NULLIF((SELECT COUNT(DISTINCT employee_id) FROM {{PARQUET_SOURCE}}), 0), 2)",
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
                                            "source": "https://hr-houdini-user-parquets.s3.amazonaws.com/users-docs/38912055-c9e8-4748-a628-65f1eac8303a/dcea351a-f800-4374-8cb2-cc084ee24052/parquet/masked.parquet?response-content-disposition=attachment%3B%20filename%3D%22masked.parquet%22&response-content-type=application%2Foctet-stream&AWSAccessKeyId=ASIAVNGVXOTAJ76GCRHF&Signature=%2F7eXM%2FFex11enl6C1O7AcLpQa28%3D&x-amz-security-token=IQoJb3JpZ2luX2VjENX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCICj2FX1ppasD27psihWQxd%2B9qL7xRRlVq%2FyJ8wzT%2BNDNAiBW29Q187B5PQSmL7rbnvyu88IUyNgbzKndqbnmepbNfiqHAwie%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDM3MTk2MjkwMTY5NiIM%2BDuJ1s8DOd%2BkBCCaKtsCeCIcwpVgklwyIAObZL86GXEIqxgiK0ugUc77dYvHUoEE3yk3x8kLu3gE28V%2BZdB6CE88z7Ll3kO5uxKxIKGR7RUSHLkICD3zTsYIgq3iD0WWY1XS8t3t%2BI9NfUFrAWjjvoZXpgsmcKuNfBzdXxmhbkE1gAO06jCMzgcWsaFfinSB07wp%2BZDSdTU0KBKVGp1k9U3oFgNuvXpKw2oSnyUknwNuzMSBOc6Lub2qnEBDtyYRP3BEt%2Fw3paMU8yBb1pwSpdmpbqErDS6Kl5GR10ihMWzWIe3i2VCax9vQzrvZyk5Z22fp5EtYRPsi1fKumwp%2FwVNtfikhB0WQDAKSK0UT1M3JX5j%2FSBqAWrUKRfvJDV%2B1s5REV%2BDkM7zBHjCr95ACypGGyEWzv4C%2FqauW172ptgnMMKOYrgWNkqNywsq65KgOB37mmC%2FmDd2744un3jKbP1vnEAT4onbYNOEwx%2FLoyAY6nwGQQh5CKOU1FLkHtuQq8BddeVbJSr1pmVI3ik6QMQaDUvJeIFEpjWM1sUf9zcGghxH4k%2BFfP3IoF9Kz7kRAGRX1GcIzu01Dq4hII3JUhBLRVHQSFk8TknpE%2FFxQdN4RWshAQ3o1UIxBJJSOttqUQ9C0o4UjTV%2FyXnsz2apsguFoO0PFHlBS4BmOoMdXCzBSWzw3cxcHcnvXs3oI55Vsqf8%3D&Expires=1763330681"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ],
                "metadata": {
                    "filename": "SharpMedian.csv",
                    "totalRows": 512,
                }
}

export default  sample_dashboard_data