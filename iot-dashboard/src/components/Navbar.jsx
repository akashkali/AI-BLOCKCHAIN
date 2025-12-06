// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaShieldAlt,
  FaChartLine,
  FaListAlt,
  FaLink,
  FaUserCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../utils/auth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      path: '/user-dashboard',
      name: 'Dashboard',
      icon: <FaChartLine />,
      roles: ['user', 'admin'],
    },
    {
      path: '/threat-logs',
      name: 'Threat Logs',
      icon: <FaListAlt />,
      roles: ['user', 'admin'],
    },
    {
      path: '/blockchain-explorer',
      name: 'Blockchain',
      icon: <FaLink />,
      roles: ['admin'],
    },
    {
      path: '/admin-panel',
      name: 'Admin Panel',
      icon: <FaUserCog />,
      roles: ['admin'],
    },
    {
      path: '/manage-devices',
      name: 'Manage Devices',
      icon: <FaUserCog />,
      roles: ['admin'],
    },
  ];

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="brand-wrapper"
          >
            <FaShieldAlt className="brand-icon" />
            <span>SecureChain</span>
            <span className="ai-badge">AI</span>
          </motion.div>
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              {navLinks.map(
                (link) =>
                  link.roles.includes(user.role) && (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`nav-link ${
                        location.pathname === link.path ? 'active' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  )
              )}
              {user.role === 'admin' && (
                <Link
                  to="/simulator"
                  className={`nav-link ${location.pathname === '/simulator' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaChartLine />
                  <span>Simulator</span>
                </Link>
              )}
              <Link
                to="/live-tracking"
                className={`nav-link ${location.pathname === '/live-tracking' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaChartLine />
                <span>Live Tracking</span>
              </Link>
              <motion.button
                className="logout-button"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </motion.button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
