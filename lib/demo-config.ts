export interface DemoStep {
  step: number
  title: string
  description: string
  duration: number
}

export interface DemoScenario {
  id: number
  name: string
  description: string
  steps: DemoStep[]
  target_personas: string[]
  company: string
}

export interface Company {
  name: string
  industry: string
  size: number
  color: string
}

export interface Persona {
  name: string
  role: string
  avatar: string
}

export interface PersonasByCompany {
  [companyName: string]: Persona[]
}

export interface Challenge {
  id: string
  label: string
  priority: number
  preSelected: boolean
}

export interface OnboardingScenarioConfig {
  id: number
  name: string
  description: string
  steps: DemoStep[]
  welcomeMessage: string
  completionMessage: string
  fileUploadConfig: {
    suggestedFileName: string
    expectedColumns: string[]
    industryContext: string
    uploadMessage: string
  }
  challenges: Challenge[]
  suggestedQueries: string[]
  dashboardConfig: {
    defaultLens: string
    priorityWidgets: string[]
  }
}

// Demo Scenarios - Edit these to add/modify scenarios
export const demoScenarios: DemoScenario[] = [
  {
    id: 1,
    name: "Maya's Leadership Prep Workflow",
    description: "Maya uploads HRIS data and prepares insights for next week's leadership meeting",
    steps: [
      {
        step: 1,
        title: "Data Upload & Validation",
        description: "Upload HRIS-exported spreadsheet and validate fields",
        duration: 3,
      },
      {
        step: 2,
        title: "Instant Dashboard Feedback",
        description: "Review automatically generated panels and insights",
        duration: 4,
      },
      {
        step: 3,
        title: "AI-Powered Risk Analysis",
        description: "Ask Who is most at risk of leaving in Q3?",
        duration: 5,
      },
      {
        step: 4,
        title: "DEI & Turnover Analysis",
        description: "Generate DEI breakdown and first-year turnover analysis",
        duration: 4,
      },
      {
        step: 5,
        title: "Export for Leadership",
        description: "Export insights as PDF for leadership deck",
        duration: 2,
      },
    ],
    target_personas: ["HR Generalist", "CHRO"],
    company: "HealthServ Solutions",
  },
  {
    id: 2,
    name: "Sasha's Daily Recruiting Dashboard",
    description: "Morning routine for strategic talent partner reviewing requisitions and pipeline health",
    steps: [
      {
        step: 1,
        title: "Daily Overview Alert",
        description: "Review overnight alerts and requisition status",
        duration: 2,
      },
      {
        step: 2,
        title: "Pipeline Health Check",
        description: "Review avg days open, interview-to-offer ratio, top sources",
        duration: 4,
      },
      {
        step: 3,
        title: "Requisition Deep Dive",
        description: "Investigate specific aging requisitions",
        duration: 5,
      },
      {
        step: 4,
        title: "Performance Analysis",
        description: "Compare recruiter performance and identify bottlenecks",
        duration: 4,
      },
      {
        step: 5,
        title: "Stakeholder Communication",
        description: "Export chart for Monday's talent ops sync",
        duration: 3,
      },
    ],
    target_personas: ["Senior Recruiter", "VP of Talent"],
    company: "TechFlow Inc",
  },
  {
    id: 3,
    name: "James' Team Risk Alert Response",
    description: "Frontline manager responds to attrition risk alert for team members",
    steps: [
      {
        step: 1,
        title: "Risk Alert Recognition",
        description: "Receive and review attrition risk alert",
        duration: 1,
      },
      {
        step: 2,
        title: "Individual Risk Analysis",
        description: "Investigate why specific team member is flagged",
        duration: 4,
      },
      {
        step: 3,
        title: "Team Pulse Review",
        description: "Review overall team health metrics",
        duration: 4,
      },
      {
        step: 4,
        title: "Action Planning",
        description: "Determine next steps and interventions",
        duration: 3,
      },
      {
        step: 5,
        title: "Follow-up Tracking",
        description: "Set reminders and track intervention progress",
        duration: 2,
      },
    ],
    target_personas: ["Team Lead", "HR Manager", "CHRO"],
    company: "CustomerFirst Corp",
  },
]

// Companies - Edit these to add/modify companies
export const companies: Company[] = [
  { name: "HealthServ Solutions", industry: "Healthcare Services", size: 120, color: "#2FCA75" },
  { name: "TechFlow Inc", industry: "Technology", size: 300, color: "#3496D8" },
  { name: "CustomerFirst Corp", industry: "Customer Success", size: 85, color: "#E64D3C" },
  { name: "StartupXYZ", industry: "Technology", size: 50, color: "#F2C213" },
]

// Personas by Company - Edit these to add/modify personas
export const personas: PersonasByCompany = {
  "HealthServ Solutions": [
    { name: "Maya Jackson", role: "HR Generalist", avatar: "/avatars/maya-jackson.jpg" },
    { name: "Dr. Patricia Williams", role: "CHRO", avatar: "/avatars/patricia-williams.jpg" },
  ],
  "TechFlow Inc": [
    { name: "Sasha Kim", role: "Senior Recruiter", avatar: "/avatars/sasha-kim.jpg" },
    { name: "Marcus Chen", role: "VP of Talent", avatar: "/avatars/marcus-chen.jpg" },
    { name: "Sarah Rodriguez", role: "Engineering Manager", avatar: "/avatars/sarah-rodriguez.jpg" },
  ],
  "CustomerFirst Corp": [
    { name: "James Patel", role: "Team Lead", avatar: "/avatars/james-patel.jpg" },
    { name: "Lisa Thompson", role: "CHRO", avatar: "/avatars/lisa-thompson.jpg" },
    { name: "David Kim", role: "HR Manager", avatar: "/avatars/david-kim.jpg" },
  ],
  StartupXYZ: [
    { name: "Alex Rivera", role: "Founding CHRO", avatar: "/avatars/alex-rivera.jpg" },
    { name: "Jordan Martinez", role: "CEO", avatar: "/avatars/jordan-martinez.jpg" },
  ],
}

// Default demo settings
export const defaultDemoSettings = {
  defaultCompany: "HealthServ Solutions",
  defaultPersona: "Maya Jackson",
  sessionIdPrefix: "demo_",
}

// Role to scenario mapping for onboarding
export const ROLE_SCENARIO_MAPPING = {
  "hr-generalist": 1, // Maya's Leadership Prep Workflow
  "talent-acquisition": 2, // Sasha's Daily Recruiting Dashboard
  "team-lead": 3, // James' Team Risk Alert Response
  "hr-business-partner": 1, // Default to leadership prep
  chro: 1, // Executive focus
  "people-ops": 1, // Operations focus
  "compensation-analyst": 1, // Analytics focus
}

// Onboarding scenario configurations
export const ONBOARDING_SCENARIOS: { [key: string]: OnboardingScenarioConfig } = {
  "hr-generalist": {
    id: 1,
    name: "Maya's Leadership Prep Workflow",
    description: "Upload HRIS data and prepare insights for next week's leadership meeting",
    steps: [
      {
        step: 1,
        title: "Data Upload & Validation",
        description: "Upload HRIS-exported spreadsheet and validate fields",
        duration: 3,
      },
      {
        step: 2,
        title: "Instant Dashboard Feedback",
        description: "Review automatically generated panels and insights",
        duration: 4,
      },
      {
        step: 3,
        title: "AI-Powered Risk Analysis",
        description: "Ask Who is most at risk of leaving in Q3?",
        duration: 5,
      },
      {
        step: 4,
        title: "DEI & Turnover Analysis",
        description: "Generate DEI breakdown and first-year turnover analysis",
        duration: 4,
      },
      {
        step: 5,
        title: "Export for Leadership",
        description: "Export insights as PDF for leadership deck",
        duration: 2,
      },
    ],
    welcomeMessage: "Perfect! We've prepared your leadership meeting workflow",
    completionMessage: "Ready to prepare insights for your leadership meeting",
    fileUploadConfig: {
      suggestedFileName: "HRIS_Export_HealthServ.csv",
      expectedColumns: ["employee_id", "name", "department", "hire_date", "manager", "salary", "status"],
      industryContext: "healthcare",
      uploadMessage:
        "Upload your HRIS data and watch as we generate real-time insights for your leadership prep workflow",
    },
    challenges: [
      { id: "high-turnover", label: "High employee turnover", priority: 1, preSelected: true },
      { id: "engagement-scores", label: "Low engagement scores", priority: 2, preSelected: true },
      { id: "recruiting-pipeline", label: "Weak recruiting pipeline", priority: 3, preSelected: false },
      { id: "leadership-development", label: "Leadership development", priority: 4, preSelected: true },
      { id: "compliance-tracking", label: "Compliance tracking", priority: 5, preSelected: false },
      { id: "performance-management", label: "Performance management", priority: 6, preSelected: false },
    ],
    suggestedQueries: [
      "Who's at risk of leaving in Q3?",
      "Show me turnover by department",
      "Generate a leadership summary",
    ],
    dashboardConfig: {
      defaultLens: "census",
      priorityWidgets: ["headcount", "turnover", "engagement", "compliance"],
    },
  },
  "talent-acquisition": {
    id: 2,
    name: "Sasha's Daily Recruiting Dashboard",
    description: "Morning routine for strategic talent partner reviewing requisitions and pipeline health",
    steps: [
      {
        step: 1,
        title: "Daily Overview Alert",
        description: "Review overnight alerts and requisition status",
        duration: 2,
      },
      {
        step: 2,
        title: "Pipeline Health Check",
        description: "Review avg days open, interview-to-offer ratio, top sources",
        duration: 4,
      },
      {
        step: 3,
        title: "Requisition Deep Dive",
        description: "Investigate specific aging requisitions",
        duration: 5,
      },
      {
        step: 4,
        title: "Performance Analysis",
        description: "Compare recruiter performance and identify bottlenecks",
        duration: 4,
      },
    ],
    welcomeMessage: "Perfect! We've prepared your recruiting pipeline workflow",
    completionMessage: "Your recruiting dashboard is ready to optimize your pipeline",
    fileUploadConfig: {
      suggestedFileName: "Recruiting_Pipeline.csv",
      expectedColumns: ["req_id", "role", "status", "recruiter", "hiring_manager", "days_open"],
      industryContext: "technology",
      uploadMessage: "Upload your ATS data and watch as we generate real-time insights for your recruiting pipeline",
    },
    challenges: [
      { id: "recruiting-pipeline", label: "Weak recruiting pipeline", priority: 1, preSelected: true },
      { id: "high-turnover", label: "High employee turnover", priority: 2, preSelected: true },
      { id: "leadership-development", label: "Leadership development", priority: 3, preSelected: false },
      { id: "engagement-scores", label: "Low engagement scores", priority: 4, preSelected: false },
    ],
    suggestedQueries: [
      "What's the status of my Engineering Manager req?",
      "What roles have the longest fill times?",
      "Compare recruiter performance over Q1 and Q2",
    ],
    dashboardConfig: {
      defaultLens: "recruiting",
      priorityWidgets: ["pipeline", "time-to-fill", "sources", "conversion"],
    },
  },
  "team-lead": {
    id: 3,
    name: "James' Team Risk Alert Response",
    description: "Frontline manager responds to attrition risk alert for team members",
    steps: [
      {
        step: 1,
        title: "Risk Alert Recognition",
        description: "Receive and review attrition risk alert",
        duration: 1,
      },
      {
        step: 2,
        title: "Individual Risk Analysis",
        description: "Investigate why specific team member is flagged",
        duration: 4,
      },
      {
        step: 3,
        title: "Team Pulse Review",
        description: "Review overall team health metrics",
        duration: 4,
      },
      {
        step: 4,
        title: "Action Planning",
        description: "Determine next steps and interventions",
        duration: 3,
      },
    ],
    welcomeMessage: "Perfect! We've prepared your team management workflow",
    completionMessage: "Your team dashboard is ready to help you manage team health",
    fileUploadConfig: {
      suggestedFileName: "Team_Data.csv",
      expectedColumns: ["employee_id", "name", "role", "manager", "engagement_score", "last_1on1"],
      industryContext: "customer-success",
      uploadMessage: "Upload your team data and watch as we generate real-time insights for team management",
    },
    challenges: [
      { id: "engagement-scores", label: "Low engagement scores", priority: 1, preSelected: true },
      { id: "high-turnover", label: "High employee turnover", priority: 2, preSelected: true },
      { id: "performance-management", label: "Performance management", priority: 3, preSelected: true },
      { id: "leadership-development", label: "Leadership development", priority: 4, preSelected: false },
    ],
    suggestedQueries: [
      "Why is Marcus flagged as high risk?",
      "Show me team engagement trends",
      "What interventions should I consider?",
    ],
    dashboardConfig: {
      defaultLens: "team",
      priorityWidgets: ["team-health", "engagement", "risk-alerts", "1on1-tracking"],
    },
  },
}

// Role-specific challenge presets (pre-selected and prioritized)
export const ROLE_CHALLENGE_PRESETS = {
  "hr-generalist": ONBOARDING_SCENARIOS["hr-generalist"].challenges,
  "talent-acquisition": ONBOARDING_SCENARIOS["talent-acquisition"].challenges,
  "team-lead": ONBOARDING_SCENARIOS["team-lead"].challenges,
}

// Onboarding-specific configurations
export const onboardingConfig = {
  fileUploadTemplates: {
    "hr-generalist": ONBOARDING_SCENARIOS["hr-generalist"].fileUploadConfig,
    "talent-acquisition": ONBOARDING_SCENARIOS["talent-acquisition"].fileUploadConfig,
    "team-lead": ONBOARDING_SCENARIOS["team-lead"].fileUploadConfig,
  },
  dashboardPersonalization: {
    "hr-generalist": ONBOARDING_SCENARIOS["hr-generalist"].dashboardConfig,
    "talent-acquisition": ONBOARDING_SCENARIOS["talent-acquisition"].dashboardConfig,
    "team-lead": ONBOARDING_SCENARIOS["team-lead"].dashboardConfig,
  },
}
