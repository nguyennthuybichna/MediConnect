const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
require('dotenv').config();

/**
 * 1. Hàm đăng ký tài khoản (Register) - Sử dụng OTP 6 chữ số
 * Luồng dữ liệu:
 * - Tiếp nhận thông tin từ body.
 * - Mã hóa mật khẩu bằng bcrypt.
 * - Tạo mã OTP 6 chữ số ngẫu nhiên: Math.floor(100000 + Math.random() * 900000).toString()
 * - Lưu người dùng mới vào bảng `Users` kèm `verification_token` là OTP 6 số.
 * - Gửi email chứa mã OTP 6 số hiển thị nổi bật cho người dùng nhập trên giao diện.
 */
const register = async (req, res) => {
  try {
    const { email, password, full_name, role, specialty } = req.body;

    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();
    const trimmedFullName = (full_name || '').trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedFullName) {
      return res.status(400).json({
        error: 'Vui lòng không để trống hoặc chỉ nhập khoảng trắng cho các trường thông tin.'
      });
    }

    if (trimmedFullName.length < 2 || !/[a-zA-Z\u00C0-\u1EF9]{2,}/.test(trimmedFullName)) {
      return res.status(400).json({
        error: 'Họ và tên phải có ít nhất 2 chữ cái hợp lệ (không được chỉ có 1 ký tự hoặc toàn ký tự đặc biệt).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        error: 'Địa chỉ email không đúng định dạng.'
      });
    }

    if (trimmedPassword.length < 6) {
      return res.status(400).json({
        error: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự.'
      });
    }

    const [existingUsers] = await db.execute('SELECT user_id FROM Users WHERE email = ?', [trimmedEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: 'Email này đã được đăng ký sử dụng trong hệ thống.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(trimmedPassword, salt);

    const userRole = role || 'patient';
    const userSpecialty = specialty || null;

    // Tạo mã OTP xác thực email 6 chữ số ngẫu nhiên
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào bảng tạm Pending_Registrations (CHƯA LƯU VÀO Users cho tới khi xác thực email thành công)
    await db.execute('DELETE FROM Pending_Registrations WHERE email = ?', [trimmedEmail]);
    await db.execute(`
      INSERT INTO Pending_Registrations (email, password_hash, full_name, role, specialty, otp, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
    `, [trimmedEmail, passwordHash, trimmedFullName, userRole, userSpecialty, emailVerificationToken]);

    console.log(`🔑 [DEBUG] Mã OTP đăng ký của email ${trimmedEmail} là: ${emailVerificationToken}`);

    // Gửi email xác thực chứa mã OTP
    const mailSubject = 'MediConnect - Mã xác thực tài khoản';
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5eae6; border-radius: 15px;">
        <h2 style="color: #843f2e; text-align: center;">Chào mừng bạn đến với MediConnect!</h2>
        <p>Xin chào <strong>${trimmedFullName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã xác thực bên dưới để kích hoạt và hoàn tất tạo tài khoản của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #843f2e; background-color: #fdfbfb; padding: 15px 30px; border-radius: 10px; border: 1px dashed #d3765f;">
            ${emailVerificationToken}
          </span>
        </div>
        <p style="font-size: 12px; color: #666; text-align: center;">Mã xác thực này có hiệu lực trong vòng 24 giờ. Tài khoản chỉ được kích hoạt vào hệ thống sau khi nhập đúng mã.</p>
        <p>Trân trọng,<br/>Đội ngũ phát triển MediConnect</p>
      </div>
    `;

    try {
      await sendEmail(trimmedEmail, mailSubject, mailHtml);
    } catch (mailError) {
      console.error('⚠️ Gửi email xác thực thất bại khi đăng ký:', mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Đăng ký bước 1 thành công. Vui lòng kiểm tra email để lấy mã xác thực kích hoạt tài khoản.',
      email: trimmedEmail
    });

  } catch (error) {
    console.error('❌ Lỗi tại authController.register:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi đăng ký tài khoản.'
    });
  }
};

/**
 * 2. Hàm đăng nhập (Login)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail || !trimmedPassword || trimmedEmail.length <= 1 || trimmedPassword.length <= 1) {
      return res.status(400).json({
        error: 'Email và mật khẩu không được để trống, không được chỉ có khoảng trắng hoặc chỉ có 1 ký tự.'
      });
    }

    const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [trimmedEmail]);
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(trimmedPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    // Kiểm tra nếu is_email_verified === 0 (false), chặn đăng nhập
    if (user.is_email_verified === 0) {
      return res.status(403).json({
        error: 'Vui lòng xác thực email.'
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET || 'supersecretjwtkeyfor_mediconnect_application',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      token,
      user_id: user.user_id,
      user: {
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        specialty: user.specialty
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tại authController.login:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi đăng nhập.'
    });
  }
};

/**
 * 3. Hàm xác thực email (Verify Email) - Hỗ trợ cả GET (query param) và POST (body)
 * Luồng dữ liệu:
 * - Nhận `token` (OTP) và `email` từ body hoặc query.
 * - Tìm user khớp `verification_token` và `email`.
 * - Cập nhật `is_email_verified = 1` và xóa token xác thực.
 */
const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    const email = req.query.email || req.body.email;

    if (!token) {
      return res.status(400).json({
        error: 'Mã xác thực không hợp lệ.'
      });
    }

    const trimmedToken = String(token).trim();
    const trimmedEmail = email ? String(email).trim() : null;

    // Tìm thông tin đăng ký chờ xác thực trong bảng Pending_Registrations
    let sql, params;
    if (trimmedEmail) {
      sql = 'SELECT * FROM Pending_Registrations WHERE otp = ? AND email = ? AND expires_at > NOW()';
      params = [trimmedToken, trimmedEmail];
    } else {
      sql = 'SELECT * FROM Pending_Registrations WHERE otp = ? AND expires_at > NOW()';
      params = [trimmedToken];
    }

    const [pendingUsers] = await db.execute(sql, params);

    if (pendingUsers.length === 0) {
      if (trimmedEmail) {
        const [existing] = await db.execute('SELECT user_id FROM Users WHERE email = ?', [trimmedEmail]);
        if (existing.length > 0) {
          return res.status(200).json({
            success: true,
            message: 'Tài khoản này đã được xác thực trước đó. Bạn có thể đăng nhập ngay!'
          });
        }
      }
      return res.status(400).json({
        error: 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
      });
    }

    const pending = pendingUsers[0];

    // CHÍNH THỨC TẠO TÀI KHOẢN VÀO BẢNG Users SAU KHI XÁC THỰC EMAIL THÀNH CÔNG
    const [existing] = await db.execute('SELECT user_id FROM Users WHERE email = ?', [pending.email]);
    let userId;

    if (existing.length > 0) {
      userId = existing[0].user_id;
      await db.execute('UPDATE Users SET is_email_verified = 1 WHERE user_id = ?', [userId]);
    } else {
      const [insertResult] = await db.execute(`
        INSERT INTO Users (email, password_hash, full_name, role, specialty, is_email_verified)
        VALUES (?, ?, ?, ?, ?, 1)
      `, [pending.email, pending.password_hash, pending.full_name, pending.role, pending.specialty]);
      userId = insertResult.insertId;
    }

    // Xóa dữ liệu đăng ký tạm sau khi đã tạo xong tài khoản
    await db.execute('DELETE FROM Pending_Registrations WHERE email = ?', [pending.email]);

    return res.status(200).json({
      success: true,
      message: 'Xác thực email thành công! Tài khoản của bạn đã được khởi tạo và sẵn sàng đăng nhập.',
      user_id: userId
    });

  } catch (error) {
    console.error('❌ Lỗi tại authController.verifyEmail:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi xác thực email.'
    });
  }
};

/**
 * 4. Yêu cầu khôi phục mật khẩu (Forgot Password) - Sử dụng OTP 6 chữ số
 * Luồng dữ liệu:
 * - Nhận email khôi phục mật khẩu.
 * - Sinh mã OTP 6 chữ số ngẫu nhiên.
 * - Lưu OTP và hạn sử dụng 15 phút vào DB.
 * - Gửi email chứa mã OTP khôi phục mật khẩu.
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp địa chỉ email.'
      });
    }

    const [users] = await db.execute('SELECT user_id, full_name FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Email không tồn tại trong hệ thống.'
      });
    }

    const user = users[0];
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 [DEBUG] Mã OTP khôi phục mật khẩu của email ${email} là: ${resetOtp}`);
    
    // Đặt hạn sử dụng là 15 phút bằng hàm DATE_ADD của MySQL để đồng bộ múi giờ hệ thống
    await db.execute(
      'UPDATE Users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE user_id = ?',
      [resetOtp, user.user_id]
    );

    const mailSubject = 'MediConnect - Yêu cầu khôi phục mật khẩu';
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5eae6; border-radius: 15px;">
        <h2 style="color: #843f2e; text-align: center;">Yêu cầu khôi phục mật khẩu MediConnect</h2>
        <p>Xin chào <strong>${user.full_name}</strong>,</p>
        <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản MediConnect. Vui lòng sử dụng mã xác thực dưới đây để thiết lập mật khẩu mới:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #843f2e; background-color: #fdfbfb; padding: 15px 30px; border-radius: 10px; border: 1px dashed #d3765f;">
            ${resetOtp}
          </span>
        </div>
        <p style="font-size: 12px; color: #666; text-align: center;">Mã xác thực này có hiệu lực trong vòng 15 phút.</p>
        <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email và mật khẩu của bạn sẽ được giữ nguyên.</p>
        <p>Trân trọng,<br/>Đội ngũ phát triển MediConnect</p>
      </div>
    `;

    try {
      await sendEmail(email, mailSubject, mailHtml);
    } catch (mailError) {
      console.error('⚠️ Gửi email khôi phục mật khẩu thất bại:', mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Mã OTP xác thực khôi phục mật khẩu đã được gửi về email của bạn.'
    });

  } catch (error) {
    console.error('❌ Lỗi tại authController.forgotPassword:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi xử lý quên mật khẩu.'
    });
  }
};

/**
 * 5. Thiết lập mật khẩu mới (Reset Password) - Xác thực bằng OTP 6 chữ số
 * Luồng dữ liệu:
 * - Nhận `email`, `token` (mã OTP 6 số) và `new_password` từ body.
 * - So khớp CSDL tìm tài khoản trùng khớp email và OTP chưa hết hạn.
 * - Mã hóa mật khẩu mới và lưu vào DB, xóa thông tin reset.
 */
const resetPassword = async (req, res) => {
  try {
    const { email, token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp đầy đủ mã xác thực (token) và mật khẩu mới.'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: 'Mật khẩu mới phải có độ dài tối thiểu từ 6 ký tự.'
      });
    }

    // Kiểm tra token tồn tại và chưa hết hạn (hỗ trợ cả trường hợp có hoặc không có email)
    let sql, params;
    if (email) {
      sql = 'SELECT user_id FROM Users WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()';
      params = [email, token];
    } else {
      sql = 'SELECT user_id FROM Users WHERE reset_token = ? AND reset_token_expiry > NOW()';
      params = [token];
    }

    const [users] = await db.execute(sql, params);
    if (users.length === 0) {
      return res.status(400).json({
        error: 'Mã xác thực không hợp lệ hoặc đã hết hạn (15 phút).'
      });
    }

    const user = users[0];
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(new_password, salt);

    // Cập nhật CSDL
    await db.execute(
      'UPDATE Users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?',
      [passwordHash, user.user_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn đã có thể đăng nhập bằng mật khẩu mới.'
    });

  } catch (error) {
    console.error('❌ Lỗi tại authController.resetPassword:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi đặt lại mật khẩu.'
    });
  }
};

/**
 * 6. Gửi lại mã xác thực tài khoản (Resend Verification Code)
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ email.' });
    }

    const trimmedEmail = email.trim();

    const [users] = await db.execute('SELECT user_id, full_name, is_email_verified FROM Users WHERE email = ?', [trimmedEmail]);
    if (users.length > 0 && users[0].is_email_verified === 1) {
      return res.status(400).json({ error: 'Tài khoản này đã được xác thực email từ trước.' });
    }

    const [pending] = await db.execute('SELECT * FROM Pending_Registrations WHERE email = ?', [trimmedEmail]);
    if (pending.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin đăng ký chờ xác thực. Vui lòng tiến hành đăng ký lại.' });
    }

    const pendingUser = pending[0];
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    await db.execute(
      'UPDATE Pending_Registrations SET otp = ?, expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE email = ?',
      [emailVerificationToken, trimmedEmail]
    );

    console.log(`🔑 [DEBUG] Mã OTP mới của email ${trimmedEmail} là: ${emailVerificationToken}`);

    const mailSubject = 'MediConnect - Gửi lại mã xác thực tài khoản';
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5eae6; border-radius: 15px;">
        <h2 style="color: #843f2e; text-align: center;">Xác thực tài khoản MediConnect</h2>
        <p>Xin chào <strong>${pendingUser.full_name}</strong>,</p>
        <p>Chúng tôi đã nhận được yêu cầu gửi lại mã xác thực. Dưới đây là mã xác thực mới của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #843f2e; background-color: #fdfbfb; padding: 15px 30px; border-radius: 10px; border: 1px dashed #d3765f;">
            ${emailVerificationToken}
          </span>
        </div>
        <p style="font-size: 12px; color: #666; text-align: center;">Mã xác thực này có hiệu lực trong vòng 24 giờ. Tài khoản chỉ được kích hoạt sau khi xác thực thành công.</p>
        <p>Trân trọng,<br/>Đội ngũ phát triển MediConnect</p>
      </div>
    `;

    try {
      await sendEmail(trimmedEmail, mailSubject, mailHtml);
    } catch (mailError) {
      console.error('⚠️ Gửi lại email xác thực thất bại:', mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Mã xác thực mới đã được gửi thành công.'
    });
  } catch (error) {
    console.error('❌ Lỗi tại authController.resendVerification:', error.message);
    return res.status(500).json({ error: 'Lỗi hệ thống nội bộ khi gửi lại mã xác thực.' });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification
};
