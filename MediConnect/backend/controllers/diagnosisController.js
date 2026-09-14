const axios = require('axios');
const db = require('../config/db');
const { CLINICAL_DISEASES_KB, diagnoseSymptomsClinical } = require('../utils/clinicalDiagnosisEngine');

const isMeaninglessText = (text) => {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 2) return true;

  if (/^[\d\W_]+$/u.test(trimmed)) return true;

  if (/^(.)\1{2,}$/i.test(trimmed)) return true;

  const hasVowels = /[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i.test(trimmed);
  if (!hasVowels && trimmed.length >= 3) return true;

  const gibberishPatterns = [
    /^[asdfghjkl]+$/i,
    /^[qwertyuiop]+$/i,
    /^[zxcvbnm]+$/i,
    /^(abc|xyz|test|alo|asdf|123|ha|hi|he|ho)$/i
  ];
  if (gibberishPatterns.some(pat => pat.test(trimmed))) return true;

  return false;
};

const preprocessSymptoms = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\w\s\u00C0-\u1EF9,.-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

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

    if (isMeaninglessText(symptoms_text)) {
      return res.status(400).json({
        success: false,
        error: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho, đau đầu, tức ngực, mệt mỏi...).'
      });
    }

    const cleanedSymptoms = preprocessSymptoms(symptoms_text);

    if (!cleanedSymptoms || isMeaninglessText(cleanedSymptoms)) {
      return res.status(400).json({
        success: false,
        error: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho, đau đầu, tức ngực, mệt mỏi...).'
      });
    }

    let aiDisease = 'Chưa xác định';
    let aiConfidence = 0.00;

    const clinicalInference = diagnoseSymptomsClinical(cleanedSymptoms);
    if (clinicalInference) {
      aiDisease = clinicalInference.disease;
      aiConfidence = clinicalInference.confidence;
    }

    try {
      const pythonResponse = await axios.post(
        'http://localhost:8000/predict',
        { text: cleanedSymptoms },
        { timeout: 3000 }
      );

      if (pythonResponse.data && pythonResponse.data.disease) {
        aiDisease = pythonResponse.data.disease;
        aiConfidence = pythonResponse.data.confidence !== undefined
          ? pythonResponse.data.confidence
          : aiConfidence;
      }
    } catch (apiError) {
      console.warn('FastAPI Connection Warning (Dùng suy diễn lâm sàng dự phòng):', apiError.message);
    }

    const [existingRecord] = await db.execute(
      'SELECT record_id FROM MedicalRecord WHERE patient_id = ?',
      [patient_id]
    );

    if (existingRecord.length === 0) {

      await db.execute(
        `INSERT INTO MedicalRecord (patient_id, blood_type, height, weight, underlying_conditions, past_surgeries)
         VALUES (?, NULL, NULL, NULL, NULL, NULL)`,
        [patient_id]
      );
      console.log(`Đã tự động tạo hồ sơ bệnh án liên kết cho bệnh nhân ID: ${patient_id}`);
    }

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
    console.error('Lỗi tại diagnosisController.createDiagnosis:', error.message);
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
    console.error('Lỗi tại diagnosisController.getDiagnosisHistory:', error.message);
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

    if (isMeaninglessText(message)) {
      return res.status(200).json({
        success: true,
        reply: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho khan, đau đầu, đau tức ngực, mệt mỏi...) để tôi có thể hỗ trợ chẩn đoán chính xác cho bạn nhé.'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Nếu có API Key Gemini, ưu tiên gọi trực tiếp Gemini API
    if (geminiApiKey && geminiApiKey.length > 10) {
      const geminiContents = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const msg of history) {
          const role = (msg.role === 'patient' || msg.role === 'user') ? 'user' : 'model';
          geminiContents.push({
            role: role,
            parts: [{ text: msg.text || msg.content || '' }]
          });
        }
      }

      geminiContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const systemInstruction = `Bạn là MediMind AI - Trợ lý Y khoa Trí tuệ nhân tạo của hệ thống y tế MediConnect.
Nhiệm vụ của bạn là lắng nghe triệu chứng bệnh nhân, trò chuyện ân cần, đồng cảm và hỏi chi tiết theo quy trình phân loại triệu chứng lâm sàng:
1. Lắng nghe và hỏi làm rõ triệu chứng chính (thời gian khởi phát, mức độ đau/sốt, vị trí, tần suất).
2. Hỏi các triệu chứng đi kèm quan trọng (ví dụ sốt cao, khó thở, buồn nôn, dị ứng, tiền sử bệnh).
3. Đưa ra lời khuyên chăm sóc ban đầu an toàn tại nhà và cảnh báo dấu hiệu nguy hiểm cần đến bệnh viện ngay.
4. Khi đã nắm đủ triệu chứng hoặc sau vài lượt trao đổi, hãy đưa ra nhận định chẩn đoán sơ bộ tham khảo theo định dạng:
Dự đoán bệnh sơ bộ: **[Tên bệnh] (Tên tiếng Anh nếu có)**
Khuyến nghị: Đặt lịch hẹn khám với bác sĩ chuyên khoa trên MediConnect để được chẩn đoán chính xác và kê đơn thuốc an toàn.`;

      const candidateModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];

      for (const modelName of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
          const geminiRes = await axios.post(
            geminiUrl,
            {
              contents: geminiContents,
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              }
            },
            { timeout: 12000 }
          );

          if (
            geminiRes.data &&
            geminiRes.data.candidates &&
            geminiRes.data.candidates[0]?.content?.parts?.[0]?.text
          ) {
            const replyText = geminiRes.data.candidates[0].content.parts[0].text;
            return res.status(200).json({
              success: true,
              reply: replyText
            });
          }
        } catch (geminiErr) {
          console.warn(`Thử model ${modelName} không thành công:`, geminiErr.response?.data?.error?.message || geminiErr.message);
        }
      }
    }

    // 2. Dự phòng: Bộ mô phỏng y khoa thông minh dựa trên 24 bệnh lý
    const patientMessages = Array.isArray(history) ? history.filter(m => m.role === 'patient' || m.role === 'user') : [];
    const turnCount = patientMessages.length + 1;
    const allSymptomsText = patientMessages.map(m => m.text).join(' ') + ' ' + message;

    const clinicalResult = diagnoseSymptomsClinical(allSymptomsText) || {
      disease: 'Cảm lạnh chung (Common Cold)',
      confidence: 88.0,
      clinicalNote: 'Nghỉ ngơi, uống đủ nước và giữ ấm cơ thể.'
    };

    let reply = '';
    if (turnCount === 1) {
      reply = `Chào bạn, tôi là trợ lý y khoa MediConnect. Tôi đã ghi nhận triệu chứng ban đầu là: "${message}". Bạn có thể cho tôi biết triệu chứng này xuất hiện từ bao giờ và mức độ khó chịu hiện tại của bạn không?`;
    } else if (turnCount === 2) {
      reply = `Cảm ơn bạn. Bạn có kèm theo các biểu hiện nào khác không, ví dụ như sốt, ho, đau tức ngực, buồn nôn, mẩn đỏ hoặc đau mỏi cơ thể?`;
    } else if (turnCount === 3) {
      reply = `Tôi đã ghi nhận thêm các thông tin bạn vừa chia sẻ. Bạn có tiền sử bệnh lý mạn tính nào (như tiểu đường, huyết áp, dạ dày) hoặc đang dùng loại thuốc nào gần đây không?`;
    } else {
      reply = `Cảm ơn bạn đã cung cấp đầy đủ thông tin y tế.\n\n` +
        `Dựa trên các triệu chứng bạn mô tả, đây là kết quả phân tích sơ bộ từ Trợ lý Y khoa AI:\n\n` +
        `• Dự đoán sơ bộ: **${clinicalResult.disease}** (${clinicalResult.icd})\n` +
        `• Lưu ý lâm sàng: ${clinicalResult.clinicalNote}\n\n` +
        `Khuyến nghị: Bạn nên đặt lịch hẹn khám trực tiếp với Bác sĩ chuyên khoa trên MediConnect để được thăm khám chi tiết và có phác đồ điều trị an toàn nhất.`;
    }

    return res.status(200).json({
      success: true,
      reply: reply
    });
  } catch (error) {
    console.error('Lỗi tại diagnosisController.chatWithMediConnect:', error.message);
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
    console.error('Lỗi tại diagnosisController.getDiagnosisHistoryByPatientId:', error.message);
    return res.status(500).json({
      error: 'Lỗi hệ thống nội bộ khi lấy lịch sử chẩn đoán của bệnh nhân.'
    });
  }
};

const previewDiagnosis = async (req, res) => {
  try {
    const symptoms_text = req.body.symptoms_text || req.body.text || req.body.symptoms;

    if (!symptoms_text || isMeaninglessText(symptoms_text)) {
      return res.status(400).json({
        success: false,
        error: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho, đau đầu, tức ngực, mệt mỏi...).'
      });
    }

    const cleanedSymptoms = preprocessSymptoms(symptoms_text);

    // Tính toán suy diễn lâm sàng 24 bệnh lý
    const clinicalInference = diagnoseSymptomsClinical(cleanedSymptoms);
    let aiDisease = clinicalInference ? clinicalInference.disease : 'Cảm lạnh chung (Common Cold)';
    let aiConfidence = clinicalInference ? clinicalInference.confidence : 0.85;
    let icd = clinicalInference ? clinicalInference.icd : 'ICD-10: J00';
    let clinicalNote = clinicalInference ? clinicalInference.clinicalNote : '';

    try {
      const pythonResponse = await axios.post(
        'http://localhost:8000/predict',
        { text: cleanedSymptoms },
        { timeout: 3000 }
      );

      if (pythonResponse.data && pythonResponse.data.disease) {
        aiDisease = pythonResponse.data.disease;
        aiConfidence = pythonResponse.data.confidence !== undefined ? pythonResponse.data.confidence : aiConfidence;
        const matchedKB = CLINICAL_DISEASES_KB.find(item => 
          item.disease.toLowerCase().includes(aiDisease.toLowerCase().split('(')[0].trim()) ||
          aiDisease.toLowerCase().includes(item.disease.toLowerCase().split('(')[0].trim())
        );
        if (matchedKB) {
          icd = matchedKB.icd;
          clinicalNote = matchedKB.clinicalNote;
        }
      }
    } catch (apiError) {
      console.warn('FastAPI Engine không phản hồi cho bản preview, sử dụng bộ suy diễn lâm sàng 24 bệnh lý:', apiError.message);
    }

    return res.status(200).json({
      success: true,
      disease: aiDisease,
      confidence: aiConfidence,
      icd: icd,
      clinicalNote: clinicalNote,
      symptoms_text: cleanedSymptoms
    });
  } catch (error) {
    console.error('Lỗi tại diagnosisController.previewDiagnosis:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Lỗi hệ thống khi dự đoán triệu chứng thử nghiệm.'
    });
  }
};

module.exports = {
  createDiagnosis,
  getDiagnosisHistory,
  chatWithMediConnect,
  getDiagnosisHistoryByPatientId,
  previewDiagnosis
};

