import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Sinh viên
import DashboardPage from './pages/DashboardPage';

// Giáo viên (BE role = "instructor", FE map thành "teacher")
import TeacherDashboardPage from './pages/TeacherDashboardPage';

// Admin
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <UserProvider>
          <Routes>
            {/* ── Public routes (không cần đăng nhập) ── */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── Sinh viên ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ── Giáo viên (BE "instructor" → FE "teacher") ── */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

