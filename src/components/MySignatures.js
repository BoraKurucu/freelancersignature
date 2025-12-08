import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSignatures, deleteSignature } from '../services/signatureService';
import { generateHTMLSignature } from '../utils/signatureGenerator';
import SignaturePreview from './SignaturePreview';
import { useAuth } from '../context/AuthContext';
import './MySignatures.css';

function MySignatures() {
  const { currentUser, isFullyAuthenticated, isPremium, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || !isFullyAuthenticated()) {
        // Redirect to builder if not logged in
        navigate('/builder');
      } else {
        loadSignatures();
      }
    }
  }, [currentUser, authLoading, isFullyAuthenticated, navigate]);

  const loadSignatures = async () => {
    if (!currentUser) return;
    
    try {
      const data = await getSignatures(currentUser.uid);
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
        await deleteSignature(id, currentUser?.uid);
        await loadSignatures();
      } catch (error) {
        console.error('Error deleting signature:', error);
        alert('Failed to delete signature');
      }
    }
  };

  const handleCopy = async (signatureData, signatureId) => {
    const showWatermark = !isPremium();
    const htmlContent = generateHTMLSignature(signatureData, { showWatermark });
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(signatureId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = htmlContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(signatureId);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleEdit = (signatureData) => {
    // Navigate to builder with signature data
    navigate('/builder', { state: { editSignature: signatureData } });
  };

  if (authLoading || loading) {
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
          + Create New Signature
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
                <h3>{signature.data?.name || 'Untitled Signature'}</h3>
                <span className="signature-date">
                  {signature.data?.createdAt ? new Date(signature.data.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="signature-preview-wrapper">
                <SignaturePreview signatureData={signature.data} showWatermark={!isPremium()} />
              </div>
              <div className="signature-card-actions">
                <button
                  onClick={() => handleCopy(signature.data, signature.id)}
                  className="btn-action btn-copy"
                >
                  {copied === signature.id ? '✓ Copied!' : '📋 Copy HTML'}
                </button>
                <button
                  onClick={() => handleEdit(signature.data)}
                  className="btn-action btn-edit"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(signature.id)}
                  className="btn-action btn-delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="page-footer">
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <span className="divider">•</span>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <p className="copyright">© 2025 FreelancerSignature. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MySignatures;
