// Server-side signature HTML generator
// This is a port of the client-side signatureGenerator.js

const socialIcons = {
  facebook: 'https://cdn-icons-png.flaticon.com/32/733/733547.png',
  facebookCircle: 'https://cdn-icons-png.flaticon.com/32/145/145802.png',
  twitter: 'https://cdn-icons-png.flaticon.com/32/733/733579.png',
  x: 'https://cdn-icons-png.flaticon.com/32/5968/5968958.png',
  linkedin: 'https://cdn-icons-png.flaticon.com/32/733/733561.png',
  linkedinCircle: 'https://cdn-icons-png.flaticon.com/32/174/174857.png',
  instagram: 'https://cdn-icons-png.flaticon.com/32/733/733558.png',
  instagramCircle: 'https://cdn-icons-png.flaticon.com/32/174/174855.png',
  youtube: 'https://cdn-icons-png.flaticon.com/32/733/733646.png',
  pinterest: 'https://cdn-icons-png.flaticon.com/32/145/145808.png',
  github: 'https://cdn-icons-png.flaticon.com/32/733/733553.png',
  dribbble: 'https://cdn-icons-png.flaticon.com/32/733/733544.png',
  behance: 'https://cdn-icons-png.flaticon.com/32/733/733537.png',
  tiktok: 'https://cdn-icons-png.flaticon.com/32/3046/3046121.png',
  phone: 'https://cdn-icons-png.flaticon.com/32/724/724664.png',
  phoneCircle: 'https://cdn-icons-png.flaticon.com/32/455/455705.png',
  mobile: 'https://cdn-icons-png.flaticon.com/32/0/191.png',
  email: 'https://cdn-icons-png.flaticon.com/32/561/561127.png',
  emailOutline: 'https://cdn-icons-png.flaticon.com/32/542/542689.png',
  website: 'https://cdn-icons-png.flaticon.com/32/1006/1006771.png',
  websiteGlobe: 'https://cdn-icons-png.flaticon.com/32/1239/1239682.png',
  location: 'https://cdn-icons-png.flaticon.com/32/684/684908.png',
  locationPin: 'https://cdn-icons-png.flaticon.com/32/684/684809.png',
  calendar: 'https://cdn-icons-png.flaticon.com/32/2693/2693507.png',
  portfolio: 'https://cdn-icons-png.flaticon.com/32/3135/3135715.png',
  briefcase: 'https://cdn-icons-png.flaticon.com/32/3281/3281307.png',
};

const templates = {
  gradientSidebar: {
    id: 'gradientSidebar',
    name: 'Gradient Pro',
    layout: 'gradientSidebar',
    color: '#0d7377',
  },
  orangeBanner: {
    id: 'orangeBanner',
    name: 'Orange Banner',
    layout: 'orangeBanner',
    color: '#e67e22',
  },
  yellowHexagon: {
    id: 'yellowHexagon',
    name: 'Yellow Modern',
    layout: 'yellowHexagon',
    color: '#d4a00a',
  },
  blueModern: {
    id: 'blueModern',
    name: 'Blue Corporate',
    layout: 'blueModern',
    color: '#2563eb',
  },
  blackFooter: {
    id: 'blackFooter',
    name: 'Elegant Dark',
    layout: 'blackFooter',
    color: '#1a1a1a',
  },
  scriptElegant: {
    id: 'scriptElegant',
    name: 'Script Elegant',
    layout: 'scriptElegant',
    color: '#2c3e50',
  },
  redCircle: {
    id: 'redCircle',
    name: 'Red Circle',
    layout: 'redCircle',
    color: '#c53030',
  },
  simplePhoto: {
    id: 'simplePhoto',
    name: 'Simple Clean',
    layout: 'simplePhoto',
    color: '#333333',
  },
  corporateRed: {
    id: 'corporateRed',
    name: 'Corporate Red',
    layout: 'twoColumnWithLogo',
    color: '#B91C1C',
  },
  elegantMinimal: {
    id: 'elegantMinimal',
    name: 'Elegant Minimal',
    layout: 'photoSidebar',
    color: '#1a1a1a',
  },
  corporateGreen: {
    id: 'corporateGreen',
    name: 'Corporate Green',
    layout: 'twoColumnSimple',
    color: '#2F6B3E',
  },
  scriptPersonal: {
    id: 'scriptPersonal',
    name: 'Script Personal',
    layout: 'photoWithScript',
    color: '#4a4a4a',
  },
};

// Generate watermark HTML - embedded to be hard to remove
function generateWatermark(showWatermark) {
  if (!showWatermark) return '';
  
  return `<tr><td style="padding-top:12px;border-top:1px solid #e0e0e0;margin-top:10px;">
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:11px;color:#888888;text-align:center;padding:8px 0;">
          <span style="display:inline-block;">✨ Created with </span>
          <a href="https://freelancersignature.com" target="_blank" style="color:#667eea;text-decoration:none;font-weight:600;">freelancersignature.com</a>
        </td>
      </tr>
    </table>
  </td></tr>`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Generate HTML signature (server-side)
function generateHTMLSignature(signatureData, options = {}) {
  const { showWatermark = true } = options;
  
  const {
    name, email, phone, mobile, website, specialty,
    company, tagline, address, photoUrl, logoUrl,
    socialLinks = {},
    color, template
  } = signatureData;
  
  const templateConfig = templates[template] || templates.corporateRed;
  const layout = templateConfig.layout || 'standard';
  const accentColor = color || templateConfig.color;
  
  // Helper to generate social icons HTML
  const generateSocialIconsHTML = () => {
    const links = socialLinks || {};
    let html = '';
    
    const iconMap = [
      { key: 'facebook', icon: socialIcons.facebook },
      { key: 'twitter', icon: socialIcons.x },
      { key: 'youtube', icon: socialIcons.youtube },
      { key: 'linkedin', icon: socialIcons.linkedin },
      { key: 'instagram', icon: socialIcons.instagram },
      { key: 'pinterest', icon: socialIcons.pinterest },
      { key: 'github', icon: socialIcons.github },
      { key: 'dribbble', icon: socialIcons.dribbble },
      { key: 'behance', icon: socialIcons.behance },
    ];
    
    iconMap.forEach(item => {
      if (links[item.key]) {
        const url = escapeHtml(links[item.key]);
        html += `<a href="${url}" target="_blank" style="display:inline-block;margin-right:6px;"><img src="${item.icon}" width="20" height="20" alt="${item.key}" style="border:0;"/></a>`;
      }
    });
    
    return html;
  };

  // Escape all user inputs
  const safeName = escapeHtml(name || 'Your Name');
  const safeEmail = escapeHtml(email || '');
  const safePhone = escapeHtml(phone || '');
  const safeMobile = escapeHtml(mobile || '');
  const safeWebsite = escapeHtml(website || '');
  const safeSpecialty = escapeHtml(specialty || 'Your Title');
  const safeCompany = escapeHtml(company || '');
  const safeTagline = escapeHtml(tagline || '');
  const safeAddress = escapeHtml(address || '');
  const safePhotoUrl = escapeHtml(photoUrl || '');
  const safeLogoUrl = escapeHtml(logoUrl || '');

  // Layout 1: Corporate Two-Column with Logo (Red)
  if (layout === 'twoColumnWithLogo') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#333333;border-top:3px solid ${accentColor};">
  <tr>
    <td style="padding:16px 0;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:top;padding-right:20px;border-right:2px solid ${accentColor};">
            <div style="font-weight:700;font-size:18px;color:#333333;">${safeName}</div>
            <div style="color:${accentColor};font-size:14px;">${safeSpecialty}</div>
            <div style="margin-top:12px;line-height:1.6;">
              ${safePhone ? `<div><span style="color:#666;">phone:</span> <span style="color:${accentColor};">${safePhone}</span></div>` : ''}
              ${safeMobile ? `<div><span style="color:#666;">mobile:</span> <span style="color:${accentColor};">${safeMobile}</span></div>` : ''}
            </div>
            <div style="margin-top:12px;">${generateSocialIconsHTML()}</div>
          </td>
          <td style="vertical-align:top;padding-left:20px;">
            ${safeCompany ? `<div style="color:${accentColor};font-size:24px;font-weight:700;margin-bottom:8px;">${safeLogoUrl ? `<img src="${safeLogoUrl}" alt="${safeCompany}" style="max-height:40px;"/>` : safeCompany}</div>` : ''}
            ${safeAddress ? `<div style="white-space:pre-line;">${safeAddress}</div>` : ''}
            ${safeWebsite ? `<div style="color:${accentColor};margin-top:4px;">${safeWebsite}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${generateWatermark(showWatermark)}
</table>`;
  }

  // Layout 2: Elegant Minimal with Large Photo
  if (layout === 'photoSidebar') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;color:#333333;">
  <tr>
    <td style="vertical-align:top;text-align:center;padding-right:40px;">
      <div style="width:1px;height:30px;background:#1a1a1a;margin:0 auto;"></div>
      ${safePhotoUrl ? `<img src="${safePhotoUrl}" width="160" height="160" style="border-radius:50%;margin:16px 0;object-fit:cover;" alt="${safeName}"/>` : ''}
      <div style="font-size:24px;color:#1a1a1a;margin-top:8px;">${safeName}</div>
      <div style="font-size:12px;letter-spacing:3px;color:#666;margin-top:4px;text-transform:uppercase;">${safeSpecialty}</div>
      <div style="width:1px;height:30px;background:#1a1a1a;margin:16px auto 0;"></div>
    </td>
    <td style="vertical-align:top;padding-top:10px;">
      <div style="font-size:18px;letter-spacing:4px;color:#1a1a1a;text-transform:uppercase;">${safeCompany || 'COMPANY NAME'}</div>
      <div style="font-size:12px;letter-spacing:3px;color:#666;margin-top:4px;text-transform:uppercase;">${safeTagline || 'TAGLINE'}</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:40px;font-size:14px;">
        ${safePhone ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.phone}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${safePhone}</td></tr>` : ''}
        ${safeWebsite ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.website}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${safeWebsite}</td></tr>` : ''}
        ${safeEmail ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.emailOutline}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${safeEmail}</td></tr>` : ''}
        ${safeAddress ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.locationPin}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${safeAddress}</td></tr>` : ''}
        ${generateWatermark(showWatermark)}
      </table>
    </td>
  </tr>
</table>`;
  }

  // Layout 3: Two-Column Simple with Social (Green)
  if (layout === 'twoColumnSimple') {
    const websiteUrl = safeWebsite && !safeWebsite.startsWith('http') ? 'https://' + safeWebsite : safeWebsite;
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#333333;border-top:3px solid ${accentColor};">
  <tr>
    <td style="padding:16px 0;">
      <div style="font-weight:700;font-size:18px;color:#333333;">${safeName}</div>
      <div style="color:${accentColor};font-size:14px;">${safeSpecialty}</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
        <tr>
          <td style="vertical-align:top;padding-right:40px;line-height:1.6;">
            ${safePhone ? `<div>t: <span style="color:${accentColor};">${safePhone}</span></div>` : ''}
            ${safeMobile ? `<div>m: <span style="color:${accentColor};">${safeMobile}</span></div>` : ''}
            ${safeEmail ? `<div>e: <span style="color:${accentColor};">${safeEmail}</span></div>` : ''}
          </td>
          <td style="vertical-align:top;line-height:1.6;">
            ${safeCompany ? `<div style="font-weight:600;">${safeCompany}</div>` : ''}
            ${safeAddress ? `<div style="white-space:pre-line;">${safeAddress}</div>` : ''}
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;width:100%;">
        <tr>
          <td>${generateSocialIconsHTML()}</td>
          <td style="text-align:right;">${safeWebsite ? `<a href="${websiteUrl}" style="color:${accentColor};text-decoration:none;">${safeWebsite}</a>` : ''}</td>
        </tr>
      </table>
    </td>
  </tr>
  ${generateWatermark(showWatermark)}
</table>`;
  }

  // Layout 4: Script Personal with Photo
  if (layout === 'photoWithScript') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:16px;color:#333333;">
  <tr>
    <td style="vertical-align:top;padding-right:40px;">
      ${safePhotoUrl ? `<img src="${safePhotoUrl}" width="120" height="120" style="border-radius:50%;object-fit:cover;background:#e8ddd0;" alt="${safeName}"/>` : ''}
    </td>
    <td style="vertical-align:top;">
      <div style="font-family:'Dancing Script',cursive;font-size:42px;color:#4a4a4a;line-height:1;">${safeName}</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
        ${safePhone ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.phoneCircle}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${safePhone}</td></tr>` : ''}
        ${safeEmail ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.emailOutline}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${safeEmail}</td></tr>` : ''}
        ${safeAddress ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.locationPin}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${safeAddress}</td></tr>` : ''}
        ${safeWebsite ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.websiteGlobe}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${safeWebsite}</td></tr>` : ''}
        ${generateWatermark(showWatermark)}
      </table>
    </td>
  </tr>
</table>`;
  }

  // Default standard layout
  const isDeveloper = template === 'developer';
  const bgColor = isDeveloper ? '#1a1a1a' : '#ffffff';
  const textColor = isDeveloper ? '#e0e0e0' : '#333333';
  
  const websiteUrl = safeWebsite && !safeWebsite.startsWith('http') ? 'https://' + safeWebsite : safeWebsite;
  
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;color:${textColor};background:${bgColor};padding:16px;border-radius:8px;">
  <tr>
    <td>
      ${safePhotoUrl ? `<img src="${safePhotoUrl}" width="60" height="60" style="border-radius:50%;margin-right:12px;vertical-align:middle;object-fit:cover;" alt="${safeName}"/>` : ''}
      <span style="color:${accentColor};font-size:20px;font-weight:700;">${safeName}</span>
      ${safeSpecialty ? `<span style="color:#666;font-size:14px;"> - ${safeSpecialty}</span>` : ''}
    </td>
  </tr>
  <tr>
    <td style="padding-top:12px;line-height:1.6;">
      ${safeEmail ? `<div>📧 <a href="mailto:${safeEmail}" style="color:${accentColor};text-decoration:none;">${safeEmail}</a></div>` : ''}
      ${safePhone ? `<div>📱 <a href="tel:${safePhone}" style="color:${accentColor};text-decoration:none;">${safePhone}</a></div>` : ''}
      ${safeWebsite ? `<div>🌐 <a href="${websiteUrl}" target="_blank" style="color:${accentColor};text-decoration:none;">${safeWebsite}</a></div>` : ''}
      ${safeAddress ? `<div>📍 ${safeAddress}</div>` : ''}
    </td>
  </tr>
  ${Object.keys(socialLinks || {}).length > 0 ? `<tr><td style="padding-top:12px;">${generateSocialIconsHTML()}</td></tr>` : ''}
  ${generateWatermark(showWatermark)}
</table>`;
}

module.exports = {
  generateHTMLSignature,
  generateWatermark,
};
