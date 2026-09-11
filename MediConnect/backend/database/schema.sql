-- SQL Script: Khởi tạo Cơ sở dữ liệu mediconnect theo chuẩn 3NF

CREATE DATABASE IF NOT EXISTS `mediconnect`;
USE `mediconnect`;

-- =========================================================================
-- 1. Bảng Users (Quản lý người dùng: Admin, Bác sĩ, Bệnh nhân)
-- =========================================================================
CREATE TABLE IF NOT EXISTS `Users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'doctor', 'patient') NOT NULL,
  `specialty` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `is_email_verified` TINYINT(1) DEFAULT 0,
  `verification_token` VARCHAR(255) DEFAULT NULL,
  `reset_token` VARCHAR(255) DEFAULT NULL,
  `reset_token_expiry` DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 1.1 Bảng Pending_Registrations (Đăng ký tạm chờ xác thực Email)
-- =========================================================================
CREATE TABLE IF NOT EXISTS `Pending_Registrations` (
  `pending_id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
  `specialty` VARCHAR(255) DEFAULT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 2. Bảng MedicalRecord (Lưu lịch sử y tế của bệnh nhân - 1-1 với Users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS `MedicalRecord` (
  `record_id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL UNIQUE,
  `blood_type` VARCHAR(10) DEFAULT NULL,
  `height` FLOAT DEFAULT NULL,
  `weight` FLOAT DEFAULT NULL,
  `underlying_conditions` TEXT DEFAULT NULL,
  `past_surgeries` TEXT DEFAULT NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 3. Bảng Allergy (Quản lý dị ứng của bệnh nhân - Độc lập liên kết qua user_id)
-- =========================================================================
CREATE TABLE IF NOT EXISTS `Allergy` (
  `allergy_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `allergy_type` VARCHAR(255) NOT NULL,
  `severity` VARCHAR(100) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 4. Bảng AI_Predictions (Lưu trữ lịch sử chẩn đoán AI)
-- =========================================================================
CREATE TABLE IF NOT EXISTS `AI_Predictions` (
  `prediction_id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `symptoms_text` TEXT NOT NULL,
  `ai_disease` VARCHAR(255) NOT NULL,
  `ai_confidence` DECIMAL(5,2) NOT NULL,
  `doctor_corrected_disease` VARCHAR(255) DEFAULT NULL,
  `is_verified` TINYINT(1) DEFAULT 0,
  `chat_history` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 5. Bảng Appointment (Bảng tập trung lưu lịch hẹn khám giữa Patient và Doctor)
-- =========================================================================
CREATE TABLE IF NOT EXISTS `Appointment` (
  `appointment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `prediction_id` INT DEFAULT NULL,
  `appointment_time` DATETIME NOT NULL,
  `status` VARCHAR(100) DEFAULT 'Scheduled',
  `notes` TEXT DEFAULT NULL,
  `prescription` TEXT DEFAULT NULL,
  `is_reminded` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`patient_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`prediction_id`) REFERENCES `AI_Predictions` (`prediction_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
