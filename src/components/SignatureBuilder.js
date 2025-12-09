import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SignaturePreview from './SignaturePreview';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';
import { saveSignature } from '../services/signatureService';
import { generateHTMLSignature } from '../utils/signatureGenerator';
import { downloadSignatureAsPNG, downloadSignatureWithWatermark } from '../utils/signatureDownloader';
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
  const { currentUser, isFullyAuthenticated, isPremium } = useAuth();
  
  const [selectedTemplate, setSelectedTemplate] = useState('gradientSidebar');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [signatureData, setSignatureData] = useState(defaultSignatureData);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('save');
  const previewRef = useRef(null);
  
  // Get enabled fields for current template
  const enabledFields = getTemplateFields(selectedTemplate);

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

  const loadSampleProfile = (profileKey) => {
    // Toggle behavior - if same profile clicked, reset to default
    if (selectedProfile === profileKey) {
      resetForm();
      return;
    }

    const profile = sampleProfiles[profileKey];
    if (profile) {
      setSelectedProfile(profileKey);
      setSignatureData({
        ...defaultSignatureData,
        ...profile,
        socialLinks: {
          ...defaultSignatureData.socialLinks,
          ...(profile.socialLinks || {}),
        },
      });
      setSelectedTemplate(profile.template);
    }
  };

  const resetForm = () => {
    setSelectedProfile(null);
    setSignatureData(defaultSignatureData);
    setSelectedTemplate('gradientSidebar');
  };

  const handleCopy = async () => {
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('copy');
      setShowAuthModal(true);
      return;
    }

    // Generate HTML with watermark (unless premium)
    const showWatermark = !isPremium();
    const htmlContent = generateHTMLSignature(signatureData, { showWatermark });
    
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('save');
      setShowAuthModal(true);
      return;
    }

    try {
      await saveSignature({
        ...signatureData,
        userId: currentUser.uid,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature. Please try again.');
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
      navigate('/premium');
    }
  };

  const handleUpgradeClick = () => {
    // Check if user is authenticated
    if (!currentUser || !isFullyAuthenticated()) {
      setAuthAction('upgrade');
      setShowAuthModal(true);
      return;
    }
    
    // If signed in, navigate to premium page
    navigate('/premium');
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Find the signature preview element
      const previewContainer = previewRef.current;
      if (!previewContainer) {
        throw new Error('Preview container not found');
      }
      
      const signatureElement = previewContainer.querySelector('.signature-preview');
      if (!signatureElement) {
        throw new Error('Signature preview element not found');
      }

      const filename = `${signatureData?.name || 'signature'}.png`;
      const isUserPremium = isPremium();

      if (isUserPremium) {
        // Premium users: download PNG without watermark
        await downloadSignatureAsPNG(signatureElement, filename);
      } else {
        // Free/non-logged-in users: download PNG with watermark
        // The downloadSignatureWithWatermark function adds watermark programmatically
        await downloadSignatureWithWatermark(signatureElement, filename);
      }
    } catch (error) {
      console.error('Error downloading signature:', error);
      alert('Failed to download signature. Please try again.');
    } finally {
      setDownloading(false);
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
            >
              {profile.icon} {profile.label}
            </button>
          ))}
        </div>
      </div>

      <div className="builder-content">
        <div className="builder-form">
          
          {/* Step 1: Choose Template */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">1</span>
              <div>
                <h2>Choose Your Style</h2>
                <p className="section-hint">Pick a layout that matches your brand</p>
              </div>
            </div>
            <div className="template-grid">
              {allTemplates.map((key) => {
                const template = templates[key];
                if (!template) return null;
                return (
                  <div
                    key={key}
                    className={`template-card ${selectedTemplate === key ? 'active' : ''}`}
                    onClick={() => handleTemplateChange(key)}
                  >
                    <div className="template-preview" style={{
                      borderTop: `4px solid ${template.color}`,
                    }}>
                      <div className="template-name">{template.name}</div>
                      <div className="template-desc">{template.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Basic Info */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">2</span>
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

          {/* Step 3: Photo/Logo */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">3</span>
              <div>
                <h2>Photo & Logo</h2>
                <p className="section-hint">Add your professional photo</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Photo URL</label>
                <input 
                  type="url" 
                  name="photoUrl" 
                  value={signatureData.photoUrl} 
                  onChange={handleChange} 
                  placeholder="https://example.com/your-photo.jpg"
                  disabled={!enabledFields.photoUrl}
                />
                <small className="input-hint">Use a professional headshot for best results</small>
              </div>
              <div className="form-group">
                <label>Logo URL (optional)</label>
                <input 
                  type="url" 
                  name="logoUrl" 
                  value={signatureData.logoUrl} 
                  onChange={handleChange} 
                  placeholder="https://example.com/logo.png"
                  disabled={!enabledFields.logoUrl}
                />
              </div>
            </div>
          </div>

          {/* Step 4: Freelancer Features */}
          <div className="form-section freelancer-section">
            <div className="section-header">
              <span className="step-number">4</span>
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

          {/* Step 5: Social Links */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">5</span>
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

          {/* Step 6: Color */}
          <div className="form-section">
            <div className="section-header">
              <span className="step-number">6</span>
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
            {isPremium() ? (
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
            <button 
              onClick={handleDownload} 
              className="btn btn-secondary"
              disabled={downloading}
            >
              {downloading 
                ? '⏳ Downloading...' 
                : isPremium() 
                  ? '📥 Download PNG' 
                  : '📥 Download PNG (Premium to remove watermark)'}
            </button>
            {!isPremium() && (
              <p className="watermark-notice">
                ✨ Free signatures include a small "Created with FreelancerSignature" link. 
                <span className="upgrade-link" onClick={handleUpgradeClick}> Upgrade to remove →</span>
              </p>
            )}
          </div>
        </div>

        <div className="builder-preview">
          <div className="preview-header">
            <h2>Live Preview</h2>
            <p>This is how your signature will look</p>
          </div>
          <div className="preview-container" ref={previewRef}>
            <SignaturePreview signatureData={signatureData} showWatermark={false} />
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        requiredAction={authAction}
      />
    </div>
  );
}

export default SignatureBuilder;
