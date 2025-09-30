-- Seed employee data for CustomerFirst Corp (85 employees - James' company)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
-- Leadership
(3, 'CF001', 'James', 'Patel', 'james.patel@customerfirst.com', 'Customer Success', 'Customer Success Manager', '2021-08-15', 'active', 95000, 'Austin', 'full-time', '35-44', 'Male', 'Asian'),
(3, 'CF002', 'Lisa', 'Thompson', 'lisa.thompson@customerfirst.com', 'Executive', 'CHRO', '2020-06-01', 'active', 155000, 'Austin', 'full-time', '40-49', 'Female', 'White'),
(3, 'CF003', 'David', 'Kim', 'david.kim@customerfirst.com', 'HR', 'HR Manager', '2021-11-10', 'active', 85000, 'Austin', 'full-time', '30-39', 'Male', 'Asian'),

-- James' Direct Reports (9 team members)
(3, 'CF101', 'Marcus', 'Williams', 'marcus.williams@customerfirst.com', 'Customer Success', 'Senior Customer Success Rep', '2022-01-20', 'active', 72000, 'Austin', 'full-time', '25-34', 'Male', 'Black'),
(3, 'CF102', 'Sarah', 'Johnson', 'sarah.johnson@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2022-04-15', 'active', 65000, 'Remote', 'full-time', '25-34', 'Female', 'White'),
(3, 'CF103', 'Miguel', 'Rodriguez', 'miguel.rodriguez@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2022-07-01', 'active', 63000, 'Austin', 'full-time', '25-34', 'Male', 'Hispanic'),
(3, 'CF104', 'Jennifer', 'Chen', 'jennifer.chen@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2022-09-10', 'active', 64000, 'Remote', 'full-time', '25-34', 'Female', 'Asian'),
(3, 'CF105', 'Tyler', 'Davis', 'tyler.davis@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2023-01-15', 'active', 62000, 'Austin', 'full-time', '22-29', 'Male', 'White'),
(3, 'CF106', 'Amanda', 'Garcia', 'amanda.garcia@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2023-03-20', 'active', 61000, 'Remote', 'full-time', '22-29', 'Female', 'Hispanic'),
(3, 'CF107', 'Kevin', 'Brown', 'kevin.brown@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2023-05-01', 'active', 60000, 'Austin', 'full-time', '22-29', 'Male', 'Black'),
(3, 'CF108', 'Rachel', 'Wilson', 'rachel.wilson@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2023-08-15', 'active', 58000, 'Remote', 'full-time', '22-29', 'Female', 'White'),
(3, 'CF109', 'Alex', 'Martinez', 'alex.martinez@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2023-11-01', 'active', 57000, 'Austin', 'full-time', '22-29', 'Non-binary', 'Hispanic'),

-- Other Departments
-- Sales Team (15 employees - sample)
(3, 'CF201', 'Robert', 'Anderson', 'robert.anderson@customerfirst.com', 'Sales', 'VP of Sales', '2020-04-10', 'active', 145000, 'Austin', 'full-time', '40-49', 'Male', 'White'),
(3, 'CF202', 'Nicole', 'Taylor', 'nicole.taylor@customerfirst.com', 'Sales', 'Account Executive', '2021-09-20', 'active', 85000, 'Austin', 'full-time', '30-39', 'Female', 'White'),
(3, 'CF203', 'Carlos', 'Lopez', 'carlos.lopez@customerfirst.com', 'Sales', 'Sales Development Rep', '2022-12-05', 'active', 55000, 'Remote', 'full-time', '25-34', 'Male', 'Hispanic'),

-- Engineering Team (25 employees - sample)
(3, 'CF301', 'Emily', 'Zhang', 'emily.zhang@customerfirst.com', 'Engineering', 'Engineering Manager', '2020-09-15', 'active', 135000, 'Austin', 'full-time', '35-44', 'Female', 'Asian'),
(3, 'CF302', 'Michael', 'Smith', 'michael.smith@customerfirst.com', 'Engineering', 'Senior Software Engineer', '2021-05-20', 'active', 115000, 'Remote', 'full-time', '30-39', 'Male', 'White'),
(3, 'CF303', 'Sophia', 'Hernandez', 'sophia.hernandez@customerfirst.com', 'Engineering', 'Software Engineer', '2022-02-10', 'active', 95000, 'Austin', 'full-time', '25-34', 'Female', 'Hispanic'),

-- Product Team (12 employees - sample)
(3, 'CF401', 'Daniel', 'Lee', 'daniel.lee@customerfirst.com', 'Product', 'Head of Product', '2020-12-01', 'active', 145000, 'Austin', 'full-time', '35-44', 'Male', 'Asian'),
(3, 'CF402', 'Jessica', 'Miller', 'jessica.miller@customerfirst.com', 'Product', 'Product Manager', '2021-10-15', 'active', 105000, 'Remote', 'full-time', '30-39', 'Female', 'White'),

-- Marketing Team (8 employees - sample)
(3, 'CF501', 'Brandon', 'White', 'brandon.white@customerfirst.com', 'Marketing', 'Marketing Manager', '2021-07-01', 'active', 85000, 'Austin', 'full-time', '30-39', 'Male', 'White'),
(3, 'CF502', 'Natalie', 'Green', 'natalie.green@customerfirst.com', 'Marketing', 'Content Marketing Specialist', '2022-08-20', 'active', 65000, 'Remote', 'full-time', '25-34', 'Female', 'White');

-- Insert at-risk employees for James' team (based on user story)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
(3, 'CF901', 'Former', 'TeamMember1', 'former1@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2021-06-01', '2023-12-15', 'terminated', 64000, 'Austin', 'full-time', '25-34', 'Male', 'White'),
(3, 'CF902', 'Former', 'TeamMember2', 'former2@customerfirst.com', 'Customer Success', 'Customer Success Rep', '2022-03-01', '2023-11-30', 'terminated', 62000, 'Remote', 'full-time', '22-29', 'Female', 'Hispanic');

-- Insert engagement survey data showing risk patterns
INSERT INTO engagement_surveys (company_id, survey_date, employee_id, overall_satisfaction, work_life_balance, career_development, compensation_satisfaction, manager_effectiveness, department) VALUES
-- Marcus (high risk - matches user story)
(3, '2024-01-15', (SELECT id FROM employees WHERE employee_id = 'CF101'), 3.0, 2.5, 3.5, 4.0, 2.8, 'Customer Success'),
-- Other team members with varying scores
(3, '2024-01-15', (SELECT id FROM employees WHERE employee_id = 'CF102'), 7.5, 7.8, 6.9, 7.2, 8.1, 'Customer Success'),
(3, '2024-01-15', (SELECT id FROM employees WHERE employee_id = 'CF103'), 6.8, 6.5, 7.2, 6.9, 7.5, 'Customer Success'),
(3, '2024-01-15', (SELECT id FROM employees WHERE employee_id = 'CF104'), 8.2, 8.0, 7.8, 8.1, 8.3, 'Customer Success'),
(3, '2024-01-15', (SELECT id FROM employees WHERE employee_id = 'CF105'), 5.5, 5.2, 6.1, 5.8, 6.0, 'Customer Success'); -- Another potential risk

-- Insert HR metrics for CustomerFirst Corp (James' team focus)
INSERT INTO hr_metrics (company_id, metric_date, metric_type, department, value, percentage, count_value) VALUES
-- Team-specific turnover rates
(3, '2024-01-01', 'turnover_rate', 'Customer Success', 0.0285, 2.85, 3),
(3, '2024-01-01', 'turnover_rate', 'Sales', 0.0195, 1.95, 1),
(3, '2024-01-01', 'turnover_rate', 'Engineering', 0.0125, 1.25, 1),
(3, '2024-01-01', 'turnover_rate', 'Product', 0.0085, 0.85, 0),

-- Engagement scores by department
(3, '2024-01-01', 'engagement_score', 'Customer Success', 6.8, NULL, NULL),
(3, '2024-01-01', 'engagement_score', 'Sales', 7.4, NULL, NULL),
(3, '2024-01-01', 'engagement_score', 'Engineering', 7.9, NULL, NULL),
(3, '2024-01-01', 'engagement_score', 'Product', 8.1, NULL, NULL),

-- Productivity metrics
(3, '2024-01-01', 'productivity_rate', 'Customer Success', 88.5, 88.50, NULL),
(3, '2024-01-01', 'productivity_rate', 'Sales', 91.2, 91.20, NULL),
(3, '2024-01-01', 'productivity_rate', 'Engineering', 93.8, 93.80, NULL),
(3, '2024-01-01', 'productivity_rate', 'Product', 92.1, 92.10, NULL);

-- Insert absenteeism records showing team stress patterns
INSERT INTO absenteeism_records (company_id, employee_id, absence_date, absence_type, hours_missed, department) VALUES
(3, (SELECT id FROM employees WHERE employee_id = 'CF101'), '2024-01-08', 'personal', 8.0, 'Customer Success'),
(3, (SELECT id FROM employees WHERE employee_id = 'CF101'), '2024-01-12', 'sick', 4.0, 'Customer Success'),
(3, (SELECT id FROM employees WHERE employee_id = 'CF105'), '2024-01-10', 'unexcused', 8.0, 'Customer Success'),
(3, (SELECT id FROM employees WHERE employee_id = 'CF102'), '2024-01-15', 'personal', 4.0, 'Customer Success');
