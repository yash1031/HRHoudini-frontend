-- Seed employee data for RetailPlus (2000 employees - sample subset)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
-- Store Operations (1200 employees - showing sample)
(2, 'RP001', 'Jennifer', 'Martinez', 'jennifer.martinez@retailplus.com', 'Executive', 'CHRO', '2020-01-15', 'active', 185000, 'Chicago', 'full-time', '45-54', 'Female', 'Hispanic'),
(2, 'RP002', 'Robert', 'Thompson', 'robert.thompson@retailplus.com', 'HR', 'HR Business Partner', '2021-03-10', 'active', 95000, 'Chicago', 'full-time', '35-44', 'Male', 'White'),
(2, 'RP003', 'Lisa', 'Park', 'lisa.park@retailplus.com', 'HR', 'Talent Acquisition Manager', '2021-07-20', 'active', 88000, 'Chicago', 'full-time', '30-39', 'Female', 'Asian'),
(2, 'RP004', 'Michael', 'Johnson', 'michael.johnson@retailplus.com', 'HR', 'DEI Manager', '2022-02-01', 'active', 92000, 'Chicago', 'full-time', '35-44', 'Male', 'Black'),

-- Store Management
(2, 'RP101', 'Sarah', 'Williams', 'sarah.williams@retailplus.com', 'Store Operations', 'Store Manager', '2019-05-15', 'active', 65000, 'New York', 'full-time', '35-44', 'Female', 'White'),
(2, 'RP102', 'Carlos', 'Rodriguez', 'carlos.rodriguez@retailplus.com', 'Store Operations', 'Assistant Manager', '2020-08-10', 'active', 45000, 'Los Angeles', 'full-time', '25-34', 'Male', 'Hispanic'),
(2, 'RP103', 'Ashley', 'Davis', 'ashley.davis@retailplus.com', 'Store Operations', 'Department Supervisor', '2021-11-01', 'active', 38000, 'Miami', 'full-time', '25-34', 'Female', 'White'),

-- Sales Associates (showing seasonal pattern)
(2, 'RP201', 'Tyler', 'Brown', 'tyler.brown@retailplus.com', 'Store Operations', 'Sales Associate', '2023-10-01', 'active', 28000, 'Dallas', 'part-time', '18-24', 'Male', 'White'),
(2, 'RP202', 'Madison', 'Wilson', 'madison.wilson@retailplus.com', 'Store Operations', 'Sales Associate', '2023-09-15', 'active', 26000, 'Phoenix', 'part-time', '18-24', 'Female', 'White'),
(2, 'RP203', 'Jordan', 'Garcia', 'jordan.garcia@retailplus.com', 'Store Operations', 'Cashier', '2023-11-01', 'active', 25000, 'Houston', 'part-time', '18-24', 'Non-binary', 'Hispanic'),

-- Distribution Center
(2, 'RP301', 'Mark', 'Anderson', 'mark.anderson@retailplus.com', 'Distribution', 'Warehouse Manager', '2018-03-20', 'active', 72000, 'Indianapolis', 'full-time', '40-49', 'Male', 'White'),
(2, 'RP302', 'Patricia', 'Taylor', 'patricia.taylor@retailplus.com', 'Distribution', 'Logistics Coordinator', '2020-06-15', 'active', 48000, 'Indianapolis', 'full-time', '30-39', 'Female', 'Black'),

-- Corporate
(2, 'RP401', 'Steven', 'Miller', 'steven.miller@retailplus.com', 'Marketing', 'Marketing Director', '2019-01-10', 'active', 115000, 'Chicago', 'full-time', '40-49', 'Male', 'White'),
(2, 'RP402', 'Nicole', 'Jones', 'nicole.jones@retailplus.com', 'Finance', 'Finance Manager', '2020-04-05', 'active', 95000, 'Chicago', 'full-time', '35-44', 'Female', 'White');

-- Insert terminated employees (higher turnover in retail)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, termination_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
(2, 'RP901', 'Former', 'Associate1', 'former1@retailplus.com', 'Store Operations', 'Sales Associate', '2023-06-01', '2023-12-15', 'terminated', 26000, 'Atlanta', 'part-time', '18-24', 'Male', 'White'),
(2, 'RP902', 'Former', 'Associate2', 'former2@retailplus.com', 'Store Operations', 'Cashier', '2023-08-15', '2024-01-10', 'terminated', 25000, 'Denver', 'part-time', '18-24', 'Female', 'Hispanic'),
(2, 'RP903', 'Former', 'Supervisor', 'former3@retailplus.com', 'Store Operations', 'Department Supervisor', '2022-01-10', '2023-11-30', 'terminated', 38000, 'Seattle', 'full-time', '25-34', 'Male', 'Black');

-- Insert HR metrics for RetailPlus (higher turnover, seasonal patterns)
INSERT INTO hr_metrics (company_id, metric_date, metric_type, department, value, percentage, count_value) VALUES
-- Higher turnover rates typical for retail
(2, '2024-01-01', 'turnover_rate', 'Store Operations', 0.0285, 2.85, 45),
(2, '2024-01-01', 'turnover_rate', 'Distribution', 0.0180, 1.80, 8),
(2, '2024-01-01', 'turnover_rate', 'Corporate', 0.0095, 0.95, 3),
(2, '2024-01-01', 'turnover_rate', 'HR', 0.0050, 0.50, 1),

-- Productivity rates
(2, '2024-01-01', 'productivity_rate', 'Store Operations', 87.3, 87.30, NULL),
(2, '2024-01-01', 'productivity_rate', 'Distribution', 91.8, 91.80, NULL),
(2, '2024-01-01', 'productivity_rate', 'Corporate', 89.5, 89.50, NULL),

-- Lower engagement scores due to retail challenges
(2, '2024-01-01', 'engagement_score', 'Store Operations', 6.8, NULL, NULL),
(2, '2024-01-01', 'engagement_score', 'Distribution', 7.2, NULL, NULL),
(2, '2024-01-01', 'engagement_score', 'Corporate', 7.8, NULL, NULL),

-- Lower training costs per employee
(2, '2024-01-01', 'training_cost_per_employee', 'Store Operations', 450.00, NULL, NULL),
(2, '2024-01-01', 'training_cost_per_employee', 'Distribution', 680.00, NULL, NULL),
(2, '2024-01-01', 'training_cost_per_employee', 'Corporate', 1200.00, NULL, NULL),

-- Revenue per employee (lower than tech)
(2, '2024-01-01', 'revenue_per_employee', 'Store Operations', 45000.00, NULL, NULL),
(2, '2024-01-01', 'revenue_per_employee', 'Distribution', 65000.00, NULL, NULL),
(2, '2024-01-01', 'revenue_per_employee', 'Corporate', 95000.00, NULL, NULL);

-- Insert recruitment metrics (high volume, seasonal hiring)
INSERT INTO recruitment_metrics (company_id, job_posting_date, position_title, department, applications_received, interviews_conducted, offers_made, offers_accepted, time_to_fill_days, cost_per_hire, hiring_manager, recruiter) VALUES
(2, '2023-10-01', 'Seasonal Sales Associate', 'Store Operations', 120, 45, 25, 20, 14, 850.00, 'Sarah Williams', 'Lisa Park'),
(2, '2023-10-15', 'Holiday Cashier', 'Store Operations', 95, 38, 20, 16, 12, 780.00, 'Carlos Rodriguez', 'Lisa Park'),
(2, '2024-01-05', 'Store Manager', 'Store Operations', 25, 8, 2, 1, 45, 2800.00, 'Regional Manager', 'Lisa Park'),
(2, '2024-01-10', 'Warehouse Associate', 'Distribution', 35, 15, 8, 6, 18, 1200.00, 'Mark Anderson', 'Lisa Park');

-- Insert higher absenteeism typical for retail
INSERT INTO absenteeism_records (company_id, employee_id, absence_date, absence_type, hours_missed, department) VALUES
(2, (SELECT id FROM employees WHERE employee_id = 'RP201'), '2024-01-08', 'unexcused', 8.0, 'Store Operations'),
(2, (SELECT id FROM employees WHERE employee_id = 'RP202'), '2024-01-10', 'sick', 6.0, 'Store Operations'),
(2, (SELECT id FROM employees WHERE employee_id = 'RP203'), '2024-01-12', 'personal', 4.0, 'Store Operations'),
(2, (SELECT id FROM employees WHERE employee_id = 'RP301'), '2024-01-15', 'sick', 8.0, 'Distribution');
