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
  Target
} from 'lucide-react';

interface User {
  username: string;
  name?: string;
  role: string;
}

interface QuizQuestion {
  id: string;
  content: string;
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
interface QuizStartDTO { attemptId: string; remainingTime: number }
interface QuizResultDTO { score: number; correct: number; total: number }
interface PageDTO<T> { content: T[] }

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
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      const [startRes, detailRes] = await Promise.all([
        apiClient.post<QuizStartDTO>(`/student/quiz/${quiz.id}/start`),
        apiClient.get<QuizDetailDTO>(`/student/quiz/${quiz.id}`),
      ]);
      setActiveQuiz({ ...quiz, questions: detailRes.data.questions, attemptId: startRes.data.attemptId });
      setCurrentQuestionIndex(0);
      setQuizAnswers({});
      setTimeRemaining(startRes.data.remainingTime);
      setQuizStarted(true);
    } catch {
      alert('Không thể bắt đầu quiz. Vui lòng thử lại!');
    }
  };

  const handleQuizAnswer = (questionId: string, answerId: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleQuizSubmit = async (autoSubmit = false) => {
    if (!activeQuiz?.attemptId) return;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await apiClient.post<QuizResultDTO>(
        `/student/quiz/${activeQuiz.attemptId}/submit`,
        quizAnswers
      );
      const result = res.data;
      const score = result.score;
      setQuizzes(prev => prev.map(q =>
        q.id === activeQuiz.id
          ? { ...q, status: 'completed' as const, score, quizResult: { score, correct: result.correct, total: result.total, completedAt: new Date() } }
          : q
      ));
      if (autoSubmit) {
        alert('Hết giờ! Quiz đã được tự động nộp.');
      } else {
        alert(`Nộp bài thành công! Điểm: ${score.toFixed(1)}/${activeQuiz.maxScore} (${result.correct}/${result.total} câu đúng)`);
      }
    } catch {
      alert('Nộp bài thất bại, vui lòng thử lại!');
    }

    setActiveQuiz(null);
    setQuizStarted(false);
    setQuizAnswers({});
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
          <div className="bg-white rounded-[14px] shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Quiz Header */}
            <div className="p-6 border-b border-[#e5e7eb] bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{activeQuiz.title}</h2>
                  <p className="text-purple-100">{activeQuiz.subject}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatTime(timeRemaining)}</div>
                    <div className="text-sm text-purple-100">Thời gian còn lại</div>
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
            <div className="flex-1 overflow-y-auto p-8">
              {activeQuiz.questions[currentQuestionIndex] && (
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                        {currentQuestionIndex + 1}
                      </span>
                      <h3 className="text-xl font-semibold text-[#0a2540]">
                        {activeQuiz.questions[currentQuestionIndex].content}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeQuiz.questions[currentQuestionIndex].answers.map((answer) => {
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
            </div>

            {/* Quiz Footer */}
            <div className="p-6 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
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

                <div className="text-sm text-[#6a7282]">
                  Đã trả lời: <span className="font-semibold text-[#0a2540]">{Object.keys(quizAnswers).length}</span> / {activeQuiz.questions.length}
                </div>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(activeQuiz.questions.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Câu tiếp
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn nộp bài?')) {
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
