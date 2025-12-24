/**
 * Server-side signature API service
 * All premium features are validated server-side for security
 */

import { auth } from '../firebase/config';

const FUNCTIONS_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || 
  'https://us-central1-freelancersignature.cloudfunctions.net';

/**
 * Get Firebase ID token for authentication
 */
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Get signature HTML code (server-side validated)
 * @param {string} signatureId - Signature ID
 * @returns {Promise<{html: string, showWatermark: boolean, isPremium: boolean}>}
 */
export async function getSignatureHTML(signatureId) {
  try {
    const idToken = await getIdToken();
    
    const response = await fetch(`${FUNCTIONS_BASE_URL}/getSignatureHTML`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ signatureId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get signature HTML');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting signature HTML:', error);
    throw error;
  }
}

/**
 * Get signature HTML for download (server-side validated)
 * @param {string} signatureId - Signature ID
 * @returns {Promise<{html: string, showWatermark: boolean, isPremium: boolean}>}
 */
export async function getSignatureHTMLForDownload(signatureId) {
  try {
    const idToken = await getIdToken();
    
    const response = await fetch(`${FUNCTIONS_BASE_URL}/getSignatureHTMLForDownload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ signatureId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get signature HTML for download');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting signature HTML for download:', error);
    throw error;
  }
}

/**
 * Get signature HTML from data (for unsaved signatures)
 * @param {object} signatureData - Signature data object
 * @returns {Promise<{html: string, showWatermark: boolean, isPremium: boolean}>}
 */
export async function getSignatureHTMLFromData(signatureData) {
  try {
    const idToken = await getIdToken();
    
    const response = await fetch(`${FUNCTIONS_BASE_URL}/getSignatureHTMLFromData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ signatureData })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get signature HTML from data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting signature HTML from data:', error);
    throw error;
  }
}
