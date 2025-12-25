import React from 'react';
import { templates, socialIcons } from '../utils/templates';
import './SignaturePreview.css';

function SignaturePreview({ signatureData, showWatermark = true }) {
  // Safety check - if no signatureData, return empty div to prevent blank screen
  if (!signatureData || typeof signatureData !== 'object') {
    return (
      <div className="signature-preview default-layout" style={{ padding: '20px', color: '#666' }}>
        <div>No signature data available</div>
      </div>
    );
  }

  const {
    name, email, phone, mobile, website, specialty,
    company, companyScript, tagline, address, photoUrl, logoUrl,
    hourlyRate, availability, bookingUrl, portfolioUrl,
    socialLinks = {},
    color, template,
    servicePackages,
    industry, githubStats, techStack, dribbbleShots, designTools,
    publishedArticles, certifications, yearsExperience
  } = signatureData;
  
  // Watermark component
  const renderWatermark = () => {
    if (!showWatermark) return null;
    return (
      <div className="signature-watermark">
        ✨ Created with <a href="https://freelancersignature.com" target="_blank" rel="noopener noreferrer">freelancersignature.com</a>
      </div>
    );
  };

  const templateConfig = templates[template] || templates.gradientSidebar;
  let layout = templateConfig?.layout || 'gradientSidebar';
  const accentColor = color || templateConfig?.color || '#667eea';
  
  // All layouts are now implemented - no mapping needed

  // Render social icons row
  const renderSocialIcons = (style = 'default', size = 20) => {
    const links = socialLinks || {};
    const iconList = [];
    
    if (links.facebook) iconList.push({ key: 'facebook', url: links.facebook, icon: socialIcons.facebookCircle });
    if (links.twitter) iconList.push({ key: 'twitter', url: links.twitter, icon: socialIcons.x }); // Use new X logo
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

  // Render service packages
  const renderServicePackages = () => {
    if (!servicePackages || servicePackages.length === 0) return null;
    
    return (
      <div className="service-packages-preview" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '6px' }}>💼 Service Packages:</div>
        {servicePackages.map((pkg, index) => {
          if (!pkg.name && !pkg.price) return null;
          return (
            <div key={index} style={{ fontSize: '11px', color: '#333', marginBottom: '4px' }}>
              <strong style={{ color: accentColor }}>{pkg.name || 'Package'}</strong>
              {pkg.price && <span> - {pkg.price}</span>}
              {pkg.description && <span style={{ color: '#666' }}> ({pkg.description})</span>}
            </div>
          );
        })}
      </div>
    );
  };

  // Render industry-specific info
  const renderIndustryInfo = () => {
    const items = [];
    
    if (industry === 'developer') {
      if (githubStats) items.push({ icon: '💻', text: githubStats });
      if (techStack) items.push({ icon: '⚙️', text: techStack });
    } else if (industry === 'designer') {
      if (dribbbleShots) items.push({ icon: '🎨', text: dribbbleShots });
      if (designTools) items.push({ icon: '🛠️', text: designTools });
    } else if (industry === 'writer') {
      if (publishedArticles) items.push({ icon: '📝', text: publishedArticles });
    }
    
    if (certifications) items.push({ icon: '🏆', text: certifications });
    if (yearsExperience) items.push({ icon: '📅', text: `${yearsExperience} experience` });
    
    if (items.length === 0) return null;
    
    return (
      <div className="industry-info-preview" style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '3px' }}>
            {item.icon} {item.text}
          </div>
        ))}
      </div>
    );
  };

  // Freelancer CTA section
  const renderFreelancerCTA = () => {
    const hasCTAs = bookingUrl || portfolioUrl || hourlyRate || availability || (servicePackages && servicePackages.length > 0);
    if (!hasCTAs) return null;
    
    return (
      <div className="freelancer-cta" style={{ '--accent-color': accentColor }}>
        {hourlyRate && <div className="rate-badge">{hourlyRate}</div>}
        {availability && <div className="availability-badge">{availability}</div>}
        {bookingUrl && (
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="booking-btn">
            Book a Call
          </a>
        )}
        {portfolioUrl && (
          <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="portfolio-link">
            View Portfolio
          </a>
        )}
        {renderServicePackages()}
        {renderIndustryInfo()}
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

  // Layout: Creative Writer (Word-focused design)
  if (layout === 'creativeWriter') {
    return (
      <div className="signature-preview creative-writer">
        <div className="sig-writer-header" style={{ borderLeft: `5px solid ${accentColor}` }}>
          <div className="sig-writer-name">{name || 'Your Name'}</div>
          <div className="sig-writer-title" style={{ color: accentColor }}>{specialty || 'Your Title'}</div>
          {company && <div className="sig-writer-company">{company}</div>}
        </div>
        <div className="sig-writer-body">
          <div className="sig-writer-left">
            <div className="sig-writer-contact">
              {phone && <div className="writer-contact-item">
                <span className="writer-label">Phone</span>
                <span className="writer-value" style={{ color: accentColor }}>{phone}</span>
              </div>}
              {mobile && <div className="writer-contact-item">
                <span className="writer-label">Mobile</span>
                <span className="writer-value" style={{ color: accentColor }}>{mobile}</span>
              </div>}
              {email && <div className="writer-contact-item">
                <span className="writer-label">Email</span>
                <span className="writer-value" style={{ color: accentColor }}>{email}</span>
              </div>}
              {website && <div className="writer-contact-item">
                <span className="writer-label">Website</span>
                <span className="writer-value" style={{ color: accentColor }}>{website}</span>
              </div>}
            </div>
            {renderSocialIcons('writer', 20)}
          </div>
          <div className="sig-writer-right">
            {address && <div className="sig-writer-address">{address}</div>}
            {renderFreelancerCTA()}
          </div>
        </div>
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

  // Layout: Orange Banner (Bold Colorful Banner)
  if (layout === 'orangeBanner') {
    return (
      <div className="signature-preview orange-banner">
        <div className="sig-banner-top" style={{ backgroundColor: accentColor }}></div>
        <div className="sig-row">
          {photoUrl && (
            <div className="sig-photo-frame" style={{ borderColor: accentColor }}>
              <img src={photoUrl} alt={name} />
            </div>
          )}
          <div className="sig-content">
            <div className="sig-name-bold" style={{ color: accentColor }}>{name?.toUpperCase() || 'YOUR NAME'}</div>
            <div className="sig-title">{specialty || 'Your Title'}</div>
            {company && <div className="sig-company">{company}</div>}
            <div className="sig-contact-info">
              {phone && <div className="contact-info-item">📞 {phone}</div>}
              {email && <div className="contact-info-item">✉️ {email}</div>}
              {website && <div className="contact-info-item">🌐 {website}</div>}
              {address && <div className="contact-info-item">📍 {address.replace(/\n/g, ', ')}</div>}
            </div>
            {renderSocialIcons('bold', 22)}
            {renderFreelancerCTA()}
            {renderWatermark()}
          </div>
        </div>
      </div>
    );
  }

  // Layout: Yellow Hexagon (Creative Grid)
  if (layout === 'yellowHexagon') {
    return (
      <div className="signature-preview yellow-hexagon">
        <div className="sig-hex-header" style={{ backgroundColor: accentColor }}>
          <div className="sig-name-hex">{name || 'Your Name'}</div>
          <div className="sig-title-hex">{specialty || 'Your Title'}</div>
        </div>
        <div className="sig-hex-content">
          <div className="sig-hex-left">
            {photoUrl && <img src={photoUrl} alt={name} className="sig-photo-hex" />}
            {company && <div className="sig-company-hex">{company}</div>}
          </div>
          <div className="sig-hex-right">
            <div className="sig-contact-grid">
              {phone && <div className="grid-item"><strong>Phone:</strong> {phone}</div>}
              {mobile && <div className="grid-item"><strong>Mobile:</strong> {mobile}</div>}
              {email && <div className="grid-item"><strong>Email:</strong> {email}</div>}
              {website && <div className="grid-item"><strong>Web:</strong> {website}</div>}
              {address && <div className="grid-item full-width"><strong>Address:</strong> {address.replace(/\n/g, ', ')}</div>}
            </div>
            {renderSocialIcons('grid', 20)}
            {renderFreelancerCTA()}
            {renderWatermark()}
          </div>
        </div>
      </div>
    );
  }

  // Layout: Blue Modern (Corporate Blue)
  if (layout === 'blueModern') {
    return (
      <div className="signature-preview blue-modern">
        <div className="sig-blue-header">
          {company && <div className="sig-company-blue" style={{ color: accentColor }}>{company}</div>}
          <div className="sig-name-blue">{name?.toUpperCase() || 'YOUR NAME'}</div>
          <div className="sig-title-blue" style={{ color: accentColor }}>{specialty || 'Your Title'}</div>
        </div>
        <div className="sig-blue-body">
          <div className="sig-blue-left">
            <div className="sig-contact-blue">
              {phone && <div><span className="label-blue">P:</span> {phone}</div>}
              {mobile && <div><span className="label-blue">M:</span> {mobile}</div>}
              {email && <div><span className="label-blue">E:</span> {email}</div>}
              {website && <div><span className="label-blue">W:</span> {website}</div>}
              {address && <div><span className="label-blue">A:</span> {address.replace(/\n/g, ', ')}</div>}
            </div>
            {renderSocialIcons('blue', 20)}
            {renderFreelancerCTA()}
          </div>
          {photoUrl && (
            <div className="sig-blue-right">
              <img src={photoUrl} alt={name} className="sig-photo-blue" style={{ borderColor: accentColor }} />
            </div>
          )}
        </div>
        {renderWatermark()}
      </div>
    );
  }

  // Layout: Black Footer (Dark Elegant)
  if (layout === 'blackFooter') {
    return (
      <div className="signature-preview black-footer">
        <div className="sig-dark-main">
          {photoUrl && (
            <div className="sig-photo-dark">
              <img src={photoUrl} alt={name} />
            </div>
          )}
          <div className="sig-content-dark">
            <div className="sig-name-dark">{name || 'Your Name'}</div>
            <div className="sig-title-dark">{specialty || 'Your Title'}</div>
            {company && <div className="sig-company-dark">{company}</div>}
            <div className="sig-contact-dark">
              {phone && <div><img src={socialIcons.phone} alt="phone" width="14" /> {phone}</div>}
              {mobile && <div><img src={socialIcons.mobile} alt="mobile" width="14" /> {mobile}</div>}
              {email && <div><img src={socialIcons.email} alt="email" width="14" /> {email}</div>}
              {website && <div><img src={socialIcons.websiteGlobe} alt="website" width="14" /> {website}</div>}
              {address && <div><img src={socialIcons.locationPin} alt="location" width="14" /> {address.replace(/\n/g, ', ')}</div>}
            </div>
            {renderFreelancerCTA()}
          </div>
        </div>
        <div className="sig-dark-footer">
          <div className="sig-footer-content">
            <div className="sig-follow-text">Follow me</div>
            {renderSocialIcons('dark', 24)}
          </div>
        </div>
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
