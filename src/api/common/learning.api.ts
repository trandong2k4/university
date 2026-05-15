import { envConfig } from '@/constants/environment';
import apiClient from '@/common/axiosClient';
import { simulateNetworkDelay } from '@/utils/mockDataUtils';
import type {
  GradebookRow,
  InstructorAssignmentSummary,
  LearningAssignment,
  LearningSubmission,
  StudentAssignmentView,
  StudentQuizView,
} from '@/types';

const ASSIGNMENTS_KEY = 'learning_assignments_v1';
const SUBMISSIONS_KEY = 'learning_submissions_v1';
const STUDY_PROGRAM_KEY = 'studyProgramRoadmap';
const GRADEBOOK_OVERRIDE_KEY = 'learning_gradebook_override_v1';

const seededAssignments: LearningAssignment[] = [
  {
    id: '1',
    title: 'Bài tập tuần 4 - HTML & CSS',
    description: 'Xây dựng trang web responsive sử dụng HTML5 và CSS3',
    classId: '1',
    className: 'IT301 - Lập trình Web',
    type: 'assignment',
    deadline: '2026-03-30T23:59',
    maxScore: 10,
    totalStudents: 45,
    createdDate: '2026-03-20',
    subjectName: 'Lập trình Web',
    phaseName: 'Giai đoạn 1 - Nền tảng',
    chapterTitle: 'Chương 1',
    publishToStudyProgram: true,
  },
  {
    id: '2',
    title: 'Quiz - JavaScript Basics',
    description: 'Kiểm tra kiến thức cơ bản về JavaScript',
    classId: '1',
    className: 'IT301 - Lập trình Web',
    type: 'quiz',
    deadline: '2026-03-28T15:00',
    maxScore: 10,
    totalStudents: 45,
    createdDate: '2026-03-21',
    subjectName: 'Lập trình Web',
    phaseName: 'Giai đoạn 2 - Ứng dụng',
    chapterTitle: 'Chương 3',
    publishToStudyProgram: true,
  },
];

const getAssignments = (): LearningAssignment[] => {
  const raw = localStorage.getItem(ASSIGNMENTS_KEY);
  if (!raw) {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(seededAssignments));
    return seededAssignments;
  }
  return JSON.parse(raw) as LearningAssignment[];
};

const getSubmissions = (): LearningSubmission[] => {
  const raw = localStorage.getItem(SUBMISSIONS_KEY);
  if (!raw) {
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(raw) as LearningSubmission[];
};

const saveAssignments = (assignments: LearningAssignment[]) => {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
};

const saveSubmissions = (submissions: LearningSubmission[]) => {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
};

const normalizeId = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export interface LearningRepository {
  getInstructorAssignments(): Promise<InstructorAssignmentSummary[]>;
  createAssignment(payload: Omit<LearningAssignment, 'id' | 'createdDate'>): Promise<LearningAssignment>;
  deleteAssignment(assignmentId: string): Promise<void>;
  publishToStudyProgram(assignmentId: string): Promise<void>;
  getStudentAssignments(studentId: string): Promise<StudentAssignmentView[]>;
  submitAssignment(payload: {
    assignmentId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    fileName: string;
    fileSize: string;
  }): Promise<void>;
  getSubmissionsByAssignment(assignmentId: string): Promise<LearningSubmission[]>;
  gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<void>;
  getStudentQuizzes(studentId: string): Promise<StudentQuizView[]>;
  submitQuizAttempt(payload: {
    quizId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    score: number;
  }): Promise<void>;
  getGradebookByClass(classId: string): Promise<GradebookRow[]>;
  saveGradebookByClass(classId: string, rows: GradebookRow[]): Promise<void>;
}

class MockLearningRepository implements LearningRepository {
  async getInstructorAssignments(): Promise<InstructorAssignmentSummary[]> {
    await simulateNetworkDelay();
    const assignments = getAssignments();
    const submissions = getSubmissions();
    return assignments.map((assignment) => {
      const related = submissions.filter((item) => item.assignmentId === assignment.id);
      const graded = related.filter((item) => item.status === 'graded');
      return {
        ...assignment,
        totalSubmissions: related.length,
        gradedCount: graded.length,
      };
    });
  }

  async createAssignment(payload: Omit<LearningAssignment, 'id' | 'createdDate'>): Promise<LearningAssignment> {
    await simulateNetworkDelay();
    const assignments = getAssignments();
    const created: LearningAssignment = {
      ...payload,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
    };
    saveAssignments([created, ...assignments]);
    if (created.publishToStudyProgram) {
      await this.publishToStudyProgram(created.id);
    }
    return created;
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    await simulateNetworkDelay();
    saveAssignments(getAssignments().filter((item) => item.id !== assignmentId));
    saveSubmissions(getSubmissions().filter((item) => item.assignmentId !== assignmentId));
  }

  async publishToStudyProgram(assignmentId: string): Promise<void> {
    await simulateNetworkDelay();
    const assignments = getAssignments();
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (!assignment) return;

    const raw = localStorage.getItem(STUDY_PROGRAM_KEY);
    const program = raw ? (JSON.parse(raw) as any[]) : [];
    const subjectId = `sub-${normalizeId(assignment.subjectName)}`;
    const phaseId = `phase-${normalizeId(assignment.phaseName)}`;
    const chapterId = `chapter-${normalizeId(assignment.chapterTitle)}`;

    let subject = program.find((item) => item.id === subjectId);
    if (!subject) {
      subject = { id: subjectId, name: assignment.subjectName, phases: [] };
      program.push(subject);
    }

    let phase = subject.phases.find((item: any) => item.id === phaseId);
    if (!phase) {
      phase = { id: phaseId, name: assignment.phaseName, subject: assignment.subjectName, chapters: [] };
      subject.phases.push(phase);
    }

    let chapter = phase.chapters.find((item: any) => item.id === chapterId);
    if (!chapter) {
      chapter = { id: chapterId, title: assignment.chapterTitle, summary: 'Bài tập do giảng viên cập nhật.', exercises: [] };
      phase.chapters.push(chapter);
    }

    chapter.exercises.unshift({
      id: `exercise-${assignment.id}`,
      title: assignment.title,
      deadline: new Date(assignment.deadline).toLocaleDateString('vi-VN'),
      status: 'not_started',
    });
    localStorage.setItem(STUDY_PROGRAM_KEY, JSON.stringify(program));
    saveAssignments(assignments.map((item) => (item.id === assignment.id ? { ...item, publishToStudyProgram: true } : item)));
  }

  async getStudentAssignments(studentId: string): Promise<StudentAssignmentView[]> {
    await simulateNetworkDelay();
    const assignments = getAssignments().filter((item) => item.type === 'assignment');
    const submissions = getSubmissions();

    return assignments.map((assignment) => {
      const latest = submissions
        .filter((item) => item.assignmentId === assignment.id && item.studentId === studentId)
        .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())[0];

      let status: StudentAssignmentView['status'] = 'pending';
      if (latest) {
        status = latest.lateSubmission ? 'late' : 'submitted';
      }

      return {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subjectName,
        description: assignment.description,
        deadline: new Date(assignment.deadline),
        status,
        submittedAt: latest ? new Date(latest.submittedDate) : undefined,
        submittedFile: latest ? { name: latest.fileName, size: latest.fileSize } : undefined,
        maxScore: assignment.maxScore,
        score: latest?.grade,
      };
    });
  }

  async submitAssignment(payload: {
    assignmentId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    fileName: string;
    fileSize: string;
  }): Promise<void> {
    await simulateNetworkDelay();
    const assignments = getAssignments();
    const submissions = getSubmissions();
    const assignment = assignments.find((item) => item.id === payload.assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const submittedDate = new Date().toISOString();
    const lateSubmission = new Date(submittedDate) > new Date(assignment.deadline);
    const newItem: LearningSubmission = {
      id: `${Date.now()}-${payload.studentId}`,
      assignmentId: payload.assignmentId,
      studentId: payload.studentId,
      studentCode: payload.studentCode,
      studentName: payload.studentName,
      submittedDate,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      status: 'submitted',
      lateSubmission,
    };

    const withoutOld = submissions.filter(
      (item) => !(item.assignmentId === payload.assignmentId && item.studentId === payload.studentId)
    );
    saveSubmissions([newItem, ...withoutOld]);
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<LearningSubmission[]> {
    await simulateNetworkDelay();
    return getSubmissions()
      .filter((item) => item.assignmentId === assignmentId)
      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<void> {
    await simulateNetworkDelay();
    const submissions = getSubmissions();
    saveSubmissions(
      submissions.map((item) =>
        item.id === submissionId ? { ...item, status: 'graded', grade, feedback } : item
      )
    );
  }

  async getStudentQuizzes(studentId: string): Promise<StudentQuizView[]> {
    await simulateNetworkDelay();
    const quizzes = getAssignments().filter((item) => item.type === 'quiz');
    const submissions = getSubmissions();
    return quizzes.map((quiz) => {
      const latest = submissions
        .filter((item) => item.assignmentId === quiz.id && item.studentId === studentId)
        .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())[0];
      return {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subjectName,
        description: quiz.description,
        deadline: new Date(quiz.deadline),
        status: latest ? 'completed' : 'pending',
        maxScore: quiz.maxScore,
        score: latest?.grade,
      };
    });
  }

  async submitQuizAttempt(payload: {
    quizId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    score: number;
  }): Promise<void> {
    await simulateNetworkDelay();
    const assignments = getAssignments();
    const quiz = assignments.find((item) => item.id === payload.quizId);
    if (!quiz) throw new Error('Quiz not found');

    const item: LearningSubmission = {
      id: `${Date.now()}-${payload.studentId}-quiz`,
      assignmentId: payload.quizId,
      studentId: payload.studentId,
      studentCode: payload.studentCode,
      studentName: payload.studentName,
      submittedDate: new Date().toISOString(),
      fileName: 'Quiz online',
      fileSize: '-',
      status: 'graded',
      grade: payload.score,
      feedback: 'Chấm tự động từ hệ thống quiz.',
      lateSubmission: false,
    };
    const submissions = getSubmissions().filter(
      (sub) => !(sub.assignmentId === payload.quizId && sub.studentId === payload.studentId)
    );
    saveSubmissions([item, ...submissions]);
  }

  async getGradebookByClass(classId: string): Promise<GradebookRow[]> {
    await simulateNetworkDelay();
    const gradebookOverrideRaw = localStorage.getItem(GRADEBOOK_OVERRIDE_KEY);
    const gradebookOverride = gradebookOverrideRaw
      ? (JSON.parse(gradebookOverrideRaw) as Record<string, GradebookRow[]>)
      : {};
    if (gradebookOverride[classId]?.length) {
      return gradebookOverride[classId];
    }

    const assignments = getAssignments().filter((item) => item.classId === classId);
    const submissions = getSubmissions().filter((item) =>
      assignments.some((assignment) => assignment.id === item.assignmentId && item.status === 'graded')
    );
    const studentMap = new Map<string, GradebookRow>();

    submissions.forEach((sub) => {
      const assignment = assignments.find((item) => item.id === sub.assignmentId);
      if (!assignment) return;
      if (!studentMap.has(sub.studentId)) {
        studentMap.set(sub.studentId, {
          id: sub.studentId,
          studentCode: sub.studentCode,
          studentName: sub.studentName,
          attendanceScore: '10',
          midtermScore: '',
          finalScore: '',
        });
      }
      const row = studentMap.get(sub.studentId)!;
      if (assignment.type === 'quiz') {
        row.midtermScore = sub.grade?.toFixed(1) || row.midtermScore;
      } else {
        row.finalScore = sub.grade?.toFixed(1) || row.finalScore;
      }
    });

    return Array.from(studentMap.values());
  }

  async saveGradebookByClass(classId: string, rows: GradebookRow[]): Promise<void> {
    await simulateNetworkDelay();
    const gradebookOverrideRaw = localStorage.getItem(GRADEBOOK_OVERRIDE_KEY);
    const gradebookOverride = gradebookOverrideRaw
      ? (JSON.parse(gradebookOverrideRaw) as Record<string, GradebookRow[]>)
      : {};
    gradebookOverride[classId] = rows;
    localStorage.setItem(GRADEBOOK_OVERRIDE_KEY, JSON.stringify(gradebookOverride));
  }
}

class ApiLearningRepository implements LearningRepository {
  async getInstructorAssignments(): Promise<InstructorAssignmentSummary[]> {
    const response = await apiClient.get('/learning/assignments/instructor');
    return response.data;
  }
  async createAssignment(payload: Omit<LearningAssignment, 'id' | 'createdDate'>): Promise<LearningAssignment> {
    const response = await apiClient.post('/learning/assignments', payload);
    return response.data;
  }
  async deleteAssignment(assignmentId: string): Promise<void> {
    await apiClient.delete(`/learning/assignments/${assignmentId}`);
  }
  async publishToStudyProgram(assignmentId: string): Promise<void> {
    await apiClient.post(`/learning/assignments/${assignmentId}/publish`);
  }
  async getStudentAssignments(studentId: string): Promise<StudentAssignmentView[]> {
    const response = await apiClient.get(`/learning/students/${studentId}/assignments`);
    return response.data;
  }
  async submitAssignment(payload: {
    assignmentId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    fileName: string;
    fileSize: string;
  }): Promise<void> {
    await apiClient.post(`/learning/assignments/${payload.assignmentId}/submit`, payload);
  }
  async getSubmissionsByAssignment(assignmentId: string): Promise<LearningSubmission[]> {
    const response = await apiClient.get(`/learning/assignments/${assignmentId}/submissions`);
    return response.data;
  }
  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<void> {
    await apiClient.post(`/learning/submissions/${submissionId}/grade`, { grade, feedback });
  }
  async getStudentQuizzes(studentId: string): Promise<StudentQuizView[]> {
    const response = await apiClient.get(`/learning/students/${studentId}/quizzes`);
    return response.data;
  }
  async submitQuizAttempt(payload: {
    quizId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    score: number;
  }): Promise<void> {
    await apiClient.post(`/learning/quizzes/${payload.quizId}/submit`, payload);
  }
  async getGradebookByClass(classId: string): Promise<GradebookRow[]> {
    const response = await apiClient.get(`/learning/classes/${classId}/gradebook`);
    return response.data;
  }
  async saveGradebookByClass(classId: string, rows: GradebookRow[]): Promise<void> {
    await apiClient.post(`/learning/classes/${classId}/gradebook`, { rows });
  }
}

export const learningRepository: LearningRepository = envConfig.useMockData
  ? new MockLearningRepository()
  : new ApiLearningRepository();
