const db = require('../config/db');

const getDoctorAppointments = async (req, res) => {
  const { doctor_id } = req.params;

  if (!doctor_id) {
    return res.status(400).json({
      error: 'Thiếu mã doctor_id trong tham số URL.'
    });
  }

  try {
    const sql = `
      SELECT
        app.appointment_id,
        app.appointment_time,
        app.status,
        patient.user_id AS patient_id,
        patient.full_name AS patient_name,
        pred.ai_disease,
        alg.allergy_type AS allergen
      FROM Appointment app
      INNER JOIN Users patient ON app.patient_id = patient.user_id
      LEFT JOIN AI_Predictions pred ON app.prediction_id = pred.prediction_id
      LEFT JOIN Allergy alg ON app.patient_id = alg.user_id
      WHERE app.doctor_id = ?
      ORDER BY app.appointment_time ASC
    `;

    const [rows] = await db.execute(sql, [doctor_id]);

    const appointmentsMap = {};

    for (const row of rows) {
      const { appointment_id, appointment_time, status, patient_id, patient_name, ai_disease, allergen } = row;

      if (!appointmentsMap[appointment_id]) {
        appointmentsMap[appointment_id] = {
          appointment_id,
          appointment_time,
          status,
          patient_id,
          patient_name,
          ai_disease: ai_disease || 'Chưa có chẩn đoán',
          allergens: []
        };
      }

      if (allergen) {
        appointmentsMap[appointment_id].allergens.push(allergen);
      }
    }

    const result = Object.values(appointmentsMap);

    return res.status(200).json({
      success: true,
      count: result.length,
      appointments: result
    });

  } catch (error) {
    console.error('❌ Lỗi truy vấn lịch hẹn bác sĩ (getDoctorAppointments):', error.message);
    return res.status(500).json({
      error: 'Lỗi máy chủ nội bộ khi lấy danh sách lịch hẹn.'
    });
  }
};

const formatDateTime = (dateTimeStr) => {
  try {
    const parts = dateTimeStr.trim().split(' ');
    if (parts.length < 3) return dateTimeStr;

    const datePart = parts[0];
    const timePart = parts[1];
    const ampm = parts[2].toUpperCase();

    let [hours, minutes] = timePart.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${datePart} ${formattedHours}:${formattedMinutes}:00`;
  } catch (err) {
    return dateTimeStr;
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, prediction_id, appointment_time, status } = req.body;

    if (!patient_id || !doctor_id || !appointment_time) {
      return res.status(400).json({
        error: 'Vui lòng cung cấp đầy đủ patient_id, doctor_id và appointment_time.'
      });
    }

    const formattedTime = formatDateTime(appointment_time);

    if (new Date(formattedTime) < new Date()) {
      return res.status(400).json({
        error: 'Thời gian đặt hẹn khám không hợp lệ (không được chọn thời điểm trong quá khứ).'
      });
    }

    const conflictSql = `
      SELECT appointment_id
      FROM Appointment
      WHERE doctor_id = ?
        AND status != 'Cancelled'
        AND appointment_time >= DATE_SUB(?, INTERVAL 30 MINUTE)
        AND appointment_time <= DATE_ADD(?, INTERVAL 30 MINUTE)
    `;
    const [existing] = await db.execute(conflictSql, [doctor_id, formattedTime, formattedTime]);

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Bác sĩ đã có lịch hẹn vào thời gian này'
      });
    }

    const appointmentStatus = status || 'Scheduled';

    const sql = `
      INSERT INTO Appointment (patient_id, doctor_id, prediction_id, appointment_time, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      patient_id,
      doctor_id,
      prediction_id || null,
      formattedTime,
      appointmentStatus
    ]);

    return res.status(201).json({
      success: true,
      message: 'Đặt lịch hẹn khám thành công.',
      data: {
        appointment_id: result.insertId,
        patient_id,
        doctor_id,
        prediction_id,
        appointment_time: formattedTime,
        status: appointmentStatus
      }
    });

  } catch (error) {
    console.error('❌ Lỗi tại appointmentController.createAppointment:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi đặt lịch hẹn khám.'
    });
  }
};

const getPatientHistory = async (req, res) => {
  const { patient_id } = req.params;

  if (!patient_id) {
    return res.status(400).json({
      error: 'Thiếu mã patient_id trong tham số URL.'
    });
  }

  try {
    const sql = `
      SELECT
        app.appointment_id,
        app.appointment_time,
        app.status,
        app.notes,
        app.prescription,
        doctor.full_name AS doctor_name,
        pred.ai_disease,
        pred.ai_confidence,
        pred.doctor_corrected_disease,
        pred.is_verified
      FROM Appointment app
      INNER JOIN Users doctor ON app.doctor_id = doctor.user_id
      LEFT JOIN AI_Predictions pred ON app.prediction_id = pred.prediction_id
      WHERE app.patient_id = ?
      ORDER BY app.appointment_time DESC
    `;

    const [rows] = await db.execute(sql, [patient_id]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      records: rows
    });

  } catch (error) {
    console.error('❌ Lỗi truy vấn lịch sử bệnh án (getPatientHistory):', error.message);
    return res.status(500).json({
      error: 'Lỗi máy chủ nội bộ khi lấy danh sách lịch sử bệnh án.'
    });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const sql = `
      SELECT
        app.appointment_id,
        app.appointment_time,
        app.status,
        app.notes,
        app.prescription,
        patient.full_name AS patient_name,
        patient.email AS patient_email,
        patient.user_id AS patient_id,
        doc.full_name AS doctor_name,
        pred.ai_disease,
        pred.ai_confidence,
        pred.doctor_corrected_disease
      FROM Appointment app
      INNER JOIN Users patient ON app.patient_id = patient.user_id
      INNER JOIN Users doc ON app.doctor_id = doc.user_id
      LEFT JOIN AI_Predictions pred ON app.prediction_id = pred.prediction_id
      WHERE app.status = 'Completed' OR app.status = 'Validated'
      ORDER BY app.appointment_time DESC
    `;

    const [rows] = await db.execute(sql);

    return res.status(200).json({
      success: true,
      count: rows.length,
      appointments: rows
    });
  } catch (error) {
    console.error('❌ Lỗi tại appointmentController.getAllAppointments:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống khi lấy danh sách toàn bộ bệnh án.'
    });
  }
};

const getBookedSlots = async (req, res) => {
  const { doctor_id, date } = req.query;

  if (!doctor_id || !date) {
    return res.status(400).json({
      error: 'Vui lòng cung cấp đầy đủ doctor_id và date.'
    });
  }

  try {
    const sql = `
      SELECT TIME_FORMAT(appointment_time, '%h:%i %p') AS time_str
      FROM Appointment
      WHERE doctor_id = ? AND DATE(appointment_time) = ? AND status != 'Cancelled'
    `;
    const [rows] = await db.execute(sql, [doctor_id, date]);

    const bookedSlots = rows.map(row => row.time_str);

    return res.status(200).json({
      success: true,
      bookedSlots
    });
  } catch (error) {
    console.error('❌ Lỗi tại appointmentController.getBookedSlots:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống khi lấy danh sách giờ đã đặt.'
    });
  }
};

const { generateAISummary } = require('../utils/aiSummaryHelper');

const getAppointmentAISummary = async (req, res) => {
  const appointmentId = req.params.id || req.params.appointment_id;

  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      error: 'Thiếu mã lịch hẹn (appointment_id) trong tham số URL.'
    });
  }

  try {
    let patientId = null;
    let patientName = 'Bệnh nhân';

    const appointmentSql = `
      SELECT
        app.appointment_id,
        app.patient_id,
        u.full_name AS patient_name,
        u.email AS patient_email
      FROM Appointment app
      INNER JOIN Users u ON app.patient_id = u.user_id
      WHERE app.appointment_id = ?
    `;
    const [appRows] = await db.execute(appointmentSql, [appointmentId]);

    if (appRows.length > 0) {
      patientId = appRows[0].patient_id;
      patientName = appRows[0].patient_name || 'Bệnh nhân';
    } else {

      const userSql = `
        SELECT user_id, full_name, email
        FROM Users
        WHERE user_id = ? AND role = 'patient'
      `;
      const [userRows] = await db.execute(userSql, [appointmentId]);
      if (userRows.length > 0) {
        patientId = userRows[0].user_id;
        patientName = userRows[0].full_name || 'Bệnh nhân';
      } else {
        return res.status(404).json({
          success: false,
          error: `Không tìm thấy lịch hẹn hoặc hồ sơ bệnh nhân với mã: ${appointmentId}`
        });
      }
    }

    const historySql = `
      SELECT
        created_at,
        symptoms_text,
        doctor_corrected_disease
      FROM AI_Predictions
      WHERE patient_id = ? AND is_verified = 1
      ORDER BY created_at DESC
    `;
    const [historyRows] = await db.execute(historySql, [patientId]);

    const summary = await generateAISummary(historyRows, patientName);

    return res.status(200).json({
      success: true,
      appointment_id: appRows.length > 0 ? appRows[0].appointment_id : null,
      patient_id: patientId,
      patient_name: patientName,
      history_count: historyRows.length,
      summary: summary,
      history_records: historyRows
    });

  } catch (error) {
    console.error('❌ Lỗi tại appointmentController.getAppointmentAISummary:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ nội bộ khi tạo tóm tắt bệnh sử AI.'
    });
  }
};

module.exports = {
  getDoctorAppointments,
  createAppointment,
  getPatientHistory,
  getAllAppointments,
  getBookedSlots,
  getAppointmentAISummary
};
