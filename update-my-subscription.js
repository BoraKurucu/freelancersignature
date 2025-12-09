/**
 * Quick script to update your subscription
 * This uses Firebase Admin SDK directly - no permissions issues
 */

const admin = require('firebase-admin');
const serviceAccount = require('../gamerlinks/gamerlinks-844c5-firebase-adminsdk-fbsvc-7e0459b856.json');

// Initialize with freelancersignature project ID
// But use gamerlinks service account credentials
const app = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    projectId: 'freelancersignature',
    databaseURL: 'https://freelancersignature-default-rtdb.firebaseio.com'
  },
  'freelancersignature-update'
);

const db = admin.firestore(app);

async function updateSubscription() {
  const email = 'borakurucu11@gmail.com';
  const subscriptionId = 'U6hZ5XWMOwpK_FJc2wmBkA==';
  const saleId = 'h_kTk5-hC2IHpZyHPzgchw==';
  
  try {
    console.log(`🔍 Looking for user: ${email}`);
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.error('❌ User not found! Make sure you signed up on the website.');
      process.exit(1);
    }
    
    console.log(`✅ Found user!`);
    
    // Calculate expiry (1 month from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    const updates = {
      subscriptionStatus: 'premium',
      planType: 'premium',
      gumroadProductId: 'pddxf',
      gumroadSubscriptionId: subscriptionId,
      gumroadPurchaseId: saleId,
      subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionExpiry: expiryDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      console.log(`📝 Updating user document: ${doc.id}`);
      batch.update(doc.ref, updates);
    });
    
    await batch.commit();
    
    console.log('\n✅ SUCCESS! Subscription updated!');
    console.log(`   Status: premium`);
    console.log(`   Expires: ${expiryDate.toLocaleDateString()}`);
    console.log(`\n🔄 Refresh your website to see premium features!`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 7) {
      console.error('\n❌ PERMISSION DENIED');
      console.error('You need to grant permissions first:');
      console.error('1. Go to: https://console.firebase.google.com/project/freelancersignature/settings/iam');
      console.error('2. Add member: 506055949269-compute@developer.gserviceaccount.com');
      console.error('3. Role: Firebase Admin SDK Administrator Service Agent');
    } else {
      console.error('❌ Error:', error.message);
      console.error(error);
    }
    process.exit(1);
  }
}

updateSubscription();

