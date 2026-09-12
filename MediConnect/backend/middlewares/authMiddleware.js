const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token truy cập'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token truy cập'
      });
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwtkeyfor_mediconnect_application';
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    console.error('🔒 Auth Middleware Error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn'
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }

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
