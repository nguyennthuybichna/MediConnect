import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Trash2, 
  QrCode, 
  Activity, 
  ShieldAlert, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  Download, 
  Sparkles,
  ArrowLeft,
  User,
  Clock,
  Printer,
  ChevronRight
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const removeAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const PrescriptionPrototype = () => {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' | 'pharmacist'
  
  // Trạng thái đơn thuốc bác sĩ kê
  const [patientInfo] = useState({
    name: 'Elena Rossi',
    age: 45,
    gender: 'Nữ',
    allergies: 'Penicillin (Phản ứng sốc phản vệ)'
  });
  
  const [aiDiagnosis] = useState('Hen phế quản cấp tính (J45.0)');
  const [doctorDiagnosis, setDoctorDiagnosis] = useState('Viêm phế quản co thắt cấp tính (J20.8)');
  
  const [medicines, setMedicines] = useState([
    { name: 'Albuterol HFA 90mcg Inhaler', dosage: '2 nhát / 4-6 giờ', usage: 'Hít khi có triệu chứng khó thở' },
    { name: 'Prednisolone 5mg', dosage: '6 viên / ngày', usage: 'Uống vào buổi sáng sau khi ăn no' },
    { name: 'Montelukast 10mg', dosage: '1 viên / tối', usage: 'Uống trước khi đi ngủ 30 phút' }
  ]);

  // Trạng thái form thêm thuốc nhanh
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedUsage, setNewMedUsage] = useState('');

  // Trạng thái Tab 2 (Dược sĩ phát thuốc)
  const [isDispensed, setIsDispensed] = useState(false);

  const qrContainerRef = useRef(null);

  // Thêm thuốc nhanh
  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    setMedicines([
      ...medicines,
      {
        name: newMedName.trim(),
        dosage: newMedDosage.trim(),
        usage: newMedUsage.trim() || 'Uống theo chỉ định của bác sĩ'
      }
    ]);
    // Reset form
    setNewMedName('');
    setNewMedDosage('');
    setNewMedUsage('');
  };

  // Xóa thuốc
  const handleDeleteMedicine = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  // Xuất file PDF chứa mã QR của đơn thuốc
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // 1. Header Phòng Khám
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(194, 65, 12); // Tông cam đất đậm (orange-700)
    doc.text('MEDICONNECT CLINIC', 20, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('123 Medical Way, Seattle | Hotline: 1900-1234 | Web: mediconnect.com', 20, 26);
    
    doc.setDrawColor(241, 245, 249);
    doc.line(20, 30, 190, 30);

    // 2. Tiêu Đề Đơn Thuốc
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 30, 30);
    doc.text('DON THUOC Y KHOA (PRESCRIPTION)', 105, 42, { align: 'center' });

    // 3. Thông Tin Bệnh Nhân
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Benh nhan (Patient): ${removeAccents(patientInfo.name)}`, 20, 54);
    doc.text(`Chan doan (Diagnosis): ${removeAccents(doctorDiagnosis)}`, 20, 60);
    doc.text(`Ngay ke (Date): ${new Date().toLocaleDateString('vi-VN')}`, 130, 54);

    // 4. Bảng Thuốc
    const columns = [
      { header: 'Ten Thuoc / Biet Duoc', dataKey: 'name' },
      { header: 'Lieu Luong', dataKey: 'dosage' },
      { header: 'Huong Dan Su Dung', dataKey: 'usage' }
    ];

    const rows = medicines.map(m => ({
      name: removeAccents(m.name),
      dosage: removeAccents(m.dosage),
      usage: removeAccents(m.usage)
    }));

    doc.autoTable({
      startY: 68,
      columns: columns,
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [234, 88, 12], // Cam đất (orange-600)
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      margin: { left: 20, right: 20 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    // 5. Chữ Ký Bác Sĩ
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('Bac si dieu tri', 135, finalY);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('(Ky va ghi ro ho ten)', 135, finalY + 4);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(194, 65, 12);
    doc.text('BS. Sarah Chen', 135, finalY + 25);

    // 6. Nhúng Mã QR vào PDF
    if (qrContainerRef.current) {
      const qrCanvas = qrContainerRef.current.querySelector('canvas');
      if (qrCanvas) {
        const qrDataUrl = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', 20, finalY - 5, 28, 28);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Quet QR de tra cuu don thuoc', 20, finalY + 27);
      }
    }

    doc.save(`Prescription_${patientInfo.name.replace(/\s+/g, '_')}.pdf`);
  };

  // URL cho mã QR quét (liên kết về trang tab 2)
  const prescriptionPublicUrl = `${window.location.origin}/prescription-prototype?tab=pharmacist`;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-850 font-sans pb-16">
      {/* HEADER TỔNG QUAN HỆ THỐNG */}
      <header className="bg-white border-b border-orange-100 py-4 px-6 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/doctor" className="w-9 h-9 rounded-xl hover:bg-stone-100 flex items-center justify-center transition-colors text-stone-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-orange-900">MediConnect</span>
            <span className="text-[10px] bg-orange-100 text-orange-850 px-2 py-0.5 rounded-full font-bold border border-orange-200">PROTOTYPE</span>
          </div>
        </div>

        {/* Nút chuyển đổi hai màn hình trực quan */}
        <div className="bg-stone-100 p-1 rounded-xl border border-stone-200 flex gap-1">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'doctor' 
                ? 'bg-white text-orange-950 shadow-sm' 
                : 'text-stone-500 hover:text-stone-750'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Màn hình Bác sĩ (Desktop)
          </button>
          <button
            onClick={() => setActiveTab('pharmacist')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pharmacist' 
                ? 'bg-white text-orange-950 shadow-sm' 
                : 'text-stone-500 hover:text-stone-750'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Trang Đích Quét QR (Mobile)
          </button>
        </div>
      </header>

      {/* CANVAS DỰ PHÒNG ẨN ĐỂ NHÚNG VÀO PDF */}
      <div ref={qrContainerRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={prescriptionPublicUrl} size={155} level="H" includeMargin={false} />
      </div>

      {/* CONTAINER CHÍNH */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* =========================================================================
           TAB 1: MÀN HÌNH BÁC SĨ (Desktop View)
           ========================================================================= */}
        {activeTab === 'doctor' && (
          <div className="bg-white rounded-2xl border border-orange-200 shadow-md overflow-hidden animate-fadeIn">
            {/* Desktop Mockup Header */}
            <div className="bg-stone-50 border-b border-orange-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wider">
                <Laptop className="w-4 h-4 text-orange-600" />
                <span>Khu Vực Chẩn Đoán & Kê Đơn (Bác sĩ Lâm Sàng)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-semibold text-stone-500">Phòng Khám 03 • Đang kết nối</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              
              {/* 1. Header Thông Tin Bệnh Nhân */}
              <div className="bg-stone-50/50 rounded-2xl border border-stone-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-800">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-extrabold text-stone-800">{patientInfo.name}</h3>
                      <span className="text-xs font-bold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-md">
                        ID: PT-84729
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Tuổi: <strong className="text-stone-700">{patientInfo.age}</strong> | Giới tính: <strong className="text-stone-700">{patientInfo.gender}</strong> | Nhóm máu: <strong className="text-stone-700">O+</strong>
                    </p>
                  </div>
                </div>

                {/* Cảnh báo dị ứng */}
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5 max-w-sm">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide block">Cảnh báo dị ứng</span>
                    <p className="text-xs font-semibold text-red-650 mt-0.5">{patientInfo.allergies}</p>
                  </div>
                </div>
              </div>

              {/* 2. So Sánh Chẩn Đoán */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Thẻ AI Đề Xuất */}
                <div className="bg-stone-50/30 rounded-2xl border border-stone-150 p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-orange-100 text-orange-900 border-l border-b border-orange-200 rounded-bl-xl px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-700 animate-pulse" />
                    AI Triage
                  </div>
                  
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">AI Đề Xuất Bệnh Lý</h4>
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-orange-200/50 rounded-xl px-4 py-2 text-sm font-extrabold text-orange-950 shadow-sm flex items-center gap-2">
                      <span>{aiDiagnosis}</span>
                    </div>
                    <span className="text-xs font-extrabold text-orange-850 bg-orange-100/50 px-2.5 py-1 rounded-lg border border-orange-150">
                      🎯 Độ tin cậy: 91%
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-455 leading-relaxed mt-2.5">
                    *Gợi ý từ AI dựa trên phân tích triệu chứng của bệnh nhân: khó thở nhẹ, đau hắt ngực trái định kỳ, nhịp thở nhanh.
                  </p>
                </div>

                {/* Thẻ Bác Sĩ Chốt Bệnh */}
                <div className="bg-[#fdfbfb] rounded-2xl border border-orange-200 p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Bác Sĩ Chốt Chẩn Đoán</h4>
                  <label className="block text-[11px] text-stone-450 font-semibold mb-1">
                    (Có thể chỉnh sửa kết luận trước khi lưu hồ sơ)
                  </label>
                  <input
                    type="text"
                    value={doctorDiagnosis}
                    onChange={(e) => setDoctorDiagnosis(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm font-bold text-stone-850 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                    placeholder="Nhập tên bệnh chẩn đoán..."
                    required
                  />
                </div>
              </div>

              {/* 3. Quản Lý Đơn Thuốc */}
              <div className="bg-[#faf6f4] rounded-2xl border border-orange-100 p-5 sm:p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Đơn Thuốc Chỉ Định</h3>
                  <p className="text-xs text-stone-500 mt-1">Kê toa thuốc, điều chỉnh liều lượng và cách dùng cho bệnh nhân.</p>
                </div>

                {/* Form thêm thuốc nhanh */}
                <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-orange-200/55 shadow-sm">
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Tên thuốc / Biệt dược</label>
                    <input
                      type="text"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="VD: Paracetamol 500mg"
                      className="w-full bg-[#fcfaf9] border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Liều lượng</label>
                    <input
                      type="text"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      placeholder="VD: 3 viên / ngày"
                      className="w-full bg-[#fcfaf9] border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Cách dùng / Hướng dẫn</label>
                    <input
                      type="text"
                      value={newMedUsage}
                      onChange={(e) => setNewMedUsage(e.target.value)}
                      placeholder="VD: Uống sau ăn sáng, tối"
                      className="w-full bg-[#fcfaf9] border border-stone-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="md:col-span-2 self-end">
                    <button
                      type="submit"
                      disabled={!newMedName.trim() || !newMedDosage.trim()}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm thuốc
                    </button>
                  </div>
                </form>

                {/* Danh sách thuốc hiện tại */}
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                        <th className="py-3 px-4 font-extrabold w-8">#</th>
                        <th className="py-3 px-4 font-extrabold">Tên thuốc</th>
                        <th className="py-3 px-4 font-extrabold">Liều lượng</th>
                        <th className="py-3 px-4 font-extrabold">Hướng dẫn sử dụng</th>
                        <th className="py-3 px-4 font-extrabold text-center w-16">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-150">
                      {medicines.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-stone-400 font-semibold">
                            Chưa có thuốc nào được kê trong toa thuốc.
                          </td>
                        </tr>
                      ) : (
                        medicines.map((m, index) => (
                          <tr key={index} className="hover:bg-orange-50/10 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-stone-400">{index + 1}</td>
                            <td className="py-3.5 px-4 font-bold text-stone-850">{m.name}</td>
                            <td className="py-3.5 px-4 font-semibold text-orange-950">{m.dosage}</td>
                            <td className="py-3.5 px-4 text-stone-600 font-medium">{m.usage}</td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleDeleteMedicine(index)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-650 hover:text-red-700 transition-colors inline-flex items-center"
                                title="Xóa thuốc"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Action Footer Area */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-orange-100 pt-6 gap-4">
                <div className="text-xs text-stone-450 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Kê toa mới nhất: {new Date().toLocaleTimeString()} Hôm nay</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Đã lưu bệnh án: ${doctorDiagnosis} với ${medicines.length} loại thuốc.`);
                    }}
                    className="flex-1 sm:flex-none border border-stone-250 hover:bg-stone-50 text-stone-800 text-xs font-bold py-3 px-5 rounded-xl transition-all"
                  >
                    Lưu Bệnh Án
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={medicines.length === 0}
                    className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-orange-600/25 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Xuất Toa Thuốc (PDF + QR)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
           TAB 2: TRANG ĐÍCH QUÉT MÃ QR (Mobile View)
           ========================================================================= */}
        {activeTab === 'pharmacist' && (
          <div className="max-w-md mx-auto animate-fadeIn">
            <div className="text-center text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
              <Smartphone className="w-4 h-4 text-orange-600" />
              <span>Giao Diện Điện Thoại Của Dược Sĩ (Mobile Mockup)</span>
            </div>

            {/* Smart Phone Shell */}
            <div className="bg-white rounded-[40px] border-[10px] border-stone-900 shadow-2xl relative overflow-hidden aspect-[9/18.5] flex flex-col justify-between">
              
              {/* Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-900 rounded-full z-40 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-2"></span>
                <span className="w-3.5 h-1 bg-slate-800 rounded-full"></span>
              </div>

              {/* PHONE SCREEN CONTENT */}
              <div className="flex-1 flex flex-col justify-between pt-10 pb-8 px-5 bg-stone-50 overflow-y-auto">
                
                {/* 1. Header Đơn Thuốc Hợp Lệ */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center border-b border-orange-100 pb-4 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md mb-2">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-stone-900 tracking-tight">Phòng Khám MediConnect</h3>
                    
                    {/* Badge đã xác thực hợp lệ */}
                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650" />
                      <span>Đơn thuốc điện tử hợp lệ</span>
                    </div>
                  </div>

                  {/* 2. Thông tin bệnh nhân & bác sĩ (Hạn chế tối đa thông tin bảo mật) */}
                  <div className="bg-white rounded-2xl border border-orange-100 p-4 space-y-3.5 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Bệnh nhân (Ẩn danh tính)</span>
                      {/* Tên ẩn một phần theo quy định bảo mật HIPAA */}
                      <span className="font-extrabold text-stone-850 text-sm mt-0.5 block">
                        {patientInfo.name.split(' ').map((n, i) => i === patientInfo.name.split(' ').length - 1 ? 'R***' : n).join(' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide block">Bác sĩ kê đơn</span>
                        <span className="font-bold text-stone-750 text-xs mt-0.5 block">BS. Sarah Chen</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide block">Ngày khám</span>
                        <span className="font-bold text-stone-750 text-xs mt-0.5 block">{new Date().toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Danh sách thuốc phát */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wide block px-1">Danh Sách Thuốc Cấp Phát</span>
                    
                    <ul className="space-y-2.5">
                      {medicines.map((m, idx) => (
                        <li key={idx} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex flex-col gap-1.5 relative overflow-hidden">
                          {/* Badge đánh dấu phát */}
                          {isDispensed && (
                            <div className="absolute right-3 top-3.5 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-100">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-extrabold text-stone-850 text-xs block pr-6">
                            {idx + 1}. {m.name}
                          </span>
                          <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-orange-350">
                            <span className="text-orange-950 font-bold text-[10px] block">
                              Liều lượng: {m.dosage}
                            </span>
                            <span className="text-stone-500 text-[10px] font-medium block">
                              Cách dùng: {m.usage}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Footer Phát Thuốc */}
                <div className="mt-8 border-t border-stone-100 pt-4 space-y-3">
                  {isDispensed ? (
                    <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-3.5 text-center text-emerald-800 space-y-1 animate-pulse">
                      <span className="text-xs font-bold block">✓ ĐÃ CẤP PHÁT THUỐC THÀNH CÔNG</span>
                      <p className="text-[9px] text-emerald-650 font-semibold">
                        Ghi nhận phát thuốc bởi dược sĩ vào lúc: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsDispensed(true)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md shadow-orange-600/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Xác nhận đã cấp phát thuốc
                    </button>
                  )}
                  
                  {isDispensed && (
                    <button
                      type="button"
                      onClick={() => setIsDispensed(false)}
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold text-[10px] py-1.5 rounded-lg transition-colors border border-stone-200"
                    >
                      Hủy trạng thái cấp phát
                    </button>
                  )}
                </div>

              </div>
              
              {/* Home Indicator */}
              <div className="bg-stone-900 py-2 flex justify-center">
                <span className="w-24 h-1 bg-stone-600 rounded-full"></span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default PrescriptionPrototype;
