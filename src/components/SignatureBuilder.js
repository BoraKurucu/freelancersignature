import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SignaturePreview from './SignaturePreview';
import ErrorBoundary from './ErrorBoundary';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';
import Toast from './Toast';
import ImageUploadCrop from './ImageUploadCrop';
import SEO from './SEO';
import { saveSignature, getSignatureCount } from '../services/signatureService';
import { getSignatureHTMLFromData } from '../services/signatureApiService';
import { downloadSignaturePNG, downloadSignaturePDF } from '../utils/downloadHelpers';
import { getGumroadCheckoutUrl } from '../services/gumroadService';
import { templates, sampleProfiles } from '../utils/templates';
import { useAuth } from '../context/AuthContext';
import './SignatureBuilder.css';

// Default empty state
const defaultSignatureData = {
  name: '',
  email: '',
  specialty: '',
  company: '',
  companyScript: '',
  tagline: '',
  website: '',
  phone: '',
  mobile: '',
  address: '',
  photoUrl: '',
  logoUrl: '',
  template: 'gradientSidebar',
  color: '#0d7377',
  hourlyRate: '',
  availability: '',
  bookingUrl: '',
  portfolioUrl: '',
  socialLinks: {
    facebook: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    instagram: '',
    pinterest: '',
    github: '',
    dribbble: '',
    behance: '',
    tiktok: '',
  },
};

// Function to determine which fields are used by each template layout
const getTemplateFields = (templateKey) => {
  const template = templates[templateKey];
  const layout = template?.layout || 'gradientSidebar';
  
  // Base fields that are always used
  const baseFields = {
    name: true,
    specialty: true,
    email: true,
    photoUrl: true,
    hourlyRate: true,
    availability: true,
    bookingUrl: true,
    portfolioUrl: true,
  };
  
  // Field usage by layout - based on actual SignaturePreview.js implementations
  const layoutFields = {
    gradientSidebar: {
      ...baseFields,
      company: true,
      mobile: true,
      phone: true,
      address: true,
    },
    scriptElegant: {
      ...baseFields,
      companyScript: true,
      mobile: true,
      phone: true,
      website: true,
      address: true,
      logoUrl: true,
    },
    redCircle: {
      ...baseFields,
      company: true,
      phone: true,
      website: true,
      address: true,
    },
    simplePhoto: {
      ...baseFields,
      phone: true,
      website: true,
      address: true,
    },
    twoColumnWithLogo: {
      ...baseFields,
      company: true,
      phone: true,
      mobile: true,
      website: true,
      address: true,
    },
    photoSidebar: {
      ...baseFields,
      company: true,
      tagline: true,
      phone: true,
      website: true,
      address: true,
    },
    twoColumnSimple: {
      ...baseFields,
      company: true,
      phone: true,
      mobile: true,
      website: true,
      address: true,
    },
    photoWithScript: {
      ...baseFields,
      phone: true,
      website: true,
      address: true,
    },
    // Default layout (used by yellowHexagon, orangeBanner, blueModern, blackFooter if not implemented)
    // Based on default fallback in SignaturePreview.js - uses: name, specialty, email, phone, website
    default: {
      name: true,
      specialty: true,
      email: true,
      phone: true,
      website: true,
      photoUrl: true,
      hourlyRate: true,
      availability: true,
      bookingUrl: true,
      portfolioUrl: true,
      // These are NOT used in default layout
      company: false,
      companyScript: false,
      tagline: false,
      mobile: false,
      address: false,
      logoUrl: false,
    },
  };
  
  return layoutFields[layout] || layoutFields.default;
};

function SignatureBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isFullyAuthenticated, isPremium, loading: authLoading, userProfile } = useAuth();
  
  const [selectedTemplate, setSelectedTemplate] = useState('gradientSidebar');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [signatureData, setSignatureData] = useState(defaultSignatureData);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('save');
  const [signatureCount, setSignatureCount] = useState(0);
  const [toast, setToast] = useState({ message: '', type: 'info', isVisible: false });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const previewRef = useRef(null);
  const profileSwitchTimeoutRef = useRef(null);
  
  const showToast = (message, type = 'info') => {
    setToast({ message, type, isVisible: true });
  };
  
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };
  
  // Get enabled fields for current template
  const enabledFields = getTemplateFields(selectedTemplate);
  
  // Helper: Only show free plan limitations when loading is done, user profile is loaded, and user is not premium
  const shouldShowFreeLimits = !authLoading && userProfile && !isPremium();
  
  // Load signature count when user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadSignatureCount = async () => {
      if (currentUser && isFullyAuthenticated()) {
        try {
          const count = await getSignatureCount(currentUser.uid);
          if (isMounted) {
            setSignatureCount(count);
          }
        } catch (error) {
          // Silently handle errors - don't show alerts on page load
          console.error('Error loading signature count:', error);
          if (isMounted) {
            setSignatureCount(0);
          }
        }
      } else {
        if (isMounted) {
          setSignatureCount(0);
        }
      }
    };
    
    loadSignatureCount();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser, isFullyAuthenticated]);

  // Load profile from navigation state (when coming from Home page)
  useEffect(() => {
    if (location.state?.loadProfile) {
      loadSampleProfile(location.state.loadProfile);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignatureData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (platform, value) => {
    setSignatureData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = templates[templateKey];
    if (template) {
      setSignatureData(prev => ({
        ...prev,
        template: templateKey,
        color: template.color,
      }));
    }
  };

  const loadSampleProfile = useCallback((profileKey) => {
    // Prevent rapid clicking - clear any pending timeouts
    if (profileSwitchTimeoutRef.current) {
      clearTimeout(profileSwitchTimeoutRef.current);
    }

    // If already loading, ignore
    if (isLoadingProfile) {
      return;
    }

    // Toggle behavior - if same profile clicked, reset to default
    if (selectedProfile === profileKey) {
      resetForm();
      return;
    }

    const profile = sampleProfiles[profileKey];
    if (!profile) {
      console.warn('Profile not found:', profileKey);
      return;
    }

    // Set loading state
    setIsLoadingProfile(true);

    // Use startTransition for non-urgent updates to prevent blocking
    startTransition(() => {
      try {
        // Prepare new data
        const newSignatureData = {
          ...defaultSignatureData,
          ...profile,
          socialLinks: {
            ...defaultSignatureData.socialLinks,
            ...(profile.socialLinks || {}),
          },
        };

        // Batch state updates together
        setSelectedProfile(profileKey);
        setSignatureData(newSignatureData);
        setSelectedTemplate(profile.template || 'gradientSidebar');

        // Small delay to ensure React has time to render
        // This prevents blank screens on mobile browsers
        profileSwitchTimeoutRef.current = setTimeout(() => {
          setIsLoadingProfile(false);
          profileSwitchTimeoutRef.current = null;
        }, 100);
      } catch (error) {
        console.error('Error loading profile:', error);
        setIsLoadingProfile(false);
        showToast('Failed to load profile. Please try again.', 'error');
      }
    });
  }, [selectedProfile, isLoadingProfile, startTransition]);

  const resetForm = useCallback(() => {
    // Clear any pending profile switches
    if (profileSwitchTimeoutRef.current) {
      clearTimeout(profileSwitchTimeoutRef.current);
      profileSwitchTimeoutRef.current = null;
    }

    setIsLoadingProfile(true);
    startTransition(() => {
      setSelectedProfile(null);
      setSignatureData(defaultSignatureData);
      setSelectedTemplate('gradientSidebar');
      setTimeout(() => {
        setIsLoadingProfile(false);
      }, 50);
    });
  }, [startTransition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (profileSwitchTimeoutRef.current) {
        clearTimeout(profileSwitchTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('copy');
      setShowAuthModal(true);
      return;
    }

    try {
      // Get HTML from server-side (validates premium status)
      const { html } = await getSignatureHTMLFromData(signatureData);
      
      try {
        await navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = html;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error copying signature:', error);
      showToast('Failed to copy signature. Please try again.', 'error');
    }
  };

  const handleSave = async () => {
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('save');
      setShowAuthModal(true);
      return;
    }

    // Wait for auth and user profile to finish loading to ensure premium status is accurate
    // This prevents showing the wrong message for premium users
    if (authLoading || (currentUser && !userProfile)) {
      // Poll until auth and profile are loaded (max 1 second)
      let attempts = 0;
      while ((authLoading || (currentUser && !userProfile)) && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    try {
      // Check signature count limit
      const signatureCount = await getSignatureCount(currentUser.uid);
      // Double-check premium status after waiting for profile to load
      // Only check if loading is done and user profile is loaded
      if (!authLoading && userProfile) {
        const premiumStatus = isPremium();
        const maxSignatures = premiumStatus ? 10 : 2;
        
        if (signatureCount >= maxSignatures) {
          // Only show limit message if user is actually at limit
          if (premiumStatus) {
            showToast(`You've reached your Premium plan limit of ${maxSignatures} saved signatures. Please delete an existing signature to save a new one.`, 'warning');
          } else {
            showToast(`You've reached your Free plan limit of ${maxSignatures} saved signatures. Upgrade to Premium to save up to 10 signatures!`, 'warning');
          }
          return;
        }
      } else {
        // If still loading, wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 500));
        if (authLoading || (currentUser && !userProfile)) {
          showToast('Please wait while we verify your account status...', 'info');
          return;
        }
      }

      await saveSignature({
        ...signatureData,
        userId: currentUser.uid,
      });
      // Update signature count after saving
      const newCount = await getSignatureCount(currentUser.uid);
      setSignatureCount(newCount);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving signature:', error);
      showToast('Failed to save signature. Please try again.', 'error');
    }
  };

  const handleAuthSuccess = () => {
    // After successful auth, retry the action
    if (authAction === 'copy') {
      handleCopy();
    } else if (authAction === 'save') {
      handleSave();
    } else if (authAction === 'download') {
      handleDownload();
    } else if (authAction === 'upgrade') {
      if (currentUser && isFullyAuthenticated()) {
        const checkoutUrl = getGumroadCheckoutUrl(currentUser.email, true);
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleUpgradeClick = () => {
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('upgrade');
      setShowAuthModal(true);
      return;
    }
    
    // If signed in, open Gumroad checkout directly
    const checkoutUrl = getGumroadCheckoutUrl(currentUser.email, true);
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('download');
      setShowAuthModal(true);
      return;
    }

    setDownloading(true);
    try {
      const previewContainer = previewRef.current;
      if (!previewContainer) {
        throw new Error('Preview container not found');
      }
      
      const signatureElement = previewContainer.querySelector('.signature-preview');
      if (!signatureElement) {
        throw new Error('Signature preview element not found');
      }
      
      const filename = `${signatureData?.name || 'signature'}.png`;
      const isPremiumUser = !authLoading && userProfile && isPremium();
      await downloadSignaturePNG(signatureElement, filename, isPremiumUser);
    } catch (error) {
      console.error('Error downloading signature:', error);
      showToast('Failed to download signature. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('download');
      setShowAuthModal(true);
      return;
    }

    setDownloadingPDF(true);
    try {
      const filename = `${signatureData?.name || 'signature'}.pdf`;
      const isPremiumUser = !authLoading && userProfile && isPremium();

      // Always find the preview element (same as PNG download)
      const previewContainer = previewRef.current;
      if (!previewContainer) {
        throw new Error('Preview container not found');
      }
      const signatureElement = previewContainer.querySelector('.signature-preview');
      if (!signatureElement) {
        throw new Error('Signature preview element not found');
      }

      // For premium users, use element directly. For free users, pass signatureData for server-side HTML
      await downloadSignaturePDF(
        isPremiumUser ? signatureElement : null, 
        filename, 
        isPremiumUser, 
        signatureData, 
        null
      );
    } catch (error) {
      console.error('Error downloading signature as PDF:', error);
      showToast('Failed to download signature as PDF. Please try again.', 'error');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // All templates to show
  const allTemplates = [
    'gradientSidebar', 'orangeBanner', 'yellowHexagon', 'blueModern',
    'blackFooter', 'scriptElegant', 'redCircle', 'simplePhoto',
    'corporateRed', 'elegantMinimal', 'corporateGreen', 'scriptPersonal'
  ];

  // All sample profiles
  const allProfiles = [
    { key: 'jasmineDesigner', label: 'UI/UX Designer', icon: '👩‍🎨' },
    { key: 'melissaAgent', label: 'Marketing Consultant', icon: '📊' },
    { key: 'jennyDev', label: 'Web Developer', icon: '💻' },
    { key: 'kellyAdmin', label: 'Virtual Assistant', icon: '📋' },
    { key: 'angleDesigner', label: 'Graphic Designer', icon: '🎨' },
    { key: 'thomasIllustrator', label: 'Illustrator', icon: '✏️' },
    { key: 'edwardConsultant', label: 'Business Consultant', icon: '💼' },
    { key: 'andieOwner', label: 'Creative Director', icon: '✨' },
    { key: 'alexCopywriter', label: 'Copywriter', icon: '✍️' },
    { key: 'sarahPhotographer', label: 'Photographer', icon: '📷' },
  ];

  return (
    <div className="builder-container">
      <SEO
        title="Email Signature Builder - FreelancerSignature"
        description="Create professional email signatures for freelancers. Build custom signatures with rates, booking links, and portfolio in minutes."
        canonical="https://freelancersignature.com/builder"
        ogTitle="Email Signature Builder - FreelancerSignature"
        ogDescription="Create professional email signatures for freelancers. Build custom signatures with rates, booking links, and portfolio in minutes."
      />
      <div className="builder-header">
        <div className="header-top">
          <Link to="/" className="back-link">← Back to Home</Link>
          <UserMenu onSignInClick={() => setShowAuthModal(true)} />
        </div>
        <h1>Build Your Freelancer Signature</h1>
        <p className="header-subtitle">Stand out from competitors with a professional signature</p>
      </div>

      {/* Quick Start: Load Sample Profiles */}
      <div className="sample-profiles-section">
        <div className="sample-profiles-header">
          <h3>🚀 Quick Start: Load a Freelancer Profile</h3>
          {selectedProfile && (
            <button className="reset-btn" onClick={resetForm}>
              ✕ Clear & Start Fresh
            </button>
          )}
        </div>
        <div className="sample-profiles-grid">
          {allProfiles.map(profile => (
            <button 
              key={profile.key}
              className={`sample-btn ${selectedProfile === profile.key ? 'active' : ''}`}
              onClick={() => loadSampleProfile(profile.key)}
              disabled={isLoadingProfile || isPending}
              style={{ 
                opacity: (isLoadingProfile || isPending) ? 0.6 : 1,
                cursor: (isLoadingProfile || isPending) ? 'wait' : 'pointer'
              }}
            >
              {profile.icon} {profile.label}
            </button>
          ))}
        </div>
      </div>

      <div className="builder-content">
        <div className="builder-form">
          
          {/* Premium Upgrade Banner - Only show for non-premium users when data is loaded */}
          {shouldShowFreeLimits && (
            <div className="premium-upgrade-banner">
              <div className="premium-banner-content">
                <div className="premium-banner-left">
                  <div className="premium-banner-icon">⭐</div>
                  <div>
                    <h3>Unlock Premium Features</h3>
                    <p>Remove watermarks • Copy HTML code • Download PNG • Save up to 10 signatures</p>
                  </div>
                </div>
                <button 
                  className="premium-banner-btn"
                  onClick={handleUpgradeClick}
                >
                  Upgrade Now - $2.99/mo
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Basic Info */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">1</span>
              <div>
                <h2>Your Information</h2>
                <p className="section-hint">Tell clients who you are</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={signatureData.name} 
                  onChange={handleChange} 
                  placeholder="Jane Smith"
                  disabled={!enabledFields.name}
                />
              </div>
              <div className="form-group">
                <label>Title / What You Do *</label>
                <input 
                  type="text" 
                  name="specialty" 
                  value={signatureData.specialty} 
                  onChange={handleChange} 
                  placeholder="Freelance UI/UX Designer"
                  disabled={!enabledFields.specialty}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Company (optional)</label>
                <input 
                  type="text" 
                  name="company" 
                  value={signatureData.company} 
                  onChange={handleChange} 
                  placeholder="Your Studio Name"
                  disabled={!enabledFields.company}
                />
              </div>
              <div className="form-group">
                <label>Company Script (for elegant templates)</label>
                <input 
                  type="text" 
                  name="companyScript" 
                  value={signatureData.companyScript} 
                  onChange={handleChange} 
                  placeholder="Design Magic"
                  disabled={!enabledFields.companyScript}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={signatureData.phone} 
                  onChange={handleChange} 
                  placeholder="+1 (555) 123-4567"
                  disabled={!enabledFields.phone}
                />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input 
                  type="tel" 
                  name="mobile" 
                  value={signatureData.mobile} 
                  onChange={handleChange} 
                  placeholder="+1 (555) 987-6543"
                  disabled={!enabledFields.mobile}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={signatureData.email} 
                  onChange={handleChange} 
                  placeholder="hello@yoursite.com"
                  disabled={!enabledFields.email}
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input 
                  type="text" 
                  name="website" 
                  value={signatureData.website} 
                  onChange={handleChange} 
                  placeholder="www.yoursite.com"
                  disabled={!enabledFields.website}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address (optional)</label>
              <textarea 
                name="address" 
                value={signatureData.address} 
                onChange={handleChange} 
                placeholder="123 Main St, City, State 12345" 
                rows="2"
                disabled={!enabledFields.address}
              />
            </div>
          </div>

          {/* Step 2: Photo/Logo */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">2</span>
              <div>
                <h2>Photo & Logo</h2>
                <p className="section-hint">Add your professional photo</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Photo</label>
                <ImageUploadCrop
                  value={signatureData.photoUrl}
                  onChange={handleChange}
                  disabled={!enabledFields.photoUrl}
                  label="Photo"
                  placeholder="https://example.com/your-photo.jpg"
                  hint="Upload your photo or paste a URL. Use a professional headshot for best results."
                  fieldName="photoUrl"
                />
              </div>
              <div className="form-group">
                <label>Logo (optional)</label>
                <ImageUploadCrop
                  value={signatureData.logoUrl}
                  onChange={handleChange}
                  disabled={!enabledFields.logoUrl}
                  label="Logo"
                  placeholder="https://example.com/logo.png"
                  hint="Upload your logo or paste a URL"
                  fieldName="logoUrl"
                  aspectRatio={null}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Freelancer Features */}
          <div className="form-section freelancer-section">
            <div className="section-header">
              <span className="step-number">3</span>
              <div>
                <h2>💼 Freelancer Features</h2>
                <p className="section-hint">What makes YOU stand out from competitors</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>💰 Hourly Rate</label>
                <input 
                  type="text" 
                  name="hourlyRate" 
                  value={signatureData.hourlyRate} 
                  onChange={handleChange} 
                  placeholder="$95/hour"
                  disabled={!enabledFields.hourlyRate}
                />
                <small className="input-hint">Show clients you're worth it</small>
              </div>
              <div className="form-group">
                <label>✅ Availability</label>
                <input 
                  type="text" 
                  name="availability" 
                  value={signatureData.availability} 
                  onChange={handleChange} 
                  placeholder="Available for projects"
                  disabled={!enabledFields.availability}
                />
                <small className="input-hint">Let clients know if you're taking on work</small>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>📅 Booking Link (Calendly, Cal.com)</label>
                <input 
                  type="url" 
                  name="bookingUrl" 
                  value={signatureData.bookingUrl} 
                  onChange={handleChange} 
                  placeholder="https://calendly.com/yourname"
                  disabled={!enabledFields.bookingUrl}
                />
                <small className="input-hint">Let clients book calls directly</small>
              </div>
              <div className="form-group">
                <label>🎨 Portfolio Link</label>
                <input 
                  type="url" 
                  name="portfolioUrl" 
                  value={signatureData.portfolioUrl} 
                  onChange={handleChange} 
                  placeholder="https://dribbble.com/yourname"
                  disabled={!enabledFields.portfolioUrl}
                />
                <small className="input-hint">Show off your best work</small>
              </div>
            </div>
          </div>

          {/* Step 4: Social Links */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">4</span>
              <div>
                <h2>Social Links</h2>
                <p className="section-hint">Icons appear automatically when you add links</p>
              </div>
            </div>
            <div className="social-links-grid">
              <div className="form-group">
                <label>LinkedIn</label>
                <input type="url" value={signatureData.socialLinks.linkedin} onChange={(e) => handleSocialChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </div>
              <div className="form-group">
                <label>Instagram</label>
                <input type="url" value={signatureData.socialLinks.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} placeholder="https://instagram.com/yourhandle" />
              </div>
              <div className="form-group">
                <label>Twitter / X</label>
                <input type="url" value={signatureData.socialLinks.twitter} onChange={(e) => handleSocialChange('twitter', e.target.value)} placeholder="https://twitter.com/yourhandle" />
              </div>
              <div className="form-group">
                <label>Facebook</label>
                <input type="url" value={signatureData.socialLinks.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} placeholder="https://facebook.com/yourpage" />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input type="url" value={signatureData.socialLinks.github} onChange={(e) => handleSocialChange('github', e.target.value)} placeholder="https://github.com/username" />
              </div>
              <div className="form-group">
                <label>Dribbble</label>
                <input type="url" value={signatureData.socialLinks.dribbble} onChange={(e) => handleSocialChange('dribbble', e.target.value)} placeholder="https://dribbble.com/username" />
              </div>
              <div className="form-group">
                <label>Behance</label>
                <input type="url" value={signatureData.socialLinks.behance} onChange={(e) => handleSocialChange('behance', e.target.value)} placeholder="https://behance.net/username" />
              </div>
              <div className="form-group">
                <label>TikTok</label>
                <input type="url" value={signatureData.socialLinks.tiktok} onChange={(e) => handleSocialChange('tiktok', e.target.value)} placeholder="https://tiktok.com/@username" />
              </div>
              <div className="form-group">
                <label>YouTube</label>
                <input type="url" value={signatureData.socialLinks.youtube} onChange={(e) => handleSocialChange('youtube', e.target.value)} placeholder="https://youtube.com/channel" />
              </div>
            </div>
          </div>

          {/* Step 5: Color */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">5</span>
              <div>
                <h2>Brand Color</h2>
                <p className="section-hint">Match your brand identity</p>
              </div>
            </div>
            <div className="form-group color-picker-group">
              <div className="color-picker-row">
                <input type="color" name="color" value={signatureData.color} onChange={handleChange} />
                <span className="color-value">{signatureData.color}</span>
              </div>
              <div className="preset-colors">
                <button type="button" className="color-btn" style={{background: '#0d7377'}} onClick={() => handleChange({target: {name: 'color', value: '#0d7377'}})}></button>
                <button type="button" className="color-btn" style={{background: '#e67e22'}} onClick={() => handleChange({target: {name: 'color', value: '#e67e22'}})}></button>
                <button type="button" className="color-btn" style={{background: '#c53030'}} onClick={() => handleChange({target: {name: 'color', value: '#c53030'}})}></button>
                <button type="button" className="color-btn" style={{background: '#2563eb'}} onClick={() => handleChange({target: {name: 'color', value: '#2563eb'}})}></button>
                <button type="button" className="color-btn" style={{background: '#1a1a1a'}} onClick={() => handleChange({target: {name: 'color', value: '#1a1a1a'}})}></button>
                <button type="button" className="color-btn" style={{background: '#16a34a'}} onClick={() => handleChange({target: {name: 'color', value: '#16a34a'}})}></button>
                <button type="button" className="color-btn" style={{background: '#7c3aed'}} onClick={() => handleChange({target: {name: 'color', value: '#7c3aed'}})}></button>
                <button type="button" className="color-btn" style={{background: '#db2777'}} onClick={() => handleChange({target: {name: 'color', value: '#db2777'}})}></button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            {(!authLoading && userProfile && isPremium()) ? (
              <button onClick={handleCopy} className="btn btn-primary">
                {copied ? '✓ Copied!' : '📋 Copy HTML'}
              </button>
            ) : (
              <button 
                disabled 
                className="btn btn-primary btn-locked"
                title="Premium feature - Upgrade to unlock"
              >
                🔒 Copy HTML (Premium Only)
              </button>
            )}
            <button onClick={handleSave} className="btn btn-secondary">
              {saved ? '✓ Saved!' : '💾 Save'}
            </button>
            {currentUser && isFullyAuthenticated() && !authLoading && userProfile && (
              <div className="signature-count-info">
                <small>
                  {signatureCount} / {isPremium() ? 10 : 2} signatures saved
                  {shouldShowFreeLimits && signatureCount >= 2 && (
                    <span className="limit-reached"> (Limit reached)</span>
                  )}
                  {!shouldShowFreeLimits && isPremium() && signatureCount >= 10 && (
                    <span className="limit-reached"> (Limit reached)</span>
                  )}
                </small>
              </div>
            )}
            <button 
              onClick={handleDownload} 
              className="btn btn-secondary"
              disabled={downloading}
            >
              {downloading 
                ? '⏳ Downloading...' 
                : (!authLoading && userProfile && isPremium())
                  ? '📥 Download PNG' 
                  : '📥 Download PNG (Premium to remove watermark)'}
            </button>
            <button 
              onClick={handleDownloadPDF} 
              className="btn btn-secondary"
              disabled={downloadingPDF}
            >
              {downloadingPDF 
                ? '⏳ Downloading...' 
                : (!authLoading && userProfile && isPremium())
                  ? '📄 Download PDF' 
                  : '📄 Download PDF (Premium to remove watermark)'}
            </button>
          </div>
        </div>

        <div className="builder-preview">
          <div className="preview-header">
            <h2>Live Preview</h2>
            <p>This is how your signature will look</p>
          </div>
          
          <div className="preview-container" ref={previewRef}>
            {(isLoadingProfile || isPending) ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px',
                color: '#666',
                fontSize: '14px'
              }}>
                Loading preview...
              </div>
            ) : (
              <ErrorBoundary>
                <SignaturePreview 
                  key={`${selectedProfile || 'default'}-${selectedTemplate}-${Date.now()}`}
                  signatureData={signatureData} 
                  showWatermark={shouldShowFreeLimits} 
                />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>

      {/* Premium CTA Box - Fixed at bottom */}
      {shouldShowFreeLimits && (
        <div className="premium-cta-box-fixed">
          <div className="premium-cta-content">
            <div className="premium-cta-icon">🔒</div>
            <div className="premium-cta-text">
              <strong>Free Plan Limitations:</strong>
              <ul>
                <li>Watermark on all signatures</li>
                <li>Cannot copy HTML code</li>
                <li>Only 2 saved signatures</li>
              </ul>
            </div>
          </div>
          <button 
            className="premium-cta-button"
            onClick={handleUpgradeClick}
          >
            🚀 Upgrade to Premium - $2.99/mo
          </button>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        requiredAction={authAction}
      />
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default SignatureBuilder;
