// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(localStorage.getItem('role'));
  }, []);

  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="home-hero">
        <FaShieldAlt className="hero-icon" />
        <h1>Welcome to SecureChain AI</h1>
        <p>Your AI-driven blockchain-secured IoT environment</p>

        {role ? (
          <Link to={role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}>
            <motion.button
              className="primary-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Dashboard
            </motion.button>
          </Link>
        ) : (
          <div className="auth-buttons">
            <Link to="/login">
              <motion.button
                className="primary-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaLock /> Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                className="secondary-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Register
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Home;
