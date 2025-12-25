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
import { 
  getSignatureHTMLForDownload, 
  getSignatureHTMLFromData 
} from '../services/signatureApiService';

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
 * For free users, uses server-side HTML to enforce watermark
 * @param {HTMLElement|null} signatureElement - The signature element (for premium users) or null (for free users)
 * @param {string} filename - The filename for the downloaded PDF
 * @param {boolean} isPremiumUser - Whether the user is premium
 * @param {object|null} signatureData - Signature data (for Builder, unsaved signatures)
 * @param {string|null} signatureId - Signature ID (for MySignatures, saved signatures)
 */
export const downloadSignaturePDF = async (signatureElement, filename, isPremiumUser, signatureData = null, signatureId = null) => {
  // 1. Premium User Flow
  if (isPremiumUser) {
    if (!signatureElement) {
      throw new Error('Signature element is required for premium users');
    }
    await downloadSignatureAsPDF(signatureElement, filename);
    return;
  }

  // 2. Free User Flow (Server-side HTML)
  let tempContainer = null;
  
  try {
    let html;
    
    // Fetch HTML logic
    if (signatureId) {
      console.log('[downloadHelpers] Getting HTML for saved signature:', signatureId);
      const response = await getSignatureHTMLForDownload(signatureId);
      html = response.html;
    } else if (signatureData) {
      console.log('[downloadHelpers] Getting HTML from signature data');
      const response = await getSignatureHTMLFromData(signatureData);
      html = response.html;
    } else {
      throw new Error('Either signatureId or signatureData must be provided');
    }
    
    // Create a temporary container off-screen
    // We use off-screen positioning instead of visibility:hidden so the browser still calculates layout
    tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-10000px';
    tempContainer.style.left = '-10000px';
    tempContainer.style.zIndex = '99999';
    tempContainer.innerHTML = html;
    document.body.appendChild(tempContainer);
    
    // Find the signature element inside the server HTML
    // We look for common containers, otherwise take the first child
    let element = tempContainer.querySelector('table') || 
                  tempContainer.querySelector('.signature-container') || 
                  tempContainer.firstElementChild;
      
    if (!element) {
      throw new Error('Signature element not found in server HTML');
    }
    
    // Force visibility on the element before passing it to the downloader
    // (Just in case the server HTML has hidden states)
    element.style.display = 'block';
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    
    // Call the robust downloader
    // Note: We don't need to wait for images here because downloadSignatureAsPDFWithWatermark 
    // now handles image loading and cloning internally.
    await downloadSignatureAsPDFWithWatermark(element, filename);

  } catch (error) {
    console.error('Error in downloadSignaturePDF:', error);
    throw error;
  } finally {
    // Clean up the temporary container
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
};
