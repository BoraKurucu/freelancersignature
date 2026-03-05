import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDZlMWTaWroS_ra1mT3gtcecq2S_yyfQ4c",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "freelancersignature.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "freelancersignature",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "freelancersignature.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "164526525644",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:164526525644:web:7fc7fb4facabeaa5044669",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-FQ6T81D5HT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
