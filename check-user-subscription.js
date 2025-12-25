const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'freelancersignature'
});

const db = admin.firestore();

async function checkUserSubscription() {
  const email = 'borakurucu11@gmail.com';
  
  try {
    console.log(`🔍 Checking user: ${email}`);
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase().trim()).get();
    
    if (snapshot.empty) {
      console.error('❌ User not found!');
      process.exit(1);
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('\n📋 User Document:', doc.id);
      console.log('   Email:', data.email);
      console.log('   subscriptionStatus:', data.subscriptionStatus);
      console.log('   planType:', data.planType);
      console.log('   subscriptionExpiry:', data.subscriptionExpiry?.toDate?.() || data.subscriptionExpiry);
      console.log('   gumroadProductId:', data.gumroadProductId);
      console.log('   gumroadSubscriptionId:', data.gumroadSubscriptionId);
      console.log('   gumroadPurchaseId:', data.gumroadPurchaseId);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserSubscription();

