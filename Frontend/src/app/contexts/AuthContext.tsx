import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users cho demo
const mockUsers: Record<string, User> = {
  'student@edu.vn': {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'student@edu.vn',
    role: 'student'
  },
  'teacher@edu.vn': {
    id: '2',
    name: 'TS. Trần Thị B',
    email: 'teacher@edu.vn',
    role: 'teacher'
  },
  'admin@edu.vn': {
    id: '3',
    name: 'Admin System',
    email: 'admin@edu.vn',
    role: 'admin'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Mock login - chỉ check email
    const foundUser = mockUsers[email];
    if (foundUser) {
      setUser(foundUser);
    } else {
      alert('Email không tồn tại!');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
