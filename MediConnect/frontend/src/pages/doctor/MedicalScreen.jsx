import React, { useState, useEffect, useMemo } from 'react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import PrescriptionExport from '../../components/PrescriptionExport';
import AISummaryCard from '../../components/AISummaryCard';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Search,
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Printer,
  Plus,
  Phone,
  MapPin,
  Scale,
  Activity,
  Heart,
  Droplet,
  ExternalLink,
  PlusCircle,
  Trash2,
  Check,
  ChevronDown,
  Clock,
  Menu,
  X,
  FileText,
  Video,
  FlaskConical,
  Filter
} from 'lucide-react';

const INITIAL_PATIENTS = [
  {
    id: "PT-84729",
    name: "Robert MacMillan",
    age: 45,
    gender: "Nam",
    dob: "12 Tháng 5 1978",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    status: "Đang điều trị",
    healthStatus: "Ổn định",
    bloodType: "O+",
    weight: "70 kg",
    height: "175 cm",
    bmi: "22.9",
    bmiCategory: "Bình thường",
    chronicConditions: [
      { name: "Đái tháo đường tuýp 2", dx: "2018" },
      { name: "Cao huyết áp", dx: "2020" }
    ],
    contact: {
      phone: "+1 (555) 867-5309",
      address: "123 Đường Y học, Căn hộ 4B, Seattle, WA 98109"
    },
    allergies: [
      { name: "Penicillin", severity: "Sốc phản vệ nghiêm trọng" },
      { name: "Latex (Cao su)", severity: "Phát ban nhẹ" }
    ],
    history: [
      {
        id: "h-1",
        date: "14 Tháng 10, 2023",
        type: "Khám trực tiếp",
        aiTriage: "Xác suất 85%: Theo dõi đái tháo đường định kỳ / Dự kiến tăng nhẹ HbA1c dựa trên dữ liệu thiết bị đeo gần đây.",
        diagnosis: "Đái tháo đường tuýp 2 không biến chứng (E11.9)",
        notes: "Bệnh nhân cho biết cảm thấy khỏe mạnh. Đang tuân thủ phác đồ Metformin. Huyết áp hôm nay được kiểm soát tốt (118/76). Đã chỉ định xét nghiệm chỉ số HbA1c. Khuyên tiếp tục chế độ ăn uống và tập luyện hiện tại.",
        labs: true
      },
      {
        id: "h-2",
        date: "02 Tháng 6, 2023",
        type: "Khám trực tuyến",
        aiTriage: "Xác suất 70%: Viêm đường hô hấp trên cấp tính / Viêm nhiễm đường hô hấp nhẹ.",
        diagnosis: "Viêm phế quản cấp tính (J20.9)",
        notes: "Bệnh nhân ho kéo dài trong 5 ngày, có đờm trong. Không sốt. Phổi trong qua nghe tim phổi ảo. Đã kê đơn ống hít Albuterol sử dụng khi cần (PRN). Khuyên chăm sóc hỗ trợ tại nhà.",
        labs: false
      }
    ],
    symptoms: "Khó thở nhẹ, đau khớp định kỳ.",
    aiPrediction: {
      disease: "Đái tháo đường tuýp 2",
      confidence: 85,
      otherDiseases: [
        { name: "Tăng huyết áp", confidence: 60 }
      ]
    }
  },
  {
    id: "MRN-99482",
    name: "John Doe",
    age: 44,
    gender: "Nam",
    dob: "14/05/1982",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    status: "Đang điều trị",
    healthStatus: "Ổn định",
    bloodType: "A+",
    weight: "82 kg",
    height: "180 cm",
    bmi: "25.3",
    bmiCategory: "Thừa cân",
    chronicConditions: [
      { name: "Tăng lipid máu", dx: "2021" }
    ],
    contact: {
      phone: "+1 (555) 123-4567",
      address: "456 Đường Thông, Seattle, WA 98101"
    },
    allergies: [
      { name: "Penicillin", severity: "Dị ứng thuốc" }
    ],
    history: [],
    symptoms: "Bệnh nhân báo bị ho khan kéo dài trong 5 ngày qua, ngày càng trầm trọng. Khó thở nhẹ.",
    aiPrediction: {
      disease: "Viêm phế quản cấp tính",
      confidence: 88,
      otherDiseases: [
        { name: "Nhiễm trùng đường hô hấp trên do vi-rút", confidence: 45 }
      ]
    }
  },
  {
    id: "PT-10293",
    name: "Arthur Jenkins",
    age: 62,
    gender: "Nam",
    dob: "12/03/1961",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    status: "Đang điều trị",
    healthStatus: "Ổn định",
    bloodType: "O-",
    weight: "78 kg",
    height: "172 cm",
    bmi: "26.4",
    bmiCategory: "Thừa cân",
    chronicConditions: [],
    contact: {
      phone: "+1 (555) 345-6789",
      address: "789 Đường Elm, Seattle, WA 98102"
    },
    allergies: [],
    history: [
      {
        id: "h-3",
        date: "14 Tháng 8, 2026",
        type: "Khám trực tiếp",
        aiTriage: "Xác suất 72%: Cơn đau thắt ngực / Nghi ngờ bệnh mạch vành dựa trên các triệu chứng đau ngực và mệt mỏi.",
        diagnosis: "Cơn đau thắt ngực ổn định (I20.9)",
        notes: "Bệnh nhân báo đau ngực trái khi gắng sức, giảm khi nghỉ ngơi. Đã chỉ định đo điện tâm đồ (ECG). Đã kê đơn nitroglycerin và khuyên tái khám chuyên khoa tim mạch.",
        labs: true,
        prescriptions: [
          { name: "Nitroglycerin", dosage: "0.4mg xịt dưới lưỡi", instructions: "Xịt 1-2 lần khi có cơn đau ngực" },
          { name: "Aspirin", dosage: "81mg", instructions: "Uống 1 viên mỗi ngày sau ăn sáng" }
        ]
      }
    ],
    symptoms: "Đau ngực nhẹ, mệt mỏi",
    aiPrediction: {
      disease: "Cơn đau thắt ngực",
      confidence: 72,
      otherDiseases: [
        { name: "Trào ngược dạ dày thực quản", confidence: 55 }
      ]
    }
  },
  {
    id: "PT-20394",
    name: "Maria Rodriguez",
    age: 38,
    gender: "Nữ",
    dob: "24/08/1985",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    status: "Đang điều trị",
    healthStatus: "Không ổn định",
    bloodType: "B+",
    weight: "65 kg",
    height: "163 cm",
    bmi: "24.5",
    bmiCategory: "Bình thường",
    chronicConditions: [
      { name: "Hen suyễn", dx: "2015" }
    ],
    contact: {
      phone: "+1 (555) 987-6543",
      address: "321 Đường Sồi, Seattle, WA 98103"
    },
    allergies: [
      { name: "Thuốc Sulfa", severity: "Phát ban trung bình" }
    ],
    history: [],
    symptoms: "Khó thở, đánh trống ngực",
    aiPrediction: {
      disease: "Cơn hen cấp tính",
      confidence: 91,
      otherDiseases: [
        { name: "Rối loạn lo âu", confidence: 40 }
      ]
    }
  },
  {
    id: "PT-30485",
    name: "David Lin",
    age: 50,
    gender: "Nam",
    dob: "30/11/1975",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    status: "Đang điều trị",
    healthStatus: "Ổn định",
    bloodType: "AB+",
    weight: "75 kg",
    height: "178 cm",
    bmi: "23.7",
    bmiCategory: "Bình thường",
    chronicConditions: [
      { name: "Cao huyết áp", dx: "2019" }
    ],
    contact: {
      phone: "+1 (555) 234-5678",
      address: "654 Đại lộ Phong, Seattle, WA 98104"
    },
    allergies: [],
    history: [],
    symptoms: "Khám lại: Cao huyết áp",
    aiPrediction: {
      disease: "Tăng huyết áp vô căn",
      confidence: 95,
      otherDiseases: []
    }
  },
  {
    id: "PT-40576",
    name: "Sarah Kim",
    age: 29,
    gender: "Nữ",
    dob: "05/04/1997",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    status: "Đang điều trị",
    healthStatus: "Ổn định",
    bloodType: "A-",
    weight: "58 kg",
    height: "165 cm",
    bmi: "21.3",
    bmiCategory: "Bình thường",
    chronicConditions: [],
    contact: {
      phone: "+1 (555) 876-5432",
      address: "987 Đường Tuyết Tùng, Seattle, WA 98105"
    },
    allergies: [],
    history: [],
    symptoms: "Khám sức khỏe định kỳ",
    aiPrediction: {
      disease: "Khỏe mạnh",
      confidence: 99,
      otherDiseases: []
    }
  }
];

const INITIAL_APPOINTMENTS = [
  {
    id: "ap1",
    patientId: "PT-10293",
    name: "Arthur Jenkins",
    time: "09:00 AM",
    symptoms: "Đau ngực nhẹ, mệt mỏi",
    status: "Completed",
    isDelayed: false
  },
  {
    id: "ap2",
    patientId: "PT-20394",
    name: "Maria Rodriguez",
    time: "10:30 AM",
    symptoms: "Khó thở, đánh trống ngực",
    status: "In Progress",
    isDelayed: false
  },
  {
    id: "ap3",
    patientId: "PT-30485",
    name: "David Lin",
    time: "11:15 AM",
    symptoms: "Khám lại: Cao huyết áp",
    status: "Waiting",
    isDelayed: true
  },
  {
    id: "ap4",
    patientId: "PT-40576",
    name: "Sarah Kim",
    time: "01:00 PM",
    symptoms: "Khám sức khỏe định kỳ",
    status: "Waiting",
    isDelayed: false
  }
];

export default function MedicalScreen() {
  const { user } = useAuth();

  const [activeSidebarTab, setActiveSidebarTab] = useState('schedules');
  const [currentView, setCurrentView] = useState('dashboard');
  const [doctorActiveTab, setDoctorActiveTab] = useState('clinical');

  const [profileName, setProfileName] = useState('');
  const [profileSpecialty, setProfileSpecialty] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileBiography, setProfileBiography] = useState('');
  const [profileEducation, setProfileEducation] = useState('');

  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem(`doctor_profile_${user.id}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfileName(parsed.full_name || user.full_name || '');
          setProfileSpecialty(parsed.specialty || user.specialty || 'General Practice');
          setProfilePhone(parsed.phone || '');
          setProfileAddress(parsed.address || '');
          setProfileBiography(parsed.biography || '');
          setProfileEducation(parsed.education || '');
        } catch (e) {
          console.error("Lỗi parse hồ sơ bác sĩ cá nhân:", e);
        }
      } else {
        setProfileName(user.full_name || '');
        setProfileSpecialty(user.specialty || 'General Practice');

        if (user.id === 2 || user.full_name?.includes("Sarah Chen")) {
          setProfilePhone('+1 (555) 987-6543');
          setProfileAddress('Phòng khám Tim mạch MedCentral, Tầng 3, 123 Medical Way, Seattle');
          setProfileBiography('Bác sĩ Sarah Chen có hơn 12 năm kinh nghiệm lâm sàng trong lĩnh vực chẩn đoán và điều trị bệnh lý tim mạch, suy tim, và rối loạn nhịp tim. Từng là Trưởng khoa Tim mạch tại Trung tâm Y tế Seattle.');
          setProfileEducation('Thạc sĩ Y khoa chuyên ngành Tim mạch - Đại học Washington; Bác sĩ nội trú tại Bệnh viện Seattle.');
        } else if (user.id === 3 || user.id === 1 || user.full_name?.includes("James Miller") || user.full_name?.includes("Miller")) {
          setProfilePhone('+1 (555) 345-6789');
          setProfileAddress('Phòng khám Đa khoa MedCentral, Tầng 1, 123 Medical Way, Seattle');
          setProfileBiography('Bác sĩ James Miller chuyên về Nội tổng quát và Chăm sóc sức khỏe ban đầu. Hơn 15 năm kinh nghiệm đồng hành cùng bệnh nhân phòng ngừa và điều trị các bệnh lý cấp và mãn tính như cao huyết áp, tiểu đường.');
          setProfileEducation('Bác sĩ Y khoa Tổng quát - Đại học Y khoa Seattle; Chứng chỉ Y học gia đình Hoa Kỳ.');
        } else if (user.id === 4 || user.full_name?.includes("Sarah Khalil")) {
          setProfilePhone('+1 (555) 876-5432');
          setProfileAddress('Trung tâm Nghiên cứu Thần kinh MedCentral, Tầng 4, 123 Medical Way, Seattle');
          setProfileBiography('Chuyên gia Nội thần kinh chuyên sâu về bệnh động kinh, đột quỵ và các hội chứng đau đầu mãn tính. Hơn 10 năm kinh nghiệm nghiên cứu ứng dụng trí tuệ nhân tạo vào hỗ trợ phân tích thần kinh.');
          setProfileEducation('Tiến sĩ Thần kinh học - Đại học Harvard; Thành viên Hiệp hội Thần kinh học Hoa Kỳ.');
        } else {
          setProfilePhone('');
          setProfileAddress('');
          setProfileBiography('Chưa cập nhật giới thiệu.');
          setProfileEducation('Chưa cập nhật thông tin học vấn.');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchRealData = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/appointments/doctor/${user.id}`);
        if (res.data && res.data.success) {
          const dbAppointments = res.data.appointments;

          const newPatients = dbAppointments.map(app => {
            const formattedDob = "12/10/1998";
            const age = 28;

            const mappedAllergies = app.allergens && app.allergens.length > 0
              ? app.allergens.map(alg => ({ name: alg, severity: "Trung bình" }))
              : [];

            return {
              id: `PT-${app.patient_name ? app.patient_name.replace(/\s+/g, '') : app.appointment_id}`,
              db_patient_id: app.patient_id,
              name: app.patient_name || 'Bệnh nhân',
              age: age,
              gender: "Nữ",
              dob: formattedDob,
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              status: "Đang điều trị",
              healthStatus: "Ổn định",
              bloodType: "O+",
              weight: "58 kg",
              height: "165 cm",
              bmi: "21.3",
              bmiCategory: "Bình thường",
              chronicConditions: [],
              contact: {
                phone: "+1 (555) 987-6543",
                address: "123 Medical Way, Seattle"
              },
              allergies: mappedAllergies,
              history: [],
              symptoms: app.ai_disease || "Chẩn đoán trực tiếp không qua triage",
              aiPrediction: {
                disease: app.ai_disease || "Chưa rõ",
                confidence: 85,
                otherDiseases: []
              },
              rawAppointmentId: app.appointment_id
            };
          });

          const mappedAppointments = dbAppointments.map(app => {
            let formattedTime = '09:00 AM';
            try {
              const dt = new Date(app.appointment_time);
              formattedTime = dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } catch (err) {
              formattedTime = app.appointment_time;
            }

            let uiStatus = 'Waiting';
            if (app.status === 'Completed' || app.status === 'Validated') {
              uiStatus = 'Completed';
            } else if (app.status === 'In Progress') {
              uiStatus = 'In Progress';
            }

            return {
              id: String(app.appointment_id),
              patientId: `PT-${app.patient_name ? app.patient_name.replace(/\s+/g, '') : app.appointment_id}`,
              name: app.patient_name || 'Bệnh nhân',
              time: formattedTime,
              symptoms: app.ai_disease || 'Xem hồ sơ',
              status: uiStatus,
              isDelayed: false,
              rawAppointmentId: app.appointment_id,
              rawAppointment: app
            };
          });

          setPatients(prev => {
            const filteredPrev = prev.filter(p => !newPatients.some(np => np.id === p.id));
            return [...newPatients, ...filteredPrev];
          });

          setAppointments(prev => {
            const filteredPrev = prev.filter(a => !mappedAppointments.some(ma => ma.id === a.id));
            return [...mappedAppointments, ...filteredPrev];
          });

          if (newPatients.length > 0) {
            setSelectedPatientId(newPatients[0].id);
          }
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ dữ liệu lịch hẹn thực tế:", err);
      }
    };

    fetchRealData();
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!user) return;

    const updatedProfile = {
      full_name: profileName,
      specialty: profileSpecialty,
      phone: profilePhone,
      address: profileAddress,
      biography: profileBiography,
      education: profileEducation
    };

    localStorage.setItem(`doctor_profile_${user.id}`, JSON.stringify(updatedProfile));

    const storedUserJson = localStorage.getItem('user');
    if (storedUserJson) {
      try {
        const storedUser = JSON.parse(storedUserJson);
        const newUser = {
          ...storedUser,
          full_name: profileName,
          specialty: profileSpecialty
        };
        localStorage.setItem('user', JSON.stringify(newUser));

        user.full_name = profileName;
        user.specialty = profileSpecialty;
      } catch (err) {
        console.error(err);
      }
    }

    showToast("Đã cập nhật hồ sơ bác sĩ thành công!");
    setCurrentView('dashboard');
    setActiveSidebarTab('schedules');
  };

  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [selectedPatientId, setSelectedPatientId] = useState('PT-84729');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: "Albuterol Sulfate HFA", dosage: "90 mcg/lần xịt", instructions: "Hít 2 hơi mỗi 4-6 giờ khi cần thiết do khó thở." },
    { id: 2, name: "Benzonatate", dosage: "100 mg", instructions: "Uống 1 viên mỗi lần, ngày 3 lần khi cần thiết do ho." }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');

  useEffect(() => {
    const fetchAppointmentDetail = async () => {
      if (!selectedPatientId) return;
      const patient = patients.find(p => p.id === selectedPatientId);
      if (!patient) return;

      const pId = patient.db_patient_id;
      const rawAppId = patient.rawAppointmentId;

      if (!pId && !rawAppId) return;

      try {
        let detail = null;
        let finalPatientId = pId;

        if (rawAppId) {
          const res = await api.get(`/appointments/${rawAppId}`);
          if (res.data && res.data.success) {
            detail = res.data.data;
            finalPatientId = detail.patient.id;
          }
        }

        if (!finalPatientId) return;

        let dbHistory = [];
        try {
          const historyRes = await api.get(`/appointments/patient/${finalPatientId}`);
          if (historyRes.data && historyRes.data.records) {

            const completedRecords = historyRes.data.records.filter(
              rec => rec.status === 'Completed' || rec.status === 'Validated'
            );

            dbHistory = completedRecords.map(rec => ({
              id: `h-db-${rec.appointment_id}`,
              date: new Date(rec.appointment_time).toLocaleDateString('vi-VN', { month: 'short', day: '2-digit', year: 'numeric' }),
              type: "Khám trực tiếp",
              aiTriage: rec.ai_disease
                ? `${Math.round((rec.ai_confidence || 0.8) * 100)}% khả năng được dự đoán bởi AI: ${rec.ai_disease}`
                : "Chẩn đoán trực tiếp không qua triage",
              diagnosis: rec.doctor_corrected_disease || rec.ai_disease || "Chưa có kết luận",
              notes: rec.notes || "Không có ghi chú.",
              labs: false,
              prescriptions: rec.prescription
                ? rec.prescription.split('\n').map((p, idx) => {
                    const parts = p.split(' | ');
                    return {
                      id: idx,
                      name: parts[0] || p,
                      dosage: parts[1] || "",
                      instructions: parts[2] || ""
                    };
                  })
                : []
            }));
          }
        } catch (historyErr) {
          console.error("Lỗi khi tải lịch sử bệnh án thực tế:", historyErr);
        }

        let dbAiHistory = [];
        try {
          const aiHistoryRes = await api.get(`/diagnosis/history/${finalPatientId}`);
          if (aiHistoryRes.data && aiHistoryRes.data.records) {
            dbAiHistory = aiHistoryRes.data.records;
          }
        } catch (aiHistoryErr) {
          console.error("Lỗi khi tải lịch sử chẩn đoán AI thực tế:", aiHistoryErr);
        }

        setPatients(prevPatients =>
          prevPatients.map(p => {
            if (p.id === selectedPatientId) {

              const mappedAllergies = detail?.patient?.allergies && detail.patient.allergies.length > 0
                ? detail.patient.allergies.map(alg => ({
                    name: alg.allergy_type,
                    severity: alg.severity || "Trung bình",
                    notes: alg.notes || ""
                  }))
                : p.allergies;

              return {
                ...p,
                db_patient_id: finalPatientId,
                email: detail?.patient?.email || p.email,
                allergies: mappedAllergies,
                symptoms: detail?.ai_prediction?.symptoms_text || p.symptoms,
                aiPrediction: detail?.ai_prediction ? {
                  disease: detail.ai_prediction.ai_disease || "Chưa rõ",
                  confidence: Math.round(detail.ai_prediction.ai_confidence * 100),
                  otherDiseases: []
                } : p.aiPrediction,
                history: dbHistory.length > 0 ? dbHistory : p.history,
                aiHistory: dbAiHistory
              };
            }
            return p;
          })
        );

        if (detail) {
          setFormDiagnosis(detail.ai_prediction?.ai_disease || '');
          setFormNotes(detail.notes || `Bệnh nhân báo các triệu chứng của: ${detail.ai_prediction?.symptoms_text || ''}.`);
          if (detail.prescription) {
            setPrescriptions(detail.prescription.split('\n').map((p, idx) => {
              const parts = p.split(' | ');
              return {
                id: idx,
                name: parts[0] || p,
                dosage: parts[1] || "",
                instructions: parts[2] || ""
              };
            }));
          }
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ chi tiết cuộc hẹn từ CSDL:", err);
      }
    };

    fetchAppointmentDetail();
  }, [selectedPatientId]);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const filteredAppointments = useMemo(() => {

    let list = appointments.filter(app => {
      let appDateStr = '';
      if (app.rawAppointmentId && app.rawAppointment?.appointment_time) {
        try {
          const dt = new Date(app.rawAppointment.appointment_time);
          const year = dt.getFullYear();
          const month = String(dt.getMonth() + 1).padStart(2, '0');
          const day = String(dt.getDate()).padStart(2, '0');
          appDateStr = `${year}-${month}-${day}`;
        } catch (err) {
          appDateStr = app.rawAppointment.appointment_time.split(' ')[0];
        }
      } else {

        const today = new Date();
        appDateStr = today.toISOString().split('T')[0];
      }
      return appDateStr === selectedDate;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(app =>
        app.name.toLowerCase().includes(q) ||
        app.symptoms.toLowerCase().includes(q) ||
        app.status.toLowerCase().includes(q)
      );
    }

    const parseTimeToMinutes = (app) => {
      if (app.rawAppointment?.appointment_time) {
        const timePart = app.rawAppointment.appointment_time.split(' ')[1];
        if (timePart) {
          const [h, m] = timePart.split(':').map(Number);
          return h * 60 + m;
        }
      }

      const timeStr = app.time || '09:00 AM';
      const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (parts) {
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        const ampm = parts[3].toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      }
      return 0;
    };

    return list.sort((a, b) => {
      const getPriority = (status) => {
        if (status === 'In Progress') return 1;
        if (status === 'Waiting') return 2;
        if (status === 'Completed') return 3;
        return 4;
      };

      const pA = getPriority(a.status);
      const pB = getPriority(b.status);

      if (pA !== pB) {
        return pA - pB;
      }

      return parseTimeToMinutes(a) - parseTimeToMinutes(b);
    });
  }, [appointments, selectedDate, searchQuery]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    return patients.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.bloodType && p.bloodType.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [patients, searchQuery]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const viewPatientChart = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentView('chart');
    setActiveSidebarTab('records');
  };

  const startConsultation = (patientId, defaultDiagnosis = '') => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId) || patients[0];

    setFormDiagnosis(defaultDiagnosis || patient.aiPrediction?.disease || '');
    setFormNotes(patient.history?.[0]?.notes || `Bệnh nhân báo các triệu chứng của: ${patient.symptoms || ''}.`);

    if (patient.id === "MRN-99482") {
      setPrescriptions([
        { id: 1, name: "Albuterol Sulfate HFA", dosage: "90 mcg/lần xịt", instructions: "Hít 2 hơi mỗi 4-6 giờ khi cần thiết do khó thở." },
        { id: 2, name: "Benzonatate", dosage: "100 mg", instructions: "Uống 1 viên mỗi lần, ngày 3 lần khi cần thiết do ho." }
      ]);
    } else if (patient.id === "PT-84729") {
      setPrescriptions([
        { id: 1, name: "Metformin", dosage: "500 mg", instructions: "Uống 1 viên mỗi lần, ngày 2 lần cùng bữa ăn." },
        { id: 2, name: "Lisinopril", dosage: "10 mg", instructions: "Uống 1 viên mỗi ngày." }
      ]);
    } else {
      setPrescriptions([
        { id: 1, name: "Amoxicillin", dosage: "500 mg", instructions: "Uống 1 viên mỗi lần, ngày 3 lần trong vòng 7 ngày." }
      ]);
    }

    setNewMedName('');
    setNewMedDosage('');
    setNewMedInstructions('');
    setCurrentView('diagnosis');
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const newMed = {
      id: Date.now(),
      name: newMedName,
      dosage: newMedDosage || "N/A",
      instructions: newMedInstructions || "Theo chỉ dẫn của bác sĩ"
    };
    setPrescriptions([...prescriptions, newMed]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedInstructions('');
    showToast("Đã thêm thuốc: " + newMed.name);
  };

  const handleRemoveMedication = (id) => {
    const deletedMed = prescriptions.find(m => m.id === id);
    setPrescriptions(prescriptions.filter(m => m.id !== id));
    if (deletedMed) {
      showToast("Đã xóa thuốc: " + deletedMed.name);
    }
  };

  const handleSaveConsultation = (isDraft = false) => {

    const historyEntry = {
      id: `h-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN', { month: 'short', day: '2-digit', year: 'numeric' }),
      type: "Khám trực tiếp",
      aiTriage: `${activePatient.aiPrediction?.confidence || 80}% khả năng được dự đoán bởi MedCentral AI. Đã được xác thực lâm sàng.`,
      diagnosis: `${formDiagnosis || "Chẩn đoán không xác định"}`,
      notes: formNotes || "Không có ghi chú.",
      labs: false,
      prescriptions: [...prescriptions]
    };

    if (activePatient.rawAppointmentId) {
      const presText = prescriptions.map(p => `${p.name} | ${p.dosage} | ${p.instructions}`).join('\n');
      api.put(`/appointments/${activePatient.rawAppointmentId}/diagnose`, {
        notes: formNotes,
        prescription: presText,
        doctor_corrected_disease: formDiagnosis
      })
      .then(res => {
        if (res.data && res.data.success) {
          showToast(isDraft ? "Đã lưu bản nháp thành công!" : "Hồ sơ bệnh án đã được lưu vào CSDL thành công!");
        }
      })
      .catch(err => {
        console.error("Lỗi khi lưu kết luận lên CSDL:", err);
        showToast("Lỗi khi lưu kết luận lên CSDL: " + (err.response?.data?.error || err.message));
      });
    }

    setPatients(prevPatients =>
      prevPatients.map(p => {
        if (p.id === activePatient.id) {
          return {
            ...p,
            history: [historyEntry, ...p.history]
          };
        }
        return p;
      })
    );

    setAppointments(prevApps =>
      prevApps.map(app => {
        if (app.patientId === activePatient.id) {
          return {
            ...app,
            status: isDraft ? "In Progress" : "Completed"
          };
        }
        return app;
      })
    );

    showToast(isDraft ? "Đã lưu bản nháp thành công!" : "Hồ sơ bệnh án đã được lưu và hoàn thành!");
    if (isDraft) {
      setCurrentView('dashboard');
      setActiveSidebarTab('schedules');
    } else {
      setCurrentView('print_prescription');
    }
  };

  const stats = useMemo(() => {
    const total = appointments.length + 10;
    const waiting = appointments.filter(a => a.status === "Waiting").length;
    const completed = appointments.filter(a => a.status === "Completed").length + 4;
    return {
      total,
      emergency: 2,
      completed
    };
  }, [appointments]);

  return (
    <div className="flex bg-[#FAF6F3] min-h-screen text-[#4A3E39] font-sans antialiased">

      {toastMessage && (
        <div className="fixed top-4 right-4 bg-[#843F2E] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 z-50 animate-bounce text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#F3D7D0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 bg-[#FCF6F3] border-r border-[#EFE5E0] w-64 z-30 transition-transform duration-300 transform
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0'}
        lg:static lg:block shrink-0
      `}>

        <div className="p-6 border-b border-[#EFE5E0] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D3765F] flex items-center justify-center text-white shadow-md shadow-[#D3765F]/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#843F2E] tracking-tight leading-none">MedCentral</h1>
              <span className="text-[10px] font-bold text-[#A8968F] uppercase tracking-wider">Cổng Bác sĩ</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-[#843F2E] hover:bg-[#F2E8E4] p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5">
          <button
            onClick={() => {
              setActiveSidebarTab('schedules');
              setCurrentView('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeSidebarTab === 'schedules'
                ? 'bg-[#FBEEE9] text-[#843F2E] border-r-4 border-[#D3765F]'
                : 'text-[#6B5E59] hover:bg-[#F7ECE8] hover:text-[#843F2E]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4.5 h-4.5" />
              <span>Lịch hẹn khám</span>
            </div>
            <span className="bg-[#D3765F] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              {appointments.filter(a => a.status === 'Waiting' || a.status === 'In Progress').length || 0}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSidebarTab('records');
              setCurrentView('patient_list');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeSidebarTab === 'records'
                ? 'bg-[#FBEEE9] text-[#843F2E] border-r-4 border-[#D3765F]'
                : 'text-[#6B5E59] hover:bg-[#F7ECE8] hover:text-[#843F2E]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4.5 h-4.5" />
              <span>Hồ sơ bệnh nhân</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveSidebarTab('profile');
              setCurrentView('profile');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeSidebarTab === 'profile'
                ? 'bg-[#FBEEE9] text-[#843F2E] border-r-4 border-[#D3765F]'
                : 'text-[#6B5E59] hover:bg-[#F7ECE8] hover:text-[#843F2E]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4.5 h-4.5" />
              <span>Cài đặt hồ sơ</span>
            </div>
          </button>

          <a
            href="/prescription-prototype"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-[#6B5E59] hover:bg-[#F7ECE8] hover:text-[#843F2E] transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4.5 h-4.5 text-[#D3765F]" />
              <span>Mẫu Đơn Thuốc & QR</span>
            </div>
            <span className="bg-[#FBEEE9] text-[#D3765F] text-[9px] px-1.5 py-0.5 rounded font-bold border border-[#F2DED7]">
              MỚI
            </span>
          </a>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#EFE5E0] bg-[#FCF6F3]">
          <div
            onClick={() => {
              setActiveSidebarTab('profile');
              setCurrentView('profile');
            }}
            className="flex items-center gap-3 p-2 hover:bg-[#F7ECE8] rounded-2xl transition-all cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt={profileName || user?.full_name || 'Bác sĩ'}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#D3765F]/35"
            />
            <div className="text-left overflow-hidden">
              <h5 className="text-xs font-extrabold text-[#843F2E] truncate leading-tight">{profileName || user?.full_name || 'Bác sĩ'}</h5>
              <span className="text-[10px] font-bold text-[#A8968F] uppercase tracking-wider">
                {profileSpecialty === 'Cardiology Specialist' ? 'Chuyên khoa Tim mạch' : profileSpecialty === 'General Practice' ? 'Bác sĩ Đa khoa' : profileSpecialty === 'Neurology' ? 'Chuyên khoa Thần kinh' : (profileSpecialty || 'Chuyên gia')}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/25 backdrop-blur-xs z-25 lg:hidden"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">

        <header className="sticky top-0 bg-[#FAF6F3]/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-[#EFE5E0] z-20">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#843F2E] hover:bg-[#F2E8E4] rounded-xl transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full">
              <input
                type="text"
                placeholder={
                  currentView === 'dashboard'
                    ? "Tìm kiếm bệnh nhân, mã số, hoặc ghi chú..."
                    : "Tìm kiếm mã bệnh nhân, tên bệnh nhân..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FBEEE9]/50 border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] placeholder:text-[#A8968F] py-2.5 pl-10 pr-4 rounded-full focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-[#A8968F] absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-[#A8968F] hover:text-[#843F2E]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3.5 ml-4">
            <button
              onClick={() => showToast("Đã tải danh sách thông báo (0 chưa đọc)")}
              className="relative p-2.5 bg-white text-[#D3765F] hover:text-[#843F2E] hover:bg-[#FBEEE9]/30 rounded-full border border-[#EFE5E0] shadow-xs transition-all active:scale-95"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D3765F] rounded-full border border-white"></span>
            </button>

            <button
              onClick={() => showToast("Đã truy cập menu cài đặt")}
              className="p-2.5 bg-white text-[#A8968F] hover:text-[#843F2E] hover:bg-[#FBEEE9]/30 rounded-full border border-[#EFE5E0] shadow-xs transition-all active:scale-95"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">

          {currentView === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-[#4A3E39] leading-tight">
                  Chào buổi sáng, Bác sĩ {profileName || user?.full_name || 'Bác sĩ'}
                </h2>
                <p className="text-xs font-semibold text-[#80726B]">
                  Đây là lịch hẹn khám của bác sĩ hôm nay, ngày {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                <div className="bg-white rounded-2xl p-5 border border-[#EFE5E0] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-200">
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Tổng bệnh nhân</span>
                    <span className="text-3xl font-extrabold text-[#4A3E39] block leading-none">{stats.total}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#FBEEE9] text-[#D3765F] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#EFE5E0] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-200">
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Trường hợp khẩn cấp</span>
                    <span className="text-3xl font-extrabold text-[#843F2E] block leading-none">{stats.emergency}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#FCECE8] text-[#843F2E] flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#843F2E]" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#EFE5E0] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-200">
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Đã hoàn thành</span>
                    <span className="text-3xl font-extrabold text-[#2A7E5C] block leading-none">{stats.completed}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#E6F5EE] text-[#2A7E5C] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-[#EFE5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-extrabold text-[#4A3E39] uppercase tracking-wide">Danh sách hẹn khám</h3>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-[#FBEEE9]/50 border border-[#EFE5E0] text-xs font-bold text-[#843F2E] px-3.5 py-1.5 rounded-xl focus:outline-none focus:border-[#D3765F] transition-all cursor-pointer shadow-2xs"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedDate(today);
                      showToast("Đã chuyển về ngày hôm nay!");
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#D3765F] hover:text-white hover:bg-[#D3765F] transition-all bg-[#FBEEE9]/30 rounded-xl px-3 py-2 border border-[#EFE5E0]/60"
                  >
                    <span>Hôm nay</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF6F3] border-b border-[#EFE5E0] text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">
                        <th className="px-6 py-4">Tên bệnh nhân</th>
                        <th className="px-6 py-4">Giờ khám</th>
                        <th className="px-6 py-4">Triệu chứng chính</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE5E0]">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((app) => {
                          const patientInfo = patients.find(p => p.id === app.patientId) || {};
                          return (
                            <tr key={app.id} className="hover:bg-[#FAF6F3]/50 transition-colors group">

                              <td className="px-6 py-4.5">
                                <div
                                  onClick={() => viewPatientChart(app.patientId)}
                                  className="flex items-center gap-3 cursor-pointer group-hover:opacity-95"
                                >
                                  <div className="w-9 h-9 rounded-full bg-[#FBEEE9] text-[#843F2E] flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-[#EFE5E0]">
                                    {patientInfo.avatar ? (
                                      <img src={patientInfo.avatar} alt={app.name} className="w-full h-full object-cover" />
                                    ) : (
                                      app.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-extrabold text-xs text-[#4A3E39] hover:underline group-hover:text-[#D3765F] transition-all">
                                      {app.name}
                                    </span>
                                    <span className="block text-[10px] text-[#A8968F] font-semibold mt-0.5">Mã bệnh nhân: {app.patientId}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4.5">
                                <div className="text-xs font-bold text-[#4A3E39]">
                                  {app.time}
                                </div>
                              </td>

                              <td className="px-6 py-4.5">
                                <span className="text-xs font-semibold text-[#80726B] leading-relaxed">
                                  {app.symptoms}
                                </span>
                              </td>

                              <td className="px-6 py-4.5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                  app.status === 'Completed'
                                    ? 'bg-[#E6F5EE] text-[#2A7E5C] border-[#C6ECD9]'
                                    : app.status === 'In Progress'
                                    ? 'bg-[#FDF2E9] text-[#B45309] border-[#FBE5D6]'
                                    : 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
                                }`}>
                                  {app.status === 'Completed' && <Check className="w-3 h-3" />}
                                  {app.status === 'In Progress' && <Clock className="w-3 h-3 animate-spin" />}
                                  {app.status === 'Waiting' && <Clock className="w-3 h-3" />}
                                  <span>
                                    {app.status === 'Completed' ? 'Đã xong' :
                                     app.status === 'In Progress' ? 'Đang khám' : 'Đang chờ'}
                                  </span>
                                </span>
                              </td>

                              <td className="px-6 py-4.5 text-right">
                                {app.status === 'Completed' ? (
                                  <button
                                    onClick={() => viewPatientChart(app.patientId)}
                                    className="text-xs font-extrabold text-[#D3765F] hover:text-[#843F2E] transition-all hover:underline"
                                  >
                                    Xem ghi chú
                                  </button>
                                ) : app.status === 'In Progress' ? (
                                  <button
                                    onClick={() => startConsultation(app.patientId)}
                                    className="bg-[#D3765F] text-white hover:bg-[#843F2E] text-[11px] font-extrabold px-3.5 py-1.5 rounded-lg shadow-sm transition-all hover:shadow active:scale-95"
                                  >
                                    Khám tiếp
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => startConsultation(app.patientId)}
                                    className="bg-[#D3765F] text-white hover:bg-[#843F2E] text-[11px] font-extrabold px-3.5 py-1.5 rounded-lg shadow-sm transition-all hover:shadow active:scale-95"
                                  >
                                    Khám ngay
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-xs font-medium text-[#A8968F]">
                            Không tìm thấy lịch hẹn phù hợp với từ khóa tìm kiếm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentView === 'chart' && (
            <div className="space-y-6 animate-fadeIn">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5E0] pb-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (activeSidebarTab === 'records') {
                        setCurrentView('patient_list');
                      } else {
                        setCurrentView('dashboard');
                        setActiveSidebarTab('schedules');
                      }
                    }}
                    className="p-2 bg-white text-[#D3765F] hover:text-white hover:bg-[#D3765F] rounded-xl border border-[#EFE5E0] shadow-xs transition-all active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-extrabold text-[#4A3E39] leading-tight">Hồ sơ bệnh án</h2>
                      <span className="bg-[#FBEEE9] text-[#843F2E] text-[10px] font-extrabold px-2.5 py-1 rounded-md border border-[#F2DED7]">
                        Mã BN: {activePatient.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-white text-[#6B5E59] hover:bg-[#F7ECE8] hover:text-[#843F2E] text-xs font-extrabold px-4 py-2.5 rounded-xl border border-[#EFE5E0] shadow-xs transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In hồ sơ</span>
                  </button>
                  <button
                    onClick={() => startConsultation(activePatient.id)}
                    className="flex items-center gap-1.5 bg-[#D3765F] text-white hover:bg-[#843F2E] text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-[#D3765F]/15 transition-all hover:shadow active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo lượt khám mới</span>
                  </button>
                </div>
              </div>

              <AISummaryCard
                appointmentId={activePatient?.rawAppointmentId}
                patient={activePatient}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-4 space-y-6">

                  <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <img
                        src={activePatient.avatar}
                        alt={activePatient.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#FBEEE9] shadow-xs"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-[#4A3E39]">{activePatient.name}</h3>
                        <p className="text-[11px] font-semibold text-[#80726B] mt-0.5">
                          {activePatient.age} tuổi • {activePatient.gender} • NS: {activePatient.dob}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#FAF6F3] text-[#80726B] border border-[#EFE5E0] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {activePatient.status}
                        </span>
                        <span className="bg-[#E6F5EE] text-[#2A7E5C] border border-[#C6ECD9] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {activePatient.healthStatus}
                        </span>
                      </div>

                      <div className="w-full bg-[#FCF9F7] rounded-xl p-3 border border-[#EFE5E0]/60 text-left mt-2">
                        <span className="block text-[9px] font-bold text-[#A8968F] uppercase">Chẩn đoán hiện tại</span>
                        {activePatient.history && activePatient.history.length > 0 ? (
                          <div className="mt-1">
                            <span className="text-xs font-extrabold text-[#4A3E39] block leading-snug">
                              {activePatient.history[0].diagnosis}
                            </span>
                            <span className="inline-block mt-1 bg-[#E6F5EE] text-[#2A7E5C] text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-[#C6ECD9] uppercase tracking-wider">
                              Đã xác thực lâm sàng
                            </span>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <span className="text-xs font-extrabold text-[#843F2E] block leading-snug">
                              {activePatient.aiPrediction?.disease || "Chưa xác định"}
                            </span>
                            <span className="inline-block mt-1 bg-[#FBEEE9] text-[#D3765F] text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-[#F2DED7] uppercase tracking-wider">
                              AI dự đoán ({activePatient.aiPrediction?.confidence || 80}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-[#FAF6F3] pt-5">
                      <div className="bg-[#FCF9F7] rounded-xl p-3 border border-[#EFE5E0]/60">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#A8968F] uppercase">
                          <Droplet className="w-3.5 h-3.5 text-red-500" />
                          <span>Nhóm máu</span>
                        </div>
                        <span className="block text-sm font-extrabold text-[#4A3E39] mt-1">{activePatient.bloodType || 'Chưa rõ'}</span>
                      </div>

                      <div className="bg-[#FCF9F7] rounded-xl p-3 border border-[#EFE5E0]/60">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#A8968F] uppercase">
                          <Scale className="w-3.5 h-3.5 text-blue-500" />
                          <span>Cân nặng</span>
                        </div>
                        <span className="block text-sm font-extrabold text-[#4A3E39] mt-1">{activePatient.weight || 'Chưa rõ'}</span>
                      </div>

                      <div className="bg-[#FCF9F7] rounded-xl p-3 border border-[#EFE5E0]/60">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#A8968F] uppercase">
                          <Activity className="w-3.5 h-3.5 text-orange-500" />
                          <span>Chiều cao</span>
                        </div>
                        <span className="block text-sm font-extrabold text-[#4A3E39] mt-1">{activePatient.height || 'Chưa rõ'}</span>
                      </div>

                      <div className="bg-[#FCF9F7] rounded-xl p-3 border border-[#EFE5E0]/60">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#A8968F] uppercase">
                          <Heart className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Chỉ số BMI</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-sm font-extrabold text-[#4A3E39]">{activePatient.bmi}</span>
                          <span className="text-[10px] font-bold text-[#2A7E5C] bg-[#E6F5EE] px-1 rounded">({activePatient.bmiCategory})</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#FAF6F3] pt-5 space-y-2.5">
                      <span className="block text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Bệnh lý mãn tính</span>
                      {activePatient.chronicConditions && activePatient.chronicConditions.length > 0 ? (
                        <div className="space-y-1.5">
                          {activePatient.chronicConditions.map((cond, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#FAF6F3] rounded-lg px-3 py-1.5 border border-[#EFE5E0]/60 text-xs">
                              <span className="font-bold text-[#4A3E39]">{cond.name}</span>
                              <span className="text-[10px] font-semibold text-[#80726B]">Chẩn đoán: {cond.dx}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-[#A8968F] italic">Không có hồ sơ bệnh lý mãn tính</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 space-y-4">
                    <h4 className="text-[10px] font-extrabold text-[#A8968F] uppercase tracking-wider">Thông tin liên lạc</h4>
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-[#D3765F] shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-xs font-bold text-[#4A3E39]">{activePatient.contact?.phone}</span>
                          <span className="block text-[9px] font-bold text-[#A8968F] uppercase mt-0.5">Di động</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#D3765F] shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-xs font-semibold text-[#4A3E39] leading-relaxed">{activePatient.contact?.address}</span>
                          <span className="block text-[9px] font-bold text-[#A8968F] uppercase mt-0.5">Địa chỉ thường trú</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">

                  <div className="bg-[#FCECE8] rounded-2xl border border-[#F5DDD7] p-5 flex items-start gap-4 shadow-2xs">
                    <div className="p-3 bg-[#EFAAA5]/30 rounded-xl text-[#843F2E] border border-[#EFAAA5]/40 shrink-0">
                      <AlertTriangle className="w-6 h-6 text-[#843F2E]" />
                    </div>
                    <div className="space-y-3 flex-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-[#843F2E] leading-none">Cảnh báo dị ứng đặc biệt nghiêm trọng</h4>

                      {activePatient.allergies && activePatient.allergies.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {activePatient.allergies.map((allergy, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                allergy.severity.includes('nghiêm trọng') || allergy.severity.includes('Severe')
                                  ? 'bg-[#843F2E] text-white border-[#843F2E]'
                                  : 'bg-white text-[#843F2E] border-[#F5DDD7] hover:bg-[#FAF6F3]'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                              {allergy.name} - {allergy.severity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-[#80726B]">Bệnh nhân không có tiền sử dị ứng nào được báo cáo.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#4A3E39] uppercase tracking-wide">Lịch sử khám bệnh</h3>
                        <p className="text-xs font-semibold text-[#80726B] mt-0.5">Hồ sơ thăm khám lâm sàng được sắp xếp theo thời gian.</p>
                      </div>

                      <button
                        onClick={() => showToast("Đã tải bộ lọc thời gian")}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#6B5E59] hover:text-[#843F2E] transition-all bg-[#FAF6F3] rounded-xl px-3.5 py-2 border border-[#EFE5E0]/60 ml-auto sm:ml-0"
                      >
                        <span>12 tháng gần đây</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex border-b border-[#EFE5E0] mb-4">
                      <button
                        onClick={() => setDoctorActiveTab('clinical')}
                        className={`pb-2 text-xs font-extrabold transition-all px-4 relative ${
                          doctorActiveTab === 'clinical' ? 'text-[#843F2E]' : 'text-[#A8968F] hover:text-[#6B5E59]'
                        }`}
                      >
                        Lịch sử khám lâm sàng
                        {doctorActiveTab === 'clinical' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D3765F]"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setDoctorActiveTab('ai')}
                        className={`pb-2 text-xs font-extrabold transition-all px-4 relative ${
                          doctorActiveTab === 'ai' ? 'text-[#843F2E]' : 'text-[#A8968F] hover:text-[#6B5E59]'
                        }`}
                      >
                        Lịch sử chẩn đoán AI
                        {doctorActiveTab === 'ai' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D3765F]"></div>
                        )}
                      </button>
                    </div>

                    <div className="space-y-6 pt-2">
                      {doctorActiveTab === 'clinical' ? (
                        activePatient.history && activePatient.history.length > 0 ? (
                          activePatient.history.map((record, index) => (
                            <div key={record.id || index} className="relative pl-6 border-l-2 border-[#EFE5E0] last:border-0 pb-1">

                              <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#D3765F] border border-white"></div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-extrabold text-[#843F2E]">{record.date}</span>
                                  <span className="bg-[#FBEEE9] text-[#D3765F] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#F2DED7]">
                                    {record.type}
                                  </span>
                                </div>

                                {record.aiTriage && (
                                  <div className="bg-[#FCF9F7] rounded-xl p-3.5 border border-[#EFE5E0] space-y-1.5">
                                    <div className="flex items-center gap-2 text-[#D3765F] font-bold text-[10px] uppercase">
                                      <FlaskConical className="w-3.5 h-3.5" />
                                      <span>Thông tin phân tích từ AI (Sơ tuyển)</span>
                                    </div>
                                    <p className="text-xs font-medium text-[#80726B] leading-relaxed">
                                      {record.aiTriage}
                                    </p>
                                  </div>
                                )}

                                <div className="space-y-1">
                                  <span className="block text-[9px] font-bold text-[#A8968F] uppercase">Chẩn đoán của Bác sĩ</span>
                                  <p className="text-xs font-extrabold text-[#4A3E39]">
                                    {record.diagnosis}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <span className="block text-[9px] font-bold text-[#A8968F] uppercase">Ghi chú bệnh án lâm sàng</span>
                                  <p className="text-xs font-semibold text-[#80726B] leading-relaxed">
                                    {record.notes}
                                  </p>
                                </div>

                                {record.prescriptions && record.prescriptions.length > 0 && (
                                  <div className="space-y-2">
                                    <span className="block text-[9px] font-bold text-[#A8968F] uppercase">Thuốc được kê đơn</span>
                                    <div className="flex flex-wrap gap-2">
                                      {record.prescriptions.map((p, pIdx) => (
                                        <span key={pIdx} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                                          {p.name} - {p.dosage}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-4 pt-1 flex-wrap">
                                  <button
                                    onClick={() => showToast("Đang mở chi tiết bệnh án...")}
                                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#D3765F] hover:text-[#843F2E] hover:underline"
                                  >
                                    <span>Xem chi tiết bệnh án</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                  {record.labs && (
                                    <button
                                      onClick={() => showToast("Đang tải kết quả xét nghiệm...")}
                                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#D3765F] hover:text-[#843F2E] hover:underline"
                                    >
                                      <span>Xem kết quả xét nghiệm</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-[#FCF9F7] rounded-2xl border border-dashed border-[#D3765F]/40 p-5 space-y-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-[#D3765F] font-bold text-xs uppercase tracking-wider">
                                <FlaskConical className="w-4.5 h-4.5 animate-pulse" />
                                <span>Kết quả phân tích & dự đoán từ AI (Triage)</span>
                              </div>

                              <div className="py-2">
                                <span className="text-xs font-semibold text-[#80726B] block">Chẩn đoán dự kiến:</span>
                                <span className="text-lg font-extrabold text-[#843F2E] block mt-1">
                                  {activePatient.aiPrediction?.disease || "Chưa xác định"}
                                </span>
                                <span className="inline-block mt-2 bg-emerald-50 text-[#2A7E5C] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  Độ tin cậy: {activePatient.aiPrediction?.confidence || 80}%
                                </span>
                              </div>

                              {activePatient.symptoms && (
                                <div className="bg-white rounded-xl p-3.5 border border-[#EFE5E0] text-left">
                                  <span className="block text-[9px] font-bold text-[#A8968F] uppercase mb-1">Triệu chứng khai báo</span>
                                  <p className="text-xs font-semibold text-[#6B5E59] italic leading-relaxed">
                                    "{activePatient.symptoms}"
                                  </p>
                                </div>
                              )}

                              {activePatient.aiPrediction?.otherDiseases && activePatient.aiPrediction.otherDiseases.length > 0 && (
                                <div className="text-left space-y-2">
                                  <span className="block text-[9px] font-bold text-[#A8968F] uppercase">Các dự đoán phụ khác</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {activePatient.aiPrediction.otherDiseases.map((other, idx) => (
                                      <div key={idx} className="bg-white rounded-lg p-2 border border-[#EFE5E0] flex justify-between items-center text-xs">
                                        <span className="font-semibold text-[#6B5E59]">{other.name}</span>
                                        <span className="font-extrabold text-[#843F2E]">{other.confidence}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="pt-2 border-t border-[#EFE5E0]/60">
                                <p className="text-[11px] text-[#80726B] font-semibold">
                                  Bệnh nhân này chưa được khám lâm sàng. Vui lòng bấm nút <strong className="text-[#D3765F]">"+ Tạo lượt khám mới"</strong> ở phía trên để tiến hành chẩn đoán và kê đơn.
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        activePatient.aiHistory && activePatient.aiHistory.length > 0 ? (
                          activePatient.aiHistory.map((record, index) => (
                            <div key={record.prediction_id || index} className="relative pl-6 border-l-2 border-[#EFE5E0] last:border-0 pb-1">

                              <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#D3765F] border border-white"></div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-extrabold text-[#843F2E]">
                                    {new Date(record.created_at).toLocaleString('vi-VN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <span className="bg-[#FBEEE9] text-[#D3765F] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#F2DED7]">
                                    Chẩn đoán AI
                                  </span>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                    record.is_verified
                                      ? 'bg-[#E6F5EE] text-[#2A7E5C] border-[#C6ECD9]'
                                      : 'bg-[#FDF2E9] text-[#B45309] border-[#FBE5D6]'
                                  }`}>
                                    {record.is_verified ? 'Đã xác thực' : 'Chờ xác thực'}
                                  </span>
                                </div>

                                <div className="bg-[#FCF9F7] rounded-xl p-3.5 border border-[#EFE5E0] space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-extrabold text-[#4A3E39]">
                                      AI dự đoán: {record.ai_disease}
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                                      Độ tin cậy: {Math.round((record.ai_confidence || 0.8) * 100)}%
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="block text-[9px] font-bold text-[#A8968F] uppercase">Triệu chứng khai báo</span>
                                    <p className="text-xs font-semibold text-[#80726B] leading-relaxed italic">
                                      "{record.symptoms_text}"
                                    </p>
                                  </div>

                                  {record.doctor_corrected_disease && (
                                    <div className="space-y-1 border-t border-[#EFE5E0]/60 pt-2">
                                      <span className="block text-[9px] font-bold text-[#2A7E5C] uppercase">Kết luận cuối của bác sĩ</span>
                                      <p className="text-xs font-extrabold text-[#2A7E5C]">
                                        {record.doctor_corrected_disease}
                                      </p>
                                    </div>
                                  )}

                                  {record.chat_history && (() => {
                                    try {
                                      const chatArr = JSON.parse(record.chat_history);
                                      if (Array.isArray(chatArr) && chatArr.length > 0) {
                                        return (
                                          <div className="space-y-1 border-t border-[#EFE5E0]/60 pt-2">
                                            <span className="block text-[9px] font-bold text-[#A8968F] uppercase mb-1.5">Hội thoại AI</span>
                                            <div className="bg-white p-2.5 rounded-xl border border-[#EFE5E0] max-h-36 overflow-y-auto space-y-2">
                                              {chatArr.map((msg, msgIdx) => {
                                                const isAi = msg.role === 'ai' || msg.sender === 'ai';
                                                return (
                                                  <div key={msgIdx} className="text-[11px] leading-snug">
                                                    <strong className={isAi ? 'text-[#D3765F]' : 'text-[#843F2E]'}>
                                                      {isAi ? 'AI: ' : 'Bệnh nhân: '}
                                                    </strong>
                                                    <span className="text-[#6B5E59] font-medium">{msg.text}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      }
                                    } catch (e) {
                                      console.error("Lỗi parse chat history:", e);
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs font-semibold text-[#A8968F] italic text-center py-4">
                            Bệnh nhân chưa có lịch sử chẩn đoán AI nào.
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'patient_list' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-xl font-extrabold text-[#4A3E39] tracking-tight">Hồ sơ bệnh nhân</h1>
                <p className="text-xs text-[#80726B] mt-1">Danh sách bệnh nhân quản lý trong hệ thống và tình trạng bệnh lý.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => {
                    const hasHistory = p.history && p.history.length > 0;
                    const latestDiagnosis = hasHistory ? p.history[0].diagnosis : null;
                    const aiPrediction = p.aiPrediction?.disease;
                    const confidence = p.aiPrediction?.confidence;

                    return (
                      <div key={p.id} className="bg-white rounded-3xl border border-[#EFE5E0] p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-[#EFE5E0]"
                          />
                          <div>
                            <h3 className="text-sm font-extrabold text-[#4A3E39] hover:text-[#D3765F] transition-colors cursor-pointer" onClick={() => viewPatientChart(p.id)}>
                              {p.name}
                            </h3>
                            <p className="text-[11px] font-semibold text-[#80726B] mt-0.5">
                              {p.age} tuổi • {p.gender} • Nhóm máu: {p.bloodType || 'Chưa rõ'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#FCF9F7] rounded-xl p-3 border border-[#EFE5E0]/60 space-y-1">
                          <span className="block text-[9px] font-bold text-[#A8968F] uppercase">Tình trạng bệnh hiện tại</span>
                          {hasHistory ? (
                            <div>
                              <span className="text-xs font-extrabold text-[#4A3E39] block leading-snug">
                                {latestDiagnosis}
                              </span>
                              <span className="inline-block mt-1 bg-[#E6F5EE] text-[#2A7E5C] text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-[#C6ECD9] uppercase tracking-wider">
                                Đã xác thực lâm sàng
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs font-extrabold text-[#843F2E] block leading-snug">
                                {aiPrediction || "Chưa xác định"}
                              </span>
                              <span className="inline-block mt-1 bg-[#FBEEE9] text-[#D3765F] text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-[#F2DED7] uppercase tracking-wider">
                                AI dự đoán ({confidence || 80}%)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            onClick={() => viewPatientChart(p.id)}
                            className="flex-1 text-center py-2 bg-white text-[#6B5E59] hover:bg-[#FAF6F3] hover:text-[#843F2E] text-xs font-bold rounded-xl border border-[#EFE5E0] transition-all"
                          >
                            Xem hồ sơ
                          </button>
                          <button
                            onClick={() => startConsultation(p.id)}
                            className="flex-1 text-center py-2 bg-[#D3765F] hover:bg-[#843F2E] text-white text-xs font-bold rounded-xl transition-all"
                          >
                            Khám bệnh
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-10 text-xs font-semibold text-[#A8968F] italic">
                    Không tìm thấy bệnh nhân nào khớp với từ khóa tìm kiếm.
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'diagnosis' && (
            <div className="space-y-6 animate-fadeIn">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE5E0] pb-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (activeSidebarTab === 'records') {
                        setCurrentView('patient_list');
                      } else {
                        setCurrentView('dashboard');
                        setActiveSidebarTab('schedules');
                      }
                    }}
                    className="p-2 bg-white text-[#D3765F] hover:text-white hover:bg-[#D3765F] rounded-xl border border-[#EFE5E0] shadow-xs transition-all active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#4A3E39] leading-tight">Khám bệnh & Chẩn đoán lâm sàng</h2>
                    <p className="text-xs font-semibold text-[#80726B] mt-0.5">
                      Bệnh nhân: <strong className="text-[#4A3E39]">{activePatient.name}</strong> • NS: {activePatient.dob} • Mã BN: {activePatient.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-[#E6F5EE] text-[#2A7E5C] border border-[#C6ECD9] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Sinh hiệu ổn định</span>
                  </span>

                  {activePatient.allergies && activePatient.allergies.length > 0 && (
                    <span className="bg-[#FCECE8] text-[#843F2E] border border-[#F5DDD7] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Dị ứng {activePatient.allergies[0].name}</span>
                    </span>
                  )}
                </div>
              </div>

              <AISummaryCard
                appointmentId={activePatient?.rawAppointmentId}
                patient={activePatient}
                onInsertToNotes={(summaryText) => {
                  setFormNotes(prev => prev ? `${prev}\n\n[Tiền sử bệnh lý AI tóm tắt]:\n${summaryText}` : `[Tiền sử bệnh lý AI tóm tắt]:\n${summaryText}`);
                  showToast("Đã chèn tóm tắt bệnh sử vào ô ghi chú lâm sàng!");
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-5 space-y-6">

                  <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-[#FAF6F3] pb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FBEEE9] text-[#D3765F] flex items-center justify-center">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#4A3E39] uppercase tracking-wider">Mô tả triệu chứng bệnh nhân</h4>
                        <span className="text-[10px] font-semibold text-[#A8968F]">Bệnh nhân tự khai báo / điều dưỡng ghi nhận</span>
                      </div>
                    </div>

                    <div className="bg-[#FCF9F7] rounded-xl p-4 border border-[#EFE5E0]/60">
                      <p className="text-xs font-semibold text-[#6B5E59] leading-relaxed italic">
                        "{activePatient.symptoms || 'Bệnh nhân khám sức khỏe định kỳ và kiểm tra tổng quát.'}"
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 space-y-5">
                    <div className="flex justify-between items-center border-b border-[#FAF6F3] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E6F5EE] text-[#2A7E5C] flex items-center justify-center">
                          <Activity className="w-4.5 h-4.5" />
                        </div>
                        <h4 className="text-xs font-extrabold text-[#4A3E39] uppercase tracking-wider">AI chẩn đoán & dự đoán</h4>
                      </div>
                      <span className="bg-[#F0FDF4] text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-emerald-200">
                        Bản Beta v1.2
                      </span>
                    </div>

                    <div className="space-y-4">

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-extrabold">
                          <span className="text-[#4A3E39]">{activePatient.aiPrediction?.disease || "Bệnh hô hấp nhẹ"}</span>
                          <span className="text-[#2A7E5C]">Độ tin cậy {activePatient.aiPrediction?.confidence || 88}%</span>
                        </div>
                        <div className="w-full bg-[#FAF6F3] rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${activePatient.aiPrediction?.confidence || 88}%` }}
                          />
                        </div>
                      </div>

                      {activePatient.aiPrediction?.otherDiseases && activePatient.aiPrediction.otherDiseases.map((other, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-extrabold">
                            <span className="text-[#80726B]">{other.name}</span>
                            <span className="text-[#6B5E59]">Độ tin cậy {other.confidence}%</span>
                          </div>
                          <div className="w-full bg-[#FAF6F3] rounded-full h-2">
                            <div
                              className="bg-[#A8968F] h-2 rounded-full transition-all duration-500"
                              style={{ width: `${other.confidence}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-[#A8968F] italic font-semibold border-t border-[#FAF6F3] pt-3">
                      * Phân tích từ AI mang tính chất tham khảo trợ giúp quyết định lâm sàng.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 space-y-6">

                    <div className="flex items-center gap-2.5 border-b border-[#FAF6F3] pb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FCF6F3] text-[#D3765F] flex items-center justify-center">
                        <Heart className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-sm font-extrabold text-[#4A3E39] uppercase tracking-wide">Đánh giá bệnh lý & Phác đồ điều trị</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-[#4A3E39] uppercase tracking-wider">
                        Chẩn đoán cuối cùng của Bác sĩ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formDiagnosis}
                          onChange={(e) => setFormDiagnosis(e.target.value)}
                          placeholder="Nhập chẩn đoán xác định (ví dụ: Viêm phế quản cấp tính, E11.9)"
                          className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-bold text-[#4A3E39] placeholder:text-[#A8968F] py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all shadow-xs"
                          required
                        />
                        <Search className="w-4.5 h-4.5 text-[#A8968F] absolute right-3 top-3.5" />
                      </div>
                      <span className="block text-[10px] text-[#A8968F] font-semibold italic">
                        Đã kích hoạt hỗ trợ tìm kiếm danh mục ICD-10 tự động.
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold text-[#4A3E39] uppercase tracking-wider">
                          Trình kê đơn thuốc chi tiết
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewMedName("Amoxicillin 500mg");
                            setNewMedDosage("500 mg");
                            setNewMedInstructions("Uống 1 viên mỗi lần, ngày 3 lần sau ăn, liên tục trong 10 ngày.");
                          }}
                          className="text-[11px] font-extrabold text-[#D3765F] hover:text-[#843F2E] flex items-center gap-1 hover:underline"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Thêm thuốc nhanh theo mẫu</span>
                        </button>
                      </div>

                      <div className="border border-[#EFE5E0] rounded-xl overflow-x-auto shadow-xs">
                        <table className="w-full min-w-[500px] text-left border-collapse">
                          <thead>
                            <tr className="bg-[#FAF6F3] border-b border-[#EFE5E0] text-[9px] font-extrabold text-[#A8968F] uppercase tracking-wider">
                              <th className="px-4 py-3">Tên thuốc biệt dược</th>
                              <th className="px-4 py-3">Liều lượng</th>
                              <th className="px-4 py-3">Hướng dẫn sử dụng</th>
                              <th className="px-4 py-3 text-right">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EFE5E0] text-xs font-semibold text-[#4A3E39]">
                            {prescriptions.map((med) => (
                              <tr key={med.id} className="hover:bg-[#FCF9F7]/60 transition-colors">
                                <td className="px-4 py-3 font-bold text-[#843F2E]">{med.name}</td>
                                <td className="px-4 py-3 text-[#6B5E59]">{med.dosage}</td>
                                <td className="px-4 py-3 text-[#80726B] max-w-xs truncate" title={med.instructions}>
                                  {med.instructions}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMedication(med.id)}
                                    className="p-1.5 bg-red-50 text-[#843F2E] hover:text-white hover:bg-[#843F2E] border border-red-150 rounded-lg transition-colors active:scale-95"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}

                            <tr className="bg-[#FCF9F7]/40 border-t-2 border-dashed border-[#EFE5E0]">
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  placeholder="Nhập tên thuốc..."
                                  value={newMedName}
                                  onChange={(e) => setNewMedName(e.target.value)}
                                  className="w-full bg-white border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D3765F]"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  placeholder="Ví dụ: 500 mg..."
                                  value={newMedDosage}
                                  onChange={(e) => setNewMedDosage(e.target.value)}
                                  className="w-full bg-white border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D3765F]"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  placeholder="Uống ngày 2 lần..."
                                  value={newMedInstructions}
                                  onChange={(e) => setNewMedInstructions(e.target.value)}
                                  className="w-full bg-white border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#D3765F]"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={handleAddMedication}
                                  className="p-2 bg-[#D3765F] hover:bg-[#843F2E] text-white rounded-lg transition-colors inline-flex items-center justify-center shadow-xs active:scale-95"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-extrabold text-[#4A3E39] uppercase tracking-wider">
                        Ghi chú lâm sàng & Dặn dò bác sĩ
                      </label>
                      <textarea
                        rows="4"
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Nhập ghi nhận lâm sàng chi tiết, chỉ định tái khám, chế độ ăn uống khuyên dùng cho bệnh nhân..."
                        className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] placeholder:text-[#A8968F] py-3 px-4 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all resize-none shadow-xs"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-4 border-t border-[#FAF6F3]">
                      <button
                        type="button"
                        onClick={() => handleSaveConsultation(true)}
                        className="w-full sm:w-auto bg-white text-[#6B5E59] hover:bg-[#FAF6F3] hover:text-[#843F2E] text-xs font-extrabold px-5 py-3 rounded-xl border border-[#EFE5E0] transition-all shadow-2xs active:scale-95"
                      >
                        Lưu bản nháp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveConsultation(false)}
                        className="w-full sm:w-auto bg-[#D3765F] hover:bg-[#843F2E] text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-md shadow-[#D3765F]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>Hoàn thành & Lưu hồ sơ y khoa</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {currentView === 'print_prescription' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-[#EFE5E0] pb-5">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setActiveSidebarTab('schedules');
                  }}
                  className="p-2 bg-white text-[#D3765F] hover:text-white hover:bg-[#D3765F] rounded-xl border border-[#EFE5E0] shadow-xs transition-all active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-[#4A3E39] leading-tight">Kết quả Khám bệnh & Đơn thuốc</h2>
                  <p className="text-xs font-semibold text-[#80726B] mt-0.5">Hoàn thành hồ sơ y khoa thành công. In hoặc lưu trữ toa thuốc điện tử kèm mã QR.</p>
                </div>
              </div>

              <div className="flex justify-center items-center py-6">
                <PrescriptionExport
                  prescriptionData={{
                    patientName: activePatient?.name || 'Bệnh nhân',
                    diagnosis: formDiagnosis || 'Tăng huyết áp vô căn',
                    medicines: prescriptions,
                    doctorSignature: user?.full_name || 'Bác sĩ điều trị'
                  }}
                  appointment_id={activePatient?.rawAppointmentId || activePatient?.id || 'demo'}
                />
              </div>
            </div>
          )}

          {currentView === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-[#EFE5E0] pb-5">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setActiveSidebarTab('schedules');
                  }}
                  className="p-2 bg-white text-[#D3765F] hover:text-white hover:bg-[#D3765F] rounded-xl border border-[#EFE5E0] shadow-xs transition-all active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-[#4A3E39] leading-tight">Cài đặt Hồ sơ Bác sĩ</h2>
                  <p className="text-xs font-semibold text-[#80726B] mt-0.5">Chỉnh sửa thông tin hành nghề của bác sĩ hiển thị với bệnh nhân.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EFE5E0] shadow-xs p-6 max-w-3xl">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#4A3E39] uppercase tracking-wider">Họ và tên bác sĩ</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-bold text-[#4A3E39] py-3 px-4 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all shadow-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#4A3E39] uppercase tracking-wider">Chuyên khoa</label>
                      <select
                        value={profileSpecialty}
                        onChange={(e) => setProfileSpecialty(e.target.value)}
                        className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-bold text-[#4A3E39] py-3 px-3 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all shadow-xs text-slate-700"
                        required
                      >
                        <option value="Cardiology Specialist">Chuyên khoa Tim mạch (Cardiology Specialist)</option>
                        <option value="General Practice">Bác sĩ Đa khoa (General Practice)</option>
                        <option value="Neurology">Chuyên khoa Thần kinh (Neurology)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Địa chỉ Email (Không thể thay đổi)</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-400 py-3 px-4 rounded-xl cursor-not-allowed outline-none"
                        disabled
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#4A3E39] uppercase tracking-wider">Số điện thoại liên hệ</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-bold text-[#4A3E39] py-3 px-4 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all shadow-xs"
                        placeholder="Ví dụ: +1 (555) 987-6543"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#4A3E39] uppercase tracking-wider">Địa chỉ phòng khám thực tế</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-bold text-[#4A3E39] py-3 px-4 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all shadow-xs"
                      placeholder="Nhập địa chỉ làm việc..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#4A3E39] uppercase tracking-wider">Giới thiệu bản thân (Biography)</label>
                    <textarea
                      rows="4"
                      value={profileBiography}
                      onChange={(e) => setProfileBiography(e.target.value)}
                      placeholder="Mô tả tóm tắt kinh nghiệm làm việc, thế mạnh lâm sàng của bác sĩ..."
                      className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] py-3 px-4 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all resize-none shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#4A3E39] uppercase tracking-wider">Kinh nghiệm & Học vấn (Education)</label>
                    <textarea
                      rows="3"
                      value={profileEducation}
                      onChange={(e) => setProfileEducation(e.target.value)}
                      placeholder="Liệt kê bằng cấp chuyên ngành, trường đại học đã tốt nghiệp, các chứng chỉ đào tạo..."
                      className="w-full bg-[#FCF9F7] border border-[#EFE5E0] text-xs font-medium text-[#4A3E39] py-3 px-4 rounded-xl focus:outline-none focus:border-[#D3765F] focus:bg-white transition-all resize-none shadow-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-3.5 pt-4 border-t border-[#FAF6F3]">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('dashboard');
                        setActiveSidebarTab('dashboard');
                      }}
                      className="px-5 py-3 border border-[#EFE5E0] hover:bg-[#FAF6F3] text-xs font-extrabold rounded-xl transition-all shadow-2xs"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="bg-[#D3765F] hover:bg-[#843F2E] text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-md shadow-[#D3765F]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      <span>Lưu thông tin hồ sơ</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
