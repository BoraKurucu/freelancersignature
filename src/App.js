import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import SignatureBuilder from './components/SignatureBuilder';
import MySignatures from './components/MySignatures';
import PremiumUpgrade from './components/PremiumUpgrade';
import Referrals from './components/Referrals';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import CookieConsent from './components/CookieConsent';
import Toast from './components/Toast';
import { useAuth } from './context/AuthContext';
import './App.css';

// Track page views for Google Ads conversion
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-708514143/7rzLCMn2nNYbEN-i7NEC',
        'value': 1.0,
        'currency': 'TRY'
      });
    }
  }, [location.pathname]);

  return null;
}

// Track referral ID from URL
function ReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referralId', ref);
      console.log('🔗 Referral ID captured:', ref);
    }
  }, [location]);

  return null;
}

function AppContent() {
  const { showReferralToast, setShowReferralToast } = useAuth();

  return (
    <div className="App">
      <CookieConsent />
      <PageViewTracker />
      <ReferralTracker />
      
      {showReferralToast && (
        <Toast 
          message="🎁 Referral successful! You've helped a friend. Once 3 friends join, you'll get 7 days of Premium!"
          type="success"
          onClose={() => setShowReferralToast(false)}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<SignatureBuilder />} />
        <Route path="/my-signatures" element={<MySignatures />} />
        <Route path="/premium" element={<PremiumUpgrade />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
