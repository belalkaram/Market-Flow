import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SuperAdminData {
  id: string;
  name: string;
  email: string;
}

interface SuperAdminContextType {
  admin: SuperAdminData | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

const SA_TOKEN_KEY = 'mf_sa_token';

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SuperAdminData | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(SA_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    fetch('/api/platform/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => setAdmin(j.data))
      .catch(() => { localStorage.removeItem(SA_TOKEN_KEY); setToken(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'فشل تسجيل الدخول');
    localStorage.setItem(SA_TOKEN_KEY, json.data.token);
    setToken(json.data.token);
    setAdmin(json.data.admin);
  };

  const logout = () => {
    localStorage.removeItem(SA_TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  };

  return (
    <SuperAdminContext.Provider value={{ admin, isLoading, token, login, logout }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  return ctx;
}
