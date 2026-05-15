/**
 * Mock Data Utilities
 * Helper functions for mock data operations
 * 
 * USAGE:
 * import { simulateNetworkDelay, logMockDataUsage } from '@/utils/mockDataUtils';
 * await simulateNetworkDelay(); // Simulate network latency
 */

import { envConfig } from '@/constants/environment';

/**
 * Simulate network delay (for testing loading states)
 * @param delayMs - Custom delay in milliseconds (uses config if not provided)
 */
export async function simulateNetworkDelay(delayMs?: number): Promise<void> {
  const delay = delayMs ?? envConfig.mockDataDelay;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Log mock data usage (only in debug mode)
 * @param context - Context describing where mock data is being used
 * @param data - The mock data being returned
 */
export function logMockDataUsage(context: string, data: unknown): void {
  if (envConfig.debugLogs) {
    console.log(`🎭 Mock Data [${context}]:`, data);
  }
}

/**
 * Log transition from mock to real API
 * Helpful for tracking when backend integration is complete
 */
export function logRealDataUsage(endpoint: string, data: unknown): void {
  if (envConfig.debugLogs) {
    console.log(`✅ Real API [${endpoint}]:`, data);
  }
}

/**
 * Error handler for mock data - helpful for debugging
 */
export function logMockDataError(context: string, error: unknown): void {
  console.warn(`⚠️  Mock Data Error [${context}]:`, error);
}
