/**
 * Helper functions for downloading signatures
 * Used by both SignatureBuilder and MySignatures components
 */

import { 
  downloadSignatureAsPNG, 
  downloadSignatureWithWatermark, 
  downloadSignatureAsPDF, 
  downloadSignatureAsPDFWithWatermark 
} from './signatureDownloader';

/**
 * Downloads signature as PNG
 * @param {HTMLElement} signatureElement - The signature element to download
 * @param {string} filename - The filename for the downloaded image
 * @param {boolean} isPremiumUser - Whether the user is premium
 */
export const downloadSignaturePNG = async (signatureElement, filename, isPremiumUser) => {
  if (isPremiumUser) {
    await downloadSignatureAsPNG(signatureElement, filename);
  } else {
    await downloadSignatureWithWatermark(signatureElement, filename);
  }
};

/**
 * Downloads signature as PDF
 * Same logic as PNG: uses client-side element for both premium and free users
 * Watermark is added on canvas for free users (same as PNG)
 * @param {HTMLElement} signatureElement - The signature element to download
 * @param {string} filename - The filename for the downloaded PDF
 * @param {boolean} isPremiumUser - Whether the user is premium
 * @param {object|null} signatureData - Signature data (unused, kept for compatibility)
 * @param {string|null} signatureId - Signature ID (unused, kept for compatibility)
 */
export const downloadSignaturePDF = async (signatureElement, filename, isPremiumUser, signatureData = null, signatureId = null) => {
  if (!signatureElement) {
    throw new Error('Signature element is required');
  }

  // Same logic as PNG: use client-side element for both premium and free
  // Watermark is added on canvas for free users (same as PNG)
  if (isPremiumUser) {
    await downloadSignatureAsPDF(signatureElement, filename);
  } else {
    await downloadSignatureAsPDFWithWatermark(signatureElement, filename);
  }
};
