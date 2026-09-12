import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const PatientHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/diagnosis/history');

        if (Array.isArray(response.data)) {
          setHistory(response.data);
        } else if (response.data && Array.isArray(response.data.history)) {
          setHistory(response.data.history);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching diagnosis history:', err);
        setError(err.response?.data?.error || 'Không thể kết nối đến máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} - ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải lịch sử chẩn đoán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 max-w-xl mx-auto flex items-start gap-3.5 shadow-sm">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-red-800 text-sm">Lỗi tải dữ liệu</h4>
          <p className="text-xs text-red-650 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <Clock className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-slate-700 text-sm">Chưa có lịch sử chẩn đoán</h4>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          Bạn chưa thực hiện cuộc chẩn đoán triệu chứng nào với Trợ lý AI.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 pl-8 space-y-8">
        {history.map((item) => {
          const confidence = parseFloat(item.ai_confidence);
          const confidencePercent = !isNaN(confidence) ? Math.round(confidence) : 0;

          return (
            <div key={item.prediction_id} className="relative group">

              <span className={`absolute -left-[42px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 shadow-sm transition-transform group-hover:scale-110 ${
                item.is_verified === 1
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-amber-400 text-amber-400'
              }`}>
                {item.is_verified === 1 ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </span>

              <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(item.created_at)}
                  </span>

                  {item.is_verified === 1 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                      <CheckCircle className="w-3 h-3" />
                      Đã được duyệt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                      <Clock className="w-3 h-3" />
                      Đang chờ duyệt
                    </span>
                  )}
                </div>

                <div className="space-y-4">

                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triệu chứng khai báo</h5>
                    <blockquote className="italic text-slate-600 text-xs md:text-sm pl-3 border-l-4 border-slate-350 py-1 mt-1.5 leading-relaxed">
                      "{item.symptoms_text}"
                    </blockquote>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Dự đoán</h5>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-800 font-bold text-xs md:text-sm">{item.ai_disease}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {confidencePercent}%
                        </span>
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${
                      item.is_verified === 1
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bác sĩ Kết luận</h5>
                      <div className="mt-2">
                        {item.is_verified === 1 ? (
                          <span className="font-bold text-xs md:text-sm flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            {item.doctor_corrected_disease || item.ai_disease}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 italic">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            Đang chờ bác sĩ duyệt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientHistory;
