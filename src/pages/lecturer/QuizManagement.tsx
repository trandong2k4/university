import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  Plus, ChevronDown, Trash2, AlertCircle, Search, Award,
  CheckCircle2, Edit2, Eye, Clock, BookOpen, Save,
  CheckCircle
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import lecturerApi, {
  LecturerClassSummaryResponseDTO,
  AssignmentResponseDTO,
  QuizResponseDTO,
  QuizQuestionDTO,
  QuizRequestDTO,
} from '@/api/lecturer/lecturer.api';

const ANSWER_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface QuestionForm {
  id: string;
  noiDung: string;
  loaiCauHoi: boolean;
  diem: number;
  answers: AnswerForm[];
}

interface AnswerForm {
  id: string;
  keyAnswers: string;
  conText: string;
  isCorrect: boolean;
}

function newQuestion(): QuestionForm {
  return {
    id: crypto.randomUUID(),
    noiDung: '',
    loaiCauHoi: true,
    diem: 1,
    answers: [
      { id: crypto.randomUUID(), keyAnswers: 'A', conText: '', isCorrect: true },
      { id: crypto.randomUUID(), keyAnswers: 'B', conText: '', isCorrect: false },
      { id: crypto.randomUUID(), keyAnswers: 'C', conText: '', isCorrect: false },
      { id: crypto.randomUUID(), keyAnswers: 'D', conText: '', isCorrect: false },
    ]
  };
}

function questionFromDTO(q: QuizQuestionDTO): QuestionForm {
  return {
    id: q.questionId,
    noiDung: q.noiDung,
    loaiCauHoi: q.loaiCauHoi,
    diem: q.diem,
    answers: q.answers.map(a => ({
      id: a.answerId,
      keyAnswers: a.keyAnswers,
      conText: a.conText,
      isCorrect: a.isCorrect,
    }))
  };
}

export default function QuizManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Classes
  const [classes, setClasses] = useState<LecturerClassSummaryResponseDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Quizzes
  const [quizzes, setQuizzes] = useState<QuizResponseDTO[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Tabs: 'list' | 'create' | 'edit'
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');

  // Editing quiz
  const [editingQuiz, setEditingQuiz] = useState<QuizResponseDTO | null>(null);

  // Form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [attempts, setAttempts] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [quizType, setQuizType] = useState<'exercise_based' | 'random_question' | 'manual_question'>('exercise_based');
  const [assignments, setAssignments] = useState<AssignmentResponseDTO[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [randomQuestionCount, setRandomQuestionCount] = useState(10);
  const [randomQuestionTypes, setRandomQuestionTypes] = useState('multiple_choice,essay');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [showResult, setShowResult] = useState<'immediately' | 'after_due' | 'never'>('immediately');
  const [passScore, setPassScore] = useState(50);
  const [questions, setQuestions] = useState<QuestionForm[]>([newQuestion()]);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const submitLockRef = useRef(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load classes
  useEffect(() => {
    if (!user?.id) return;
    const cached = localStorage.getItem(`lecturer_classes_${user.id}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setClasses(parsed);
        const cachedSelected = localStorage.getItem(`lecturer_selected_class_${user.id}`);
        if (cachedSelected && parsed.some((c: LecturerClassSummaryResponseDTO) => c.lopHocPhanId === cachedSelected)) {
          setSelectedClassId(cachedSelected);
          return;
        }
        if (parsed.length > 0) setSelectedClassId(parsed[0].lopHocPhanId);
      } catch { /* ignore */ }
    }
    lecturerApi.getClasses(user.id).then(data => {
      setClasses(data);
      localStorage.setItem(`lecturer_classes_${user.id}`, JSON.stringify(data));
      if (data.length > 0) {
        const firstClassId = data[0].lopHocPhanId;
        setSelectedClassId(firstClassId);
        localStorage.setItem(`lecturer_selected_class_${user.id}`, firstClassId);
      }
    }).catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    if (selectedClassId && user?.id) {
      localStorage.setItem(`lecturer_selected_class_${user.id}`, selectedClassId);
    }
  }, [selectedClassId, user?.id]);

  // Load quizzes
  useEffect(() => {
    if (!selectedClassId || !user?.id) return;
    setLoadingQuizzes(true);
    lecturerApi.getQuizzesByClass(selectedClassId, user.id)
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoadingQuizzes(false));
    lecturerApi.getAssignments(selectedClassId, user.id)
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, [selectedClassId, user?.id]);

  const filteredQuizzes = quizzes.filter(q =>
    q.tieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.moTa || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setQuizTitle('');
    setQuizDescription('');
    setStartTime('');
    setEndTime('');
    setDuration(30);
    setAttempts(1);
    setIsPublished(false);
    setQuizType('exercise_based');
    setSelectedExerciseIds([]);
    setRandomQuestionCount(10);
    setRandomQuestionTypes('multiple_choice,essay');
    setShuffleQuestions(true);
    setShuffleAnswers(true);
    setShowResult('immediately');
    setPassScore(50);
    setQuestions([newQuestion()]);
    setEditingQuiz(null);
    setActiveTab('list');
  };

  // Start editing
  const handleEdit = async (quiz: QuizResponseDTO) => {
    if (!user?.id) return;
    try {
      const full = await lecturerApi.getQuiz(quiz.quizId, user.id);
      setEditingQuiz(full);
      setQuizTitle(full.tieuDe);
      setQuizDescription(full.moTa || '');
      setStartTime(full.thoiGianBatDau ? full.thoiGianBatDau.slice(0, 16) : '');
      setEndTime(full.thoiGianKetThuc ? full.thoiGianKetThuc.slice(0, 16) : '');
      setDuration(full.thoiGianLam || 30);
      setAttempts(full.soLanLam || 1);
      setIsPublished(full.trinhTrang ?? false);
      setQuizType((full.quizType as any) || 'manual_question');
      setRandomQuestionCount(full.randomQuestionCount || 10);
      setRandomQuestionTypes(full.randomQuestionTypes || 'multiple_choice,essay');
      setShuffleQuestions(full.shuffleQuestions ?? true);
      setShuffleAnswers(full.shuffleAnswers ?? true);
      setShowResult((full.showResult as any) || 'immediately');
      setPassScore(full.passScore ?? 50);
      setQuestions(full.questions ? full.questions.map(questionFromDTO) : [newQuestion()]);
      setActiveTab('edit');
    } catch (err) {
      console.error(err);
      showToast('Không thể tải thông tin bài kiểm tra', 'error');
    }
  };

  // View results
  const handleViewResults = (quiz: QuizResponseDTO) => {
    navigate(`/lecturer/quiz/${quiz.quizId}/results?classId=${selectedClassId}`);
  };

  // Validate and save quiz
  const validateQuiz = () => {
    if (!quizTitle.trim()) { showToast('Tiêu đề bài kiểm tra không được để trống', 'error'); return false; }
    if (!startTime) { showToast('Thời gian bắt đầu không được để trống', 'error'); return false; }
    if (!endTime) { showToast('Thời gian kết thúc không được để trống', 'error'); return false; }
    if (new Date(endTime) <= new Date(startTime)) { showToast('Thời gian kết thúc phải sau thời gian bắt đầu', 'error'); return false; }
    if (duration < 1) { showToast('Thời gian làm bài phải lớn hơn 0 phút', 'error'); return false; }
    if (attempts < 1) { showToast('Số lần làm bài phải lớn hơn 0', 'error'); return false; }
    if (passScore < 0 || passScore > 100) { showToast('Điểm đạt phải nằm trong khoảng 0-100%', 'error'); return false; }

    if (quizType === 'exercise_based') {
      if (selectedExerciseIds.length === 0) { showToast('Vui lòng chọn ít nhất một bài tập', 'error'); return false; }
      return true;
    }
    if (quizType === 'random_question') {
      if (randomQuestionCount < 1) { showToast('Số câu random phải lớn hơn 0', 'error'); return false; }
      return true;
    }

    for (const q of questions) {
      if (!q.noiDung.trim()) { showToast('Vui lòng nhập nội dung cho tất cả câu hỏi', 'error'); return false; }
      if (q.loaiCauHoi) {
        const hasAnswer = q.answers.some(a => a.conText.trim());
        if (!hasAnswer) { showToast('Mỗi câu hỏi phải có ít nhất 1 đáp án', 'error'); return false; }
        const hasCorrect = q.answers.some(a => a.isCorrect && a.conText.trim());
        if (!hasCorrect) { showToast('Mỗi câu hỏi phải có ít nhất 1 đáp án đúng', 'error'); return false; }
      }
    }
    return true;
  };

  const buildPayload = (): QuizRequestDTO => ({
    lopHocPhanId: selectedClassId,
    tieuDe: quizTitle.trim(),
    moTa: quizDescription.trim() || undefined,
    thoiGianBatDau: startTime,
    thoiGianKetThuc: endTime,
    thoiGianLam: duration,
    soLanLam: attempts,
    trinhTrang: isPublished,
    quizType,
    exerciseIds: quizType === 'exercise_based' ? selectedExerciseIds : undefined,
    randomQuestionCount: quizType === 'random_question' ? randomQuestionCount : undefined,
    randomQuestionTypes: quizType === 'random_question' ? randomQuestionTypes : undefined,
    shuffleQuestions,
    shuffleAnswers,
    showResult,
    passScore,
    questions: quizType === 'manual_question' ? questions.map(q => ({
      noiDung: q.noiDung.trim(),
      loaiCauHoi: q.loaiCauHoi,
      diem: q.diem,
      answers: q.answers
        .filter(a => a.conText.trim())
        .map(a => ({
          keyAnswers: a.keyAnswers,
          conText: a.conText.trim(),
          isCorrect: a.isCorrect
        }))
    })) : undefined
  });

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || creatingQuiz) return;
    if (!user?.id || !validateQuiz()) return;
    submitLockRef.current = true;
    setCreatingQuiz(true);
    try {
      await lecturerApi.createQuiz(user.id, buildPayload());
      const updated = await lecturerApi.getQuizzesByClass(selectedClassId, user.id);
      setQuizzes(updated);
      resetForm();
      showToast('Tạo bài kiểm tra thành công', 'success');
    } catch (err) {
      console.error(err);
      showToast('Tạo bài kiểm tra thất bại', 'error');
    } finally {
      submitLockRef.current = false;
      setCreatingQuiz(false);
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || creatingQuiz) return;
    if (!user?.id || !editingQuiz || !validateQuiz()) return;
    submitLockRef.current = true;
    setCreatingQuiz(true);
    try {
      await lecturerApi.updateQuiz(editingQuiz.quizId, user.id, buildPayload());
      const updated = await lecturerApi.getQuizzesByClass(selectedClassId, user.id);
      setQuizzes(updated);
      resetForm();
      showToast('Cập nhật bài kiểm tra thành công', 'success');
    } catch (err) {
      console.error(err);
      showToast('Cập nhật thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'), 'error');
    } finally {
      submitLockRef.current = false;
      setCreatingQuiz(false);
    }
  };

  const confirmDeleteQuiz = async () => {
    if (!user?.id || !deleteId) return;
    setDeleting(true);
    try {
      await lecturerApi.deleteQuiz(deleteId, user.id);
      setQuizzes(prev => prev.filter(q => q.quizId !== deleteId));
      setDeleteId(null);
      showToast('Xóa bài kiểm tra thành công', 'success');
    } catch (err) {
      console.error(err);
      showToast('Xóa thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Question management
  const addQuestion = () => setQuestions(prev => [...prev, newQuestion()]);
  const removeQuestion = (id: string) => { if (questions.length > 1) setQuestions(prev => prev.filter(q => q.id !== id)); };
  const updateQuestion = (id: string, field: keyof QuestionForm, value: any) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  const updateAnswer = (questionId: string, answerId: string, field: keyof AnswerForm, value: any) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, answers: q.answers.map(a => a.id === answerId ? { ...a, [field]: value } : a) };
    }));
  const setCorrectAnswer = (questionId: string, answerId: string) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, answers: q.answers.map(a => ({ ...a, isCorrect: a.id === answerId })) };
    }));

  const formatDate = (s: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  const isQuizActive = (q: QuizResponseDTO) => {
    if (!q.trinhTrang) return 'hidden';
    const now = new Date();
    const start = q.thoiGianBatDau ? new Date(q.thoiGianBatDau) : null;
    const end = q.thoiGianKetThuc ? new Date(q.thoiGianKetThuc) : null;
    if (start && now < start) return 'upcoming';
    if (end && now > end) return 'ended';
    if (start && now >= start && (!end || now <= end)) return 'active';
    return 'draft';
  };

  const canModifyQuiz = (q: QuizResponseDTO) =>
    !q.thoiGianBatDau || new Date(q.thoiGianBatDau) > new Date();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50">
      <InstructorSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Quản lý Bài kiểm tra" />
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5">

            {/* Toast */}
            {toast && (
              <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border ${
                toast.type === 'success' ? 'bg-emerald-500/95 text-white border-emerald-400/30' : 'bg-red-500/95 text-white border-red-400/30'
              }`}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-semibold">{toast.msg}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Bài kiểm tra</h1>
                <p className="text-gray-500 mt-1">Tạo và theo dõi bài kiểm tra trắc nghiệm cho sinh viên</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span className="text-gray-600 text-sm">Tổng:</span>
                  <span className="font-bold text-gray-900">{quizzes.length}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span className="text-gray-600 text-sm">Đang hoạt động:</span>
                  <span className="font-bold text-emerald-600">{quizzes.filter(q => isQuizActive(q) === 'active').length}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200/60 flex gap-1">
              {[
                { key: 'list', label: 'Danh sách bài kiểm tra', Icon: Award },
                { key: 'create', label: 'Tạo bài kiểm tra', Icon: Plus },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => { if (key === 'list') resetForm(); else setActiveTab(key as 'list' | 'create'); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === key || activeTab === 'edit'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Quiz List */}
            {(activeTab === 'list') && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Chọn lớp học phần</label>
                      <div className="relative">
                        <select
                          value={selectedClassId}
                          onChange={e => setSelectedClassId(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 bg-white text-sm font-medium"
                        >
                          {classes.map(c => (
                            <option key={c.lopHocPhanId} value={c.lopHocPhanId}>
                              {c.maLopHocPhan} – {c.tenMonHoc}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tìm kiếm</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm theo tên bài kiểm tra..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['#', 'Tiêu đề', 'Câu hỏi', 'Thời gian làm', 'Lần làm', 'Công khai', 'Trạng thái', 'Thao tác'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {loadingQuizzes ? (
                          <tr><td colSpan={8} className="px-6 py-16 text-center">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-gray-500 font-medium">Đang tải...</p>
                          </td></tr>
                        ) : filteredQuizzes.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-16 text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-700 mb-1">Chưa có bài kiểm tra nào</h3>
                              <p className="text-gray-400 text-sm">Tạo bài kiểm tra mới để sinh viên có thể làm bài</p>
                            </td>
                          </tr>
                        ) : filteredQuizzes.map((q, idx) => {
                          const status = isQuizActive(q);
                          const canModify = canModifyQuiz(q);
                          const statusConfig = {
                            active: { label: 'Đang hoạt động', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                            ended: { label: 'Đã kết thúc', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
                            upcoming: { label: 'Sắp diễn ra', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                            draft: { label: 'Bản nháp', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                            hidden: { label: 'Đang ẩn', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
                          }[status];
                          return (
                            <tr key={q.quizId} className="hover:bg-gray-50/60 transition-colors group">
                              <td className="px-5 py-4 text-sm text-gray-400 font-medium">{idx + 1}</td>
                              <td className="px-5 py-4">
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 truncate max-w-[200px]">{q.tieuDe}</p>
                                  {q.moTa && <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{q.moTa}</p>}
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-400">{formatDate(q.thoiGianBatDau)} – {formatDate(q.thoiGianKetThuc)}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-700 font-medium">{q.questionCount} câu</td>
                              <td className="px-5 py-4 text-sm text-gray-700">{q.thoiGianLam} phút</td>
                              <td className="px-5 py-4 text-sm text-gray-700">{q.soLanLam ?? 1}x</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  q.trinhTrang
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}>
                                  {q.trinhTrang ? 'Công khai' : 'Ẩn'}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                  {status === 'active' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>}
                                  {statusConfig.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleViewResults(q)}
                                    className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors"
                                    title="Xem kết quả"
                                  >
                                    <Eye className="w-4 h-4 text-indigo-500" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(q)}
                                    disabled={!canModify}
                                    className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
                                    title={canModify ? 'Chỉnh sửa' : 'Không thể chỉnh sửa quiz đã bắt đầu'}
                                  >
                                    <Edit2 className="w-4 h-4 text-orange-500" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteId(q.quizId)}
                                    disabled={!canModify}
                                    className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
                                    title={canModify ? 'Xóa' : 'Không thể xóa quiz đã bắt đầu'}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Create/Edit Quiz Form */}
            {(activeTab === 'create' || activeTab === 'edit') && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${
                    activeTab === 'edit' ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-indigo-50 to-violet-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeTab === 'edit' ? 'bg-amber-100' : 'bg-indigo-100'
                    }`}>
                      <Award className={`w-5 h-5 ${activeTab === 'edit' ? 'text-amber-600' : 'text-indigo-600'}`} />
                    </div>
                    <h3 className="font-bold text-gray-900">
                      {activeTab === 'edit' ? `Chỉnh sửa bài kiểm tra: ${editingQuiz?.tieuDe || ''}` : 'Tạo bài kiểm tra mới'}
                    </h3>
                  </div>

                  <form onSubmit={activeTab === 'edit' ? handleUpdateQuiz : handleCreateQuiz} className="p-6 space-y-5">
                    {/* Class & Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Lớp học phần <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedClassId}
                            onChange={e => setSelectedClassId(e.target.value)}
                            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm font-medium"
                            required
                          >
                            {classes.map(c => (
                              <option key={c.lopHocPhanId} value={c.lopHocPhanId}>
                                {c.maLopHocPhan} – {c.tenMonHoc}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Tiêu đề bài kiểm tra <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={quizTitle}
                          onChange={e => setQuizTitle(e.target.value)}
                          placeholder="VD: Kiểm tra giữa kỳ chương 1-3"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mô tả</label>
                      <textarea
                        value={quizDescription}
                        onChange={e => setQuizDescription(e.target.value)}
                        placeholder="Nhập mô tả chi tiết về bài kiểm tra..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium resize-none"
                      />
                    </div>

                    {/* Time settings */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Thời gian bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Thời gian kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Thời gian làm bài (phút) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={duration}
                          onChange={e => setDuration(parseInt(e.target.value) || 30)}
                          min={5} max={180}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          Số lần làm bài
                        </label>
                        <input
                          type="number"
                          value={attempts}
                          onChange={e => setAttempts(parseInt(e.target.value) || 1)}
                          min={1} max={10}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Loại bài kiểm tra</label>
                        <select
                          value={quizType}
                          onChange={e => setQuizType(e.target.value as any)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm font-medium"
                        >
                          <option value="exercise_based">Theo bài tập</option>
                          <option value="random_question">Random từ ngân hàng câu hỏi</option>
                          <option value="manual_question">Tạo câu hỏi thủ công</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Điểm đạt (%)</label>
                        <input
                          type="number"
                          value={passScore}
                          onChange={e => setPassScore(parseFloat(e.target.value) || 0)}
                          min={0}
                          max={100}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hiển thị kết quả</label>
                        <select
                          value={showResult}
                          onChange={e => setShowResult(e.target.value as any)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm font-medium"
                        >
                          <option value="immediately">Ngay sau khi nộp</option>
                          <option value="after_due">Sau hạn đóng đề</option>
                          <option value="never">Không hiển thị</option>
                        </select>
                      </div>
                    </div>

                    {quizType === 'exercise_based' && (
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-gray-900">Chọn bài tập thuộc lớp học phần</h3>
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">{selectedExerciseIds.length} đã chọn</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {assignments.map(exercise => (
                            <label key={exercise.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300">
                              <input
                                type="checkbox"
                                checked={selectedExerciseIds.includes(exercise.id)}
                                onChange={e => {
                                  setSelectedExerciseIds(prev => e.target.checked
                                    ? [...prev, exercise.id]
                                    : prev.filter(id => id !== exercise.id));
                                }}
                                className="mt-1"
                              />
                              <span>
                                <span className="block text-sm font-semibold text-gray-800">{exercise.tieuDe}</span>
                                <span className="block text-xs text-gray-500">{exercise.questionCount || 0} câu hỏi</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {quizType === 'random_question' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Số câu random</label>
                          <input
                            type="number"
                            value={randomQuestionCount}
                            onChange={e => setRandomQuestionCount(parseInt(e.target.value) || 1)}
                            min={1}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Loại câu hỏi</label>
                          <select
                            value={randomQuestionTypes}
                            onChange={e => setRandomQuestionTypes(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm font-medium"
                          >
                            <option value="multiple_choice,essay">Trắc nghiệm và tự luận</option>
                            <option value="multiple_choice">Chỉ trắc nghiệm</option>
                            <option value="essay">Chỉ tự luận</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white cursor-pointer">
                        <input type="checkbox" checked={shuffleQuestions} onChange={e => setShuffleQuestions(e.target.checked)} />
                        <span className="text-sm font-semibold text-gray-700">Trộn thứ tự câu hỏi</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white cursor-pointer">
                        <input type="checkbox" checked={shuffleAnswers} onChange={e => setShuffleAnswers(e.target.checked)} />
                        <span className="text-sm font-semibold text-gray-700">Trộn thứ tự đáp án</span>
                      </label>
                    </div>

                    {/* Publish toggle */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                      <label className="flex items-center gap-3 cursor-pointer select-none group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={e => setIsPublished(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-6 transition-all"></div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Công khai bài kiểm tra</p>
                          <p className="text-xs text-gray-500">Sinh viên có thể làm bài khi bài kiểm tra được công khai</p>
                        </div>
                      </label>
                      <div className="ml-auto flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isPublished ? 'Đã công khai' : 'Đang ẩn'}
                        </span>
                      </div>
                    </div>

                    {/* MCQ info banner */}
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-800">Tự động chấm điểm trắc nghiệm</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Hệ thống sẽ tự động chấm điểm cho các câu hỏi trắc nghiệm khi sinh viên nộp bài.
                          Điểm số được tính trên thang 10 và làm tròn 2 chữ số thập phân.
                        </p>
                      </div>
                    </div>

                    {/* Questions */}
                    {quizType === 'manual_question' && (
                    <div className="border-t border-gray-100 pt-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900">Câu hỏi</h3>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                          {questions.length} câu hỏi
                        </span>
                      </div>

                      <div className="space-y-5">
                        {questions.map((question, qIndex) => (
                          <div key={question.id} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/60 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                                  {qIndex + 1}
                                </span>
                                <span className="text-sm text-gray-600 font-medium">Câu hỏi</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeQuestion(question.id)}
                                disabled={questions.length === 1}
                                className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <textarea
                                value={question.noiDung}
                                onChange={e => updateQuestion(question.id, 'noiDung', e.target.value)}
                                placeholder="Nhập nội dung câu hỏi..."
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium resize-none bg-white"
                              />

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs text-gray-500 font-medium mb-1">Loại câu hỏi</label>
                                  <select
                                    value={question.loaiCauHoi ? 'trac-nghiem' : 'tu-luan'}
                                    onChange={e => updateQuestion(question.id, 'loaiCauHoi', e.target.value === 'trac-nghiem')}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-medium"
                                  >
                                    <option value="trac-nghiem">Trắc nghiệm</option>
                                    <option value="tu-luan">Tự luận</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 font-medium mb-1">Điểm</label>
                                  <input
                                    type="number"
                                    value={question.diem}
                                    onChange={e => updateQuestion(question.id, 'diem', parseFloat(e.target.value) || 1)}
                                    min={0.5} max={10} step={0.5}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium bg-white"
                                  />
                                </div>
                              </div>

                              {question.loaiCauHoi && (
                                <div className="space-y-2">
                                  <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    Đáp án <span className="text-gray-400 font-normal normal-case">(chọn đáp án đúng)</span>
                                  </label>
                                  {question.answers.map((answer, aIndex) => (
                                    <div key={answer.id} className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => setCorrectAnswer(question.id, answer.id)}
                                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                          answer.isCorrect
                                            ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                                            : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                                        }`}
                                      >
                                        {answer.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : ANSWER_KEYS[aIndex]}
                                      </button>
                                      <input
                                        type="text"
                                        value={answer.conText}
                                        onChange={e => updateAnswer(question.id, answer.id, 'conText', e.target.value)}
                                        placeholder={`Đáp án ${ANSWER_KEYS[aIndex]}...`}
                                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                                      />
                                      {answer.isCorrect && (
                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Đúng</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addQuestion}
                        className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm câu hỏi
                      </button>
                    </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={creatingQuiz}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all font-semibold text-sm shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {creatingQuiz ? 'Đang xử lý...' : (activeTab === 'edit' ? 'Lưu thay đổi' : 'Tạo bài kiểm tra')}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Xác nhận xóa</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa bài kiểm tra này? Toàn bộ dữ liệu liên quan sẽ bị mất.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors">
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteQuiz}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Đang xóa...' : 'Xóa bài kiểm tra'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-40" aria-label="AI Assistant">
        <AiAssistantButton />
      </button>
    </div>
  );
}
