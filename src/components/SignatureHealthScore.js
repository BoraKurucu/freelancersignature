import React from 'react';
import './SignatureHealthScore.css';

function SignatureHealthScore({ signatureData }) {
  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;
    const checks = [];

    // Basic Info (20 points)
    maxScore += 20;
    if (signatureData.name) { score += 5; checks.push({ text: 'Has name', good: true }); }
    if (signatureData.email) { score += 5; checks.push({ text: 'Has email', good: true }); }
    if (signatureData.specialty) { score += 5; checks.push({ text: 'Has specialty', good: true }); }
    if (signatureData.website) { score += 5; checks.push({ text: 'Has website', good: true }); }
    if (!signatureData.name) checks.push({ text: 'Missing name', good: false });
    if (!signatureData.email) checks.push({ text: 'Missing email', good: false });
    if (!signatureData.specialty) checks.push({ text: 'Missing specialty', good: false });

    // Portfolio Proof (30 points)
    maxScore += 30;
    if (signatureData.githubStats || signatureData.githubUrl) { 
      score += 15; 
      checks.push({ text: 'Has GitHub proof', good: true }); 
    } else {
      checks.push({ text: 'Missing GitHub proof', good: false });
    }
    if (signatureData.projectUrls && signatureData.projectUrls.some(url => url)) { 
      score += 15; 
      checks.push({ text: 'Has project showcase', good: true }); 
    } else {
      checks.push({ text: 'Missing project showcase', good: false });
    }

    // Social Proof (25 points)
    maxScore += 25;
    if (signatureData.testimonials && signatureData.testimonials[0]?.quote) { 
      score += 15; 
      checks.push({ text: 'Has testimonials', good: true }); 
    } else {
      checks.push({ text: 'Missing testimonials', good: false });
    }
    if (signatureData.linkedin || signatureData.twitter) { 
      score += 10; 
      checks.push({ text: 'Has social links', good: true }); 
    } else {
      checks.push({ text: 'Missing social links', good: false });
    }

    // Booking CTA (15 points)
    maxScore += 15;
    if (signatureData.calendlyLink) { 
      score += 15; 
      checks.push({ text: 'Has booking link', good: true }); 
    } else {
      checks.push({ text: 'Missing booking link', good: false });
    }

    // Services/Rates (10 points)
    maxScore += 10;
    if (signatureData.services && signatureData.services[0]?.name) { 
      score += 10; 
      checks.push({ text: 'Has services/rates', good: true }); 
    } else {
      checks.push({ text: 'Missing services/rates', good: false });
    }

    return { score, maxScore, checks };
  };

  const { score, maxScore, checks } = calculateScore();
  const percentage = Math.round((score / maxScore) * 100);
  
  const getLevel = () => {
    if (percentage >= 90) return { name: 'Expert', emoji: '🏆', color: '#10b981' };
    if (percentage >= 70) return { name: 'Professional', emoji: '✅', color: '#3b82f6' };
    if (percentage >= 50) return { name: 'Good', emoji: '👍', color: '#f59e0b' };
    return { name: 'Beginner', emoji: '🌱', color: '#ef4444' };
  };

  const level = getLevel();

  return (
    <div className="signature-health-score">
      <div className="health-score-header">
        <div className="score-circle" style={{ borderColor: level.color }}>
          <div className="score-value" style={{ color: level.color }}>
            {percentage}%
          </div>
          <div className="score-label">{level.emoji} {level.name}</div>
        </div>
        <div className="score-info">
          <h3>Signature Strength</h3>
          <p>Goal: 90%+ (Expert Level)</p>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${level.color} 0%, ${level.color}dd 100%)`
          }}
        />
      </div>

      <div className="health-checks">
        {checks.slice(0, 6).map((check, index) => (
          <div key={index} className={`health-check ${check.good ? 'good' : 'bad'}`}>
            {check.good ? '✅' : '❌'} {check.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SignatureHealthScore;
