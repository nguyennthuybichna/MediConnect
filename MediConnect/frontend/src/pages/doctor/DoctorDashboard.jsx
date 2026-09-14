import React, { useState } from 'react';
import {
  Search,
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  LayoutDashboard,
  FolderOpen,
  BarChart2,
  Settings,
  Calendar,
  User,
  Activity,
  Droplet,
  LogOut
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

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
    allergies: [
      { name: "Penicillin", reaction: "Phản ứng sốc phản vệ" }
    ],
    aiPrediction: {
      disease: "Viêm phế quản cấp",
      confidence: 88
    },
    doctorConclusion: "Viêm phế quản cấp (J20.9)",
    prescriptions: [
      { name: "Albuterol Sulfate", dosage: "90 mcg", usage: "Hít 2 nhát mỗi 4-6 giờ" },
      { name: "Benzonatate", dosage: "100 mg", usage: "Uống 1 viên sau ăn x 3 lần/ngày" }
    ]
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
    allergies: [
      { name: "Aspirin", reaction: "Phát ban và sưng phù" }
    ],
    aiPrediction: {
      disease: "Viêm phế quản cấp",
      confidence: 78
    },
    doctorConclusion: "Viêm phế quản cấp (J20.9)",
    prescriptions: [
      { name: "Amoxicillin", dosage: "500 mg", usage: "Uống 1 viên x 3 lần/ngày" },
      { name: "Fluticasone Spray", dosage: "50 mcg", usage: "Xịt 2 lần mỗi bên mũi hàng ngày" }
    ]
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
    allergies: [],
    aiPrediction: {
      disease: "Tăng huyết áp",
      confidence: 95
    },
    doctorConclusion: "Tăng huyết áp vô căn (I10)",
    prescriptions: [
      { name: "Lisinopril", dosage: "10 mg", usage: "Uống 1 viên mỗi sáng" },
      { name: "Amlodipine", dosage: "5 mg", usage: "Uống 1 viên mỗi tối" }
    ]
  }
];

export default function DoctorDashboard() {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const [selectedId, setSelectedId] = useState("BA-23091");
  const [panelOpen, setPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const activeRecord = MOCK_RECORDS.find(r => r.id === selectedId) || MOCK_RECORDS[0];

  const filteredRecords = MOCK_RECORDS.filter(r =>
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-[#FAF6F3]/40 min-h-screen text-[#4A3E39] font-sans antialiased overflow-hidden">

      <aside className="w-64 bg-[#FAF2EE] border-r border-[#EFE5E0] flex flex-col justify-between shrink-0">
        <div className="flex flex-col">

          <div className="p-6 border-b border-[#EFE5E0] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D3765F] flex items-center justify-center text-white shadow-md shadow-[#D3765F]/20">
              <Activity className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#D3765F] tracking-tight leading-none">MediConnect</h1>
              <span className="text-[10px] font-bold text-[#A8968F] uppercase tracking-wider mt-0.5 block">Quản lý Y tế</span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-[#6B5E59] hover:bg-[#F6EBE6]/50 hover:text-[#843F2E] transition-all">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold bg-[#F6EBE6] text-[#843F2E] border-r-4 border-[#D3765F] transition-all">
              <div className="flex items-center gap-3.5">
                <FolderOpen className="w-5 h-5" />
                <span>Hồ sơ bệnh án</span>
              </div>
            </button>

            <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-[#6B5E59] hover:bg-[#F6EBE6]/50 hover:text-[#843F2E] transition-all">
              <BarChart2 className="w-5 h-5" />
              <span>Thống kê</span>
            </button>

            <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-[#6B5E59] hover:bg-[#F6EBE6]/50 hover:text-[#843F2E] transition-all">
              <Settings className="w-5 h-5" />
              <span>Cài đặt</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#EFE5E0] bg-[#FCF6F3] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-[#F7ECE8] transition-all cursor-pointer min-w-0 flex-1">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Quản trị viên"
              className="w-9 h-9 rounded-full object-cover border border-[#D3765F]/35 shrink-0"
            />
            <div className="text-left overflow-hidden min-w-0">
              <h5 className="text-xs font-extrabold text-[#843F2E] truncate leading-tight">Quản trị viên</h5>
              <span className="text-[10px] font-bold text-[#A8968F] uppercase tracking-wider block mt-0.5 truncate">Hệ thống</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100/70 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-white flex flex-col min-w-0 overflow-y-auto">

        <header className="px-8 py-5 border-b border-[#EFE5E0] flex items-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm bệnh án, mã bệnh nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FBEEE9]/50 border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] placeholder:text-[#A8968F] py-2.5 pl-10 pr-4 rounded-full focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all shadow-2xs"
            />
            <Search className="w-4 h-4 text-[#A8968F] absolute left-3.5 top-3" />
          </div>
        </header>

        <div className="px-8 py-6 space-y-1">
          <h2 className="text-2xl font-extrabold text-[#4A3E39] leading-tight">Quản lý & Tổng hợp Bệnh án</h2>
          <p className="text-xs font-semibold text-[#80726B]">Danh sách bệnh án đã hoàn tất khám chữa bệnh.</p>
        </div>

        <div className="px-8 pb-8">
          <div className="border border-[#EFE5E0] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF6F3] border-b border-[#EFE5E0] text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">
                  <th className="px-6 py-4">Mã BA</th>
                  <th className="px-6 py-4">Tên bệnh nhân</th>
                  <th className="px-6 py-4">Bác sĩ</th>
                  <th className="px-6 py-4">Ngày khám</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5E0]">
                {filteredRecords.map((rec) => {
                  const isSelected = rec.id === selectedId;
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => {
                        setSelectedId(rec.id);
                        setPanelOpen(true);
                      }}
                      className={`hover:bg-[#FAF6F3]/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#FCF6F3]/60' : ''
                      }`}
                    >
                      <td className="px-6 py-4.5">
                        <span className={`text-xs font-bold ${
                          isSelected ? 'text-[#D3765F]' : 'text-[#80726B]'
                        }`}>
                          {rec.id}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div>
                          <span className="text-xs font-extrabold text-[#4A3E39]">{rec.patientName}</span>
                          <span className="block text-[10px] text-[#A8968F] font-semibold mt-0.5">{rec.gender} • {rec.age} tuổi</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-xs font-semibold text-[#6B5E59]">{rec.doctorName}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-xs font-semibold text-[#80726B]">{rec.examDate}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="bg-[#FAF6F3]/50 px-6 py-4 border-t border-[#EFE5E0] text-[11px] font-semibold text-[#A8968F]">
              Hiển thị 1 - {filteredRecords.length} của {MOCK_RECORDS.length} bệnh án
            </div>
          </div>
        </div>
      </main>

      {panelOpen && (
        <aside className="w-[480px] bg-white border-l border-[#EFE5E0] flex flex-col justify-between shrink-0 shadow-2xl relative z-20 animate-slideIn">

          <div className="px-6 py-5 border-b border-[#EFE5E0] flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#4A3E39] uppercase tracking-wide">Chi tiết Bệnh án: {activeRecord.id}</h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-2 text-[#A8968F] hover:text-[#843F2E] hover:bg-[#F2E8E4] rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div className="flex items-center gap-4 bg-[#FCF6F3]/40 p-4 border border-[#EFE5E0] rounded-2xl">
              <div className="w-14 h-14 bg-[#FBEEE9] text-[#D3765F] rounded-2xl flex items-center justify-center font-extrabold text-lg uppercase shadow-2xs">
                {activeRecord.initials}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-base font-extrabold text-[#4A3E39] leading-none">{activeRecord.patientName}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#80726B] font-semibold">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#A8968F]" />
                    {activeRecord.gender}, {activeRecord.age} tuổi
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-red-500" />
                    Nhóm máu: {activeRecord.bloodType}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#A8968F]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Khám: {activeRecord.examDate}</span>
                </div>
              </div>
            </div>

            {activeRecord.allergies && activeRecord.allergies.length > 0 ? (
              activeRecord.allergies.map((alg, idx) => (
                <div key={idx} className="bg-[#FCECE8] border border-[#F5DDD7] rounded-2xl p-4.5 flex items-start gap-3.5 animate-fadeIn">
                  <AlertTriangle className="w-5 h-5 text-[#843F2E] shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-[#843F2E] leading-relaxed">
                    Dị ứng: {alg.name} ({alg.reaction})
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-[#E6F5EE] border border-[#CDEFE0] rounded-2xl p-4.5 flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-[#2A7E5C] shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-[#2A7E5C] leading-relaxed">
                  Không ghi nhận dị ứng thuốc lâm sàng.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <span className="block text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Chẩn đoán</span>
              <div className="grid grid-cols-2 gap-4">

                <div className="bg-[#FAF1EC] border border-[#F2DDD3] rounded-2xl p-4 space-y-2.5 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">AI Đề xuất</span>
                    <span className="bg-[#FBEBE5] text-[#D3765F] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#F2DDD3]">
                      {activeRecord.aiPrediction.confidence}%
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-[#4A3E39] leading-tight">
                    {activeRecord.aiPrediction.disease}
                  </p>
                </div>

                <div className="bg-[#EBF7F2] border border-[#CDEFE0] rounded-2xl p-4 space-y-2.5 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#2A7E5C] uppercase tracking-wider">Bác sĩ kết luận</span>
                    <CheckCircle2 className="w-4 h-4 text-[#2A7E5C]" />
                  </div>
                  <p className="text-xs font-extrabold text-[#2A7E5C] leading-tight">
                    {activeRecord.doctorConclusion}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Đơn thuốc chỉ định</span>
              <div className="border border-[#EFE5E0] rounded-2xl overflow-hidden shadow-3xs bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6F3] border-b border-[#EFE5E0] text-[9px] font-extrabold text-[#A8968F] uppercase tracking-wider">
                      <th className="px-4 py-3">Tên thuốc</th>
                      <th className="px-4 py-3">Liều lượng</th>
                      <th className="px-4 py-3">Cách dùng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE5E0] text-xs font-semibold text-[#4A3E39]">
                    {activeRecord.prescriptions.map((med, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF6F3]/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#843F2E]">{med.name}</td>
                        <td className="px-4 py-3.5 text-[#6B5E59]">{med.dosage}</td>
                        <td className="px-4 py-3.5 text-[#80726B] leading-relaxed max-w-[150px] truncate" title={med.usage}>
                          {med.usage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[#EFE5E0] bg-[#FCF6F3]/30 space-y-3">
            <button
              onClick={() => window.print()}
              className="w-full bg-[#D3765F] hover:bg-[#843F2E] text-white text-xs font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#D3765F]/15 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Bệnh Án</span>
            </button>

            <button
              onClick={() => {

                const csvContent = "data:text/csv;charset=utf-8,ID,Patient,AI Prediction,Doctor Diagnosis\n"
                  + `${activeRecord.id},${activeRecord.patientName},${activeRecord.aiPrediction.disease},${activeRecord.doctorConclusion}`;
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `train_${activeRecord.id}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full bg-white border border-[#D3765F] hover:bg-[#FAF6F3] text-[#D3765F] text-xs font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất CSV train AI</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
