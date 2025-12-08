import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onSuccess, requiredAction = 'save' }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const { 
    currentUser,
    isFullyAuthenticated,
    signInWithGoogle, 
    signUpWithEmail, 
    signInWithEmail, 
    resendVerificationEmail,
    authError, 
    setAuthError 
  } = useAuth();

  // Auto-close modal when user signs in successfully
  useEffect(() => {
    if (isOpen && currentUser && isFullyAuthenticated()) {
      // User is now authenticated, close modal
      onClose();
      if (onSuccess) onSuccess();
    }
  }, [currentUser, isOpen, isFullyAuthenticated, onClose, onSuccess]);

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMessage(null);
    setShowVerificationMessage(false);
    setAuthError(null);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);
    const result = await signInWithGoogle();
    setIsLoading(false);
    
    if (result.success) {
      handleClose();
      if (onSuccess) onSuccess();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setAuthError(null);

    if (mode === 'signup') {
      // Validate passwords match
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
      }
      
      // Validate password strength
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
      }

      setIsLoading(true);
      const result = await signUpWithEmail(email, password);
      setIsLoading(false);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setShowVerificationMessage(true);
      }
    } else {
      setIsLoading(true);
      const result = await signInWithEmail(email, password);
      setIsLoading(false);

      if (result.success) {
        if (!result.emailVerified) {
          setMessage({ type: 'warning', text: result.message });
          setShowVerificationMessage(true);
        } else {
          handleClose();
          if (onSuccess) onSuccess();
        }
      }
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    const result = await resendVerificationEmail();
    setIsLoading(false);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Verification email sent! Check your inbox.' });
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const getActionText = () => {
    switch (requiredAction) {
      case 'save':
        return 'save your signature';
      case 'copy':
        return 'copy your signature';
      default:
        return 'continue';
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={handleClose}>×</button>
        
        <div className="auth-modal-header">
          <h2>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>Sign in to {getActionText()}</p>
        </div>

        {/* Google Sign In */}
        <button 
          className="auth-btn auth-btn-google"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSubmit} className="auth-form">
          <div className="auth-input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className="auth-input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          )}

          {/* Error/Success Messages */}
          {(authError || message) && (
            <div className={`auth-message ${message?.type || 'error'}`}>
              {authError || message?.text}
            </div>
          )}

          {/* Verification Message */}
          {showVerificationMessage && (
            <div className="auth-verification">
              <p>📧 Check your email for a verification link.</p>
              <button 
                type="button" 
                className="auth-link-btn"
                onClick={handleResendVerification}
                disabled={isLoading}
              >
                Resend verification email
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-btn auth-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="auth-toggle">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setMode('signup');
                  setMessage(null);
                  setAuthError(null);
                  setShowVerificationMessage(false);
                }}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setMode('signin');
                  setMessage(null);
                  setAuthError(null);
                  setShowVerificationMessage(false);
                }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <p className="auth-terms">
          By signing in, you agree to our{' '}
          <Link to="/terms" onClick={handleClose}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" onClick={handleClose}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default AuthModal;

