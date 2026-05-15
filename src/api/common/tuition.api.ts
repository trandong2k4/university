/**
 * Tuition Repository Pattern (Data Layer)
 * 
 * BENEFITS:
 * - Separates data source (mock vs real API) from business logic
 * - Easy to switch between mock and real data without changing components
 * - Type-safe data operations
 * - Centralized data handling
 * 
 * PATTERN:
 * 1. Define Repository interface (what methods are available)
 * 2. Create MockTuitionRepository (returns mock data)
 * 3. Create ApiTuitionRepository (calls Spring Boot backend)
 * 4. Use factory pattern to select based on envConfig
 * 
 * USAGE in components:
 * import { tuitionRepository } from '@/repositories';
 * const { data } = useAsync(() => tuitionRepository.getAllTuitions());
 */

import { TuitionRecord, TuitionStats, CreateTuitionRequest, UpdateTuitionRequest } from '@/types';
import {
  getAllTuitionRecords,
  getTuitionStats,
  getTuitionById as getMockTuitionById,
  getTuitionsByStatus,
} from '@/data/mockTuitionData';
import { simulateNetworkDelay, logMockDataUsage, logRealDataUsage } from '@/utils/mockDataUtils';
import apiClient from '@/common/axiosClient';
import { API_ENDPOINTS } from '@/constants';

/**
 * Repository Interface - Defines all available operations
 * Components depend on this interface, not implementation
 */
export interface ITuitionRepository {
  // Read operations
  getAllTuitions(): Promise<TuitionRecord[]>;
  getTuitionById(id: string): Promise<TuitionRecord>;
  getTuitionsByStatus(status: string): Promise<TuitionRecord[]>;
  getTuitionStats(): Promise<TuitionStats>;
  
  // Write operations
  createTuition(data: CreateTuitionRequest): Promise<TuitionRecord>;
  updateTuition(id: string, data: UpdateTuitionRequest): Promise<TuitionRecord>;
  deleteTuition(id: string): Promise<void>;
}

/**
 * Mock Implementation - Use for development & testing
 */
export class MockTuitionRepository implements ITuitionRepository {
  async getAllTuitions(): Promise<TuitionRecord[]> {
    await simulateNetworkDelay();
    const data = getAllTuitionRecords();
    logMockDataUsage('getAllTuitions', data);
    return data;
  }

  async getTuitionById(id: string): Promise<TuitionRecord> {
    await simulateNetworkDelay();
    const record = getMockTuitionById(id);
    logMockDataUsage(`getTuitionById(${id})`, record);
    if (!record) throw new Error(`Tuition not found: ${id}`);
    return record;
  }

  async getTuitionsByStatus(status: string): Promise<TuitionRecord[]> {
    await simulateNetworkDelay();
    const filtered = getTuitionsByStatus(status as 'paid' | 'pending' | 'failed');
    logMockDataUsage(`getTuitionsByStatus(${status})`, filtered);
    return filtered;
  }

  async getTuitionStats(): Promise<TuitionStats> {
    await simulateNetworkDelay();
    const stats = getTuitionStats();
    logMockDataUsage('getTuitionStats', stats);
    return stats;
  }

  async createTuition(data: CreateTuitionRequest): Promise<TuitionRecord> {
    await simulateNetworkDelay();
    const records = getAllTuitionRecords();
    const newRecord: TuitionRecord = {
      id: `TUI${String(records.length + 1).padStart(3, '0')}`,
      ...data,
      courses: data.courses || [],
      discount: data.discount || 0,
      status: 'pending',
      createdDate: new Date().toLocaleDateString('vi-VN'),
    } as TuitionRecord;
    localStorage.setItem('tuition_records_v2', JSON.stringify([newRecord, ...records]));
    logMockDataUsage('createTuition', newRecord);
    return newRecord;
  }

  async updateTuition(id: string, data: UpdateTuitionRequest): Promise<TuitionRecord> {
    await simulateNetworkDelay();
    const records = getAllTuitionRecords();
    const index = records.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Tuition not found: ${id}`);
    
    records[index] = { ...records[index], ...data };
    localStorage.setItem('tuition_records_v2', JSON.stringify(records));
    logMockDataUsage(`updateTuition(${id})`, records[index]);
    return records[index];
  }

  async deleteTuition(id: string): Promise<void> {
    await simulateNetworkDelay();
    const records = getAllTuitionRecords();
    const index = records.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Tuition not found: ${id}`);
    records.splice(index, 1);
    localStorage.setItem('tuition_records_v2', JSON.stringify(records));
    logMockDataUsage(`deleteTuition(${id})`, { deleted: id });
  }
}

/**
 * API Implementation - Real Spring Boot backend
 * ENDPOINTS REQUIRED (see docs/backend/SPRING_BOOT_API_SPEC.md for details):
 * - GET    /api/tuitions
 * - GET    /api/tuitions/{id}
 * - GET    /api/tuitions?status={status}
 * - GET    /api/tuitions/stats
 * - POST   /api/tuitions
 * - PUT    /api/tuitions/{id}
 * - DELETE /api/tuitions/{id}
 */
export class ApiTuitionRepository implements ITuitionRepository {
  async getAllTuitions(): Promise<TuitionRecord[]> {
    const response = await apiClient.get(API_ENDPOINTS.TUITION);
    logRealDataUsage(API_ENDPOINTS.TUITION, response.data);
    return response.data;
  }

  async getTuitionById(id: string): Promise<TuitionRecord> {
    const response = await apiClient.get(API_ENDPOINTS.TUITION_BY_ID(id));
    logRealDataUsage(API_ENDPOINTS.TUITION_BY_ID(id), response.data);
    return response.data;
  }

  async getTuitionsByStatus(status: string): Promise<TuitionRecord[]> {
    const response = await apiClient.get(API_ENDPOINTS.TUITION_BY_STATUS(status));
    logRealDataUsage(`${API_ENDPOINTS.TUITION}?status=${status}`, response.data);
    return response.data;
  }

  async getTuitionStats(): Promise<TuitionStats> {
    const response = await apiClient.get(API_ENDPOINTS.TUITION_STATS);
    logRealDataUsage(API_ENDPOINTS.TUITION_STATS, response.data);
    return response.data;
  }

  async createTuition(data: CreateTuitionRequest): Promise<TuitionRecord> {
    const response = await apiClient.post(API_ENDPOINTS.TUITION, data);
    logRealDataUsage(`POST ${API_ENDPOINTS.TUITION}`, response.data);
    return response.data;
  }

  async updateTuition(id: string, data: UpdateTuitionRequest): Promise<TuitionRecord> {
    const response = await apiClient.put(API_ENDPOINTS.TUITION_BY_ID(id), data);
    logRealDataUsage(`PUT ${API_ENDPOINTS.TUITION_BY_ID(id)}`, response.data);
    return response.data;
  }

  async deleteTuition(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TUITION_BY_ID(id));
    logRealDataUsage(`DELETE ${API_ENDPOINTS.TUITION_BY_ID(id)}`, { deleted: id });
  }
}

/**
 * Factory Pattern - Select repository based on configuration
 * This is the key to easily switching between mock and real data!
 */
export function createTuitionRepository(useMockData: boolean): ITuitionRepository {
  if (useMockData) {
    console.log('🎭 Using Mock Tuition Repository');
    return new MockTuitionRepository();
  } else {
    console.log('✅ Using API Tuition Repository (Spring Boot)');
    return new ApiTuitionRepository();
  }
}
