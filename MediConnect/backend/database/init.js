const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function init() {
  console.log('🔄 Đang kết nối và khởi tạo CSDL MySQL...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
  });

  try {
    const dbName = process.env.DB_NAME || 'mediConnect';

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Đã tạo/xác minh CSDL: ${dbName}`);

    await connection.query(`USE \`${dbName}\`;`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`Users\` (
        \`user_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'doctor', 'patient') NOT NULL,
        \`specialty\` VARCHAR(255) DEFAULT NULL,
        \`status\` VARCHAR(50) DEFAULT 'active',
        \`is_email_verified\` TINYINT(1) DEFAULT 0,
        \`verification_token\` VARCHAR(255) DEFAULT NULL,
        \`reset_token\` VARCHAR(255) DEFAULT NULL,
        \`reset_token_expiry\` DATETIME DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Bảng Users đã được khởi tạo.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`Allergy\` (
        \`allergy_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`allergy_type\` VARCHAR(255) NOT NULL,
        \`severity\` VARCHAR(100) NOT NULL,
        \`notes\` TEXT DEFAULT NULL,
        FOREIGN KEY (\`user_id\`) REFERENCES \`Users\` (\`user_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Bảng Allergy đã được khởi tạo.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`MedicalRecord\` (
        \`record_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`patient_id\` INT NOT NULL UNIQUE,
        \`blood_type\` VARCHAR(10) DEFAULT NULL,
        \`height\` FLOAT DEFAULT NULL,
        \`weight\` FLOAT DEFAULT NULL,
        \`underlying_conditions\` TEXT DEFAULT NULL,
        \`past_surgeries\` TEXT DEFAULT NULL,
        FOREIGN KEY (\`patient_id\`) REFERENCES \`Users\` (\`user_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Bảng MedicalRecord đã được khởi tạo.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`AI_Predictions\` (
        \`prediction_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`patient_id\` INT NOT NULL,
        \`symptoms_text\` TEXT NOT NULL,
        \`ai_disease\` VARCHAR(255) NOT NULL,
        \`ai_confidence\` DECIMAL(5,2) NOT NULL,
        \`doctor_corrected_disease\` VARCHAR(255) DEFAULT NULL,
        \`is_verified\` TINYINT(1) DEFAULT 0,
        \`chat_history\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`patient_id\`) REFERENCES \`Users\` (\`user_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Bảng AI_Predictions đã được khởi tạo.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`Appointment\` (
        \`appointment_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`patient_id\` INT NOT NULL,
        \`doctor_id\` INT NOT NULL,
        \`prediction_id\` INT DEFAULT NULL,
        \`appointment_time\` DATETIME NOT NULL,
        \`status\` VARCHAR(100) DEFAULT 'Scheduled',
        \`notes\` TEXT DEFAULT NULL,
        \`prescription\` TEXT DEFAULT NULL,
        \`is_reminded\` TINYINT(1) DEFAULT 0,
        FOREIGN KEY (\`patient_id\`) REFERENCES \`Users\` (\`user_id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`doctor_id\`) REFERENCES \`Users\` (\`user_id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`prediction_id\`) REFERENCES \`AI_Predictions\` (\`prediction_id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Bảng Appointment đã được khởi tạo.');

    const [users] = await connection.query('SELECT COUNT(*) AS cnt FROM `Users`;');
    if (users[0].cnt === 0) {
      console.log('🌱 Đang gieo dữ liệu mẫu...');

      const hash = '$2a$10$eHSnmvppvOYq9bxPDBefCO8Y2ssdLRjoAWRmojZ2i4CWn7kHqF97G';

      await connection.query(`
        INSERT INTO \`Users\` (\`user_id\`, \`email\`, \`password_hash\`, \`full_name\`, \`role\`, \`specialty\`, \`is_email_verified\`) VALUES
        (1, 'elena.rossi@example.com', '${hash}', 'Elena Rossi', 'patient', NULL, 1),
        (2, 'sarah.chen@example.com', '${hash}', 'Dr. Sarah Chen', 'doctor', 'Cardiologist', 1),
        (3, 'james.miller@example.com', '${hash}', 'Dr. James Miller', 'doctor', 'General Physician', 1),
        (4, 'sarah.khalil@example.com', '${hash}', 'Dr. Sarah Khalil', 'doctor', 'Neurology', 1),
        (5, 'evelyn.harper@example.com', '${hash}', 'Dr. Evelyn Harper', 'admin', 'Chief of Surgery', 1);
      `);

      await connection.query(`
        INSERT INTO \`Allergy\` (\`user_id\`, \`allergy_type\`, \`severity\`, \`notes\`) VALUES
        (1, 'Penicillin', 'Severe', 'Causes immediate hives and anaphylactic response.'),
        (1, 'Latex', 'Moderate', 'Contact dermatitis upon extended exposure.'),
        (1, 'Peanuts', 'Moderate', 'Swelling and gastrointestinal distress.');
      `);

      await connection.query(`
        INSERT INTO \`AI_Predictions\` (\`prediction_id\`, \`patient_id\`, \`symptoms_text\`, \`ai_disease\`, \`ai_confidence\`, \`is_verified\`) VALUES
        (1, 1, 'persistent fatigue, recurring headaches, and localized sensitivity in the abdomen', 'Anemia', 0.82, 0);
      `);

      await connection.query(`
        INSERT INTO \`Appointment\` (\`patient_id\`, \`doctor_id\`, \`prediction_id\`, \`appointment_time\`, \`status\`) VALUES
        (1, 3, 1, '2023-10-24 10:30:00', 'Scheduled'),
        (1, 2, NULL, '2023-10-26 14:15:00', 'Scheduled');
      `);

      console.log('🌱 Gieo dữ liệu mẫu thành công!');
    } else {
      console.log('⚠️ Cơ sở dữ liệu đã có dữ liệu, bỏ qua seeding.');
    }

    console.log(`🎉 Kết nối và khởi tạo CSDL "${dbName}" thành công!`);
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo cơ sở dữ liệu:', error.message);
  } finally {
    await connection.end();
  }
}

init();
