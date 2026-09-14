import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultUrl = isLocal ? 'http://localhost:5001/api' : 'https://mediconnect-backend-l3zi.onrender.com/api';
let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || defaultUrl).trim();

if (isLocal && rawBaseUrl.includes('render.com')) {
  rawBaseUrl = 'http://localhost:5001/api';
}

const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

console.log('[MediConnect] Active Backend API URL:', baseURL);

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user');
        const currentPath = window.location.pathname;
        const isPublicPath = currentPath.startsWith('/prescription') ||
                             currentPath === '/login' ||
                             currentPath === '/register' ||
                             currentPath === '/forgot-password' ||
                             currentPath === '/verify-email';
        if (!isPublicPath) {
          window.location.href = '/login?expired=true';
        }
      }
    } else if (error.request) {
      error.message = 'Hệ thống y tế đang bảo trì hoặc mất kết nối mạng. Vui lòng thử lại sau.';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
