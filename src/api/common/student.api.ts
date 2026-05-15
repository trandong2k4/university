import { envConfig } from '@/constants/environment';
import apiClient from '@/common/axiosClient';
import { getAllTuitionRecords } from '@/data/mockTuition';
import { simulateNetworkDelay } from '@/utils/mockDataUtils';
import type { StudentAcademicProfile } from '@/types';

const ACADEMIC_RECORDS_KEY = 'student_academic_records_v1';

const parseDueDate = (value: string) => {
  if (value.includes('/')) {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const getAcademicRecords = (): Record<string, { completedCourseCodes: string[] }> => {
  const raw = localStorage.getItem(ACADEMIC_RECORDS_KEY);
  if (!raw) {
    const seed = {
      SV001: { completedCourseCodes: ['CS101', 'CS102', 'IT301'] },
    };
    localStorage.setItem(ACADEMIC_RECORDS_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw) as Record<string, { completedCourseCodes: string[] }>;
};

export interface StudentRepository {
  getAcademicProfile(studentCode: string): Promise<StudentAcademicProfile>;
}

class MockStudentRepository implements StudentRepository {
  async getAcademicProfile(studentCode: string): Promise<StudentAcademicProfile> {
    await simulateNetworkDelay();

    const records = getAcademicRecords();
    const normalizedCode = studentCode.toUpperCase();
    if (!records[normalizedCode]) {
      records[normalizedCode] = { completedCourseCodes: ['CS101', 'CS102', 'IT301'] };
      localStorage.setItem(ACADEMIC_RECORDS_KEY, JSON.stringify(records));
    }
    const completedCourseCodes = records[normalizedCode]?.completedCourseCodes || [];

    const tuitionRecords = getAllTuitionRecords().filter((item) => item.studentCode === normalizedCode);
    const overdueDebt = tuitionRecords
      .filter((item) => item.status !== 'paid' && parseDueDate(item.dueDate).getTime() < Date.now())
      .reduce((sum, item) => sum + item.amount, 0);
    const outstandingDebt = tuitionRecords
      .filter((item) => item.status !== 'paid')
      .reduce((sum, item) => sum + item.amount, 0);

    const academicStatus: StudentAcademicProfile['academicStatus'] =
      overdueDebt > 0 ? 'blocked' : outstandingDebt > 0 ? 'warning' : 'good';

    return {
      studentCode: normalizedCode,
      completedCourseCodes,
      outstandingDebt,
      overdueDebt,
      academicStatus,
    };
  }
}

class ApiStudentRepository implements StudentRepository {
  async getAcademicProfile(studentCode: string): Promise<StudentAcademicProfile> {
    const response = await apiClient.get(`/students/${studentCode}/academic-profile`);
    return response.data;
  }
}

export const studentRepository: StudentRepository = envConfig.useMockData
  ? new MockStudentRepository()
  : new ApiStudentRepository();
