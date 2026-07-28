import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import CreateCollege from './pages/CreateCollege';
import EditCollege from './pages/EditCollege';
import AllColleges from './pages/AllColleges';
import CollegeDetails from './pages/CollegeDetails';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import AllAdmins from './pages/AllAdmins';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Login - outside Layout (no sidebar/header) */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - inside Layout */}
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-college" element={<CreateCollege />} />
                <Route path="/edit-college/:id" element={<EditCollege />} />
                <Route path="/all-colleges" element={<AllColleges />} />
                <Route path="/college-details/:id" element={<CollegeDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/all-admins" element={<AllAdmins />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
