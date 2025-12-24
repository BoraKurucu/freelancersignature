/**
 * Gumroad Service
 * Handles Gumroad API integration and purchase verification
 */

// Replace with your actual Gumroad product URL
const GUMROAD_PRODUCT_URL = process.env.REACT_APP_GUMROAD_PRODUCT_URL || 'https://streamerservices.gumroad.com/l/pddxf';

/**
 * Get the Gumroad checkout URL for premium subscription
 * @param {string} email - User's email address (optional, for pre-filling)
 * @param {boolean} wanted - If true, opens checkout directly (wanted=true parameter)
 * @returns {string} - Gumroad checkout URL
 */
export function getGumroadCheckoutUrl(email = '', wanted = true) {
  const baseUrl = GUMROAD_PRODUCT_URL;
  const params = new URLSearchParams();
  
  if (wanted) {
    params.append('wanted', 'true');
  }
  
  if (email) {
    params.append('email', email);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Verify a Gumroad purchase using the Gumroad API
 * @param {string} purchaseId - The purchase ID from Gumroad
 * @param {string} accessToken - Your Gumroad access token
 * @returns {Promise<Object>} - Purchase verification result
 */
export async function verifyGumroadPurchase(purchaseId, accessToken) {
  try {
    const response = await fetch(
      `https://api.gumroad.com/v2/sales/${purchaseId}?access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        purchase: data.sale,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Purchase verification failed',
      };
    }
  } catch (error) {
    console.error('Error verifying Gumroad purchase:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Check if a purchase is a subscription
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {boolean}
 */
export function isSubscription(purchase) {
  return purchase?.subscription_id !== null && purchase?.subscription_id !== undefined;
}

/**
 * Check if a subscription is active
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {boolean}
 */
export function isSubscriptionActive(purchase) {
  if (!isSubscription(purchase)) return false;
  
  // Check if subscription is cancelled
  if (purchase.subscription_cancelled_at) {
    return false;
  }
  
  // Check if subscription has ended
  if (purchase.subscription_ended_at) {
    return false;
  }
  
  return true;
}

/**
 * Get subscription expiry date
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {Date|null}
 */
export function getSubscriptionExpiry(purchase) {
  if (!isSubscription(purchase)) return null;
  
  // Gumroad subscriptions typically renew monthly
  // The next renewal date would be in the purchase object
  if (purchase.subscription_ended_at) {
    return new Date(purchase.subscription_ended_at);
  }
  
  // If no end date, assume it's active and calculate next renewal
  // This is a fallback - webhooks will provide accurate dates
  const createdAt = new Date(purchase.created_at);
  const nextRenewal = new Date(createdAt);
  nextRenewal.setMonth(nextRenewal.getMonth() + 1);
  
  return nextRenewal;
}

/**
 * Extract user email from Gumroad purchase
 * @param {Object} purchase - Purchase object from Gumroad
 * @returns {string|null}
 */
export function getPurchaseEmail(purchase) {
  return purchase?.email || null;
}

