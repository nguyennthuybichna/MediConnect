const db = require('../config/db');

const getDoctors = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT user_id, full_name, email, specialty FROM Users WHERE role = 'doctor'"
    );
    return res.status(200).json({
      success: true,
      doctors: rows
    });
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách bác sĩ:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống khi lấy danh sách bác sĩ.'
    });
  }
};

const getAppointmentDetail = async (req, res) => {
  const { appointment_id } = req.params;

  if (!appointment_id) {
    return res.status(400).json({
      error: 'Thiếu appointment_id trong yêu cầu.'
    });
  }

  try {

    const appSql = `
      SELECT
        app.appointment_id,
        app.appointment_time,
        app.status,
        app.notes,
        app.prescription,
        u.user_id AS patient_id,
        u.full_name AS patient_name,
        u.email AS patient_email,
        pred.prediction_id,
        pred.symptoms_text,
        pred.ai_disease,
        pred.ai_confidence,
        pred.doctor_corrected_disease,
        pred.is_verified
      FROM Appointment app
      INNER JOIN Users u ON app.patient_id = u.user_id
      LEFT JOIN AI_Predictions pred ON app.prediction_id = pred.prediction_id
      WHERE app.appointment_id = ?
    `;
    const [appRows] = await db.execute(appSql, [appointment_id]);

    if (appRows.length === 0) {
      return res.status(404).json({
        error: 'Không tìm thấy lịch hẹn khám yêu cầu.'
      });
    }

    const appData = appRows[0];

    const allergySql = `
      SELECT allergy_type, severity, notes
      FROM Allergy
      WHERE user_id = ?
    `;
    const [allergyRows] = await db.execute(allergySql, [appData.patient_id]);

    return res.status(200).json({
      success: true,
      data: {
        appointment_id: appData.appointment_id,
        appointment_time: appData.appointment_time,
        status: appData.status,
        notes: appData.notes,
        prescription: appData.prescription,
        patient: {
          id: appData.patient_id,
          name: appData.patient_name,
          email: appData.patient_email,
          allergies: allergyRows
        },
        ai_prediction: appData.prediction_id ? {
          prediction_id: appData.prediction_id,
          symptoms_text: appData.symptoms_text,
          ai_disease: appData.ai_disease,
          ai_confidence: appData.ai_confidence,
          doctor_corrected_disease: appData.doctor_corrected_disease,
          is_verified: appData.is_verified
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Lỗi chi tiết lịch hẹn khám:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống khi lấy thông tin chi tiết lịch hẹn.'
    });
  }
};

const submitDiagnosis = async (req, res) => {
  const { appointment_id } = req.params;
  const { notes, prescription, doctor_corrected_disease } = req.body;

  if (!appointment_id) {
    return res.status(400).json({
      error: 'Thiếu tham số appointment_id.'
    });
  }

  try {

    const [appRows] = await db.execute(
      "SELECT patient_id, prediction_id FROM Appointment WHERE appointment_id = ?",
      [appointment_id]
    );

    if (appRows.length === 0) {
      return res.status(404).json({
        error: 'Không tìm thấy lịch hẹn khám để cập nhật.'
      });
    }

    const { patient_id, prediction_id } = appRows[0];

    await db.execute(
      "UPDATE Appointment SET notes = ?, prescription = ?, status = 'Completed' WHERE appointment_id = ?",
      [notes || null, prescription || null, appointment_id]
    );

    if (prediction_id) {
      await db.execute(
        `UPDATE AI_Predictions
         SET doctor_corrected_disease = ?, is_verified = 1
         WHERE prediction_id = ?`,
        [doctor_corrected_disease || null, prediction_id]
      );
    } else {

      const [newPred] = await db.execute(
        `INSERT INTO AI_Predictions (patient_id, symptoms_text, ai_disease, ai_confidence, doctor_corrected_disease, is_verified)
         VALUES (?, 'Chẩn đoán trực tiếp không qua triage', 'Bác sĩ chẩn đoán', 1.00, ?, 1)`,
        [patient_id, doctor_corrected_disease || 'Chưa rõ']
      );

      await db.execute(
        "UPDATE Appointment SET prediction_id = ? WHERE appointment_id = ?",
        [newPred.insertId, appointment_id]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Lưu kết quả chẩn đoán lâm sàng và đơn thuốc thành công (Human-in-the-loop).'
    });

  } catch (error) {
    console.error('❌ Lỗi cập nhật chẩn đoán lâm sàng:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống khi cập nhật kết quả chẩn đoán.'
    });
  }
};

const getDoctorAppointments = async (req, res) => {
  const doctor_id = req.user?.user_id;

  if (!doctor_id) {
    return res.status(401).json({
      success: false,
      error: 'Không xác định được danh tính bác sĩ từ token.'
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
        patient.user_id AS patient_id,
        patient.full_name AS patient_name,
        patient.email AS patient_email,
        pred.prediction_id,
        pred.symptoms_text,
        pred.ai_disease,
        pred.ai_confidence,
        pred.doctor_corrected_disease,
        pred.is_verified
      FROM Appointment app
      INNER JOIN Users patient ON app.patient_id = patient.user_id
      LEFT JOIN AI_Predictions pred ON app.prediction_id = pred.prediction_id
      WHERE app.doctor_id = ?
      ORDER BY app.appointment_time ASC
    `;
    const [appointments] = await db.execute(sql, [doctor_id]);

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error('❌ Lỗi tại doctorController.getDoctorAppointments:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống khi lấy danh sách lịch khám của bác sĩ.'
    });
  }
};

module.exports = {
  getDoctors,
  getAppointmentDetail,
  submitDiagnosis,
  getDoctorAppointments
};
