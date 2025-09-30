-- Seed employee data for TechFlow Inc (300 employees - Sasha's company)
INSERT INTO employees (company_id, employee_id, first_name, last_name, email, department, job_title, hire_date, employment_status, salary, location, employment_type, age_group, gender, ethnicity) VALUES
-- Leadership & Talent Team
(2, 'TF001', 'Sasha', 'Kim', 'sasha.kim@techflow.com', 'Talent', 'Senior Recruiter', '2022-01-15', 'active', 95000, 'Seattle', 'full-time', '30-39', 'Female', 'Asian'),
(2, 'TF002', 'Marcus', 'Chen', 'marcus.chen@techflow.com', 'Talent', 'VP of Talent', '2021-03-01', 'active', 165000, 'Seattle', 'full-time', '40-49', 'Male', 'Asian'),
(2, 'TF003', 'Sarah', 'Rodriguez', 'sarah.rodriguez@techflow.com', 'Engineering', 'Engineering Manager', '2020-08-15', 'active', 155000, 'Seattle', 'full-time', '35-44', 'Female', 'Hispanic'),
(2, 'TF004', 'Jennifer', 'Walsh', 'jennifer.walsh@techflow.com', 'Talent', 'Talent Acquisition Specialist', '2022-06-10', 'active', 78000, 'Remote', 'full-time', '25-34', 'Female', 'White'),

-- Engineering Department (120 employees - sample)
(2, 'TF101', 'David', 'Thompson', 'david.thompson@techflow.com', 'Engineering', 'Senior Software Engineer', '2021-02-20', 'active', 135000, 'Seattle', 'full-time', '30-39', 'Male', 'White'),
(2, 'TF102', 'Priya', 'Patel', 'priya.patel@techflow.com', 'Engineering', 'Staff Engineer', '2020-11-01', 'active', 165000, 'Remote', 'full-time', '30-39', 'Female', 'Asian'),
(2, 'TF103', 'Michael', 'Johnson', 'michael.johnson@techflow.com', 'Engineering', 'Frontend Developer', '2022-04-15', 'active', 115000, 'Seattle', 'full-time', '25-34', 'Male', 'Black'),
(2, 'TF104', 'Elena', 'Garcia', 'elena.garcia@techflow.com', 'Engineering', 'Backend Developer', '2022-09-01', 'active', 120000, 'Remote', 'full-time', '25-34', 'Female', 'Hispanic'),
(2, 'TF105', 'Ryan', 'Kim', 'ryan.kim@techflow.com', 'Engineering', 'DevOps Engineer', '2021-12-10', 'active', 125000, 'Seattle', 'full-time', '25-34', 'Male', 'Asian'),

-- Product Department (60 employees - sample)
(2, 'TF201', 'Lisa', 'Anderson', 'lisa.anderson@techflow.com', 'Product', 'Head of Product', '2020-05-15', 'active', 175000, 'Seattle', 'full-time', '35-44', 'Female', 'White'),
(2, 'TF202', 'James', 'Wilson', 'james.wilson@techflow.com', 'Product', 'Senior Product Manager', '2021-07-20', 'active', 145000, 'Remote', 'full-time', '30-39', 'Male', 'Black'),
(2, 'TF203', 'Sophie', 'Martinez', 'sophie.martinez@techflow.com', 'Product', 'UX Designer', '2022-01-25', 'active', 105000, 'Seattle', 'full-time', '25-34', 'Female', 'Hispanic'),

-- Sales Department (80 employees - sample)
(2, 'TF301', 'Robert', 'Davis', 'robert.davis@techflow.com', 'Sales', 'VP of Sales', '2020-03-10', 'active', 185000, 'Seattle', 'full-time', '40-49', 'Male', 'White'),
(2, 'TF302', 'Amanda', 'Lee', 'amanda.lee@techflow.com', 'Sales', 'Enterprise Account Executive', '2021-09-15', 'active', 125000, 'Remote', 'full-time', '30-39', 'Female', 'Asian'),
(2, 'TF303', 'Carlos', 'Brown', 'carlos.brown@techflow.com', 'Sales', 'Sales Development Rep', '2022-11-01', 'active', 68000, 'Seattle', 'full-time', '22-29', 'Male', 'Hispanic'),

-- Marketing Department (40 employees - sample)
(2, 'TF401', 'Rachel', 'Taylor', 'rachel.taylor@techflow.com', 'Marketing', 'Marketing Director', '2021-01-20', 'active', 135000, 'Seattle', 'full-time', '35-44', 'Female', 'White'),
(2, 'TF402', 'Kevin', 'Nguyen', 'kevin.nguyen@techflow.com', 'Marketing', 'Growth Marketing Manager', '2022-03-15', 'active', 95000, 'Remote', 'full-time', '25-34', 'Male', 'Asian');

-- Insert open requisitions and aging reqs for Sasha's scenarios
INSERT INTO recruitment_metrics (company_id, job_posting_date, position_title, department, applications_received, interviews_conducted, offers_made, offers_accepted, time_to_fill_days, cost_per_hire, hiring_manager, recruiter) VALUES
-- Current open requisitions (some aging)
(2, '2023-11-15', 'Engineering Manager', 'Engineering', 25, 8, 1, 0, 45, 4200.00, 'Sarah Rodriguez', 'Sasha Kim'), -- 45+ days old
(2, '2023-12-01', 'Senior Product Manager', 'Product', 32, 12, 2, 1, 38, 3800.00, 'Lisa Anderson', 'Sasha Kim'), -- 30+ days old  
(2, '2023-12-10', 'Staff Engineer', 'Engineering', 18, 6, 0, 0, 29, 0.00, 'Sarah Rodriguez', 'Sasha Kim'), -- 30+ days old
(2, '2024-01-05', 'Account Executive', 'Sales', 28, 15, 4, 3, 18, 2800.00, 'Robert Davis', 'Sasha Kim'), -- Recent, good progress
(2, '2024-01-10', 'UX Designer', 'Product', 35, 10, 2, 1, 15, 3200.00, 'Lisa Anderson', 'Sasha Kim'), -- Recent, good progress
(2, '2024-01-15', 'DevOps Engineer', 'Engineering', 22, 8, 1, 1, 12, 3600.00, 'Sarah Rodriguez', 'Sasha Kim'); -- Recent, filled

-- Insert HR metrics for TechFlow (Sasha's recruiting focus)
INSERT INTO hr_metrics (company_id, metric_date, metric_type, department, value, percentage, count_value) VALUES
-- Recruiting pipeline metrics
(2, '2024-01-01', 'time_to_fill_avg', 'Engineering', 32.5, NULL, NULL),
(2, '2024-01-01', 'time_to_fill_avg', 'Product', 28.8, NULL, NULL),
(2, '2024-01-01', 'time_to_fill_avg', 'Sales', 22.3, NULL, NULL),
(2, '2024-01-01', 'time_to_fill_avg', 'Marketing', 25.1, NULL, NULL),

-- Interview to offer ratios
(2, '2024-01-01', 'interview_to_offer_ratio', 'Engineering', 0.25, 25.0, NULL),
(2, '2024-01-01', 'interview_to_offer_ratio', 'Product', 0.30, 30.0, NULL),
(2, '2024-01-01', 'interview_to_offer_ratio', 'Sales', 0.35, 35.0, NULL),
(2, '2024-01-01', 'interview_to_offer_ratio', 'Marketing', 0.28, 28.0, NULL),

-- Offer acceptance rates
(2, '2024-01-01', 'offer_acceptance_rate', 'Engineering', 0.78, 78.0, NULL),
(2, '2024-01-01', 'offer_acceptance_rate', 'Product', 0.85, 85.0, NULL),
(2, '2024-01-01', 'offer_acceptance_rate', 'Sales', 0.82, 82.0, NULL),
(2, '2024-01-01', 'offer_acceptance_rate', 'Marketing', 0.88, 88.0, NULL);
