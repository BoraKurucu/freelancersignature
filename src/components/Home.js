import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Freelancer Email Signature</h1>
        <p className="home-subtitle">
          Create professional email signatures in seconds. Perfect for freelancers who want to make a great first impression.
        </p>
        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick & Easy</h3>
            <p>Build your signature in minutes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Professional Design</h3>
            <p>Beautiful templates for every style</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>Save & Manage</h3>
            <p>Store multiple signatures</p>
          </div>
        </div>
        <Link to="/builder" className="cta-button">
          Create Your Signature
        </Link>
      </div>
    </div>
  );
}

export default Home;

