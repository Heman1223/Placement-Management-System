import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Super Admin Pages
import SuperAdminDashboard from './pages/superAdmin/Dashboard';
import Colleges from './pages/superAdmin/Colleges';
import AddCollege from './pages/superAdmin/AddCollege';
import CollegeDetail from './pages/superAdmin/CollegeDetail';
import CollegeAdmins from './pages/superAdmin/CollegeAdmins';
import Companies from './pages/superAdmin/Companies';
import AddCompany from './pages/superAdmin/AddCompany';
import SuperAdminStudents from './pages/superAdmin/Students';
import Users from './pages/superAdmin/Users';
import ActivityLogs from './pages/superAdmin/ActivityLogs';
import Settings from './pages/superAdmin/Settings';

// College Pages
import CollegeDashboard from './pages/college/Dashboard';
import Students from './pages/college/Students';
import StudentDetail from './pages/college/StudentDetail';
import StudentForm from './pages/college/StudentForm';
import BulkUpload from './pages/college/BulkUpload';
import Agencies from './pages/college/Agencies';
import Placements from './pages/college/Placements';
import CollegeActivityLogs from './pages/college/ActivityLogs';
import CollegeSettings from './pages/college/Settings';

// Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import Jobs from './pages/company/Jobs';
import JobForm from './pages/company/JobForm';
import SearchStudents from './pages/company/SearchStudents';
import Shortlist from './pages/company/Shortlist';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentJobs from './pages/student/Jobs';
import JobDetail from './pages/student/JobDetail';
import StudentApplications from './pages/student/Applications';
import StudentNotifications from './pages/student/Notifications';

// Utility Pages
import PendingApproval from './pages/PendingApproval';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Styles
import './styles/globals.css';

// Home redirect based on role
const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  switch (user?.role) {
    case 'super_admin': return <Navigate to="/admin" />;
    case 'college_admin': return <Navigate to="/college" />;
    case 'company': return <Navigate to="/company" />;
    case 'student': return <Navigate to="/student" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '8px'
            }
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Home Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Super Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="colleges" element={<Colleges />} />
            <Route path="colleges/new" element={<AddCollege />} />
            <Route path="colleges/:id" element={<CollegeDetail />} />
            <Route path="college-admins" element={<CollegeAdmins />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/new" element={<AddCompany />} />
            <Route path="students" element={<SuperAdminStudents />} />
            <Route path="users" element={<Users />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* College Admin Routes */}
          <Route path="/college" element={
            <ProtectedRoute allowedRoles={['college_admin']} requireApproval>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<CollegeDashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/new" element={<StudentForm />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="students/:id/edit" element={<StudentForm />} />
            <Route path="upload" element={<BulkUpload />} />
            <Route path="placements" element={<Placements />} />
            <Route path="agencies" element={<Agencies />} />
            <Route path="activity-logs" element={<CollegeActivityLogs />} />
            <Route path="settings" element={<CollegeSettings />} />
          </Route>

          {/* Company Routes */}
          <Route path="/company" element={
            <ProtectedRoute allowedRoles={['company']} requireApproval>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<CompanyDashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/:id/edit" element={<JobForm />} />
            <Route path="search" element={<SearchStudents />} />
            <Route path="shortlist" element={<Shortlist />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']} requireApproval>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="jobs" element={<StudentJobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="notifications" element={<StudentNotifications />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
