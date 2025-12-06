import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt, FaFingerprint } from 'react-icons/fa';
import { useAuth } from '../utils/auth'; // ✅ useAuth context
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth(); // ✅ login function from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'biometric'

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('/api/login', {
        email,
        password: authMethod === 'biometric' ? 'biometric_auth' : password
      });

      if (response.data.token && response.data.role) {
        login(response.data.token, response.data.role); // ✅ use context login()
        navigate(response.data.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = () => {
    // Simulate biometric auth (for demo)
    setAuthMethod('biometric');
    setError('');
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 1000);
  };

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="security-badge">
        <FaShieldAlt className="shield-icon" />
        <span>Secure Authentication</span>
      </div>

      <motion.div
        className="login-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="login-header">
          <div className="auth-icon">
            {authMethod === 'biometric' ? <FaFingerprint /> : <FaLock />}
          </div>
          <h2>SecureChain AI Login</h2>
          <p>Access your threat detection dashboard</p>
        </div>

        {error && (
          <motion.div className="alert alert-danger" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span><FaEnvelope /> Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                disabled={authMethod === 'biometric'}
              />
            </label>
          </div>

          {authMethod === 'password' && (
            <div className="form-group">
              <label>
                <span><FaLock /> Password</span>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>
            </div>
          )}

          <motion.button
            type="submit"
            className="login-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              authMethod === 'biometric' ? 'Verify Biometrics' : 'Login Securely'
            )}
          </motion.button>

          <div className="auth-method-toggle">
            <button
              type="button"
              className={`method-btn ${authMethod === 'password' ? 'active' : ''}`}
              onClick={() => setAuthMethod('password')}
            >
              <FaLock /> Password
            </button>
            <button
              type="button"
              className={`method-btn ${authMethod === 'biometric' ? 'active' : ''}`}
              onClick={handleBiometricAuth}
            >
              <FaFingerprint /> Biometric
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/register')}>
              Create one
            </button>
          </p>
          <p className="security-info">
            <FaShieldAlt /> All logins are blockchain-verified and encrypted
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
