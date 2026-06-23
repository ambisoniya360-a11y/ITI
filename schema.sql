-- ============================================================================
-- SkillBridge India - Database Schema (PostgreSQL for Supabase)
-- Paste this script into your Supabase SQL Editor to set up your tables.
-- ============================================================================

-- 1. CLEANUP (Optional)
-- DROP TABLE IF EXISTS applications CASCADE;
-- DROP TABLE IF EXISTS jobs CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;

-- 2. CREATE TABLES

-- Students / Passports Table
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    institute VARCHAR(255) NOT NULL,
    attendance INT CHECK (attendance >= 0 AND attendance <= 100),
    practical_score INT CHECK (practical_score >= 0 AND practical_score <= 100),
    theory_score INT CHECK (theory_score >= 0 AND theory_score <= 100),
    safety_score INT CHECK (safety_score >= 0 AND safety_score <= 100),
    employability_score INT CHECK (employability_score >= 0 AND employability_score <= 100),
    skills TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs / Apprenticeships Table
CREATE TABLE jobs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Apprenticeship', 'Placement')),
    skills_required TEXT[] DEFAULT '{}',
    applicants_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications Tracker Table
CREATE TABLE applications (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    job_id VARCHAR(50) REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'Interviewing', 'Offered')),
    applied_on DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Institutes Table
CREATE TABLE institutes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    rating VARCHAR(10) NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    students_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    active_roles INT DEFAULT 0,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users / Authentication Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Student', 'Institute', 'Company', 'Admin')),
    tier VARCHAR(50) DEFAULT 'Freemium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, role)
);

-- 3. INSERT DEMO SEED DATA

-- Seed Students
INSERT INTO students (id, name, trade, institute, attendance, practical_score, theory_score, safety_score, employability_score, skills, certifications, status)
VALUES
('SB-2026-081', 'Rahul Verma', 'Electrician', 'Government ITI Pune', 94, 96, 88, 98, 92, 
 ARRAY['Industrial Wiring', 'Control Panels', 'Solar PV Install', 'Safety Protocols'], 
 ARRAY['NCVT Level-4 Electrician', 'SECI Solar Technician'], 'Available'),

('SB-2026-102', 'Priya Patel', 'CNC Operator', 'Government ITI Nashik', 98, 94, 90, 95, 95, 
 ARRAY['CNC Programming', 'Precision Milling', 'Metrology', 'G-Code & M-Code'], 
 ARRAY['Siemens CNC Specialist', 'National Trade Certificate (NTC)'], 'Interviewing'),

('SB-2026-045', 'Amit Sharma', 'Fitter', 'Government ITI Kolhapur', 91, 92, 82, 96, 87, 
 ARRAY['Lathe Operations', 'Technical Drawing', 'Pneumatics & Hydraulics', 'Precision Assembly'], 
 ARRAY['NCVT Fitter Certificate'], 'Available'),

('SB-2026-119', 'Karan Singh', 'Welder', 'Government ITI Aurangabad', 89, 95, 80, 99, 89, 
 ARRAY['TIG Welding', 'MIG Welding', 'Structural Fabrication', 'Gas Cutting'], 
 ARRAY['AWS Certified Welder (Level I)', 'NTC Welder'], 'Placed'),

('SB-2026-210', 'Sneha Reddy', 'Solar Technician', 'Government ITI Pune', 96, 97, 86, 97, 93, 
 ARRAY['Solar Panel Alignment', 'Inverter Commissioning', 'Battery Bank Setup', 'AC/DC Troubleshooting'], 
 ARRAY['GERMI Solar Installer', 'NCVT Solar Tradesman'], 'Available');

-- Seed Jobs
INSERT INTO jobs (id, title, company, trade, location, salary, duration, type, skills_required, applicants_count)
VALUES
('JOB-001', 'Assistant Electrician Apprentice', 'Tata Motors', 'Electrician', 'Pune, Maharashtra', '₹18,000 - ₹22,000', '12 Months', 'Apprenticeship', ARRAY['Industrial Wiring', 'Control Panels'], 15),
('JOB-002', 'CNC Operator Specialist', 'Mahindra & Mahindra', 'CNC Operator', 'Nashik, Maharashtra', '₹20,000 - ₹25,000', 'Full-Time Job', 'Placement', ARRAY['CNC Programming', 'Precision Milling'], 9),
('JOB-003', 'Structural Welder (TIG/MIG)', 'Larsen & Toubro (L&T)', 'Welder', 'Mumbai, Maharashtra', '₹22,000 - ₹28,000', 'Full-Time Job', 'Placement', ARRAY['TIG Welding', 'Structural Fabrication'], 22),
('JOB-004', 'Junior Solar Installer', 'Adani Green Energy', 'Solar Technician', 'Kutch, Gujarat', '₹19,000 - ₹23,000', '12 Months', 'Apprenticeship', ARRAY['Solar Panel Alignment', 'AC/DC Troubleshooting'], 5),
('JOB-005', 'Maintenance Fitter', 'Siemens India', 'Fitter', 'Pune, Maharashtra', '₹21,000 - ₹26,000', 'Full-Time Job', 'Placement', ARRAY['Lathe Operations', 'Pneumatics & Hydraulics'], 18);

-- Seed Applications
INSERT INTO applications (id, student_id, job_id, status, applied_on)
VALUES
('APP-001', 'SB-2026-102', 'JOB-002', 'Shortlisted', '2026-06-15'),
('APP-002', 'SB-2026-119', 'JOB-003', 'Offered', '2026-06-18');

-- Seed Institutes
INSERT INTO institutes (id, name, state, rating, verified, students_count)
VALUES
('INST-001', 'Government ITI Pune', 'Maharashtra', 'A+', true, 450),
('INST-002', 'Government ITI Nashik', 'Maharashtra', 'A', true, 380),
('INST-003', 'Government ITI Kolhapur', 'Maharashtra', 'A', true, 310),
('INST-004', 'Government ITI Aurangabad', 'Maharashtra', 'B+', true, 290),
('INST-005', 'Government ITI Nagpur', 'Maharashtra', 'A', true, 420),
('INST-006', 'Government ITI Mumbai', 'Maharashtra', 'A+', true, 500),
('INST-007', 'Government ITI Thane', 'Maharashtra', 'B', false, 220),
('INST-008', 'Government ITI Solapur', 'Maharashtra', 'B+', true, 260);

-- Seed Companies
INSERT INTO companies (id, name, industry, location, active_roles, verified)
VALUES
('COMP-001', 'Tata Motors', 'Automotive', 'Pune, Maharashtra', 3, true),
('COMP-002', 'Mahindra & Mahindra', 'Automotive', 'Nashik, Maharashtra', 2, true),
('COMP-003', 'Larsen & Toubro (L&T)', 'Infrastructure', 'Mumbai, Maharashtra', 5, true),
('COMP-004', 'Adani Green Energy', 'Renewables', 'Kutch, Gujarat', 1, true),
('COMP-005', 'Siemens India', 'Engineering', 'Pune, Maharashtra', 2, true),
('COMP-006', 'Reliance Industries', 'Conglomerate', 'Jamnagar, Gujarat', 4, true),
('COMP-007', 'Infosys', 'IT Services', 'Bangalore, Karnataka', 1, false),
('COMP-008', 'Maruti Suzuki', 'Automotive', 'Gurugram, Haryana', 3, true);

-- 4. CONFIGURE ROW LEVEL SECURITY (RLS) FOR SUPABASE
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Enable read access for all users on students" ON students FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on institutes" ON institutes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on companies" ON companies FOR SELECT USING (true);

-- Create authenticated insert/update policies
CREATE POLICY "Enable insert/update for public anon during demo" ON students FOR ALL USING (true);
CREATE POLICY "Enable insert/update for public anon during demo" ON jobs FOR ALL USING (true);
CREATE POLICY "Enable insert/update for public anon during demo" ON applications FOR ALL USING (true);
CREATE POLICY "Enable insert/update for public anon during demo" ON institutes FOR ALL USING (true);
CREATE POLICY "Enable insert/update for public anon during demo" ON companies FOR ALL USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for public anon during demo" ON users FOR ALL USING (true);
