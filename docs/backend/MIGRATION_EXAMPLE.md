/**
 * 🔄 EXAMPLE: How to Migrate Services to Repository Pattern
 * 
 * This file shows before/after code for migrating from direct service calls
 * to the repository pattern. Apply this pattern to all services.
 */

// ============================================
// ❌ BEFORE: Direct Service Call (Old Way)
// ============================================

// src/pages/AccountantDashboard.tsx
import { tuitionService } from '@/services';
import { mockTuitionRecords } from '@/data/mockTuition';
import { useAsync } from '@/hooks/useAsync';

export function AccountantDashboardOld() {
  // Problem: Mixing mock data with service call
  // Hard to swap data source - need to change here
  const { data: tuitions, loading, error } = useAsync(
    () => tuitionService.getAllTuitions(),
    mockTuitionRecords  // Fallback data hardcoded
  );

  const { data: stats } = useAsync(
    () => tuitionService.getTuitionStats(),
    { totalRecords: 0, totalAmount: 0 }  // Another mock fallback
  );

  return (
    <div>
      <h1>Accountant Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {tuitions?.map(t => (
          <li key={t.id}>{t.studentName} - {t.amount}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// ✅ AFTER: Repository Pattern (New Way)
// ============================================

// src/pages/AccountantDashboard.tsx
import { tuitionRepository } from '@/repositories';
import { useAsync } from '@/hooks/useAsync';

export function AccountantDashboard() {
  // ✨ Cleaner: Repository handles mock vs real
  // Auto-switches based on .env VITE_USE_MOCK_DATA
  const { data: tuitions, loading, error } = useAsync(
    () => tuitionRepository.getAllTuitions()
  );

  const { data: stats } = useAsync(
    () => tuitionRepository.getTuitionStats()
  );

  return (
    <div>
      <h1>Accountant Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {tuitions?.map(t => (
          <li key={t.id}>{t.studentName} - {t.amount}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// 🔄 Service Migration Example
// ============================================

// BEFORE: src/services/tuition.ts
// ❌ Direct API calls, no abstraction
export const tuitionService = {
  getAllTuitions: async () => {
    const response = await apiClient.get('/tuitions');
    return response.data;
  },
  getTuitionById: async (id: string) => {
    const response = await apiClient.get(`/tuitions/${id}`);
    return response.data;
  },
  // ... more methods
};

// AFTER: Use Repository Pattern
// ✅ src/repositories/tuitionRepository.ts
// Interface defines contract
export interface ITuitionRepository {
  getAllTuitions(): Promise<TuitionRecord[]>;
  getTuitionById(id: string): Promise<TuitionRecord>;
  // ... more methods
}

// Mock implementation
export class MockTuitionRepository implements ITuitionRepository {
  async getAllTuitions(): Promise<TuitionRecord[]> {
    await simulateNetworkDelay();
    return mockTuitionRecords;
  }
  // ... implement all methods
}

// Real API implementation
export class ApiTuitionRepository implements ITuitionRepository {
  async getAllTuitions(): Promise<TuitionRecord[]> {
    const response = await apiClient.get('/tuitions');
    return response.data;
  }
  // ... implement all methods
}

// Factory selects based on config
export function createTuitionRepository(useMockData: boolean): ITuitionRepository {
  return useMockData ? new MockTuitionRepository() : new ApiTuitionRepository();
}

// ============================================
// 📊 More Complex Example: Create with Upload
// ============================================

// Component using repository (simple & clean)
export function CreateTuitionForm() {
  const handleSubmit = async (formData: CreateTuitionRequest) => {
    try {
      const newTuition = await tuitionRepository.createTuition(formData);
      console.log('Created:', newTuition);
    } catch (error) {
      console.error('Failed to create tuition:', error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}

// Repository can handle complex operations
export class ApiTuitionRepository implements ITuitionRepository {
  async createTuition(data: CreateTuitionRequest): Promise<TuitionRecord> {
    // Real backend can process uploaded files, validate, etc.
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    const response = await apiClient.post('/tuitions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
}

export class MockTuitionRepository implements ITuitionRepository {
  async createTuition(data: CreateTuitionRequest): Promise<TuitionRecord> {
    // Mock can simply add to in-memory data
    await simulateNetworkDelay();
    const newRecord = { ...data, id: `TUI${Date.now()}` } as TuitionRecord;
    this.data.push(newRecord);
    return newRecord;
  }
}

// ============================================
// 🔍 Pattern for Other Services
// ============================================

// Apply same pattern to:
// 1. StudentRepository (for student features)
// 2. AdminRepository (for admin features)
// 3. InstructorRepository (for instructor features)
// 4. AccountantRepository (for accountant features)

// Example: src/repositories/studentRepository.ts
export interface IStudentRepository {
  getCurrentProfile(): Promise<StudentProfile>;
  getProfile(studentId: string): Promise<StudentProfile>;
  getSchedule(): Promise<StudentSchedule[]>;
  getCourses(): Promise<CourseEnrolled[]>;
  getGrades(): Promise<StudentGrade[]>;
  getAttendance(): Promise<StudentAttendance[]>;
  updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile>;
  registerCourses(courseIds: string[]): Promise<{ success: boolean; message: string }>;
}

export class MockStudentRepository implements IStudentRepository {
  // Mock implementation
}

export class ApiStudentRepository implements IStudentRepository {
  // Real API implementation
}

// ============================================
// 💾 Index File to Export All Repositories
// ============================================

// src/repositories/index.ts
import { envConfig } from '@/config/environment';
import { createTuitionRepository, type ITuitionRepository } from './tuitionRepository';
import { createStudentRepository, type IStudentRepository } from './studentRepository';

// Create all repositories based on config
export const tuitionRepository = createTuitionRepository(envConfig.useMockData);
export const studentRepository = createStudentRepository(envConfig.useMockData);

// Export types for type-safety
export type { ITuitionRepository, IStudentRepository };

// ============================================
// 📝 Component Refactoring Checklist
// ============================================

/*
For each component that uses data:

1. [ ] Identify which repository it needs (tuition, student, admin, etc.)
2. [ ] Import repository: import { tuitionRepository } from '@/repositories'
3. [ ] Replace service call: tuitionService → tuitionRepository
4. [ ] Remove manual mock fallback: no need for mockTuitionRecords
5. [ ] Test with VITE_USE_MOCK_DATA=true (should work)
6. [ ] Test with VITE_USE_MOCK_DATA=false (if backend ready)

Example:
- [ ] AccountantDashboard
- [ ] TuitionListPage
- [ ] StudentProfilePage
- [ ] ClassManagement
- [ ] AssignmentManagement
- [ ] etc.
*/

// ============================================
// 🚀 Benefits Summary
// ============================================

/*
BEFORE (Old Service Pattern):
- ❌ Mock data hardcoded in components
- ❌ Service calls directly to API
- ❌ Hard to test (can't easily mock)
- ❌ Tightly coupled to data source
- ❌ Changing data source requires component changes

AFTER (Repository Pattern):
- ✅ No mock data in components
- ✅ Repository abstracts data source
- ✅ Easy to test (mock/real implementations)
- ✅ Loosely coupled to data source
- ✅ Changing data source: just change .env flag
- ✅ Component code never changes
- ✅ Type-safe (interface ensures all methods implemented)
- ✅ Scalable (easy to add new repositories)
*/
