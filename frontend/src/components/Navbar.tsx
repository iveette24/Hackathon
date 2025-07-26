import React, { useState } from 'react';
import type { User } from '../hooks/useAuth';
import './Navbar.css';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="bi bi-building me-2"></i>
          Portal del Ayuntamiento
        </a>
        
        <div className="navbar-nav ms-auto">
          <div className="nav-item dropdown-custom">
            <button
              className="nav-link dropdown-toggle user-dropdown"
              onClick={() => setShowDropdown(!showDropdown)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            >
              <i className="bi bi-person-circle me-2"></i>
              {user.name}
            </button>
            {showDropdown && (
              <ul className="dropdown-menu dropdown-menu-end show">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">{user.email}</small>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={onLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
