import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

function UserMenu({ onSignInClick }) {
  const { currentUser, logout, isFullyAuthenticated, isPremium } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  const handleUpgradeClick = () => {
    setIsDropdownOpen(false);
    navigate('/premium');
  };

  if (!currentUser) {
    return (
      <button className="user-menu-signin" onClick={onSignInClick}>
        Sign In
      </button>
    );
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  const photoURL = currentUser.photoURL;
  const isVerified = isFullyAuthenticated();

  return (
    <div className="user-menu">
      <button 
        className="user-menu-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {photoURL ? (
          <img src={photoURL} alt={displayName} className="user-avatar" />
        ) : (
          <div className="user-avatar-placeholder">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="user-name">{displayName}</span>
        {isPremium() && <span className="premium-badge">PRO</span>}
        <svg 
          className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div className="dropdown-backdrop" onClick={() => setIsDropdownOpen(false)} />
          <div className="user-dropdown">
            <div className="dropdown-header">
              <p className="dropdown-email">{currentUser.email}</p>
              {!isVerified && (
                <span className="unverified-badge">Email not verified</span>
              )}
              <span className={`plan-badge ${isPremium() ? 'premium' : 'free'}`}>
                {isPremium() ? '⭐ Premium' : 'Free Plan'}
              </span>
            </div>
            
            <div className="dropdown-divider" />
            
            <Link 
              to="/my-signatures" 
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              📁 My Signatures
            </Link>
            
            {!isPremium() && (
              <button className="dropdown-item upgrade" onClick={handleUpgradeClick}>
                🚀 Upgrade to Premium
              </button>
            )}
            
            <div className="dropdown-divider" />
            
            <button className="dropdown-item signout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserMenu;

