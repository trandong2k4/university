export interface WorkflowAuditLog {
  id: string;
  actorRole: 'admin' | 'instructor' | 'student' | 'accountant' | 'system';
  actorId: string;
  module: 'learning' | 'tuition' | 'admin-content' | 'registration' | 'gradebook';
  action: string;
  entityId: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  createdAt: string;
}

