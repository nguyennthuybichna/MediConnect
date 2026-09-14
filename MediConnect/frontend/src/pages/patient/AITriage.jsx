import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import {
  Search,
  Bell,
  Send,
  Paperclip,
  ShieldCheck,
  Lock,
  Activity,
  ChevronRight,
  RefreshCw,
  Menu
} from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const isMeaninglessText = (text) => {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 2) return true;

  if (/^[\d\W_]+$/u.test(trimmed)) return true;

  if (/^(.)\1{2,}$/i.test(trimmed)) return true;

  const hasVowels = /[aeiouyàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i.test(trimmed);
  if (!hasVowels && trimmed.length >= 3) return true;

  const gibberishPatterns = [
    /^[asdfghjkl]+$/i,
    /^[qwertyuiop]+$/i,
    /^[zxcvbnm]+$/i,
    /^(abc|xyz|test|alo|asdf|123|ha|hi|he|ho)$/i
  ];
  if (gibberishPatterns.some(pat => pat.test(trimmed))) return true;

  return false;
};

let chatHistoryCache = {
  userId: null,
  messages: null
};

const AITriage = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentUserId = user?.id || localStorage.getItem('user_id') || 1;

  const [messages, setMessages] = useState(() => {
    if (chatHistoryCache && chatHistoryCache.userId === currentUserId && chatHistoryCache.messages) {
      return chatHistoryCache.messages;
    }
    return [
      {
        id: 1,
        sender: 'ai',
        text: "Chào bạn, tôi là trợ lý y khoa MediConnect. Hãy mô tả chi tiết các triệu chứng bạn đang gặp phải nhé."
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatHistoryCache = {
      userId: currentUserId,
      messages: messages
    };
  }, [messages, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const renderMessageText = (text, sender) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={index}
            className={`font-extrabold ${sender === 'patient' ? 'text-white underline underline-offset-2' : 'text-brand-700'}`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend || !textToSend.trim() || isTyping) return;

    const trimmedInput = textToSend.trim();

    const userMsg = {
      id: Date.now(),
      sender: 'patient',
      text: trimmedInput
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    if (isMeaninglessText(trimmedInput)) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: 'Tôi chưa hiểu mô tả triệu chứng của bạn. Vui lòng nhập rõ các triệu chứng bạn đang gặp phải (ví dụ: sốt, ho khan, đau đầu, đau tức ngực, mệt mỏi...) để tôi có thể hỗ trợ chẩn đoán chính xác cho bạn nhé.'
          }
        ]);
        setIsTyping(false);
      }, 600);
      return;
    }

    try {

      const history = messages.map(msg => ({
        role: msg.sender,
        text: msg.text
      }));

      const res = await api.post('/diagnosis/chat', {
        message: trimmedInput,
        history: history
      });

      const reply = res.data.reply;

      const isResult = /dự đoán bệnh|độ tin cậy|kết quả phân tích sơ bộ|chẩn đoán sơ bộ/i.test(reply);

      let disease = '';
      const diseaseMatch =
        reply.match(/Dự đoán bệnh sơ bộ:\s*\*\*(.*?)\*\*/i) ||
        reply.match(/Dự đoán bệnh:\s*\*\*(.*?)\*\*/i) ||
        reply.match(/Dự đoán sơ bộ:\s*\*\*(.*?)\*\*/i) ||
        reply.match(/Dự đoán bệnh:\s*(.*?)(?:\n|$)/i);
      if (diseaseMatch) {
        disease = diseaseMatch[1].trim();
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: reply,
          isResult: isResult,
          disease: disease
        }
      ]);

      if (isResult) {
        try {
          const patientId = user?.id || localStorage.getItem('user_id') || 1;
          const allUserSymptoms = updatedMessages
            .filter(m => m.sender === 'patient')
            .map(m => m.text)
            .join('. ');

          const saveRes = await api.post('/diagnosis', {
            patient_id: Number(patientId),
            symptoms_text: allUserSymptoms,
            chat_history: [...updatedMessages, { sender: 'ai', text: reply }].map(msg => ({
              role: msg.sender,
              text: msg.text
            }))
          });

          const prediction = saveRes.data.data;
          if (prediction && prediction.prediction_id) {
            localStorage.setItem('latest_prediction_id', prediction.prediction_id);
          }
        } catch (saveErr) {
          console.error('Không thể lưu lịch sử chẩn đoán vào CSDL:', saveErr);
        }
      }

    } catch (err) {
      console.error('Lỗi chẩn đoán:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "Hiện tại dịch vụ chẩn đoán AI không khả dụng hoặc đang gặp sự cố kết nối. Tuy nhiên, bạn vẫn có thể tiến hành Đặt lịch khám trực tiếp với bác sĩ chuyên khoa của chúng tôi.",
          isResult: true
        }
      ]);
      showToast('Kết nối động cơ AI gặp lỗi. Sử dụng luồng dự phòng.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickInquiry = (inquiry) => {
    handleSendMessage(inquiry);
  };

  const resetChat = () => {
    const defaultMessages = [
      {
        id: 1,
        sender: 'ai',
        text: "Chào bạn, tôi là trợ lý y khoa MediConnect. Hãy mô tả chi tiết các triệu chứng bạn đang gặp phải nhé."
      }
    ];
    setMessages(defaultMessages);
    chatHistoryCache = {
      userId: currentUserId,
      messages: defaultMessages
    };
    localStorage.removeItem('latest_prediction_id');
    showToast('Đã làm mới cuộc hội thoại chẩn đoán AI.');
  };

  return (
    <div className="flex bg-[#fdfbfb] min-h-screen text-slate-700 font-sans">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <main className="flex-1 p-6 md:p-8 flex flex-col h-screen overflow-hidden max-w-7xl mx-auto space-y-6">

        <header className="flex justify-between items-center gap-4 border-b border-[#f5eae6] pb-4 shrink-0">
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
                placeholder="Tìm kiếm hồ sơ hoặc lịch sử..."
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

        <div className="flex-1 bg-white rounded-3xl border border-[#f5eae6] shadow-sm flex flex-col overflow-hidden relative">

          <div className="p-4 md:px-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  MediMind AI
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </h3>
                <p className="text-[10px] font-semibold text-emerald-600">Trợ lý AI đang trực tuyến</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-brand-200 hover:bg-brand-50 rounded-xl text-[11px] font-bold text-slate-500 hover:text-brand-600 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Làm mới
              </button>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
                Triage Protocol v2.5
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'patient' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >

                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs border ${
                  msg.sender === 'patient'
                    ? 'bg-brand-100 border-brand-200 text-brand-800'
                    : 'bg-brand-500 border-brand-600 text-white'
                }`}>
                  {msg.sender === 'patient' ? 'P' : 'AI'}
                </div>

                <div className="space-y-2 max-w-full">
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm break-words break-all whitespace-pre-wrap overflow-hidden ${
                    msg.sender === 'patient'
                      ? 'bg-brand-500 text-white rounded-tr-none'
                      : 'bg-gray-100 text-slate-800 rounded-tl-none'
                  }`}>
                    <p>{renderMessageText(msg.text, msg.sender)}</p>

                    {msg.isResult && (
                      <div className="mt-3.5 pt-2 border-t border-slate-200/50">
                        <button
                          onClick={() => navigate('/patient/appointments')}
                          className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:shadow-lg active:scale-[0.98]"
                        >
                          Đặt lịch khám ngay <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-end mr-auto">
                <div className="w-8 h-8 rounded-full bg-brand-500 border border-brand-600 text-white flex items-center justify-center text-xs font-bold">
                  AI
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 italic">AI đang phân tích...</span>
                  <div className="bg-gray-100 border border-slate-200/40 px-4 py-3 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-1 w-fit">
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2 bg-[#fcfaf9] border border-slate-200 rounded-2xl p-2"
            >
              <button
                type="button"
                onClick={() => showToast('📎 Tính năng gửi đính kèm kết quả xét nghiệm / hồ sơ ngoại tuyến.')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                placeholder={isTyping ? "AI đang phân tích triệu chứng..." : "Mô tả chi tiết triệu chứng của bạn..."}
                className="flex-1 bg-transparent text-sm focus:outline-none text-slate-700 py-2.5 px-2 placeholder:text-slate-400 disabled:text-slate-400"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 bg-brand-800 hover:bg-brand-900 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-center gap-6 mt-3 text-[10px] font-bold text-slate-400 tracking-wider">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Mã hóa bảo mật 256-bit</span>
              </div>
              <span>|</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Trò chuyện bảo mật y khoa (HIPAA)</span>
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0">
          <div className="md:col-span-8 space-y-2">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Câu hỏi thường gặp</span>
            <div className="flex flex-wrap gap-2">
              {[
                'Kiểm soát đau lưng mãn tính',
                'Giải thích kết quả xét nghiệm máu',
                'Tác dụng phụ của thuốc'
              ].map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickInquiry(tag)}
                  disabled={isTyping}
                  className="px-4 py-2 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 bg-white text-xs font-semibold rounded-xl transition-all text-slate-600 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 bg-emerald-50 text-emerald-800 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="block text-[9px] uppercase font-extrabold tracking-wider text-emerald-600">Thời gian chờ</span>
              <h4 className="text-xs font-bold">Phòng cấp cứu khu vực</h4>

              <div className="w-24 bg-emerald-200/50 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-[25%]"></div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold">~15 phút</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AITriage;
