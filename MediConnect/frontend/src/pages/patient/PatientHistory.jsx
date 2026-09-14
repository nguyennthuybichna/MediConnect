import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  Activity,
  Bot,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

const PatientHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchDiagnosisHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/diagnosis/history');

      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setHistory(data);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử chẩn đoán:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosisHistory();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} • ${hours}:${minutes}`;
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatConfidence = (confidence) => {
    if (confidence === null || confidence === undefined) return '0%';
    const num = parseFloat(confidence);
    if (isNaN(num)) return '0%';

    const percentage = num <= 1 ? num * 100 : num;
    return `${Math.round(percentage)}%`;
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.symptoms_text && item.symptoms_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.ai_disease && item.ai_disease.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.doctor_corrected_disease && item.doctor_corrected_disease.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === 'verified') {
      return matchesSearch && Number(item.is_verified) === 1;
    }
    if (filterStatus === 'pending') {
      return matchesSearch && Number(item.is_verified) === 0;
    }
    return matchesSearch;
  });

  const totalCount = history.length;
  const verifiedCount = history.filter((item) => Number(item.is_verified) === 1).length;
  const pendingCount = totalCount - verifiedCount;

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Hồ sơ sức khỏe cá nhân
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Lịch sử Chẩn đoán Bệnh lý
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi quá trình ghi nhận triệu chứng, phân tích AI và kết luận chẩn đoán chính thức từ bác sĩ.
              </p>
            </div>

            <button
              onClick={fetchDiagnosisHistory}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              Làm mới
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="bg-slate-50/80 rounded-xl p-4 border border-gray-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng lượt khám/chẩn đoán</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalCount}</p>
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Đã có kết luận chính thức</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-2">{verifiedCount}</p>
            </div>

            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">Đang chờ bác sĩ khám</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-900 mt-2">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo triệu chứng, bệnh lý..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterStatus === 'verified'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Chính thức ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              Chờ khám ({pendingCount})
            </button>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                  </div>
                </div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-red-900 mb-1">Không thể tải dữ liệu lịch sử</h3>
            <p className="text-sm text-red-700 mb-4 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchDiagnosisHistory}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {!loading && !error && filteredHistory.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Chưa có bản ghi chẩn đoán nào</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'Không tìm thấy kết quả nào phù hợp với bộ lọc hiện tại của bạn.'
                : 'Bạn chưa có dữ liệu chẩn đoán bệnh lý nào trong hệ thống.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredHistory.length > 0 && (
          <div className="space-y-4">
            {filteredHistory.map((item, index) => {
              const isVerified = Number(item.is_verified) === 1;
              const officialDiagnosis =
                item.doctor_corrected_disease && item.doctor_corrected_disease.trim() !== ''
                  ? item.doctor_corrected_disease
                  : item.ai_disease;

              return (
                <div
                  key={item.prediction_id || index}
                  className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >

                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isVerified ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>Khai báo: <strong className="text-gray-900 font-semibold">{formatDateTime(item.created_at)}</strong></span>
                      <span className="text-xs text-gray-400 hidden sm:inline">({formatDateOnly(item.created_at)})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        #PRED-{item.prediction_id || index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

                    <div className="bg-slate-50/70 rounded-xl p-4 border border-gray-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          Triệu chứng đã khai báo
                        </div>
                        <p className="text-sm italic text-gray-600 leading-relaxed pl-1">
                          "{item.symptoms_text || 'Không có mô tả chi tiết'}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                            <Bot className="w-4 h-4 text-blue-600" />
                            AI Chẩn đoán Sơ bộ
                          </div>
                        </div>
                        <p className="text-base font-bold text-gray-900 mt-1">
                          {item.ai_disease || 'Chưa xác định'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-4 border transition-all ${
                      isVerified
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isVerified ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                          Kết luận Bác sĩ Chuyên khoa
                        </span>
                      </div>

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Kết luận Chính thức
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 w-fit">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Đang chờ Bác sĩ khám thực tế
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pl-1">
                      {isVerified ? (
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                            {officialDiagnosis}
                          </p>
                          <p className="text-xs text-emerald-700">
                            Kết luận chẩn đoán bệnh lý đã được bác sĩ chuyên khoa thăm khám lâm sàng và xác thực trên hệ thống.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Chẩn đoán sơ bộ từ AI đang được lưu trong hệ thống. Vui lòng đặt lịch hoặc đến phòng khám để được Bác sĩ chuyên khoa thăm khám thực tế và đưa ra kết luận bệnh lý chính thức.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientHistory;
