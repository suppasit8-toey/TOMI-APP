'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import LoginScreen from './LoginScreen';

type User = { id: string; name: string; avatar: string; role: string; user_code?: string } | null;

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tomi_user');
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch (e) { }
    }
    setLoading(false);
  }, []);

  const setUser = (user: User) => {
    setUserState(user);
    if (user) localStorage.setItem('tomi_user', JSON.stringify(user));
    else localStorage.removeItem('tomi_user');
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('tomi_user');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex justify-center items-center flex-col">
        <div className="text-slate-500 font-bold animate-pulse">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {user ? children : <LoginScreen />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
