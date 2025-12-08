import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSignatures, deleteSignature } from '../services/signatureService';
import SignaturePreview from './SignaturePreview';
import './MySignatures.css';

function MySignatures() {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignatures();
  }, []);

  const loadSignatures = async () => {
    try {
      const data = await getSignatures();
      setSignatures(data);
    } catch (error) {
      console.error('Error loading signatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this signature?')) {
      try {
        await deleteSignature(id);
        loadSignatures();
      } catch (error) {
        console.error('Error deleting signature:', error);
        alert('Failed to delete signature. Please try again.');
      }
    }
  };

  const handleCopy = async (signatureData) => {
    const htmlContent = generateHTMLSignature(signatureData);
    try {
      await navigator.clipboard.writeText(htmlContent);
      alert('Signature copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateHTMLSignature = (signatureData) => {
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

  if (loading) {
    return (
      <div className="signatures-container">
        <div className="loading">Loading your signatures...</div>
      </div>
    );
  }

  return (
    <div className="signatures-container">
      <div className="signatures-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>My Signatures</h1>
        <Link to="/builder" className="new-signature-btn">+ Create New Signature</Link>
      </div>

      {signatures.length === 0 ? (
        <div className="empty-state">
          <p>You haven't saved any signatures yet.</p>
          <Link to="/builder" className="cta-button">Create Your First Signature</Link>
        </div>
      ) : (
        <div className="signatures-grid">
          {signatures.map((signature) => (
            <div key={signature.id} className="signature-card">
              <div className="signature-card-header">
                <h3>{signature.data.name || 'Untitled Signature'}</h3>
                <div className="signature-actions">
                  <button
                    onClick={() => handleCopy(signature.data)}
                    className="btn-icon"
                    title="Copy HTML"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => handleDelete(signature.id)}
                    className="btn-icon delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="signature-card-preview">
                <SignaturePreview signatureData={signature.data} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySignatures;

