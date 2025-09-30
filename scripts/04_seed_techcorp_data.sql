-- Seed employee data for HealthServ Solutions (120 employees - Maya's company)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
-- Executive Leadership
(1, 'HS001', 'Maya', 'Jackson', 'maya.jackson@healthserv.com', 'HR', 'HR Generalist', '2022-03-15', 'active', 75000, 'Denver', 'full-time', '30-39', 'Female', 'Black'),
(1, 'HS002', 'Dr. Patricia', 'Williams', 'patricia.williams@healthserv.com', 'Executive', 'CHRO', '2021-01-10', 'active', 165000, 'Denver', 'full-time', '45-54', 'Female', 'White'),
(1, 'HS003', 'Robert', 'Chen', 'robert.chen@healthserv.com', 'Executive', 'CEO', '2020-06-01', 'active', 220000, 'Denver', 'full-time', '40-49', 'Male', 'Asian'),

-- Clinical Services (40 employees)
(1, 'HS101', 'Dr. Sarah', 'Martinez', 'sarah.martinez@healthserv.com', 'Clinical', 'Medical Director', '2021-02-15', 'active', 185000, 'Denver', 'full-time', '40-49', 'Female', 'Hispanic'),
(1, 'HS102', 'Jennifer', 'Thompson', 'jennifer.thompson@healthserv.com', 'Clinical', 'Nurse Practitioner', '2021-08-20', 'active', 95000, 'Denver', 'full-time', '35-44', 'Female', 'White'),
(1, 'HS103', 'Michael', 'Johnson', 'michael.johnson@healthserv.com', 'Clinical', 'Physical Therapist', '2022-01-10', 'active', 78000, 'Denver', 'full-time', '30-39', 'Male', 'Black'),
(1, 'HS104', 'Lisa', 'Rodriguez', 'lisa.rodriguez@healthserv.com', 'Clinical', 'Registered Nurse', '2022-04-15', 'active', 72000, 'Colorado Springs', 'full-time', '25-34', 'Female', 'Hispanic'),
(1, 'HS105', 'David', 'Kim', 'david.kim@healthserv.com', 'Clinical', 'Medical Assistant', '2022-09-01', 'active', 42000, 'Denver', 'full-time', '25-34', 'Male', 'Asian'),

-- Patient Services (25 employees)
(1, 'HS201', 'Amanda', 'Davis', 'amanda.davis@healthserv.com', 'Patient Services', 'Patient Services Manager', '2021-05-10', 'active', 68000, 'Denver', 'full-time', '35-44', 'Female', 'White'),
(1, 'HS202', 'Carlos', 'Mendez', 'carlos.mendez@healthserv.com', 'Patient Services', 'Patient Coordinator', '2022-02-20', 'active', 45000, 'Denver', 'full-time', '25-34', 'Male', 'Hispanic'),
(1, 'HS203', 'Rachel', 'Wilson', 'rachel.wilson@healthserv.com', 'Patient Services', 'Receptionist', '2022-06-15', 'active', 35000, 'Colorado Springs', 'full-time', '22-29', 'Female', 'White'),
(1, 'HS204', 'James', 'Brown', 'james.brown@healthserv.com', 'Patient Services', 'Insurance Specialist', '2021-11-01', 'active', 48000, 'Denver', 'full-time', '30-39', 'Male', 'Black'),

-- Administration (20 employees)
(1, 'HS301', 'Emily', 'Garcia', 'emily.garcia@healthserv.com', 'Administration', 'Operations Manager', '2021-07-01', 'active', 85000, 'Denver', 'full-time', '35-44', 'Female', 'Hispanic'),
(1, 'HS302', 'Kevin', 'Lee', 'kevin.lee@healthserv.com', 'Finance', 'Finance Manager', '2021-09-15', 'active', 78000, 'Denver', 'full-time', '30-39', 'Male', 'Asian'),
(1, 'HS303', 'Stephanie', 'Taylor', 'stephanie.taylor@healthserv.com', 'Administration', 'Compliance Officer', '2022-01-20', 'active', 72000, 'Denver', 'full-time', '35-44', 'Female', 'White'),
(1, 'HS304', 'Marcus', 'Anderson', 'marcus.anderson@healthserv.com', 'IT', 'IT Manager', '2022-03-10', 'active', 75000, 'Denver', 'full-time', '30-39', 'Male', 'Black'),

-- Support Staff (15 employees)
(1, 'HS401', 'Nicole', 'White', 'nicole.white@healthserv.com', 'Support', 'Medical Records Clerk', '2022-05-01', 'active', 38000, 'Denver', 'full-time', '25-34', 'Female', 'White'),
(1, 'HS402', 'Antonio', 'Lopez', 'antonio.lopez@healthserv.com', 'Support', 'Maintenance Supervisor', '2021-12-15', 'active', 52000, 'Denver', 'full-time', '40-49', 'Male', 'Hispanic'),
(1, 'HS403', 'Samantha', 'Green', 'samantha.green@healthserv.com', 'Support', 'Billing Specialist', '2022-08-20', 'active', 44000, 'Colorado Springs', 'full-time', '25-34', 'Female', 'White');

-- Insert some terminated employees for Maya's turnover analysis
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, termination_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
(1, 'HS901', 'Former', 'Nurse1', 'former1@healthserv.com', 'Clinical', 'Registered Nurse', '2021-06-01', '2023-11-15', 'terminated', 70000, 'Denver', 'full-time', '25-34', 'Female', 'White'),
(1, 'HS902', 'Former', 'Coordinator1', 'former2@healthserv.com', 'Patient Services', 'Patient Coordinator', '2022-01-15', '2023-12-01', 'terminated', 43000, 'Denver', 'full-time', '22-29', 'Male', 'Hispanic'),
(1, 'HS903', 'Former', 'Assistant1', 'former3@healthserv.com', 'Clinical', 'Medical Assistant', '2022-04-01', '2023-10-30', 'terminated', 40000, 'Colorado Springs', 'full-time', '22-29', 'Female', 'Black');

-- Insert HR metrics for HealthServ Solutions (Maya's realistic data)
INSERT INTO hr_metrics (company_id, metric_date, metric_type, department, value, percentage, count_value) VALUES
-- Turnover rates (healthcare services - moderate turnover)
(1, '2024-01-01', 'turnover_rate', 'Clinical', 0.0175, 1.75, 3),
(1, '2024-01-01', 'turnover_rate', 'Patient Services', 0.0220, 2.20, 2),
(1, '2024-01-01', 'turnover_rate', 'Administration', 0.0125, 1.25, 1),
(1, '2024-01-01', 'turnover_rate', 'Support', 0.0180, 1.80, 1),

-- Productivity rates
(1, '2024-01-01', 'productivity_rate', 'Clinical', 92.8, 92.80, NULL),
(1, '2024-01-01', 'productivity_rate', 'Patient Services', 89.5, 89.50, NULL),
(1, '2024-01-01', 'productivity_rate', 'Administration', 91.2, 91.20, NULL),
(1, '2024-01-01', 'productivity_rate', 'Support', 88.7, 88.70, NULL),

-- Engagement scores
(1, '2024-01-01', 'engagement_score', 'Clinical', 7.6, NULL, NULL),
(1, '2024-01-01', 'engagement_score', 'Patient Services', 7.2, NULL, NULL),
(1, '2024-01-01', 'engagement_score', 'Administration', 7.8, NULL, NULL),
(1, '2024-01-01', 'engagement_score', 'Support', 7.1, NULL, NULL),

-- Training costs (healthcare compliance requirements)
(1, '2024-01-01', 'training_cost_per_employee', 'Clinical', 1800.00, NULL, NULL),
(1, '2024-01-01', 'training_cost_per_employee', 'Patient Services', 950.00, NULL, NULL),
(1, '2024-01-01', 'training_cost_per_employee', 'Administration', 1200.00, NULL, NULL),
(1, '2024-01-01', 'training_cost_per_employee', 'Support', 650.00, NULL, NULL),

-- Revenue per employee (healthcare services model)
(1, '2024-01-01', 'revenue_per_employee', 'Clinical', 185000.00, NULL, NULL),
(1, '2024-01-01', 'revenue_per_employee', 'Patient Services', 95000.00, NULL, NULL),
(1, '2024-01-01', 'revenue_per_employee', 'Administration', 125000.00, NULL, NULL),
(1, '2024-01-01', 'revenue_per_employee', 'Support', 75000.00, NULL, NULL);

-- Insert recruitment metrics (Maya's recruiting data)
INSERT INTO recruitment_metrics (company_id, job_posting_date, position_title, department, applications_received, interviews_conducted, offers_made, offers_accepted, time_to_fill_days, cost_per_hire, hiring_manager, recruiter) VALUES
(1, '2024-01-01', 'Registered Nurse', 'Clinical', 28, 12, 3, 2, 42, 2800.00, 'Dr. Sarah Martinez', 'Maya Jackson'),
(1, '2024-01-05', 'Patient Coordinator', 'Patient Services', 45, 18, 5, 4, 28, 1200.00, 'Amanda Davis', 'Maya Jackson'),
(1, '2024-01-10', 'Medical Assistant', 'Clinical', 32, 15, 4, 3, 35, 1800.00, 'Dr. Sarah Martinez', 'Maya Jackson'),
(1, '2024-01-15', 'Billing Specialist', 'Support', 38, 10, 2, 2, 31, 1500.00, 'Emily Garcia', 'Maya Jackson');
