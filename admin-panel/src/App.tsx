import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import BookingsPage from './pages/BookingsPage'
import CruisesPage from './pages/CruisesPage'
import CruiseCategoriesPage from './pages/CruiseCategoriesPage'
import HotelsPage from './pages/HotelsPage'
import PackagesPage from './pages/PackagesPage'
import MediaLibraryPage from './pages/MediaLibraryPage'
import HRDashboardPage from './pages/hr/HRDashboardPage'
import EmployeesPage from './pages/hr/EmployeesPage'
import AttendancePage from './pages/hr/AttendancePage'
import LeaveRequestsPage from './pages/hr/LeaveRequestsPage'
import PayrollPage from './pages/hr/PayrollPage'
import ReportsPage from './pages/hr/ReportsPage'
import HRLayout from './components/hr/HRLayout'
import SystemSettingsPage from './pages/SystemSettingsPage'
import AdminContentPage from './pages/AdminContentPage'
import AdminOverviewPage from './pages/AdminOverviewPage'
import APITestingPage from './pages/APITestingPage'
import BlogPage from './pages/BlogPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route index element={<Navigate to="/login" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cruises"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <CruisesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cruise-categories"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <CruiseCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="hotels"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <HotelsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="packages"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <PackagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr/*"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER']}>
              <HRLayout>
                <Routes>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<HRDashboardPage />} />
                  <Route path="employees" element={<EmployeesPage />} />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="leave-requests" element={<LeaveRequestsPage />} />
                  <Route path="payroll" element={<PayrollPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Routes>
              </HRLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="media"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <MediaLibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="content"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="blog"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <BlogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <SystemSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="api-testing"
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN']}>
              <APITestingPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  )
}

export default App