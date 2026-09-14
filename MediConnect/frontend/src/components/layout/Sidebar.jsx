import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  FileText,
  Calendar,
  Settings,
  Activity,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, showToast } = useAuth();

  const isDoctor = location.pathname.startsWith('/doctor');
  const isAdmin = location.pathname.startsWith('/admin');

  let rolePrefix = '/patient';
  if (isDoctor) rolePrefix = '/doctor';
  if (isAdmin) rolePrefix = '/admin';

  let menuItems = [
    {
      name: 'Bảng điều khiển',
      icon: LayoutDashboard,
      path: `${rolePrefix}/dashboard`
    },
    {
      name: 'Chẩn đoán AI',
      icon: Stethoscope,
      path: `${rolePrefix}/triage`
    },
    {
      name: 'Hồ sơ y tế',
      icon: FileText,
      path: isDoctor ? `${rolePrefix}/records` : (isAdmin ? `${rolePrefix}/records` : `${rolePrefix}/history`)
    },
    {
      name: 'Lịch hẹn khám',
      icon: Calendar,
      path: `${rolePrefix}/appointments`
    },
    {
      name: 'Cài đặt',
      icon: Settings,
      path: `${rolePrefix}/profile`
    },
  ];

  if (isAdmin) {
    menuItems = menuItems.filter(
      (item) =>
        item.name !== 'Chẩn đoán AI' &&
        item.name !== 'Lịch hẹn khám' &&
        item.name !== 'Cài đặt'
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const isChatOrDashboardOrBooking =
    location.pathname === '/patient/dashboard' ||
    location.pathname === '/patient/triage' ||
    location.pathname === '/patient/appointments';

  const renderFooter = () => {
    const displayName = user?.full_name || (isDoctor ? 'Dr. Sarah Chen' : (isAdmin ? 'Dr. Evelyn Harper' : 'Elena Rossi'));

    if (isDoctor) {
      return (
        <div className="bg-[#fdf8f6] rounded-2xl p-4 border border-brand-100/50 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100"
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border border-brand-200"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{displayName}</h4>
            <p className="text-[9px] text-slate-400 font-semibold uppercase">{user?.specialty || 'General Physician'}</p>
          </div>
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="bg-[#fdf8f6] rounded-2xl p-4 border border-brand-100/50 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=100"
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border border-brand-200"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{displayName}</h4>
            <p className="text-[9px] text-slate-400 font-semibold uppercase">Chief of Surgery</p>
          </div>
        </div>
      );
    }

    if (isChatOrDashboardOrBooking) {
      return (
        <button
          onClick={() => showToast('🚨 Đang kết nối cuộc gọi khẩn cấp tới tổng đài y tế...')}
          className="w-full bg-[#843f2e] hover:bg-[#6f3629] text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-800/10 active:scale-[0.98]"
        >
          <ShieldCheck className="w-4 h-4 text-brand-300" />
          Hỗ trợ khẩn cấp
        </button>
      );
    }

    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="bg-[#fdf8f6] rounded-2xl p-3.5 border border-brand-100/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-brand-400/25 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0 border border-brand-200">
            {initials}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{displayName}</h4>
            <p className="text-[10px] text-slate-400 font-medium truncate">Mã: #{user?.id || '4402'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Đăng xuất tài khoản"
          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100/70 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#f5eae6] flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out shrink-0
        md:translate-x-0 md:sticky md:top-0 md:z-auto
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col flex-1 min-h-0">

          <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-brand-800 tracking-tight">MediConnect</span>
            </div>

            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-brand-50/70 text-brand-800'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>

                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-600 rounded-l-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#f5eae6]/80 mt-auto shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50/80 hover:text-rose-700 transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-rose-500" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#f5eae6]">
          {renderFooter()}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
