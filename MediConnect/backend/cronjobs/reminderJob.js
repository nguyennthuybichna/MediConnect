const cron = require('node-cron');
const db = require('../config/db');
const { sendReminderEmail } = require('../utils/emailService');

const startReminderJob = () => {

  cron.schedule('0 * * * *', async () => {
    console.log('[Cronjob] Đang kiểm tra danh sách lịch khám sắp diễn ra trong 24 giờ tới...');

    try {

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
        console.log('[Cronjob] Không có lịch hẹn nào cần gửi nhắc nhở tại thời điểm này.');
        return;
      }

      console.log(`[Cronjob] Tìm thấy ${appointments.length} lịch khám cần gửi nhắc nhở.`);

      for (const app of appointments) {
        try {

          await sendReminderEmail(
            app.patient_email,
            app.patient_name,
            app.doctor_name,
            app.appointment_time
          );

          await db.execute(
            'UPDATE Appointment SET is_reminded = 1 WHERE appointment_id = ?',
            [app.appointment_id]
          );

          console.log(`[Cronjob] Đã gửi nhắc nhở & cập nhật thành công cho Appointment ID: ${app.appointment_id}`);
        } catch (emailErr) {
          console.error(`[Cronjob] Lỗi khi xử lý gửi email/cập nhật cho Appointment ID ${app.appointment_id}:`, emailErr.message);
        }
      }
    } catch (dbErr) {
      console.error('[Cronjob] Lỗi truy vấn cơ sở dữ liệu nhắc lịch khám:', dbErr.message);
    }
  });

  console.log('[Cronjob] Tiến trình tự động nhắc nhở lịch khám hàng giờ đã được kích hoạt thành công.');
};

module.exports = startReminderJob;
