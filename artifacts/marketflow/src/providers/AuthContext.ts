import { createContext } from 'react';
import { ApiUser } from '../lib/api';

export interface AuthContextType {
  currentUser: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ trialDaysLeft?: number | null; isTrialExpired?: boolean; tenantStatus?: string }>;
  logout: () => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
