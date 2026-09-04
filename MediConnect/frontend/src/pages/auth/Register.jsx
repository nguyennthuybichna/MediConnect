import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ShieldCheck, Activity, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api'; // Sử dụng instance axios đã cấu hình sẵn

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Trạng thái Form Đăng ký
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('patient');
  const [specialty, setSpecialty] = useState('General Physician');

  // Trạng thái Xác thực OTP
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const otpInputRefs = useRef([]);

  // Xử lý nộp form đăng ký chính
  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedFullName || trimmedFullName.length <= 1) {
      setError('Họ và tên không được để trống, không được chỉ có khoảng trắng hoặc chỉ có 1 ký tự.');
      return;
    }

    if (!/[a-zA-Z\u00C0-\u1EF9]{2,}/.test(trimmedFullName)) {
      setError('Họ và tên phải chứa ít nhất 2 chữ cái hợp lệ.');
      return;
    }

    if (!trimmedEmail || trimmedEmail.length <= 1) {
      setError('Email không được để trống, không được chỉ có khoảng trắng hoặc chỉ có 1 ký tự.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Định dạng email không hợp lệ (ví dụ: tenban@gmail.com).');
      return;
    }

    if (!trimmedPassword || trimmedPassword.length <= 1) {
      setError('Mật khẩu không được để trống, không được chỉ có khoảng trắng hoặc chỉ có 1 ký tự.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Mật khẩu phải có độ dài tối thiểu từ 6 ký tự.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!agree) {
      setError('Bạn cần đồng ý với các Điều khoản & Chính sách.');
      return;
    }

    setIsLoading(true);
    try {
      // Đăng ký qua authContext (không tự động login do token ở register đã loại bỏ ở BE)
      await register(trimmedFullName, trimmedEmail, trimmedPassword, role, role === 'doctor' ? specialty : null);
      // Đăng ký thành công -> chuyển sang màn hình xác thực OTP
      setIsVerifying(true);
      setOtpSuccess('Tài khoản đã được tạo! Vui lòng nhập mã xác thực 6 số gửi tới email.');
    } catch (err) {
      setError(err.message || 'Lỗi đăng ký tài khoản.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi ô nhập OTP
  const handleOtpChange = (value, index) => {
    if (value && !/^\d$/.test(value)) return; // Chỉ cho phép nhập chữ số
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển trỏ chuột sang ô kế tiếp khi nhập xong
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // Xử lý nút Backspace trong ô nhập OTP
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

  // Xử lý dán mã OTP (Paste)
  const handleOtpPaste = (e) => {
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      otpInputRefs.current[5].focus();
    }
  };

  // Xử lý gửi mã xác thực lên máy chủ
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setOtpError('Vui lòng nhập đầy đủ mã xác thực gồm 6 chữ số.');
      return;
    }

    setIsOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      const res = await api.post('/auth/verify-email', { token, email });
      if (res.data && res.data.success) {
        setOtpSuccess('Xác thực tài khoản thành công! Đang chuyển hướng...');
        setTimeout(() => {
          navigate('/login', { state: { successMessage: 'Xác thực tài khoản thành công! Vui lòng đăng nhập.' } });
        }, 1800);
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Mã xác thực không chính xác hoặc đã hết hạn.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Gửi lại mã xác thực
  const handleResendOtp = async () => {
    setIsOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      const res = await api.post('/auth/resend-verification', { email });
      if (res.data && res.data.success) {
        setOtpSuccess('Mã xác thực mới đã được gửi tới email của bạn thành công.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Không thể gửi lại mã xác thực lúc này.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f4] text-slate-800 font-sans flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Logo Header */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg text-white">
            <Activity className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-brand-800 tracking-tight">MediConnect</span>
        </div>

        {/* Cấu trúc Màn hình thay đổi dựa trên state isVerifying */}
        {!isVerifying ? (
          /* ==========================================
             MÀN HÌNH ĐĂNG KÝ THÔNG TIN TÀI KHOẢN
             ========================================== */
          <div className="bg-white rounded-3xl shadow-xl border border-brand-100 p-8 sm:p-10 max-w-md w-full relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-brand-400 to-brand-600 rounded-b-full"></div>

            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Đăng ký Tài khoản</h2>

            {error && (
              <div className="bg-red-50 text-red-650 border border-red-200 text-xs font-semibold rounded-xl p-3 mb-6 text-center animate-fadeIn">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitRegister} className="space-y-5">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Họ và Tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Elena Rossi"
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Lựa chọn vai trò */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Bạn đăng ký với tư cách là
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      role === 'patient'
                        ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                        : 'bg-[#fcfaf9] border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50/20'
                    }`}
                  >
                    Bệnh nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      role === 'doctor'
                        ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                        : 'bg-[#fcfaf9] border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50/20'
                    }`}
                  >
                    Bác sĩ
                  </button>
                </div>
              </div>

              {/* Chuyên khoa (Nếu là bác sĩ) */}
              {role === 'doctor' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Chuyên khoa
                  </label>
                  <div className="relative">
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-700"
                      required
                    >
                      <option value="Cardiologist">Bác sĩ Tim mạch (Cardiologist)</option>
                      <option value="General Physician">Bác sĩ Đa khoa (General Physician)</option>
                      <option value="Neurology">Bác sĩ Thần kinh (Neurology)</option>
                      <option value="Orthopedic">Bác sĩ Chấn thương chỉnh hình (Orthopedic)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena.rossi@example.com"
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Xác nhận Mật khẩu
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

              {/* Đồng ý điều khoản */}
              <div className="flex items-start text-xs sm:text-sm">
                <label className="flex items-start gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="rounded border-slate-300 text-brand-500 focus:ring-brand-500 w-4.5 h-4.5 mt-0.5"
                  />
                  <span className="text-xs leading-relaxed">
                    Tôi đồng ý với <a href="#tos" className="text-brand-700 font-semibold hover:underline">Điều khoản Dịch vụ</a> và <a href="#privacy" className="text-brand-700 font-semibold hover:underline">Chính sách Bảo mật</a>
                  </span>
                </label>
              </div>

              {/* Button nộp đăng ký */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 text-sm font-bold transition-all shadow-md shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'Đang tạo tài khoản...'
                  : role === 'doctor'
                    ? 'Đăng ký tài khoản Bác sĩ'
                    : 'Đăng ký tài khoản Bệnh nhân'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 font-medium">
              Bạn đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-brand-700 hover:underline">Đăng nhập tại đây</Link>
            </div>
          </div>
        ) : (
          /* ==========================================
             MÀN HÌNH XÁC THỰC TÀI KHOẢN (Verify OTP)
             ========================================== */
          <div className="bg-white rounded-3xl shadow-xl border border-brand-100 p-8 sm:p-10 max-w-md w-full relative animate-fadeIn">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-brand-400 to-brand-600 rounded-b-full"></div>

            <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Xác thực Tài khoản</h2>
            <p className="text-xs text-slate-500 text-center leading-relaxed mb-6">
              Mã xác thực gồm 6 chữ số đã được gửi tới email <strong className="text-brand-800">{email}</strong>. Vui lòng nhập mã để kích hoạt tài khoản của bạn.
            </p>

            {otpError && (
              <div className="bg-red-50 text-red-650 border border-red-200 text-xs font-semibold rounded-xl p-3 mb-6 text-center animate-pulse">
                {otpError}
              </div>
            )}

            {otpSuccess && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-xs font-semibold rounded-xl p-3 mb-6 text-center">
                {otpSuccess}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              
              {/* Layout 6 ô nhập mã số */}
              <div className="flex justify-between gap-2.5" onPaste={handleOtpPaste}>
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

              {/* Nút kiểm tra kích hoạt */}
              <button
                type="submit"
                disabled={isOtpLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 text-sm font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isOtpLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <span>Xác thực ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Các tùy chọn bên dưới màn hình xác thực */}
            <div className="mt-8 space-y-4 text-center">
              <div className="text-xs text-slate-500 font-semibold">
                Chưa nhận được mã?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isOtpLoading}
                  className="text-brand-700 font-bold hover:underline inline-flex items-center gap-1 hover:text-brand-800 disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  Gửi lại mã OTP
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifying(false);
                    setError(null);
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Sử dụng địa chỉ email khác
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Footer */}
      <footer className="w-full max-w-md mx-auto flex items-center justify-center gap-6 py-4 text-xs font-semibold text-emerald-600 uppercase tracking-wider shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Tuân thủ chuẩn HIPAA</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Bảo mật chuẩn SSL</span>
        </div>
      </footer>
    </div>
  );
};

export default Register;
