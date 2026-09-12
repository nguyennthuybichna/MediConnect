import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import useAuth from '../../hooks/useAuth';
import {
  Search,
  Bell,
  Download,
  ArrowUpRight,
  Users,
  Brain,
  TrendingUp,
  Activity,
  AlertTriangle,
  Lock,
  ChevronRight,
  Menu
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, showToast } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logs, setLogs] = useState([
    { id: '#PT-2294-A', condition: 'Acute Sinusitis (Suspected)', confidence: 92, status: 'Validated', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: '#PT-3102-C', condition: 'Early Cardiac Arrhythmia', confidence: 78, status: 'Pending Dr. Rev', statusColor: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: '#PT-1883-B', condition: 'Diabetic Retinopathy', confidence: 95, status: 'Validated', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
  ]);

  const [showWarning, setShowWarning] = useState(true);

  const handleExportCsv = () => {
    const header = "Patient ID,Detected Condition,AI Confidence,Status\n";
    const rows = logs.map(e => `"${e.id}","${e.condition}",${e.confidence},"${e.status}"`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);

    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `mediconnect_ai_training_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleActionClick = (logId, currentStatus) => {
    if (currentStatus === 'Pending Dr. Rev') {
      const confirmVal = window.confirm(`Bạn có muốn phê duyệt xác thực kết quả cho bệnh nhân ${logId}?`);
      if (confirmVal) {
        setLogs(logs.map(log =>
          log.id === logId
            ? { ...log, status: 'Validated', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
            : log
        ));
      }
    } else {
      showToast(`Bệnh án ${logId} đã được bác sĩ xác thực.`);
    }
  };

  return (
    <div className="flex bg-[#fdfbfb] min-h-screen text-slate-700 font-sans">

      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6 pb-20">

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
                placeholder="Tìm kiếm phân tích hoặc mã bệnh nhân..."
                className="bg-[#f5eae6]/40 border border-[#f5eae6] text-xs py-2.5 pl-9 pr-4 rounded-full w-full focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">

            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất bản CSV
            </button>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full border border-slate-100 shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
            </button>

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
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Phân tích Dữ liệu & Hiệu suất AI</h1>
            <p className="text-sm text-slate-500 mt-1">Thông tin sức khỏe thời gian thực hỗ trợ quyết định lâm sàng.</p>
          </div>
          <div className="flex items-center gap-3 self-start text-xs font-bold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Hệ thống: Đang chạy
            </span>
            <span className="text-slate-400 font-semibold">Cập nhật: 2 phút trước</span>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-3xl p-6 border border-[#f5eae6] shadow-sm flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Chỉ số chính xác AI</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3" />
                +0.4%
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">94.8%</span>
              <div className="w-full bg-[#f5eae6]/40 h-2.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full w-[94.8%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#f5eae6] shadow-sm flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tổng số bệnh nhân quản lý</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">so với tháng trước</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">12,482</span>
              <p className="text-[10px] text-slate-400 font-semibold mt-2.5">250 lượt đăng ký mới tuần này</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#f5eae6] shadow-sm flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Số ca tư vấn đang hoạt động</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-extrabold text-slate-800">42</span>
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="avatar" />
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" alt="avatar" />
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="avatar" />
              </div>
            </div>
            <p className="text-[10px] text-brand-700 font-bold uppercase tracking-wider mt-1.5">Đang chờ phản hồi phân loại y tế</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-800">Xu hướng lượng bệnh nhân</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Phân tích so sánh tỷ lệ nhập viện và xuất viện của bệnh nhân</p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full uppercase">
                30 ngày qua
              </span>
            </div>

            <div className="h-44 w-full relative pt-4">
              <svg className="w-full h-full" viewBox="0 0 600 150">

                <line x1="20" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1.5" />
                <line x1="20" y1="40" x2="580" y2="40" stroke="#f1f5f9" strokeWidth="1.5" />

                <path
                  d="M 20 110 Q 150 90 200 60 T 400 55 T 580 45"
                  fill="none"
                  stroke="#843f2e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                <path
                  d="M 20 120 Q 150 110 200 85 T 400 80 T 580 70"
                  fill="none"
                  stroke="#e39c8a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />

                <circle cx="200" cy="60" r="5" fill="#843f2e" />
                <circle cx="400" cy="55" r="5" fill="#843f2e" />
              </svg>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-4 mt-2">
                <span>Tuần 1</span>
                <span>Tuần 2</span>
                <span>Tuần 3</span>
                <span>Tuần 4</span>
              </div>
            </div>

            <div className="flex gap-4 justify-start text-xs font-bold text-slate-500 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#843f2e]"></span>
                <span>Bệnh nhân nhập viện</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#e39c8a]"></span>
                <span>Bệnh nhân xuất viện</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Độ chính xác chẩn đoán</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Độ chính xác của AI so với kiểm duyệt lâm sàng của Bác sĩ</p>
            </div>

            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiệu suất</span>
              <span className="text-4xl font-extrabold text-slate-800">+12%</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Chẩn đoán chính xác</span>
                </div>
                <span className="font-bold text-slate-800">88%</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Cần kiểm duyệt</span>
                </div>
                <span className="font-bold text-slate-800">12%</span>
              </div>
            </div>

            <button
              onClick={() => showToast('🔒 Đang mở lịch sử đánh giá độ chính xác chẩn đoán AI chi tiết...')}
              className="w-full text-center py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
            >
              Xem nhật ký chính xác
            </button>
          </div>
        </section>

        {showWarning && (
          <section className="bg-brand-500 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-white/5 blur-2xl"></div>
            <div className="space-y-2.5 relative z-10 max-w-4xl">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-brand-200" />
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-brand-100">Khuyến nghị từ AI</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Cảnh báo gia tăng bệnh theo mùa</h2>
              <p className="text-xs text-brand-50 font-light leading-relaxed">
                Dựa trên dữ liệu lịch sử và thông tin sức khỏe địa phương, AI dự báo số ca mắc bệnh hô hấp sẽ tăng 15% trong 14 ngày tới. Chúng tôi khuyến nghị tối ưu hóa nhân sự tại bộ phận Phân loại y tế và chuẩn bị sẵn vật tư nhi khoa.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 relative z-10 w-full md:w-auto justify-end">
              <button
                onClick={() => showToast('🚀 Đã triển khai quy trình tối ưu hoá nhân sự và dự phòng thiết bị thành công!')}
                className="bg-white hover:bg-slate-50 text-[#843f2e] font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-[0.98]"
              >
                Triển khai quy trình
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="text-xs text-brand-100 hover:text-white font-bold transition-colors"
              >
                Bỏ qua khuyến nghị
              </button>
            </div>
          </section>
        )}

        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Nhật ký các ca bệnh quan trọng</h3>
            <button className="text-xs font-bold text-[#843f2e] hover:underline">Xem tất cả bệnh án</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã bệnh nhân</th>
                  <th className="py-3 px-4">Bệnh lý phát hiện</th>
                  <th className="py-3 px-4">Độ tin cậy AI</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{log.id}</td>
                    <td className="py-4 px-4 font-medium">
                      {log.condition === 'Acute Sinusitis (Suspected)' ? 'Viêm xoang cấp tính (Nghi ngờ)' : log.condition === 'Early Cardiac Arrhythmia' ? 'Rối loạn nhịp tim giai đoạn đầu' : log.condition === 'Diabetic Retinopathy' ? 'Bệnh võng mạc đái tháo đường' : log.condition}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold min-w-8">{log.confidence}%</span>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${log.confidence >= 90 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                            style={{ width: `${log.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${log.statusColor}`}>
                        {log.status === 'Validated' ? 'Đã xác thực' : 'Chờ kiểm duyệt'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleActionClick(log.id, log.status)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition-all ${
                          log.status === 'Validated'
                            ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-default'
                            : 'bg-brand-500 hover:bg-brand-600 text-white border-brand-500 shadow-sm'
                        }`}
                      >
                        {log.status === 'Validated' ? 'Đã xác thực' : 'Xác thực'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <footer className="fixed bottom-0 left-0 md:left-64 right-0 text-center py-2.5 bg-white/85 backdrop-blur-sm border-t border-slate-100 text-[10px] font-semibold text-slate-400 z-20 uppercase tracking-wide">
        © 2026 MediMind AI Systems. Mọi dữ liệu y tế đều được mã hóa bảo mật theo tiêu chuẩn HIPAA.
      </footer>
    </div>
  );
};

export default AdminDashboard;
