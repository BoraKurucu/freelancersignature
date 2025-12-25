import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem('cookieConsent');
    if (!consentGiven) {
      setShowBanner(true);
    } else {
      // Load saved consent preferences
      try {
        const savedConsent = JSON.parse(consentGiven);
        setConsent(savedConsent);
        updateGoogleConsent(savedConsent);
      } catch (e) {
        // If parsing fails, show banner again
        setShowBanner(true);
      }
    }
  }, []);

  const updateGoogleConsent = (consentState) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': consentState.analytics ? 'granted' : 'denied',
        'ad_storage': consentState.advertising ? 'granted' : 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    const newConsent = {
      analytics: true,
      advertising: true,
    };
    setConsent(newConsent);
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
    updateGoogleConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const newConsent = {
      analytics: false,
      advertising: false,
    };
    setConsent(newConsent);
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
    updateGoogleConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    updateGoogleConsent(consent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const toggleAnalytics = () => {
    setConsent(prev => ({ ...prev, analytics: !prev.analytics }));
  };

  const toggleAdvertising = () => {
    setConsent(prev => ({ ...prev, advertising: !prev.advertising }));
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        {!showSettings ? (
          <>
            <div className="cookie-consent-content">
              <h3>🍪 We use cookies</h3>
              <p>
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences.
              </p>
              <Link to="/cookies" className="cookie-policy-link">
                Learn more about our Cookie Policy
              </Link>
            </div>
            <div className="cookie-consent-buttons">
              <button 
                className="cookie-btn cookie-btn-reject" 
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button 
                className="cookie-btn cookie-btn-settings" 
                onClick={() => setShowSettings(true)}
              >
                Customize
              </button>
              <button 
                className="cookie-btn cookie-btn-accept" 
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-consent-content">
              <h3>Cookie Preferences</h3>
              <p>Choose which cookies you want to accept:</p>
              
              <div className="cookie-preference-item">
                <div className="cookie-preference-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={toggleAnalytics}
                    />
                    <span>Analytics Cookies</span>
                  </label>
                </div>
                <p className="cookie-preference-desc">
                  Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>

              <div className="cookie-preference-item">
                <div className="cookie-preference-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={consent.advertising}
                      onChange={toggleAdvertising}
                    />
                    <span>Advertising Cookies</span>
                  </label>
                </div>
                <p className="cookie-preference-desc">
                  Used to make advertising messages more relevant to you and your interests.
                </p>
              </div>

              <Link to="/cookies" className="cookie-policy-link">
                Learn more about our Cookie Policy
              </Link>
            </div>
            <div className="cookie-consent-buttons">
              <button 
                className="cookie-btn cookie-btn-reject" 
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button 
                className="cookie-btn cookie-btn-accept" 
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CookieConsent;

