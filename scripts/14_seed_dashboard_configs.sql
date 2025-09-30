-- Seed default dashboard configurations for different scenarios
INSERT INTO dashboard_configs (scenario_type, user_id, company, config, created_at, updated_at) VALUES
-- Upload-only scenario configuration
('upload-only', 'maya.jackson@healthserv.com', 'HealthServ Solutions', '{
  "kpiConfigs": [
    {
      "id": "turnover-rate",
      "title": "Turnover Rate",
      "subtitle": "Monthly employee turnover",
      "value": "2.3%",
      "change": "-0.5% vs last month",
      "trend": "down",
      "icon": "TrendingDown",
      "color": "red"
    },
    {
      "id": "engagement-score",
      "title": "Engagement Score",
      "subtitle": "Employee engagement metrics",
      "value": "7.8/10",
      "change": "+0.3 vs last quarter",
      "trend": "up",
      "icon": "Users",
      "color": "purple"
    },
    {
      "id": "cost-per-hire",
      "title": "Cost Per Hire",
      "subtitle": "Total recruiting investment",
      "value": "$4,200",
      "change": "-$300 vs last quarter",
      "trend": "down",
      "icon": "Building",
      "color": "blue"
    }
  ],
  "selectedLens": "Hr Generalist",
  "selectedDataset": "Workforce Census",
  "selectedTimePeriod": "Last Quarter",
  "fileUploadStatus": {
    "hasFile": true,
    "fileName": "employee_data_2024.xlsx",
    "uploadDate": "2024-01-15T10:30:00Z",
    "recordsProcessed": 1247,
    "status": "processed"
  },
  "urgentTask": {
    "title": "Ready to tackle your urgent task",
    "description": "We have had 5 people quit this month and I need to understand why",
    "actionText": "View Analysis Slides"
  },
  "chatPrompts": [
    "What is our turnover rate by department?",
    "Show me compensation gaps",
    "Analyze engagement survey results"
  ]
}', NOW(), NOW()),

-- HR Generalist scenario configuration  
('hr-generalist', 'maya.jackson@healthserv.com', 'HealthServ Solutions', '{
  "kpiConfigs": [
    {
      "id": "headcount",
      "title": "Total Headcount",
      "subtitle": "Active employees",
      "value": "1,247",
      "change": "+23 vs last month",
      "trend": "up",
      "icon": "Users",
      "color": "blue"
    },
    {
      "id": "turnover-rate",
      "title": "Turnover Rate",
      "subtitle": "Monthly employee turnover",
      "value": "2.3%",
      "change": "-0.5% vs last month",
      "trend": "down",
      "icon": "TrendingDown",
      "color": "red"
    },
    {
      "id": "engagement-score",
      "title": "Engagement Score",
      "subtitle": "Employee engagement metrics",
      "value": "7.8/10",
      "change": "+0.3 vs last quarter",
      "trend": "up",
      "icon": "Heart",
      "color": "purple"
    },
    {
      "id": "time-to-fill",
      "title": "Time to Fill",
      "subtitle": "Average days to hire",
      "value": "28 days",
      "change": "-5 days vs last quarter",
      "trend": "down",
      "icon": "Clock",
      "color": "green"
    }
  ],
  "selectedLens": "Hr Generalist",
  "selectedDataset": "Workforce Census",
  "selectedTimePeriod": "Last Quarter",
  "fileUploadStatus": {
    "hasFile": false,
    "fileName": null,
    "uploadDate": null,
    "recordsProcessed": 0,
    "status": "none"
  },
  "urgentTask": {
    "title": "Ready to tackle your urgent task",
    "description": "We have had 5 people quit this month and I need to understand why",
    "actionText": "View Analysis Slides"
  },
  "chatPrompts": [
    "What is our turnover rate by department?",
    "Show me compensation gaps",
    "Analyze engagement survey results"
  ]
}', NOW(), NOW()),

-- CHRO scenario configuration
('chro', 'sarah.chen@techcorp.com', 'TechCorp', '{
  "kpiConfigs": [
    {
      "id": "revenue-per-employee",
      "title": "Revenue per Employee",
      "subtitle": "Productivity metric",
      "value": "$185K",
      "change": "+$12K vs last year",
      "trend": "up",
      "icon": "DollarSign",
      "color": "green"
    },
    {
      "id": "leadership-bench",
      "title": "Leadership Bench",
      "subtitle": "Ready-now successors",
      "value": "67%",
      "change": "+8% vs last quarter",
      "trend": "up",
      "icon": "Crown",
      "color": "purple"
    },
    {
      "id": "diversity-index",
      "title": "Diversity Index",
      "subtitle": "Leadership diversity",
      "value": "42%",
      "change": "+3% vs last year",
      "trend": "up",
      "icon": "Users",
      "color": "blue"
    },
    {
      "id": "employee-nps",
      "title": "Employee NPS",
      "subtitle": "Net promoter score",
      "value": "+34",
      "change": "+7 vs last quarter",
      "trend": "up",
      "icon": "Star",
      "color": "yellow"
    }
  ],
  "selectedLens": "CHRO",
  "selectedDataset": "Executive Dashboard",
  "selectedTimePeriod": "Last Year",
  "fileUploadStatus": {
    "hasFile": false,
    "fileName": null,
    "uploadDate": null,
    "recordsProcessed": 0,
    "status": "none"
  },
  "urgentTask": {
    "title": "Strategic HR Planning",
    "description": "Prepare board presentation on talent strategy and organizational health",
    "actionText": "View Executive Summary"
  },
  "chatPrompts": [
    "Show me leadership pipeline analysis",
    "What are our talent retention risks?",
    "Analyze compensation competitiveness"
  ]
}', NOW(), NOW());
