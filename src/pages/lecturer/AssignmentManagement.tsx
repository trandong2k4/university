import { InstructorSidebar } from '@/components/layouts/InstructorSidebar';
import { InstructorHeader } from '@/components/layouts/InstructorHeader';
import {
  ArrowRight, Plus, ClipboardList, FileText, ChevronDown, Eye, Trash2,
  AlertCircle, Search, Link, X, Check, Edit, Clock, AlertTriangle, CheckCircle,
  Upload, CheckCircle2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks';
import AiAssistantButton from '@/imports/AiAssistantButton';
import { uploadFile, resolveFileUrl } from '@/utils/fileUtils';
import lecturerApi, {
  LecturerClassSummaryResponseDTO, AssignmentResponseDTO,
  SubmissionResponseDTO, SubmissionDetailResponseDTO
} from '@/api/lecturer/lecturer.api';

const ACCEPTED_FILE_TYPES = ['pdf', 'docx', 'pptx', 'zip', 'doc', 'xlsx'];
const ANSWER_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MAX_FILE_SIZE_MB = 50;
const DEFAULT_ANSWER_COUNT = 4;

interface QuestionForm {
  id: string;
  noiDung: string;
  loaiCauHoi: boolean;
  nhieuDapAn: boolean;
  diem: number;
  answers: AnswerForm[];
}

interface AnswerForm {
  id: string;
  keyAnswers: string;
  conText: string;
  isCorrect: boolean;
}

function validateFileUrl(url: string): string | null {
  if (!url.trim()) return 'URL file không được để trống';
  try {
    const value = url.trim();
    const pathname = value.startsWith('/api/') || value.startsWith('/')
      ? value
      : new URL(value).pathname;
    if (pathname.startsWith('/api/files/')) return null;
    const ext = pathname.split('.').pop()?.toLowerCase() || '';
    if (!ACCEPTED_FILE_TYPES.includes(ext)) {
      return `Định dạng không hỗ trợ. Chỉ chấp nhận: ${ACCEPTED_FILE_TYPES.join(', ').toUpperCase()}`;
    }
    return null;
  } catch {
    return 'URL không hợp lệ';
  }
}

function validateAssignmentFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ACCEPTED_FILE_TYPES.includes(ext)) {
    return `Định dạng không hỗ trợ. Chỉ chấp nhận: ${ACCEPTED_FILE_TYPES.join(', ').toUpperCase()}`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File vượt quá dung lượng tối đa ${MAX_FILE_SIZE_MB}MB`;
  }
  return null;
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string; detail?: string; error?: string } } };
  return err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || fallback;
}

function newAnswer(key: string, isCorrect = false): AnswerForm {
  return {
    id: crypto.randomUUID(),
    keyAnswers: key,
    conText: '',
    isCorrect,
  };
}

function newAnswers(count = DEFAULT_ANSWER_COUNT): AnswerForm[] {
  return ANSWER_KEYS.slice(0, count).map((key, index) => newAnswer(key, index === 0));
}

function rekeyAnswers(answers: AnswerForm[]): AnswerForm[] {
  return answers.map((answer, index) => ({
    ...answer,
    keyAnswers: ANSWER_KEYS[index] || String(index + 1),
  }));
}

function newQuestion(): QuestionForm {
  return {
    id: crypto.randomUUID(),
    noiDung: '',
    loaiCauHoi: true,
    nhieuDapAn: false,
    diem: 1,
    answers: newAnswers(),
  };
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  if (!hasTimezone) return trimmed.slice(0, 16);

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toApiDateTimeValue(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length === 16 ? `${trimmed}:00` : trimmed;
}

function questionFromDTO(question: NonNullable<AssignmentResponseDTO['questions']>[number]): QuestionForm {
  const answers = question.answers?.map((answer, index) => ({
    id: answer.answerId || crypto.randomUUID(),
    keyAnswers: answer.keyAnswers || ANSWER_KEYS[index] || String(index + 1),
    conText: answer.conText || '',
    isCorrect: Boolean(answer.isCorrect),
  })) || [];

  return {
    id: question.questionId || crypto.randomUUID(),
    noiDung: question.noiDung || '',
    loaiCauHoi: Boolean(question.loaiCauHoi),
    nhieuDapAn: Boolean(question.nhieuDapAn),
    diem: question.diem ?? 1,
    answers: question.loaiCauHoi ? (answers.length ? rekeyAnswers(answers) : newAnswers()) : answers,
  };
}

function validateQuestionForms(questionItems: QuestionForm[]) {
  const meaningfulQuestions = questionItems.filter(q => q.noiDung.trim());
  for (const q of meaningfulQuestions) {
    if (q.loaiCauHoi) {
      const validAnswers = q.answers.filter(a => a.conText.trim());
      const hasCorrect = validAnswers.some(a => a.isCorrect);
      const correctCount = validAnswers.filter(a => a.isCorrect).length;
      if (validAnswers.length < 2) {
        return 'Mỗi câu hỏi trắc nghiệm phải có ít nhất 2 đáp án';
      }
      if (!hasCorrect) {
        return 'Mỗi câu hỏi trắc nghiệm phải có ít nhất 1 đáp án đúng';
      }
      if (!q.nhieuDapAn && correctCount > 1) {
        return 'Câu hỏi một đáp án chỉ được có 1 đáp án đúng';
      }
    }
  }
  return null;
}

function buildQuestionsPayloadFrom(questionItems: QuestionForm[]) {
  return questionItems
    .filter(q => q.noiDung.trim())
    .map(q => ({
      noiDung: q.noiDung.trim(),
      loaiCauHoi: q.loaiCauHoi,
      nhieuDapAn: q.loaiCauHoi && q.nhieuDapAn,
      diem: q.diem,
      answers: q.loaiCauHoi
        ? q.answers
            .filter(a => a.conText.trim())
            .map(a => ({
              keyAnswers: a.keyAnswers,
              conText: a.conText.trim(),
              isCorrect: a.isCorrect,
            }))
        : [],
    }));
}

interface QuestionEditorProps {
  questions: QuestionForm[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionForm[]>>;
  description?: string;
}

function QuestionEditor({
  questions,
  setQuestions,
  description = 'Có thể bỏ trống nếu bài tập chỉ dùng file đính kèm',
}: QuestionEditorProps) {
  const addQuestion = () => setQuestions(prev => [...prev, newQuestion()]);
  const removeQuestion = (id: string) => {
    setQuestions(prev => (prev.length > 1 ? prev.filter(q => q.id !== id) : prev));
  };
  const updateQuestion = (id: string, field: keyof QuestionForm, value: string | number | boolean) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      if (field === 'loaiCauHoi' && value === true && q.answers.length === 0) {
        return { ...q, [field]: value, answers: newAnswers() };
      }
      return { ...q, [field]: value };
    }));
  const setQuestionType = (id: string, value: string) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      if (value === 'tu-luan') {
        return { ...q, loaiCauHoi: false, nhieuDapAn: false };
      }
      if (value === 'trac-nghiem-nhieu') {
        return {
          ...q,
          loaiCauHoi: true,
          nhieuDapAn: true,
          answers: q.answers.length ? q.answers : newAnswers(),
        };
      }
      const answers = q.answers.length ? q.answers : newAnswers();
      const firstCorrectId = answers.find(answer => answer.isCorrect)?.id ?? answers[0]?.id;
      return {
        ...q,
        loaiCauHoi: true,
        nhieuDapAn: false,
        answers: answers.map(answer => ({ ...answer, isCorrect: answer.id === firstCorrectId })),
      };
    }));
  const updateAnswer = (questionId: string, answerId: string, value: string) =>
    setQuestions(prev => prev.map(q => q.id !== questionId
      ? q
      : { ...q, answers: q.answers.map(a => a.id === answerId ? { ...a, conText: value } : a) }
    ));
  const setCorrectAnswer = (questionId: string, answerId: string) =>
    setQuestions(prev => prev.map(q => q.id !== questionId
      ? q
      : {
          ...q,
          answers: q.answers.map(a => ({
            ...a,
            isCorrect: q.nhieuDapAn
              ? (a.id === answerId ? !a.isCorrect : a.isCorrect)
              : a.id === answerId,
          })),
        }
    ));
  const addAnswer = (questionId: string) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId || q.answers.length >= ANSWER_KEYS.length) return q;
      return { ...q, answers: rekeyAnswers([...q.answers, newAnswer(ANSWER_KEYS[q.answers.length])]) };
    }));
  const removeAnswer = (questionId: string, answerId: string) =>
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId || q.answers.length <= 2) return q;
      const remaining = rekeyAnswers(q.answers.filter(a => a.id !== answerId));
      if (!remaining.some(a => a.isCorrect) && remaining[0]) {
        remaining[0] = { ...remaining[0], isCorrect: true };
      }
      return { ...q, answers: remaining };
    }));

  return (
    <div className="border-t border-gray-200 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Câu hỏi trong bài tập</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
          {questions.filter(q => q.noiDung.trim()).length} câu
        </span>
      </div>

      {questions.map((question, qIndex) => (
        <div key={question.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {qIndex + 1}
              </span>
              <span className="text-sm font-semibold text-gray-700">Câu hỏi</span>
            </div>
            <button
              type="button"
              onClick={() => removeQuestion(question.id)}
              disabled={questions.length === 1}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-40"
              title="Xóa câu hỏi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <textarea
              value={question.noiDung}
              onChange={e => updateQuestion(question.id, 'noiDung', e.target.value)}
              rows={2}
              placeholder="Nhập nội dung câu hỏi..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Loại câu hỏi</label>
                <select
                  value={question.loaiCauHoi
                    ? (question.nhieuDapAn ? 'trac-nghiem-nhieu' : 'trac-nghiem-mot')
                    : 'tu-luan'}
                  onChange={e => setQuestionType(question.id, e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="trac-nghiem-mot">Trắc nghiệm một đáp án</option>
                  <option value="trac-nghiem-nhieu">Trắc nghiệm nhiều đáp án</option>
                  <option value="tu-luan">Tự luận</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Điểm</label>
                <input
                  type="number"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={question.diem}
                  onChange={e => updateQuestion(question.id, 'diem', parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>
            </div>

            {question.loaiCauHoi && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Đáp án trắc nghiệm
                </label>
                {question.answers.map((answer, aIndex) => (
                  <div key={answer.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(question.id, answer.id)}
                      className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                        answer.isCorrect
                          ? 'border-green-400 bg-green-50 text-green-600'
                          : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                      }`}
                      title="Chọn đáp án đúng"
                    >
                      {answer.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : answer.keyAnswers || ANSWER_KEYS[aIndex]}
                    </button>
                    <input
                      type="text"
                      value={answer.conText}
                      onChange={e => updateAnswer(question.id, answer.id, e.target.value)}
                      placeholder={`Đáp án ${answer.keyAnswers || ANSWER_KEYS[aIndex]}...`}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeAnswer(question.id, answer.id)}
                      disabled={question.answers.length <= 2}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-40"
                      title="Xóa đáp án"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {question.answers.length < ANSWER_KEYS.length && (
                  <button
                    type="button"
                    onClick={() => addAnswer(question.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm đáp án
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold text-sm"
      >
        <Plus className="w-4 h-4" />
        Thêm câu hỏi
      </button>
    </div>
  );
}

export default function AssignmentManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState<LecturerClassSummaryResponseDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [assignments, setAssignments] = useState<AssignmentResponseDTO[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'create-assignment' | 'import-excel'>('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attemptLimit, setAttemptLimit] = useState(1);
  const [questions, setQuestions] = useState<QuestionForm[]>([newQuestion()]);
  const [creating, setCreating] = useState(false);
  const createAssignmentLockRef = useRef(false);
  const [fileError, setFileError] = useState('');
  const [uploadingAssignmentFile, setUploadingAssignmentFile] = useState(false);
  const [selectedAssignmentFile, setSelectedAssignmentFile] = useState<File | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Edit
  const [editAssignment, setEditAssignment] = useState<AssignmentResponseDTO | null>(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    startDate: '',
    endDate: '',
    attemptLimit: 1,
  });
  const [editQuestions, setEditQuestions] = useState<QuestionForm[]>([newQuestion()]);
  const [editQuestionsLoaded, setEditQuestionsLoaded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editFileError, setEditFileError] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [uploadingEditFile, setUploadingEditFile] = useState(false);
  const [selectedEditFile, setSelectedEditFile] = useState<File | null>(null);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Submissions
  const [viewingSubmissions, setViewingSubmissions] = useState<AssignmentResponseDTO | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionResponseDTO[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grading
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionDetailResponseDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    lecturerApi.getClasses(user.id).then(data => {
      setClasses(data);
      if (data.length > 0) setSelectedClassId(data[0].lopHocPhanId);
    }).catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    if (!selectedClassId || !user?.id) return;
    setLoadingAssignments(true);
    lecturerApi.getAssignments(selectedClassId, user.id)
      .then(setAssignments)
      .catch(console.error)
      .finally(() => setLoadingAssignments(false));
  }, [selectedClassId, user?.id]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredAssignments = assignments.filter(a =>
    a.tieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.moTa || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUrlChange = (val: string, isEdit = false) => {
    if (isEdit) {
      setSelectedEditFile(null);
      setEditData(p => ({ ...p, fileUrl: val }));
      if (val) {
        const err = validateFileUrl(val);
        setEditFileError(err || '');
      } else {
        setEditFileError('');
      }
    } else {
      setSelectedAssignmentFile(null);
      setFileUrl(val);
      if (val) {
        const err = validateFileUrl(val);
        setFileError(err || '');
      } else {
        setFileError('');
      }
    }
  };

  const handleAssignmentFileSelect = (file: File, isEdit = false) => {
    const error = validateAssignmentFile(file);
    if (isEdit) {
      setSelectedEditFile(error ? null : file);
      setEditFileError(error || '');
      setEditData(prev => (
        prev.fileUrl && validateFileUrl(prev.fileUrl)
          ? { ...prev, fileUrl: '' }
          : prev
      ));
      return;
    }

    setSelectedAssignmentFile(error ? null : file);
    setFileError(error || '');
    if (!error) setFileUrl('');
  };

  const validateQuestions = (items: QuestionForm[]) => validateQuestionForms(items);
  const buildQuestionsPayload = (items: QuestionForm[]) => buildQuestionsPayloadFrom(items);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createAssignmentLockRef.current || creating || uploadingAssignmentFile) return;
    if (!user?.id || !selectedClassId || !title.trim()) return;
    if (fileError) return;
    const questionPayload = buildQuestionsPayload(questions);
    if (!fileUrl.trim() && !selectedAssignmentFile && questionPayload.length === 0) {
      setFileError('Vui lòng nhập URL file hoặc thêm ít nhất 1 câu hỏi');
      return;
    }
    const questionError = validateQuestions(questions);
    if (questionError) {
      setFileError(questionError);
      return;
    }
    createAssignmentLockRef.current = true;
    setCreating(true);
    try {
      let saved = await lecturerApi.createAssignment(user.id, {
        lopHocPhanId: selectedClassId,
        tieuDe: title.trim(),
        moTa: description.trim() || undefined,
        fileExerciseUrl: selectedAssignmentFile ? undefined : fileUrl.trim() || undefined,
        thoiGianBatDau: toApiDateTimeValue(startDate),
        thoiGianKetThuc: toApiDateTimeValue(endDate),
        gioiHanLanLam: attemptLimit,
        questions: questionPayload,
      });
      let uploadFailed = false;
      if (selectedAssignmentFile) {
        setUploadingAssignmentFile(true);
        try {
          const uploaded = await uploadFile(selectedAssignmentFile);
          saved = await lecturerApi.updateAssignment(saved.id, user.id, {
            lopHocPhanId: selectedClassId,
            tieuDe: title.trim(),
            moTa: description.trim() || undefined,
            fileExerciseUrl: uploaded.fileUrl,
            thoiGianBatDau: toApiDateTimeValue(startDate),
            thoiGianKetThuc: toApiDateTimeValue(endDate),
            gioiHanLanLam: attemptLimit,
          });
        } catch (uploadErr) {
          uploadFailed = true;
          console.error(uploadErr);
        } finally {
          setUploadingAssignmentFile(false);
        }
      }
      setAssignments(prev => [saved, ...prev]);
      setTitle('');
      setDescription('');
      setFileUrl('');
      setSelectedAssignmentFile(null);
      setStartDate('');
      setEndDate('');
      setAttemptLimit(1);
      setQuestions([newQuestion()]);
      setFileError('');
      setActiveTab('assignments');
      showSuccess(uploadFailed ? 'Tạo bài tập thành công nhưng upload file thất bại' : 'Tạo bài tập thành công');
    } catch (err) {
      console.error(err);
    } finally {
      createAssignmentLockRef.current = false;
      setCreating(false);
    }
  };

  const handleImportExcel = async () => {
    if (!user?.id || !selectedClassId || !importFile) return;
    setImporting(true);
    setImportErrors([]);
    try {
      const result = await lecturerApi.importAssignmentsFromExcel(user.id, selectedClassId, importFile);
      setImportErrors(result.errors || []);
      showSuccess(result.message || 'Import Excel hoàn tất');
      const updated = await lecturerApi.getAssignments(selectedClassId, user.id);
      setAssignments(updated);
      setImportFile(null);
      if (importInputRef.current) importInputRef.current.value = '';
      setActiveTab('assignments');
    } catch (err) {
      console.error(err);
      setImportErrors(['Import Excel thất bại. Vui lòng kiểm tra định dạng file.']);
    } finally {
      setImporting(false);
    }
  };

  const openEdit = (a: AssignmentResponseDTO) => {
    const hasQuestionDetails = Array.isArray(a.questions);
    const canEditQuestions = hasQuestionDetails || !a.questionCount;
    setEditAssignment(a);
    setEditData({
      title: a.tieuDe,
      description: a.moTa || '',
      fileUrl: a.fileExerciseUrl || '',
      startDate: toDateTimeLocalValue(a.thoiGianBatDau),
      endDate: toDateTimeLocalValue(a.thoiGianKetThuc),
      attemptLimit: a.gioiHanLanLam && a.gioiHanLanLam > 0 ? a.gioiHanLanLam : 1,
    });
    setEditQuestions(hasQuestionDetails
      ? (a.questions!.length ? a.questions!.map(questionFromDTO) : [newQuestion()])
      : []);
    setEditQuestionsLoaded(canEditQuestions);
    setEditFileError(a.fileExerciseUrl ? validateFileUrl(a.fileExerciseUrl) || '' : '');
    setEditFormError('');
    setSelectedEditFile(null);
  };

  const confirmEdit = async () => {
    if (!editAssignment || !user?.id || !editData.title.trim()) return;
    if (editFileError) return;
    const hasSubmissions = (editAssignment.submissionCount ?? 0) > 0;
    const canUpdateQuestions = editQuestionsLoaded && !hasSubmissions;
    const questionPayload = canUpdateQuestions ? buildQuestionsPayload(editQuestions) : undefined;
    const hasEditableQuestions = editQuestionsLoaded
      ? (hasSubmissions ? (editAssignment.questionCount ?? 0) > 0 : Boolean(questionPayload?.length))
      : (editAssignment.questionCount ?? 0) > 0;
    if (!editData.fileUrl.trim() && !selectedEditFile && !hasEditableQuestions) {
      setEditFormError('Vui lòng nhập URL file hoặc thêm ít nhất 1 câu hỏi');
      return;
    }
    if (canUpdateQuestions) {
      const questionError = validateQuestions(editQuestions);
      if (questionError) {
        setEditFormError(questionError);
        return;
      }
    }
    setEditFormError('');
    setEditing(true);
    try {
      let updated = await lecturerApi.updateAssignment(editAssignment.id, user.id, {
        lopHocPhanId: editAssignment.lopHocPhanId,
        tieuDe: editData.title.trim(),
        moTa: editData.description.trim() || undefined,
        fileExerciseUrl: selectedEditFile ? undefined : editData.fileUrl.trim() || undefined,
        thoiGianBatDau: toApiDateTimeValue(editData.startDate),
        thoiGianKetThuc: toApiDateTimeValue(editData.endDate),
        gioiHanLanLam: Math.max(1, editData.attemptLimit || 1),
        questions: questionPayload,
      });
      let uploadFailed = false;
      if (selectedEditFile) {
        setUploadingEditFile(true);
        try {
          const uploaded = await uploadFile(selectedEditFile);
          updated = await lecturerApi.updateAssignment(editAssignment.id, user.id, {
            lopHocPhanId: editAssignment.lopHocPhanId,
            tieuDe: editData.title.trim(),
            moTa: editData.description.trim() || undefined,
            fileExerciseUrl: uploaded.fileUrl,
            thoiGianBatDau: toApiDateTimeValue(editData.startDate),
            thoiGianKetThuc: toApiDateTimeValue(editData.endDate),
            gioiHanLanLam: Math.max(1, editData.attemptLimit || 1),
          });
        } catch (uploadErr) {
          uploadFailed = true;
          console.error(uploadErr);
        } finally {
          setUploadingEditFile(false);
        }
      }
      setAssignments(prev => prev.map(a => a.id === editAssignment.id ? updated : a));
      setEditAssignment(null);
      setSelectedEditFile(null);
      showSuccess(uploadFailed ? 'Cập nhật bài tập thành công nhưng upload file thất bại' : 'Cập nhật bài tập thành công');
    } catch (err) {
      console.error(err);
      setEditFormError(getErrorMessage(err, 'Cập nhật bài tập thất bại. Vui lòng thử lại.'));
    } finally {
      setEditing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId || !user?.id) return;
    setDeleting(true);
    try {
      await lecturerApi.deleteAssignment(deleteId, user.id);
      setAssignments(prev => prev.filter(a => a.id !== deleteId));
      setDeleteId(null);
      showSuccess('Xóa bài tập thành công');
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Xóa bài tập thất bại';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 6000);
    } finally {
      setDeleting(false);
    }
  };

  const openSubmissions = async (a: AssignmentResponseDTO) => {
    setViewingSubmissions(a);
    setLoadingSubmissions(true);
    try {
      const subs = await lecturerApi.getSubmissions(a.lopHocPhanId, a.id, user!.id);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const openGrading = async (s: SubmissionResponseDTO) => {
    setGradingSubmission(null);
    setGradeScore(s.grade != null ? String(s.grade) : '');
    setGradeFeedback(s.feedback || '');
    setDetailLoading(true);
    try {
      const detail = await lecturerApi.getSubmissionDetailFull(s.submissionId, user!.id);
      setGradingSubmission(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmGrade = async () => {
    if (!gradingSubmission || !user?.id) return;
    const score = parseFloat(gradeScore);
    if (isNaN(score) || score < 0 || score > 10) return;
    setGrading(true);
    try {
      await lecturerApi.gradeSubmission(gradingSubmission.submissionId, user.id, score, gradeFeedback.trim() || undefined);
      setSubmissions(prev => prev.map(s =>
        s.submissionId === gradingSubmission.submissionId
          ? { ...s, grade: score, feedback: gradeFeedback.trim() || null }
          : s
      ));
      setGradingSubmission(null);
      showSuccess('Chấm điểm thành công');
    } catch (err) {
      console.error(err);
    } finally {
      setGrading(false);
    }
  };

  const formatDate = (s: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  const formatShortDate = (s: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  const isOverdue = (s: string) => s ? new Date(s) < new Date() : false;

  return (
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <InstructorHeader title="Quản lý Bài tập" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-green-700 font-medium">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-red-700 font-medium">{errorMsg}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Bài tập</h2>
                <p className="text-gray-600 mt-1">Tạo và theo dõi bài tập cho sinh viên</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm flex gap-6">
                <div>
                  <p className="text-sm text-gray-600">Tổng bài tập</p>
                  <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bài nộp</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assignments.reduce((sum, a) => sum + a.submissionCount, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex gap-2">
              {[
                { key: 'assignments', label: 'Danh sách bài tập', Icon: ClipboardList },
                { key: 'create-assignment', label: 'Tạo bài tập', Icon: Plus },
                { key: 'import-excel', label: 'Thêm bằng Excel', Icon: Upload },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                    activeTab === key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Assignments List */}
            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chọn lớp học phần</label>
                      <div className="relative">
                        <select
                          value={selectedClassId}
                          onChange={e => setSelectedClassId(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm theo tên bài tập..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          {['Tiêu đề', 'Mô tả', 'Hạn nộp', 'Bài nộp', 'Thao tác'].map(h => (
                            <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {loadingAssignments ? (
                          <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Đang tải...</td></tr>
                        ) : filteredAssignments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">Chưa có bài tập nào</p>
                            </td>
                          </tr>
                        ) : filteredAssignments.map(a => (
                          <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-900">{a.tieuDe}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{a.moTa || '–'}</td>
                            <td className="px-6 py-4">
                              {a.thoiGianKetThuc ? (
                                <span className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                                  isOverdue(a.thoiGianKetThuc)
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  {formatShortDate(a.thoiGianKetThuc)}
                                </span>
                              ) : <span className="text-gray-400 text-sm">Chưa đặt</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                                <FileText className="w-4 h-4" />
                                {a.submissionCount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openSubmissions(a)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Xem bài nộp"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEdit(a)}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {a.fileExerciseUrl && (
                                  <a
                                    href={a.fileExerciseUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Xem file đề"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => setDeleteId(a.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Create Assignment Form */}
            {activeTab === 'create-assignment' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleCreateAssignment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn lớp học phần <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề bài tập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="VD: Bài tập tuần 5 - React Hooks"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả bài tập</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Nhập mô tả chi tiết về bài tập, yêu cầu, hướng dẫn..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL file bài tập
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={fileUrl}
                          onChange={e => handleFileUrlChange(e.target.value)}
                          placeholder="Upload file hoặc nhập URL trực tiếp"
                          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                            fileError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      <label className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                        uploadingAssignmentFile
                          ? 'bg-gray-100 text-gray-400 cursor-wait'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                      }`}>
                        <Upload className="w-4 h-4" />
                        {uploadingAssignmentFile ? 'Đang upload...' : 'Upload file'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg,.webp,.txt"
                          disabled={uploadingAssignmentFile}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleAssignmentFileSelect(file);
                            e.currentTarget.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {fileError ? (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {fileError}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Chấp nhận: PDF, DOCX, PPTX, ZIP, DOC, XLSX (tối đa {MAX_FILE_SIZE_MB}MB)
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hạn nộp</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn lần làm</label>
                      <input
                        type="number"
                        min={1}
                        value={attemptLimit}
                        onChange={e => setAttemptLimit(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <QuestionEditor questions={questions} setQuestions={setQuestions} />

                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={creating || uploadingAssignmentFile || !!fileError}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? 'Đang tạo...' : 'Tạo bài tập'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('assignments')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'import-excel' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Thêm bài tập bằng Excel</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Mỗi dòng là một câu hỏi. Các dòng cùng tiêu đề sẽ được gom vào cùng một bài tập.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn lớp học phần <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

                <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={e => setImportFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700"
                  >
                    <Upload className="w-4 h-4" />
                    Chọn file Excel
                  </button>
                  {importFile && (
                    <p className="text-sm text-gray-700 mt-3">
                      File đã chọn: <span className="font-semibold">{importFile.name}</span>
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-bold mb-2">Thứ tự cột Excel:</p>
                  <p>Tiêu đề, Mô tả, URL file, Bắt đầu, Hạn nộp, Nội dung câu hỏi, Loại câu hỏi, Điểm, A, B, C, D, E, F, Đáp án đúng, Giới hạn lần làm</p>
                  <p className="mt-2 text-blue-700">Loại câu hỏi: nhập "trac-nghiem" hoặc "tu-luan". Đáp án đúng dùng A-F, có thể nhập A hoặc A,B.</p>
                </div>

                {importErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-bold text-red-700 mb-2">Lỗi import</p>
                    <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                      {importErrors.slice(0, 8).map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleImportExcel}
                    disabled={importing || !importFile}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? 'Đang import...' : 'Import Excel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa bài tập</h3>
              <button onClick={() => setEditAssignment(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {editFormError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-red-700">{editFormError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={editData.description}
                  onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL file đề bài</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={editData.fileUrl}
                      onChange={e => handleFileUrlChange(e.target.value, true)}
                      className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                        editFileError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    uploadingEditFile
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'
                  }`}>
                    <Upload className="w-4 h-4" />
                    {uploadingEditFile ? 'Đang upload...' : 'Upload file'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg,.webp,.txt"
                      disabled={uploadingEditFile}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleAssignmentFileSelect(file, true);
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {editFileError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {editFileError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={editData.startDate}
                    onChange={e => setEditData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp</label>
                  <input
                    type="datetime-local"
                    value={editData.endDate}
                    onChange={e => setEditData(p => ({ ...p, endDate: e.target.value }))}
                    min={editData.startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn lần làm</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.attemptLimit}
                    onChange={e => setEditData(p => ({ ...p, attemptLimit: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {(editAssignment.submissionCount ?? 0) > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Không thể sửa câu hỏi sau khi đã có bài nộp</p>
                    <p className="text-sm text-amber-700">Bạn vẫn có thể cập nhật tiêu đề, mô tả, file, thời gian và giới hạn lần làm. Câu hỏi và đáp án hiện tại sẽ được giữ nguyên.</p>
                  </div>
                </div>
              ) : editQuestionsLoaded ? (
                <QuestionEditor
                  questions={editQuestions}
                  setQuestions={setEditQuestions}
                  description="Sửa câu hỏi và đáp án sẽ thay thế cấu hình câu hỏi hiện tại của bài tập"
                />
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Chưa tải được chi tiết câu hỏi</p>
                    <p className="text-sm text-amber-700">Lưu thay đổi lúc này sẽ giữ nguyên câu hỏi và đáp án hiện có.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end shrink-0">
              <button onClick={() => setEditAssignment(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button>
              <button
                onClick={confirmEdit}
                disabled={editing || uploadingEditFile || !!editFileError || !editData.title.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
            </div>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {viewingSubmissions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{viewingSubmissions.tieuDe}</h3>
                {viewingSubmissions.moTa && <p className="text-sm text-gray-500 mt-1">{viewingSubmissions.moTa}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/lecturer/assignments/${viewingSubmissions.id}/results?classId=${viewingSubmissions.lopHocPhanId}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                  Xem tất cả kết quả
                </button>
                <button onClick={() => setViewingSubmissions(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="overflow-auto flex-1">
              {loadingSubmissions ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-gray-500">Đang tải danh sách bài nộp...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có sinh viên nào nộp bài</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Sinh viên', 'Mã SV', 'File bài nộp', 'Thời gian nộp', 'Điểm', 'Thao tác'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map(s => (
                      <tr key={s.submissionId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{s.studentName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.studentCode}</td>
                        <td className="px-6 py-4">
                          {s.fileUrl ? (
                            <a href={resolveFileUrl(s.fileUrl)} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                              <FileText className="w-4 h-4" /> Xem file
                            </a>
                          ) : <span className="text-gray-400 text-sm">Không có</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {s.submittedAt ? formatDate(s.submittedAt) : '–'}
                        </td>
                        <td className="px-6 py-4">
                          {s.grade != null ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
                              s.grade >= 8 ? 'bg-green-100 text-green-700' :
                              s.grade >= 5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {s.grade.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Chưa chấm</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openGrading(s)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Chấm điểm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto py-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chấm điểm bài nộp</h3>
                <p className="text-sm text-gray-500">{gradingSubmission.studentName} – {gradingSubmission.studentCode}</p>
              </div>
              <button onClick={() => setGradingSubmission(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-auto flex-1 px-6 py-4 space-y-4">
              {/* File link */}
              {detailLoading ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Đang tải chi tiết bài nộp...</p>
                </div>
              ) : (
                <>
                  {gradingSubmission.fileUrl && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-700 uppercase mb-1">File đính kèm</p>
                      <a href={resolveFileUrl(gradingSubmission.fileUrl)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Xem bài nộp của sinh viên
                      </a>
                    </div>
                  )}

                  {/* Questions & Answers */}
                  {gradingSubmission.answers && gradingSubmission.answers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Câu hỏi & Câu trả lời</p>
                      {gradingSubmission.answers.map((q, idx) => (
                        <div key={q.questionId} className={`border rounded-lg p-4 ${q.isCorrect ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-medium text-gray-900 flex-1">{q.questionContent}</p>
                            <span className="shrink-0 text-xs text-gray-500">({q.maxScore} đ)</span>
                          </div>

                          {q.isMultipleChoice ? (
                            <div className="ml-8 space-y-1.5">
                              {q.options?.map(opt => (
                                <div key={opt.answerId} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                                  opt.isSelected && opt.isCorrect ? 'bg-green-100 border border-green-300' :
                                  opt.isSelected && !opt.isCorrect ? 'bg-red-100 border border-red-300' :
                                  !opt.isSelected && opt.isCorrect ? 'bg-green-50 border border-green-200' :
                                  'bg-gray-50'
                                }`}>
                                  {opt.isSelected && <CheckCircle className="w-3.5 h-3.5 shrink-0 text-blue-600" />}
                                  <span className={`flex-1 ${opt.isCorrect ? 'font-semibold text-green-700' : 'text-gray-700'}`}>
                                    {opt.content}
                                  </span>
                                </div>
                              ))}
                              {q.earnedScore != null && (
                                <p className={`text-xs font-semibold mt-1 ${q.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                                  Điểm: {q.earnedScore} / {q.maxScore}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="ml-8">
                              <p className="text-xs text-gray-500 mb-1">Câu trả lời:</p>
                              <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                  {q.submittedAnswer || <span className="italic text-gray-400">Chưa trả lời</span>}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-400 italic">
                      Không có câu hỏi trắc nghiệm hoặc bài tự luận được nộp
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer - grading form */}
            <div className="px-6 py-4 border-t border-gray-200 shrink-0 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm (0 – 10) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={gradeScore}
                  onChange={e => setGradeScore(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 8.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét</label>
                <textarea
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Nhập nhận xét..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setGradingSubmission(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Hủy</button>
                <button
                  onClick={confirmGrade}
                  disabled={grading || gradeScore === '' || isNaN(parseFloat(gradeScore))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {grading ? 'Đang lưu...' : 'Lưu điểm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        className="fixed bottom-8 right-8 w-16 h-16 hover:scale-110 transition-transform duration-200 z-50"
        aria-label="AI Assistant"
      >
        <AiAssistantButton />
      </button>
    </div>
  );
}
