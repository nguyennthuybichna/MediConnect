import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import useAuth from '../../hooks/useAuth';
import {
  Search,
  Bell,
  Download,
  Edit3,
  Contact,
  Phone,
  AlertTriangle,
  Plus,
  Pill,
  Wrench,
  Utensils,
  Brain,
  X,
  Heart,
  Scale,
  Droplet,
  ShieldCheck,
  FileText,
  HelpCircle,
  TrendingUp,
  Ruler,
  Menu
} from 'lucide-react';

const PatientProfile = () => {
  const { user, showToast } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userId = user?.id || localStorage.getItem('user_id') || 1;
  const isDemo = String(userId) === '1' || user?.email === 'elena.rossi@example.com';

  const [nameOverride, setNameOverride] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editPhone, setEditPhone] = useState('');

  React.useEffect(() => {
    if (user) {
      const patientId = user.id || localStorage.getItem('user_id') || 1;
      const isDemoUser = String(patientId) === '1' || user.email === 'elena.rossi@example.com';
      
      setNameOverride(localStorage.getItem(`name_${patientId}`) || '');
      setDob(localStorage.getItem(`dob_${patientId}`) || (isDemoUser ? '14 Tháng 3, 1985' : ''));
      setPhone(localStorage.getItem(`phone_${patientId}`) || (isDemoUser ? '+1 (555) 902-1432' : ''));
    }
  }, [user]);

  const displayName = nameOverride || user?.full_name || (isDemo ? 'Elena Rossi' : 'Bệnh nhân');

  const [allergies, setAllergies] = useState([
    {
      id: 1,
      allergen: 'Penicillin',
      severity: 'Severe',
      type: 'Drug Allergy',
      icon: Pill,
      description: 'Causes immediate hives and anaphylactic response.',
      borderColor: 'border-l-[#c05d46]',
      severityColor: 'bg-red-50 text-red-600 border-red-100'
    },
    {
      id: 2,
      allergen: 'Latex',
      severity: 'Moderate',
      type: 'Contact Allergy',
      icon: Wrench,
      description: 'Contact dermatitis upon extended exposure.',
      borderColor: 'border-l-[#e39c8a]',
      severityColor: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      id: 3,
      allergen: 'Peanuts',
      severity: 'Moderate',
      type: 'Food Allergy',
      icon: Utensils,
      description: 'Swelling and gastrointestinal distress.',
      borderColor: 'border-l-[#e39c8a]',
      severityColor: 'bg-amber-50 text-amber-600 border-amber-100'
    }
  ]);

  const [showAiInsight, setShowAiInsight] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newAllergen, setNewAllergen] = useState('');
  const [newSeverity, setNewSeverity] = useState('Moderate');
  const [newType, setNewType] = useState('Drug Allergy');
  const [newDescription, setNewDescription] = useState('');

  const handleAddAllergySubmit = (e) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;

    let icon = Pill;
    if (newType === 'Contact Allergy') icon = Wrench;
    if (newType === 'Food Allergy') icon = Utensils;

    const newAllergyObj = {
      id: Date.now(),
      allergen: newAllergen,
      severity: newSeverity,
      type: newType,
      icon: icon,
      description: newDescription || 'No description provided.',
      borderColor: newSeverity === 'Severe' ? 'border-l-[#c05d46]' : 'border-l-[#e39c8a]',
      severityColor: newSeverity === 'Severe' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
    };

    setAllergies([...allergies, newAllergyObj]);
    setIsModalOpen(false);

    setNewAllergen('');
    setNewSeverity('Moderate');
    setNewType('Drug Allergy');
    setNewDescription('');
  };

  const handleNotifyEmergency = () => {
    showToast('🚨 Đã gửi thông báo khẩn cấp đến Marco Rossi (Spouse) thành công!');
  };

  const handleDownloadPdf = () => {
    showToast(`📄 Đang tải xuống Hồ sơ sức khoẻ của ${displayName} định dạng PDF...`);
  };

  const handleOpenEditProfile = () => {
    setEditFullName(displayName);
    setEditDob(dob);
    setEditPhone(phone);
    setIsEditProfileOpen(true);
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    const patientId = user?.id || localStorage.getItem('user_id') || 1;
    
    localStorage.setItem(`dob_${patientId}`, editDob);
    localStorage.setItem(`phone_${patientId}`, editPhone);
    localStorage.setItem(`name_${patientId}`, editFullName);
    
    setDob(editDob);
    setPhone(editPhone);
    setNameOverride(editFullName);
    
    setIsEditProfileOpen(false);
    showToast('✅ Cập nhật thông tin cá nhân thành công!');
  };

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
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Hồ sơ Bệnh nhân</span>
          </div>
          <div className="flex items-center gap-4">

            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Tìm hồ sơ..."
                className="bg-[#f5eae6]/40 border border-[#f5eae6] text-xs py-2 pl-9 pr-4 rounded-full w-56 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full border border-slate-100 shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center font-bold text-xs text-brand-800">
                {(displayName || 'Elena Rossi').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Tổng quan Sức khỏe của {displayName}</h1>
            <p className="text-sm text-slate-500 mt-1">Quản lý thông tin cá nhân và dữ liệu y tế quan trọng của bạn.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Tải hồ sơ PDF
            </button>
            <button
              onClick={handleOpenEditProfile}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-500/10 active:scale-[0.98]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa Hồ sơ
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-[#f5eae6] shadow-sm flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100 shrink-0">
                <Contact className="w-6 h-6 text-brand-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
                <p className="text-xs text-slate-400">Thông tin cơ bản và định danh</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 my-8">
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Họ và tên</span>
                <span className="text-base font-bold text-slate-800">{displayName}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Ngày sinh</span>
                <span className="text-base font-bold text-slate-800">{dob || <span className="text-slate-400 italic text-sm">Chưa khai báo</span>}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Địa chỉ Email</span>
                <span className="text-base font-bold text-slate-800">{user?.email || 'elena.rossi@example.com'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Số điện thoại</span>
                <span className="text-base font-bold text-slate-800">{phone || <span className="text-slate-400 italic text-sm">Chưa khai báo</span>}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50/50 self-start px-3 py-1.5 rounded-full border border-emerald-100/50">
              <ShieldCheck className="w-4 h-4" />
              <span>Danh tính đã được xác minh qua ID Y tế vào Tháng 10/2026</span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-brand-500 text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg shadow-brand-500/25 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 blur-2xl"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Contact className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold tracking-wide">Khẩn cấp</h3>
            </div>

            <div className="my-8">
              <span className="block text-[10px] uppercase tracking-wider text-brand-100 font-bold mb-1">Người liên hệ chính</span>
              <h4 className="text-xl font-bold">Marco Rossi</h4>
              <span className="text-xs text-brand-100 bg-white/10 px-2 py-0.5 rounded-md inline-block mt-1 font-medium">Vợ/Chồng</span>

              <div className="flex items-center gap-3 mt-6">
                <button className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center hover:bg-brand-300 transition-colors border border-brand-300">
                  <Phone className="w-4 h-4 text-white" />
                </button>
                <span className="text-sm font-bold tracking-wide">+1 (555) 123-4567</span>
              </div>
            </div>

            <button
              onClick={handleNotifyEmergency}
              className="w-full bg-[#c05d46] hover:bg-[#b0523c] text-white py-3 rounded-2xl text-xs font-bold transition-all text-center border border-white/15 shadow-md active:scale-[0.98]"
            >
              Gửi thông báo khẩn cấp
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-slate-800">Khai báo dị ứng</h2>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-800 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm dị ứng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allergies.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 ${item.borderColor} flex flex-col justify-between min-h-[140px]`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-base">
                      {item.allergen === 'Penicillin' ? 'Thuốc Penicillin' : item.allergen === 'Latex' ? 'Latex (Cao su)' : item.allergen === 'Peanuts' ? 'Đậu phộng' : item.allergen}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.severityColor}`}>
                      {item.severity === 'Severe' ? 'Nghiêm trọng' : 'Trung bình'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-2">
                    <IconComp className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.type === 'Drug Allergy' ? 'Dị ứng Thuốc' : item.type === 'Contact Allergy' ? 'Dị ứng Tiếp xúc' : 'Dị ứng Thực phẩm'}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    {item.description === 'Causes immediate hives and anaphylactic response.' ? 'Gây phát ban lập tức và phản ứng phản vệ.' : item.description === 'Contact dermatitis upon extended exposure.' ? 'Viêm da tiếp xúc khi tiếp xúc kéo dài.' : item.description === 'Swelling and gastrointestinal distress.' ? 'Sưng phù và khó chịu đường tiêu hóa.' : item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {showAiInsight && (
          <section className="bg-brand-50 rounded-2xl p-4 md:p-5 border border-brand-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-brand-200 shrink-0">
                <Brain className="w-5 h-5 text-brand-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-brand-800">Phân tích AI: Phản ứng chéo tiềm ẩn</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                  Dựa trên tình trạng dị ứng Penicillin, AI khuyên bạn nên tránh sử dụng Cephalosporin trừ khi được bác sĩ đồng ý. Bạn có muốn thêm ghi chú này cho lần chẩn đoán tới không?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => showToast('Đã thêm khuyến nghị AI vào hồ sơ lưu trữ!')}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-sm shadow-brand-500/10"
              >
                Thêm vào Hồ sơ
              </button>
              <button
                onClick={() => setShowAiInsight(false)}
                className="p-2 hover:bg-brand-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <Heart className="w-5 h-5 text-emerald-500" />
            <span className="text-3xl font-extrabold text-slate-800">68</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nhịp tim TB</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <Scale className="w-5 h-5 text-brand-500" />
            <span className="text-3xl font-extrabold text-slate-800">142</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cân nặng (Lbs)</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <Droplet className="w-5 h-5 text-brand-600" />
            <span className="text-3xl font-extrabold text-slate-800">O+</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nhóm máu</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <Ruler className="w-5 h-5 text-emerald-500" />
            <span className="text-3xl font-extrabold text-slate-800">5'7"</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chiều cao</span>
          </div>
        </section>

      </main>

      {/* Floating Action Button (FAB) bottom-right */}
      <button
        onClick={() => showToast('Quick Actions: Mở chức năng ghi chú sức khoẻ nhanh')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-brand-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-900 transition-all hover:scale-105 active:scale-95"
      >
        <FileText className="w-5 h-5" />
      </button>

      {/* MODAL: Add Allergy (Đóng vai trò tăng tương tác) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-brand-100 overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Khai báo Dị ứng Bệnh nhân</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAllergySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Tên chất gây dị ứng</label>
                <input
                  type="text"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder="Ví dụ: Hải sản, Penicillin..."
                  className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Mức độ nghiêm trọng</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="Moderate">Trung bình</option>
                    <option value="Severe">Nghiêm trọng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Phân loại</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="Drug Allergy">Dị ứng Thuốc</option>
                    <option value="Contact Allergy">Dị ứng Tiếp xúc</option>
                    <option value="Food Allergy">Dị ứng Thực phẩm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Mô tả / Ghi chú</label>
                <textarea
                  rows="3"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ví dụ: Sưng tấy, phát ban đỏ, khó thở..."
                  className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md shadow-brand-500/10 active:scale-[0.98]"
              >
                Xác nhận Khai báo Dị ứng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Profile */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-brand-100 overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa Thông tin Cá nhân</h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Họ và tên</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ngày sinh</label>
                <input
                  type="text"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  placeholder="Ví dụ: 14/03/1985 hoặc 14 Tháng 3, 1985"
                  className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Ví dụ: +84 912 345 678..."
                  className="w-full bg-[#fcfaf9] border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide opacity-80">Địa chỉ Email (Không thể thay đổi)</label>
                <input
                  type="email"
                  value={user?.email || 'elena.rossi@example.com'}
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 text-slate-400 rounded-xl py-2.5 px-3.5 text-sm cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md shadow-brand-500/10 active:scale-[0.98]"
              >
                Lưu Thay đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
