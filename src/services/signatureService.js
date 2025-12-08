import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

// Save a signature to Firestore
export const saveSignature = async (signatureData) => {
  try {
    const docRef = await addDoc(collection(db, 'signatures'), {
      ...signatureData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving signature:', error);
    throw error;
  }
};

// Get all signatures from Firestore
export const getSignatures = async () => {
  try {
    const q = query(collection(db, 'signatures'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const signatures = [];
    querySnapshot.forEach((doc) => {
      signatures.push({
        id: doc.id,
        data: doc.data()
      });
    });
    return signatures;
  } catch (error) {
    console.error('Error getting signatures:', error);
    throw error;
  }
};

// Delete a signature from Firestore
export const deleteSignature = async (signatureId) => {
  try {
    await deleteDoc(doc(db, 'signatures', signatureId));
  } catch (error) {
    console.error('Error deleting signature:', error);
    throw error;
  }
};

