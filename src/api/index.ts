// Re-export from role-specific modules
export * from './auth';
export * from './chatbot';
export * from './common';
export * from './admin';
// export * from './lecturer';
export * from './accounting';

// student re-exports from common
export { studentRepository } from './common/student.api';

// Resolve duplicate type names from common/admin star exports above.
export type { PermissionsItem, RoleItem, UserRoleItem } from './common/types';
