import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../api/client';
import type { AuthUser } from '../types';

interface AppContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const safeGet = (key: string) => {
  try { return localStorage.getItem(key); } catch (e) { return null; }
};
const safeSet = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch (e) {}
};
const safeRemove = (key: string) => {
  try { localStorage.removeItem(key); } catch (e) {}
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = safeGet('token');
    const username = safeGet('username');
    return token && username ? { token, username } : null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post<AuthUser>('/auth/login', { username, password });
    safeSet('token', data.token);
    safeSet('username', data.username);
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    safeRemove('token');
    safeRemove('username');
    setUser(null);
  }, []);

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
