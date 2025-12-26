import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGumroadCheckoutUrl } from '../services/gumroadService';
import './UserMenu.css';

function UserMenu({ onSignInClick }) {
  const { currentUser, userProfile, logout, isFullyAuthenticated, isPremium } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  const handleUpgradeClick = () => {
    setIsDropdownOpen(false);
    if (currentUser && isFullyAuthenticated()) {
      const checkoutUrl = getGumroadCheckoutUrl(currentUser.email, true);
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    } else {
      // If not authenticated, trigger sign in first
      if (onSignInClick) {
        onSignInClick();
      }
    }
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

  const referralLink = `${window.location.origin}/?ref=${currentUser.uid}`;
  const referralCount = userProfile?.referralCount || 0;
  const nextMilestone = 3 - (referralCount % 3);

  const getExpiryDate = () => {
    if (!userProfile?.subscriptionExpiry) return null;
    const date = userProfile.subscriptionExpiry.toDate 
      ? userProfile.subscriptionExpiry.toDate() 
      : new Date(userProfile.subscriptionExpiry);
    return date.toLocaleDateString();
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

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
              <div className="plan-info">
                <span className={`plan-badge ${isPremium() ? 'premium' : 'free'}`}>
                  {isPremium() ? '⭐ Premium' : 'Free Plan'}
                </span>
                {isPremium() && getExpiryDate() && (
                  <span className="expiry-date">Expires: {getExpiryDate()}</span>
                )}
              </div>
            </div>
            
            <div className="dropdown-divider" />
            
            <Link 
              to="/referrals" 
              className="referral-section-link"
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="referral-section">
                <p className="referral-title">🎁 Refer & Get +7 Days</p>
                <div className="referral-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((referralCount % 3) / 3) * 100}%` }}
                    />
                  </div>
                  <p className="progress-text">{referralCount % 3}/3</p>
                </div>
                <p className="referral-hint">
                  Invite friends for free PRO access →
                </p>
              </div>
            </Link>

            <div className="dropdown-divider" />
            
            <Link 
              to="/my-signatures" 
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              📁 My Signatures
            </Link>
            
            {!isPremium() && (
              <button 
                className="dropdown-item upgrade"
                onClick={handleUpgradeClick}
              >
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

