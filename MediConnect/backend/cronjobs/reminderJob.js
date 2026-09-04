const cron = require('node-cron');
const db = require('../config/db');
const { sendReminderEmail } = require('../utils/emailService');

/**
 * Khởi tạo cron job nhắc nhở lịch khám tự động chạy mỗi giờ
 */
const startReminderJob = () => {
  // Cron expression: '0 * * * *' chạy vào phút thứ 0 của mỗi giờ
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [Cronjob] Đang kiểm tra danh sách lịch khám sắp diễn ra trong 24 giờ tới...');
    
    try {
      // Câu lệnh SQL thô lấy cuộc hẹn hợp lệ diễn ra trong 24 giờ tới
      // Thực hiện JOIN 2 lần với bảng Users: alias 'p' cho Patient và 'd' cho Doctor
      const sql = `
        SELECT 
          a.appointment_id,
          a.appointment_time,
          a.status,
          p.email AS patient_email,
          p.full_name AS patient_name,
          d.full_name AS doctor_name
        FROM Appointment a
        INNER JOIN Users p ON a.patient_id = p.user_id
        INNER JOIN Users d ON a.doctor_id = d.user_id
        WHERE a.status IN ('Scheduled', 'pending')
          AND a.is_reminded = 0
          AND a.appointment_time >= NOW()
          AND a.appointment_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
      `;

      const [appointments] = await db.execute(sql);

      if (!appointments || appointments.length === 0) {
        console.log('ℹ️ [Cronjob] Không có lịch hẹn nào cần gửi nhắc nhở tại thời điểm này.');
        return;
      }

      console.log(`🔍 [Cronjob] Tìm thấy ${appointments.length} lịch khám cần gửi nhắc nhở.`);

      // Sử dụng vòng lặp for...of để xử lý tuần tự (async/await hoạt động đúng mong đợi)
      for (const app of appointments) {
        try {
          // Gọi hàm gửi email nhắc nhở được cấu hình sẵn HTML đẹp mắt
          await sendReminderEmail(
            app.patient_email, 
            app.patient_name, 
            app.doctor_name, 
            app.appointment_time
          );

          // Cập nhật trạng thái đã gửi nhắc nhở để tránh trùng lặp
          await db.execute(
            'UPDATE Appointment SET is_reminded = 1 WHERE appointment_id = ?',
            [app.appointment_id]
          );

          console.log(`✅ [Cronjob] Đã gửi nhắc nhở & cập nhật thành công cho Appointment ID: ${app.appointment_id}`);
        } catch (emailErr) {
          console.error(`❌ [Cronjob] Lỗi khi xử lý gửi email/cập nhật cho Appointment ID ${app.appointment_id}:`, emailErr.message);
        }
      }
    } catch (dbErr) {
      console.error('❌ [Cronjob] Lỗi truy vấn cơ sở dữ liệu nhắc lịch khám:', dbErr.message);
    }
  });

  console.log('📅 [Cronjob] Tiến trình tự động nhắc nhở lịch khám hàng giờ đã được kích hoạt thành công.');
};

module.exports = startReminderJob;
