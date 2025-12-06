import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AttackLogs from './components/Dashboard/AttackLogs';
import SimulatorControl from './components/SimulatorControl';
import LiveTracking from './pages/LiveTracking';
import ManageDevices from './pages/ManageDevices';
import { AuthProvider, useAuth } from './utils/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import ThreatLogs from './components/AttackLogs.jsx';
import BlockchainExplorer from './components/BlockchainExplorer.jsx';
import UserManagement from './components/UserManagement';
import AnomalyInjection from './components/AnomalyInjection';
import AdminPanel from './components/AdminPanel';

// Placeholder pages
const Blockchain = () => <div className="p-4">Blockchain Explorer Page (Coming Soon)</div>;
const Profile = () => <div className="p-4">User Profile Page (Coming Soon)</div>;

// Minimal Navbar for login/register
const BasicNavbar = () => (
  <nav className="navbar navbar-dark bg-dark px-3">
    <span className="navbar-brand mb-0 h1">SecureChain <span className="badge bg-primary ms-1">AI</span></span>
  </nav>
);

// PrivateRoute component
const PrivateRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/user-dashboard" />;
  if (userOnly && user.role !== 'user') return <Navigate to="/admin" />;
  return children;
    };

const AppRoutes = () => {
  const { user, logout } = useAuth();
    return (
                <Routes>
      <Route path="/login" element={
        <>
          <BasicNavbar />
          <Login />
        </>
      } />
      <Route path="/register" element={
        <>
          <BasicNavbar />
          <Register />
        </>
      } />
      {/* Admin routes */}
                    <Route path="/admin" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        </>
      } />
      {/* User routes */}
      <Route path="/user-dashboard" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute userOnly>
            <UserDashboard />
          </PrivateRoute>
        </>
      } />
      <Route path="/attack-logs" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute>
            <AttackLogs />
          </PrivateRoute>
        </>
      } />
      <Route path="/profile" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        </>
      } />
      <Route path="/simulator" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute adminOnly>
            <div className="container mt-4">
              <SimulatorControl />
            </div>
          </PrivateRoute>
        </>
      } />
      <Route path="/live-tracking" element={<LiveTracking />} />
      <Route path="/manage-devices" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute adminOnly>
            <ManageDevices />
          </PrivateRoute>
        </>
      } />
      <Route path="/threat-logs" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute>
            <ThreatLogs />
          </PrivateRoute>
        </>
      } />
      <Route path="/blockchain-explorer" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute adminOnly>
            <BlockchainExplorer />
          </PrivateRoute>
        </>
                    } />
      <Route path="/user-management" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute adminOnly>
            <UserManagement />
          </PrivateRoute>
        </>
      } />
      <Route path="/anomaly-injection" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute adminOnly>
            <AnomalyInjection />
          </PrivateRoute>
        </>
      } />
      <Route path="/admin-panel" element={
        <>
          <Navbar logout={logout} />
          <PrivateRoute adminOnly>
            <AdminPanel />
          </PrivateRoute>
        </>
      } />
                    {/* Default route */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? "/admin-panel" : "/user-dashboard") : "/login"} />} />
                </Routes>
  );
};

const App = () => {
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const socket = io(API_URL);
    socket.on('anomaly_alert', (data) => {
      toast.error(
        `🚨 Anomaly Detected! Device: ${data.deviceId}, Type: ${data.anomalyType}, Time: ${new Date(data.timestamp * 1000).toLocaleTimeString()}`,
        { position: 'top-right', autoClose: 8000 }
      );
    });
    return () => socket.disconnect();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer />
            </Router>
    </AuthProvider>
    );
};

export default App; 