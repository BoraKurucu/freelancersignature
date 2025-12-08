import React, { useState } from 'react';
import './ABTesting.css';

function ABTesting({ signatureData, onVariantSelect }) {
  const [selectedVariants, setSelectedVariants] = useState(['A', 'B']);

  const variants = {
    A: {
      name: 'Version A',
      description: 'Book a call as primary CTA',
      cta: 'Book discovery call →',
      ctaPosition: 'top'
    },
    B: {
      name: 'Version B',
      description: 'See portfolio as primary CTA',
      cta: 'View portfolio →',
      ctaPosition: 'top'
    },
    C: {
      name: 'Version C',
      description: 'View case study as primary CTA',
      cta: 'See case study →',
      ctaPosition: 'middle'
    }
  };

  const toggleVariant = (variant) => {
    if (selectedVariants.includes(variant)) {
      setSelectedVariants(selectedVariants.filter(v => v !== variant));
    } else if (selectedVariants.length < 2) {
      setSelectedVariants([...selectedVariants, variant]);
    }
  };

  return (
    <div className="ab-testing-section">
      <h2>🧪 A/B Testing</h2>
      <p className="section-hint">
        Test which CTA works best. We'll track clicks to help you optimize.
      </p>

      <div className="variants-grid">
        {Object.entries(variants).map(([key, variant]) => (
          <div
            key={key}
            className={`variant-card ${selectedVariants.includes(key) ? 'selected' : ''}`}
            onClick={() => toggleVariant(key)}
          >
            <div className="variant-header">
              <input
                type="checkbox"
                checked={selectedVariants.includes(key)}
                onChange={() => toggleVariant(key)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="variant-name">{variant.name}</span>
            </div>
            <div className="variant-description">{variant.description}</div>
            <div className="variant-preview">
              <div className="preview-cta">{variant.cta}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedVariants.length > 0 && (
        <div className="testing-info">
          <p>
            <strong>Selected:</strong> {selectedVariants.map(v => variants[v].name).join(' vs ')}
          </p>
          <p className="info-text">
            💡 Create {selectedVariants.length} signature{selectedVariants.length > 1 ? 's' : ''} and test which gets more clicks.
            Track performance in your dashboard.
          </p>
        </div>
      )}
    </div>
  );
}

export default ABTesting;

