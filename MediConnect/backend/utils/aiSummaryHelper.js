const axios = require('axios');

/**
 * Thuật toán NLP / LLM Rút trích và Tóm tắt Bệnh sử Bệnh nhân (AI Patient Summary)
 * 
 * @param {Array} historyData - Danh sách bản ghi từ bảng AI_Predictions với is_verified = 1
 *        [{ created_at, symptoms_text, doctor_corrected_disease }, ...]
 * @param {string} patientName - Tên bệnh nhân
 * @returns {Promise<string>} Đoạn văn tóm tắt bệnh sử 3-4 dòng súc tích cho bác sĩ
 */
const generateAISummary = async (historyData, patientName = 'Bệnh nhân') => {
  // 1. Trường hợp bệnh nhân chưa có lịch sử khám xác thực
  if (!historyData || historyData.length === 0) {
    return `Bệnh nhân **${patientName}** chưa ghi nhận tiền sử bệnh lý xác thực trong hệ thống MediConnect. Đây là hồ sơ khám mới hoặc các kết quả trước đây chưa có chẩn đoán lâm sàng được phê duyệt. Bác sĩ vui lòng thực hiện thăm khám tổng quát và khai thác kỹ triệu chứng ban đầu.`;
  }

  // 2. Nếu có cấu hình OPENAI_API_KEY, gọi mô hình OpenAI LLM
  if (process.env.OPENAI_API_KEY) {
    try {
      const historyContext = historyData.map((item, idx) => {
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Không rõ ngày';
        return `- Lần ${idx + 1} (${dateStr}): Triệu chứng: "${item.symptoms_text}" -> Bác sĩ kết luận: "${item.doctor_corrected_disease || 'Chưa rõ'}"`;
      }).join('\n');

      const prompt = `Bạn là trợ lý AI y khoa chuyên nghiệp của hệ thống MediConnect.
Dưới đây là toàn bộ lịch sử bệnh án đã được bác sĩ xác thực của bệnh nhân "${patientName}":
${historyContext}

YÊU CẦU:
Hãy viết một đoạn tóm tắt bệnh sử súc tích đúng 3-4 câu (khoảng 60-90 từ) dành riêng cho Bác sĩ điều trị.
- Tóm tắt các bệnh lý mãn tính hoặc bệnh lý lặp lại nhiều lần trong quá khứ (in đậm tên bệnh bằng cú pháp **Tên Bệnh**).
- Nêu các triệu chứng tái diễn thường gặp nhất.
- Đưa ra nhận xét diễn tiến lâm sàng và lưu ý ngắn gọn khi ra phác đồ mới.
- Văn phong y khoa nghiêm túc, chuẩn mực, bằng tiếng Việt.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Bạn là chuyên gia tóm tắt hồ sơ bệnh án điện tử y khoa.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 250
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      const aiText = response.data?.choices?.[0]?.message?.content?.trim();
      if (aiText) {
        return aiText;
      }
    } catch (llmError) {
      console.warn('⚠️ Gọi OpenAI API thất bại hoặc quá hạn, chuyển sang thuật toán NLP tổng hợp nội bộ:', llmError.message);
    }
  }

  // 3. Thuật toán NLP tổng hợp bệnh sử dựa trên quy tắc chuyên gia y tế (Rule-based NLP Engine)
  return buildAlgorithmicSummary(historyData, patientName);
};

/**
 * Thuật toán phân tích rút trích từ khóa và xâu chuỗi bệnh sử (NLP Rule-based Engine)
 */
const buildAlgorithmicSummary = (historyData, patientName) => {
  // A. Thống kê tần suất xuất hiện của các bệnh lý đã xác thực
  const diseaseCounts = {};
  const diseaseList = [];

  historyData.forEach(item => {
    const disease = (item.doctor_corrected_disease || '').trim();
    if (disease && disease !== 'Chưa có kết luận' && disease !== 'Chưa rõ') {
      diseaseCounts[disease] = (diseaseCounts[disease] || 0) + 1;
      if (!diseaseList.includes(disease)) {
        diseaseList.push(disease);
      }
    }
  });

  // B. Rút trích các triệu chứng chủ đạo từ symptoms_text
  const symptomKeywordsMap = [
    { key: 'ho', label: 'ho kéo dài/ho khan' },
    { key: 'sốt', label: 'sốt định kỳ' },
    { key: 'khó thở', label: 'khó thở khi gắng sức' },
    { key: 'ngực', label: 'đau tức ngực' },
    { key: 'huyết áp', label: 'dao động huyết áp' },
    { key: 'mệt mỏi', label: 'mệt mỏi suy nhược' },
    { key: 'đau đầu', label: 'đau đầu hoa mắt' },
    { key: 'khớp', label: 'đau nhức xương khớp' },
    { key: 'đờm', label: 'tăng tiết đờm nhớt' },
    { key: 'dị ứng', label: 'phản ứng dị ứng cơ địa' },
    { key: 'đường huyết', label: 'rối loạn chỉ số đường huyết' }
  ];

  const detectedSymptoms = new Set();
  const allSymptomsText = historyData.map(h => (h.symptoms_text || '').toLowerCase()).join(' ');

  symptomKeywordsMap.forEach(({ key, label }) => {
    if (allSymptomsText.includes(key)) {
      detectedSymptoms.add(label);
    }
  });

  const symptomList = Array.from(detectedSymptoms);
  const totalVisits = historyData.length;
  const latestVisitDate = historyData[0]?.created_at
    ? new Date(historyData[0].created_at).toLocaleDateString('vi-VN')
    : 'gần đây';

  // C. Xây dựng đoạn tóm tắt 3-4 câu chặt chẽ
  const lines = [];

  // Câu 1: Tiền sử chẩn đoán xác thực
  if (diseaseList.length > 0) {
    const boldDiseases = diseaseList.slice(0, 3).map(d => `**${d}**`).join(', ');
    lines.push(
      `Bệnh nhân **${patientName}** có tiền sử ghi nhận ${totalVisits} lượt khám với chẩn đoán xác thực gồm ${boldDiseases} (khám gần nhất ngày ${latestVisitDate}).`
    );
  } else {
    lines.push(
      `Bệnh nhân **${patientName}** đã thực hiện ${totalVisits} lượt khám trước đây trong hệ thống y tế MediConnect.`
    );
  }

  // Câu 2: Triệu chứng tái diễn
  if (symptomList.length > 0) {
    const symptomSummary = symptomList.slice(0, 3).join(', ');
    lines.push(
      `Hồ sơ ghi nhận các triệu chứng thường gặp và tái phát định kỳ gồm: **${symptomSummary}**.`
    );
  } else {
    lines.push(
      `Các triệu chứng ghi nhận chủ yếu xuất hiện theo đợt cấp tính, cần đối chiếu với thể trạng hiện tại.`
    );
  }

  // Câu 3: Đánh giá diễn tiến & tính chất bệnh lý
  const hasChronic = diseaseList.some(d => 
    /đái tháo đường|tiểu đường|huyết áp|hen|copd|tim mạch|mãn tính|viêm phế quản/i.test(d)
  );

  if (hasChronic) {
    lines.push(
      `Diễn tiến bệnh lý có yếu tố nền mãn tính, có nguy cơ tái bùng phát khi thay đổi thời tiết hoặc gián đoạn phác đồ dùng thuốc.`
    );
  } else {
    lines.push(
      `Diễn tiến bệnh lý đáp ứng tốt với các đợt điều trị trước đó, chưa ghi nhận biến chứng ngoại khoa nghiêm trọng.`
    );
  }

  // Câu 4: Khuyến nghị AI hỗ trợ quyết định lâm sàng
  lines.push(
    `Khuyến nghị Bác sĩ kiểm tra tiền sử dị ứng thuốc và liều lượng điều trị trước đó trước khi chỉ định đơn thuốc mới.`
  );

  return lines.join(' ');
};

module.exports = {
  generateAISummary
};
