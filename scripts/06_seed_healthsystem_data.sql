-- Seed employee data for HealthSystem (1200 employees - sample subset)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
-- Executive Leadership
(3, 'HS001', 'Amanda', 'Foster', 'amanda.foster@healthsystem.org', 'Executive', 'CHRO', '2019-08-01', 'active', 195000, 'Boston', 'full-time', '45-54', 'Female', 'White'),
(3, 'HS002', 'James', 'Wilson', 'james.wilson@healthsystem.org', 'HR', 'HR Business Partner', '2020-11-15', 'active', 105000, 'Boston', 'full-time', '35-44', 'Male', 'Black'),
(3, 'HS003', 'Rachel', 'Green', 'rachel.green@healthsystem.org', 'Finance', 'Compensation Analyst', '2021-04-10', 'active', 88000, 'Boston', 'full-time', '30-39', 'Female', 'White'),
(3, 'HS004', 'Kevin', 'Lee', 'kevin.lee@healthsystem.org', 'HR', 'People Operations Specialist', '2021-09-20', 'active', 72000, 'Boston', 'full-time', '25-34', 'Male', 'Asian'),

-- Clinical Staff
(3, 'HS101', 'Dr. Maria', 'Santos', 'maria.santos@healthsystem.org', 'Clinical', 'Attending Physician', '2018-02-15', 'active', 285000, 'Boston', 'full-time', '35-44', 'Female', 'Hispanic'),
(3, 'HS102', 'Dr. Robert', 'Kim', 'robert.kim@healthsystem.org', 'Clinical', 'Resident Physician', '2022-07-01', 'active', 65000, 'Boston', 'full-time', '25-34', 'Male', 'Asian'),
(3, 'HS103', 'Sarah', 'Mitchell', 'sarah.mitchell@healthsystem.org', 'Clinical', 'Registered Nurse', '2020-03-10', 'active', 78000, 'Boston', 'full-time', '30-39', 'Female', 'White'),
(3, 'HS104', 'Carlos', 'Hernandez', 'carlos.hernandez@healthsystem.org', 'Clinical', 'Nurse Practitioner', '2019-06-20', 'active', 95000, 'Boston', 'full-time', '35-44', 'Male', 'Hispanic'),

-- Nursing Staff (24/7 operations)
(3, 'HS201', 'Jennifer', 'Adams', 'jennifer.adams@healthsystem.org', 'Nursing', 'Charge Nurse', '2017-09-15', 'active', 85000, 'Boston', 'full-time', '40-49', 'Female', 'White'),
(3, 'HS202', 'Michael', 'Brown', 'michael.brown@healthsystem.org', 'Nursing', 'ICU Nurse', '2019-01-20', 'active', 82000, 'Boston', 'full-time', '30-39', 'Male', 'Black'),
(3, 'HS203', 'Lisa', 'Chen', 'lisa.chen@healthsystem.org', 'Nursing', 'Emergency Nurse', '2020-05-10', 'active', 80000, 'Boston', 'full-time', '25-34', 'Female', 'Asian'),
(3, 'HS204', 'David', 'Rodriguez', 'david.rodriguez@healthsystem.org', 'Nursing', 'Pediatric Nurse', '2021-08-15', 'active', 76000, 'Boston', 'full-time', '25-34', 'Male', 'Hispanic'),

-- Support Staff
(3, 'HS301', 'Patricia', 'Johnson', 'patricia.johnson@healthsystem.org', 'Support', 'Medical Assistant', '2020-10-05', 'active', 42000, 'Boston', 'full-time', '25-34', 'Female', 'Black'),
(3, 'HS302', 'Thomas', 'Wilson', 'thomas.wilson@healthsystem.org', 'Support', 'Lab Technician', '2019-12-01', 'active', 48000, 'Boston', 'full-time', '30-39', 'Male', 'White'),
(3, 'HS303', 'Angela', 'Davis', 'angela.davis@healthsystem.org', 'Support', 'Radiology Tech', '2021-03-15', 'active', 55000, 'Boston', 'full-time', '30-39', 'Female', 'Black'),

-- Administrative
(3, 'HS401', 'Mark', 'Thompson', 'mark.thompson@healthsystem.org', 'Administration', 'Operations Manager', '2018-11-10', 'active', 95000, 'Boston', 'full-time', '40-49', 'Male', 'White'),
(3, 'HS402', 'Susan', 'Garcia', 'susan.garcia@healthsystem.org', 'Administration', 'Patient Services Coordinator', '2020-07-20', 'active', 52000, 'Boston', 'full-time', '35-44', 'Female', 'Hispanic');

-- Insert some terminated employees (lower turnover in healthcare)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, termination_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
(3, 'HS901', 'Former', 'Nurse1', 'former1@healthsystem.org', 'Nursing', 'Registered Nurse', '2021-01-15', '2023-12-01', 'terminated', 76000, 'Boston', 'full-time', '25-34', 'Female', 'White'),
(3, 'HS902', 'Former', 'Tech1', 'former2@healthsystem.org', 'Support', 'Medical Assistant', '2022-03-01', '2023-11-15', 'terminated', 40000, 'Boston', 'full-time', '22-29', 'Male', 'Hispanic');

-- Insert HR metrics for HealthSystem (lower turnover, higher engagement, compliance focus)
INSERT INTO hr_metrics (company_id, metric_date, metric_type, department, value, percentage, count_value) VALUES
-- Lower turnover rates typical for healthcare
(3, '2024-01-01', 'turnover_rate', 'Clinical', 0.0125, 1.25, 8),
(3, '2024-01-01', 'turnover_rate', 'Nursing', 0.0165, 1.65, 12),
(3, '2024-01-01', 'turnover_rate', 'Support', 0.0195, 1.95, 6),
(3, '2024-01-01', 'turnover_rate', 'Administration', 0.0085, 0.85, 2),

-- High productivity rates due to critical nature
(3, '2024-01-01', 'productivity_rate', 'Clinical', 96.8, 96.80, NULL),
(3, '2024-01-01', 'productivity_rate', 'Nursing', 94.2, 94.20, NULL),
(3, '2024-01-01', 'productivity_rate', 'Support', 92.5, 92.50, NULL),
(3, '2024-01-01', 'productivity_rate', 'Administration', 89.8, 89.80, NULL),

-- Higher engagement scores due to mission-driven work
(3, '2024-01-01', 'engagement_score', 'Clinical', 8.4, NULL, NULL),
(3, '2024-01-01', 'engagement_score', 'Nursing', 7.9, NULL, NULL),
(3, '2024-01-01', 'engagement_score', 'Support', 7.6, NULL, NULL),
(3, '2024-01-01', 'engagement_score', 'Administration', 7.8, NULL, NULL),

-- Higher training costs due to compliance requirements
(3, '2024-01-01', 'training_cost_per_employee', 'Clinical', 3200.00, NULL, NULL),
(3, '2024-01-01', 'training_cost_per_employee', 'Nursing', 2800.00, NULL, NULL),
(3, '2024-01-01', 'training_cost_per_employee', 'Support', 1800.00, NULL, NULL),
(3, '2024-01-01', 'training_cost_per_employee', 'Administration', 1200.00, NULL, NULL),

-- Revenue per employee (healthcare model)
(3, '2024-01-01', 'revenue_per_employee', 'Clinical', 450000.00, NULL, NULL),
(3, '2024-01-01', 'revenue_per_employee', 'Nursing', 180000.00, NULL, NULL),
(3, '2024-01-01', 'revenue_per_employee', 'Support', 120000.00, NULL, NULL),
(3, '2024-01-01', 'revenue_per_employee', 'Administration', 85000.00, NULL, NULL);

-- Insert recruitment metrics (specialized roles, longer time to fill)
INSERT INTO recruitment_metrics (company_id, job_posting_date, position_title, department, applications_received, interviews_conducted, offers_made, offers_accepted, time_to_fill_days, cost_per_hire, hiring_manager, recruiter) VALUES
(3, '2024-01-01', 'Registered Nurse - ICU', 'Nursing', 18, 12, 3, 2, 52, 4800.00, 'Jennifer Adams', 'James Wilson'),
(3, '2024-01-05', 'Medical Assistant', 'Support', 35, 15, 5, 4, 28, 2200.00, 'Mark Thompson', 'James Wilson'),
(3, '2024-01-10', 'Lab Technician', 'Support', 22, 8, 2, 1, 38, 3200.00, 'Thomas Wilson', 'James Wilson'),
(3, '2024-01-15', 'Nurse Practitioner', 'Clinical', 12, 6, 2, 1, 65, 5500.00, 'Dr. Maria Santos', 'James Wilson');

-- Insert lower absenteeism (healthcare workers are generally more reliable)
INSERT INTO absenteeism_records (company_id, employee_id, absence_date, absence_type, hours_missed, department) VALUES
(3, (SELECT id FROM employees WHERE employee_id = 'HS103'), '2024-01-08', 'sick', 12.0, 'Clinical'),
(3, (SELECT id FROM employees WHERE employee_id = 'HS202'), '2024-01-10', 'personal', 8.0, 'Nursing'),
(3, (SELECT id FROM employees WHERE employee_id = 'HS301'), '2024-01-12', 'sick', 8.0, 'Support'),
(3, (SELECT id FROM employees WHERE employee_id = 'HS401'), '2024-01-15', 'vacation', 8.0, 'Administration');
