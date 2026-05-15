/**
 * 🔄 Create Additional Repositories
 * 
 * This file shows how to create repositories for other services
 * Follow the same pattern as TuitionRepository
 * 
 * Services to migrate:
 * - StudentRepository ✅ (Done below)
 * - AdminRepository (Follow same pattern)
 * - InstructorRepository (Follow same pattern)
 * - AccountantRepository (Follow same pattern)
 */

// ============================================
// 📚 StudentRepository Example
// ============================================

import { simulateNetworkDelay, logMockDataUsage, logRealDataUsage } from '@/utils/mockDataUtils';
import apiClient from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';

// Types (same as in existing StudentProfile interface)
export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  avatar?: string;
  enrollmentDate?: string;
  status?: string;
}

export interface StudentSchedule {
  id: string;
  courseId: string;
  courseName: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building: string;
}

export interface CourseEnrolled {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  status: 'active' | 'completed' | 'dropped';
  grade?: number;
}

export interface StudentGrade {
  courseId: string;
  courseName: string;
  code: string;
  midtermScore?: number;
  finalScore?: number;
  practiceScore?: number;
  totalScore?: number;
  grade?: string;
  gpa?: number;
}

export interface StudentAttendance {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  note?: string;
}

// ============================================
// Repository Interface
// ============================================

export interface IStudentRepository {
  // Profile operations
  getCurrentProfile(): Promise<StudentProfile>;
  getProfile(studentId: string): Promise<StudentProfile>;
  updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile>;

  // Course operations
  getCourses(): Promise<CourseEnrolled[]>;
  registerCourses(courseIds: string[]): Promise<{ success: boolean; message: string }>;

  // Schedule
  getSchedule(): Promise<StudentSchedule[]>;

  // Grades
  getGrades(): Promise<StudentGrade[]>;

  // Attendance
  getAttendance(): Promise<StudentAttendance[]>;
}

// ============================================
// Mock Implementation
// ============================================

export class MockStudentRepository implements IStudentRepository {
  private currentStudent: StudentProfile = {
    id: 'STU001',
    email: 'student@example.com',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    enrollmentDate: '2023-09-01',
    status: 'active',
  };

  private courses: CourseEnrolled[] = [
    {
      id: 'CRS001',
      code: 'CS301',
      name: 'Lập trình Web nâng cao',
      credits: 3,
      instructor: 'TS. Nguyễn Văn Lộc',
      status: 'active',
    },
    {
      id: 'CRS002',
      code: 'CS302',
      name: 'Cơ sở dữ liệu',
      credits: 4,
      instructor: 'TS. Trần Thị B',
      status: 'active',
    },
  ];

  private schedule: StudentSchedule[] = [
    {
      id: 'SCH001',
      courseId: 'CRS001',
      courseName: 'Lập trình Web nâng cao',
      instructor: 'TS. Nguyễn Văn Lộc',
      dayOfWeek: 'Monday',
      startTime: '08:00',
      endTime: '10:00',
      room: '401',
      building: 'A',
    },
    {
      id: 'SCH002',
      courseId: 'CRS002',
      courseName: 'Cơ sở dữ liệu',
      instructor: 'TS. Trần Thị B',
      dayOfWeek: 'Wednesday',
      startTime: '13:00',
      endTime: '15:00',
      room: '305',
      building: 'B',
    },
  ];

  private grades: StudentGrade[] = [
    {
      courseId: 'CRS001',
      courseName: 'Lập trình Web nâng cao',
      code: 'CS301',
      midtermScore: 8.5,
      finalScore: 8.0,
      practiceScore: 9.0,
      totalScore: 8.5,
      grade: 'A',
      gpa: 4.0,
    },
    {
      courseId: 'CRS002',
      courseName: 'Cơ sở dữ liệu',
      code: 'CS302',
      midtermScore: 7.5,
      finalScore: 8.5,
      practiceScore: 8.0,
      totalScore: 8.0,
      grade: 'A',
      gpa: 4.0,
    },
  ];

  private attendance: StudentAttendance[] = [
    { id: 'ATT001', courseId: 'CRS001', courseName: 'Lập trình Web nâng cao', date: '2026-03-10', status: 'present' },
    { id: 'ATT002', courseId: 'CRS001', courseName: 'Lập trình Web nâng cao', date: '2026-03-17', status: 'present' },
    { id: 'ATT003', courseId: 'CRS001', courseName: 'Lập trình Web nâng cao', date: '2026-03-24', status: 'absent' },
    { id: 'ATT004', courseId: 'CRS002', courseName: 'Cơ sở dữ liệu', date: '2026-03-12', status: 'late' },
  ];

  async getCurrentProfile(): Promise<StudentProfile> {
    await simulateNetworkDelay();
    logMockDataUsage('getCurrentProfile', this.currentStudent);
    return this.currentStudent;
  }

  async getProfile(studentId: string): Promise<StudentProfile> {
    await simulateNetworkDelay();
    logMockDataUsage(`getProfile(${studentId})`, this.currentStudent);
    return this.currentStudent;
  }

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    await simulateNetworkDelay();
    this.currentStudent = { ...this.currentStudent, ...data };
    logMockDataUsage('updateProfile', this.currentStudent);
    return this.currentStudent;
  }

  async getCourses(): Promise<CourseEnrolled[]> {
    await simulateNetworkDelay();
    logMockDataUsage('getCourses', this.courses);
    return this.courses;
  }

  async registerCourses(courseIds: string[]): Promise<{ success: boolean; message: string }> {
    await simulateNetworkDelay();
    logMockDataUsage('registerCourses', courseIds);
    return { success: true, message: 'Đăng ký khóa học thành công' };
  }

  async getSchedule(): Promise<StudentSchedule[]> {
    await simulateNetworkDelay();
    logMockDataUsage('getSchedule', this.schedule);
    return this.schedule;
  }

  async getGrades(): Promise<StudentGrade[]> {
    await simulateNetworkDelay();
    logMockDataUsage('getGrades', this.grades);
    return this.grades;
  }

  async getAttendance(): Promise<StudentAttendance[]> {
    await simulateNetworkDelay();
    logMockDataUsage('getAttendance', this.attendance);
    return this.attendance;
  }
}

// ============================================
// API Implementation
// ============================================

export class ApiStudentRepository implements IStudentRepository {
  async getCurrentProfile(): Promise<StudentProfile> {
    const response = await apiClient.get('/students/me');
    logRealDataUsage('/students/me', response.data);
    return response.data;
  }

  async getProfile(studentId: string): Promise<StudentProfile> {
    const response = await apiClient.get(`/students/${studentId}`);
    logRealDataUsage(`/students/${studentId}`, response.data);
    return response.data;
  }

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    const response = await apiClient.put('/students/me', data);
    logRealDataUsage('PUT /students/me', response.data);
    return response.data;
  }

  async getCourses(): Promise<CourseEnrolled[]> {
    const response = await apiClient.get('/courses');
    logRealDataUsage('/courses', response.data);
    return response.data;
  }

  async registerCourses(courseIds: string[]): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/courses/register', { courseIds });
    logRealDataUsage('POST /courses/register', response.data);
    return response.data;
  }

  async getSchedule(): Promise<StudentSchedule[]> {
    const response = await apiClient.get('/schedules');
    logRealDataUsage('/schedules', response.data);
    return response.data;
  }

  async getGrades(): Promise<StudentGrade[]> {
    const response = await apiClient.get('/grades');
    logRealDataUsage('/grades', response.data);
    return response.data;
  }

  async getAttendance(): Promise<StudentAttendance[]> {
    const response = await apiClient.get('/attendance');
    logRealDataUsage('/attendance', response.data);
    return response.data;
  }
}

// ============================================
// Factory
// ============================================

export function createStudentRepository(useMockData: boolean): IStudentRepository {
  if (useMockData) {
    console.log('🎭 Using Mock Student Repository');
    return new MockStudentRepository();
  } else {
    console.log('✅ Using API Student Repository (Spring Boot)');
    return new ApiStudentRepository();
  }
}

// ============================================
// Usage in Components
// ============================================

/*
// src/pages/StudentProfilePage.tsx
import { studentRepository } from '@/repositories';
import { useAsync } from '@/hooks/useAsync';

export function StudentProfilePage() {
  const { data: profile, loading, error } = useAsync(
    () => studentRepository.getCurrentProfile()
  );

  const { data: courses } = useAsync(
    () => studentRepository.getCourses()
  );

  const { data: grades } = useAsync(
    () => studentRepository.getGrades()
  );

  const { data: schedule } = useAsync(
    () => studentRepository.getSchedule()
  );

  // ... render JSX

  // Update profile
  const handleUpdateProfile = async (data: Partial<StudentProfile>) => {
    await studentRepository.updateProfile(data);
  };

  // Register courses
  const handleRegisterCourses = async (courseIds: string[]) => {
    await studentRepository.registerCourses(courseIds);
  };
}
*/

// ============================================
// Additional Repositories (Follow Same Pattern)
// ============================================

/*
1. AdminRepository
   - getAccounts()
   - getDepartments()
   - getStatistics()
   - createUser()
   - deleteUser()
   - etc.

2. InstructorRepository
   - getClasses()
   - getStudents()
   - getAssignments()
   - submitGrades()
   - etc.

3. AccountantRepository
   - getTuitions()  // (already have)
   - getPayments()
   - generateReports()
   - exportRecords()
   - etc.

4. AuthRepository
   - login()
   - logout()
   - refreshToken()
   - register()
   - resetPassword()
   - etc.
*/

// ============================================
// Update repositories/index.ts
// ============================================

/*
import { envConfig } from '@/config/environment';
import { createTuitionRepository, type ITuitionRepository } from './tuitionRepository';
import { createStudentRepository, type IStudentRepository } from './studentRepository';
import { createAdminRepository, type IAdminRepository } from './adminRepository';
import { createInstructorRepository, type IInstructorRepository } from './instructorRepository';

export const tuitionRepository = createTuitionRepository(envConfig.useMockData);
export const studentRepository = createStudentRepository(envConfig.useMockData);
export const adminRepository = createAdminRepository(envConfig.useMockData);
export const instructorRepository = createInstructorRepository(envConfig.useMockData);

export type {
  ITuitionRepository,
  IStudentRepository,
  IAdminRepository,
  IInstructorRepository,
};
*/

// ============================================
// Component Usage Examples
// ============================================

/*
// Profile Page
import { studentRepository } from '@/repositories';

const { data: profile } = useAsync(() => studentRepository.getCurrentProfile());
const { data: courses } = useAsync(() => studentRepository.getCourses());
const { data: grades } = useAsync(() => studentRepository.getGrades());

// Schedule Page
const { data: schedule } = useAsync(() => studentRepository.getSchedule());

// Dashboard (Admin)
import { adminRepository } from '@/repositories';

const { data: accounts } = useAsync(() => adminRepository.getAccounts());
const { data: departments } = useAsync(() => adminRepository.getDepartments());
const { data: stats } = useAsync(() => adminRepository.getStatistics());

// Class Management (Instructor)
import { instructorRepository } from '@/repositories';

const { data: classes } = useAsync(() => instructorRepository.getClasses());
const { data: students } = useAsync(() => instructorRepository.getStudents());
*/
