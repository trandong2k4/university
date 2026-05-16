/**
 * Shared chatbot view component used by all role-specific ChatbotPage wrappers.
 * Handles all state, API calls, and rendering — callers only provide role config.
 */
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, History, Trash2 } from 'lucide-react';
import chatbotApi from '@/api/chatbot';
import type { ChatbotRole } from './AIAssistantButton';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface RoleViewConfig {
  role: ChatbotRole;
  title: string;
  subtitle: string;
  suggestions: string[];
  welcomeText: string;
}

export const CHATBOT_VIEW_CONFIGS: Record<ChatbotRole, RoleViewConfig> = {
  student: {
    role: 'student',
    title: 'Trợ lý học viên',
    subtitle: 'LearningHub AI Assistant',
    welcomeText:
      'Tôi là trợ lý AI dành cho học viên của LearningHub. Tôi có thể giúp bạn tra cứu lịch học, điểm số, học phí, đăng ký tín chỉ và nhiều hơn nữa.',
    suggestions: [
      'Lịch học của tôi tuần này?',
      'Học phí hiện tại là bao nhiêu?',
      'Cách đăng ký tín chỉ?',
      'Xem tiến độ học tập',
    ],
  },
  lecturer: {
    role: 'lecturer',
    title: 'Trợ lý giảng viên',
    subtitle: 'LearningHub AI Assistant',
    welcomeText:
      'Tôi là trợ lý AI dành cho giảng viên của LearningHub. Tôi có thể giúp bạn tra cứu lịch dạy, lớp học phần, bài tập cần chấm và thông báo.',
    suggestions: [
      'Lịch dạy của tôi tuần này?',
      'Những bài tập nào cần chấm?',
      'Danh sách lớp tôi phụ trách',
      'Thông báo mới nhất',
    ],
  },
  admin: {
    role: 'admin',
    title: 'Trợ lý quản trị',
    subtitle: 'LearningHub AI Assistant',
    welcomeText:
      'Tôi là trợ lý AI dành cho quản trị viên của LearningHub. Tôi có thể hỗ trợ tra cứu thống kê hệ thống, lớp học phần, học kỳ và tình hình tài chính tổng quan.',
    suggestions: [
      'Thống kê người dùng hệ thống',
      'Tổng số lớp học phần hiện tại',
      'Tình hình học phí tổng quan',
      'Thông báo hệ thống mới',
    ],
  },
  accountant: {
    role: 'accountant',
    title: 'Trợ lý kế toán',
    subtitle: 'LearningHub AI Assistant',
    welcomeText:
      'Tôi là trợ lý AI dành cho kế toán của LearningHub. Tôi có thể hỗ trợ tra cứu công nợ học phí, hóa đơn, thanh toán và báo cáo tài chính.',
    suggestions: [
      'Tổng quan công nợ học phí',
      'Danh sách sinh viên nợ nhiều nhất',
      'Thanh toán gần đây',
      'Báo cáo thu chi theo học kỳ',
    ],
  },
};

interface Props {
  config: RoleViewConfig;
}

export function ChatbotView({ config }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, isTyping]);
  useEffect(() => { loadHistory(); }, []);

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
      setError(null);
      const history = await chatbotApi.getHistory();
      setMessages(
        history.map((msg, index) => ({
          id: msg.id ? String(msg.id) : `history-${index}`,
          text: msg.role === 'bot' ? parseBotResponse(msg.content) : msg.content,
          sender: msg.role as 'user' | 'bot',
          timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        })),
      );
    } catch {
      setMessages([]);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const toSend = (text ?? inputText).trim();
    if (!toSend) return;
    if (!text) setInputText('');

    const userMsg: Message = {
      id: Date.now().toString(),
      text: toSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    try {
      const raw = await chatbotApi.sendMessage(toSend);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: parseBotResponse(raw),
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi gửi tin nhắn.';
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `Xin lỗi, tôi không thể phản hồi lúc này: ${msg}`,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    try {
      setIsClearingHistory(true);
      await chatbotApi.clearHistory();
      setMessages([]);
    } catch {
      setError('Không thể xóa lịch sử chat. Vui lòng thử lại.');
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto bg-white shadow-xl rounded-t-2xl mt-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-blue-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{config.title}</h2>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Đang hoạt động
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  disabled={isClearingHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white text-sm rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {isClearingHistory ? 'Đang xóa...' : 'Xóa chat'}
                </button>
              )}
              <button
                onClick={loadHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
              >
                <History className="w-4 h-4" />
                Lịch sử
              </button>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Chào bạn!</h3>
              <p className="text-gray-500 text-sm max-w-sm">{config.welcomeText}</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-lg">
                {config.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                    : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}
              >
                {message.sender === 'bot' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`flex flex-col ${
                  message.sender === 'user' ? 'items-end' : 'items-start'
                } max-w-2xl`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-1">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-200 shadow-sm">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn cho AI..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() && !isTyping
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <Send
                className={`w-5 h-5 ${inputText.trim() && !isTyping ? 'text-white' : 'text-gray-500'}`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Nhấn Enter để gửi &bull; Shift + Enter để xuống dòng
          </p>
        </div>
      </div>
    </div>
  );
}
