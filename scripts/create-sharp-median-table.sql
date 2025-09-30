-- Create Sharp Median employees table
CREATE TABLE IF NOT EXISTS sharp_median_employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    employee_status VARCHAR(50),
    employee_type VARCHAR(50),
    employee_name VARCHAR(255),
    original_hire_date DATE,
    last_hire_date DATE,
    seniority_date DATE,
    termination_date DATE,
    termination_reason_code VARCHAR(50),
    termination_reason TEXT,
    termination_type VARCHAR(50),
    company VARCHAR(100),
    organization VARCHAR(100),
    department VARCHAR(100),
    job_code VARCHAR(50),
    job_title VARCHAR(255),
    supervisor_employee_number VARCHAR(50),
    supervisor_name VARCHAR(255),
    location VARCHAR(100),
    region VARCHAR(100),
    address_work TEXT,
    city_work VARCHAR(100),
    state_work VARCHAR(10),
    postal_code_work VARCHAR(20),
    country_work VARCHAR(50),
    address_home TEXT,
    city_home VARCHAR(100),
    state_home VARCHAR(10),
    postal_code_home VARCHAR(20),
    country_home VARCHAR(50),
    salary_or_hourly VARCHAR(20),
    hourly_rate DECIMAL(10,2),
    annual_salary DECIMAL(12,2),
    local_currency_code VARCHAR(10),
    gender VARCHAR(20),
    ethnicity VARCHAR(50),
    date_of_birth DATE,
    email_address VARCHAR(255),
    remote_flag INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sharp_median_employee_status ON sharp_median_employees(employee_status);
CREATE INDEX IF NOT EXISTS idx_sharp_median_department ON sharp_median_employees(department);
CREATE INDEX IF NOT EXISTS idx_sharp_median_location ON sharp_median_employees(location);
CREATE INDEX IF NOT EXISTS idx_sharp_median_termination_date ON sharp_median_employees(termination_date);
CREATE INDEX IF NOT EXISTS idx_sharp_median_hire_date ON sharp_median_employees(original_hire_date);
