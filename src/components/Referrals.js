import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import SEO from './SEO';
import './Referrals.css';

function Referrals() {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading || !currentUser) {
    return (
      <div className="referrals-page loading">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/?ref=${currentUser.uid}`;
  const referralCount = userProfile?.referralCount || 0;
  const milestone = 3;
  const progress = referralCount % milestone;
  const needed = milestone - progress;
  const totalRewards = Math.floor(referralCount / milestone);

  const getDaysLeft = () => {
    if (!userProfile?.subscriptionExpiry) return 0;
    const expiryDate = userProfile.subscriptionExpiry.toDate 
      ? userProfile.subscriptionExpiry.toDate() 
      : new Date(userProfile.subscriptionExpiry);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="referrals-page">
      <SEO 
        title="Referral Program - FreelancerSignature"
        description="Invite friends and get free Premium access to FreelancerSignature."
      />

      <nav className="referrals-nav">
        <div className="nav-container">
          <Link to="/builder" className="nav-logo">
            <span className="logo-icon">✒️</span>
            <span className="logo-text">FreelancerSignature</span>
          </Link>
          <div className="nav-actions">
            <Link to="/builder" className="nav-back-link">← Back to Builder</Link>
            <UserMenu />
          </div>
        </div>
      </nav>
      
      <div className="referrals-container">
        <header className="referrals-header">
          <h1>🎁 Referral Program</h1>
          <p>Spread the word and get rewarded with free Premium access!</p>
        </header>

        <div className="referral-main-card">
          <div className="reward-banner">
            <span className="reward-icon">⭐</span>
            <div className="reward-text">
              <h3>Get 7 Days of Premium</h3>
              <p>For every 3 friends who sign up using your link.</p>
            </div>
          </div>

          <div className="referral-link-section">
            <label>Your Unique Referral Link</label>
            <div className="link-copy-box">
              <input type="text" readOnly value={referralLink} />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`} 
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card premium-days">
              <span className="stat-value">{daysLeft}</span>
              <span className="stat-label">Premium Days Left</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{referralCount}</span>
              <span className="stat-label">Total Referrals</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{progress}/{milestone}</span>
              <span className="stat-label">Next Reward</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Progress to next reward</span>
              <span>{Math.round((progress / milestone) * 100)}%</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(progress / milestone) * 100}%` }}
              ></div>
            </div>
            <p className="progress-hint">
              Just <strong>{needed}</strong> more friend{needed > 1 ? 's' : ''} to get another 7 days!
            </p>
          </div>
        </div>

        <section className="how-it-works">
          <h2>How it works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Share your link</h3>
              <p>Send your unique link to friends, colleagues, or share it on social media.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>They sign up</h3>
              <p>When someone creates a free account using your link, it counts towards your goal.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Get Rewarded</h3>
              <p>Every 3 successful signups automatically adds 7 days of Premium to your account.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Referrals;

