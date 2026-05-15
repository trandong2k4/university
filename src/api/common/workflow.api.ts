import { envConfig } from '@/constants/environment';
import apiClient from '@/common/axiosClient';
import { simulateNetworkDelay } from '@/utils/mockDataUtils';
import type { WorkflowAuditLog } from '@/types';

const AUDIT_LOG_KEY = 'workflow_audit_logs_v1';

const readLogs = (): WorkflowAuditLog[] => {
  const raw = localStorage.getItem(AUDIT_LOG_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as WorkflowAuditLog[];
};

const saveLogs = (logs: WorkflowAuditLog[]) => {
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
};

export interface WorkflowRepository {
  appendLog(payload: Omit<WorkflowAuditLog, 'id' | 'createdAt'>): Promise<void>;
  getLogs(limit?: number): Promise<WorkflowAuditLog[]>;
}

class MockWorkflowRepository implements WorkflowRepository {
  async appendLog(payload: Omit<WorkflowAuditLog, 'id' | 'createdAt'>): Promise<void> {
    await simulateNetworkDelay();
    const logs = readLogs();
    const item: WorkflowAuditLog = {
      ...payload,
      id: `AUD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveLogs([item, ...logs]);
  }

  async getLogs(limit = 200): Promise<WorkflowAuditLog[]> {
    await simulateNetworkDelay();
    return readLogs().slice(0, limit);
  }
}

class ApiWorkflowRepository implements WorkflowRepository {
  async appendLog(payload: Omit<WorkflowAuditLog, 'id' | 'createdAt'>): Promise<void> {
    await apiClient.post('/workflow/audit-logs', payload);
  }
  async getLogs(limit = 200): Promise<WorkflowAuditLog[]> {
    const response = await apiClient.get('/workflow/audit-logs', { params: { limit } });
    return response.data;
  }
}

export const workflowRepository: WorkflowRepository = envConfig.useMockData
  ? new MockWorkflowRepository()
  : new ApiWorkflowRepository();
