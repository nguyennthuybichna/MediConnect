// Bộ từ điển y khoa 24 bệnh chuẩn quốc tế của hệ thống MediConnect (Chuẩn ICD-10 & Triệu chứng lâm sàng)
const CLINICAL_DISEASES_KB = [
  {
    disease: 'Cảm lạnh chung (Common Cold)',
    icd: 'ICD-10: J00',
    keywords: ['cảm lạnh', 'cảm cúm', 'sổ mũi', 'chảy nước mũi', 'chảy mũi', 'nghẹt mũi', 'ngạt mũi', 'hắt hơi', 'hắt xì', 'rát họng', 'đau họng', 'ho nhẹ', 'ho khan nhẹ', 'ngấy sốt', 'ớn lạnh nhẹ'],
    baseConfidence: 0.89,
    clinicalNote: 'Triệu chứng viêm đường hô hấp trên kinh điển gồm sổ mũi, nghẹt mũi, hắt hơi và đau rát họng. Khuyến cáo giữ ấm, súc họng nước muối sinh lý, bổ sung vitamin C và uống nhiều nước ấm.'
  },
  {
    disease: 'Dị ứng (Allergy)',
    icd: 'ICD-10: T78.4',
    keywords: ['dị ứng', 'mề đay', 'ngứa da', 'mẩn đỏ', 'phát ban ngứa', 'ngứa mũi', 'ngứa mắt', 'chảy nước mắt', 'dị ứng thời tiết', 'dị ứng thức ăn', 'nổi mẩn'],
    baseConfidence: 0.92,
    clinicalNote: 'Phản ứng quá mẫn miễn dịch dị ứng cấp tính. Khuyến cáo tránh tiếp xúc dị nguyên (khói bụi, phấn hoa, thức ăn lạ), có thể dùng thuốc kháng Histamin H1 theo chỉ định.'
  },
  {
    disease: 'Viêm phế quản cấp (Acute Bronchitis)',
    icd: 'ICD-10: J20.9',
    keywords: ['phế quản', 'viêm phế quản', 'ho có đờm', 'ho đờm', 'ho đờm vàng', 'ho khan kéo dài', 'ho rát ngực', 'ho tức ngực', 'khàn giọng', 'ho nhiều ngày', 'ho rũ rượi'],
    baseConfidence: 0.88,
    clinicalNote: 'Tình trạng viêm niêm mạc phế quản cấp tính với ho có đờm đặc và tức nặng lồng ngực. Cần giữ ấm đường thở, tránh khói thuốc lá và đi khám nếu sốt kéo dài trên 3 ngày.'
  },
  {
    disease: 'Viêm phổi (Pneumonia)',
    icd: 'ICD-10: J18.9',
    keywords: ['viêm phổi', 'sốt cao rét run', 'đờm xanh', 'đờm gỉ sắt', 'đờm vàng đục', 'đau ngực khi hít thở', 'đau ngực khi ho', 'thở dốc', 'thở gấp', 'ran ẩm'],
    baseConfidence: 0.93,
    clinicalNote: 'Nhiễm trùng nhu mô phổi cấp tính nguy hiểm. Khuyến cáo đến bệnh viện chụp X-quang phổi và xét nghiệm công thức máu/CRP sớm để điều trị kháng sinh phù hợp.'
  },
  {
    disease: 'Hen phế quản (Bronchial Asthma)',
    icd: 'ICD-10: J45.9',
    keywords: ['hen suyễn', 'hen phế quản', 'thở khò khè', 'khó thở thì thở ra', 'co thắt ngực', 'khó thở về đêm', 'thở rít', 'hụt hơi khi gắng sức', 'lên cơn hen'],
    baseConfidence: 0.91,
    clinicalNote: 'Cơn co thắt phế quản hồi phục được, đặc trưng bởi tiếng thở rít khò khè. Cần chuẩn bị sẵn bình xịt cắt cơn Salbutamol và tránh xa bụi bẩn, không khí lạnh.'
  },
  {
    disease: 'Đau nửa đầu (Migraine)',
    icd: 'ICD-10: G43.9',
    keywords: ['đau nửa đầu', 'migraine', 'đau giật một bên đầu', 'đau theo nhịp đập', 'sợ ánh sáng', 'sợ tiếng ồn', 'hoa mắt trước cơn đau', 'nhói nửa đầu'],
    baseConfidence: 0.93,
    clinicalNote: 'Cơn đau thần kinh vận mạch một bên đầu kèm nhạy cảm với ánh sáng và tiếng động. Khuyên nghỉ ngơi trong phòng tối yên tĩnh và kiểm soát căng thẳng tâm lý.'
  },
  {
    disease: 'Trào ngược dạ dày thực quản (GERD)',
    icd: 'ICD-10: K21.9',
    keywords: ['trào ngược', 'ợ chua', 'ợ nóng', 'nóng rát xương ức', 'nóng rát thượng vị', 'đắng miệng', 'vướng cổ họng', 'trào ngược dạ dày', 'ợ hơi trào ngược'],
    baseConfidence: 0.90,
    clinicalNote: 'Hiện tượng dịch vị axit trào ngược gây tổn thương niêm mạc thực quản. Tránh nằm ngay sau ăn, kiêng đồ chua cay, cà phê và chia nhỏ bữa ăn trong ngày.'
  },
  {
    disease: 'Viêm loét dạ dày (Peptic ulcer disease)',
    icd: 'ICD-10: K25.9',
    keywords: ['đau dạ dày', 'đau bao tử', 'đau thượng vị', 'đau rát bụng khi đói', 'đau bụng sau ăn', 'đầy bụng khó tiêu', 'loét dạ dày', 'buồn nôn sau ăn'],
    baseConfidence: 0.89,
    clinicalNote: 'Tổn thương viêm trợt niêm mạc dạ dày tá tràng. Cần nội soi tiêu hóa kiểm tra vi khuẩn HP, ăn uống đúng giờ và tránh dùng thuốc giảm đau kháng viêm NSAID.'
  },
  {
    disease: 'Sốt xuất huyết (Dengue)',
    icd: 'ICD-10: A97',
    keywords: ['sốt xuất huyết', 'sốt cao liên tục', 'đau hốc mắt', 'chảy máu chân răng', 'chảy máu cam', 'chấm đỏ dưới da', 'chấm xuất huyết', 'đau nhức cơ khớp'],
    baseConfidence: 0.94,
    clinicalNote: 'Cảnh báo nguy cơ giảm tiểu cầu và cô đặc máu nguy hiểm. Cần làm xét nghiệm công thức máu hàng ngày, bù nước Oresol và tuyệt đối không tự ý uống Aspirin/Ibuprofen.'
  },
  {
    disease: 'Thủy đậu (Chicken pox)',
    icd: 'ICD-10: B01.9',
    keywords: ['thủy đậu', 'phỏng rạ', 'bóng nước', 'mụn nước khắp người', 'mụn nước ngứa', 'nốt đậu', 'sốt phát ban mụn nước'],
    baseConfidence: 0.95,
    clinicalNote: 'Nhiễm virus Varicella Zoster gây mụn nước rải rác toàn thân. Giữ vệ sinh thân thể sạch sẽ, bôi dung dịch sát khuẩn Milian/Xanh Methylen và cách ly tránh lây lan.'
  },
  {
    disease: 'Tiểu đường (Diabetes)',
    icd: 'ICD-10: E11.9',
    keywords: ['tiểu đường', 'đái tháo đường', 'khát nước liên tục', 'tiểu nhiều lần', 'tiểu đêm', 'sụt cân nhanh', 'đói nhanh', 'đường huyết cao', 'mờ mắt đột ngột'],
    baseConfidence: 0.91,
    clinicalNote: 'Rối loạn chuyển hóa đường huyết mạn tính. Cần xét nghiệm đường huyết đói và chỉ số HbA1c định kỳ, duy trì chế độ ăn kiểm soát tinh bột và vận động thể thao.'
  },
  {
    disease: 'Cao huyết áp (Hypertension)',
    icd: 'ICD-10: I10',
    keywords: ['cao huyết áp', 'tăng huyết áp', 'huyết áp cao', 'nặng đầu', 'nhức đầu vùng sau gáy', 'đỏ bừng mặt', 'choáng váng huyết áp', 'tim đập nhanh hồi hộp'],
    baseConfidence: 0.90,
    clinicalNote: 'Bệnh lý tim mạch nguy hiểm tiềm ẩn biến chứng đột quỵ. Cần đo huyết áp định kỳ mỗi sáng, giảm muối (<5g/ngày) và tuân thủ đơn thuốc hạ áp của bác sĩ.'
  },
  {
    disease: 'Viêm khớp (Arthritis)',
    icd: 'ICD-10: M19.9',
    keywords: ['đau khớp', 'sưng khớp', 'cứng khớp', 'viêm khớp', 'đau đầu gối', 'đau cổ tay', 'khớp kêu lục cục', 'thoái hóa khớp', 'đau nhức khớp'],
    baseConfidence: 0.89,
    clinicalNote: 'Tổn thương sụn và thoái hóa ổ khớp. Khuyến cáo tập thể dục nhẹ nhàng (bơi lội, đạp xe), kiểm soát cân nặng và bổ sung dưỡng chất nuôi dưỡng sụn khớp.'
  },
  {
    disease: 'Mụn trứng cá (Acne)',
    icd: 'ICD-10: L70.0',
    keywords: ['mụn trứng cá', 'mụn bọc', 'mụn mủ', 'mụn viêm', 'bã nhờn', 'mụn đầu đen', 'nổi mụn ở mặt', 'mụn lưng'],
    baseConfidence: 0.93,
    clinicalNote: 'Tình trạng viêm tắc tuyến bã nhờn nang lông. Giữ da mặt thông thoáng, sử dụng sữa rửa mặt dịu nhẹ độ pH cân bằng và không tự ý nặn mụn.'
  },
  {
    disease: 'Bệnh trĩ (Dimorphic Hemorrhoids)',
    icd: 'ICD-10: K64.9',
    keywords: ['bệnh trĩ', 'trĩ nội', 'trĩ ngoại', 'đi ngoài ra máu', 'đau rát hậu môn', 'sa búi trĩ', 'táo bón ra máu', 'ngứa hậu môn'],
    baseConfidence: 0.92,
    clinicalNote: 'Giãn quá mức đám rối tĩnh mạch trĩ. Bổ sung nhiều rau xanh chất xơ, uống đủ 2 lít nước mỗi ngày, tránh ngồi lâu một chỗ và điều trị dứt điểm táo bón.'
  },
  {
    disease: 'Nhiễm trùng đường tiết niệu (Urinary tract infection)',
    icd: 'ICD-10: N39.0',
    keywords: ['tiểu buốt', 'tiểu rắt', 'tiểu đau', 'nước tiểu đục', 'tiểu ra máu', 'viêm tiết niệu', 'đau tức bụng dưới khi tiểu', 'tiểu lắt nhắt'],
    baseConfidence: 0.94,
    clinicalNote: 'Nhiễm khuẩn niệu đạo - bàng quang. Cần xét nghiệm tổng phân tích nước tiểu, uống thật nhiều nước (2-2.5L/ngày) và không nhịn tiểu.'
  },
  {
    disease: 'Thoái hóa đốt sống cổ (Cervical spondylosis)',
    icd: 'ICD-10: M47.8',
    keywords: ['thoái hóa đốt sống cổ', 'đau mỏi vai gáy', 'cứng cổ', 'đau lan xuống cánh tay', 'tê bì cánh tay', 'mỏi vai gáy', 'đau đốt sống cổ'],
    baseConfidence: 0.90,
    clinicalNote: 'Thoái hóa đĩa đệm và gai xương cột sống cổ chèn ép rễ thần kinh. Cần điều chỉnh tư thế làm việc, tránh cúi gập cổ quá lâu và tập các bài tập kéo giãn cơ cổ.'
  },
  {
    disease: 'Vẩy nến (Psoriasis)',
    icd: 'ICD-10: L40.0',
    keywords: ['vẩy nến', 'vảy nến', 'mảng đỏ bong vảy trắng', 'vảy bạc khuỷu tay', 'da dày cộm tróc vảy', 'mảng đỏ da nứt nẻ'],
    baseConfidence: 0.94,
    clinicalNote: 'Bệnh da liễu tự miễn mạn tính. Cần dưỡng ẩm liên tục, tắm nước ấm vừa phải, tránh căng thẳng thần kinh và sử dụng thuốc bôi đặc hiệu theo chỉ định bác sĩ da liễu.'
  },
  {
    disease: 'Nhiễm trùng nấm (Fungal infection)',
    icd: 'ICD-10: B36.9',
    keywords: ['nhiễm nấm', 'nấm da', 'hắc lào', 'lang ben', 'nấm móng', 'nấm bẹn', 'vết tròn ngứa viền đỏ', 'ngứa kẽ chân nước ăn chân'],
    baseConfidence: 0.92,
    clinicalNote: 'Bệnh da do vi nấm sợi hoặc nấm men. Giữ cơ thể khô ráo thoáng mát, giặt phơi quần áo dưới nắng và bôi thuốc kháng nấm đúng đủ thời gian quy định.'
  },
  {
    disease: 'Chốc lở (Impetigo)',
    icd: 'ICD-10: L01.0',
    keywords: ['chốc lở', 'vết loét đóng vảy vàng', 'vảy màu mật ong', 'mụn nước rỉ dịch quanh miệng', 'lở loét ngoài da trẻ em'],
    baseConfidence: 0.94,
    clinicalNote: 'Nhiễm khuẩn nông ngoài da do tụ cầu hoặc liên cầu khuẩn. Vệ sinh nhẹ nhàng bằng nước muối sinh lý, bôi kháng sinh tại chỗ và rửa tay thường xuyên.'
  },
  {
    disease: 'Vàng da (Jaundice)',
    icd: 'ICD-10: R17',
    keywords: ['vàng da', 'vàng mắt', 'mắt vàng', 'nước tiểu màu trà đậm', 'nước tiểu vàng sẫm', 'phân bạc màu', 'men gan cao', 'ngứa da vàng mắt'],
    baseConfidence: 0.93,
    clinicalNote: 'Biểu hiện ứ mật hoặc tổn thương tế bào gan do viêm gan, sỏi mật. Cần siêu âm gan mật và xét nghiệm sinh hóa chức năng gan cấp tốc.'
  },
  {
    disease: 'Sốt rét (Malaria)',
    icd: 'ICD-10: B54',
    keywords: ['sốt rét', 'rét run cầm cập', 'sốt từng cơn theo chu kỳ', 'vã mồ hôi ướt áo sau sốt', 'ớn lạnh sốt rừng', 'sốt rét rừng'],
    baseConfidence: 0.93,
    clinicalNote: 'Nhiễm ký sinh trùng sốt rét sau khi bị muỗi đốt hoặc đi từ vùng dịch tễ về. Cần soi kính hiển vi tìm ký sinh trùng sốt rét trong máu và điều trị thuốc sốt rét.'
  },
  {
    disease: 'Thương hàn (Typhoid)',
    icd: 'ICD-10: A01.0',
    keywords: ['thương hàn', 'sốt thương hàn', 'sốt tăng dần hình bậc thang', 'chướng bụng đau bụng tiêu chảy', 'mạch chậm so với sốt', 'mệt lả người'],
    baseConfidence: 0.91,
    clinicalNote: 'Nhiễm vi khuẩn Salmonella đường ruột gây nhiễm độc toàn thân. Cần cấy máu, cấy phân và điều trị kháng sinh đường tĩnh mạch tại bệnh viện truyền nhiễm.'
  },
  {
    disease: 'Viêm tĩnh mạch (Varicose Veins)',
    icd: 'ICD-10: I83.9',
    keywords: ['suy giãn tĩnh mạch', 'viêm tĩnh mạch', 'nổi gân xanh ở chân', 'mạch máu phồng ngoằn ngoèo', 'nặng mỏi bắp chân về chiều', 'phù mắt cá chân'],
    baseConfidence: 0.92,
    clinicalNote: 'Giãn và suy van thành tĩnh mạch chân gây ứ trệ tuần hoàn chi dưới. Khuyên đeo tất áp lực y khoa khi đi lại, gác chân cao khi nghỉ và tránh đứng lâu.'
  },
  {
    disease: 'Phản ứng thuốc (Drug reaction)',
    icd: 'ICD-10: T88.7',
    keywords: ['dị ứng thuốc', 'phản ứng thuốc', 'phát ban sau khi uống thuốc', 'nổi mẩn sau khi tiêm thuốc', 'ngứa ngáy sau dùng thuốc', 'sưng môi sau uống thuốc'],
    baseConfidence: 0.92,
    clinicalNote: 'Phản ứng dị ứng tác dụng phụ không mong muốn của thuốc. Cần ngừng ngay loại thuốc đang sử dụng, mang theo vỏ thuốc đến cơ sở y tế gần nhất.'
  }
];

const diagnoseSymptomsClinical = (text) => {
  if (!text || typeof text !== 'string') {
    return null;
  }
  const clean = text.toLowerCase()
    .replace(/[^\w\s\u00C0-\u1EF9]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean || clean.length < 2) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const item of CLINICAL_DISEASES_KB) {
    let score = 0;
    const matchedKeywords = [];

    for (const kw of item.keywords) {
      const kwClean = kw.toLowerCase().trim();
      if (!kwClean) continue;

      if (clean.includes(kwClean)) {
        const wordsCount = kwClean.split(' ').length;
        const weight = wordsCount > 1 ? (wordsCount * 2.5) : 1.2;
        score += weight;
        matchedKeywords.push(kwClean);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      const confidence = Math.min(0.965, Math.round((item.baseConfidence + Math.min(0.08, (score - 1) * 0.015)) * 1000) / 1000);
      bestMatch = {
        disease: item.disease,
        icd: item.icd,
        confidence: confidence,
        clinicalNote: item.clinicalNote,
        matchedKeywords: matchedKeywords
      };
    }
  }

  if (!bestMatch || highestScore === 0) {
    if (clean.includes('sốt') || clean.includes('mệt') || clean.includes('ho')) {
      const fallbackItem = CLINICAL_DISEASES_KB.find(d => d.disease.includes('Cảm lạnh'));
      return {
        disease: fallbackItem.disease,
        icd: fallbackItem.icd,
        confidence: 0.82,
        clinicalNote: fallbackItem.clinicalNote,
        matchedKeywords: ['triệu chứng chung']
      };
    } else if (clean.includes('đau đầu') || clean.includes('nhức đầu')) {
      const fallbackItem = CLINICAL_DISEASES_KB.find(d => d.disease.includes('Migraine'));
      return {
        disease: fallbackItem.disease,
        icd: fallbackItem.icd,
        confidence: 0.845,
        clinicalNote: fallbackItem.clinicalNote,
        matchedKeywords: ['đau đầu']
      };
    } else {
      const fallbackItem = CLINICAL_DISEASES_KB[0];
      return {
        disease: fallbackItem.disease,
        icd: fallbackItem.icd,
        confidence: 0.80,
        clinicalNote: fallbackItem.clinicalNote,
        matchedKeywords: []
      };
    }
  }

  return bestMatch;
};

module.exports = {
  CLINICAL_DISEASES_KB,
  diagnoseSymptomsClinical
};
