import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSignatures, deleteSignature } from '../services/signatureService';
import { generateHTMLSignature } from '../utils/signatureGenerator';
import SignaturePreview from './SignaturePreview';
import './MySignatures.css';

function MySignatures() {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

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
        await loadSignatures();
      } catch (error) {
        console.error('Error deleting signature:', error);
        alert('Failed to delete signature');
      }
    }
  };

  const handleCopy = async (signatureData) => {
    const htmlContent = generateHTMLSignature(signatureData);
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(signatureData.id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = htmlContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(signatureData.id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="my-signatures-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your signatures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-signatures-container">
      <div className="my-signatures-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>My Signatures</h1>
        <p className="header-subtitle">Manage and copy your email signatures</p>
        <Link to="/builder" className="btn-primary">
          Create New Signature
        </Link>
      </div>

      {signatures.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No signatures yet</h2>
          <p>Create your first professional email signature</p>
          <Link to="/builder" className="btn-primary">
            Create Your First Signature
          </Link>
        </div>
      ) : (
        <div className="signatures-grid">
          {signatures.map((signature) => (
            <div key={signature.id} className="signature-card">
              <div className="signature-card-header">
                <h3>{signature.name || 'Untitled Signature'}</h3>
                <div className="signature-card-actions">
                  <button
                    onClick={() => handleCopy(signature)}
                    className="btn-icon"
                    title="Copy HTML"
                  >
                    {copied === signature.id ? '✓' : '📋'}
                  </button>
                  <button
                    onClick={() => handleDelete(signature.id)}
                    className="btn-icon btn-danger"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="signature-preview-wrapper">
                <SignaturePreview signatureData={signature} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySignatures;
