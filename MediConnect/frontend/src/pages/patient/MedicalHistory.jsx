import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  Search,
  Bell,
  Plus,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  X,
  Menu
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const MedicalHistory = () => {
  const { user, showToast } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [activeTab, setActiveTab] = useState('clinical');
  const [loading, setLoading] = useState(true);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleOpenDetailModal = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const mockRecords = [
    {
      id: 'mock-1',
      appointment_time: '2026-09-28 10:30:00',
      status: 'Completed',
      type: 'Virtual Consultation',
      doctor_name: 'Dr. Sarah Jenkins, MD',
      ai_disease: 'Common Seasonal Rhinitis',
      doctor_corrected_disease: 'Acute Sinusitis',
      is_verified: 1,
      notes: 'Bệnh nhân bị nghẹt mũi kéo dài kèm đau hốc mắt. AI dự đoán Rhinitis nhưng kết luận lâm sàng là Sinusitis.'
    },
    {
      id: 'mock-2',
      appointment_time: '2026-08-15 14:00:00',
      status: 'Completed',
      type: 'Emergency Triage',
      doctor_name: 'Dr. Michael Chen, Orthopedic',
      ai_disease: 'Grade I Sprain',
      doctor_corrected_disease: 'Tendonitis',
      is_verified: 1,
      notes: 'Đau gót chân khi hoạt động thể thao nặng.'
    },
    {
      id: 'mock-3',
      appointment_time: '2026-06-02 09:00:00',
      status: 'Completed',
      type: 'Annual Review',
      doctor_name: 'Dr. Sarah Khalil, Neurology',
      ai_disease: 'Optimal Baseline Established',
      doctor_corrected_disease: 'Optimal Baseline Established',
      is_verified: 1,
      notes: 'Khám sức khỏe thần kinh định kỳ.'
    }
  ];

  const mockAiPredictions = [
    {
      prediction_id: 'ai-mock-1',
      created_at: '2026-08-28T10:15:00.000Z',
      symptoms_text: 'ho kéo dài, sốt nhẹ vào chiều tối, đau tức ngực nhẹ khi thở sâu',
      ai_disease: 'Viêm phế quản cấp tính',
      ai_confidence: 0.88,
      doctor_corrected_disease: null,
      is_verified: 0,
      chat_history: JSON.stringify([
        { role: 'ai', text: 'Chào bạn, tôi là trợ lý y khoa MediConnect. Hãy mô tả chi tiết các triệu chứng bạn đang gặp phải nhé.' },
        { role: 'patient', text: 'Tôi bị ho kéo dài tầm 5 ngày nay rồi' },
        { role: 'ai', text: 'Bạn có triệu chứng nào kèm theo như sốt, đau ngực hay khó thở không?' },
        { role: 'patient', text: 'Tôi có sốt nhẹ vào chiều tối, đau tức ngực nhẹ khi thở sâu nữa' },
        { role: 'ai', text: 'Dựa trên mô tả triệu chứng của bạn, đây có thể là dấu hiệu của **Viêm phế quản cấp tính**.' }
      ])
    },
    {
      prediction_id: 'ai-mock-2',
      created_at: '2026-08-20T08:30:00.000Z',
      symptoms_text: 'đau ngực trái lan ra sau lưng, mệt mỏi, khó thở khi leo cầu thang',
      ai_disease: 'Cơn đau thắt ngực',
      ai_confidence: 0.72,
      doctor_corrected_disease: 'Cơn đau thắt ngực ổn định (I20.9)',
      is_verified: 1,
      chat_history: null
    }
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const patientId = user?.id || localStorage.getItem('user_id') || 1;

        const res = await api.get(`/appointments/patient/${patientId}`);
        const isDemo = String(patientId) === '1' || user?.email === 'elena.rossi@example.com';

        let clinicalList = [];
        if (res.data && Array.isArray(res.data.records)) {
          clinicalList = res.data.records;
        } else if (res.data && Array.isArray(res.data.data)) {
          clinicalList = res.data.data;
        } else if (Array.isArray(res.data)) {
          clinicalList = res.data;
        }

        if (isDemo) {
          setRecords([...clinicalList, ...mockRecords]);
        } else {
          setRecords(clinicalList.length > 0 ? clinicalList : mockRecords);
        }

        try {
          const aiRes = await api.get('/diagnosis/history');
          let aiList = [];
          if (aiRes.data && Array.isArray(aiRes.data.data)) {
            aiList = aiRes.data.data;
          } else if (aiRes.data && Array.isArray(aiRes.data.records)) {
            aiList = aiRes.data.records;
          } else if (Array.isArray(aiRes.data)) {
            aiList = aiRes.data;
          }

          if (isDemo) {
            setAiPredictions([...aiList, ...mockAiPredictions]);
          } else {
            setAiPredictions(aiList.length > 0 ? aiList : mockAiPredictions);
          }
        } catch (aiErr) {
          console.warn('Lỗi lấy lịch sử chẩn đoán AI từ CSDL:', aiErr.message);
          setAiPredictions(mockAiPredictions);
        }

      } catch (err) {
        console.warn('Lỗi lấy lịch sử bệnh án từ CSDL, sử dụng dữ liệu giả lập:', err.message);
        setRecords(mockRecords);
        setAiPredictions(mockAiPredictions);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const safeRecords = Array.isArray(records) ? records : [];
  const safeAiPredictions = Array.isArray(aiPredictions) ? aiPredictions : [];

  const completedRecords = safeRecords.filter(r => r.status === 'Completed' || r.status === 'Validated');
  const totalVisits = completedRecords.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const visitsThisMonth = completedRecords.filter(r => {
    if (!r.appointment_time) return false;
    const d = new Date(r.appointment_time);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const healthStability = totalVisits > 0 ? "92%" : "0%";

  const upcomingAppointments = safeRecords
    .filter(r => r.status === 'Scheduled' && r.appointment_time && new Date(r.appointment_time) > new Date())
    .sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time));
  const nextApp = upcomingAppointments[0];

  const filteredRecords = safeRecords.filter(rec => {
    const docName = rec.doctor_name || rec.doctor || '';
    const aiDiag = rec.ai_disease || rec.aiDiagnosis || '';
    const type = rec.type || 'Clinical Consultation';
    return docName.toLowerCase().includes(filterQuery.toLowerCase()) ||
           aiDiag.toLowerCase().includes(filterQuery.toLowerCase()) ||
           type.toLowerCase().includes(filterQuery.toLowerCase());
  });

  const filteredAiPredictions = safeAiPredictions.filter(rec => {
    const aiDiag = rec.ai_disease || '';
    const symptoms = rec.symptoms_text || '';
    return aiDiag.toLowerCase().includes(filterQuery.toLowerCase()) ||
           symptoms.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div className="flex bg-[#fdfbfb] min-h-screen text-slate-700 font-sans">

      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto space-y-8">

        <header className="flex justify-between items-center gap-4 border-b border-[#f5eae6] pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-800 md:hidden rounded-xl bg-white border border-[#f5eae6] shadow-xs"
              title="Mở Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Lịch sử Bệnh án</span>
          </div>
          <div className="flex items-center gap-4">

            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Tìm kiếm bệnh án..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="bg-[#f5eae6]/40 border border-[#f5eae6] text-xs py-2 pl-9 pr-4 rounded-full w-56 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full border border-slate-100 shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center font-bold text-xs text-brand-800">
                {(user?.full_name || 'Elena Rossi').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-3xl p-6 border border-[#f5eae6] shadow-sm flex flex-col justify-between min-h-[120px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tổng số buổi khám</span>
            <div className="flex justify-between items-end mt-4">
              <span className="text-3xl font-extrabold text-slate-800">{totalVisits}</span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{visitsThisMonth} trong tháng này
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#f5eae6] shadow-sm flex flex-col justify-between min-h-[120px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Chỉ số ổn định sức khỏe</span>
              <span className="text-xs font-bold text-slate-500">{totalVisits > 0 ? "Độ tin cậy cao" : "Chưa có dữ liệu"}</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">{healthStability}</span>
              <div className="w-full bg-[#f5eae6]/40 h-2.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-brand-800 h-full rounded-full" style={{ width: totalVisits > 0 ? '92%' : '0%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-brand-500 text-white rounded-3xl p-6 shadow-md flex items-center gap-4 min-h-[120px]">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-brand-100">Lịch khám kế tiếp</span>
              <h4 className="text-lg font-bold mt-0.5 font-sans">
                {nextApp
                  ? new Date(nextApp.appointment_time).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })
                  : "Chưa có lịch"}
              </h4>
              <p className="text-xs text-brand-50 font-light mt-0.5">
                {nextApp
                  ? (nextApp.type === 'Virtual Consultation' ? 'Tư vấn trực tuyến' : nextApp.type === 'Emergency Triage' ? 'Cấp cứu ban đầu' : 'Khám lâm sàng')
                  : "Hãy đặt lịch hẹn mới"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800">Hoạt động Gần đây</h2>
            <div className="flex gap-2 self-end">
              <button className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                Lọc
              </button>
              <button className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Xuất bản PDF
              </button>
            </div>
          </div>

          <div className="flex border-b border-[#f5eae6] mb-6">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all px-4 relative ${
                activeTab === 'clinical' ? 'text-brand-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Lịch sử khám Bác sĩ
              {activeTab === 'clinical' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-800"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all px-4 relative ${
                activeTab === 'ai' ? 'text-brand-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Lịch sử chẩn đoán AI
              {activeTab === 'ai' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-800"></div>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === 'clinical' ? (
              records.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Chưa có hồ sơ bệnh án nào</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Bạn chưa có lịch sử tư vấn hoặc chẩn đoán y khoa nào được hoàn thành bởi bác sĩ. Hãy đặt lịch hẹn khám để bắt đầu quá trình theo dõi sức khỏe của bạn.
                  </p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Không tìm thấy kết quả</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Không tìm thấy bệnh án nào phù hợp với từ khóa "{filterQuery}". Vui lòng thử từ khóa khác.
                  </p>
                </div>
              ) : (
                filteredRecords.map((record) => {
                  const dateObj = record.appointment_time
                    ? new Date(record.appointment_time)
                    : new Date();
                  const month = dateObj.toLocaleString('vi-VN', { month: 'short' }).toUpperCase();
                  const day = dateObj.getDate();

                  return (
                    <div
                      key={record.appointment_id || record.id}
                      className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-2xl border shrink-0 flex flex-col items-center justify-center font-bold shadow-sm bg-rose-50 text-rose-700 border-rose-100">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 leading-tight">{month}</span>
                        <span className="text-xl font-extrabold leading-none mt-0.5">{day}</span>
                      </div>

                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {record.status === 'Completed' ? 'Đã hoàn thành' : record.status === 'Scheduled' ? 'Đã lên lịch' : record.status || 'Đã hoàn thành'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400 font-semibold">
                            {record.type === 'Virtual Consultation' ? 'Tư vấn trực tuyến' : record.type === 'Emergency Triage' ? 'Cấp cứu ban đầu' : record.type === 'Annual Review' ? 'Khám định kỳ' : 'Khám lâm sàng'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {record.doctor_name || 'Bác sĩ MediConnect'}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-50">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dự đoán ban đầu của AI</span>
                            <span className="text-xs font-semibold text-slate-600">
                              {record.ai_disease || 'N/A'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kết luận của Bác sĩ</span>
                            <span className="text-xs font-bold text-[#843f2e]">
                              {record.doctor_corrected_disease || record.ai_disease || 'Đang chờ xác nhận'}
                            </span>
                          </div>

                          {record.notes && (
                            <div className="sm:col-span-2 mt-1">
                              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Ghi chú lâm sàng</span>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-light mt-0.5">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenDetailModal(record)}
                        className="w-full md:w-auto px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  );
                })
              )
            ) : (
              aiPredictions.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Chưa có lịch sử chẩn đoán AI</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Bạn chưa thực hiện cuộc chẩn đoán triệu chứng nào với MediMind AI. Hãy truy cập mục "Chẩn đoán AI" để bắt đầu.
                  </p>
                </div>
              ) : filteredAiPredictions.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Không tìm thấy kết quả</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Không tìm thấy chẩn đoán AI nào phù hợp với từ khóa "{filterQuery}".
                  </p>
                </div>
              ) : (
                filteredAiPredictions.map((record) => {
                  const dateObj = record.created_at
                    ? new Date(record.created_at)
                    : new Date();
                  const month = dateObj.toLocaleString('vi-VN', { month: 'short' }).toUpperCase();
                  const day = dateObj.getDate();

                  return (
                    <div
                      key={record.prediction_id || record.id}
                      className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                    >
                      <div className="w-14 h-14 rounded-2xl border shrink-0 flex flex-col items-center justify-center font-bold shadow-sm bg-[#faf1ec] text-[#d3765f] border-[#f2ddd3]">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 leading-tight">{month}</span>
                        <span className="text-xl font-extrabold leading-none mt-0.5">{day}</span>
                      </div>

                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                            record.is_verified
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {record.is_verified ? 'Đã bác sĩ xác thực' : 'Tự chẩn đoán AI'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          Chẩn đoán AI: {record.ai_disease}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-50">
                          <div className="sm:col-span-2">
                            <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Triệu chứng đã mô tả</span>
                            <p className="text-xs font-semibold text-slate-600 leading-relaxed italic mt-0.5">
                              "{record.symptoms_text}"
                            </p>
                          </div>

                          {record.doctor_corrected_disease && (
                            <div className="sm:col-span-2 mt-1 border-t border-slate-50 pt-2">
                              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Kết luận lâm sàng cuối cùng</span>
                              <span className="text-xs font-bold text-[#843f2e]">
                                {record.doctor_corrected_disease}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenDetailModal({ ...record, isAiOnly: true })}
                        className="w-full md:w-auto px-5 py-2.5 bg-[#d3765f] hover:bg-[#843f2e] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  );
                })
              )
            )}
          </div>
        </section>

        <section className="flex items-center justify-center gap-1.5 pt-4">
          <button
            disabled={activePage === 1}
            onClick={() => setActivePage(prev => Math.max(prev - 1, 1))}
            className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                activePage === page
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <span className="text-slate-400 text-xs px-1">...</span>

          <button
            onClick={() => setActivePage(8)}
            className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
              activePage === 8
                ? 'bg-brand-800 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
          >
            8
          </button>

          <button
            disabled={activePage === 8}
            onClick={() => setActivePage(prev => Math.min(prev + 1, 8))}
            className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

      </main>

      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-brand-100/50 flex flex-col max-h-[90vh]">

            <div className={`bg-gradient-to-r ${selectedRecord.isAiOnly ? 'from-[#d3765f] to-[#843f2e]' : 'from-brand-700 to-brand-850'} p-5 text-white relative shrink-0`}>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{selectedRecord.isAiOnly ? 'Chi tiết Chẩn đoán AI' : 'Chi tiết Chẩn đoán Y khoa'}</h3>
                  <p className="text-[11px] text-brand-100 font-semibold mt-0.5">
                    {new Date(selectedRecord.created_at || selectedRecord.appointment_time).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs md:text-sm">
              {selectedRecord.isAiOnly ? (
                <>

                  <div className="space-y-1">
                    <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Triệu chứng khai báo</h4>
                    <p className="text-slate-800 font-medium italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{selectedRecord.symptoms_text}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">AI Dự kiến bệnh lý</h4>
                      <p className="text-slate-850 font-bold text-[#843f2e]">
                        {selectedRecord.ai_disease}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Trạng thái xác thực</h4>
                      <p className={`font-bold ${selectedRecord.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {selectedRecord.is_verified ? 'Đã bác sĩ xác thực' : 'Tự chẩn đoán AI'}
                      </p>
                    </div>
                  </div>

                  {selectedRecord.doctor_corrected_disease && (
                    <div className="space-y-1 border-t border-[#f5eae6] pt-4">
                      <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Kết luận lâm sàng cuối cùng</h4>
                      <p className="text-[#843F2E] font-bold text-sm">
                        {selectedRecord.doctor_corrected_disease}
                      </p>
                    </div>
                  )}

                  {selectedRecord.chat_history && (() => {
                    try {
                      const chatArr = JSON.parse(selectedRecord.chat_history);
                      if (Array.isArray(chatArr) && chatArr.length > 0) {
                        return (
                          <div className="space-y-2 border-t border-[#f5eae6] pt-4">
                            <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider mb-2">Nhật ký hội thoại với AI</h4>
                            <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto space-y-2.5">
                              {chatArr.map((msg, msgIdx) => {
                                const isAi = msg.role === 'ai' || msg.sender === 'ai';
                                return (
                                  <div key={msgIdx} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                                    <span className="text-[9px] text-slate-400 font-bold mb-0.5">{isAi ? 'MediMind AI' : 'Bệnh nhân'}</span>
                                    <div className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                                      isAi
                                        ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                        : 'bg-brand-600 text-white rounded-tr-none'
                                    }`}>
                                      {msg.text}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    } catch (e) {
                      console.error("Lỗi parse chat history:", e);
                    }
                    return null;
                  })()}
                </>
              ) : (
                <>

                  <div className="space-y-1">
                    <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Bác sĩ điều trị</h4>
                    <p className="text-slate-850 font-bold">
                      {selectedRecord.doctor_name || 'Bác sĩ MediConnect'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">AI dự báo ban đầu</h4>
                      <p className="text-slate-650 font-semibold">
                        {selectedRecord.ai_disease || 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Bác sĩ kết luận</h4>
                      <p className="text-[#843F2E] font-bold">
                        {selectedRecord.doctor_corrected_disease || 'Chưa duyệt'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-[#f5eae6] pt-4">
                    <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Ghi chú lâm sàng & Dặn dò</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {selectedRecord.notes || 'Không có ghi chú nào.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t border-[#f5eae6] pt-4">
                    <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Đơn thuốc chỉ định</h4>
                    <div className="bg-[#FCF9F7] border border-[#EFE5E0] rounded-xl p-3.5 text-xs font-semibold text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedRecord.prescription || 'Không có chỉ định kê đơn.'}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              {activeTab === 'clinical' && selectedRecord && (
                <a
                  href={`/prescription/public/${selectedRecord.appointment_id || selectedRecord.id || 'demo_appointment_id'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#843F2E] border border-rose-200 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  📄 Xem Toa thuốc & Tải QR
                </a>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => showToast('Quick Actions: Thêm hồ sơ bệnh lịch mới')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MedicalHistory;
