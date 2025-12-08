import React from 'react';
import { Link } from 'react-router-dom';
import SignaturePreview from './SignaturePreview';
import { sampleProfiles } from '../utils/templates';
import './Home.css';

function Home() {
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
            <span>The Only Signature Generator Built for Freelancers</span>
          </div>
          
          <h1 className="hero-title">
            Email Signatures That
            <span className="gradient-text"> Win Clients</span>
          </h1>
          
          <p className="hero-subtitle">
            Stop blending in. Show your rates, booking links, and portfolio<br />
            in every email. Get more clients without extra work.
          </p>

          <div className="hero-features">
            <div className="feature-pill">💰 Show Your Rates</div>
            <div className="feature-pill">📅 Booking Links</div>
            <div className="feature-pill">🎨 Portfolio Links</div>
            <div className="feature-pill">✅ Availability Status</div>
          </div>

          <div className="hero-cta">
            <Link to="/builder" className="btn-primary-large">
              Create Your Freelancer Signature
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <p className="cta-subtext">
              Free • 2 minutes • No signup required
            </p>
          </div>
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
                    <SignaturePreview signatureData={profile} />
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
    </div>
  );
}

export default Home;
