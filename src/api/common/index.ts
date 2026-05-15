// Core HTTP client
export { default as apiClient } from './axiosClient';
export { default } from './axiosClient';
// Shared types
export * from './types';
// Shared endpoints
export * from './notifications.api';
export * from './learning.api';
export * from './workflow.api';
export { createTuitionRepository, type ITuitionRepository } from './tuition.api';
export { MockTuitionRepository, ApiTuitionRepository } from './tuition.api';
export { learningRepository } from './learning.api';
export type { LearningRepository } from './learning.api';
export type { WorkflowRepository } from './workflow.api';
export { workflowRepository } from './workflow.api';
export { studentRepository } from './student.api';
export type { StudentRepository } from './student.api';
