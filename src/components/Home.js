import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignaturePreview from './SignaturePreview';
import AuthModal from './AuthModal';
import { sampleProfiles } from '../utils/templates';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { currentUser, signInWithGoogle } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthModalMode] = useState('signin');
  const navigate = useNavigate();

  const openSignUp = (e) => {
    e.preventDefault();
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/builder');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  // Best 4 freelancer samples to showcase
  const featuredSamples = [
    { key: 'jasmineDesigner', label: 'UI/UX Designer', icon: '👩‍🎨' },
    { key: 'edwardConsultant', label: 'Business Consultant', icon: '💼' },
    { key: 'andieOwner', label: 'Creative Director', icon: '✨' },
    { key: 'jennyDev', label: 'Web Developer', icon: '💻' },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">⚡</span>
            <span>The Only Email Signature Generator Built for Freelancers</span>
          </div>
          
          <h1 className="hero-title">
            Email Signatures That
            <span className="gradient-text"> Win Clients</span>
          </h1>

          <div className="hero-cta">
            <Link to="/builder" className="btn-primary-large">
              Create Your Freelancer Signature
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            {!currentUser && (
              <div className="hero-auth-row">
                <button onClick={handleGoogleSignIn} className="btn-google-home">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <p className="cta-subtext">
                  Free • 2 minutes • <button onClick={openSignUp} className="home-signup-btn">Sign up with email</button>
                </p>
              </div>
            )}
            {currentUser && (
              <p className="cta-subtext">
                Free • 2 minutes • No signup required
              </p>
            )}
          </div>

          {currentUser && (
            <div className="home-referral-mini">
              <Link to="/referrals" className="referral-mini-link">
                🎁 <strong>Get Free Premium:</strong> Invite 3 friends and get 7 days of PRO features! <span>Learn more →</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sample Signatures Section - MOVED UP */}
      <div className="samples-section">
        <div className="container">
          <h2 className="section-title">Signatures Made for Freelancers</h2>
          <p className="section-subtitle">Real templates for real freelancers. Pick one and customize it.</p>
          
          <div className="samples-grid">
            {featuredSamples.map(sample => {
              const profile = sampleProfiles[sample.key];
              if (!profile) return null;
              return (
                <div key={sample.key} className="sample-card">
                  <div className="sample-label">{sample.icon} {sample.label}</div>
                  <div className="sample-preview">
                    <SignaturePreview signatureData={profile} showWatermark={false} />
                  </div>
                  <Link 
                    to="/builder" 
                    state={{ loadProfile: sample.key }}
                    className="sample-use-btn"
                  >
                    Use This Template →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Freelancers Section - MOVED DOWN */}
      <div className="why-section">
        <div className="container">
          <h2 className="section-title">Why Regular Signatures Don't Work for Freelancers</h2>
          <div className="comparison-grid">
            <div className="comparison-card bad">
              <div className="card-header">❌ Generic Signatures</div>
              <ul>
                <li>Just name and email</li>
                <li>No call-to-action</li>
                <li>Clients don't know your rates</li>
                <li>No way to book you</li>
                <li>Blend in with everyone else</li>
              </ul>
            </div>
            <div className="comparison-card good">
              <div className="card-header">✅ Freelancer Signatures</div>
              <ul>
                <li>Show your specialty & expertise</li>
                <li>Display hourly/project rates</li>
                <li>Include booking calendar link</li>
                <li>Link to portfolio/case studies</li>
                <li>Professional & memorable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Built Specifically for Freelancers</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Rate Display</h3>
              <p>Show your hourly or project rates right in your signature. Filter out bad-fit clients.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Booking Links</h3>
              <p>Connect Calendly or Cal.com. Let clients book discovery calls directly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Portfolio Links</h3>
              <p>Showcase your Dribbble, GitHub, Behance, or personal portfolio.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Availability Status</h3>
              <p>Show "Taking new clients" or "Booked until April" to set expectations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Social Icons</h3>
              <p>Clickable icons for LinkedIn, Instagram, Twitter, and more.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Looks great on Gmail, Outlook, Apple Mail, and mobile devices.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Freelancers Love It</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Finally, a signature that shows I'm a pro, not just another freelancer."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">S</div>
                <div>
                  <div className="author-name">Sarah Chen</div>
                  <div className="author-role">UI/UX Designer</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Clients now book calls directly from my emails. Game changer."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">M</div>
                <div>
                  <div className="author-name">Mike Johnson</div>
                  <div className="author-role">Web Developer</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Showing my rates filters out the 'what's your budget?' conversations."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div>
                  <div className="author-name">Alex Rivera</div>
                  <div className="author-role">Marketing Consultant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Look Like a Pro?</h2>
          <p className="cta-subtitle">Create your freelancer signature in 2 minutes. Free forever.</p>
          <Link to="/builder" className="btn-primary-large">
            Create Your Signature Free
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <Link to="/terms">Terms of Service</Link>
            <span className="footer-dot">•</span>
            <Link to="/privacy">Privacy Policy</Link>
            <span className="footer-dot">•</span>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
          <p className="footer-copyright">© 2025 FreelancerSignature. All rights reserved.</p>
        </div>
      </footer>

      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={() => navigate('/builder')}
          initialMode={authMode}
        />
      )}
    </div>
  );
}

export default Home;
