import React from 'react';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { LoginPage } from '@/app/components/LoginPage';
import { Header } from '@/app/components/Header';
import { StudentDashboard } from '@/app/components/student/StudentDashboard';
import { TeacherDashboard } from '@/app/components/teacher/TeacherDashboard';
import { AdminDashboard } from '@/app/components/admin/AdminDashboard';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'teacher' && <TeacherDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
