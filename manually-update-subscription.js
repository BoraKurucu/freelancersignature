/**
 * Manual script to update subscription status
 * Run with: node manually-update-subscription.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../gamerlinks/gamerlinks-844c5-firebase-adminsdk-fbsvc-7e0459b856.json');

// Initialize Firebase Admin for freelancersignature
const freelancerApp = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    projectId: 'freelancersignature'
  },
  'freelancersignature-manual'
);

const db = admin.firestore(freelancerApp);

async function updateSubscription() {
  const email = 'borakurucu11@gmail.com'; // Your email
  
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.error('❌ User not found! Make sure you have signed up on the website first.');
      process.exit(1);
    }
    
    console.log(`✅ Found ${snapshot.size} user(s)`);
    
    // Update subscription
    const updates = {
      subscriptionStatus: 'premium',
      planType: 'premium',
      gumroadProductId: 'pddxf',
      gumroadSubscriptionId: 'U6hZ5XWMOwpK_FJc2wmBkA==', // From latest purchase
      subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    // Calculate expiry (1 month from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    updates.subscriptionExpiry = expiryDate;
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      console.log(`Updating user: ${doc.id}`);
      batch.update(doc.ref, updates);
    });
    
    await batch.commit();
    
    console.log('✅ Subscription updated successfully!');
    console.log('   - Status: premium');
    console.log('   - Expires: ' + expiryDate.toLocaleDateString());
    console.log('\n🔄 Refresh your website to see premium features!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateSubscription();
