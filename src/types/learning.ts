export type LearningAssignmentType = 'assignment' | 'quiz';

export interface LearningAssignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  type: LearningAssignmentType;
  deadline: string;
  maxScore: number;
  totalStudents: number;
  createdDate: string;
  subjectName: string;
  phaseName: string;
  chapterTitle: string;
  publishToStudyProgram: boolean;
}

export interface LearningSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  submittedDate: string;
  fileName: string;
  fileSize: string;
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  lateSubmission: boolean;
}

export interface InstructorAssignmentSummary extends LearningAssignment {
  totalSubmissions: number;
  gradedCount: number;
}

export interface StudentAssignmentView {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: Date;
  status: 'pending' | 'submitted' | 'late';
  submittedAt?: Date;
  submittedFile?: {
    name: string;
    size: string;
  };
  maxScore: number;
  score?: number;
}

export interface StudentQuizView {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: Date;
  status: 'pending' | 'completed';
  maxScore: number;
  score?: number;
}

export interface GradebookRow {
  id: string;
  studentCode: string;
  studentName: string;
  attendanceScore: string;
  midtermScore: string;
  finalScore: string;
}

