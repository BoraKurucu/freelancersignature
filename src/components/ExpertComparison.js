import React from 'react';
import './ExpertComparison.css';

function ExpertComparison() {
  return (
    <div className="expert-comparison">
      <h2>❌ Amateur vs ✅ Expert</h2>
      <p className="comparison-subtitle">
        Your current signature says: "I'm available"<br />
        Your signature SHOULD say: "I'm worth $150/hour"
      </p>

      <div className="comparison-grid">
        <div className="comparison-card amateur">
          <div className="card-header">
            <span className="badge bad">❌ Amateur</span>
            <h3>What You Have Now</h3>
          </div>
          <div className="signature-example">
            <div className="sig-line name">John Doe</div>
            <div className="sig-line title">Web Developer</div>
            <div className="sig-line email">john@example.com</div>
            <div className="sig-line link">linkedin.com/in/john</div>
          </div>
          <div className="card-problems">
            <div className="problem-item">❌ No portfolio showcase</div>
            <div className="problem-item">❌ No social proof</div>
            <div className="problem-item">❌ No booking link</div>
            <div className="problem-item">❌ No rates/services</div>
            <div className="problem-item">❌ No results/metrics</div>
          </div>
        </div>

        <div className="comparison-card expert">
          <div className="card-header">
            <span className="badge good">✅ Expert</span>
            <h3>What You Should Have</h3>
          </div>
          <div className="signature-example expert-sig">
            <div className="sig-line name">🚀 JOHN DOE | React Specialist</div>
            <div className="sig-line project">⚡ Just launched: E-commerce platform (+34% sales)</div>
            <div className="sig-line clients">💼 Clients: Amazon, Google, Startup Inc.</div>
            <div className="sig-line booking">📅 2 spots left → Book strategy call</div>
            <div className="sig-line testimonial">⭐ "Best developer we've worked with" - Former Client</div>
            <div className="sig-line links">GitHub | LinkedIn | Portfolio</div>
          </div>
          <div className="card-benefits">
            <div className="benefit-item">✅ Portfolio showcase with results</div>
            <div className="benefit-item">✅ Social proof & testimonials</div>
            <div className="benefit-item">✅ Smart booking CTAs</div>
            <div className="benefit-item">✅ Clear services & rates</div>
            <div className="benefit-item">✅ Results-driven messaging</div>
          </div>
        </div>
      </div>

      <div className="comparison-cta">
        <p className="cta-text">
          Stop looking like another freelancer.<br />
          <strong>Start looking like the expert you are.</strong>
        </p>
      </div>
    </div>
  );
}

export default ExpertComparison;





