import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import './index.css';

// Placeholder components for routing
const Placeholder = ({ title }) => (
  <div style={{ padding: '24px' }}>
    <h1>{title}</h1>
    <p>Under construction...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - All Users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<Placeholder title="Attendance" />} />
            <Route path="/timeoff" element={<Placeholder title="Time Off" />} />
            <Route path="/payroll" element={<Placeholder title="Payroll" />} />
          </Route>

          {/* HR & Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN']} />}>
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeForm />} />
            <Route path="/contracts" element={<Placeholder title="Contracts" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
