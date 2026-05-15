export type AcademicStatus = 'good' | 'warning' | 'blocked';

export interface StudentAcademicProfile {
  studentCode: string;
  completedCourseCodes: string[];
  outstandingDebt: number;
  overdueDebt: number;
  academicStatus: AcademicStatus;
}

