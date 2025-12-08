import { templates, socialIcons } from './templates';

// Generate watermark HTML - embedded to be hard to remove
const generateWatermark = (showWatermark) => {
  if (!showWatermark) return '';
  
  // Watermark is styled to be part of the signature, not easily removed
  // Uses inline styles and table structure to integrate with email clients
  return `<tr><td style="padding-top:12px;border-top:1px solid #e0e0e0;margin-top:10px;">
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:10px;color:#999999;text-align:center;padding:8px 0;">
          <span style="display:inline-block;">✨ Created with </span>
          <a href="https://freelancersignature.com" target="_blank" style="color:#667eea;text-decoration:none;font-weight:600;">freelancersignature.com</a>
        </td>
      </tr>
    </table>
  </td></tr>`;
};

export const generateHTMLSignature = (signatureData, options = {}) => {
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
        html += `<a href="${links[item.key]}" target="_blank" style="display:inline-block;margin-right:6px;"><img src="${item.icon}" width="20" height="20" alt="${item.key}" style="border:0;"/></a>`;
      }
    });
    
    return html;
  };

  // Layout 1: Corporate Two-Column with Logo (Red)
  if (layout === 'twoColumnWithLogo') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#333333;border-top:3px solid ${accentColor};">
  <tr>
    <td style="padding:16px 0;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:top;padding-right:20px;border-right:2px solid ${accentColor};">
            <div style="font-weight:700;font-size:18px;color:#333333;">${name || 'Your Name'}</div>
            <div style="color:${accentColor};font-size:14px;">${specialty || 'Your Title'}</div>
            <div style="margin-top:12px;line-height:1.6;">
              ${phone ? `<div><span style="color:#666;">phone:</span> <span style="color:${accentColor};">${phone}</span></div>` : ''}
              ${mobile ? `<div><span style="color:#666;">mobile:</span> <span style="color:${accentColor};">${mobile}</span></div>` : ''}
            </div>
            <div style="margin-top:12px;">${generateSocialIconsHTML()}</div>
          </td>
          <td style="vertical-align:top;padding-left:20px;">
            ${company ? `<div style="color:${accentColor};font-size:24px;font-weight:700;margin-bottom:8px;">${logoUrl ? `<img src="${logoUrl}" alt="${company}" style="max-height:40px;"/>` : company}</div>` : ''}
            ${address ? `<div style="white-space:pre-line;">${address}</div>` : ''}
            ${website ? `<div style="color:${accentColor};margin-top:4px;">${website}</div>` : ''}
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
      ${photoUrl ? `<img src="${photoUrl}" width="160" height="160" style="border-radius:50%;margin:16px 0;object-fit:cover;" alt="${name}"/>` : ''}
      <div style="font-size:24px;color:#1a1a1a;margin-top:8px;">${name || 'Your Name'}</div>
      <div style="font-size:12px;letter-spacing:3px;color:#666;margin-top:4px;text-transform:uppercase;">${specialty || 'YOUR TITLE'}</div>
      <div style="width:1px;height:30px;background:#1a1a1a;margin:16px auto 0;"></div>
    </td>
    <td style="vertical-align:top;padding-top:10px;">
      <div style="font-size:18px;letter-spacing:4px;color:#1a1a1a;text-transform:uppercase;">${company || 'COMPANY NAME'}</div>
      <div style="font-size:12px;letter-spacing:3px;color:#666;margin-top:4px;text-transform:uppercase;">${tagline || 'TAGLINE'}</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:40px;font-size:14px;">
        ${phone ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.phone}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${phone}</td></tr>` : ''}
        ${website ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.website}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${website}</td></tr>` : ''}
        ${email ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.emailOutline}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${email}</td></tr>` : ''}
        ${address ? `<tr><td style="padding:5px 0;"><img src="${socialIcons.locationPin}" width="16" height="16" style="vertical-align:middle;margin-right:12px;"/>${address}</td></tr>` : ''}
        ${generateWatermark(showWatermark)}
      </table>
    </td>
  </tr>
</table>`;
  }

  // Layout 3: Two-Column Simple with Social (Green)
  if (layout === 'twoColumnSimple') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:13px;color:#333333;border-top:3px solid ${accentColor};">
  <tr>
    <td style="padding:16px 0;">
      <div style="font-weight:700;font-size:18px;color:#333333;">${name || 'Your Name'}</div>
      <div style="color:${accentColor};font-size:14px;">${specialty || 'Your Title'}</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
        <tr>
          <td style="vertical-align:top;padding-right:40px;line-height:1.6;">
            ${phone ? `<div>t: <span style="color:${accentColor};">${phone}</span></div>` : ''}
            ${mobile ? `<div>m: <span style="color:${accentColor};">${mobile}</span></div>` : ''}
            ${email ? `<div>e: <span style="color:${accentColor};">${email}</span></div>` : ''}
          </td>
          <td style="vertical-align:top;line-height:1.6;">
            ${company ? `<div style="font-weight:600;">${company}</div>` : ''}
            ${address ? `<div style="white-space:pre-line;">${address}</div>` : ''}
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;width:100%;">
        <tr>
          <td>${generateSocialIconsHTML()}</td>
          <td style="text-align:right;">${website ? `<a href="${website.startsWith('http') ? website : 'https://' + website}" style="color:${accentColor};text-decoration:none;">${website}</a>` : ''}</td>
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
      ${photoUrl ? `<img src="${photoUrl}" width="120" height="120" style="border-radius:50%;object-fit:cover;background:#e8ddd0;" alt="${name}"/>` : ''}
    </td>
    <td style="vertical-align:top;">
      <div style="font-family:'Dancing Script',cursive;font-size:42px;color:#4a4a4a;line-height:1;">${name || 'Your Name'}</div>
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
        ${phone ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.phoneCircle}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${phone}</td></tr>` : ''}
        ${email ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.emailOutline}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${email}</td></tr>` : ''}
        ${address ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.locationPin}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${address}</td></tr>` : ''}
        ${website ? `<tr><td style="padding:6px 0;"><img src="${socialIcons.websiteGlobe}" width="24" height="24" style="vertical-align:middle;margin-right:12px;"/>${website}</td></tr>` : ''}
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
  
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;color:${textColor};background:${bgColor};padding:16px;border-radius:8px;">
  <tr>
    <td>
      ${photoUrl ? `<img src="${photoUrl}" width="60" height="60" style="border-radius:50%;margin-right:12px;vertical-align:middle;object-fit:cover;" alt="${name}"/>` : ''}
      <span style="color:${accentColor};font-size:20px;font-weight:700;">${name || 'Your Name'}</span>
      ${specialty ? `<span style="color:#666;font-size:14px;"> - ${specialty}</span>` : ''}
    </td>
  </tr>
  <tr>
    <td style="padding-top:12px;line-height:1.6;">
      ${email ? `<div>📧 <a href="mailto:${email}" style="color:${accentColor};text-decoration:none;">${email}</a></div>` : ''}
      ${phone ? `<div>📱 <a href="tel:${phone}" style="color:${accentColor};text-decoration:none;">${phone}</a></div>` : ''}
      ${website ? `<div>🌐 <a href="${website.startsWith('http') ? website : 'https://' + website}" target="_blank" style="color:${accentColor};text-decoration:none;">${website}</a></div>` : ''}
      ${address ? `<div>📍 ${address}</div>` : ''}
    </td>
  </tr>
  ${Object.keys(socialLinks || {}).length > 0 ? `<tr><td style="padding-top:12px;">${generateSocialIconsHTML()}</td></tr>` : ''}
  ${generateWatermark(showWatermark)}
</table>`;
};
