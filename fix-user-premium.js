/**
 * Directly update user premium status by UID
 */
const https = require('https');

// Kullanıcının UID'sini console'dan alacağız
// Ama önce email ile bulalım
const email = 'borakurucu11@gmail.com';

const webhookUrl = 'https://us-central1-freelancersignature.cloudfunctions.net/gumroadWebhook';

// Simulate Gumroad webhook payload - but with proper email matching
const webhookPayload = {
  email: email.toLowerCase().trim(), // Ensure lowercase
  event_type: 'sale',
  short_product_id: 'pddxf',
  sale_id: 'manual_fix_' + Date.now(),
  subscription_id: 'manual_sub_' + Date.now(),
  refunded: false
};

const postData = JSON.stringify(webhookPayload);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Sending webhook to FIX premium status...');
console.log('Email:', email.toLowerCase().trim());
console.log('URL:', webhookUrl);
console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

const req = https.request(webhookUrl, options, (res) => {
  console.log(`\n📥 Response Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:', data);
    if (res.statusCode === 200) {
      console.log('\n✅ Webhook sent!');
      console.log('🔄 Wait 2-3 seconds, then refresh your website!');
    } else {
      console.log('\n❌ Webhook failed!');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Error:', error.message);
});

req.write(postData);
req.end();

