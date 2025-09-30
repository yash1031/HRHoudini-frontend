-- Create Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    demo_data_set VARCHAR(50) NOT NULL,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3496D8',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users table for demo personas
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    persona_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    demo_credentials JSONB,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Demo Scenarios table
CREATE TABLE IF NOT EXISTS demo_scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps_json JSONB NOT NULL,
    target_personas JSONB NOT NULL,
    estimated_duration INTEGER, -- in minutes
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employees table (segmented by company)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    department VARCHAR(100),
    job_title VARCHAR(150),
    hire_date DATE,
    termination_date DATE,
    employment_status VARCHAR(50) DEFAULT 'active',
    salary DECIMAL(10,2),
    manager_id INTEGER,
    location VARCHAR(100),
    employment_type VARCHAR(50), -- full-time, part-time, contract
    age_group VARCHAR(20),
    gender VARCHAR(20),
    ethnicity VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_id)
);

-- Create HR Metrics table for aggregated data
CREATE TABLE IF NOT EXISTS hr_metrics (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    value DECIMAL(10,4),
    percentage DECIMAL(5,2),
    count_value INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, metric_date, metric_type, department)
);

-- Create Turnover Events table
CREATE TABLE IF NOT EXISTS turnover_events (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    termination_date DATE NOT NULL,
    termination_type VARCHAR(50), -- voluntary, involuntary, retirement
    reason VARCHAR(100),
    department VARCHAR(100),
    tenure_months INTEGER,
    exit_interview_score DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Engagement Surveys table
CREATE TABLE IF NOT EXISTS engagement_surveys (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    survey_date DATE NOT NULL,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    overall_satisfaction DECIMAL(3,1),
    work_life_balance DECIMAL(3,1),
    career_development DECIMAL(3,1),
    compensation_satisfaction DECIMAL(3,1),
    manager_effectiveness DECIMAL(3,1),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Training Records table
CREATE TABLE IF NOT EXISTS training_records (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    training_name VARCHAR(255),
    training_category VARCHAR(100),
    cost DECIMAL(8,2),
    completion_date DATE,
    effectiveness_score DECIMAL(3,1),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Recruitment Metrics table
CREATE TABLE IF NOT EXISTS recruitment_metrics (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    job_posting_date DATE,
    position_title VARCHAR(150),
    department VARCHAR(100),
    applications_received INTEGER,
    interviews_conducted INTEGER,
    offers_made INTEGER,
    offers_accepted INTEGER,
    time_to_fill_days INTEGER,
    cost_per_hire DECIMAL(8,2),
    hiring_manager VARCHAR(100),
    recruiter VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Absenteeism Records table
CREATE TABLE IF NOT EXISTS absenteeism_records (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    absence_date DATE,
    absence_type VARCHAR(50), -- sick, personal, vacation, unexcused
    hours_missed DECIMAL(4,1),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Demo Session State table
CREATE TABLE IF NOT EXISTS demo_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    current_company_id INTEGER REFERENCES companies(id),
    current_user_id INTEGER REFERENCES users(id),
    current_scenario_id INTEGER REFERENCES demo_scenarios(id),
    current_step INTEGER DEFAULT 0,
    session_data JSONB,
    is_presenter_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(company_id, department);
CREATE INDEX IF NOT EXISTS idx_hr_metrics_company_date ON hr_metrics(company_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_hr_metrics_type ON hr_metrics(company_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_turnover_company_date ON turnover_events(company_id, termination_date);
CREATE INDEX IF NOT EXISTS idx_engagement_company_date ON engagement_surveys(company_id, survey_date);
CREATE INDEX IF NOT EXISTS idx_training_company_date ON training_records(company_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_recruitment_company_date ON recruitment_metrics(company_id, job_posting_date);
CREATE INDEX IF NOT EXISTS idx_absenteeism_company_date ON absenteeism_records(company_id, absence_date);
