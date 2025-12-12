import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGumroadCheckoutUrl } from '../services/gumroadService';
import './PremiumUpgrade.css';

function PremiumUpgrade() {
  const { currentUser, isPremium } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleUpgrade = () => {
    if (!currentUser) {
      alert('Please sign in to upgrade to Premium');
      return;
    }

    setLoading(true);
    
    // Get Gumroad checkout URL with user's email pre-filled
    const checkoutUrl = getGumroadCheckoutUrl(currentUser.email);
    
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

  if (isPremium()) {
    return (
      <div className="premium-upgrade-page">
        <div className="premium-container">
          <div className="premium-success">
            <div className="success-icon">⭐</div>
            <h1>You're Already Premium!</h1>
            <p>Thank you for being a Premium member. Enjoy all the premium features!</p>
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
              <span className="amount">4.99</span>
              <span className="period">/month</span>
            </div>
            <p className="pricing-subtitle">Cancel anytime • No commitment</p>
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

