-- Create Demo Configuration Tables

-- Demo Settings table for global configuration
CREATE TABLE IF NOT EXISTS demo_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demo Companies table (replaces hardcoded companies)
CREATE TABLE IF NOT EXISTS demo_companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    color VARCHAR(7) NOT NULL, -- hex color
    logo_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demo Personas table (replaces hardcoded personas)
CREATE TABLE IF NOT EXISTS demo_personas (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES demo_companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(150) NOT NULL,
    avatar_url VARCHAR(500),
    description TEXT,
    login_hint TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demo Scenario Steps table (for flexible step management)
CREATE TABLE IF NOT EXISTS demo_scenario_steps (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER REFERENCES demo_scenarios(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 5,
    screen_component VARCHAR(100), -- component identifier for rendering
    talking_points JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scenario_id, step_number)
);

-- Demo Screen Components table (for managing screen configurations)
CREATE TABLE IF NOT EXISTS demo_screen_components (
    id SERIAL PRIMARY KEY,
    component_key VARCHAR(100) UNIQUE NOT NULL,
    component_name VARCHAR(255) NOT NULL,
    description TEXT,
    props_schema JSONB, -- JSON schema for component props
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demo_personas_company ON demo_personas(company_id);
CREATE INDEX IF NOT EXISTS idx_demo_scenario_steps_scenario ON demo_scenario_steps(scenario_id, step_number);
CREATE INDEX IF NOT EXISTS idx_demo_companies_active ON demo_companies(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_demo_personas_active ON demo_personas(is_active, sort_order);
