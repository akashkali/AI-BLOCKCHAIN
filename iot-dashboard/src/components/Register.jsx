import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserShield, FaEye, FaEyeSlash, FaFingerprint } from "react-icons/fa";
import { RiShieldKeyholeFill } from "react-icons/ri";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await axios.post("/register", formData);
      if (res.data.message === "User registered successfully") {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="register-container"
    >
      <div className="security-badge">
        <RiShieldKeyholeFill className="shield-icon" />
        <span>Secure Registration</span>
      </div>

      <motion.div 
        className="register-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="register-header">
          <FaUserShield className="user-icon" />
          <h2>Create Secure Account</h2>
          <p>Join our decentralized threat detection network</p>
        </div>

        {error && (
          <motion.div 
            className="alert alert-danger"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        {success ? (
          <motion.div
            className="success-message"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="success-checkmark">✓</div>
            <h3>Registration Successful!</h3>
            <p>You'll be redirected to login shortly</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <span>Full Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </label>
            </div>

            <div className="form-group password-group">
              <label>
                <span>Password</span>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create secure password"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="password-strength">
                  <div className={`strength-bar ${formData.password.length > 0 ? "weak" : ""}`}></div>
                  <div className={`strength-bar ${formData.password.length >= 4 ? "medium" : ""}`}></div>
                  <div className={`strength-bar ${formData.password.length >= 8 ? "strong" : ""}`}></div>
                </div>
              </label>
            </div>

            <div className="form-group role-selector">
              <label>
                <span>Account Type</span>
                <div className="role-options">
                  <button
                    type="button"
                    className={`role-option ${formData.role === "user" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, role: "user" })}
                  >
                    <FaUserShield />
                    <span>Standard User</span>
                  </button>
                  <button
                    type="button"
                    className={`role-option ${formData.role === "admin" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, role: "admin" })}
                  >
                    <FaFingerprint />
                    <span>Administrator</span>
                  </button>
                </div>
              </label>
            </div>

            <motion.button
              type="submit"
              className="register-button"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="spinner"></span>
              ) : (
                "Create Secure Account"
              )}
            </motion.button>

            <div className="login-redirect">
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </div>
          </form>
        )}

        <div className="security-features">
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <span>End-to-end encryption</span>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <span>Blockchain verified</span>
          </div>
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <span>AI-powered security</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Register;