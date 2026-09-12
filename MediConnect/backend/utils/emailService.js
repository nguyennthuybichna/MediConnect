const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"MediConnect Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    console.log(`✉️ Đang gửi email tới: ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email đã được gửi thành công tới ${to}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Lỗi chi tiết khi gửi email tới ${to}:`, error);
    throw error;
  }
};

const sendReminderEmail = async (toEmail, patientName, doctorName, appointmentTime) => {

  const timeString = new Date(appointmentTime).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const subject = '🔔 [MediConnect] Nhắc nhở lịch hẹn khám bệnh sắp diễn ra';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f8fb; padding: 40px 20px; text-align: center; color: #333;">
      <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: left; border: 1px solid #edf2f7;">

        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #843f2e 0%, #b2533e 100%); padding: 35px 30px; text-align: center; color: #ffffff;">
          <div style="font-size: 24px; font-weight: 800; letter-spacing: 1px; margin-bottom: 5px;">MediConnect</div>
          <div style="font-size: 13px; opacity: 0.9; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Hệ thống Hỗ trợ Chẩn đoán & Y tế Thông minh</div>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e1b4b; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Nhắc lịch hẹn khám bệnh</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 25px;">
            Xin chào <strong>${patientName}</strong>,<br/>
            Đây là email tự động nhắc nhở từ hệ thống <strong>MediConnect</strong>. Bạn có một lịch hẹn khám bệnh sắp diễn ra trong vòng 24 giờ tới. Dưới đây là thông tin chi tiết cuộc hẹn:
          </p>

          <!-- Appointment Card Info -->
          <div style="background-color: #fdfaf7; border-left: 5px solid #b2533e; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.01);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 35%; font-weight: 600;">👨‍⚕️ Bác sĩ khám:</td>
                <td style="padding: 8px 0; font-size: 15px; color: #1f2937; font-weight: 700;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6b7280; font-weight: 600;">📅 Thời gian hẹn:</td>
                <td style="padding: 8px 0; font-size: 15px; color: #b2533e; font-weight: 700;">${timeString}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6b7280; font-weight: 600;">⚡ Trạng thái:</td>
                <td style="padding: 8px 0; font-size: 13px; color: #059669; font-weight: bold;">
                  <span style="background-color: #d1fae5; padding: 4px 10px; border-radius: 20px;">Đã lên lịch (Scheduled)</span>
                </td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 0;">
            Quý khách vui lòng có mặt tại cơ sở y tế trước giờ hẹn <strong>15 phút</strong> để làm thủ tục chuẩn bị.
            Nếu cần hủy hẹn hoặc đổi giờ khám, quý khách vui lòng đăng nhập ứng dụng MediConnect hoặc liên hệ Hotline để được hỗ trợ kịp thời.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #fafafb; padding: 25px 30px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0 0 8px 0;">Đây là thư nhắc nhở tự động, vui lòng không trả lời trực tiếp email này.</p>
          <p style="margin: 0; font-weight: 600;">© 2026 MediConnect. Bảo lưu mọi quyền.</p>
        </div>

      </div>
    </div>
  `;

  return sendEmail(toEmail, subject, htmlContent);
};

module.exports = {
  sendEmail,
  sendReminderEmail
};
