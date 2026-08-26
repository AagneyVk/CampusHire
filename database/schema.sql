CREATE DATABASE IF NOT EXISTS campushire CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE campushire;

CREATE TABLE departments (
  department_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE industries (
  industry_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE users (
  user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin','company') NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role_active (role, is_active)
) ENGINE=InnoDB;

CREATE TABLE students (
  student_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  registration_no VARCHAR(40) NOT NULL UNIQUE,
  department_id INT UNSIGNED NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80),
  graduation_year SMALLINT UNSIGNED NOT NULL,
  cgpa DECIMAL(4,2),
  phone VARCHAR(30),
  resume_url VARCHAR(500),
  bio TEXT,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT,
  CONSTRAINT chk_students_cgpa CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10)),
  INDEX idx_students_department (department_id),
  INDEX idx_students_grad_year (graduation_year)
) ENGINE=InnoDB;

CREATE TABLE companies (
  company_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  industry_id INT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL UNIQUE,
  website VARCHAR(500),
  location VARCHAR(160),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_companies_industry FOREIGN KEY (industry_id) REFERENCES industries(industry_id) ON DELETE RESTRICT,
  INDEX idx_companies_industry (industry_id),
  INDEX idx_companies_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE company_users (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  job_title VARCHAR(100),
  CONSTRAINT fk_company_users_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_company_users_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
  INDEX idx_company_users_company (company_id)
) ENGINE=InnoDB;

CREATE TABLE skills (
  skill_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE student_skills (
  student_id BIGINT UNSIGNED NOT NULL,
  skill_id INT UNSIGNED NOT NULL,
  proficiency ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'intermediate',
  PRIMARY KEY (student_id, skill_id),
  CONSTRAINT fk_student_skills_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  INDEX idx_student_skills_skill (skill_id)
) ENGINE=InnoDB;

CREATE TABLE internships (
  internship_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(160) NOT NULL,
  work_mode ENUM('remote','onsite','hybrid') NOT NULL,
  stipend DECIMAL(12,2) NOT NULL DEFAULT 0,
  duration_weeks SMALLINT UNSIGNED NOT NULL,
  openings SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  minimum_cgpa DECIMAL(4,2),
  application_deadline DATETIME NOT NULL,
  start_date DATE,
  status ENUM('draft','active','closed','cancelled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_internships_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT,
  CONSTRAINT chk_internship_stipend CHECK (stipend >= 0),
  CONSTRAINT chk_internship_duration CHECK (duration_weeks > 0),
  CONSTRAINT chk_internship_openings CHECK (openings > 0),
  CONSTRAINT chk_internship_cgpa CHECK (minimum_cgpa IS NULL OR (minimum_cgpa >= 0 AND minimum_cgpa <= 10)),
  INDEX idx_internships_company (company_id),
  INDEX idx_internships_status_deadline (status, application_deadline),
  INDEX idx_internships_location (location),
  INDEX idx_internships_mode (work_mode),
  INDEX idx_internships_stipend (stipend)
) ENGINE=InnoDB;

CREATE TABLE internship_skills (
  internship_id BIGINT UNSIGNED NOT NULL,
  skill_id INT UNSIGNED NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (internship_id, skill_id),
  CONSTRAINT fk_internship_skills_internship FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE CASCADE,
  CONSTRAINT fk_internship_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  INDEX idx_internship_skills_skill (skill_id)
) ENGINE=InnoDB;

CREATE TABLE applications (
  application_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  internship_id BIGINT UNSIGNED NOT NULL,
  cover_letter TEXT,
  status ENUM('submitted','under_review','shortlisted','interview','rejected','offered','withdrawn') NOT NULL DEFAULT 'submitted',
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_application_student_internship UNIQUE (student_id, internship_id),
  CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT,
  CONSTRAINT fk_applications_internship FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE RESTRICT,
  INDEX idx_applications_student_status (student_id, status),
  INDEX idx_applications_internship_status (internship_id, status),
  INDEX idx_applications_applied_at (applied_at)
) ENGINE=InnoDB;

CREATE TABLE interviews (
  interview_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  round_no TINYINT UNSIGNED NOT NULL DEFAULT 1,
  scheduled_at DATETIME NOT NULL,
  mode ENUM('online','onsite','phone') NOT NULL,
  meeting_link VARCHAR(500),
  venue VARCHAR(255),
  result ENUM('pending','passed','failed','no_show') NOT NULL DEFAULT 'pending',
  notes TEXT,
  CONSTRAINT uq_interview_round UNIQUE (application_id, round_no),
  CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
  CONSTRAINT chk_interview_round CHECK (round_no > 0),
  INDEX idx_interviews_schedule (scheduled_at),
  INDEX idx_interviews_result (result)
) ENGINE=InnoDB;

CREATE TABLE offers (
  offer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL UNIQUE,
  offered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  response_deadline DATETIME NOT NULL,
  stipend DECIMAL(12,2) NOT NULL,
  status ENUM('pending','accepted','rejected','expired','revoked') NOT NULL DEFAULT 'pending',
  responded_at DATETIME,
  CONSTRAINT fk_offers_application FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE RESTRICT,
  CONSTRAINT chk_offer_stipend CHECK (stipend >= 0),
  INDEX idx_offers_status_deadline (status, response_deadline)
) ENGINE=InnoDB;

CREATE TABLE internship_records (
  record_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id BIGINT UNSIGNED NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE,
  status ENUM('upcoming','ongoing','completed','terminated') NOT NULL DEFAULT 'upcoming',
  completion_notes TEXT,
  CONSTRAINT fk_records_offer FOREIGN KEY (offer_id) REFERENCES offers(offer_id) ON DELETE RESTRICT,
  CONSTRAINT chk_record_dates CHECK (end_date IS NULL OR end_date >= start_date),
  INDEX idx_records_status (status)
) ENGINE=InnoDB;

CREATE TABLE evaluations (
  evaluation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  record_id BIGINT UNSIGNED NOT NULL UNIQUE,
  score DECIMAL(4,2) NOT NULL,
  feedback TEXT,
  evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evaluations_record FOREIGN KEY (record_id) REFERENCES internship_records(record_id) ON DELETE CASCADE,
  CONSTRAINT chk_evaluation_score CHECK (score >= 0 AND score <= 10)
) ENGINE=InnoDB;
