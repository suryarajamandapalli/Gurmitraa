const https = require('https');

const urls = [
  'https://gurumitraa-default-rtdb.firebaseio.com/.json',
  'https://gurumitraa.firebaseio.com/.json',
  'https://gurumitraa-default-rtdb.asia-southeast1.firebasedatabase.app/.json',
  'https://gurumitraa-default-rtdb.europe-west1.firebasedatabase.app/.json'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ url, statusCode: res.statusCode, data: data.substring(0, 100) });
      });
    });
    
    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, error: 'Timeout' });
    });
  });
}

async function main() {
  console.log('Testing gurumitraa Firebase Realtime Database URLs...');
  for (const url of urls) {
    const result = await checkUrl(url);
    console.log(JSON.stringify(result, null, 2));
  }
}

main();
