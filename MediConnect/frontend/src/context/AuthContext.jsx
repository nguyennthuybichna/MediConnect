import React, { createContext, useState, useEffect, useRef } from 'react';
import { loginAPI, registerAPI } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const toastTimerRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserJson = localStorage.getItem('user');

    if (storedToken && storedUserId) {
      setToken(storedToken);
      if (storedUserJson) {
        try {
          setUser(JSON.parse(storedUserJson));
        } catch (e) {
          setUser({ id: storedUserId });
        }
      } else {
        setUser({ id: storedUserId });
      }
    }
    setIsLoading(false);
  }, []);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    // Tự động tắt sau 3.5 giây
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginAPI(email, password);

      const userToken = data.token;
      const userId = data.user_id || (data.user && (data.user.id || data.user.user_id));
      const userInfo = data.user || { id: userId, email: email, full_name: data.full_name || 'User' };

      if (!userToken) {
        throw new Error('Đăng nhập thất bại: Không nhận được Token bảo mật.');
      }

      localStorage.setItem('token', userToken);
      localStorage.setItem('user_id', String(userId));
      localStorage.setItem('user', JSON.stringify(userInfo));

      setToken(userToken);
      setUser(userInfo);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Lỗi đăng nhập hệ thống.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (fullName, email, password, role = 'patient', specialty = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await registerAPI(email, password, fullName, role, specialty);

      const userToken = data.token;
      const userId = data.user_id || (data.user && (data.user.id || data.user.user_id));
      const userInfo = data.user || { id: userId, email: email, full_name: fullName, role: role };

      if (userToken) {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user_id', String(userId));
        localStorage.setItem('user', JSON.stringify(userInfo));
        setToken(userToken);
        setUser(userInfo);
      }

      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Lỗi đăng ký tài khoản.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, setError, showToast }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#322925] text-white text-xs font-semibold px-4.5 py-3.5 rounded-2xl shadow-xl z-[9999] flex items-center gap-2.5 border border-[#4d3d37] animate-fadeIn">
          <svg className="w-4 h-4 text-[#D3765F] animate-pulse shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};
