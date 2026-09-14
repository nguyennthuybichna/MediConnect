import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  QrCode,
  Activity,
  AlertTriangle,
  Smartphone,
  Laptop,
  CheckCircle2,
  Download,
  Sparkles,
  ArrowLeft,
  User,
  Clock,
  Printer,
  ChevronRight,
  Brain,
  Bot,
  ShieldCheck,
  ExternalLink,
  Check
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoRegularBase64 } from '../utils/vietnameseFont';
import AISummaryCard from '../components/AISummaryCard';

const PrescriptionPrototype = () => {

  const [activeTab, setActiveTab] = useState('doctor');

  const [patientInfo] = useState({
    name: 'Robert MacMillan',
    initials: 'RM',
    age: 45,
    gender: 'Male',
    id: '#MR-84729',
    allergy: 'Penicillin'
  });

  const [aiAnalysis] = useState({
    diagnosis: 'Acute Bronchitis',
    confidence: 88,
    description: 'Based on presented symptoms (persistent cough, mild fever, chest congestion) and patient history.'
  });

  const [clinicalConclusion, setClinicalConclusion] = useState(
    'Confirmed acute bronchitis. Patient advised to rest and maintain hydration. Prescribing bronchodilator and cough suppressant.'
  );

  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Albuterol Sulfate',
      dosage: '90mcg Inhaler',
      instructions: '2 puffs every 4-6 hours as needed for shortness of breath.'
    },
    {
      id: 2,
      name: 'Benzonatate',
      dosage: '100mg Capsule',
      instructions: 'Take 1 capsule three times daily as needed for cough. Do not chew.'
    }
  ]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');

  const [toastMessage, setToastMessage] = useState(null);

  const [isDispensed, setIsDispensed] = useState(false);

  const qrContainerRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddMedicine = (e) => {
    if (e) e.preventDefault();
    if (!newMedName.trim()) {
      showToast('⚠️ Vui lòng nhập tên thuốc!');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || 'Theo chỉ định',
      instructions: newMedInstructions.trim() || 'Uống theo hướng dẫn của bác sĩ.'
    };

    setMedicines([...medicines, newItem]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedInstructions('');
    showToast(`✓ Đã thêm thuốc ${newItem.name}`);
  };

  const handleDeleteMedicine = (id) => {
    const medToDelete = medicines.find(m => m.id === id);
    setMedicines(medicines.filter(m => m.id !== id));
    if (medToDelete) {
      showToast(`Đã xóa ${medToDelete.name}`);
    }
  };

  const handleSaveDraft = () => {
    showToast('✓ Đã lưu bản nháp đơn thuốc thành công!');
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      if (robotoRegularBase64) {
        try {
          doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.setFont('Roboto', 'normal');
        } catch (fontErr) {
          console.warn('Lỗi load font tiếng Việt:', fontErr);
        }
      }

      doc.setFontSize(20);
      doc.setTextColor(217, 114, 81);
      doc.text('MEDICONNECT CLINIC', 20, 20);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('123 Medical Way, Seattle, WA 98109 | Hotline: 1900-1234 | Web: mediconnect.com', 20, 26);

      doc.setDrawColor(235, 220, 214);
      doc.line(20, 30, 190, 30);

      doc.setFontSize(15);
      doc.setTextColor(45, 37, 34);
      doc.text('PRESCRIPTION / TOA THUỐC Y KHOA', 105, 42, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(70, 60, 56);
      doc.text(`Patient (Bệnh nhân): ${patientInfo.name} (${patientInfo.gender}, ${patientInfo.age} yrs)`, 20, 52);
      doc.text(`Patient ID: ${patientInfo.id}`, 20, 58);
      doc.text(`Diagnosis (Chẩn đoán): ${aiAnalysis.diagnosis}`, 20, 64);
      doc.text(`Date (Ngày kê): ${new Date().toLocaleDateString('en-US')}`, 140, 52);
      doc.text(`Allergies (Dị ứng): ${patientInfo.allergy}`, 140, 58);

      const columns = [
        { header: 'Medication', dataKey: 'name' },
        { header: 'Dosage', dataKey: 'dosage' },
        { header: 'Instructions', dataKey: 'instructions' }
      ];

      const rows = medicines.map(m => ({
        name: m.name,
        dosage: m.dosage,
        instructions: m.instructions
      }));

      autoTable(doc, {
        startY: 72,
        columns: columns,
        body: rows,
        theme: 'grid',
        headStyles: {
          fillColor: [217, 114, 81],
          textColor: [255, 255, 255],
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        margin: { left: 20, right: 20 }
      });

      const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 72) + 12;

      doc.setFontSize(9);
      doc.setTextColor(90, 80, 75);
      doc.text('Clinical Conclusion / Lời dặn:', 20, finalY);
      const splitConclusion = doc.splitTextToSize(clinicalConclusion, 105);
      doc.text(splitConclusion, 20, finalY + 6);

      doc.setFontSize(10);
      doc.setTextColor(45, 37, 34);
      doc.text('Doctor Signature / Bác sĩ', 140, finalY);

      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text('(Signed electronically)', 140, finalY + 5);

      doc.setFontSize(10);
      doc.setTextColor(217, 114, 81);
      doc.text('Dr. Sarah Chen, MD', 140, finalY + 22);

      if (qrContainerRef.current) {
        const qrCanvas = qrContainerRef.current.querySelector('canvas');
        if (qrCanvas) {
          const qrDataUrl = qrCanvas.toDataURL('image/png');
          doc.addImage(qrDataUrl, 'PNG', 140, finalY + 28, 25, 25);

          doc.setFontSize(7);
          doc.setTextColor(140, 140, 140);
          doc.text('Scan QR to verify prescription', 140, finalY + 56);
        }
      }

      doc.save(`Prescription_${patientInfo.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Lỗi xuất PDF:', err);
    }
  };

  const handlePrintPrescription = () => {
    if (medicines.length === 0) {
      showToast('⚠️ Vui lòng thêm ít nhất 1 loại thuốc vào đơn!');
      return;
    }

    generatePDF();

    showToast('✓ Đã xuất PDF và chuyển sang trang quét mã QR!');
    setActiveTab('pharmacist');
  };

  const prescriptionPublicUrl = `${window.location.origin}/prescription/public/demo_appointment_id`;

  const handleDownloadQRImage = () => {
    try {
      const qrCanvas = document.getElementById('prototype-qr-canvas') ||
                       (qrContainerRef.current ? qrContainerRef.current.querySelector('canvas') : null);
      if (!qrCanvas) {
        showToast('⚠️ Không tìm thấy canvas mã QR!');
        return;
      }
      const dataUrl = qrCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QRCode_Prescription_${patientInfo.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('✓ Đã tải ảnh mã QR (PNG) thành công!');
    } catch (err) {
      console.error('Lỗi khi tải ảnh mã QR:', err);
      showToast('⚠️ Lỗi khi xuất ảnh mã QR');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#2d2522] font-sans pb-16 antialiased">

      {toastMessage && (
        <div className="fixed top-5 right-5 bg-[#d97251] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 animate-bounce text-xs font-bold border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-orange-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="bg-white border-b border-[#f0e4dd] py-3.5 px-6 sticky top-0 z-40 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/doctor" className="w-9 h-9 rounded-xl hover:bg-[#f5ede8] flex items-center justify-center transition-colors text-[#5c4a43]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#d97251] flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#2d2522]">MediConnect</span>
            <span className="text-[10px] bg-[#fbf0eb] text-[#d97251] px-2 py-0.5 rounded-full font-bold border border-[#f5ded5]">
              E-PRESCRIPTION
            </span>
          </div>
        </div>

        <div className="bg-[#f5ede8] p-1 rounded-2xl border border-[#ebdcd5] flex gap-1">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'doctor'
                ? 'bg-white text-[#2d2522] shadow-xs'
                : 'text-[#8c7e77] hover:text-[#2d2522]'
            }`}
          >
            <Laptop className="w-4 h-4 text-[#d97251]" />
            <span>1. Kê đơn thuốc (Trước khi in)</span>
          </button>
          <button
            onClick={() => setActiveTab('pharmacist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pharmacist'
                ? 'bg-white text-[#2d2522] shadow-xs'
                : 'text-[#8c7e77] hover:text-[#2d2522]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#d97251]" />
            <span>2. Trang quét mã QR (Sau khi in)</span>
          </button>
        </div>
      </header>

      <div ref={qrContainerRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={prescriptionPublicUrl} size={180} level="H" includeMargin={false} />
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-6">

        {activeTab === 'doctor' && (
          <div className="bg-white rounded-3xl border border-[#ebdcd5] shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3e7e1] pb-6">

              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-full bg-[#f3ede8] border border-[#e5dcd6] flex items-center justify-center font-bold text-[#5c4a43] text-base shadow-xs shrink-0">
                  {patientInfo.initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2d2522] tracking-tight">{patientInfo.name}</h2>
                  <p className="text-xs text-[#8c7e77] font-medium mt-0.5">
                    {patientInfo.age} years old • {patientInfo.gender} • ID: {patientInfo.id}
                  </p>
                </div>
              </div>

              <div className="bg-[#feebeb] border border-[#fbd0d0] text-[#a82a2a] px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs self-start sm:self-auto">
                <AlertTriangle className="w-4 h-4 text-[#c53030] shrink-0" />
                <span>Severe Allergy: {patientInfo.allergy}</span>
              </div>
            </div>

            <AISummaryCard
              patient={{
                name: patientInfo.name,
                id: patientInfo.id,
                age: patientInfo.age,
                gender: patientInfo.gender,
                allergies: [{ name: patientInfo.allergy, severity: 'Phản ứng sốc phản vệ' }],
                symptoms: 'Ho dai dẳng 5 ngày, khó thở nhẹ khi vận động, tức ngực',
                chronicConditions: [{ name: 'Viêm phế quản mãn tính', dx: '2021' }]
              }}
              onInsertToNotes={(summaryTxt) => {
                setClinicalConclusion(prev => prev ? `${prev}\n\n[Tiền sử bệnh lý AI tóm tắt]: ${summaryTxt}` : summaryTxt);
                showToast("Đã chèn tóm tắt bệnh sử vào kết luận lâm sàng!");
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              <div className="lg:col-span-5 space-y-5">

                <div className="bg-[#fff8f5] border border-[#f5e5dd] rounded-2xl p-5 relative overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#b8583c] font-bold text-[11px] uppercase tracking-wider">
                      <Bot className="w-4 h-4 text-[#b8583c]" />
                      <span>AI ANALYSIS</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#f4e6de] flex items-center justify-center text-[#9c7d71]">
                      <Brain className="w-4.5 h-4.5 text-[#a8897d]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#2d2522] mt-2 mb-2">
                    {aiAnalysis.diagnosis}
                  </h3>

                  <p className="text-xs text-[#6e6059] leading-relaxed mt-3 font-normal">
                    {aiAnalysis.description}
                  </p>
                </div>

                <div className="bg-white border border-[#ebdcd5] rounded-2xl p-5 space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold text-[#2d2522] uppercase tracking-wider">
                    Clinical Conclusion
                  </h4>
                  <textarea
                    rows={4}
                    value={clinicalConclusion}
                    onChange={(e) => setClinicalConclusion(e.target.value)}
                    className="w-full bg-[#fcfaf8] border border-[#ebd8ce] rounded-xl p-3.5 text-xs text-[#3a302c] font-normal leading-relaxed focus:outline-none focus:border-[#d97251] focus:bg-white resize-none transition-all shadow-xs"
                    placeholder="Nhập kết luận lâm sàng và chỉ định của bác sĩ..."
                  />
                </div>

              </div>

              <div className="lg:col-span-7 space-y-5">

                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#d97251]" />
                  <h3 className="text-lg font-bold text-[#2d2522] tracking-tight">Prescription Builder</h3>
                </div>

                <div className="bg-[#fdfbf9] border border-[#f0dfd7] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">

                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-medium text-[#7a6c65] mb-1">Medication</label>
                      <input
                        type="text"
                        value={newMedName}
                        onChange={(e) => setNewMedName(e.target.value)}
                        placeholder="e.g., Amoxicillin"
                        className="w-full bg-white border border-[#e5d5cc] rounded-xl px-3.5 py-2.5 text-xs text-[#2d2522] placeholder:text-[#b0a29b] focus:outline-none focus:border-[#d97251] transition-all"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-medium text-[#7a6c65] mb-1">Dosage</label>
                      <input
                        type="text"
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        placeholder="e.g., 500mg"
                        className="w-full bg-white border border-[#e5d5cc] rounded-xl px-3.5 py-2.5 text-xs text-[#2d2522] placeholder:text-[#b0a29b] focus:outline-none focus:border-[#d97251] transition-all"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="w-full py-2.5 px-3 border border-[#d97251] text-[#d97251] hover:bg-[#d97251] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-2xs whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add to Order</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#7a6c65] mb-1">Instructions</label>
                    <input
                      type="text"
                      value={newMedInstructions}
                      onChange={(e) => setNewMedInstructions(e.target.value)}
                      placeholder="e.g., Take one tablet twice daily with food"
                      className="w-full bg-white border border-[#e5d5cc] rounded-xl px-3.5 py-2.5 text-xs text-[#2d2522] placeholder:text-[#b0a29b] focus:outline-none focus:border-[#d97251] transition-all"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#ebdcd5] overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#f0e4dd] text-[#8c7e77] text-[11px] font-bold">
                          <th className="py-3 px-4 font-bold">Medication</th>
                          <th className="py-3 px-4 font-bold">Dosage</th>
                          <th className="py-3 px-4 font-bold">Instructions</th>
                          <th className="py-3 px-4 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5ede8]">
                        {medicines.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-[#a89991] font-medium italic">
                              Chưa có thuốc nào trong đơn. Vui lòng nhập ở phía trên.
                            </td>
                          </tr>
                        ) : (
                          medicines.map((m) => (
                            <tr key={m.id} className="hover:bg-[#fdfbf9] transition-colors">
                              <td className="py-4 px-4 font-bold text-[#2d2522] text-xs">
                                {m.name}
                              </td>
                              <td className="py-4 px-4 font-medium text-[#524641] text-xs">
                                {m.dosage}
                              </td>
                              <td className="py-4 px-4 text-[#6e6059] text-xs leading-relaxed max-w-xs">
                                {m.instructions}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMedicine(m.id)}
                                  className="p-1.5 text-[#d36060] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                                  title="Remove medication"
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

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="text-xs font-bold text-[#706159] hover:text-[#2d2522] px-4 py-2.5 rounded-xl hover:bg-[#f3ede8] transition-all"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintPrescription}
                    disabled={medicines.length === 0}
                    className="bg-[#d97251] hover:bg-[#c25e3f] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-[#d97251]/25 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Print Prescription (PDF + QR)</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {activeTab === 'pharmacist' && (
          <div className="space-y-6 animate-fadeIn">

            <div className="bg-[#fdf3ef] border border-[#f5ded5] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#d97251] text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#2d2522]">
                    Đơn thuốc điện tử đã được mã hóa vào mã QR thành công!
                  </h4>
                  <p className="text-[11px] text-[#7a6c65] mt-0.5">
                    Dược sĩ hoặc bệnh nhân dùng camera điện thoại quét mã QR bên dưới để tra cứu toa thuốc.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('doctor')}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-[#f5ede8] text-[#2d2522] border border-[#ebdcd5] rounded-xl text-xs font-bold transition-all shadow-2xs"
                >
                  ← Chỉnh sửa đơn thuốc
                </button>
                <button
                  type="button"
                  onClick={generatePDF}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#d97251] hover:bg-[#c25e3f] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải lại PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQRImage}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-[#f5ede8] text-[#2d2522] border border-[#ebdcd5] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
                  title="Tải ảnh mã QR PNG"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#d97251]" />
                  <span>Tải ảnh QR</span>
                </button>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="text-center text-xs font-bold text-[#8c7e77] uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#d97251]" />
                <span>Giao diện tra cứu khi quét mã QR (Mobile View)</span>
              </div>

              <div className="bg-white rounded-[40px] border-[10px] border-stone-900 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[640px]">

                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-900 rounded-full z-40 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-800 mr-2"></span>
                  <span className="w-3.5 h-1 bg-stone-800 rounded-full"></span>
                </div>

                <div className="flex-1 flex flex-col justify-between pt-10 pb-8 px-5 bg-[#faf7f5] overflow-y-auto space-y-4">

                  <div className="flex flex-col items-center border-b border-[#f0e4dd] pb-4 mt-2">
                    <div className="w-11 h-11 rounded-2xl bg-[#d97251] flex items-center justify-center text-white shadow-md mb-2">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#2d2522] tracking-tight">MediConnect Clinic</h3>

                    <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đơn thuốc điện tử hợp lệ</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#ebdcd5] p-4 flex flex-col items-center justify-center shadow-xs space-y-2">
                    <QRCodeCanvas
                      id="prototype-qr-canvas"
                      value={prescriptionPublicUrl}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                    <span className="text-[10px] font-bold text-[#8c7e77] uppercase tracking-wider">
                      Mã tra cứu: {patientInfo.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadQRImage}
                      className="text-[10px] font-bold text-[#d97251] hover:underline flex items-center gap-1 pt-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải file ảnh mã QR này</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#ebdcd5] p-4 space-y-3 shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#a89991] uppercase tracking-wide block">Bệnh nhân</span>
                      <span className="font-extrabold text-[#2d2522] text-sm mt-0.5 block">
                        {patientInfo.name} ({patientInfo.age} tuổi)
                      </span>
                    </div>

                    <div className="border-t border-[#f5ede8] pt-2.5">
                      <span className="text-[10px] font-bold text-[#a89991] uppercase tracking-wide block">Chẩn đoán</span>
                      <span className="font-bold text-[#b8583c] text-xs mt-0.5 block">
                        {aiAnalysis.diagnosis}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-[#f5ede8] pt-2.5">
                      <div>
                        <span className="text-[9px] font-bold text-[#a89991] uppercase tracking-wide block">Bác sĩ kê đơn</span>
                        <span className="font-bold text-[#2d2522] text-xs mt-0.5 block">BS. Sarah Chen</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-[#a89991] uppercase tracking-wide block">Ngày khám</span>
                        <span className="font-bold text-[#2d2522] text-xs mt-0.5 block">{new Date().toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] font-extrabold text-[#7a6c65] uppercase tracking-wide block px-1">
                      Danh Sách Thuốc Chỉ Định ({medicines.length})
                    </span>

                    <ul className="space-y-2.5">
                      {medicines.map((m, idx) => (
                        <li key={m.id || idx} className="bg-white p-3.5 rounded-xl border border-[#ebdcd5] shadow-xs flex flex-col gap-1.5 relative overflow-hidden">
                          {isDispensed && (
                            <div className="absolute right-3 top-3 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-extrabold text-[#2d2522] text-xs block pr-6">
                            {idx + 1}. {m.name}
                          </span>
                          <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-[#d97251]">
                            <span className="text-[#b8583c] font-bold text-[10px] block">
                              Liều lượng: {m.dosage}
                            </span>
                            <span className="text-[#6e6059] text-[10px] font-medium block">
                              Cách dùng: {m.instructions}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-[#f0e4dd] pt-4 space-y-2.5">
                    {isDispensed ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center text-emerald-800 space-y-1">
                        <span className="text-xs font-bold block flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ĐÃ CẤP PHÁT THUỐC THÀNH CÔNG
                        </span>
                        <p className="text-[9px] text-emerald-700 font-semibold">
                          Ghi nhận vào lúc: {new Date().toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsDispensed(true)}
                        className="w-full bg-[#d97251] hover:bg-[#c25e3f] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md shadow-[#d97251]/20 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Xác nhận đã cấp phát thuốc</span>
                      </button>
                    )}

                    {isDispensed && (
                      <button
                        type="button"
                        onClick={() => setIsDispensed(false)}
                        className="w-full bg-white hover:bg-stone-50 text-[#8c7e77] font-bold text-[10px] py-2 rounded-lg transition-colors border border-[#ebdcd5]"
                      >
                        Hủy trạng thái cấp phát
                      </button>
                    )}
                  </div>

                </div>

                <div className="bg-stone-900 py-2 flex justify-center">
                  <span className="w-24 h-1 bg-stone-600 rounded-full"></span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default PrescriptionPrototype;
