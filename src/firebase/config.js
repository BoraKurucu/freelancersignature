import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZlMWTaWroS_ra1mT3gtcecq2S_yyfQ4c",
  authDomain: "freelancersignature.firebaseapp.com",
  projectId: "freelancersignature",
  storageBucket: "freelancersignature.firebasestorage.app",
  messagingSenderId: "164526525644",
  appId: "1:164526525644:web:7fc7fb4facabeaa5044669",
  measurementId: "G-FQ6T81D5HT"
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
