import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import apiClient from '@/api/common';
import { StudentSidebar } from '@/components/layouts/StudentSidebar';
import { StudentHeader } from '@/components/layouts/StudentHeader';
import { AIAssistantButton } from '@/components/chatbot/AIAssistantButton';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search,
  Eye,
  TrophyIcon as Trophy,
  Target,
  ListChecks,
  Flag
} from 'lucide-react';

interface User {
  username: string;
  name?: string;
  role: string;
}

interface QuizQuestion {
  id: string;
  content: string;
  loaiCauHoi?: boolean;
  diem?: number;
  answers: { id: string; content: string }[];
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: Date;
  status: 'pending' | 'completed';
  maxScore: number;
  duration: number;
  questions: QuizQuestion[];
  attemptId?: string;
  score?: number;
  quizResult?: { score: number; correct: number; total: number; completedAt: Date };
}

interface DangKyDTO { lopHocPhanId: string; maLopHocPhan: string }
interface QuizListDTO { id: string; tieuDe: string; thoiGianBatDau: string; thoiGianKetThuc: string; thoiGianLam: number; status: string; score?: number | null }
interface QuizDetailDTO { id: string; tieuDe: string; moTa: string; thoiGianKetThuc: string; thoiGianLam: number; remainingTime: number; questions: QuizQuestion[] }
interface QuizStartDTO {
  attemptId: string;
  quizId?: string;
  remainingTime: number;
  usedTime?: number;
  questions?: QuizQuestion[];
  selectedAnswers?: Record<string, string>;
  textAnswers?: Record<string, string>;
}
interface QuizResultDTO { score: number; correct: number; total: number }
interface PageDTO<T> { content: T[] }
interface QuizAutoSaveDTO {
  answers: { questionId: string; answerId?: string | null; textAnswer?: string | null; timeOnQuestion?: number }[];
  usedTime: number;
  eventData?: string;
}

type StatusFilter = 'all' | 'pending' | 'completed';

export default function QuizPage() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [questionId: string]: string }>({});
  const [quizTextAnswers, setQuizTextAnswers] = useState<{ [questionId: string]: string }>({});
  const [reviewMarks, setReviewMarks] = useState<{ [questionId: string]: boolean }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveInFlightRef = useRef(false);
  const lastTabSwitchLogRef = useRef(0);
  const questionFocusRef = useRef<Record<string, number>>({});
  const activeQuizRef = useRef<Quiz | null>(null);
  const quizAnswersRef = useRef<{ [questionId: string]: string }>({});
  const quizTextAnswersRef = useRef<{ [questionId: string]: string }>({});
  const timeRemainingRef = useRef(0);

  const _sampleQuizzes_unused: Quiz[] = [
    {
      id: 'q1',
      title: 'Quiz: React Hooks & State Management',
      subject: 'Lập trình Web',
      description: 'Kiểm tra kiến thức về React Hooks, useState, useEffect và quản lý state.',
      deadline: new Date(2026, 2, 27),
      status: 'pending',
      maxScore: 10,
      duration: 15,
      questions: [
        {
          id: 'q1_1',
          question: 'Hook nào được sử dụng để quản lý state trong functional component?',
          type: 'single',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correctAnswer: 0
        },
        {
          id: 'q1_2',
          question: 'useEffect chạy khi nào? (Chọn tất cả đáp án đúng)',
          type: 'multiple',
          options: [
            'Sau khi component render lần đầu',
            'Sau mỗi lần re-render',
            'Khi dependencies thay đổi',
            'Trước khi component unmount'
          ],
          correctAnswer: [0, 2, 3]
        },
        {
          id: 'q1_3',
          question: 'Cách nào đúng để update state dựa trên giá trị trước đó?',
          type: 'single',
          options: [
            'setState(state + 1)',
            'setState(prevState => prevState + 1)',
            'state = state + 1',
            'setState = state + 1'
          ],
          correctAnswer: 1
        },
        {
          id: 'q1_4',
          question: 'useContext được sử dụng để làm gì?',
          type: 'single',
          options: [
            'Tạo side effects',
            'Truy cập Context API',
            'Quản lý local state',
            'Gọi API'
          ],
          correctAnswer: 1
        },
        {
          id: 'q1_5',
          question: 'Các rules of hooks là gì? (Chọn tất cả đáp án đúng)',
          type: 'multiple',
          options: [
            'Chỉ gọi hooks ở top level',
            'Chỉ gọi hooks trong React functions',
            'Có thể gọi hooks trong loops',
            'Có thể gọi hooks trong conditions'
          ],
          correctAnswer: [0, 1]
        }
      ]
    },
    {
      id: 'q2',
      title: 'Quiz: SQL Cơ bản',
      subject: 'Cơ sở dữ liệu',
      description: 'Kiểm tra kiến thức về SQL queries, JOIN, và database design.',
      deadline: new Date(2026, 2, 29),
      status: 'completed',
      maxScore: 10,
      duration: 20,
      score: 8.5,
      quizResult: {
        answers: {},
        score: 8.5,
        completedAt: new Date(2026, 2, 26)
      },
      questions: [
        {
          id: 'q2_1',
          question: 'Câu lệnh SQL nào dùng để lấy dữ liệu?',
          type: 'single',
          options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
          correctAnswer: 0
        },
        {
          id: 'q2_2',
          question: 'JOIN nào trả về tất cả records từ cả 2 bảng?',
          type: 'single',
          options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
          correctAnswer: 3
        }
      ]
    },
    {
      id: 'q3',
      title: 'Quiz: Machine Learning Basics',
      subject: 'Trí tuệ nhân tạo',
      description: 'Kiểm tra kiến thức cơ bản về Machine Learning và AI.',
      deadline: new Date(2026, 3, 1),
      status: 'pending',
      maxScore: 10,
      duration: 30,
      questions: [
        {
          id: 'q3_1',
          question: 'Supervised Learning là gì?',
          type: 'single',
          options: [
            'Học có giám sát với labeled data',
            'Học không giám sát',
            'Học tăng cường',
            'Học sâu'
          ],
          correctAnswer: 0
        },
        {
          id: 'q3_2',
          question: 'Các thuật toán nào là Supervised Learning? (Chọn tất cả)',
          type: 'multiple',
          options: [
            'Linear Regression',
            'K-Means Clustering',
            'Decision Tree',
            'Neural Network'
          ],
          correctAnswer: [0, 2, 3]
        },
        {
          id: 'q3_3',
          question: 'Overfitting xảy ra khi nào?',
          type: 'single',
          options: [
            'Model quá đơn giản',
            'Model học quá tốt trên training data',
            'Data quá ít',
            'Learning rate quá cao'
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: 'q4',
      title: 'Quiz: Mạng máy tính - TCP/IP',
      subject: 'Mạng máy tính',
      description: 'Kiểm tra hiểu biết về giao thức TCP/IP, OSI model và networking.',
      deadline: new Date(2026, 3, 3),
      status: 'pending',
      maxScore: 10,
      duration: 25,
      questions: [
        {
          id: 'q4_1',
          question: 'OSI Model có bao nhiêu layers?',
          type: 'single',
          options: ['5', '6', '7', '8'],
          correctAnswer: 2
        },
        {
          id: 'q4_2',
          question: 'Các giao thức nào hoạt động ở Transport Layer? (Chọn tất cả)',
          type: 'multiple',
          options: ['TCP', 'UDP', 'HTTP', 'FTP'],
          correctAnswer: [0, 1]
        }
      ]
    },
    {
      id: 'q5',
      title: 'Quiz: Thuật toán sắp xếp',
      subject: 'Cấu trúc dữ liệu và giải thuật',
      description: 'Kiểm tra kiến thức về các thuật toán sắp xếp và độ phức tạp.',
      deadline: new Date(2026, 3, 5),
      status: 'completed',
      maxScore: 10,
      duration: 20,
      score: 9.0,
      quizResult: {
        answers: {},
        score: 9.0,
        completedAt: new Date(2026, 2, 28)
      },
      questions: [
        {
          id: 'q5_1',
          question: 'Độ phức tạp của Quick Sort trong trường hợp tốt nhất?',
          type: 'single',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          correctAnswer: 1
        }
      ]
    }
  ];

  useEffect(() => {
    if (!isAuthenticated || !authUser) { navigate('/'); return; }
    if (authUser.role !== 'student') { navigate('/'); return; }
    setUser({ username: authUser.username, name: authUser.fullName, role: authUser.role });

    const loadQuizzes = async () => {
      try {
        const regRes = await apiClient.get<DangKyDTO[]>('/student/dang-ky-tin-chi');
        const all: Quiz[] = [];
        await Promise.all(regRes.data.map(async (reg) => {
          const res = await apiClient.get<PageDTO<QuizListDTO>>(`/student/quiz?lopHocPhanId=${reg.lopHocPhanId}&page=0&size=100`);
          res.data.content.forEach(q => {
            const completed = q.status === 'DONE';
            all.push({
              id: q.id,
              title: q.tieuDe,
              subject: reg.maLopHocPhan,
              description: '',
              deadline: new Date(q.thoiGianKetThuc),
              status: completed ? 'completed' : 'pending',
              maxScore: 10,
              duration: q.thoiGianLam ?? 15,
              questions: [],
              score: q.score ?? undefined,
              quizResult: completed && q.score != null
                ? { score: q.score, correct: 0, total: 0, completedAt: new Date(q.thoiGianKetThuc) }
                : undefined,
            });
          });
        }));
        setQuizzes(all);
      } catch {
        setQuizzes([]);
      }
    };
    loadQuizzes();
  }, [isAuthenticated, authUser, navigate]);

  useEffect(() => {
    activeQuizRef.current = activeQuiz;
    quizAnswersRef.current = quizAnswers;
    quizTextAnswersRef.current = quizTextAnswers;
    timeRemainingRef.current = timeRemaining;
  }, [activeQuiz, quizAnswers, quizTextAnswers, timeRemaining]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Quiz timer
  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [quizStarted, timeRemaining]);

  useEffect(() => {
    if (!quizStarted || !activeQuiz?.attemptId) return;
    autoSaveRef.current = setInterval(() => {
      autoSaveAnswers('periodic');
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [quizStarted, activeQuiz?.attemptId]);

  useEffect(() => {
    if (!quizStarted || !activeQuiz?.attemptId) return;
    const handleVisibility = () => {
      if (document.hidden) {
        const now = Date.now();
        if (now - lastTabSwitchLogRef.current < 15000) {
          return;
        }
        lastTabSwitchLogRef.current = now;
        autoSaveAnswers('tab_switch', { force: true });
        apiClient.post(`/student/quiz/${activeQuiz.attemptId}/events`, {
          action: 'TAB_SWITCH',
          eventData: JSON.stringify({ hiddenAt: new Date().toISOString() }),
        }).catch(() => undefined);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [quizStarted, activeQuiz?.attemptId]);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Hoàn thành'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          icon: <Clock className="w-4 h-4" />,
          label: 'Chưa làm'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: null,
          label: 'Không xác định'
        };
    }
  };

  const getTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return 'Đã quá hạn';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
    if (hours > 0) return `Còn ${hours} giờ`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Còn ${minutes} phút`;
  };

  const isDeadlineNear = (deadline: Date): boolean => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);
    return hoursRemaining > 0 && hoursRemaining <= 48;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      const startRes = await apiClient.post<QuizStartDTO>(`/student/quiz/${quiz.id}/start`);
      const questions = startRes.data.questions || (await apiClient.get<QuizDetailDTO>(`/student/quiz/${quiz.id}`)).data.questions;
      setActiveQuiz({ ...quiz, questions, attemptId: startRes.data.attemptId });
      setCurrentQuestionIndex(0);
      setQuizAnswers(startRes.data.selectedAnswers || {});
      setQuizTextAnswers(startRes.data.textAnswers || {});
      setReviewMarks({});
      setTimeRemaining(startRes.data.remainingTime);
      setQuizStarted(true);
      questionFocusRef.current = {};
      questions.forEach(q => { questionFocusRef.current[q.id] = Date.now(); });
    } catch {
      showToast('Không thể bắt đầu bài kiểm tra. Vui lòng thử lại.', 'error');
    }
  };

  const handleQuizAnswer = (questionId: string, answerId: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerId }));
    scheduleAutoSave('answer_change');
  };

  const handleTextAnswer = (questionId: string, textAnswer: string) => {
    setQuizTextAnswers(prev => ({ ...prev, [questionId]: textAnswer }));
    scheduleAutoSave('essay_typing');
  };

  const isQuestionAnswered = (question: QuizQuestion) => {
    return Boolean(quizAnswers[question.id] || quizTextAnswers[question.id]?.trim());
  };

  const getAnsweredCount = (quiz: Quiz) => {
    return quiz.questions.filter(isQuestionAnswered).length;
  };

  const handleQuestionNavigation = (nextIndex: number) => {
    if (!activeQuiz) return;
    const boundedIndex = Math.max(0, Math.min(activeQuiz.questions.length - 1, nextIndex));
    const nextQuestion = activeQuiz.questions[boundedIndex];
    if (!nextQuestion) return;

    setCurrentQuestionIndex(boundedIndex);
    questionFocusRef.current[nextQuestion.id] = Date.now();

    if (activeQuiz.attemptId) {
      apiClient.post(`/student/quiz/${activeQuiz.attemptId}/events`, {
        action: 'NAVIGATE_TO',
        questionId: nextQuestion.id,
        eventData: JSON.stringify({ questionIndex: boundedIndex + 1 }),
      }).catch(() => undefined);
    }
  };

  const buildAutoSavePayload = (reason: string): QuizAutoSaveDTO => {
    const currentQuiz = activeQuizRef.current;
    const answers = currentQuiz?.questions.map(question => {
      const focusedAt = questionFocusRef.current[question.id] || Date.now();
      questionFocusRef.current[question.id] = Date.now();
      return {
        questionId: question.id,
        answerId: quizAnswersRef.current[question.id] || null,
        textAnswer: quizTextAnswersRef.current[question.id] || null,
        timeOnQuestion: Math.max(0, Math.round((Date.now() - focusedAt) / 1000)),
      };
    }) || [];
    const usedTime = Math.max(0, (currentQuiz?.duration || 0) * 60 - timeRemainingRef.current);
    return { answers, usedTime, eventData: JSON.stringify({ reason }) };
  };

  const scheduleAutoSave = (reason: string) => {
    if (autoSaveDebounceRef.current) clearTimeout(autoSaveDebounceRef.current);
    autoSaveDebounceRef.current = setTimeout(() => {
      autoSaveAnswers(reason);
    }, 1200);
  };

  const autoSaveAnswers = async (reason: string, options?: { force?: boolean }) => {
    const currentQuiz = activeQuizRef.current;
    if (!currentQuiz?.attemptId) return;
    if (autoSaveInFlightRef.current && !options?.force) return;
    autoSaveInFlightRef.current = true;
    try {
      const res = await apiClient.put<{ remainingTime?: number }>(
        `/student/quiz/${currentQuiz.attemptId}/answers`,
        buildAutoSavePayload(reason)
      );
      if (typeof res.data.remainingTime === 'number') {
        setTimeRemaining(res.data.remainingTime);
      }
    } catch {
      // Autosave is best-effort; explicit submit still reports errors.
    } finally {
      autoSaveInFlightRef.current = false;
    }
  };

  const handleQuizSubmit = async (autoSubmit = false) => {
    if (!activeQuiz?.attemptId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);

    try {
      await autoSaveAnswers(autoSubmit ? 'timeout_submit' : 'manual_submit', { force: true });
      const res = await apiClient.post<QuizResultDTO>(
        `/student/quiz/${activeQuiz.attemptId}/submit-detail`,
        buildAutoSavePayload(autoSubmit ? 'timeout_submit' : 'manual_submit').answers
      );
      const result = res.data;
      const score = result.score;
      setQuizzes(prev => prev.map(q =>
        q.id === activeQuiz.id
          ? { ...q, status: 'completed' as const, score, quizResult: { score, correct: result.correct, total: result.total, completedAt: new Date() } }
          : q
      ));
      showToast(autoSubmit
        ? 'Hết giờ. Hệ thống đã tự động nộp bài.'
        : `Nộp bài thành công. Điểm: ${score.toFixed(1)}/${activeQuiz.maxScore} (${result.correct}/${result.total} câu đúng)`,
        'success');
    } catch {
      showToast('Nộp bài thất bại, vui lòng thử lại.', 'error');
    }

    setActiveQuiz(null);
    setQuizStarted(false);
    setQuizAnswers({});
    setQuizTextAnswers({});
    setReviewMarks({});
  };

  if (!user) return null;

  const userName = user.name || user.username;

  const stats = {
    total: quizzes.length,
    completed: quizzes.filter(q => q.status === 'completed').length,
    pending: quizzes.filter(q => q.status === 'pending').length,
    avgScore: quizzes.filter(q => q.score !== undefined).length > 0
      ? quizzes.filter(q => q.score !== undefined).reduce((acc, q) => acc + (q.score || 0), 0) / quizzes.filter(q => q.score !== undefined).length
      : 0
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]">
      <StudentSidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <StudentHeader userName={userName} />
        {toast && (
          <div className={`fixed top-5 right-5 z-[70] flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0a2540]">Quiz Trắc nghiệm</h1>
            <p className="text-[#6a7282] mt-2">Làm bài quiz và kiểm tra kiến thức</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Tổng số</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Hoàn thành</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Chưa làm</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7282]">Điểm TB</p>
                  <p className="text-2xl font-bold text-[#0a2540]">{stats.avgScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm quiz..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors bg-white appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chưa làm</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6a7282]">
                Tìm thấy <span className="font-semibold text-[#0a2540]">{filteredQuizzes.length}</span> quiz
              </p>
            </div>
          </div>

          {/* Quizzes List */}
          <div className="space-y-4">
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz) => {
                const statusBadge = getStatusBadge(quiz.status);
                const timeRemaining = getTimeRemaining(quiz.deadline);
                const isNearDeadline = isDeadlineNear(quiz.deadline);

                return (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Award className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0a2540]">{quiz.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.icon}
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="text-sm text-[#6a7282] mb-2">{quiz.subject}</p>
                          <p className="text-[#6a7282]">{quiz.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#6a7282]" />
                          <span className="text-sm text-[#6a7282]">
                            Hạn: {quiz.deadline.toLocaleDateString('vi-VN')} {quiz.deadline.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isNearDeadline ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-[#6a7282]'}`}>
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-semibold">{timeRemaining}</span>
                        </div>

                        <div className="flex items-center gap-2 text-purple-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{quiz.duration} phút</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#6a7282]" />
                          <span className="text-sm text-[#6a7282]">
                            {quiz.questions.length} câu hỏi
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#6a7282]">
                            Điểm: <span className="font-semibold text-[#0a2540]">{quiz.maxScore}</span>
                          </span>
                        </div>
                      </div>

                      {/* Completed Info */}
                      {quiz.status === 'completed' && quiz.quizResult && (
                        <div className="bg-[#f9fafb] rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Award className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#0a2540]">Quiz đã hoàn thành</p>
                                <p className="text-xs text-[#6a7282]">
                                  Hoàn thành lúc: {quiz.quizResult.completedAt.toLocaleDateString('vi-VN')} {quiz.quizResult.completedAt.toLocaleTimeString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">{quiz.score?.toFixed(1)}</p>
                              <p className="text-xs text-[#6a7282]">/{quiz.maxScore} điểm</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        {quiz.status === 'pending' && (
                          <button
                            onClick={() => handleStartQuiz(quiz)}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Bắt đầu làm bài
                          </button>
                        )}

                        <button className="flex items-center gap-2 px-6 py-3 bg-[#f1f5f9] text-[#0a2540] rounded-lg hover:bg-[#e5e7eb] transition-colors font-medium">
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-sm p-12 text-center">
                <Award className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
                <p className="text-[#6a7282] mb-4">Không tìm thấy quiz nào</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-sm text-[#0a2540] hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <AIAssistantButton />

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[14px] shadow-xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            {/* Quiz Header */}
            <div className="p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{activeQuiz.title}</h2>
                  <p className="text-purple-100">{activeQuiz.subject}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
                    <div className="text-sm text-purple-100">Thời gian còn lại</div>
                    <div className="mt-1 text-xs text-purple-100">
                      Đã làm {getAnsweredCount(activeQuiz)}/{activeQuiz.questions.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {currentQuestionIndex + 1}/{activeQuiz.questions.length}
                </span>
              </div>
            </div>

            {/* Quiz Body */}
            <div className="flex-1 overflow-hidden bg-[#f8fafc] flex flex-col lg:flex-row">
              <aside className="lg:w-80 border-b lg:border-b-0 lg:border-r border-[#e5e7eb] bg-white p-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-[#0a2540]">Danh sách câu hỏi</h3>
                  </div>
                  <span className="text-sm font-semibold text-[#0a2540]">
                    {getAnsweredCount(activeQuiz)}/{activeQuiz.questions.length}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${activeQuiz.questions.length ? (getAnsweredCount(activeQuiz) / activeQuiz.questions.length) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6a7282]">
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Đã trả lời</span>
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Xem lại</span>
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />Chưa làm</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-1 gap-2 max-h-44 lg:max-h-[54vh] overflow-y-auto pr-1">
                  {activeQuiz.questions.map((question, index) => {
                    const answered = isQuestionAnswered(question);
                    const marked = reviewMarks[question.id];
                    const active = index === currentQuestionIndex;
                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => handleQuestionNavigation(index)}
                        className={`min-h-11 rounded-lg border px-3 py-2 text-left transition-colors ${
                          active
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : answered
                              ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-400'
                              : marked
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400'
                                : 'border-[#e5e7eb] bg-white text-[#475569] hover:border-purple-300'
                        }`}
                      >
                        <span className="flex items-center justify-center lg:justify-between gap-2">
                          <span className="font-semibold">Câu {index + 1}</span>
                          {marked ? (
                            <Flag className="w-4 h-4" />
                          ) : answered ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-current opacity-50" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="flex-1 overflow-y-auto p-5 lg:p-8">
              {activeQuiz.questions[currentQuestionIndex] && (
                <div className="max-w-3xl mx-auto bg-white border border-[#e5e7eb] rounded-[14px] p-6 shadow-sm">
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                        {currentQuestionIndex + 1}
                      </span>
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#475569]">
                            {activeQuiz.questions[currentQuestionIndex].loaiCauHoi === false ? 'Tự luận' : 'Trắc nghiệm'}
                          </span>
                          {reviewMarks[activeQuiz.questions[currentQuestionIndex].id] && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              <Flag className="w-3.5 h-3.5" />
                              Xem lại
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-[#0a2540]">
                          {activeQuiz.questions[currentQuestionIndex].content}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeQuiz.questions[currentQuestionIndex].loaiCauHoi === false ? (
                      <textarea
                        value={quizTextAnswers[activeQuiz.questions[currentQuestionIndex].id] || ''}
                        onChange={(e) => handleTextAnswer(activeQuiz.questions[currentQuestionIndex].id, e.target.value)}
                        onBlur={() => autoSaveAnswers('essay_blur', { force: true })}
                        rows={8}
                        placeholder="Nhập câu trả lời tự luận..."
                        className="w-full p-4 border-2 border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-[#0a2540]"
                      />
                    ) : activeQuiz.questions[currentQuestionIndex].answers.map((answer) => {
                      const currentQ = activeQuiz.questions[currentQuestionIndex];
                      const isSelected = quizAnswers[currentQ.id] === answer.id;

                      return (
                        <label
                          key={answer.id}
                          className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-[#e5e7eb] hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`question-${currentQ.id}`}
                              checked={isSelected}
                              onChange={() => handleQuizAnswer(currentQ.id, answer.id)}
                              className="w-5 h-5 text-purple-600"
                            />
                            <span className="text-[#0a2540] font-medium">{answer.content}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              </section>
            </div>

            {/* Quiz Footer */}
            <div className="p-6 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <button
                  onClick={() => handleQuestionNavigation(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentQuestionIndex === 0
                      ? 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                      : 'bg-white text-[#0a2540] hover:bg-[#f1f5f9] border border-[#e5e7eb]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Câu trước
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#6a7282]">
                  <button
                    type="button"
                    onClick={() => {
                      const q = activeQuiz.questions[currentQuestionIndex];
                      setReviewMarks(prev => ({ ...prev, [q.id]: !prev[q.id] }));
                    }}
                    className={`px-3 py-2 rounded-lg font-medium ${reviewMarks[activeQuiz.questions[currentQuestionIndex]?.id] ? 'bg-amber-100 text-amber-700' : 'bg-white border border-[#e5e7eb] text-[#0a2540]'}`}
                  >
                    Đánh dấu xem lại
                  </button>
                  <span>
                    Đã trả lời: <span className="font-semibold text-[#0a2540]">{
                      getAnsweredCount(activeQuiz)
                    }</span> / {activeQuiz.questions.length}
                  </span>
                </div>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => handleQuestionNavigation(currentQuestionIndex + 1)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Câu tiếp
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const unanswered = activeQuiz.questions.filter(q => !quizAnswers[q.id] && !quizTextAnswers[q.id]?.trim()).length;
                      if (confirm(`Bạn có chắc muốn nộp bài?${unanswered ? ` Còn ${unanswered} câu chưa trả lời.` : ''}`)) {
                        handleQuizSubmit();
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Nộp bài
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
