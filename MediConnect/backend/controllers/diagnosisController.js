const axios = require('axios');
const db = require('../config/db');

/**
 * Kiểm tra xem chuỗi văn bản triệu chứng có phải là chuỗi vô nghĩa/spam không:
 * - Chuỗi quá ngắn (< 2 ký tự sau khi trim).
 * - Chuỗi chỉ chứa số, ký tự đặc biệt hoặc khoảng trắng.
 * - Chuỗi chỉ là lặp lại 1 ký tự (vd: "aaaaa", "11111", ".....").
 * - Chuỗi từ 3 ký tự trở lên nhưng không chứa nguyên âm tiếng Việt/tiếng Anh (vd: "asdfghjk", "bcdfgh", "qwrtyp").
 */
const isMeaninglessText = (text) => {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 2) return true;

  // Chỉ chứa số hoặc ký tự đặc biệt
  if (/^[\d\W_]+$/u.test(trimmed)) return true;

  // Lặp lại 1 ký tự duy nhất
  if (/^(.)\1{2,}$/i.test(trimmed)) return true;

  // Kiểm tra nguyên âm (tiếng Việt và tiếng Anh)
  const hasVowels = /[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i.test(trimmed);
  if (!hasVowels && trimmed.length >= 3) return true;

  // Chuỗi ngẫu nhiên bàn phím phổ biến
  const gibberishPatterns = [
    /^[asdfghjkl]+$/i,
    /^[qwertyuiop]+$/i,
    /^[zxcvbnm]+$/i,
    /^(abc|xyz|test|alo|asdf|123|ha|hi|he|ho)$/i
  ];
  if (gibberishPatterns.some(pat => pat.test(trimmed))) return true;

  return false;
};

/**
 * Hàm làm sạch chuỗi symptoms_text (tiền xử lý dữ liệu đầu vào)
 * - Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ, số và chữ cái tiếng Việt có dấu.
 * - Loại bỏ khoảng trắng thừa ở giữa và hai đầu.
 */
const preprocessSymptoms = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\w\s\u00C0-\u1EF9,.-]/gi, ' ') // Giữ lại chữ tiếng Việt, dấu phẩy, dấu chấm, dấu gạch ngang
    .replace(/\s+/g, ' ')                     // Xoá khoảng trắng thừa
    .trim();
};

/**
 * POST /api/diagnosis
 * API tiếp nhận chẩn đoán từ AI trợ lý
 */
const createDiagnosis = async (req, res) => {
  try {
    const { patient_id } = req.body;
    const symptoms_text = req.body.symptoms_text || req.body.symptoms;

    if (!patient_id || !symptoms_text) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin patient_id và triệu chứng bệnh.'
      });
    }

    // Kiểm tra ký tự vô nghĩa hoặc chỉ 1 chữ cái
    if (isMeaninglessText(symptoms_text)) {
      return res.status(400).json({
        success: false,
        error: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho, đau đầu, tức ngực, mệt mỏi...).'
      });
    }

    // 1. Tiền xử lý (Preprocessing) chuỗi triệu chứng
    const cleanedSymptoms = preprocessSymptoms(symptoms_text);

    if (!cleanedSymptoms || isMeaninglessText(cleanedSymptoms)) {
      return res.status(400).json({
        success: false,
        error: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho, đau đầu, tức ngực, mệt mỏi...).'
      });
    }

    let aiDisease = 'Chưa xác định';
    let aiConfidence = 0.00;

    // 2. Gửi yêu cầu sang FastAPI Inference Engine
    try {
      const pythonResponse = await axios.post(
        'http://localhost:8000/predict',
        { text: cleanedSymptoms }, // FastAPI mong đợi thuộc tính 'text'
        { timeout: 5000 }
      );

      if (pythonResponse.data) {
        aiDisease = pythonResponse.data.disease || aiDisease;
        aiConfidence = pythonResponse.data.confidence !== undefined
          ? pythonResponse.data.confidence
          : aiConfidence;
      }
    } catch (apiError) {
      console.error('🔒 FastAPI Connection Error:', apiError.message);
      
      // Bắt lỗi kết nối mạng (ECONNREFUSED hoặc ETIMEDOUT) khi FastAPI offline
      if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
        return res.status(503).json({
          success: false,
          error: 'Dịch vụ chẩn đoán AI (FastAPI Engine) hiện tại đang ngoại tuyến hoặc quá tải. Vui lòng thử lại sau.'
        });
      }

      // Trả về lỗi 500 thân thiện cho các lỗi giao tiếp API khác
      return res.status(500).json({
        success: false,
        error: 'Lỗi hệ thống khi truyền thông tin chẩn đoán tới động cơ AI.'
      });
    }

    // 3. Quản lý dữ liệu CSDL & Kiểm tra liên kết an toàn với MedicalRecord (1-1 với Users)
    // Truy vấn xem bệnh nhân đã có bản ghi y tế chưa
    const [existingRecord] = await db.execute(
      'SELECT record_id FROM MedicalRecord WHERE patient_id = ?',
      [patient_id]
    );

    if (existingRecord.length === 0) {
      // Nếu chưa tồn tại, tự động tạo mới một MedicalRecord trống để đảm bảo tính toàn vẹn khóa ngoại
      await db.execute(
        `INSERT INTO MedicalRecord (patient_id, blood_type, height, weight, underlying_conditions, past_surgeries) 
         VALUES (?, NULL, NULL, NULL, NULL, NULL)`,
        [patient_id]
      );
      console.log(`🌱 Đã tự động tạo hồ sơ bệnh án liên kết cho bệnh nhân ID: ${patient_id}`);
    }

    // 4. Lưu kết quả chẩn đoán vào bảng AI_Predictions
    const chatHistory = req.body.chat_history ? JSON.stringify(req.body.chat_history) : null;
    const sql = `
      INSERT INTO AI_Predictions (patient_id, symptoms_text, ai_disease, ai_confidence, is_verified, chat_history)
      VALUES (?, ?, ?, ?, 0, ?)
    `;
    const [result] = await db.execute(sql, [patient_id, cleanedSymptoms, aiDisease, aiConfidence, chatHistory]);

    return res.status(201).json({
      success: true,
      message: 'Chẩn đoán bệnh bằng AI thành công và đã đồng bộ lưu lịch sử.',
      data: {
        prediction_id: result.insertId,
        patient_id,
        symptoms_text: cleanedSymptoms,
        ai_disease: aiDisease,
        ai_confidence: aiConfidence,
        is_verified: false,
        chat_history: chatHistory
      }
    });


  } catch (error) {
    console.error('❌ Lỗi tại diagnosisController.createDiagnosis:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống nội bộ khi thực hiện chẩn đoán triệu chứng.'
    });
  }
};

const getDiagnosisHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Không xác định được danh tính người dùng. Vui lòng đăng nhập lại.' 
      });
    }
    const patient_id = req.user.user_id;

    const sql = `
      SELECT 
        prediction_id, 
        patient_id, 
        symptoms_text, 
        ai_disease, 
        ai_confidence, 
        doctor_corrected_disease, 
        is_verified, 
        created_at 
      FROM AI_Predictions 
      WHERE patient_id = ? 
      ORDER BY created_at DESC
    `;

    const [rows] = await db.execute(sql, [patient_id]);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Lỗi tại diagnosisController.getDiagnosisHistory:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống nội bộ khi lấy lịch sử chẩn đoán.'
    });
  }
};

const chatWithMediConnect = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập nội dung tin nhắn triệu chứng.'
      });
    }

    // Kiểm tra tin nhắn vô nghĩa, ký tự rác hoặc 1 chữ cái
    if (isMeaninglessText(message)) {
      return res.status(200).json({
        success: true,
        reply: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho khan, đau đầu, đau tức ngực, mệt mỏi...) để tôi có thể hỗ trợ chẩn đoán chính xác cho bạn nhé.'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || 'your_gemini_api_key_here';

    try {
      const pythonResponse = await axios.post(
        'http://localhost:8000/chat',
        {
          api_key: geminiApiKey,
          message: message,
          history: history || []
        },
        { timeout: 15000 }
      );

      if (pythonResponse.data && pythonResponse.data.reply) {
        return res.status(200).json({
          success: true,
          reply: pythonResponse.data.reply
        });
      } else {
        throw new Error('Không nhận được phản hồi từ AI.');
      }
    } catch (apiError) {
      console.error('🔒 FastAPI /chat Connection Error:', apiError.message);
      return res.status(200).json({
        success: true,
        reply: 'Tôi hiện tại đang bảo trì. Vui lòng đặt lịch khám để được bác sĩ tư vấn trực tiếp.'
      });
    }
  } catch (error) {
    console.error('❌ Lỗi tại diagnosisController.chatWithMediConnect:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống nội bộ khi trò chuyện với AI.'
    });
  }
};

const getDiagnosisHistoryByPatientId = async (req, res) => {
  try {
    const { patient_id } = req.params;

    if (!patient_id) {
      return res.status(400).json({ error: 'Thiếu mã patient_id trong yêu cầu.' });
    }

    // Kiểm tra quyền hạn: Bệnh nhân chỉ được xem lịch sử của chính mình
    if (req.user.role === 'patient' && Number(req.user.user_id) !== Number(patient_id)) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập lịch sử của bệnh nhân này.' });
    }

    const sql = `
      SELECT prediction_id, patient_id, symptoms_text, ai_disease, ai_confidence, doctor_corrected_disease, is_verified, created_at, chat_history
      FROM AI_Predictions 
      WHERE patient_id = ? 
      ORDER BY created_at DESC
    `;

    const [rows] = await db.execute(sql, [patient_id]);
    return res.status(200).json({
      success: true,
      count: rows.length,
      records: rows
    });
  } catch (error) {
    console.error('❌ Lỗi tại diagnosisController.getDiagnosisHistoryByPatientId:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi lấy lịch sử chẩn đoán của bệnh nhân.'
    });
  }
};

module.exports = {
  createDiagnosis,
  getDiagnosisHistory,
  chatWithMediConnect,
  getDiagnosisHistoryByPatientId
};

