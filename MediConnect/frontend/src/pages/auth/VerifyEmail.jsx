import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const VerifyEmail = () => {
  const location = useLocation();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyUserEmail = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Đường dẫn xác thực không hợp lệ (thiếu mã token).');
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        if (res.data && res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Xác thực tài khoản thành công!');
        } else {
          setStatus('error');
          setMessage(res.data.error || 'Xác thực tài khoản thất bại.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
      }
    };

    verifyUserEmail();
  }, [location]);

  return (
    <div className="min-h-screen bg-[#faf6f4] text-slate-800 font-sans flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* LOGO */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg text-white">
            <Activity className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-brand-800 tracking-tight">MediConnect</span>
        </div>

        {/* CONTAINER */}
        <div className="bg-white rounded-3xl shadow-xl border border-brand-100 p-8 sm:p-10 max-w-md w-full relative text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-brand-400 to-brand-600 rounded-b-full"></div>

          {status === 'verifying' && (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-brand-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-850">Đang xác thực tài khoản</h2>
              <p className="text-sm text-slate-500">
                Vui lòng đợi giây lát, hệ thống đang tiến hành kích hoạt tài khoản của bạn...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6 py-4 animate-fadeIn">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-850">Xác thực thành công!</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {message} Tài khoản của bạn đã hoạt động bình thường. Bây giờ bạn có thể đăng nhập vào ứng dụng MediConnect.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full bg-brand-700 hover:bg-brand-800 text-white rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-brand-700/25 active:scale-[0.98] inline-block"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 py-4 animate-fadeIn">
              <div className="flex justify-center">
                <XCircle className="w-16 h-16 text-red-650" />
              </div>
              <h2 className="text-xl font-bold text-slate-850">Xác thực thất bại</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {message}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/register"
                  className="w-full bg-brand-700 hover:bg-brand-800 text-white rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-brand-700/25 active:scale-[0.98] inline-block"
                >
                  Đăng ký tài khoản mới
                </Link>
                <Link
                  to="/login"
                  className="text-xs text-brand-800 hover:underline font-bold"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
