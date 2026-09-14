const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const diagnosisController = require('../controllers/diagnosisController');
const appointmentController = require('../controllers/appointmentController');
const doctorController = require('../controllers/doctorController');
const adminController = require('../controllers/adminController');

const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.get('/api/auth/verify-email', authController.verifyEmail);
router.post('/api/auth/verify-email', authController.verifyEmail);
router.post('/api/auth/resend-verification', authController.resendVerification);
router.post('/api/auth/forgot-password', authController.forgotPassword);
router.post('/api/auth/reset-password', authController.resetPassword);

// Public Prescription Lookup (No Authentication Required for QR Code Scanning)
router.get('/api/public/prescription/:appointment_id', appointmentController.getPublicPrescription);
router.get('/api/public/prescriptions/:appointment_id', appointmentController.getPublicPrescription);


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

router.get(
  '/api/doctors',
  verifyToken,
  doctorController.getDoctors
);

router.get(
  '/api/doctor/appointments',
  verifyToken,
  authorizeRoles('doctor'),
  doctorController.getDoctorAppointments
);

router.get(
  '/api/appointments/doctor/:doctor_id',
  verifyToken,
  authorizeRoles('doctor', 'admin'),
  appointmentController.getDoctorAppointments
);

router.get(
  '/api/appointments/:appointment_id',
  verifyToken,
  authorizeRoles('doctor', 'admin'),
  doctorController.getAppointmentDetail
);

router.get(
  '/api/appointments/:id/summary',
  verifyToken,
  authorizeRoles('doctor', 'admin', 'patient'),
  appointmentController.getAppointmentAISummary
);

router.get(
  '/api/appointments/:appointment_id/summary',
  verifyToken,
  authorizeRoles('doctor', 'admin', 'patient'),
  appointmentController.getAppointmentAISummary
);

router.put(
  '/api/appointments/:appointment_id/diagnose',
  verifyToken,
  authorizeRoles('doctor'),
  doctorController.submitDiagnosis
);

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

router.get(
  '/api/admin/appointments',
  verifyToken,
  authorizeRoles('admin'),
  appointmentController.getAllAppointments
);

module.exports = router;
