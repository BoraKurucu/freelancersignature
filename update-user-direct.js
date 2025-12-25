/**
 * Directly update user by Document ID using Firebase Admin SDK
 */
const admin = require('firebase-admin');

// Initialize with application default credentials
try {
  admin.initializeApp({
    projectId: 'freelancersignature'
  });
} catch (e) {
  // Already initialized
}

const db = admin.firestore();

async function updateUserDirect() {
  const documentId = 'PWWq79UptXfkqp6ivSo8avqnOtt1';
  const email = 'borakurucu11@gmail.com';
  
  try {
    console.log(`🔍 Updating user document: ${documentId}`);
    console.log(`   Email: ${email}`);
    
    const userRef = db.collection('users').doc(documentId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.error('❌ Document not found!');
      process.exit(1);
    }
    
    const currentData = userDoc.data();
    console.log('📋 Current data:');
    console.log('   subscriptionStatus:', currentData.subscriptionStatus);
    console.log('   planType:', currentData.planType);
    console.log('   email:', currentData.email);
    
    // Calculate expiry (1 month from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    const updates = {
      subscriptionStatus: 'premium',
      planType: 'premium',
      gumroadProductId: 'pddxf',
      gumroadSubscriptionId: 'manual_' + Date.now(),
      gumroadPurchaseId: 'manual_purchase_' + Date.now(),
      subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionExpiry: expiryDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    console.log('\n📝 Updating with:');
    console.log(JSON.stringify(updates, null, 2));
    
    await userRef.update(updates);
    
    console.log('\n✅ SUCCESS! User updated!');
    console.log(`   Document ID: ${documentId}`);
    console.log(`   Status: premium`);
    console.log(`   Plan: premium`);
    console.log(`   Expires: ${expiryDate.toLocaleDateString()}`);
    console.log('\n🔄 Refresh your website now!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateUserDirect();

