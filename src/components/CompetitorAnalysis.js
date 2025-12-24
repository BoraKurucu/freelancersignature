import React from 'react';
import './CompetitorAnalysis.css';

function CompetitorAnalysis({ signatureData }) {
  const topFreelancerFeatures = [
    '3+ portfolio items with results',
    'Clear rate cards',
    'Client logos',
    'Multiple CTAs',
    'Social proof/testimonials',
    'Availability status',
    'GitHub/stats showcase',
    'Problem-solving focus'
  ];

  const userFeatures = [];
  if (signatureData.projectUrls && signatureData.projectUrls.filter(url => url).length >= 3) {
    userFeatures.push('3+ portfolio items with results');
  }
  if (signatureData.services && signatureData.services.length > 0 && signatureData.services[0].name) {
    userFeatures.push('Clear rate cards');
  }
  if (signatureData.testimonials && signatureData.testimonials.length > 0 && signatureData.testimonials[0].quote) {
    userFeatures.push('Social proof/testimonials');
  }
  if (signatureData.availability && signatureData.availability !== 'none') {
    userFeatures.push('Availability status');
  }
  if (signatureData.githubStats || signatureData.github) {
    userFeatures.push('GitHub/stats showcase');
  }
  if (signatureData.problemsSolved && signatureData.problemsSolved.length > 0) {
    userFeatures.push('Problem-solving focus');
  }
  if (signatureData.calendlyLink) {
    userFeatures.push('Multiple CTAs');
  }

  const missingFeatures = topFreelancerFeatures.filter(feature => !userFeatures.includes(feature));
  const matchScore = Math.round((userFeatures.length / topFreelancerFeatures.length) * 100);

  return (
    <div className="competitor-analysis">
      <h2>🔬 Competitor Analysis</h2>
      <p className="section-hint">
        How does your signature compare to top 10% freelancers in your niche?
      </p>

      <div className="analysis-score">
        <div className="score-circle" style={{ 
          background: matchScore >= 80 ? 'linear-gradient(135deg, #22c55e, #16a34a)' :
                      matchScore >= 60 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                      matchScore >= 40 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                      'linear-gradient(135deg, #ef4444, #dc2626)'
        }}>
          <div className="score-value">{matchScore}%</div>
          <div className="score-label">Match</div>
        </div>
        <div className="score-description">
          {matchScore >= 80 ? '🎯 Expert Level - You match top performers!' :
           matchScore >= 60 ? '✅ Professional - Good foundation' :
           matchScore >= 40 ? '⚠️ Basic - Room for improvement' :
           '❌ Amateur - Significant gaps'}
        </div>
      </div>

      <div className="features-comparison">
        <div className="comparison-section">
          <h3>✅ What You Have</h3>
          {userFeatures.length > 0 ? (
            <ul className="features-list good">
              {userFeatures.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
          ) : (
            <p className="no-features">No features detected yet</p>
          )}
        </div>

        <div className="comparison-section">
          <h3>❌ Missing Elements</h3>
          {missingFeatures.length > 0 ? (
            <ul className="features-list bad">
              {missingFeatures.map((feature, index) => (
                <li key={index}>✗ {feature}</li>
              ))}
            </ul>
          ) : (
            <p className="no-features success">🎉 You have all top features!</p>
          )}
        </div>
      </div>

      <div className="top-freelancer-checklist">
        <h3>📋 Top 10% Freelancers Include:</h3>
        <div className="checklist-grid">
          {topFreelancerFeatures.map((feature, index) => (
            <div key={index} className={`checklist-item ${userFeatures.includes(feature) ? 'checked' : ''}`}>
              {userFeatures.includes(feature) ? '✓' : '○'} {feature}
            </div>
          ))}
        </div>
      </div>

      {matchScore < 80 && (
        <div className="improvement-suggestion">
          <strong>💡 Suggestion:</strong> Add the missing elements above to match top-performing freelancers and increase your conversion rate.
        </div>
      )}
    </div>
  );
}

export default CompetitorAnalysis;




