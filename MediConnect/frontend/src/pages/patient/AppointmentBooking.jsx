import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  Search,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
  Brain,
  CheckCircle,
  Activity,
  X,
  Phone,
  MapPin,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { bookAppointmentAPI, getBookedSlotsAPI } from '../../services/appointmentService';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const [specialists, setSpecialists] = useState([
    {
      id: 2,
      name: 'BS. Sarah Chen',
      specialty: 'Cardiology Specialist',
      avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=100',
      rating: 4.9,
      reviewsCount: 124,
      availability: 'Available Today',
      availabilityColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      biography: 'Bác sĩ Sarah Chen có hơn 12 năm kinh nghiệm lâm sàng trong lĩnh vực chẩn đoán và điều trị bệnh lý tim mạch, suy tim, và rối loạn nhịp tim. Từng là Trưởng khoa Tim mạch tại Trung tâm Y tế Seattle.',
      education: 'Thạc sĩ Y khoa chuyên ngành Tim mạch - Đại học Washington; Bác sĩ nội trú tại Bệnh viện Seattle.',
      phone: '+1 (555) 987-6543',
      address: 'Phòng khám Tim mạch MedCentral, Tầng 3, 123 Medical Way, Seattle'
    },
    {
      id: 3,
      name: 'BS. James Miller',
      specialty: 'General Practice',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100',
      rating: 4.8,
      reviewsCount: 89,
      availability: 'Next: Oct 15',
      availabilityColor: 'bg-amber-50 text-amber-600 border-amber-100',
      biography: 'Bác sĩ James Miller chuyên về Nội tổng quát và Chăm sóc sức khỏe ban đầu. Hơn 15 năm kinh nghiệm đồng hành cùng bệnh nhân phòng ngừa và điều trị các bệnh lý cấp và mãn tính như cao huyết áp, tiểu đường.',
      education: 'Bác sĩ Y khoa Tổng quát - Đại học Y khoa Seattle; Chứng chỉ Y học gia đình Hoa Kỳ.',
      phone: '+1 (555) 345-6789',
      address: 'Phòng khám Đa khoa MedCentral, Tầng 1, 123 Medical Way, Seattle'
    },
    {
      id: 4,
      name: 'BS. Sarah Khalil',
      specialty: 'Neurology',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100',
      rating: 5.0,
      reviewsCount: 210,
      availability: 'Available Today',
      availabilityColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      biography: 'Chuyên gia Nội thần kinh chuyên sâu về bệnh động kinh, đột quỵ và các hội chứng đau đầu mãn tính. Hơn 10 năm kinh nghiệm nghiên cứu ứng dụng trí tuệ nhân tạo vào hỗ trợ phân tích thần kinh.',
      education: 'Tiến sĩ Thần kinh học - Đại học Harvard; Thành viên Hiệp hội Thần kinh học Hoa Kỳ.',
      phone: '+1 (555) 876-5432',
      address: 'Trung tâm Nghiên cứu Thần kinh MedCentral, Tầng 4, 123 Medical Way, Seattle'
    }
  ]);

  const [selectedDoctorId, setSelectedDoctorId] = useState(2);
  const [showDocModal, setShowDocModal] = useState(false);
  const [modalDoctor, setModalDoctor] = useState(null);

  const handleOpenDocModal = (doc) => {
    setModalDoctor(doc);
    setShowDocModal(true);
  };

  useEffect(() => {

    setSpecialists(prev => prev.map(doc => {
      const savedProfile = localStorage.getItem(`doctor_profile_${doc.id}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          return {
            ...doc,
            name: parsed.full_name || doc.name,
            specialty: parsed.specialty || doc.specialty,
            biography: parsed.biography || doc.biography,
            education: parsed.education || doc.education,
            phone: parsed.phone || doc.phone,
            address: parsed.address || doc.address
          };
        } catch (e) {
          console.error("Lỗi parse hồ sơ bác sĩ:", e);
        }
      }
      return doc;
    }));
  }, []);

  const selectedDoctor = specialists.find(d => d.id === selectedDoctorId) || specialists[0];

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDoctorId || !selectedDate) return;
      try {
        const res = await getBookedSlotsAPI(selectedDoctorId, selectedDate);
        if (res && res.success) {
          setBookedSlots(res.bookedSlots || []);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách giờ đã đặt:', err);
      }
    };
    fetchBookedSlots();
  }, [selectedDoctorId, selectedDate]);

  const timeSlots = useMemo(() => {
    if (!selectedDoctor) return [];

    const slotsMap = {
      2: ['09:00 AM', '10:30 AM', '11:15 AM', '02:30 PM', '04:00 PM'],
      3: ['08:30 AM', '10:00 AM', '01:30 PM', '03:00 PM', '05:00 PM'],
      4: ['09:15 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:30 PM']
    };

    const isTimeRestricted = (timeStr) => {
      const match = timeStr.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return false;
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;

      const timeVal = hour * 60 + minute;
      const startRestricted = 11 * 60;
      const endRestricted = 13 * 60;
      return timeVal >= startRestricted && timeVal <= endRestricted;
    };

    const doctorSlots = slotsMap[selectedDoctor.id] || ['09:00 AM', '10:30 AM', '02:30 PM'];
    return doctorSlots
      .filter(time => !isTimeRestricted(time) && !bookedSlots.includes(time))
      .map(time => ({
        time,
        disabled: false
      }));
  }, [selectedDoctor, bookedSlots]);

  useEffect(() => {
    if (timeSlots.length > 0) {
      const availableSlots = timeSlots.filter(s => !s.disabled);
      const isCurrentSlotAvailable = availableSlots.some(s => s.time === selectedTime);
      if (!isCurrentSlotAvailable && availableSlots.length > 0) {
        setSelectedTime(availableSlots[0].time);
      }
    }
  }, [selectedDoctorId, timeSlots, selectedTime]);

  const handleConfirmBooking = async () => {

    const match = selectedTime.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      const timeVal = hour * 60 + minute;
      if (timeVal >= 11 * 60 && timeVal <= 13 * 60) {
        showToast('Khung giờ từ 11:00 AM đến 01:00 PM không được phép đặt lịch khám.');
        return;
      }
    }

    if (bookedSlots.includes(selectedTime)) {
      showToast('Khung giờ này đã có người đặt trước. Vui lòng chọn khung giờ khác.');
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    try {
      const patientId = user?.id || localStorage.getItem('user_id') || 1;
      const latestPredictionId = localStorage.getItem('latest_prediction_id');

      const payload = {
        patient_id: Number(patientId),
        doctor_id: Number(selectedDoctorId),
        prediction_id: latestPredictionId ? Number(latestPredictionId) : null,
        appointment_time: `${selectedDate} ${selectedTime}`
      };

      await bookAppointmentAPI(payload);

      const formattedDateMsg = new Date(selectedDate).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      showToast(`🎉 Đặt lịch hẹn thành công với bác sĩ ${selectedDoctor.name} vào lúc ${selectedTime}!`);

      localStorage.removeItem('latest_prediction_id');

      navigate('/patient/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Lỗi đặt lịch hẹn.';
      setBookingError(errMsg);
      showToast(`Đặt lịch thất bại: ${errMsg}`);
    } finally {
      setIsBooking(false);
    }
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
            <div className="relative flex-1 max-w-md hidden sm:block">
              <input
                type="text"
                placeholder="Tìm kiếm lịch hẹn hoặc bác sĩ..."
                className="bg-[#f5eae6]/40 border border-[#f5eae6] text-xs py-2.5 pl-9 pr-4 rounded-full w-full focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-600 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full border border-slate-100 shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center font-bold text-xs text-brand-800">
                {(user?.full_name || 'Bệnh nhân').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <h5 className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'Bệnh nhân'}</h5>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Bệnh nhân</span>
              </div>
            </div>
          </div>
        </header>

        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Lên lịch tư vấn sức khỏe</h1>
            <p className="text-sm text-slate-500 mt-1">
              Lựa chọn thời gian khám phù hợp nhất với bạn. Sử dụng lịch tương tác để đặt lịch với các bác sĩ chuyên khoa.
            </p>
          </div>
          <button
          onClick={() => showToast('Lọc chuyên khoa: Đang mở bộ lọc nâng cao...')}
            className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-bold rounded-xl flex items-center gap-2 self-start transition-all shadow-sm"
          >
            Lọc chuyên khoa
          </button>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-7 space-y-6">

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chọn Ngày Khám</h3>
                  <span className="text-xs text-slate-400 font-semibold">Vui lòng chọn ngày, tháng, năm khám mong muốn</span>
                </div>
              </div>

              <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-[#fcfaf9] border border-slate-200 rounded-2xl p-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100 shrink-0">
                  <Calendar className="w-6 h-6 text-brand-700" />
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Ngày đã chọn</span>
                  <span className="block text-sm font-extrabold text-slate-800">
                    {new Date(selectedDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="w-full sm:w-auto relative">
                  <input
                    type="date"
                    min={getTodayString()}
                    value={selectedDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val >= getTodayString()) {
                        setSelectedDate(val);
                      } else {
                        showToast('⚠️ Vui lòng chọn ngày khám từ hôm nay trở đi.');
                      }
                    }}
                    className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-brand-500/20 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Khung giờ trống</h3>
                <span className="text-xs text-slate-400 font-semibold">
                  {new Date(selectedDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    disabled={slot.disabled}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                      slot.disabled
                        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                        : selectedTime === slot.time
                          ? 'bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800">Bác sĩ chuyên khoa gợi ý</h3>
                <button className="text-xs font-bold text-brand-800 hover:underline">Xem tất cả</button>
              </div>

              <div className="space-y-4">
                {specialists.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoctorId(doc.id);
                      handleOpenDocModal(doc);
                    }}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      selectedDoctorId === doc.id
                        ? 'bg-brand-50/40 border-brand-200 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 group" title="Xem hồ sơ chi tiết bác sĩ">
                      <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-850 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-100 group-hover:scale-105 transition-all duration-200">
                        {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-800 transition-colors flex items-center gap-1">
                          <span>{doc.name}</span>
                          <Info className="w-3 h-3 text-slate-400 group-hover:text-brand-700 shrink-0" />
                        </h4>
                        <span className="block text-[10px] text-slate-400 font-semibold">{doc.specialty === 'Cardiology Specialist' ? 'Chuyên khoa Tim mạch' : doc.specialty === 'General Practice' ? 'Bác sĩ Đa khoa' : 'Chuyên khoa Thần kinh'}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{doc.rating}</span>
                          <span className="text-slate-300">({doc.reviewsCount} đánh giá)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${doc.availabilityColor}`}>
                        {doc.availability === 'Available Today' ? 'Có lịch hôm nay' : 'Lịch tiếp: 15/10'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctorId(doc.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            selectedDoctorId === doc.id
                              ? 'bg-slate-100 text-slate-500 cursor-default'
                              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                          }`}
                        >
                          {selectedDoctorId === doc.id ? 'Đã chọn' : 'Chọn'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-500 text-white rounded-3xl p-6 shadow-md relative overflow-hidden space-y-3">
              <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-white/5 blur-2xl"></div>
              <div className="flex items-center gap-2 relative z-10">
                <Brain className="w-4 h-4 text-brand-200" />
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-brand-100">PHÂN TÍCH TỪ TRỢ LÝ AI (MEDIMIND)</span>
              </div>
              <p className="text-xs font-light leading-relaxed relative z-10">
                Dựa trên triệu chứng và lịch sử bệnh án của bạn, chúng tôi đề xuất bạn nên khám chuyên khoa Thần kinh với bác sĩ Dr. Sarah Khalil.
              </p>
            </div>

          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wide">Tóm tắt Lịch hẹn</span>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                {new Date(selectedDate).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} lúc {selectedTime}
              </h4>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Với bác sĩ <span className="font-semibold text-brand-800">{selectedDoctor.name}</span> (Khám trực tiếp tại phòng khám)
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => showToast('Đã hủy bỏ thao tác đặt lịch hẹn')}
              className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={isBooking}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-500/10 active:scale-[0.98] disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isBooking ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
            </button>
          </div>
        </section>

      </main>

      {showDocModal && modalDoctor && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-brand-100/50 flex flex-col max-h-[90vh]">

            <div className="bg-gradient-to-r from-brand-700 to-brand-850 p-6 text-white relative shrink-0">
              <button
                onClick={() => setShowDocModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-16 h-16 rounded-2xl bg-white/10 text-white border-2 border-white/25 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {modalDoctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{modalDoctor.name}</h3>
                  <p className="text-xs text-brand-100 font-semibold uppercase tracking-wide mt-0.5">
                    {modalDoctor.specialty === 'Cardiology Specialist' ? 'Chuyên khoa Tim mạch' : modalDoctor.specialty === 'General Practice' ? 'Bác sĩ Đa khoa' : 'Chuyên khoa Thần kinh'}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300 mt-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{modalDoctor.rating} ({modalDoctor.reviewsCount} đánh giá)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs md:text-sm">

              <div className="space-y-1.5">
                <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Giới thiệu bản thân</h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {modalDoctor.biography || 'Chưa có thông tin giới thiệu.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Kinh nghiệm & Học vấn</h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {modalDoctor.education || 'Chưa có thông tin học vấn.'}
                </p>
              </div>

              <div className="space-y-2.5 border-t border-[#f5eae6] pt-4 shrink-0">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#D3765F] shrink-0" />
                  <span className="text-xs font-bold text-slate-700">{modalDoctor.phone || 'Chưa cập nhật số điện thoại'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D3765F] shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-slate-600 leading-relaxed">{modalDoctor.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
              <button
                onClick={() => setShowDocModal(false)}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-brand-500/10 active:scale-[0.98]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AppointmentBooking;
