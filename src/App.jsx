import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import StudentDashboardPage from '@/pages/StudentDashboardPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import GuardianDashboardPage from '@/pages/GuardianDashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

import TeacherManageStudents from '@/pages/teacher/TeacherManageStudents';
import TeacherRegisterStudent from '@/pages/teacher/TeacherRegisterStudent';
import TeacherRegisterGuardian from '@/pages/teacher/TeacherRegisterGuardian';
import TeacherRegisterTeacher from '@/pages/teacher/TeacherRegisterTeacher';
import TeacherManageClasses from '@/pages/teacher/TeacherManageClasses';
import TeacherManageSubjects from '@/pages/teacher/TeacherManageSubjects';
import TeacherAssignGrades from '@/pages/teacher/TeacherAssignGrades';
import TeacherPublishLessons from '@/pages/teacher/TeacherPublishLessons';
import TeacherSendComments from '@/pages/teacher/TeacherSendComments';
import TeacherViewContent from '@/pages/teacher/TeacherViewContent';
import TeacherChat from '@/pages/teacher/TeacherChat';

import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';


const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 0 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 0 }} 
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};


function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          
          <Route 
            path="student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageWrapper><StudentDashboardPage /></PageWrapper>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="teacher-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageWrapper><TeacherDashboardPage /></PageWrapper>
              </ProtectedRoute>
            }
          >
            <Route index element={<PageWrapper><div className="text-center p-8"><h2 className="text-2xl text-primary font-semibold">Bem-vindo ao Painel do Professor!</h2><p className="text-muted-foreground">Selecione uma opção no menu lateral para começar.</p></div></PageWrapper>} />
            <Route path="manage-students" element={<PageWrapper><TeacherManageStudents /></PageWrapper>} />
            <Route path="register-student" element={<PageWrapper><TeacherRegisterStudent /></PageWrapper>} />
            <Route path="register-guardian" element={<PageWrapper><TeacherRegisterGuardian /></PageWrapper>} />
            <Route path="register-teacher" element={<PageWrapper><TeacherRegisterTeacher /></PageWrapper>} />
            <Route path="manage-classes" element={<PageWrapper><TeacherManageClasses /></PageWrapper>} />
            <Route path="manage-subjects" element={<PageWrapper><TeacherManageSubjects /></PageWrapper>} />
            <Route path="assign-grades" element={<PageWrapper><TeacherAssignGrades /></PageWrapper>} />
            <Route path="publish-lessons" element={<PageWrapper><TeacherPublishLessons /></PageWrapper>} />
            <Route path="send-comments" element={<PageWrapper><TeacherSendComments /></PageWrapper>} />
            <Route path="view-content" element={<PageWrapper><TeacherViewContent /></PageWrapper>} />
            <Route path="chat" element={<PageWrapper><TeacherChat /></PageWrapper>} />
          </Route>


          <Route 
            path="guardian-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['guardian']}>
                <PageWrapper><GuardianDashboardPage /></PageWrapper>
              </ProtectedRoute>
            } 
          />

          <Route path="unauthorized" element={<PageWrapper><UnauthorizedPage /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}


function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;