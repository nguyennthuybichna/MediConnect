import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import PrescriptionPrototype from './pages/PrescriptionPrototype';

import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import MedicalHistory from './pages/patient/MedicalHistory';
import AITriage from './pages/patient/AITriage';
import AppointmentBooking from './pages/patient/AppointmentBooking';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import MedicalScreen from './pages/doctor/MedicalScreen';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRecords from './pages/admin/AdminRecords';

import ProtectedRoute from './components/protected/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/prescription-prototype" element={<PrescriptionPrototype />} />

          <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />
          <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><MedicalHistory /></ProtectedRoute>} />
          <Route path="/patient/triage" element={<ProtectedRoute allowedRoles={['patient']}><AITriage /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><AppointmentBooking /></ProtectedRoute>} />

          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><MedicalScreen /></ProtectedRoute>} />
          <Route path="/doctor/old-dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/records" element={<ProtectedRoute allowedRoles={['admin']}><AdminRecords /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
