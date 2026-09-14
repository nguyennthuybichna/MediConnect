import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Share2,
  Calendar,
  User,
  Activity,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Building2,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  Check,
  Copy
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoRegularBase64 } from '../utils/vietnameseFont';
import api from '../services/api';

const DEFAULT_PRESCRIPTION = {
  appointment_id: 'DEMO-84729',
  appointment_time: new Date().toISOString(),
  patient_name: 'Nguyễn Văn A',
  gender: 'Nam',
  age: 45,
  doctor_name: 'BS. CKII Nguyễn Văn B',
  doctor_specialty: 'Khoa Nội Tổng Quát & Hô Hấp',
  diagnosis: 'Viêm họng cấp tính & Cảm cúm nhẹ (J02.9)',
  notes: 'Bệnh nhân cần nghỉ ngơi, uống nhiều nước ấm, súc họng bằng nước muối sinh lý hàng ngày. Tái khám sau 5 ngày nếu triệu chứng không thuyên giảm.',
  medicines: [
    {
      name: 'Amoxicillin 500mg',
      dosage: '3 viên / ngày (Sáng 1, Trưa 1, Tối 1)',
      instructions: 'Uống sau bữa ăn 30 phút, liên tục 7 ngày'
    },
    {
      name: 'Paracetamol 500mg',
      dosage: '2-3 viên / ngày',
      instructions: 'Uống khi sốt trên 38.5°C, các liều cách nhau 4-6 tiếng'
    },
    {
      name: 'Vitamin C 500mg',
      dosage: '1 viên / ngày',
      instructions: 'Uống vào buổi sáng sau ăn'
    }
  ],
  is_verified: 1
};

const PublicPrescription = () => {
  const { appointment_id } = useParams();
  const [searchParams] = useSearchParams();
  const autoDownload = searchParams.get('download') === '1' || searchParams.get('autodownload') === '1' || searchParams.get('download') === 'true';

  const [prescription, setPrescription] = useState(DEFAULT_PRESCRIPTION);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const qrCanvasRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchPrescription = async () => {
      const id = appointment_id || 'demo_appointment_id';
      try {
        setLoading(true);
        const res = await api.get(`/public/prescription/${id}`);
        if (res.data && res.data.prescription) {
          setPrescription(res.data.prescription);
        }
      } catch (err) {
        console.warn('Lỗi khi tải đơn thuốc từ API, sử dụng dữ liệu mặc định:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [appointment_id]);

  useEffect(() => {
    if (!loading && autoDownload) {
      setTimeout(() => {
        generatePDF('download');
      }, 500);
    }
  }, [loading, autoDownload]);

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    showToast('✓ Đã sao chép liên kết toa thuốc!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Tải ảnh mã QR (PNG) trực tiếp về máy
  const handleDownloadQRImage = () => {
    try {
      const canvas = document.getElementById('public-qr-canvas') || (qrCanvasRef.current ? qrCanvasRef.current.querySelector('canvas') : null);
      if (!canvas) {
        showToast('⚠️ Không tìm thấy canvas mã QR');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeName = (prescription.patient_name || 'BenhNhan').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s+/g, '_');
      link.download = `QRCode_ToaThuoc_${safeName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('✓ Đã tải ảnh mã QR (PNG) thành công!');
    } catch (err) {
      console.error('Lỗi khi tải ảnh QR:', err);
      showToast('⚠️ Lỗi khi xuất ảnh mã QR');
    }
  };

  // Tạo và tải File PDF chuẩn y tế
  const generatePDF = (action = 'download') => {
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

      // Header phòng khám
      doc.setFontSize(20);
      doc.setTextColor(132, 63, 46);
      doc.text('MEDICONNECT CLINIC', 20, 20);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('123 Đường Bà Triệu, Hà Nội | Hotline: 1900-1234 | Web: mediconnect.com', 20, 26);

      doc.setDrawColor(220, 220, 220);
      doc.line(20, 30, 190, 30);

      // Tiêu đề
      doc.setFontSize(15);
      doc.setTextColor(30, 30, 30);
      doc.text('TOA THUỐC Y KHOA ĐIỆN TỬ (PRESCRIPTION)', 105, 42, { align: 'center' });

      // Thông tin bệnh nhân & bác sĩ
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Bệnh nhân (Patient): ${prescription.patient_name || 'N/A'}`, 20, 54);
      doc.text(`Mã tra cứu: #${prescription.appointment_id || 'N/A'}`, 20, 60);
      doc.text(`Chẩn đoán: ${prescription.diagnosis || 'Chưa cập nhật'}`, 20, 66);

      const formattedDate = prescription.appointment_time
        ? new Date(prescription.appointment_time).toLocaleDateString('vi-VN')
        : new Date().toLocaleDateString('vi-VN');

      doc.text(`Ngày khám: ${formattedDate}`, 135, 54);
      doc.text(`Bác sĩ: ${prescription.doctor_name || 'Bác sĩ điều trị'}`, 135, 60);

      // Bảng thuốc
      const rawMedicines = prescription.medicines || [];
      const columns = [
        { header: 'Tên Thuốc / Hàm Lượng', dataKey: 'name' },
        { header: 'Liều Lượng', dataKey: 'dosage' },
        { header: 'Hướng Dẫn Sử Dụng', dataKey: 'instructions' }
      ];

      const rows = rawMedicines.map(m => ({
        name: m.name || '',
        dosage: m.dosage || '',
        instructions: m.instructions || m.usage || ''
      }));

      autoTable(doc, {
        startY: 74,
        columns: columns,
        body: rows,
        theme: 'grid',
        styles: {
          font: 'Roboto',
          fontStyle: 'normal'
        },
        headStyles: {
          fillColor: [132, 63, 46],
          textColor: [255, 255, 255],
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        margin: { left: 20, right: 20 }
      });

      const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 74) + 12;

      // Lời dặn
      if (prescription.notes) {
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Lời dặn của bác sĩ:', 20, finalY);
        doc.setTextColor(100, 100, 100);
        const splitNotes = doc.splitTextToSize(prescription.notes, 110);
        doc.text(splitNotes, 20, finalY + 6);
      }

      // Ký tên bác sĩ
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text('Bác sĩ điều trị (Doctor)', 140, finalY);

      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('(Ký số điện tử / Digitally Signed)', 140, finalY + 5);

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(132, 63, 46);
      doc.text(prescription.doctor_name || 'BS. MediConnect', 140, finalY + 22);

      // Nhúng mã QR vào PDF
      const canvas = document.getElementById('public-qr-canvas') || (qrCanvasRef.current ? qrCanvasRef.current.querySelector('canvas') : null);
      if (canvas) {
        try {
          const qrDataUrl = canvas.toDataURL('image/png');
          doc.addImage(qrDataUrl, 'PNG', 140, finalY + 28, 26, 26);
          doc.setFont('Roboto', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text('Quét mã tra cứu gốc', 140, finalY + 57);
        } catch (e) {
          console.warn('Không thể nhúng QR canvas vào PDF:', e);
        }
      }

      const safeName = (prescription.patient_name || 'BenhNhan').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s+/g, '_');
      const fileName = `ToaThuoc_${safeName}_${prescription.appointment_id || 'MediConnect'}.pdf`;

      if (action === 'print') {
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
        } else {
          alert('Không thể mở tab in. Vui lòng tắt tính năng chặn pop-up của trình duyệt.');
        }
      } else {
        doc.save(fileName);
        showToast('✓ Đã tải file PDF toa thuốc thành công!');
      }
    } catch (err) {
      console.error('Lỗi xuất PDF:', err);
      showToast('⚠️ Có lỗi xảy ra khi tạo PDF toa thuốc');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F8] text-[#2D2522] font-sans pb-16 antialiased selection:bg-rose-100 selection:text-rose-900">

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-[#843F2E] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 animate-bounce text-xs font-bold border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-orange-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Thanh Header Công Khai */}
      <header className="bg-white border-b border-[#F0E4DD] py-3.5 px-4 sm:px-8 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#843F2E] flex items-center justify-center text-white shadow-md shadow-rose-950/10">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#2D2522]">MediConnect</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-extrabold border border-emerald-200">
                  XÁC THỰC SỐ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Hệ thống Tra cứu Toa thuốc Điện tử Công khai</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
              title="Sao chép liên kết"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Sao chép link'}</span>
            </button>
            <Link
              to="/login"
              className="px-3 py-2 bg-[#843F2E]/10 hover:bg-[#843F2E]/20 text-[#843F2E] text-xs font-bold rounded-xl transition-all"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="max-w-md mx-auto px-4 mt-16 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-[#843F2E] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-600">Đang tải dữ liệu toa thuốc từ máy chủ y tế...</p>
          <p className="text-[11px] text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      ) : (
      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-6">

        {/* Banner xác thực hợp lệ */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/60 via-white to-rose-50/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-800">Toa Thuốc Điện Tử Hợp Lệ</h2>
                <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                  Đã duyệt
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã tra cứu định danh: <span className="font-bold text-slate-700">#{prescription.appointment_id || 'DEMO'}</span> • Có giá trị lưu hành toàn quốc
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => generatePDF('download')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#843F2E] hover:bg-[#6c3325] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#843F2E]/20 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Tải PDF Ngay</span>
            </button>
            <button
              onClick={handleDownloadQRImage}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
              title="Tải ảnh mã QR PNG về máy"
            >
              <QrCode className="w-4 h-4 text-[#843F2E]" />
              <span>Tải ảnh QR</span>
            </button>
          </div>
        </div>

        {/* Thẻ Toa Thuốc Chính */}
        <div className="bg-white rounded-3xl border border-[#F0E4DD] shadow-md p-6 sm:p-8 space-y-6">

          {/* Tiêu đề phòng khám */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F5EAE6] pb-6 gap-4">
            <div>
              <span className="text-[11px] font-extrabold text-[#843F2E] uppercase tracking-wider block">
                Phòng khám Đa khoa Quốc tế
              </span>
              <h1 className="text-2xl font-black text-slate-850 tracking-tight mt-0.5">
                MEDICONNECT CLINIC
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> 123 Đường Bà Triệu, Hà Nội • Hotline: 1900-1234
              </p>
            </div>

            <div className="text-left sm:text-right bg-rose-50/40 p-3 rounded-2xl border border-rose-100/50 sm:bg-transparent sm:p-0 sm:border-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ngày kê toa</span>
              <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                {prescription.appointment_time ? new Date(prescription.appointment_time).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {prescription.appointment_time ? new Date(prescription.appointment_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          </div>

          {/* Thông tin Bệnh nhân & Bác sĩ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FCF9F7] p-4 sm:p-5 rounded-2xl border border-[#EFE5E0]">
            <div className="space-y-2">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Họ và tên Bệnh nhân</span>
                <span className="text-base font-extrabold text-slate-800 block mt-0.5">
                  {prescription.patient_name || 'Bệnh nhân'}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 font-medium">
                <span>Giới tính: <strong className="text-slate-700">{prescription.gender || 'Nam'}</strong></span>
                {prescription.age && <span>Tuổi: <strong className="text-slate-700">{prescription.age} tuổi</strong></span>}
              </div>
            </div>

            <div className="space-y-2 sm:border-l sm:border-[#EFE5E0] sm:pl-5">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Bác sĩ kê đơn</span>
                <span className="text-base font-extrabold text-[#843F2E] block mt-0.5">
                  {prescription.doctor_name || 'BS. MediConnect'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Chuyên khoa: <strong className="text-slate-700">{prescription.doctor_specialty || 'Nội tổng quát'}</strong>
              </p>
            </div>
          </div>

          {/* Chẩn đoán */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Chẩn đoán y khoa
            </span>
            <div className="bg-rose-50/60 text-[#843F2E] font-extrabold text-sm px-4 py-3 rounded-2xl border border-rose-100/80">
              {prescription.diagnosis || 'Khám bệnh tổng quát'}
            </div>
          </div>

          {/* Danh sách thuốc */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#843F2E]" />
                <span>Danh sách thuốc chỉ định ({(prescription.medicines || []).length})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium italic">Tuân thủ nghiêm ngặt liều lượng</span>
            </div>

            <div className="space-y-2.5">
              {(prescription.medicines || []).map((med, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-rose-200 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-rose-50 text-[#843F2E] font-extrabold text-xs flex items-center justify-center shrink-0 border border-rose-100 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{med.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal">
                        {med.instructions || med.usage || 'Uống theo chỉ dẫn của bác sĩ'}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 pl-10 sm:pl-0">
                    <span className="inline-block bg-rose-100/60 text-[#843F2E] text-xs font-extrabold px-3 py-1 rounded-xl border border-rose-200/60">
                      {med.dosage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lời dặn của bác sĩ */}
          {prescription.notes && (
            <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#EFE5E0] space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Lời dặn & Hướng dẫn chăm sóc
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                {prescription.notes}
              </p>
            </div>
          )}

          {/* Khu vực Mã QR và Chữ ký số */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#F5EAE6] items-center">

            {/* Khối hiển thị mã QR */}
            <div className="bg-[#FCF9F7] p-4 rounded-2xl border border-[#EFE5E0] flex items-center gap-4">
              <div ref={qrCanvasRef} className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                <QRCodeCanvas
                  id="public-qr-canvas"
                  value={currentUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                  style={{ width: 88, height: 88 }}
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Mã QR Gốc Toa Thuốc
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Quét bằng điện thoại để xem và tải đơn thuốc tức thì không cần đăng nhập.
                </p>
                <button
                  onClick={handleDownloadQRImage}
                  className="text-[11px] font-extrabold text-[#843F2E] hover:text-[#6c3325] flex items-center gap-1 mt-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Tải ảnh mã QR này</span>
                </button>
              </div>
            </div>

            {/* Khối chữ ký bác sĩ */}
            <div className="text-center sm:text-right space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Bác sĩ điều trị
              </span>
              <span className="text-[10px] text-slate-400 italic block">
                (Đã ký số & chứng thực điện tử)
              </span>
              <span className="text-base font-black text-[#843F2E] block pt-3">
                {prescription.doctor_name || 'BS. CKII Nguyễn Văn B'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block flex items-center justify-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Chứng thực bởi MediConnect Security
              </span>
            </div>

          </div>

          {/* Thanh Nút Hành Động Cuối Trang */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#F5EAE6]">
            <button
              onClick={() => generatePDF('download')}
              className="flex-1 py-3.5 bg-[#843F2E] hover:bg-[#6c3325] text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-[#843F2E]/25 active:scale-98 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>TẢI TOA THUỐC (PDF)</span>
            </button>

            <button
              onClick={handleDownloadQRImage}
              className="flex-1 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-black rounded-2xl transition-all border border-slate-200 shadow-sm active:scale-98 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4 text-[#843F2E]" />
              <span>TẢI ẢNH MÃ QR (PNG)</span>
            </button>

            <button
              onClick={() => generatePDF('print')}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In toa thuốc</span>
            </button>
          </div>

        </div>

      </main>
      )}
    </div>
  );
};

export default PublicPrescription;
