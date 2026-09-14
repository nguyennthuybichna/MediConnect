import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import {
  Search,
  X,
  Download,
  Calendar,
  User,
  Droplet,
  Brain,
  Menu
} from 'lucide-react';

const MOCK_RECORDS = [
  {
    id: "BA-23091",
    patientName: "Trần Văn Cường",
    gender: "Nam",
    age: 45,
    bloodType: "O+",
    examDate: "24/10/2023",
    doctorName: "Bs. Lê Hải Yến",
    initials: "TC",
    notes: "Bệnh nhân ho nhiều có đờm, đau họng, không sốt. Phổi nghe có rale ẩm rải rác. Khuyên nghỉ ngơi, uống nhiều nước ấm và tránh tiếp xúc khói bụi.",
    prescription: "Amoxicillin | 500 mg | Uống 1 viên mỗi lần, ngày 3 lần sau ăn trong 7 ngày\nBenzonatate | 100 mg | Uống 1 viên mỗi lần, ngày 3 lần khi ho nhiều",
    doctorDiagnosis: "Viêm phế quản cấp",
    aiPrediction: {
      disease: "Viêm phế quản cấp",
      confidence: 88
    }
  },
  {
    id: "BA-23090",
    patientName: "Nguyễn Thị Mai",
    gender: "Nữ",
    age: 32,
    bloodType: "A+",
    examDate: "24/10/2023",
    doctorName: "Bs. Phạm Tuấn",
    initials: "NM",
    notes: "Bệnh nhân có triệu chứng ho khan kéo dài 3 ngày, kèm đau rát họng và mệt mỏi nhẹ. Họng đỏ nhẹ, không có sốt. Chỉ định dùng xịt họng giảm ho và uống nhiều nước.",
    prescription: "Albuterol Sulfate HFA | 90 mcg/lần xịt | Hít 2 hơi mỗi 4-6 giờ khi ho rát ngực\nBenzonatate | 100 mg | Uống 1 viên mỗi lần, ngày 3 lần khi ho",
    doctorDiagnosis: "Viêm phế quản cấp",
    aiPrediction: {
      disease: "Viêm phế quản cấp",
      confidence: 78
    }
  },
  {
    id: "BA-23089",
    patientName: "Lê Đức Thắng",
    gender: "Nam",
    age: 58,
    bloodType: "AB-",
    examDate: "23/10/2023",
    doctorName: "Bs. Lê Hải Yến",
    initials: "LT",
    notes: "Bệnh nhân huyết áp đo tại phòng khám là 145/92 mmHg, có tiền sử tăng huyết áp nhẹ. Báo thỉnh thoảng đau đầu vùng chẩm. Khuyên duy trì chế độ ăn giảm muối, đo huyết áp mỗi sáng.",
    prescription: "Amlodipine | 5 mg | Uống 1 viên mỗi sáng trước ăn\nLisinopril | 10 mg | Uống 1 viên mỗi ngày cùng bữa ăn",
    doctorDiagnosis: "Tăng huyết áp",
    aiPrediction: {
      disease: "Tăng huyết áp",
      confidence: 95
    }
  }
];

export default function AdminRecords() {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [records, setRecords] = useState(MOCK_RECORDS);
  const [selectedId, setSelectedId] = useState("BA-23091");
  const [panelOpen, setPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get('/admin/appointments');
        if (res.data && res.data.success) {
          const dbAppointments = res.data.appointments;
          const mappedDbRecords = dbAppointments.map(app => {
            return {
              id: `BA-${app.appointment_id}`,
              patientName: app.patient_name || 'Bệnh nhân',
              gender: "Nữ",
              age: 28,
              bloodType: "O+",
              examDate: new Date(app.appointment_time).toLocaleDateString('vi-VN'),
              doctorName: app.doctor_name || 'Bác sĩ',
              initials: (app.patient_name || 'BN').split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase(),
              notes: app.notes || "Không có ghi chú.",
              prescription: app.prescription || "",
              doctorDiagnosis: app.doctor_corrected_disease || app.ai_disease || "Chưa có chẩn đoán",
              aiPrediction: {
                disease: app.ai_disease || "Chưa rõ",
                confidence: Math.round((app.ai_confidence || 0.8) * 100)
              }
            };
          });

          setRecords(prev => {
            const filteredPrev = prev.filter(p => !mappedDbRecords.some(mp => mp.id === p.id));
            return [...mappedDbRecords, ...filteredPrev];
          });

          if (mappedDbRecords.length > 0) {
            setSelectedId(mappedDbRecords[0].id);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách bệnh án CSDL:", err);
      }
    };
    fetchRecords();
  }, []);

  const activeRecord = records.find(r => r.id === selectedId) || records[0];

  const filteredRecords = records.filter(r =>
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-[#fdfbfb] min-h-screen text-slate-700 font-sans">

      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">

        <header className="flex justify-between items-center gap-4 border-b border-[#f5eae6] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-800 md:hidden rounded-xl bg-white border border-[#f5eae6] shadow-xs"
              title="Mở Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1 max-w-md hidden sm:block">
              <input
                type="text"
                placeholder="Tìm kiếm bệnh án hoặc mã bệnh nhân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#f5eae6]/40 border border-[#f5eae6] text-xs py-2.5 pl-9 pr-4 rounded-full w-full focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center font-bold text-xs text-brand-800">
                {(user?.full_name || 'Quản trị viên').split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <h5 className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'Quản trị viên'}</h5>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Trưởng ban quản trị</span>
              </div>
            </div>
          </div>
        </header>

        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Quản lý & Tổng hợp Bệnh án</h1>
            <p className="text-sm text-slate-500 mt-1">Danh sách bệnh án đã hoàn tất khám chữa bệnh.</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã BA</th>
                  <th className="py-3 px-4">Tên bệnh nhân</th>
                  <th className="py-3 px-4">Bác sĩ</th>
                  <th className="py-3 px-4">Ngày khám</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredRecords.map((rec) => {
                  const isSelected = rec.id === selectedId;
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => {
                        setSelectedId(rec.id);
                        setPanelOpen(true);
                      }}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <td className="py-4.5 px-4">
                        <span className={`font-bold ${isSelected ? 'text-brand-600' : 'text-slate-500'}`}>
                          {rec.id}
                        </span>
                      </td>
                      <td className="py-4.5 px-4">
                        <div>
                          <span className="font-extrabold text-slate-800">{rec.patientName}</span>
                          <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{rec.gender} • {rec.age} tuổi</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-4 text-slate-600">{rec.doctorName}</td>
                      <td className="py-4.5 px-4 text-slate-500">{rec.examDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 pt-2">
            Hiển thị 1 - {filteredRecords.length} của {records.length} bệnh án
          </div>
        </section>
      </main>

      {panelOpen && (
        <>

          <div
            onClick={() => setPanelOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 xl:hidden transition-opacity"
          />

          <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] xl:static xl:z-auto bg-white border-l border-slate-100 flex flex-col justify-between shrink-0 shadow-2xl h-screen sticky top-0 animate-slideIn">

          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Chi tiết Bệnh án: {activeRecord.id}</h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-2 text-slate-450 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div className="flex items-center gap-4 bg-brand-50/30 p-4 border border-[#f5eae6]/65 rounded-2xl">
              <div className="w-14 h-14 bg-brand-100 text-brand-800 rounded-2xl flex items-center justify-center font-extrabold text-lg uppercase shadow-sm">
                {activeRecord.initials}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-base font-extrabold text-slate-850 leading-none">{activeRecord.patientName}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-450" />
                    {activeRecord.gender}, {activeRecord.age} tuổi
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-rose-500" />
                    Nhóm máu: {activeRecord.bloodType}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Khám: {activeRecord.examDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phân tích AI</span>
              <div className="w-full">

                <div className="bg-brand-50/50 border border-brand-100/50 rounded-2xl p-4 space-y-2.5 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-brand-600" />
                      <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider">AI Đề xuất</span>
                    </div>
                  </div>
                  <p className="text-xs font-extrabold text-slate-800 leading-tight">
                    {activeRecord.aiPrediction.disease}
                  </p>
                </div>
              </div>
            </div>

            {(activeRecord.notes || activeRecord.prescription || activeRecord.doctorDiagnosis) && (
              <div className="space-y-3">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kết luận lâm sàng</span>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                  {activeRecord.doctorDiagnosis && (
                    <div>
                      <span className="block text-[9px] font-bold text-slate-450 uppercase">Chẩn đoán của Bác sĩ</span>
                      <span className="text-xs font-extrabold text-slate-800 block mt-1 leading-snug">
                        {activeRecord.doctorDiagnosis}
                      </span>
                    </div>
                  )}
                  {activeRecord.notes && (
                    <div>
                      <span className="block text-[9px] font-bold text-slate-450 uppercase">Ghi chú bệnh án lâm sàng</span>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1">
                        {activeRecord.notes}
                      </p>
                    </div>
                  )}
                  {activeRecord.prescription && (
                    <div>
                      <span className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Đơn thuốc kê đơn</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeRecord.prescription.split('\n').map((p, pIdx) => {
                          const parts = p.split(' | ');
                          return (
                            <span key={pIdx} className="bg-brand-50 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded border border-brand-100">
                              {parts[0]} {parts[1] ? `(${parts[1]})` : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-[#fdfbfb] space-y-3">
            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8,ID,Patient,AI Prediction\n"
                  + `${activeRecord.id},${activeRecord.patientName},${activeRecord.aiPrediction.disease}`;
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `train_${activeRecord.id}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-500/10 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất CSV train AI</span>
            </button>
          </div>
          </aside>
        </>
      )}
    </div>
  );
}
