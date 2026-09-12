const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mediconnect',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(async connection => {
    console.log('Kết nối CSDL MySQL thành công!');
    try {
      await connection.query("ALTER TABLE AI_Predictions ADD COLUMN chat_history TEXT DEFAULT NULL");
      console.log('Đã đồng bộ cột chat_history vào bảng AI_Predictions.');
    } catch (err) {
      if (err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
        console.error('Lỗi bổ sung cột chat_history:', err.message);
      }
    }
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS Pending_Registrations (
          pending_id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
          specialty VARCHAR(255) DEFAULT NULL,
          otp VARCHAR(10) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Đã đồng bộ bảng Pending_Registrations.');
    } catch (err) {
      console.error('Lỗi tạo bảng Pending_Registrations:', err.message);
    }
    connection.release();
  })
  .catch(err => {
    console.error('Lỗi kết nối CSDL MySQL:', err.message);
  });

module.exports = pool;
