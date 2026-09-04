import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Mở rộng jsPDF để vẽ bảng thuốc tự động căn chỉnh
import { FileText } from 'lucide-react';
import { robotoRegularBase64 } from '../utils/vietnameseFont';

/**
 * Component PrescriptionExport - Xuất đơn thuốc PDF kèm mã QR tra cứu (Hỗ trợ tiếng Việt đầy đủ)
 * 
 * Luồng dữ liệu:
 * 1. Nhận thông tin đơn thuốc qua prop `prescriptionData` và mã cuộc hẹn qua prop `appointment_id`.
 * 2. Sử dụng `QRCodeCanvas` tạo mã QR chứa liên kết tra cứu công khai dạng động.
 * 3. Khi click nút "Xuất Toa Thuốc" hoặc "In Toa Thuốc":
 *    - Khởi tạo tài liệu jsPDF kích thước A4.
 *    - Đăng ký font Roboto-Regular hỗ trợ tiếng Việt có dấu.
 *    - Vẽ thông tin tiêu đề phòng khám, thông tin bệnh nhân và danh sách thuốc thông qua `doc.autoTable()`.
 *    - Trích xuất ảnh mã QR từ Canvas dạng Base64 PNG an toàn.
 *    - Nhúng ảnh mã QR vào vị trí góc dưới cùng bên phải của PDF (x: 160mm, y: finalY).
 *    - Lưu file PDF hoặc mở tab mới để in trực tiếp.
 */
const PrescriptionExport = ({ prescriptionData, appointment_id }) => {
  const qrContainerRef = useRef(null);

  // Dữ liệu mẫu y khoa nếu không nhận được dữ liệu thực qua props
  const data = prescriptionData || {
    patientName: 'Nguyễn Văn A',
    diagnosis: 'Viêm họng cấp tính & Sốt nhẹ',
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '3 viên / ngày', instructions: 'Uống sau ăn sáng, trưa, tối' },
      { name: 'Paracetamol 500mg', dosage: '2 viên / ngày', instructions: 'Uống khi sốt trên 38.5 độ' },
      { name: 'Vitamin C 500mg', dosage: '1 viên / ngày', instructions: 'Uống sau ăn sáng' }
    ],
    doctorSignature: 'BS. Nguyễn Văn B'
  };

  // Tạo liên kết tra cứu công khai chứa appointment_id động
  const publicPrescriptionUrl = appointment_id 
    ? `${window.location.origin}/prescription/public/${appointment_id}`
    : `${window.location.origin}/prescription/public/demo_appointment_id`;

  const generatePDF = (action = 'download') => {
    try {
      // Khởi tạo tài liệu PDF (A4 dọc: 210mm x 297mm)
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // 1. Nhúng và Đăng ký Font Roboto (Hỗ trợ Unicode Tiếng Việt đầy đủ)
      // Đăng ký cho cả hai chế độ 'normal' và 'bold' trỏ tới cùng font ttf để tránh lỗi font fallback
      doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
      doc.setFont('Roboto', 'normal');

      // 2. Tiêu đề phòng khám (Header)
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(132, 63, 46); // Tông đỏ trầm đặc trưng của MediConnect
      doc.text('MEDICONNECT CLINIC', 20, 20);
      
      doc.setFontSize(9);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('123 Đường Bà Triệu, Hà Nội | Hotline: 1900-1234 | Web: mediconnect.com', 20, 26);
      
      // Đường kẻ ngang ngăn cách Header
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 30, 190, 30);

      // 3. Tiêu đề chính của Đơn thuốc
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('TOA THUỐC Y KHOA', 105, 42, { align: 'center' });
      doc.setFontSize(10);
      doc.text('(PRESCRIPTION)', 105, 47, { align: 'center' });

      // 4. Thông tin hành chính bệnh nhân (Được viết bằng tiếng Việt có dấu đầy đủ)
      doc.setFontSize(10);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Bệnh nhân (Patient): ${data.patientName}`, 20, 56);
      doc.text(`Chẩn đoán (Diagnosis): ${data.diagnosis}`, 20, 62);
      doc.text(`Ngày kê (Date): ${new Date().toLocaleDateString('vi-VN')}`, 140, 56);

      // 5. Bảng danh sách các loại thuốc chỉ định (Dùng jsPDF Autotable)
      // Hỗ trợ cả hai cấu trúc truyền thuốc: `medicines` hoặc `medications`
      const rawMedicines = data.medicines || data.medications || [];
      
      const columns = [
        { header: 'Tên Thuốc / Dược Chất', dataKey: 'name' },
        { header: 'Liều Lượng', dataKey: 'dosage' },
        { header: 'Hướng Dẫn Sử Dụng', dataKey: 'usage' }
      ];

      // Map đúng cấu trúc và xử lý fallback cho khóa instructions / usage
      const rows = rawMedicines.map(m => ({
        name: m.name || '',
        dosage: m.dosage || '',
        usage: m.instructions || m.usage || ''
      }));

      doc.autoTable({
        startY: 70,
        columns: columns,
        body: rows,
        theme: 'grid',
        styles: { 
          font: 'Roboto', // Đảm bảo Autotable sử dụng đúng font tiếng Việt
          fontStyle: 'normal'
        },
        headStyles: {
          fillColor: [132, 63, 46], // MediConnect Brand Color
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

      // Lấy vị trí Y kết thúc của bảng thuốc để vẽ chữ ký và mã QR
      const finalY = doc.lastAutoTable.finalY + 15;

      // 6. Phần chữ ký của Bác sĩ nằm ở phía bên TRÁI
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text('Bác sĩ điều trị (Doctor)', 20, finalY);
      
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('(Ký và ghi rõ họ tên / Signed & Stamped)', 20, finalY + 5);
      
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(132, 63, 46);
      doc.text(data.doctorSignature, 20, finalY + 25);

      // 7. Nhúng mã QR vào góc dưới cùng bên PHẢI của PDF
      // Sử dụng document.getElementById an toàn kết hợp với container ref
      const qrCanvas = document.getElementById('prescription-qr-canvas') || 
                       (qrContainerRef.current ? qrContainerRef.current.querySelector('canvas') : null);

      if (qrCanvas) {
        try {
          const qrDataUrl = qrCanvas.toDataURL('image/png');
          
          // Tọa độ góc dưới bên phải (x = 160mm, y = finalY - 5mm, kích thước 30x30mm)
          doc.addImage(qrDataUrl, 'PNG', 160, finalY - 5, 30, 30);
          
          doc.setFont('Roboto', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text('Quét QR tra cứu đơn thuốc', 160, finalY + 28, { align: 'left' });
        } catch (qrError) {
          console.error('⚠️ Lỗi khi trích xuất hoặc nhúng mã QR vào PDF:', qrError.message);
        }
      } else {
        console.warn('⚠️ Không tìm thấy canvas mã QR để nhúng vào đơn thuốc PDF.');
      }

      // 8. Xuất file PDF hoặc mở tab mới để in trực tiếp
      const patientNameSafe = (data.patientName || 'BenhNhan').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s+/g, '_');
      const fileName = `ToaThuoc_${patientNameSafe}.pdf`;

      if (action === 'print') {
        const pdfBlob = doc.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.focus();
        } else {
          alert('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt chặn Pop-up của trình duyệt.');
        }
      } else {
        doc.save(fileName);
      }
    } catch (pdfError) {
      console.error('❌ Lỗi nghiêm trọng khi tạo PDF đơn thuốc:', pdfError);
      alert('Đã xảy ra sự cố trong quá trình xuất đơn thuốc PDF. Vui lòng liên hệ quản trị viên.');
    }
  };

  const rawMedicines = data.medicines || data.medications || [];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#f5eae6] shadow-md max-w-md w-full mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="flex items-center gap-3 border-b border-[#f5eae6] pb-4">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-800">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Toa Thuốc Điện Tử</h3>
          <p className="text-[11px] text-slate-400">Xem trực tuyến và xuất bản PDF</p>
        </div>
      </div>

      {/* Nội dung chi tiết đơn thuốc trên giao diện */}
      <div className="space-y-4 text-xs md:text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Bệnh nhân</span>
            <span className="font-bold text-slate-700 mt-0.5 block">{data.patientName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Bác sĩ kê đơn</span>
            <span className="font-bold text-slate-700 mt-0.5 block">{data.doctorSignature}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Chẩn đoán</span>
          <span className="font-bold text-rose-950 mt-0.5 block bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100/30">
            {data.diagnosis}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block font-semibold uppercase mb-1.5">Danh sách thuốc chỉ định</span>
          <ul className="space-y-2">
            {rawMedicines.map((m, index) => (
              <li key={index} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center gap-4">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{m.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{m.instructions || m.usage}</span>
                </div>
                <span className="bg-rose-100/50 text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-rose-100 whitespace-nowrap">
                  {m.dosage}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* QRCode Canvas hiển thị trực quan trên giao diện */}
      <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
        <div ref={qrContainerRef}>
          <QRCodeCanvas 
            id="prescription-qr-canvas"
            value={publicPrescriptionUrl} 
            size={256} 
            level="H" 
            includeMargin={true} 
            style={{ width: 110, height: 110 }}
          />
        </div>
        <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Mã QR Tra Cứu Toa Thuốc</p>
      </div>

      {/* Nút bấm thao tác (In và Tải đơn thuốc) */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => generatePDF('download')}
          className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold rounded-2xl transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-2"
        >
          💾 Tải PDF
        </button>
        <button
          onClick={() => generatePDF('print')}
          className="flex-1 py-3 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
        >
          🖨️ In Toa Thuốc
        </button>
      </div>

    </div>
  );
};

export default PrescriptionExport;
