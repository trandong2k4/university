/**
 * Mock Data - For Testing & Development
 * Re-exported from src/app/data/mockTuitionData.ts
 * 
 * USAGE:
 * import { mockTuitionRecords, getTuitionStats } from '@/data/mockTuition';
 * 
 * const { data } = useAsync(
 *   () => tuitionRepository.getAllTuitions(),
 *   mockTuitionRecords  // ← Fallback to mock
 * );
 */

export type { TuitionRecord, CourseItem } from '@/types';
export {
  mockTuitionRecords,
  getAllTuitionRecords,
  getTuitionStats,
  getTuitionById,
  getTuitionsByStatus,
  updateTuitionStatus,
  createTuitionFromEnrollment,
} from './mockTuitionData';
