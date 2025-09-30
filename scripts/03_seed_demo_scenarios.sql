-- Insert demo scenarios based on user stories
INSERT INTO demo_scenarios (name, description, steps_json, target_personas, estimated_duration, difficulty_level, category) VALUES
(
    'Maya''s Leadership Prep Workflow',
    'Maya uploads HRIS data and prepares insights for next week''s leadership meeting',
    '[
        {"step": 1, "title": "Data Upload & Validation", "description": "Upload HRIS-exported spreadsheet and validate fields", "duration": 3, "talking_points": ["Maya is guided through uploading her most recent headcount and recruiting data", "System detects relevant fields and shows which panels are now available"]},
        {"step": 2, "title": "Instant Dashboard Feedback", "description": "Review automatically generated panels and insights", "duration": 4, "talking_points": ["Attrition Snapshot, Census Overview, Recruiting Pipeline Stats unlock immediately", "Receives prompt: Want to compare with your Q1 data?"]},
        {"step": 3, "title": "AI-Powered Risk Analysis", "description": "Ask Who is most at risk of leaving in Q3?", "duration": 5, "talking_points": ["Assistant analyzes tenure, job level, department trends", "Flags 3 employees with specific risk factors"]},
        {"step": 4, "title": "DEI & Turnover Analysis", "description": "Generate DEI breakdown and first-year turnover analysis", "duration": 4, "talking_points": ["Suggested prompts: Generate a DEI breakdown by department", "Summarize first-year turnover by recruiter"]},
        {"step": 5, "title": "Export for Leadership", "description": "Export insights as PDF for leadership deck", "duration": 2, "talking_points": ["Maya clicks Export Insights to generate simple PDF", "Pastes into leadership deck feeling prepared instead of overwhelmed"]}
    ]',
    '["HR Generalist", "CHRO"]',
    18,
    'beginner',
    'leadership_prep'
),
(
    'Sasha''s Daily Recruiting Dashboard',
    'Morning routine for strategic talent partner reviewing requisitions and pipeline health',
    '[
        {"step": 1, "title": "Daily Overview Alert", "description": "Review overnight alerts and requisition status", "duration": 2, "talking_points": ["Sees: You have 12 open requisitions. 3 have been open for over 30 days", "Clicks into Recruiting Dashboard"]},
        {"step": 2, "title": "Pipeline Health Check", "description": "Review avg days open, interview-to-offer ratio, top sources", "duration": 4, "talking_points": ["Dashboard shows: Avg. days open, interview-to-offer ratio, top sources", "Identifies concerning trends in pipeline"]},
        {"step": 3, "title": "Requisition Deep Dive", "description": "Investigate specific aging requisitions", "duration": 5, "talking_points": ["Types: What''s the status of my Engineering Manager req?", "Assistant: Open 34 days. Last candidate interview: 6 days ago. Hiring manager last responded: 8 days ago"]},
        {"step": 4, "title": "Performance Analysis", "description": "Compare recruiter performance and identify bottlenecks", "duration": 4, "talking_points": ["Prompt suggestion: What roles have the longest fill times?", "Compare recruiter performance over Q1 and Q2"]},
        {"step": 5, "title": "Stakeholder Communication", "description": "Export chart for Monday''s talent ops sync", "duration": 3, "talking_points": ["Exports metrics she didn''t have to manually build", "Reinforces Sasha''s value as strategic business partner"]}
    ]',
    '["Senior Recruiter", "VP of Talent"]',
    18,
    'beginner',
    'daily_recruiting'
),
(
    'James'' Team Risk Alert Response',
    'Frontline manager responds to attrition risk alert for team members',
    '[
        {"step": 1, "title": "Risk Alert Recognition", "description": "Receive and review attrition risk alert", "duration": 1, "talking_points": ["James gets email and in-app alert: 2 employees in your team show elevated attrition risk", "Clicks to view panel with risk drivers"]},
        {"step": 2, "title": "Individual Risk Analysis", "description": "Investigate why specific team member is flagged", "duration": 4, "talking_points": ["Types: Why is Marcus flagged as high risk?", "Assistant replies: Tenure: 2.5 years. Change in manager 3 months ago. 6 missed 1:1s. Recent engagement score: 3/10"]},
        {"step": 3, "title": "Team Pulse Review", "description": "Review overall team health metrics", "duration": 4, "talking_points": ["Clicks into Team Pulse Panel", "Reviews: tenure, last raise, utilization, feedback trends, notes from prior alerts"]},
        {"step": 4, "title": "Action Planning", "description": "Determine next steps and interventions", "duration": 3, "talking_points": ["Assistant suggests actions: Send engagement pulse survey?", "James plans 1:1s and check-ins based on data"]},
        {"step": 5, "title": "Follow-up Tracking", "description": "Set reminders and track intervention progress", "duration": 2, "talking_points": ["System helps James coach better without becoming data expert", "Empowers thoughtful leadership, not reactive behavior"]}
    ]',
    '["Team Lead", "HR Manager", "CHRO"]',
    14,
    'intermediate',
    'team_management'
),
(
    'Quarterly Business Review - Executive Prep',
    'Comprehensive preparation for C-level HR presentation using AI insights',
    '[
        {"step": 1, "title": "Strategic Metric Selection", "description": "Choose executive-level KPIs and trends", "duration": 4, "talking_points": ["Focus on business impact metrics", "Select trends that tell strategic story"]},
        {"step": 2, "title": "Cross-Department Analysis", "description": "Analyze patterns across all departments", "duration": 6, "talking_points": ["Identify department-specific trends", "Surface insights that weren''t visible before"]},
        {"step": 3, "title": "Predictive Insights", "description": "Use AI to forecast upcoming challenges", "duration": 5, "talking_points": ["Predict potential retention risks", "Forecast hiring needs and budget impact"]},
        {"step": 4, "title": "Narrative Building", "description": "Create compelling story from data insights", "duration": 5, "talking_points": ["Build narrative around key findings", "Connect HR metrics to business outcomes"]},
        {"step": 5, "title": "Executive Presentation Export", "description": "Generate executive-ready charts and summaries", "duration": 3, "talking_points": ["Export professional charts and insights", "Create talking points for board presentation"]}
    ]',
    '["CHRO", "VP of Talent"]',
    23,
    'advanced',
    'executive_reporting'
),
(
    'Crisis Response - Sudden Turnover Spike',
    'Investigate and respond to unexpected increase in departures',
    '[
        {"step": 1, "title": "Crisis Detection", "description": "Identify unusual turnover patterns in dashboard", "duration": 2, "talking_points": ["Dashboard alerts to unusual spike in departures", "Initial assessment of scope and timing"]},
        {"step": 2, "title": "Root Cause Investigation", "description": "Use AI to analyze potential causes", "duration": 6, "talking_points": ["Drill down into departure patterns", "Analyze exit interview data and engagement scores"]},
        {"step": 3, "title": "Department Impact Analysis", "description": "Assess which teams are most affected", "duration": 4, "talking_points": ["Identify departments with highest impact", "Analyze manager and team-specific factors"]},
        {"step": 4, "title": "Stakeholder Communication", "description": "Prepare urgent briefing for leadership", "duration": 4, "talking_points": ["Create executive summary of findings", "Prepare talking points for emergency leadership meeting"]},
        {"step": 5, "title": "Retention Strategy Development", "description": "Develop immediate and long-term action plan", "duration": 6, "talking_points": ["Create immediate intervention plan", "Develop long-term retention strategy based on insights"]}
    ]',
    '["CHRO", "HR Generalist", "Team Lead"]',
    22,
    'advanced',
    'crisis_management'
),
(
    'New User Onboarding - First Time Setup',
    'Guide new users through initial platform setup and first insights',
    '[
        {"step": 1, "title": "Role & Company Setup", "description": "Select role and configure company profile", "duration": 3, "talking_points": ["Choose from persona options", "Set company size and industry context"]},
        {"step": 2, "title": "Data Upload Guidance", "description": "Upload first HR dataset with template guidance", "duration": 4, "talking_points": ["Provide downloadable templates", "Guide through field mapping and validation"]},
        {"step": 3, "title": "Dashboard Personalization", "description": "Configure dashboard based on role and priorities", "duration": 3, "talking_points": ["Show role-specific KPIs", "Explain what each metric means for their role"]},
        {"step": 4, "title": "First AI Interaction", "description": "Try first natural language query", "duration": 4, "talking_points": ["Suggest relevant questions for their role", "Show how AI interprets and responds to queries"]},
        {"step": 5, "title": "Next Steps Planning", "description": "Set up regular workflows and alerts", "duration": 3, "talking_points": ["Configure alerts based on role priorities", "Schedule regular reporting cadence"]}
    ]',
    '["HR Generalist", "Senior Recruiter", "Team Lead", "CHRO", "Founding CHRO"]',
    17,
    'beginner',
    'onboarding'
);
