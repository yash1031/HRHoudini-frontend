-- Seed employee data for StartupXYZ (50 employees - early stage startup)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
-- Founding Team
(4, 'SXY001', 'Alex', 'Rivera', 'alex.rivera@startupxyz.com', 'Executive', 'Founding CHRO', '2023-01-15', 'active', 120000, 'San Francisco', 'full-time', '35-44', 'Non-binary', 'Hispanic'),
(4, 'SXY002', 'Jordan', 'Martinez', 'jordan.martinez@startupxyz.com', 'Executive', 'CEO', '2022-06-01', 'active', 150000, 'San Francisco', 'full-time', '30-39', 'Non-binary', 'Hispanic'),
(4, 'SXY003', 'Priya', 'Patel', 'priya.patel@startupxyz.com', 'Executive', 'CTO', '2022-07-15', 'active', 145000, 'San Francisco', 'full-time', '30-39', 'Female', 'Asian'),
(4, 'SXY004', 'Marcus', 'Johnson', 'marcus.johnson@startupxyz.com', 'Executive', 'VP of Sales', '2022-09-01', 'active', 135000, 'San Francisco', 'full-time', '30-39', 'Male', 'Black'),

-- Engineering Team (20 employees)
(4, 'SXY101', 'Elena', 'Rodriguez', 'elena.rodriguez@startupxyz.com', 'Engineering', 'Senior Software Engineer', '2022-08-15', 'active', 140000, 'Remote', 'full-time', '25-34', 'Female', 'Hispanic'),
(4, 'SXY102', 'Ryan', 'Chen', 'ryan.chen@startupxyz.com', 'Engineering', 'Full Stack Developer', '2022-10-01', 'active', 120000, 'San Francisco', 'full-time', '25-34', 'Male', 'Asian'),
(4, 'SXY103', 'Sophie', 'Williams', 'sophie.williams@startupxyz.com', 'Engineering', 'Frontend Developer', '2022-11-10', 'active', 110000, 'Remote', 'full-time', '22-29', 'Female', 'White'),
(4, 'SXY104', 'Ahmed', 'Ali', 'ahmed.ali@startupxyz.com', 'Engineering', 'Backend Developer', '2023-01-20', 'active', 115000, 'San Francisco', 'full-time', '25-34', 'Male', 'Middle Eastern'),
(4, 'SXY105', 'Jessica', 'Brown', 'jessica.brown@startupxyz.com', 'Engineering', 'DevOps Engineer', '2023-02-15', 'active', 125000, 'Remote', 'full-time', '25-34', 'Female', 'White'),

-- Product Team (8 employees)
(4, 'SXY201', 'Chris', 'Martinez', 'chris.martinez@startupxyz.com', 'Product', 'Head of Product', '2022-08-15', 'active', 130000, 'San Francisco', 'full-time', '30-39', 'Male', 'Hispanic'),
(4, 'SXY202', 'Taylor', 'Wilson', 'taylor.wilson@startupxyz.com', 'Product', 'Product Manager', '2022-12-01', 'active', 105000, 'Remote', 'full-time', '25-34', 'Non-binary', 'White'),
(4, 'SXY203', 'Zoe', 'Anderson', 'zoe.anderson@startupxyz.com', 'Product', 'UX Designer', '2023-01-05', 'active', 95000, 'San Francisco', 'full-time', '25-34', 'Female', 'White'),

-- Sales & Marketing (12 employees)
(4, 'SXY301', 'Brandon', 'Taylor', 'brandon.taylor@startupxyz.com', 'Sales', 'Account Executive', '2022-09-01', 'active', 85000, 'San Francisco', 'full-time', '25-34', 'Male', 'White'),
(4, 'SXY302', 'Natalie', 'Garcia', 'natalie.garcia@startupxyz.com', 'Sales', 'SDR', '2023-01-10', 'active', 65000, 'Remote', 'full-time', '22-29', 'Female', 'Hispanic'),
(4, 'SXY303', 'Kevin', 'Park', 'kevin.park@startupxyz.com', 'Marketing', 'Marketing Manager', '2023-04-01', 'active', 85000, 'San Francisco', 'full-time', '25-34', 'Male', 'Asian'),

-- Operations (10 employees)
(4, 'SXY401', 'Rachel', 'Thompson', 'rachel.thompson@startupxyz.com', 'Operations', 'Operations Manager', '2022-10-15', 'active', 90000, 'San Francisco', 'full-time', '30-39', 'Female', 'White'),
(4, 'SXY402', 'Tyler', 'Johnson', 'tyler.johnson@startupxyz.com', 'Finance', 'Finance Manager', '2023-01-30', 'active', 85000, 'San Francisco', 'full-time', '25-34', 'Male', 'Black'),
(4, 'SXY403', 'Ashley', 'Chen', 'ashley.chen@startupxyz.com', 'Operations', 'Office Manager', '2023-03-20', 'active', 55000, 'San Francisco', 'full-time', '25-34', 'Female', 'Asian');

-- Insert HR metrics for StartupXYZ (early stage patterns)
INSERT INTO hr_metrics (company_id, metric_date, metric_type, department, value, percentage, count_value) VALUES
-- Lower turnover due to equity/mission alignment
(4, '2024-01-01', 'turnover_rate', 'Engineering', 0.0095, 0.95, 1),
(4, '2024-01-01', 'turnover_rate', 'Product', 0.0125, 1.25, 1),
(4, '2024-01-01', 'turnover_rate', 'Sales', 0.0165, 1.65, 1),
(4, '2024-01-01', 'turnover_rate', 'Operations', 0.0100, 1.00, 1),

-- High engagement due to startup energy
(4, '2024-01-01', 'engagement_score', 'Engineering', 8.4, NULL, NULL),
(4, '2024-01-01', 'engagement_score', 'Product', 8.7, NULL, NULL),
(4, '2024-01-01', 'engagement_score', 'Sales', 8.1, NULL, NULL),
(4, '2024-01-01', 'engagement_score', 'Operations', 8.0, NULL, NULL),

-- High productivity due to small team efficiency
(4, '2024-01-01', 'productivity_rate', 'Engineering', 96.2, 96.20, NULL),
(4, '2024-01-01', 'productivity_rate', 'Product', 94.8, 94.80, NULL),
(4, '2024-01-01', 'productivity_rate', 'Sales', 92.5, 92.50, NULL),
(4, '2024-01-01', 'productivity_rate', 'Operations', 91.8, 91.80, NULL),

-- Lower training costs (learning on the job)
(4, '2024-01-01', 'training_cost_per_employee', 'Engineering', 800.00, NULL, NULL),
(4, '2024-01-01', 'training_cost_per_employee', 'Product', 650.00, NULL, NULL),
(4, '2024-01-01', 'training_cost_per_employee', 'Sales', 950.00, NULL, NULL),
(4, '2024-01-01', 'training_cost_per_employee', 'Operations', 500.00, NULL, NULL);

-- Insert recruitment metrics (rapid hiring phase)
INSERT INTO recruitment_metrics (company_id, job_posting_date, position_title, department, applications_received, interviews_conducted, offers_made, offers_accepted, time_to_fill_days, cost_per_hire, hiring_manager, recruiter) VALUES
(4, '2024-01-01', 'Senior Software Engineer', 'Engineering', 35, 15, 3, 2, 21, 1800.00, 'Priya Patel', 'Alex Rivera'),
(4, '2024-01-05', 'Product Manager', 'Product', 28, 12, 2, 1, 25, 2200.00, 'Chris Martinez', 'Alex Rivera'),
(4, '2024-01-10', 'Account Executive', 'Sales', 42, 18, 4, 3, 18, 1500.00, 'Marcus Johnson', 'Alex Rivera'),
(4, '2024-01-15', 'Marketing Manager', 'Marketing', 38, 10, 2, 2, 22, 1900.00, 'Jordan Martinez', 'Alex Rivera');
</merged_code>
