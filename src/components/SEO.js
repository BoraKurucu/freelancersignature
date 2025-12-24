import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({ 
  title, 
  description, 
  canonical, 
  ogTitle, 
  ogDescription, 
  ogImage 
}) {
  const baseUrl = 'https://freelancersignature.com';
  const canonicalUrl = canonical || `${baseUrl}/`;
  const fullOgImage = ogImage || `${baseUrl}/og-image.png`;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {fullOgImage && <meta property="og:image" content={fullOgImage} />}
      
      {/* Twitter */}
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {fullOgImage && <meta name="twitter:image" content={fullOgImage} />}
    </Helmet>
  );
}

export default SEO;



