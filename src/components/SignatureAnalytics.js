import React from 'react';
import './SignatureAnalytics.css';

function SignatureAnalytics({ signatureData }) {
  // Count clickable elements
  const clickableElements = [];
  if (signatureData.email) clickableElements.push('Email');
  if (signatureData.phone) clickableElements.push('Phone');
  if (signatureData.website) clickableElements.push('Website');
  if (signatureData.calendlyLink) clickableElements.push('Booking Link');
  if (signatureData.projectUrls && signatureData.projectUrls.filter(url => url).length > 0) {
    clickableElements.push('Portfolio Links');
  }
  if (signatureData.linkedin) clickableElements.push('LinkedIn');
  if (signatureData.twitter) clickableElements.push('Twitter');
  if (signatureData.github) clickableElements.push('GitHub');
  if (signatureData.portfolio) clickableElements.push('Portfolio');

  const totalCTAs = clickableElements.length;
  const estimatedClicks = totalCTAs * 2.5; // Average clicks per signature

  return (
    <div className="signature-analytics">
      <h2>📊 Signature Analytics</h2>
      <p className="section-hint">
        Track which links get the most clicks (Premium feature)
      </p>

      <div className="analytics-overview">
        <div className="analytics-card">
          <div className="analytics-value">{totalCTAs}</div>
          <div className="analytics-label">Clickable Elements</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-value">~{estimatedClicks}</div>
          <div className="analytics-label">Est. Clicks/Month*</div>
        </div>
        <div className="analytics-card highlight">
          <div className="analytics-value">🔥</div>
          <div className="analytics-label">Hot Links</div>
        </div>
      </div>

      <div className="clickable-list">
        <h3>Your Clickable Elements:</h3>
        <div className="elements-grid">
          {clickableElements.map((element, index) => (
            <div key={index} className="element-badge">
              {element}
            </div>
          ))}
        </div>
        {clickableElements.length === 0 && (
          <p className="no-elements">Add links to track clicks</p>
        )}
      </div>

      <div className="analytics-note">
        <strong>💡 Premium Feature:</strong> Upgrade to track actual clicks, see which links convert best, and optimize your signature for maximum engagement.
      </div>

      <div className="analytics-benefits">
        <h3>Why Track Clicks?</h3>
        <ul>
          <li>✓ See which portfolio projects get the most interest</li>
          <li>✓ Optimize your booking link placement</li>
          <li>✓ A/B test different CTAs</li>
          <li>✓ Understand what clients care about most</li>
        </ul>
      </div>
    </div>
  );
}

export default SignatureAnalytics;


