CREATE DATABASE IF NOT EXISTS register
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE register;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(100),
  gender VARCHAR(50),
  city VARCHAR(100),
  age VARCHAR(100),
  shelter_id VARCHAR(100),
  photo_url VARCHAR(255),
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS adoptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  pet_id INT,
  experience TEXT,
  message TEXT,
  applicant_username VARCHAR(100),
  housing_type VARCHAR(100),
  pet_allowed VARCHAR(20),
  has_other_pets VARCHAR(20),
  daily_company_time VARCHAR(100),
  family_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  follow_up_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  responsibility_agreement BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_adoptions_pet_id (pet_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  pet_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_pet (username, pet_id)
);
