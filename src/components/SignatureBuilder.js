import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SignaturePreview from './SignaturePreview';
import { saveSignature } from '../services/signatureService';
import './SignatureBuilder.css';

function SignatureBuilder() {
  const [signatureData, setSignatureData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
    github: '',
    portfolio: '',
    bio: '',
    color: '#667eea',
    fontFamily: 'Arial, sans-serif',
    showSocialLinks: true,
    showBio: false
  });

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignatureData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCopy = async () => {
    const htmlContent = generateHTMLSignature();
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = htmlContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    try {
      await saveSignature(signatureData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature. Please try again.');
    }
  };

  const generateHTMLSignature = () => {
    const { name, title, email, phone, website, linkedin, twitter, github, portfolio, bio, color, fontFamily, showSocialLinks, showBio } = signatureData;
    
    let html = `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontFamily}; color: #333333; font-size: 14px; line-height: 1.6;">`;
    html += `<tr><td style="padding-bottom: 10px;">`;
    html += `<strong style="color: ${color}; font-size: 16px;">${name || 'Your Name'}</strong>`;
    html += `</td></tr>`;
    
    if (title) {
      html += `<tr><td style="padding-bottom: 10px; color: #666666;">${title}</td></tr>`;
    }
    
    html += `<tr><td style="padding-bottom: 10px;">`;
    if (email) {
      html += `📧 <a href="mailto:${email}" style="color: ${color}; text-decoration: none;">${email}</a>`;
    }
    if (phone) {
      html += email ? ' | ' : '';
      html += `📱 <a href="tel:${phone}" style="color: ${color}; text-decoration: none;">${phone}</a>`;
    }
    html += `</td></tr>`;
    
    if (website) {
      html += `<tr><td style="padding-bottom: 10px;">`;
      html += `🌐 <a href="${website.startsWith('http') ? website : 'https://' + website}" target="_blank" style="color: ${color}; text-decoration: none;">${website}</a>`;
      html += `</td></tr>`;
    }
    
    if (showSocialLinks && (linkedin || twitter || github || portfolio)) {
      html += `<tr><td style="padding-bottom: 10px;">`;
      const links = [];
      if (linkedin) links.push(`<a href="${linkedin.startsWith('http') ? linkedin : 'https://linkedin.com/in/' + linkedin}" target="_blank" style="color: ${color}; text-decoration: none; margin-right: 10px;">LinkedIn</a>`);
      if (twitter) links.push(`<a href="${twitter.startsWith('http') ? twitter : 'https://twitter.com/' + twitter}" target="_blank" style="color: ${color}; text-decoration: none; margin-right: 10px;">Twitter</a>`);
      if (github) links.push(`<a href="${github.startsWith('http') ? github : 'https://github.com/' + github}" target="_blank" style="color: ${color}; text-decoration: none; margin-right: 10px;">GitHub</a>`);
      if (portfolio) links.push(`<a href="${portfolio.startsWith('http') ? portfolio : 'https://' + portfolio}" target="_blank" style="color: ${color}; text-decoration: none;">Portfolio</a>`);
      html += links.join(' | ');
      html += `</td></tr>`;
    }
    
    if (showBio && bio) {
      html += `<tr><td style="padding-top: 10px; padding-bottom: 10px; border-top: 1px solid #e0e0e0; color: #666666; font-style: italic;">${bio}</td></tr>`;
    }
    
    html += `</table>`;
    return html;
  };

  return (
    <div className="builder-container">
      <div className="builder-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>Create Your Email Signature</h1>
      </div>
      
      <div className="builder-content">
        <div className="builder-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={signatureData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                name="title"
                value={signatureData.title}
                onChange={handleChange}
                placeholder="Freelance Web Developer"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={signatureData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={signatureData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="text"
                name="website"
                value={signatureData.website}
                onChange={handleChange}
                placeholder="www.johndoe.com"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Social Links</h2>
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={signatureData.linkedin}
                onChange={handleChange}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
            <div className="form-group">
              <label>Twitter</label>
              <input
                type="text"
                name="twitter"
                value={signatureData.twitter}
                onChange={handleChange}
                placeholder="@johndoe"
              />
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="text"
                name="github"
                value={signatureData.github}
                onChange={handleChange}
                placeholder="github.com/johndoe"
              />
            </div>
            <div className="form-group">
              <label>Portfolio</label>
              <input
                type="text"
                name="portfolio"
                value={signatureData.portfolio}
                onChange={handleChange}
                placeholder="portfolio.johndoe.com"
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="showSocialLinks"
                  checked={signatureData.showSocialLinks}
                  onChange={handleChange}
                />
                Show social links in signature
              </label>
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Options</h2>
            <div className="form-group">
              <label>Bio/Short Description</label>
              <textarea
                name="bio"
                value={signatureData.bio}
                onChange={handleChange}
                placeholder="Passionate developer creating beautiful web experiences..."
                rows="3"
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="showBio"
                  checked={signatureData.showBio}
                  onChange={handleChange}
                />
                Show bio in signature
              </label>
            </div>
            <div className="form-group">
              <label>Accent Color</label>
              <input
                type="color"
                name="color"
                value={signatureData.color}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Font Family</label>
              <select
                name="fontFamily"
                value={signatureData.fontFamily}
                onChange={handleChange}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleCopy} className="btn btn-primary">
              {copied ? '✓ Copied!' : 'Copy HTML'}
            </button>
            <button onClick={handleSave} className="btn btn-secondary">
              {saved ? '✓ Saved!' : 'Save Signature'}
            </button>
            <Link to="/my-signatures" className="btn btn-link">
              View My Signatures
            </Link>
          </div>
        </div>

        <div className="builder-preview">
          <h2>Preview</h2>
          <div className="preview-container">
            <SignaturePreview signatureData={signatureData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignatureBuilder;

