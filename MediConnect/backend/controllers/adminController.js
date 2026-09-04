const db = require('../config/db');

/**
 * GET /api/admin/users
 * Truy vấn danh sách toàn bộ người dùng trong hệ thống.
 * Bảo mật: Bắt buộc không trả về cột password_hash.
 */
const getUsers = async (req, res) => {
  try {
    const sql = `
      SELECT user_id, email, full_name, role, specialty, status 
      FROM Users 
      ORDER BY user_id DESC
    `;
    const [users] = await db.execute(sql);
    
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('❌ Lỗi tại adminController.getUsers:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống khi truy vấn danh sách người dùng.'
    });
  }
};

/**
 * PUT /api/admin/users/:id/approve
 * Cập nhật trạng thái tài khoản Bác sĩ từ "pending" (chờ duyệt) sang "active" (hoạt động).
 */
const approveDoctor = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Vui lòng cung cấp mã ID người dùng cần phê duyệt.'
    });
  }

  try {
    // 1. Kiểm tra xem người dùng có tồn tại và có đúng vai trò Bác sĩ hay không
    const checkSql = 'SELECT user_id, role, status FROM Users WHERE user_id = ?';
    const [rows] = await db.execute(checkSql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy tài khoản người dùng yêu cầu.'
      });
    }

    const user = rows[0];
    if (user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        error: 'Tài khoản yêu cầu phê duyệt không phải là vai trò Bác sĩ (Doctor).'
      });
    }

    if (user.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Tài khoản Bác sĩ này đã ở trạng thái hoạt động (active) trước đó.'
      });
    }

    // 2. Tiến hành cập nhật trạng thái hoạt động
    const updateSql = 'UPDATE Users SET status = \'active\' WHERE user_id = ?';
    await db.execute(updateSql, [id]);

    return res.status(200).json({
      success: true,
      message: 'Phê duyệt tài khoản Bác sĩ thành công. Tài khoản hiện đã sẵn sàng hoạt động.'
    });
  } catch (error) {
    console.error('❌ Lỗi tại adminController.approveDoctor:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống khi phê duyệt tài khoản bác sĩ.'
    });
  }
};

module.exports = {
  getUsers,
  approveDoctor
};
