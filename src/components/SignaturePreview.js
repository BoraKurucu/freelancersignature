import React from 'react';
import { templates, socialIcons } from '../utils/templates';
import './SignaturePreview.css';

function SignaturePreview({ signatureData, showWatermark = true }) {
  const {
    name, email, phone, mobile, website, specialty,
    company, companyScript, tagline, address, photoUrl, logoUrl,
    hourlyRate, availability, bookingUrl, portfolioUrl,
    socialLinks = {},
    color, template
  } = signatureData;
  
  // Watermark component
  const renderWatermark = () => {
    if (!showWatermark) return null;
    return (
      <div className="signature-watermark">
        ✨ Created with <a href="https://freelancersignature.web.app" target="_blank" rel="noopener noreferrer">FreelancerSignature</a>
      </div>
    );
  };

  const templateConfig = templates[template] || templates.gradientSidebar;
  const layout = templateConfig.layout || 'gradientSidebar';
  const accentColor = color || templateConfig.color;

  // Render social icons row
  const renderSocialIcons = (style = 'default', size = 20) => {
    const links = socialLinks || {};
    const iconList = [];
    
    if (links.facebook) iconList.push({ key: 'facebook', url: links.facebook, icon: socialIcons.facebookCircle });
    if (links.twitter) iconList.push({ key: 'twitter', url: links.twitter, icon: socialIcons.twitter });
    if (links.youtube) iconList.push({ key: 'youtube', url: links.youtube, icon: socialIcons.youtube });
    if (links.linkedin) iconList.push({ key: 'linkedin', url: links.linkedin, icon: socialIcons.linkedinCircle });
    if (links.instagram) iconList.push({ key: 'instagram', url: links.instagram, icon: socialIcons.instagramCircle });
    if (links.pinterest) iconList.push({ key: 'pinterest', url: links.pinterest, icon: socialIcons.pinterest });
    if (links.github) iconList.push({ key: 'github', url: links.github, icon: socialIcons.github });
    if (links.dribbble) iconList.push({ key: 'dribbble', url: links.dribbble, icon: socialIcons.dribbble });
    if (links.behance) iconList.push({ key: 'behance', url: links.behance, icon: socialIcons.behance });
    if (links.tiktok) iconList.push({ key: 'tiktok', url: links.tiktok, icon: socialIcons.tiktok });

    if (iconList.length === 0) return null;

    return (
      <div className={`social-icons-row ${style}`}>
        {iconList.map(item => (
          <a key={item.key} href={item.url} target="_blank" rel="noopener noreferrer" className="social-icon">
            <img src={item.icon} alt={item.key} width={size} height={size} />
          </a>
        ))}
      </div>
    );
  };

  // Freelancer CTA section
  const renderFreelancerCTA = () => {
    if (!bookingUrl && !portfolioUrl && !hourlyRate && !availability) return null;
    
    return (
      <div className="freelancer-cta">
        {hourlyRate && <div className="rate-badge" style={{ color: accentColor }}>💰 {hourlyRate}</div>}
        {availability && <div className="availability-badge">✅ {availability}</div>}
        {bookingUrl && (
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="booking-btn" style={{ backgroundColor: accentColor }}>
            📅 Book a Call
          </a>
        )}
        {portfolioUrl && (
          <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="portfolio-link" style={{ color: accentColor }}>
            🎨 View Portfolio →
          </a>
        )}
      </div>
    );
  };

  // Layout 1: Gradient Sidebar (Jasmine Williams style)
  if (layout === 'gradientSidebar') {
    return (
      <div className="signature-preview gradient-sidebar">
        <div className="sig-row">
          <div className="sig-gradient-left" style={{ background: `linear-gradient(180deg, ${accentColor} 0%, ${accentColor}99 100%)` }}>
            {photoUrl && <img src={photoUrl} alt={name} className="sig-photo-gradient" />}
          </div>
          <div className="sig-content-right">
            <div className="sig-name-bold" style={{ color: accentColor }}>{name || 'Your Name'}</div>
            <div className="sig-title-italic">{specialty || 'Your Title'}</div>
            {company && <div className="sig-company-italic">{company}</div>}
            <div className="sig-contact-list">
              {mobile && <div className="contact-item"><strong>Mobile</strong> {mobile}</div>}
              {phone && <div className="contact-item"><strong>Office</strong> {phone}</div>}
              {address && <div className="contact-item"><strong>Address</strong> {address.replace(/\n/g, ', ')}</div>}
            </div>
            {renderSocialIcons('gradient', 24)}
            {renderFreelancerCTA()}
            {renderWatermark()}
          </div>
        </div>
      </div>
    );
  }

  // Layout 2: Script Elegant (Melissa Johnson style)
  if (layout === 'scriptElegant') {
    return (
      <div className="signature-preview script-elegant">
        <div className="sig-row">
          {photoUrl && (
            <div className="sig-photo-section-large">
              <img src={photoUrl} alt={name} className="sig-photo-elegant" />
              {companyScript && <div className="sig-company-script">{companyScript}</div>}
            </div>
          )}
          <div className="sig-content-elegant">
            <div className="sig-name-script" style={{ fontFamily: "'Dancing Script', cursive", color: accentColor }}>{name || 'Your Name'}</div>
            <div className="sig-title-spaced">{specialty || 'Your Title'}</div>
            <div className="sig-contact-icons">
              {mobile && <div className="contact-row"><img src={socialIcons.mobile} alt="mobile" width="16" /><span>{mobile} <small>mobile</small></span></div>}
              {phone && <div className="contact-row"><img src={socialIcons.phone} alt="phone" width="16" /><span>{phone} <small>office</small></span></div>}
              {email && <div className="contact-row"><img src={socialIcons.email} alt="email" width="16" /><span>{email}</span></div>}
              {website && <div className="contact-row"><img src={socialIcons.websiteGlobe} alt="website" width="16" /><span>{website}</span></div>}
              {address && <div className="contact-row"><img src={socialIcons.locationPin} alt="location" width="16" /><span>{address.replace(/\n/g, ', ')}</span></div>}
            </div>
            <div className="sig-bottom-row">
              {renderSocialIcons('elegant', 20)}
              {logoUrl && <img src={logoUrl} alt="logo" className="sig-logo-small" />}
            </div>
            {renderFreelancerCTA()}
            {renderWatermark()}
          </div>
        </div>
      </div>
    );
  }

  // Layout 3: Red Circle (Jenny McBride style)
  if (layout === 'redCircle') {
    return (
      <div className="signature-preview red-circle">
        <div className="sig-row">
          <div className="sig-photo-col">
            {photoUrl && <img src={photoUrl} alt={name} className="sig-photo-bordered" style={{ borderColor: accentColor }} />}
            <div className="sig-name-script" style={{ fontFamily: "'Dancing Script', cursive", color: accentColor }}>{name || 'Your Name'}</div>
            {renderSocialIcons('circle', 24)}
          </div>
          <div className="sig-info-col">
            <div className="sig-name-caps" style={{ color: accentColor }}>{name?.toUpperCase() || 'YOUR NAME'}</div>
            <div className="sig-title-company">{specialty} {company && <span style={{ color: accentColor }}>// {company}</span>}</div>
            <div className="sig-contact-labeled">
              {phone && <div>C: {phone}</div>}
              {email && <div>{email}</div>}
              {website && <div>{website}</div>}
              {address && <div>{address.replace(/\n/g, ', ')}</div>}
            </div>
            {renderFreelancerCTA()}
            {renderWatermark()}
          </div>
        </div>
      </div>
    );
  }

  // Layout 4: Simple Photo (Kelly Richardson style)
  if (layout === 'simplePhoto') {
    return (
      <div className="signature-preview simple-photo">
        <div className="sig-row">
          {photoUrl && <img src={photoUrl} alt={name} className="sig-photo-simple" />}
          <div className="sig-info-simple">
            <div className="sig-name-simple">{name || 'Your Name'}</div>
            <div className="sig-title-simple">{specialty || 'Your Title'}</div>
            <div className="sig-contact-labeled">
              {phone && <div><strong>phone:</strong> {phone}</div>}
              {email && <div><strong>email:</strong> {email}</div>}
              {website && <div><strong>website:</strong> {website}</div>}
              {address && <div><strong>address:</strong> {address.replace(/\n/g, ', ')}</div>}
            </div>
            {renderSocialIcons('simple', 22)}
            {renderFreelancerCTA()}
            {renderWatermark()}
          </div>
        </div>
      </div>
    );
  }

  // Original layouts kept for compatibility
  
  // Layout: Corporate Two-Column with Logo
  if (layout === 'twoColumnWithLogo') {
    return (
      <div className="signature-preview corporate-two-column" style={{ borderTop: `3px solid ${accentColor}` }}>
        <div className="sig-main-row">
          <div className="sig-left-col">
            <div className="sig-name" style={{ fontWeight: 700, fontSize: '18px', color: '#333' }}>{name || 'Your Name'}</div>
            <div className="sig-title" style={{ color: accentColor, fontSize: '14px' }}>{specialty || 'Your Title'}</div>
            <div className="sig-contact-block">
              {phone && <div><span className="label">phone:</span> <span style={{ color: accentColor }}>{phone}</span></div>}
              {mobile && <div><span className="label">mobile:</span> <span style={{ color: accentColor }}>{mobile}</span></div>}
            </div>
            {renderSocialIcons('colored', 20)}
          </div>
          <div className="sig-divider" style={{ borderLeft: `2px solid ${accentColor}` }}></div>
          <div className="sig-right-col">
            {company && <div className="sig-company-name" style={{ color: accentColor }}>{company}</div>}
            {address && <div className="sig-address">{address}</div>}
            {website && <div className="sig-website" style={{ color: accentColor }}>{website}</div>}
          </div>
        </div>
        {renderFreelancerCTA()}
        {renderWatermark()}
      </div>
    );
  }

  // Layout: Elegant Minimal with Large Photo
  if (layout === 'photoSidebar') {
    return (
      <div className="signature-preview elegant-minimal">
        <div className="sig-main-row elegant">
          <div className="sig-photo-section">
            <div className="vertical-line top"></div>
            {photoUrl && <img src={photoUrl} alt={name} className="sig-photo-large" />}
            <div className="sig-name-below">{name || 'Your Name'}</div>
            <div className="sig-title-spaced">{specialty || 'YOUR TITLE'}</div>
            <div className="vertical-line bottom"></div>
          </div>
          <div className="sig-info-section">
            <div className="sig-company-spaced">{company || 'COMPANY NAME'}</div>
            {tagline && <div className="sig-tagline-spaced">{tagline}</div>}
            <div className="sig-contact-elegant">
              {phone && <div className="contact-line"><img src={socialIcons.phone} alt="phone" width="16" /><span>{phone}</span></div>}
              {website && <div className="contact-line"><img src={socialIcons.website} alt="website" width="16" /><span>{website}</span></div>}
              {email && <div className="contact-line"><img src={socialIcons.emailOutline} alt="email" width="16" /><span>{email}</span></div>}
              {address && <div className="contact-line"><img src={socialIcons.locationPin} alt="location" width="16" /><span>{address.replace(/\n/g, ', ')}</span></div>}
            </div>
          </div>
        </div>
        {renderFreelancerCTA()}
        {renderWatermark()}
      </div>
    );
  }

  // Layout: Two-Column Simple with Social
  if (layout === 'twoColumnSimple') {
    return (
      <div className="signature-preview corporate-simple" style={{ borderTop: `3px solid ${accentColor}` }}>
        <div className="sig-header-simple">
          <div className="sig-name">{name || 'Your Name'}</div>
          <div className="sig-title" style={{ color: accentColor }}>{specialty || 'Your Title'}</div>
        </div>
        <div className="sig-two-col">
          <div className="sig-col-left">
            {phone && <div>t: <span style={{ color: accentColor }}>{phone}</span></div>}
            {mobile && <div>m: <span style={{ color: accentColor }}>{mobile}</span></div>}
            {email && <div>e: <span style={{ color: accentColor }}>{email}</span></div>}
          </div>
          <div className="sig-col-right">
            {company && <div style={{ fontWeight: 600 }}>{company}</div>}
            {address && <div style={{ whiteSpace: 'pre-line' }}>{address}</div>}
          </div>
        </div>
        <div className="sig-footer-simple">
          {renderSocialIcons('outline', 20)}
          {website && <a href={`https://${website}`} style={{ color: accentColor }}>{website}</a>}
        </div>
        {renderFreelancerCTA()}
        {renderWatermark()}
      </div>
    );
  }

  // Layout: Script Personal with Photo
  if (layout === 'photoWithScript') {
    return (
      <div className="signature-preview script-personal">
        <div className="sig-main-row script">
          {photoUrl && <img src={photoUrl} alt={name} className="sig-photo-circle" />}
          <div className="sig-info-script">
            <div className="sig-name-script" style={{ fontFamily: "'Dancing Script', cursive" }}>{name || 'Your Name'}</div>
            <div className="sig-contact-script">
              {phone && <div className="contact-line-script"><img src={socialIcons.phoneCircle} alt="phone" width="24" /><span>{phone}</span></div>}
              {email && <div className="contact-line-script"><img src={socialIcons.emailOutline} alt="email" width="24" /><span>{email}</span></div>}
              {address && <div className="contact-line-script"><img src={socialIcons.locationPin} alt="location" width="24" /><span>{address}</span></div>}
              {website && <div className="contact-line-script"><img src={socialIcons.websiteGlobe} alt="website" width="24" /><span>{website}</span></div>}
            </div>
          </div>
        </div>
        {renderFreelancerCTA()}
        {renderWatermark()}
      </div>
    );
  }

  // Default fallback
  return (
    <div className="signature-preview default-layout">
      <div className="sig-name" style={{ color: accentColor }}>{name || 'Your Name'}</div>
      {specialty && <div className="sig-specialty">{specialty}</div>}
      {email && <div>📧 {email}</div>}
      {phone && <div>📱 {phone}</div>}
      {website && <div>🌐 {website}</div>}
      {renderSocialIcons()}
      {renderFreelancerCTA()}
      {renderWatermark()}
    </div>
  );
}

export default SignaturePreview;
