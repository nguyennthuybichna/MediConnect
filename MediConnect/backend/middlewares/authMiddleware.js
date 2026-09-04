const jwt = require('jsonwebtoken');

/**
 * Middleware verifyToken: Xác thực token JWT gửi từ client
 * - Kiểm tra sự tồn tại của token trong header Authorization (định dạng Bearer <token>).
 * - Giải mã và kiểm chứng token với JWT_SECRET.
 * - Gán thông tin người dùng vào req.user nếu hợp lệ.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    // Kiểm tra Header Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token truy cập'
      });
    }

    // Trích xuất token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token truy cập'
      });
    }

    // Xác thực token
    const secret = process.env.JWT_SECRET || 'supersecretjwtkeyfor_mediconnect_application';
    const decoded = jwt.verify(token, secret);

    // Gán payload đã giải mã vào req.user
    req.user = decoded;
    next();
  } catch (error) {
    console.error('🔒 Auth Middleware Error:', error.message);
    
    // Xử lý các lỗi JWT cụ thể (hết hạn, sai chữ ký, v.v.)
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

/**
 * Middleware authorizeRoles: Phân quyền truy cập dựa trên vai trò (RBAC)
 * - Là một middleware factory nhận vào danh sách các role được phép truy cập.
 * - So khớp vai trò của người dùng (req.user.role) với danh sách allowedRoles.
 * 
 * @param {...string} allowedRoles - Danh sách các role được cho phép
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Đảm bảo thông tin người dùng đã được xác thực trước đó
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }

    // Kiểm tra quyền hạn
    console.log(`🔒 [Auth RBAC] Yêu cầu role: [${allowedRoles.join(', ')}] | Role của User hiện tại: [${req.user.role}]`);
    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};


/* =========================================================================
   [VÍ DỤ CÁCH SỬ DỤNG - ROUTE EXAMPLES]
   =========================================================================

   const express = require('express');
   const router = express.Router();
   const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

   // 1. API CHỈ DÀNH RIÊNG CHO ADMIN:
   // Ví dụ: Xem nhật ký hoạt động hệ thống hoặc quản trị người dùng
   router.get(
     '/admin/logs', 
     verifyToken, 
     authorizeRoles('admin'), 
     async (req, res) => {
       res.json({ success: true, message: "Welcome Admin! Đây là nhật ký hệ thống." });
     }
   );

   // 2. API DÀNH CHO CẢ ADMIN VÀ BÁC SĨ (DOCTOR):
   // Ví dụ: Xem thông tin hồ sơ bệnh án hoặc lịch sử khám
   router.get(
     '/records/:id', 
     verifyToken, 
     authorizeRoles('admin', 'doctor'), 
     async (req, res) => {
       res.json({ success: true, message: `Hồ sơ bệnh án chi tiết của bệnh nhân ID: ${req.params.id}` });
     }
   );

   // 3. API DÀNH CHO TẤT CẢ NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP (ADMIN, DOCTOR, PATIENT):
   // Ví dụ: Xem thông tin cá nhân của chính mình
   router.get(
     '/profile', 
     verifyToken, 
     authorizeRoles('admin', 'doctor', 'patient'), 
     async (req, res) => {
       res.json({ success: true, user: req.user });
     }
   );
*/
