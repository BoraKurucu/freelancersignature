import React from 'react';
import './SignaturePreview.css';

function SignaturePreview({ signatureData }) {
  const { name, title, email, phone, website, linkedin, twitter, github, portfolio, bio, color, fontFamily, showSocialLinks, showBio } = signatureData;

  return (
    <div className="signature-preview" style={{ fontFamily, color: '#333' }}>
      <div className="signature-name" style={{ color }}>
        {name || 'Your Name'}
      </div>
      
      {title && (
        <div className="signature-title">{title}</div>
      )}
      
      <div className="signature-contact">
        {email && (
          <div className="contact-item">
            📧 <a href={`mailto:${email}`} style={{ color }}>{email}</a>
          </div>
        )}
        {phone && (
          <div className="contact-item">
            📱 <a href={`tel:${phone}`} style={{ color }}>{phone}</a>
          </div>
        )}
        {website && (
          <div className="contact-item">
            🌐 <a href={website.startsWith('http') ? website : 'https://' + website} target="_blank" rel="noopener noreferrer" style={{ color }}>{website}</a>
          </div>
        )}
      </div>
      
      {showSocialLinks && (linkedin || twitter || github || portfolio) && (
        <div className="signature-social">
          {linkedin && (
            <a href={linkedin.startsWith('http') ? linkedin : 'https://linkedin.com/in/' + linkedin} target="_blank" rel="noopener noreferrer" style={{ color, marginRight: '10px' }}>
              LinkedIn
            </a>
          )}
          {twitter && (
            <a href={twitter.startsWith('http') ? twitter : 'https://twitter.com/' + twitter} target="_blank" rel="noopener noreferrer" style={{ color, marginRight: '10px' }}>
              Twitter
            </a>
          )}
          {github && (
            <a href={github.startsWith('http') ? github : 'https://github.com/' + github} target="_blank" rel="noopener noreferrer" style={{ color, marginRight: '10px' }}>
              GitHub
            </a>
          )}
          {portfolio && (
            <a href={portfolio.startsWith('http') ? portfolio : 'https://' + portfolio} target="_blank" rel="noopener noreferrer" style={{ color }}>
              Portfolio
            </a>
          )}
        </div>
      )}
      
      {showBio && bio && (
        <div className="signature-bio">{bio}</div>
      )}
    </div>
  );
}

export default SignaturePreview;

