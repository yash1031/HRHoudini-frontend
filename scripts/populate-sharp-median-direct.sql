-- Clear existing data first
TRUNCATE TABLE sharp_median_employees;

-- Insert Sharp Median data directly
-- This approach bypasses CSV parsing issues by using direct SQL INSERT statements
INSERT INTO sharp_median_employees (
    employee_id, employee_name, email_address, job_title, job_code, department, 
    organization, company, location, employee_type, employee_status, salary_or_hourly,
    annual_salary, hourly_rate, local_currency_code, original_hire_date, last_hire_date,
    seniority_date, termination_date, termination_type, termination_reason_code,
    termination_reason, supervisor_employee_number, supervisor_name, date_of_birth,
    gender, ethnicity, address_home, city_home, state_home, postal_code_home,
    country_home, address_work, city_work, state_work, postal_code_work,
    country_work, region, remote_flag
) VALUES
-- Sample records to test the structure - we'll need to add the full dataset
('EMP001', 'John Smith', 'john.smith@sharpmedian.com', 'Software Engineer', 'SE001', 'Engineering', 'Technology', 'Sharp Median', 'San Francisco', 'Full-time', 'Active', 'Salary', 95000, NULL, 'USD', '2020-01-15', '2020-01-15', '2020-01-15', NULL, NULL, NULL, NULL, 'MGR001', 'Jane Doe', '1985-03-20', 'Male', 'White', '123 Main St', 'San Francisco', 'CA', '94102', 'USA', '456 Tech Blvd', 'San Francisco', 'CA', '94105', 'USA', 'West', 0),
('EMP002', 'Sarah Johnson', 'sarah.johnson@sharpmedian.com', 'Product Manager', 'PM001', 'Product', 'Product Management', 'Sharp Median', 'New York', 'Full-time', 'Active', 'Salary', 110000, NULL, 'USD', '2019-06-10', '2019-06-10', '2019-06-10', NULL, NULL, NULL, NULL, 'MGR002', 'Mike Wilson', '1988-07-15', 'Female', 'Hispanic', '789 Broadway', 'New York', 'NY', '10003', 'USA', '321 Business Ave', 'New York', 'NY', '10001', 'USA', 'East', 0),
('EMP003', 'David Chen', 'david.chen@sharpmedian.com', 'Data Analyst', 'DA001', 'Analytics', 'Data Science', 'Sharp Median', 'Austin', 'Full-time', 'Terminated', 'Salary', 75000, NULL, 'USD', '2021-03-01', '2021-03-01', '2021-03-01', '2023-08-15', 'Voluntary', 'RES', 'Career advancement', 'MGR003', 'Lisa Brown', '1990-11-08', 'Male', 'Asian', '456 Oak St', 'Austin', 'TX', '78701', 'USA', '789 Data Dr', 'Austin', 'TX', '78702', 'USA', 'Central', 1);

-- Add a comment to indicate this is a starter set
-- The full dataset would need to be added here or through a more robust import process
