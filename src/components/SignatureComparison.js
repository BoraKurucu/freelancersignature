import React, { useState } from 'react';
import './SignatureComparison.css';

function SignatureComparison({ currentSignature, expertSignature }) {
  const [viewMode, setViewMode] = useState('side-by-side'); // side-by-side, before-after

  return (
    <div className="signature-comparison">
      <h2>🔄 Before/After Comparison</h2>
      <p className="section-hint">
        See exactly how much better your signature looks
      </p>

      <div className="view-toggle">
        <button
          className={viewMode === 'side-by-side' ? 'active' : ''}
          onClick={() => setViewMode('side-by-side')}
        >
          Side by Side
        </button>
        <button
          className={viewMode === 'before-after' ? 'active' : ''}
          onClick={() => setViewMode('before-after')}
        >
          Before/After Toggle
        </button>
      </div>

      {viewMode === 'side-by-side' ? (
        <div className="comparison-grid">
          <div className="comparison-card amateur">
            <div className="card-label">❌ Before (Amateur)</div>
            <div className="signature-display">
              {currentSignature || (
                <div className="default-signature">
                  <div>John Doe</div>
                  <div>Web Developer</div>
                  <div>john@example.com</div>
                </div>
              )}
            </div>
          </div>
          <div className="comparison-card expert">
            <div className="card-label">✅ After (Expert)</div>
            <div className="signature-display">
              {expertSignature || (
                <div className="default-signature">
                  <div>🚀 JOHN DOE | React Specialist</div>
                  <div>⚡ Just launched: E-commerce platform (+34% sales)</div>
                  <div>💼 Clients: Amazon, Google</div>
                  <div>📅 2 spots left → Book strategy call</div>
                  <div>⭐ "Best developer we've worked with"</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="before-after-container">
          <div className="before-after-toggle">
            <button className="before-btn">Before</button>
            <button className="after-btn">After</button>
          </div>
          <div className="signature-display">
            {currentSignature || expertSignature}
          </div>
        </div>
      )}

      <div className="comparison-stats">
        <div className="stat-item">
          <div className="stat-value">+340%</div>
          <div className="stat-label">More Professional</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">+250%</div>
          <div className="stat-label">More Credible</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">+180%</div>
          <div className="stat-label">More Likely to Convert</div>
        </div>
      </div>
    </div>
  );
}

export default SignatureComparison;





