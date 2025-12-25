import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSignatures, deleteSignature } from '../services/signatureService';
import { getSignatureHTML } from '../services/signatureApiService';
import { downloadSignaturePNG, downloadSignaturePDF } from '../utils/downloadHelpers';
import SignaturePreview from './SignaturePreview';
import { useAuth } from '../context/AuthContext';
import './MySignatures.css';
import './SignatureBuilder.css';

function MySignatures() {
  const { currentUser, isFullyAuthenticated, isPremium, loading: authLoading, userProfile } = useAuth();
  const navigate = useNavigate();
  
  // --- FLASH FIX START ---
  // 1. Define a specific state for "We don't know who you are yet"
  const isCheckingStatus = authLoading || (currentUser && !userProfile);

  // 2. Strict check for showing limits: Only show if we are DONE loading AND user is NOT premium
  const shouldShowFreeLimits = !isCheckingStatus && !isPremium();
  // --- FLASH FIX END ---
  
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [copying, setCopying] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || !isFullyAuthenticated()) {
        // Redirect to builder if not logged in
        navigate('/builder');
      } else {
        loadSignatures();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Check if we're still checking status
    if (isCheckingStatus) {
      alert('Please wait while we verify your account status...');
      return;
    }

    setCopying(signatureId);
    try {
      // Get HTML from server-side (validates premium status)
      const { html } = await getSignatureHTML(signatureId);
      
      try {
        await navigator.clipboard.writeText(html);
        setCopied(signatureId);
        setTimeout(() => setCopied(null), 2000);
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = html;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(signatureId);
        setTimeout(() => setCopied(null), 2000);
      }
    } catch (error) {
      console.error('Error copying signature:', error);
      alert('Failed to copy signature. Please try again.');
    } finally {
      setCopying(null);
    }
  };

  const handleEdit = (signatureData) => {
    // Navigate to builder with signature data
    navigate('/builder', { state: { editSignature: signatureData } });
  };

  const handleDownload = async (signatureId, signatureData) => {
    // Check if we're still checking status
    if (isCheckingStatus) {
      alert('Please wait while we verify your account status...');
      return;
    }

    setDownloading(signatureId);
    try {
      const isPremiumUser = !isCheckingStatus && userProfile && isPremium();
      
      // Find the preview container for this signature
      const previewWrapper = document.querySelector(`[data-signature-id="${signatureId}"]`);
      if (!previewWrapper) {
        throw new Error('Preview container not found');
      }
      
      const signatureElement = previewWrapper.querySelector('.signature-preview');
      if (!signatureElement) {
        throw new Error('Signature preview element not found');
      }
      
      const filename = `${signatureData?.name || 'signature'}.png`;
      await downloadSignaturePNG(signatureElement, filename, isPremiumUser);
    } catch (error) {
      console.error('Error downloading signature:', error);
      alert('Failed to download signature. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadPDF = async (signatureId, signatureData) => {
    // Check if we're still checking status
    if (isCheckingStatus) {
      alert('Please wait while we verify your account status...');
      return;
    }

    setDownloadingPDF(signatureId);
    try {
      const isPremiumUser = !isCheckingStatus && userProfile && isPremium();
      const filename = `${signatureData?.name || 'signature'}.pdf`;

      // Use client-side preview for both premium and free (same as PNG)
      const previewWrapper = document.querySelector(`[data-signature-id="${signatureId}"]`);
      if (!previewWrapper) {
        throw new Error('Preview container not found');
      }
      const signatureElement = previewWrapper.querySelector('.signature-preview');
      if (!signatureElement) {
        throw new Error('Signature preview element not found');
      }

      await downloadSignaturePDF(signatureElement, filename, isPremiumUser, null, null);
    } catch (error) {
      console.error('Error downloading signature as PDF:', error);
      alert('Failed to download signature as PDF. Please try again.');
    } finally {
      setDownloadingPDF(null);
    }
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
              <div 
                className="preview-container"
                data-signature-id={signature.id}
              >
                <SignaturePreview 
                  signatureData={signature.data} 
                  showWatermark={shouldShowFreeLimits}
                />
              </div>
              <div className="signature-card-actions">
                {isCheckingStatus ? (
                  <button disabled className="btn-action btn-copy">
                    Checking...
                  </button>
                ) : (!isCheckingStatus && userProfile && isPremium()) ? (
                  <button
                    onClick={() => handleCopy(signature.data, signature.id)}
                    className="btn-action btn-copy"
                    disabled={copying === signature.id}
                  >
                    {copying === signature.id 
                      ? '⏳ Copying...' 
                      : copied === signature.id 
                        ? '✓ Copied!' 
                        : '📋 Copy HTML'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn-action btn-copy btn-locked"
                    title="Premium feature - Upgrade to unlock"
                  >
                    🔒 Copy HTML (Premium Only)
                  </button>
                )}
                <button
                  onClick={() => handleDownload(signature.id, signature.data)}
                  className="btn-action btn-download"
                  disabled={downloading === signature.id}
                >
                  {downloading === signature.id 
                    ? '⏳ Downloading...'
                    : (!isCheckingStatus && userProfile && isPremium())
                      ? '📥 Download PNG' 
                      : '📥 Download PNG (Upgrade to remove watermark)'}
                </button>
                <button
                  onClick={() => handleDownloadPDF(signature.id, signature.data)}
                  className="btn-action btn-download-pdf"
                  disabled={downloadingPDF === signature.id}
                >
                  {downloadingPDF === signature.id 
                    ? '⏳ Downloading...'
                    : (!isCheckingStatus && userProfile && isPremium())
                      ? '📄 Download PDF' 
                      : '📄 Download PDF (Upgrade to remove watermark)'}
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
