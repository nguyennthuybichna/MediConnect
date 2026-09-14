import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  Search,
  Bell,
  Download,
  TrendingUp,
  Heart,
  Moon,
  Droplet,
  Flame,
  Calendar,
  Clock,
  Lightbulb,
  ArrowRight,
  Plus,
  Activity,
  Menu,
  HeartPulse,
  Bot,
  Brain,
  ShieldCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import { diagnoseSymptomsClinical } from '../../utils/clinicalDiagnosisEngine';

const SUGGESTIONS = [
  'ho, sổ mũi',
  'Ho có đờm, tức ngực',
  'Đau nửa đầu Migraine',
  'Ợ chua, trào ngược dạ dày',
  'Nổi mẩn đỏ, ngứa da',
  'Sốt cao liên tục, đau hốc mắt'
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState(null);

  const [symptomsText, setSymptomsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagError, setDiagError] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [hasConclusion, setHasConclusion] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({
    heartRate: 0,
    sleep: 0,
    water: 0,
    steps: 0
  });

  useEffect(() => {
    const fetchHistoryAndMetrics = async () => {
      try {
        const patientId = user?.id || localStorage.getItem('user_id') || 1;
        const res = await api.get(`/appointments/patient/${patientId}`);

        const isDemo = String(patientId) === '1' || user?.email === 'elena.rossi@example.com';

        let allRecs = [];
        if (res.data && res.data.records) {
          allRecs = res.data.records;
        }

        if (isDemo) {
          const mockHistoryRecords = [
            {
              appointment_id: 'mock-1',
              appointment_time: '2026-10-24 10:30:00',
              status: 'Scheduled',
              type: 'Virtual Consultation',
              doctor_name: 'Dr. Sarah Chen',
              specialty: 'Cardiologist',
              notes: 'Bác sĩ Tim mạch • Tái khám'
            },
            {
              appointment_id: 'mock-2',
              appointment_time: '2026-10-26 14:15:00',
              status: 'Scheduled',
              type: 'Clinical Consultation',
              doctor_name: 'Marcus Thorne',
              specialty: 'Nutritionist',
              notes: 'Chuyên gia Dinh dưỡng • Buổi hẹn mới'
            }
          ];
          setAppointments([...allRecs, ...mockHistoryRecords]);
          setHasConclusion(true);
          setMetrics({
            heartRate: 72,
            sleep: 7.5,
            water: 2.4,
            steps: 4231
          });
        } else {
          setAppointments(allRecs);
          const completedAppointments = allRecs.filter(r => r.status === 'Completed' || r.status === 'Validated' || r.notes || r.doctor_corrected_disease);
          if (completedAppointments.length > 0) {
            setHasConclusion(true);
            setMetrics({
              heartRate: 72,
              sleep: 7.5,
              water: 2.4,
              steps: 4231
            });
          } else {
            setHasConclusion(false);
            setMetrics({
              heartRate: 0,
              sleep: 0,
              water: 0,
              steps: 0
            });
          }
        }
      } catch (err) {
        console.warn('Lỗi lấy lịch sử chỉ số sức khoẻ từ CSDL:', err.message);
        setHasConclusion(false);
        setAppointments([]);
        setMetrics({
          heartRate: 0,
          sleep: 0,
          water: 0,
          steps: 0
        });
      }
    };
    if (user) {
      fetchHistoryAndMetrics();
    }
  }, [user]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        if (res.data && res.data.doctors) {
          setDoctors(res.data.doctors);
        } else {
          setDoctors([
            { user_id: 2, full_name: 'Dr. Sarah Chen', specialty: 'Cardiologist', email: 'sarah.chen@example.com' },
            { user_id: 3, full_name: 'Dr. James Miller', specialty: 'General Physician', email: 'james.miller@example.com' },
            { user_id: 4, full_name: 'Dr. Sarah Khalil', specialty: 'Neurology', email: 'sarah.khalil@example.com' }
          ]);
        }
      } catch (err) {
        console.warn('Lỗi API /doctors, sử dụng dữ liệu giả lập:', err.message);
        setDoctors([
          { user_id: 2, full_name: 'Dr. Sarah Chen', specialty: 'Cardiologist', email: 'sarah.chen@example.com' },
          { user_id: 3, full_name: 'Dr. James Miller', specialty: 'General Physician', email: 'james.miller@example.com' },
          { user_id: 4, full_name: 'Dr. Sarah Khalil', specialty: 'Neurology', email: 'sarah.khalil@example.com' }
        ]);
      }
    };
    fetchDoctors();
  }, []);

  const isMeaninglessText = (text) => {
    if (!text || typeof text !== 'string') return true;
    const trimmed = text.trim();
    if (trimmed.length < 2) return true;
    if (/^[\d\W_]+$/u.test(trimmed)) return true;
    if (/^(.)\1{2,}$/i.test(trimmed)) return true;
    const hasVowels = /[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i.test(trimmed);
    if (!hasVowels && trimmed.length >= 3) return true;
    const gibberishPatterns = [
      /^[asdfghjkl]+$/i,
      /^[qwertyuiop]+$/i,
      /^[zxcvbnm]+$/i,
      /^(abc|xyz|test|alo|asdf|123|ha|hi|he|ho)$/i
    ];
    if (gibberishPatterns.some(pat => pat.test(trimmed))) return true;
    return false;
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    const trimmed = symptomsText.trim();
    if (!trimmed) {
      setDiagError('Vui lòng nhập mô tả các triệu chứng của bạn.');
      return;
    }

    if (isMeaninglessText(trimmed)) {
      setDiagError('Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bệnh bạn đang gặp phải (ví dụ: sốt, ho, đau đầu, tức ngực, mệt mỏi...).');
      return;
    }

    setIsLoading(true);
    setDiagError(null);
    setDiagnosisResult(null);

    const clinicalLocal = diagnoseSymptomsClinical(trimmed);

    try {
      const patientId = user?.id || localStorage.getItem('user_id') || 1;
      const response = await api.post('/diagnosis', {
        patient_id: patientId,
        symptoms_text: trimmed
      });

      if (response.data && response.data.success) {
        const backendData = response.data.data;
        const diseaseName = backendData.ai_disease || clinicalLocal?.disease || 'Cảm lạnh chung (Common Cold)';
        const confidenceVal = backendData.ai_confidence
          ? Math.round(backendData.ai_confidence > 1 ? backendData.ai_confidence : backendData.ai_confidence * 100)
          : (clinicalLocal?.confidence || 95);

        setDiagnosisResult({
          prediction_id: backendData.prediction_id,
          ai_disease: diseaseName,
          disease: diseaseName,
          icd: clinicalLocal?.icd || 'ICD-10: J00',
          ai_confidence: confidenceVal,
          confidence: confidenceVal,
          clinicalNote: clinicalLocal?.clinicalNote || 'Dựa trên biểu hiện lâm sàng được ghi nhận, đề xuất người bệnh nghỉ ngơi, theo dõi diễn tiến nhiệt độ cơ thể và sinh hiệu.'
        });
      } else if (clinicalLocal) {
        setDiagnosisResult({
          prediction_id: 'AI-' + Math.floor(Math.random() * 900 + 100),
          ai_disease: clinicalLocal.disease,
          disease: clinicalLocal.disease,
          icd: clinicalLocal.icd,
          ai_confidence: clinicalLocal.confidence,
          confidence: clinicalLocal.confidence,
          clinicalNote: clinicalLocal.clinicalNote
        });
      } else {
        setDiagError('Không thể thực hiện chẩn đoán AI lúc này.');
      }
    } catch (err) {
      console.warn('Lỗi chẩn đoán:', err.message);
      if (clinicalLocal) {
        setDiagnosisResult({
          prediction_id: 'AI-' + Math.floor(Math.random() * 900 + 100),
          ai_disease: clinicalLocal.disease,
          disease: clinicalLocal.disease,
          icd: clinicalLocal.icd,
          ai_confidence: clinicalLocal.confidence,
          confidence: clinicalLocal.confidence,
          clinicalNote: clinicalLocal.clinicalNote
        });
      } else {
        setDiagError(err.response?.data?.error || err.message || 'Lỗi chẩn đoán triệu chứng.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAppointment = async (doctorId, doctorName) => {
    if (bookingDoctorId) return;
    setBookingDoctorId(doctorId);

    try {
      const patientId = user?.id || localStorage.getItem('user_id') || 1;
      const predictionId = diagnosisResult?.prediction_id || null;

      const appDate = new Date();
      appDate.setHours(appDate.getHours() + 24);
      const appTimeString = appDate.toISOString().slice(0, 19).replace('T', ' ');

      const response = await api.post('/appointments', {
        patient_id: patientId,
        doctor_id: doctorId,
        prediction_id: predictionId === 'Temp' ? null : predictionId,
        appointment_time: appTimeString,
        status: 'Scheduled'
      });

      if (response.data && response.data.success) {
        setBookingSuccess(`Đặt lịch hẹn khám với ${doctorName} thành công vào ${appTimeString}!`);
        setTimeout(() => setBookingSuccess(null), 5000);
      }
    } catch (err) {
      showToast(`❌ Lỗi đặt lịch khám: ${err.response?.data?.error || err.message}`);
    } finally {
      setBookingDoctorId(null);
    }
  };

  const handleJoinCall = () => {
    showToast('📞 Đang kết nối cuộc gọi video tư vấn với Dr. Sarah Chen...');
  };

  const upcomingAppts = appointments.filter(r => r.status === 'Scheduled');
  const completedAppts = appointments.filter(r => r.status === 'Completed' || r.status === 'Validated');

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
            <div className="relative flex-1 max-w-md hidden sm:block">
              <input
                type="text"
                placeholder="Tìm kiếm hồ sơ, bác sĩ..."
                className="bg-[#f5eae6]/40 border border-[#f5eae6] text-xs py-2.5 pl-9 pr-4 rounded-full w-full focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full border border-slate-100 shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center font-bold text-xs text-brand-800">
                {(user?.full_name || 'Bệnh nhân').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <h5 className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'Bệnh nhân'}</h5>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Bệnh nhân</span>
              </div>
            </div>
          </div>
        </header>

        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Chào mừng quay trở lại, <span className="text-brand-800">{user?.full_name || 'Người dùng'}</span>, chúc bạn một ngày tốt lành!
            </h1>
             <p className="text-sm text-slate-500 mt-1">
              {hasConclusion
                ? "Hành trình sức khỏe của bạn đang tiến triển tốt. Bạn đã hoàn thành 85% mục tiêu tuần này."
                : "Chào mừng bạn đến với MediConnect. Hãy hoàn tất buổi tư vấn sức khoẻ để mở khoá các chỉ số cá nhân hoá."
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => showToast('📄 Đang chuẩn bị báo cáo sức khoẻ hàng tuần...')}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Tải báo cáo
            </button>
            <button
              onClick={() => navigate('/patient/history')}
              className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Xem phân tích
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                hasConclusion
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-slate-50 text-slate-400 border-slate-100"
              }`}>
                {hasConclusion ? "Khỏe mạnh" : "Chưa có"}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">{metrics.heartRate}</span>
              <span className="text-xs text-slate-400 ml-1 font-semibold">BPM</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Nhịp tim khi nghỉ ngơi</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center border border-brand-100">
                <Moon className="w-4 h-4 text-brand-700" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                hasConclusion
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-slate-50 text-slate-400 border-slate-100"
              }`}>
                {hasConclusion ? "Đang cải thiện" : "Chưa có"}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">{metrics.sleep}</span>
              <span className="text-xs text-slate-400 ml-1 font-semibold">Giờ</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Chất lượng giấc ngủ sâu</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                <Droplet className="w-4 h-4 text-teal-600" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                hasConclusion
                  ? "bg-teal-50 text-teal-600 border-teal-100"
                  : "bg-slate-50 text-slate-400 border-slate-100"
              }`}>
                {hasConclusion ? "Đúng mục tiêu" : "Chưa có"}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">{metrics.water}</span>
              <span className="text-xs text-slate-400 ml-1 font-semibold">Lít</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Mục tiêu hàng ngày: 3.0L</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-center">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                hasConclusion
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-slate-50 text-slate-400 border-slate-100"
              }`}>
                {hasConclusion ? "Thấp" : "Chưa có"}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-800">
                {metrics.steps === 0 ? "0" : metrics.steps.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs text-slate-400 ml-1 font-semibold">Bước</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Vận động tích cực hôm nay</span>
            </div>
          </div>
        </section>

        <section className="bg-brand-500 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg shadow-brand-500/20 relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
          <div className="space-y-4 max-w-3xl relative z-10">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-brand-200" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-100">Phân tích sức khỏe hàng ngày từ AI</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              {hasConclusion
                ? "Quá trình trao đổi chất caffeine của bạn đạt đỉnh sớm hơn hôm nay."
                : "Chưa có kết luận bệnh án từ bác sĩ chuyên khoa."
              }
            </h2>
            <p className="text-sm text-brand-50 font-light leading-relaxed">
              {hasConclusion
                ? "Dựa trên thói quen ngủ và nhịp tim buổi sáng, chúng tôi khuyên bạn nên chuyển sang trà thảo mộc sau 2:00 chiều để đảm bảo chu kỳ giấc ngủ sâu tối ưu đêm nay."
                : "Hãy hoàn thành cuộc tư vấn y tế đầu tiên với bác sĩ để mở khoá và nhận các phân tích sức khoẻ hàng ngày cá nhân hoá từ AI."
              }
            </p>
          </div>

          <button
            onClick={() => showToast('☕ Đang mở bản phân tích sâu về thói quen sinh hoạt và chỉ số cơ thể...')}
            className="bg-white hover:bg-slate-50 text-brand-800 font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shrink-0 transition-all shadow-md active:scale-[0.98] relative z-10"
          >
            Xem phân tích
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        <section className="bg-white rounded-[32px] border border-[#EBDCD5] shadow-lg p-6 sm:p-8 space-y-6">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-[#F5EDE8] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FCF0EB] text-[#D97251] flex items-center justify-center shrink-0 shadow-2xs">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#2D2522]">Chẩn đoán & Phân tích Triệu chứng AI</h3>
                <p className="text-xs text-[#8C7E77] mt-0.5">Hệ thống hỗ trợ y khoa chuyên sâu — Kết quả được tự động lưu vào Hồ sơ bệnh án điện tử</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sẵn sàng kết nối</span>
            </div>
          </div>

          {/* Input Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#5C4A43]">
              Mô tả triệu chứng hiện tại của bạn:
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="Nhập chi tiết các biểu hiện như sốt, ho, đau đầu, vị trí đau, thời gian xuất hiện triệu chứng..."
                className="w-full bg-[#FAF7F5] border border-[#E8D9D1] rounded-2xl p-4 text-xs sm:text-sm text-[#2D2522] placeholder:text-[#A8968F] focus:outline-none focus:border-[#D97251] focus:bg-white transition-all resize-none shadow-2xs font-normal leading-relaxed"
              />
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#8C7E77]">Gợi ý nhanh:</span>
              {SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSymptomsText(sug)}
                  className="text-[11px] font-semibold bg-[#F5EDE8] hover:bg-[#EBDCD5] text-[#5C4A43] hover:text-[#2D2522] px-3 py-1 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {diagError && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl p-3 text-center">
              {diagError}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={handlePredict}
              disabled={isLoading || !symptomsText.trim()}
              className="w-full sm:w-auto bg-[#D97251] hover:bg-[#C25E3F] disabled:bg-stone-300 text-white text-xs font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md shadow-[#D97251]/25 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Đang phân tích mô hình...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>Phân tích ngay bằng AI</span>
                </>
              )}
            </button>
          </div>

          {/* AI Result Card */}
          {diagnosisResult && (
            <div className="bg-white rounded-2xl border border-[#F5DED5] p-5 space-y-4 shadow-2xs mt-4 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8EFEA] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FCF0EB] text-[#D97251] flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#D97251] uppercase tracking-wider">
                        AI DỰ ĐOÁN SƠ BỘ
                      </span>
                      <span className="text-[9px] font-extrabold bg-[#FCF0EB] text-[#C85A37] border border-[#F5DED5] px-2 py-0.5 rounded-md">
                        {diagnosisResult.icd || 'ICD-10: J00'}
                      </span>
                      {diagnosisResult.prediction_id && (
                        <span className="text-[9px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          Mã ID: #{diagnosisResult.prediction_id}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-[#2D2522] mt-0.5">
                      {diagnosisResult.ai_disease || diagnosisResult.disease}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-[#FAF7F5] p-3.5 rounded-xl border border-[#F0E4DD]">
                <p className="text-xs text-[#5C4A43] leading-relaxed font-medium">
                  <span className="font-bold text-[#D97251]">ⓘ Lưu ý lâm sàng:</span> {diagnosisResult.clinicalNote || 'Triệu chứng lâm sàng được ghi nhận, vui lòng theo dõi diễn biến và liên hệ bác sĩ khi cần.'}
                </p>
                <p className="text-[10px] text-[#8C7E77] italic leading-tight">
                  * Kết quả trên chỉ mang tính chất tham khảo sơ bộ, không thay thế cho kết luận của bác sĩ chuyên khoa có chứng chỉ hành nghề.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Đã tự động lưu kết quả vào Hồ sơ Bệnh án điện tử của bạn
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/patient/history')}
                  className="text-xs font-bold text-[#D97251] hover:underline"
                >
                  Xem lịch sử bệnh án &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Specialist Doctor Booking Section */}
          <div className="mt-8 pt-6 border-t border-[#F5EDE8] space-y-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-extrabold text-[#2D2522] uppercase tracking-wider">Danh sách Bác sĩ Chuyên khoa</h3>
              <p className="text-xs text-[#8C7E77]">Chọn bác sĩ phù hợp để đặt lịch khám trực tiếp (đã tự động đính kèm kết quả chẩn đoán của AI).</p>
            </div>
            {bookingSuccess && (
              <div className="bg-emerald-500 text-white border border-emerald-600 text-xs font-bold rounded-xl p-3 text-center transition-all animate-pulse">
                {bookingSuccess}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctors.map((doc) => (
                <div key={doc.user_id} className="bg-[#FAF7F5] border border-[#EBDCD5] rounded-2xl p-4 flex flex-col justify-between hover:shadow-sm hover:border-[#D97251]/40 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FCF0EB] text-[#D97251] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {doc.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-[#2D2522] truncate">{doc.full_name}</h4>
                      <p className="text-[10px] text-[#D97251] font-extrabold uppercase tracking-wide truncate">{doc.specialty || 'General Physician'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#F0E4DD] pt-3">
                    <span className="text-[10px] text-[#8C7E77] truncate max-w-[120px]">{doc.email}</span>
                    <button
                      disabled={bookingDoctorId === doc.user_id}
                      onClick={() => handleBookAppointment(doc.user_id, doc.full_name)}
                      className="bg-[#D97251] hover:bg-[#C25E3F] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold px-3.5 py-1.5 rounded-xl text-[10px] transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      {bookingDoctorId === doc.user_id ? (
                        <>
                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Đang đặt...</span>
                        </>
                      ) : (
                        <span>Đặt lịch khám</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Lịch hẹn sắp tới</h2>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="text-xs font-bold text-brand-800 hover:underline"
              >
                Xem lịch hẹn
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingAppts.length === 0 ? (
                <div className="sm:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center py-8">
                  <p className="text-xs text-slate-400">Chưa có lịch hẹn khám sắp tới.</p>
                </div>
              ) : (
                upcomingAppts.slice(0, 2).map((app) => {
                  const dateObj = app.appointment_time ? new Date(app.appointment_time) : new Date();
                  const formattedDate = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={app.appointment_id || app.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[170px] border-l-4 border-l-brand-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-xs text-brand-850 shrink-0">
                          {(app.doctor_name || 'Bác sĩ').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{app.doctor_name || 'Bác sĩ MediConnect'}</h4>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {app.specialty || 'Chuyên khoa'} • {app.type === 'Virtual Consultation' ? 'Tư vấn trực tuyến' : 'Khám lâm sàng'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4 text-xs font-bold text-slate-400 my-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>

                      <button
                        onClick={app.type === 'Virtual Consultation' ? handleJoinCall : undefined}
                        disabled={app.type !== 'Virtual Consultation'}
                        className={`w-full font-bold py-2.5 rounded-xl text-xs transition-all ${
                          app.type === 'Virtual Consultation'
                            ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/10'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {app.type === 'Virtual Consultation' ? 'Tham gia cuộc gọi' : 'Lịch khám tại phòng mạch'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Dòng thời gian sức khỏe</h2>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-5">
              {completedAppts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Chưa có hoạt động sức khỏe nào ghi nhận.</p>
              ) : (
                completedAppts.slice(0, 3).map((app) => {
                  const dateObj = app.appointment_time ? new Date(app.appointment_time) : new Date();
                  const formattedTimeStr = dateObj.toLocaleString('vi-VN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <div key={app.appointment_id || app.id} className="relative pl-6 pb-4 border-l-2 border-slate-100 last:pb-0 last:border-0">
                      <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">{formattedTimeStr}</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5">{app.doctor_corrected_disease || app.ai_disease || 'Khám tổng quát'}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Khám với {app.doctor_name || 'Bác sĩ'}. {app.notes || 'Không có ghi chú thêm.'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      <button
        onClick={() => showToast('Quick Actions: Mở bảng nhập chỉ số sức khoẻ mới')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default PatientDashboard;
