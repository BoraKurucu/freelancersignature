/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format
 * @param {string} url - URL string
 * @returns {boolean} True if valid
 */
export function isValidUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize URL - ensure it's safe
 * @param {string} url - URL string
 * @returns {string|null} Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  // Add https:// if no protocol
  let urlToCheck = trimmed;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    urlToCheck = `https://${trimmed}`;
  }
  
  if (isValidUrl(urlToCheck)) {
    return urlToCheck;
  }
  
  return null;
}

/**
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid format
 */
export function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  // Allow digits, spaces, dashes, parentheses, and + for international
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 7 && phone.length <= 20;
}

/**
 * Sanitize phone number
 * @param {string} phone - Phone number
 * @returns {string} Sanitized phone number
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^\d\s\-\+\(\)]/g, '').trim().slice(0, 20);
}

/**
 * Validate and sanitize signature data
 * @param {object} data - Signature data object
 * @returns {object} Sanitized signature data
 */
export function sanitizeSignatureData(data) {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized = {};
  
  // Sanitize text fields
  if (data.name) sanitized.name = sanitizeString(data.name);
  if (data.email) sanitized.email = isValidEmail(data.email) ? data.email.toLowerCase().trim() : '';
  if (data.phone) sanitized.phone = sanitizePhone(data.phone);
  if (data.mobile) sanitized.mobile = sanitizePhone(data.mobile);
  if (data.specialty) sanitized.specialty = sanitizeString(data.specialty);
  if (data.company) sanitized.company = sanitizeString(data.company);
  if (data.companyScript) sanitized.companyScript = sanitizeString(data.companyScript);
  if (data.tagline) sanitized.tagline = sanitizeString(data.tagline);
  if (data.address) sanitized.address = sanitizeString(data.address);
  
  // Sanitize URLs
  if (data.website) sanitized.website = sanitizeUrl(data.website);
  if (data.portfolioUrl) sanitized.portfolioUrl = sanitizeUrl(data.portfolioUrl);
  if (data.bookingUrl) sanitized.bookingUrl = sanitizeUrl(data.bookingUrl);
  
  // Sanitize social links
  if (data.socialLinks && typeof data.socialLinks === 'object') {
    sanitized.socialLinks = {};
    Object.keys(data.socialLinks).forEach(key => {
      const url = sanitizeUrl(data.socialLinks[key]);
      if (url) sanitized.socialLinks[key] = url;
    });
  }
  
  // Sanitize color (hex color validation)
  if (data.color) {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    sanitized.color = colorRegex.test(data.color) ? data.color : '#667eea';
  }
  
  // Validate template
  const validTemplates = [
    'gradientSidebar', 'scriptElegant', 'redCircle', 'simplePhoto',
    'twoColumnWithLogo', 'photoSidebar', 'twoColumnSimple', 'photoWithScript'
  ];
  if (data.template && validTemplates.includes(data.template)) {
    sanitized.template = data.template;
  }
  
  // Sanitize other text fields
  if (data.hourlyRate) sanitized.hourlyRate = sanitizeString(data.hourlyRate);
  if (data.availability) sanitized.availability = sanitizeString(data.availability);
  
  return sanitized;
}

/**
 * Rate limiting helper - simple in-memory rate limiter
 * Note: For production, use a proper rate limiting service
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }
  
  /**
   * Check if request is allowed
   * @param {string} key - Unique identifier (IP, user ID, etc.)
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} True if allowed
   */
  isAllowed(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const record = this.requests.get(key);
    
    if (!record) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}


