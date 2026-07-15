import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateCollege from './pages/CreateCollege';
import AllColleges from './pages/AllColleges';
import CollegeDetails from './pages/CollegeDetails';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import AllAdmins from './pages/AllAdmins';
import ActiveColleges from './pages/ActiveColleges';
import InactiveColleges from './pages/InactiveColleges';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login - outside Layout (no sidebar/header) */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - inside Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-college" element={<CreateCollege />} />
              <Route path="/all-colleges" element={<AllColleges />} />
              <Route path="/active-colleges" element={<ActiveColleges />} />
              <Route path="/inactive-colleges" element={<InactiveColleges />} />
              <Route path="/college-details" element={<CollegeDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/all-admins" element={<AllAdmins />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
