import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Activity } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login, showToast } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || trimmedEmail.length <= 1) {
      setError('Email không được để trống, không được chỉ có khoảng trắng hoặc chỉ có 1 ký tự.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Định dạng email không hợp lệ (ví dụ: benhnhan@gmail.com).');
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

    setIsLoading(true);
    try {
      const data = await login(trimmedEmail, trimmedPassword);

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', String(data.user_id || data.user?.id));
      }

      const role = data.user?.role || 'patient';
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Sai tài khoản hoặc mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f4] text-slate-800 font-sans relative flex flex-col justify-between">

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg text-white">
            <Activity className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold text-brand-800 tracking-tight">MediConnect</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-brand-100 p-8 sm:p-10 max-w-md w-full relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-brand-400 to-brand-600 rounded-b-full"></div>

          <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">Chào mừng quay trở lại</h2>
          <p className="text-sm text-slate-500 text-center mb-8">Vui lòng đăng nhập tài khoản của bạn để truy cập hệ thống.</p>

          {error && (
            <div className="bg-red-50 text-red-650 border border-red-200 text-xs font-semibold rounded-xl p-3 mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ví dụ: benhnhan@gmail.com"
                  className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  Mật khẩu
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-700 hover:underline">Quên mật khẩu?</Link>
              </div>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 text-sm font-semibold transition-all shadow-md shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400 uppercase tracking-wider font-medium">Hoặc đăng nhập bằng</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => showToast('🔑 Đang đăng nhập nhanh bằng Google...')}
                className="border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                Google
              </button>
              <button
                type="button"
                onClick={() => showToast('🔑 Đang đăng nhập nhanh bằng Apple ID...')}
                className="border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <span className="text-slate-900 font-bold"></span>
                Apple ID
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">Đăng ký ngay</Link>
          </p>
        </div>

        <div className="mt-8 bg-white border border-brand-100 rounded-full px-5 py-2.5 shadow-md flex items-center gap-3 max-w-sm w-full mx-auto animate-bounce">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-700">Mới:</span>
            <span className="text-slate-500">Chẩn đoán triệu chứng AI nhanh gấp 2.4 lần.</span>
          </div>
        </div>
      </div>

      <footer className="w-full text-center py-6 border-t border-slate-200 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
          <a href="#privacy" className="hover:text-slate-600 transition-colors">Chính sách bảo mật</a>
          <a href="#terms" className="hover:text-slate-600 transition-colors">Điều khoản sử dụng</a>
          <a href="#support" className="hover:text-slate-600 transition-colors">Liên hệ hỗ trợ</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
