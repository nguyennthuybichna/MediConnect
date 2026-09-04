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
    console.log('✅ Kết nối CSDL MySQL thành công!');
    try {
      await connection.query("ALTER TABLE AI_Predictions ADD COLUMN chat_history TEXT DEFAULT NULL");
      console.log('🌱 Đã đồng bộ cột chat_history vào bảng AI_Predictions.');
    } catch (err) {
      // Bỏ qua lỗi 1060 nếu cột đã tồn tại
      if (err.errno !== 1060 && err.code !== 'ER_DUP_FIELDNAME') {
        console.error('❌ Lỗi bổ sung cột chat_history:', err.message);
      }
    }
    connection.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối CSDL MySQL:', err.message);
  });

module.exports = pool;
