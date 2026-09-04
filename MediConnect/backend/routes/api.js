const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const diagnosisController = require('../controllers/diagnosisController');
const appointmentController = require('../controllers/appointmentController');
const doctorController = require('../controllers/doctorController');
const adminController = require('../controllers/adminController');

// Import Middleware xác thực và phân quyền
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// =========================================================================
// 1. Tuyến đường AUTH (Công khai)
// =========================================================================
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.get('/api/auth/verify-email', authController.verifyEmail);
router.post('/api/auth/verify-email', authController.verifyEmail); // Hỗ trợ xác thực qua form nhập OTP
router.post('/api/auth/resend-verification', authController.resendVerification); // Gửi lại mã OTP
router.post('/api/auth/forgot-password', authController.forgotPassword);
router.post('/api/auth/reset-password', authController.resetPassword);


// =========================================================================
// 2. Tuyến đường BỆNH NHÂN (Yêu cầu xác thực & vai trò patient)
// =========================================================================
router.post(
  '/api/diagnosis', 
  verifyToken, 
  authorizeRoles('patient', 'doctor', 'admin'), 
  diagnosisController.createDiagnosis
);

router.get(
  '/api/diagnosis/history', 
  verifyToken, 
  authorizeRoles('patient', 'doctor', 'admin'), 
  diagnosisController.getDiagnosisHistory
);

router.get(
  '/api/diagnosis/history/:patient_id', 
  verifyToken, 
  authorizeRoles('patient', 'doctor', 'admin'), 
  diagnosisController.getDiagnosisHistoryByPatientId
);

router.post(
  '/api/diagnosis/chat', 
  verifyToken, 
  authorizeRoles('patient', 'doctor', 'admin'), 
  diagnosisController.chatWithMediConnect
);

router.post(
  '/api/appointments', 
  verifyToken, 
  authorizeRoles('patient', 'doctor', 'admin'), 
  appointmentController.createAppointment
);

router.get(
  '/api/appointments/patient/:patient_id', 
  verifyToken, 
  authorizeRoles('patient', 'doctor', 'admin'), 
  appointmentController.getPatientHistory
);

router.get(
  '/api/appointments/booked-slots',
  verifyToken,
  authorizeRoles('patient', 'doctor', 'admin'),
  appointmentController.getBookedSlots
);

// =========================================================================
// 3. Tuyến đường BÁC SĨ (Yêu cầu xác thực & vai trò doctor)
// =========================================================================
router.get(
  '/api/doctors', 
  verifyToken, 
  doctorController.getDoctors
);

// Lấy danh sách lịch khám của bác sĩ hiện tại (dùng token ID)
router.get(
  '/api/doctor/appointments', 
  verifyToken, 
  authorizeRoles('doctor'), 
  doctorController.getDoctorAppointments
);

// Lấy danh sách lịch khám của bác sĩ theo ID chuyên khoa (Bảo mật bằng verifyToken và authorizeRoles)
router.get(
  '/api/appointments/doctor/:doctor_id',
  verifyToken,
  authorizeRoles('doctor', 'admin'),
  appointmentController.getDoctorAppointments
);

// Lấy thông tin chi tiết một lịch khám cụ thể
router.get(
  '/api/appointments/:appointment_id', 
  verifyToken, 
  authorizeRoles('doctor', 'admin'), 
  doctorController.getAppointmentDetail
);

// Bác sĩ cập nhật chẩn đoán lâm sàng và đơn thuốc cho lịch khám
router.put(
  '/api/appointments/:appointment_id/diagnose', 
  verifyToken, 
  authorizeRoles('doctor'), 
  doctorController.submitDiagnosis
);

// =========================================================================
// 4. Tuyến đường QUẢN TRỊ VIÊN (Yêu cầu xác thực & vai trò admin)
// =========================================================================
router.get(
  '/api/admin/users', 
  verifyToken, 
  authorizeRoles('admin'), 
  adminController.getUsers
);

router.put(
  '/api/admin/users/:id/approve', 
  verifyToken, 
  authorizeRoles('admin'), 
  adminController.approveDoctor
);

// Lấy danh sách toàn bộ bệnh án đã hoàn tất (cho admin)
router.get(
  '/api/admin/appointments',
  verifyToken,
  authorizeRoles('admin'),
  appointmentController.getAllAppointments
);

module.exports = router;
