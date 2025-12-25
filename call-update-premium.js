/**
 * Call updatePremium Cloud Function
 */
const https = require('https');

const functionUrl = 'https://us-central1-freelancersignature.cloudfunctions.net/updatePremium';
const documentId = 'PWWq79UptXfkqp6ivSo8avqnOtt1';

const payload = {
  userId: documentId
};

const postData = JSON.stringify(payload);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Calling updatePremium function...');
console.log('Document ID:', documentId);
console.log('URL:', functionUrl);

const req = https.request(functionUrl, options, (res) => {
  console.log(`\n📥 Response Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response Body:', data);
    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Premium status updated!');
      console.log('🔄 Refresh your website now!');
    } else {
      console.log('\n❌ Failed!');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Error:', error.message);
});

req.write(postData);
req.end();

