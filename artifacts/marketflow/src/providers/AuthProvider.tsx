import { useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mf_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.me()
        .then(user => setCurrentUser(user))
        .catch(() => {
          localStorage.removeItem('mf_token');
          setToken(null);
          setCurrentUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    localStorage.setItem('mf_token', result.token);
    setToken(result.token);
    setCurrentUser(result.user);
    return {
      trialDaysLeft: (result.user as any).trialDaysLeft ?? null,
      isTrialExpired: (result.user as any).isTrialExpired ?? false,
      tenantStatus: (result.user as any).tenantStatus ?? 'active',
    };
  };

  const logout = () => {
    localStorage.removeItem('mf_token');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      logout,
      token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
