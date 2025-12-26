import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGumroadCheckoutUrl } from '../services/gumroadService';
import UserMenu from './UserMenu';
import SEO from './SEO';
import './PremiumUpgrade.css';

function PremiumUpgrade() {
  const { currentUser, userProfile, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    // If user is logged in and not premium, automatically open Gumroad checkout
    // Only open once when userProfile is loaded and user is not premium
    if (currentUser && userProfile && !isPremium()) {
      const checkoutUrl = getGumroadCheckoutUrl(currentUser.email, true);
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userProfile, isPremium()]);

  const handleUpgrade = () => {
    if (!currentUser) {
      alert('Please sign in to upgrade to Premium');
      return;
    }

    setLoading(true);
    
    // Get Gumroad checkout URL with user's email pre-filled and wanted=true
    const checkoutUrl = getGumroadCheckoutUrl(currentUser.email, true);
    
    // Open Gumroad checkout in new window
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    
    setLoading(false);
  };

  const premiumFeatures = [
    {
      icon: '✨',
      title: 'Remove Watermarks',
      description: 'All your signatures will be completely unbranded and professional'
    },
    {
      icon: '📋',
      title: 'Copy HTML Code',
      description: 'One-click copy HTML code from your saved signatures'
    },
    {
      icon: '📥',
      title: 'Download PNG Without Watermark',
      description: 'Download high-quality PNG files without any branding'
    },
    {
      icon: '🎨',
      title: 'Premium Templates',
      description: 'Access to exclusive premium signature templates'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track signature performance and engagement'
    },
    {
      icon: '🔒',
      title: 'Priority Support',
      description: 'Get help faster with priority customer support'
    }
  ];

  const getExpiryDate = () => {
    if (!userProfile?.subscriptionExpiry) return null;
    const date = userProfile.subscriptionExpiry.toDate 
      ? userProfile.subscriptionExpiry.toDate() 
      : new Date(userProfile.subscriptionExpiry);
    return date.toLocaleDateString();
  };

  const referralLink = currentUser ? `${window.location.origin}/?ref=${currentUser.uid}` : '';
  const referralCount = userProfile?.referralCount || 0;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  if (isPremium()) {
    return (
      <div className="premium-upgrade-page">
        <SEO
          title="Premium Upgrade - FreelancerSignature"
          description="Upgrade to Premium and unlock watermark removal, HTML code copy, PNG downloads, and premium templates."
          canonical="https://freelancersignature.com/premium"
          ogTitle="Premium Upgrade - FreelancerSignature"
          ogDescription="Upgrade to Premium and unlock watermark removal, HTML code copy, PNG downloads, and premium templates."
        />
        
        <nav className="premium-nav">
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

        <div className="premium-container">
          <div className="premium-success">
            <div className="success-icon">⭐</div>
            <h1>You're a Premium Member!</h1>
            {getExpiryDate() && (
              <p className="premium-expiry">Your premium access is valid until <strong>{getExpiryDate()}</strong></p>
            )}
            <p>Thank you for your support. Enjoy all the professional features!</p>
            
            <div className="referral-reward-card">
              <h3>🎁 Get More Premium Days for Free!</h3>
              <p>For every 3 people you refer who sign up, we'll add <strong>7 more days</strong> to your premium subscription automatically!</p>
              
              <Link to="/referrals" className="btn-referral-page">
                Manage Referrals & Progress →
              </Link>
            </div>

            <div className="premium-features-grid">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="feature-card active">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-upgrade-page">
      <SEO
        title="Premium Upgrade - FreelancerSignature"
        description="Upgrade to Premium and unlock watermark removal, HTML code copy, PNG downloads, and premium templates."
        canonical="https://freelancersignature.com/premium"
        ogTitle="Premium Upgrade - FreelancerSignature"
        ogDescription="Upgrade to Premium and unlock watermark removal, HTML code copy, PNG downloads, and premium templates."
      />

      <nav className="premium-nav">
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

      <div className="premium-container">
        {/* Hero Section */}
        <div className="premium-hero">
          <div className="hero-badge">🚀 Upgrade to Premium</div>
          <h1 className="hero-title">
            Unlock the Full Power of
            <span className="gradient-text"> FreelancerSignature</span>
          </h1>
          <p className="hero-subtitle">
            Remove watermarks, copy HTML code, download PNGs, and access premium features
          </p>
        </div>

        {/* Pricing Card */}
        <div className="pricing-card">
          <div className="pricing-header">
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">2.99</span>
              <span className="period">/month</span>
            </div>
            <p className="pricing-subtitle">Adds 30 days of Premium • No commitment</p>
          </div>

          <button
            className="btn-upgrade"
            onClick={handleUpgrade}
            disabled={loading || !currentUser}
          >
            {loading ? 'Opening Checkout...' : 'Upgrade to Premium'}
          </button>

          {!currentUser && (
            <p className="auth-required">
              Please <a href="/">sign in</a> to upgrade
            </p>
          )}
        </div>

        {/* Referral Section for Free Users */}
        {currentUser && (
          <div className="referral-card-free">
            <div className="referral-badge">FREE PREMIUM</div>
            <h2>Don't want to pay? Get it for FREE!</h2>
            <p>
              Invite 3 friends to sign up and get <strong>7 days of Premium</strong> for free.
              You can do this as many times as you want!
            </p>
            
            <Link to="/referrals" className="btn-referral-page">
              Start Referring & Get Free PRO →
            </Link>
          </div>
        )}

        {/* Features Grid */}
        <div className="features-section">
          <h2 className="section-title">What You Get</h2>
          <div className="premium-features-grid">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Section */}
        <div className="comparison-section">
          <h2 className="section-title">Free vs Premium</h2>
          <div className="comparison-table">
            <div className="comparison-header">
              <div className="comparison-cell feature-name">Feature</div>
              <div className="comparison-cell free-plan">Free</div>
              <div className="comparison-cell premium-plan">Premium</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Create Signatures</div>
              <div className="comparison-cell free-plan">✅</div>
              <div className="comparison-cell premium-plan">✅</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Watermark Removal</div>
              <div className="comparison-cell free-plan">❌</div>
              <div className="comparison-cell premium-plan">✅</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Copy HTML Code</div>
              <div className="comparison-cell free-plan">❌</div>
              <div className="comparison-cell premium-plan">✅</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Download PNG</div>
              <div className="comparison-cell free-plan">With Watermark</div>
              <div className="comparison-cell premium-plan">No Watermark</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Premium Templates</div>
              <div className="comparison-cell free-plan">❌</div>
              <div className="comparison-cell premium-plan">✅</div>
            </div>
            <div className="comparison-row">
              <div className="comparison-cell feature-name">Priority Support</div>
              <div className="comparison-cell free-plan">❌</div>
              <div className="comparison-cell premium-plan">✅</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>Can I cancel anytime?</h3>
              <p>Yes! You can cancel your subscription at any time from your Gumroad account. Your premium access will continue until the end of your billing period.</p>
            </div>
            <div className="faq-item">
              <h3>What happens to my signatures if I cancel?</h3>
              <p>All your signatures remain saved. You'll just lose access to premium features like watermark removal and HTML copy after your subscription ends.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer refunds?</h3>
              <p>Yes, we offer a 7-day money-back guarantee. If you're not satisfied, contact us within 7 days of purchase for a full refund.</p>
            </div>
            <div className="faq-item">
              <h3>How do I access premium features after purchasing?</h3>
              <p>After your purchase is confirmed (usually within minutes), your account will automatically be upgraded to Premium. Just refresh the page!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumUpgrade;

