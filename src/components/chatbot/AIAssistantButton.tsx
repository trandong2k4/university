import { X, Send, Bot, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import chatbotApi from '@/api/chatbot';
import svgPaths from '@/imports/svg-0z84kior3o';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// ── Role configuration ────────────────────────────────────────────────────────

export type ChatbotRole = 'student' | 'lecturer' | 'admin' | 'accountant';

interface RoleConfig {
  title: string;
  userInitials: string;
  welcomeMessage: string;
  suggestions: string[];
}

const ROLE_CONFIGS: Record<ChatbotRole, RoleConfig> = {
  student: {
    title: 'Trợ lý học viên',
    userInitials: 'HV',
    welcomeMessage:
      'Xin chào! Tôi là trợ lý học viên của LearningHub. Tôi có thể giúp bạn tra cứu lịch học, tiến độ học tập, học phí và nhiều hơn nữa.',
    suggestions: [
      'Lịch học của tôi hôm nay?',
      'Tiến độ học tập hiện tại?',
      'Kiểm tra học phí',
      'Hướng dẫn đăng ký tín chỉ',
    ],
  },
  lecturer: {
    title: 'Trợ lý giảng viên',
    userInitials: 'GV',
    welcomeMessage:
      'Xin chào! Tôi là trợ lý giảng viên của LearningHub. Tôi có thể giúp bạn tra cứu lịch dạy, lớp phụ trách, bài cần chấm và thông báo.',
    suggestions: [
      'Lịch dạy của tôi tuần này?',
      'Bài tập nào cần chấm?',
      'Danh sách lớp phụ trách',
      'Thông báo mới nhất',
    ],
  },
  admin: {
    title: 'Trợ lý quản trị',
    userInitials: 'AD',
    welcomeMessage:
      'Xin chào! Tôi là trợ lý quản trị của LearningHub. Tôi có thể hỗ trợ tra cứu thống kê người dùng, lớp học phần, học kỳ và tình hình tài chính tổng quan.',
    suggestions: [
      'Thống kê người dùng hệ thống',
      'Tổng số lớp học phần',
      'Tình hình học phí tổng quan',
      'Thông báo hệ thống mới nhất',
    ],
  },
  accountant: {
    title: 'Trợ lý kế toán',
    userInitials: 'KT',
    welcomeMessage:
      'Xin chào! Tôi là trợ lý kế toán của LearningHub. Tôi có thể hỗ trợ tra cứu công nợ học phí, hóa đơn, thanh toán và báo cáo tài chính.',
    suggestions: [
      'Tổng quan công nợ học phí',
      'Sinh viên nợ nhiều nhất',
      'Thanh toán gần đây',
      'Báo cáo thu chi',
    ],
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  /** Determines title, suggestions, and welcome message. Defaults to 'student'. */
  role?: ChatbotRole;
}

function LearningSupportButton({ role = 'student' }: Props) {
  const config = ROLE_CONFIGS[role];

  const buildWelcome = (): Message => ({
    id: 'welcome',
    text: config.welcomeMessage,
    sender: 'bot',
    timestamp: new Date(),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([buildWelcome()]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseBotResponse = (raw: string): string => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.choices?.[0]?.message?.content) return parsed.choices[0].message.content.trim();
      if (parsed.content) return parsed.content;
      if (typeof parsed === 'string') return parsed;
    } catch {
      return raw.trim();
    }
    return raw;
  };

  const loadHistory = async () => {
    try {
      const history = await chatbotApi.getHistory();
      if (history.length === 0) {
        setMessages([buildWelcome()]);
      } else {
        setMessages(
          history.map((msg, index) => ({
            id: msg.id ? String(msg.id) : `history-${index}`,
            text: msg.role === 'bot' ? parseBotResponse(msg.content) : msg.content,
            sender: msg.role as 'user' | 'bot',
            timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          })),
        );
      }
    } catch {
      setMessages([buildWelcome()]);
    } finally {
      setHistoryLoaded(true);
    }
  };

  useEffect(() => {
    if (isOpen && !historyLoaded) loadHistory();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (text?: string) => {
    const textToSend = (text ?? inputText).trim();
    if (!textToSend) return;
    if (!text) setInputText('');

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const rawResponse = await chatbotApi.sendMessage(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: parseBotResponse(rawResponse),
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch {
      const errorMsg = 'Không thể kết nối. Vui lòng thử lại.';
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: errorMsg, sender: 'bot', timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] hover:scale-110 transition-all duration-300 border-2 border-white opacity-[0.83]"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgb(43, 127, 255) 0%, rgb(21, 93, 252) 50%, rgb(152, 16, 250) 100%)',
        }}
        aria-label={config.title}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
          {isOpen ? (
            <X className="w-7 h-7 text-white mx-auto" />
          ) : (
            <svg
              className="absolute block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 32 32"
            >
              <g>
                <path
                  d="M16 10.6667V5.33333H10.6667"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.66667"
                />
                <path
                  d={svgPaths.pbea9f00}
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.66667"
                />
                <path
                  d="M2.66667 18.6667H5.33333"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.66667"
                />
                <path
                  d="M26.6667 18.6667H29.3333"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.66667"
                />
                <path
                  d="M20 17.3333V20"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.66667"
                />
                <path
                  d="M12 17.3333V20"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.66667"
                />
              </g>
            </svg>
          )}
        </div>
        <div className="absolute -top-1 right-0 bg-[#00c950] border-2 border-white rounded-full w-4 h-4" />
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 z-50 w-[390px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-h-[580px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{config.title}</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Đang hoạt động
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50"
            style={{ maxHeight: 'calc(580px - 140px)' }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'bot'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                      : 'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-white text-[10px] font-bold">{config.userInitials}</span>
                  )}
                </div>
                <div
                  className={`flex flex-col ${
                    message.sender === 'user' ? 'items-end' : 'items-start'
                  } max-w-[80%]`}
                >
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm max-w-full break-words ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
                  {error}
                </div>
              </div>
            )}

            {/* Suggestions — shown only when conversation is empty */}
            {messages.length <= 1 && !isTyping && (
              <div className="space-y-2 mt-2">
                <p className="text-[11px] font-semibold text-gray-400 px-1">Câu hỏi gợi ý:</p>
                <div className="flex flex-col gap-1.5">
                  {config.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(s)}
                      className="text-left bg-white hover:bg-blue-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-3 py-2.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  inputText.trim() && !isTyping
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { LearningSupportButton };
export const AIAssistantButton = LearningSupportButton;
export const StudentAIAssistantButton = () => <LearningSupportButton role="student" />;
export const LecturerAIAssistantButton = () => <LearningSupportButton role="lecturer" />;
export const AdminAIAssistantButton = () => <LearningSupportButton role="admin" />;
export const AccountantAIAssistantButton = () => <LearningSupportButton role="accountant" />;
