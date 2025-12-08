// Simple script to update subscription via Firebase Admin
const admin = require('firebase-admin');

// You need to download a service account key from freelancersignature project
// Or grant permissions to the gamerlinks service account

console.log('To update your subscription:');
console.log('1. Grant permissions: https://console.firebase.google.com/project/freelancersignature/settings/iam');
console.log('2. Add: 506055949269-compute@developer.gserviceaccount.com');
console.log('3. Role: Firebase Admin SDK Administrator Service Agent');
console.log('');
console.log('OR manually update in Firestore:');
console.log('- Project: freelancersignature');
console.log('- Collection: users');
console.log('- Find your user document');
console.log('- Set subscriptionStatus: "premium"');
console.log('- Set planType: "premium"');
