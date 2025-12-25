import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import SignatureBuilder from './components/SignatureBuilder';
import MySignatures from './components/MySignatures';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import CookieConsent from './components/CookieConsent';
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

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <CookieConsent />
            <PageViewTracker />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/builder" element={<SignatureBuilder />} />
              <Route path="/my-signatures" element={<MySignatures />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
