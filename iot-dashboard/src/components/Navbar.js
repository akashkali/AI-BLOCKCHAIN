import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
// import { FaBell, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
// import logo from '../assets/logo.svg';

// Dummy context for user/role (replace with real context/provider)
const UserContext = React.createContext({
    user: { name: 'Admin', role: 'admin' },
    isAuthenticated: true,
    logout: () => {},
});

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/threat-logs', label: 'Threat Logs' },
        { to: '/blockchain', label: 'Blockchain' },
    ];
    if (user && user.role === 'admin') {
        navLinks.push({ to: '/admin', label: 'Admin Panel' });
    }
    navLinks.push({ to: '/profile', label: 'Profile' });

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
            <div className="container-fluid">
                {/* Branding */}
                <Link className="navbar-brand fw-bold" to="/dashboard">
                    SecureChain <span className="badge bg-primary ms-1">AI</span>
                </Link>
                <span className="badge bg-success ms-2">OPERATIONAL</span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    {navLinks.map(link => (
                            <li className="nav-item" key={link.to}>
                        <Link
                            to={link.to}
                                    className={`nav-link${location.pathname === link.to ? ' active fw-bold' : ''}`}
                        >
                            {link.label}
                        </Link>
                            </li>
                    ))}
                    </ul>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-light small fw-medium me-3">{user?.role ? `${user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}` : ''} ({user?.role})</span>
                        {user ? (
                            <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
                    ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                    )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 