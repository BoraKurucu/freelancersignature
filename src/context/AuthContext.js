import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Create or update user profile in Firestore
  async function createUserProfile(user, additionalData = {}) {
    if (!user) return null;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user profile
        const userData = {
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          provider: user.providerData[0]?.providerId || 'unknown',
          subscriptionStatus: 'free',
          planType: null,
          subscriptionExpiry: null,
          signaturesCreated: 0,
          signaturesCopied: 0,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          ...additionalData
        };

        await setDoc(userRef, userData);
        return userData;
      } else {
        // Update last login
        await setDoc(userRef, { 
          lastLogin: serverTimestamp(),
          emailVerified: user.emailVerified
        }, { merge: true });
        return userSnap.data();
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      // Don't throw - allow auth to succeed even if profile creation fails
      return null;
    }
  }

  // Load user profile from Firestore
  async function loadUserProfile(user) {
    if (!user) {
      setUserProfile(null);
      return null;
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const profile = userSnap.data();
      setUserProfile(profile);
      return profile;
    }
    return null;
  }

  // Sign in with Google
  async function signInWithGoogle() {
    setAuthError(null);
    try {
      // Try popup first, fall back to redirect if it fails
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await createUserProfile(result.user);
        return { success: true, user: result.user };
      }
      return { success: false, error: 'no-user' };
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // If popup blocked or failed, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true, redirect: true };
        } catch (redirectError) {
          console.error('Redirect error:', redirectError);
        }
      }
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        setAuthError('An account already exists with this email using a different sign-in method. Please sign in with email/password first.');
        return { success: false, error: 'account-exists-different-credential' };
      }
      
      setAuthError(getErrorMessage(error.code));
      return { success: false, error: error.code };
    }
  }

  // Check for redirect result on page load
  async function checkRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        await createUserProfile(result.user);
        return { success: true, user: result.user };
      }
    } catch (error) {
      console.error('Redirect result error:', error);
      setAuthError(getErrorMessage(error.code));
    }
    return null;
  }

  // Sign up with email and password
  async function signUpWithEmail(email, password) {
    setAuthError(null);
    try {
      // Check if email is already used with Google
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.includes('google.com')) {
        setAuthError('This email is already registered with Google. Please sign in with Google instead.');
        return { success: false, error: 'email-used-with-google' };
      }

      if (methods.includes('password')) {
        setAuthError('An account with this email already exists. Please sign in instead.');
        return { success: false, error: 'email-already-in-use' };
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      // Create user profile
      await createUserProfile(result.user);
      
      return { 
        success: true, 
        user: result.user, 
        message: 'Account created! Please check your email to verify your account.' 
      };
    } catch (error) {
      console.error('Email sign-up error:', error);
      setAuthError(getErrorMessage(error.code));
      return { success: false, error: error.code };
    }
  }

  // Sign in with email and password
  async function signInWithEmail(email, password) {
    setAuthError(null);
    try {
      // Check what sign-in methods are available for this email
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods.length === 0) {
        setAuthError('No account found with this email. Please sign up first.');
        return { success: false, error: 'user-not-found' };
      }

      if (methods.includes('google.com') && !methods.includes('password')) {
        setAuthError('This email is registered with Google. Please sign in with Google instead.');
        return { success: false, error: 'use-google-signin' };
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!result.user.emailVerified) {
        return { 
          success: true, 
          user: result.user, 
          emailVerified: false,
          message: 'Please verify your email before continuing. Check your inbox.' 
        };
      }

      await createUserProfile(result.user);
      return { success: true, user: result.user, emailVerified: true };
    } catch (error) {
      console.error('Email sign-in error:', error);
      setAuthError(getErrorMessage(error.code));
      return { success: false, error: error.code };
    }
  }

  // Resend verification email
  async function resendVerificationEmail() {
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(currentUser);
        return { success: true, message: 'Verification email sent!' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No user to verify' };
  }

  // Sign out
  async function logout() {
    setAuthError(null);
    try {
      await signOut(auth);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.code };
    }
  }

  // Check if user can use premium features
  function isPremium() {
    if (!userProfile || userProfile.subscriptionStatus !== 'premium') {
      return false;
    }
    
    // Check if subscription has expired
    if (userProfile.subscriptionExpiry) {
      const expiryDate = userProfile.subscriptionExpiry.toDate 
        ? userProfile.subscriptionExpiry.toDate() 
        : new Date(userProfile.subscriptionExpiry);
      const now = new Date();
      
      if (expiryDate < now) {
        // Subscription expired - update status (webhook should handle this, but this is a fallback)
        return false;
      }
    }
    
    return true;
  }

  // Check if user is authenticated and verified
  function isFullyAuthenticated() {
    if (!currentUser) return false;
    // Google users are always verified
    if (userProfile?.provider === 'google.com') return true;
    // Email users need to verify their email
    return currentUser.emailVerified;
  }

  // Get human-readable error messages
  function getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
      'auth/unauthorized-domain': 'This domain is not authorized for sign-in. Please contact support or try again later.',
    };
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }

  // Listen to auth state changes and check for redirect result
  useEffect(() => {
    // Check for redirect result first
    checkRedirectResult();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    setAuthError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resendVerificationEmail,
    logout,
    isPremium,
    isFullyAuthenticated,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

