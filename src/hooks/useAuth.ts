/**
 * Custom Hook: useAuth
 * Provides authentication context and related functions
 */

import { useContext } from 'react';
import { AuthContext } from '@/store/auth.store';
import { AuthContextType } from '@/types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
