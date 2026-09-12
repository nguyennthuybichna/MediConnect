import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Activity, ShieldCheck, Lock, Eye, EyeOff, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [tokenFromUrl, setTokenFromUrl] = useState('');

  const otpInputRefs = useRef([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      setTokenFromUrl(token);
      setIsOtpSent(true);
      setSuccessMsg('Đường dẫn khôi phục mật khẩu hợp lệ. Hãy điền mật khẩu mới của bạn bên dưới.');
    }
  }, [location]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data && res.data.success) {
        setIsOtpSent(true);
        setSuccessMsg(res.data.message || 'Mã OTP khôi phục mật khẩu đã được gửi về email của bạn.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Không thể gửi yêu cầu quên mật khẩu lúc này.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      otpInputRefs.current[5].focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const token = tokenFromUrl || otp.join('');

    if (!tokenFromUrl && token.length !== 6) {
      setErrorMsg('Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        token,
        new_password: newPassword
      });
      if (res.data && res.data.success) {
        setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
        setTimeout(() => {
          navigate('/login', { state: { successMessage: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' } });
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Mã xác thực/Token không chính xác hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data && res.data.success) {
        setSuccessMsg('Mã OTP khôi phục mật khẩu mới đã được gửi tới email của bạn.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Không thể gửi lại mã OTP lúc này.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f4] text-slate-800 font-sans flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex flex-col items-center justify-center">

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg text-white">
            <Activity className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-brand-800 tracking-tight">MediConnect</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-brand-100 p-8 sm:p-10 max-w-md w-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-brand-400 to-brand-600 rounded-b-full"></div>

          <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
            {isOtpSent ? 'Đặt lại mật khẩu' : 'Quên mật khẩu'}
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            {isOtpSent
              ? (tokenFromUrl ? 'Nhập mật khẩu mới của bạn bên dưới để thiết lập lại tài khoản.' : `Nhập mã OTP gửi tới email ${email} và điền mật khẩu mới của bạn.`)
              : 'Nhập địa chỉ email của bạn để nhận liên kết khôi phục mật khẩu.'}
          </p>

          {errorMsg && (
            <div className="bg-red-50 text-red-650 border border-red-200 text-xs font-semibold rounded-xl p-3 mb-6 text-center animate-pulse">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-xs font-semibold rounded-xl p-3 mb-6 text-center">
              {successMsg}
            </div>
          )}

          {!isOtpSent ? (

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena.rossi@example.com"
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:bg-slate-350 text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-brand-700/25 active:scale-[0.98] disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Gửi liên kết khôi phục'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-800 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (

            <form onSubmit={handleResetPassword} className="space-y-5">

              {!tokenFromUrl && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">
                    Mã xác thực OTP (6 chữ số)
                  </label>
                  <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-12 h-14 bg-slate-50 border-2 border-slate-200 text-slate-800 text-center font-bold text-xl rounded-2xl focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 transition-all shrink-0 shadow-sm"
                        required
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Xác nhận Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:bg-slate-350 text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <span>Xác nhận đặt lại</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 space-y-4">

                {!tokenFromUrl && (
                  <div className="text-xs text-slate-500 font-semibold">
                    Không nhận được mã?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-brand-700 font-bold hover:underline inline-flex items-center gap-1 hover:text-brand-800 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Gửi lại mã OTP
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (tokenFromUrl) {
                        navigate('/login');
                      } else {
                        setIsOtpSent(false);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setOtp(['', '', '', '', '', '']);
                      }
                    }}
                    className="text-slate-450 hover:text-slate-600 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {tokenFromUrl ? 'Quay lại đăng nhập' : 'Sử dụng email khác'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-8">
        © 2026 MediMind AI Systems • Secure HIPAA Connection
      </footer>
    </div>
  );
};

export default ForgotPassword;
