import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminNotices from './pages/admin/AdminNotices';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyClasses from './pages/faculty/FacultyClasses';
import FacultyAvailableClasses from './pages/faculty/FacultyAvailableClasses';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyMarks from './pages/faculty/FacultyMarks';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentMarks from './pages/student/StudentMarks';
import StudentMaterials from './pages/student/StudentMaterials';
import FacultyMaterials from './pages/faculty/FacultyMaterials';
import SettingsPage from './pages/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/courses" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <AdminCourses />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/notices" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <AdminNotices />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/enrollments" element={
                        <ProtectedRoute allowedRoles={['Admin']}>
                            <AdminEnrollments />
                        </ProtectedRoute>
                    } />

                    <Route path="/faculty" element={
                        <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                            <FacultyDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/faculty/classes" element={
                        <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                            <FacultyClasses />
                        </ProtectedRoute>
                    } />
                    <Route path="/faculty/available-classes" element={
                        <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                            <FacultyAvailableClasses />
                        </ProtectedRoute>
                    } />
                    <Route path="/faculty/attendance" element={
                        <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                            <FacultyAttendance />
                        </ProtectedRoute>
                    } />
                    <Route path="/faculty/marks" element={
                        <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                            <FacultyMarks />
                        </ProtectedRoute>
                    } />
                    <Route path="/faculty/materials" element={
                        <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                            <FacultyMaterials />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/student" element={
                        <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/student/attendance" element={
                        <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                            <StudentAttendance />
                        </ProtectedRoute>
                    } />
                    <Route path="/student/marks" element={
                        <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                            <StudentMarks />
                        </ProtectedRoute>
                    } />
                    <Route path="/student/materials" element={
                        <ProtectedRoute allowedRoles={['Student', 'Admin']}>
                            <StudentMaterials />
                        </ProtectedRoute>
                    } />

                    <Route path="/settings" element={
                        <ProtectedRoute allowedRoles={['Admin', 'Faculty', 'Student']}>
                            <SettingsPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
