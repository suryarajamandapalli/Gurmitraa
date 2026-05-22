const https = require('https');

const domain = 'https://gurmitraa.vercel.app';

function get(pathOrUrl) {
  const targetUrl = pathOrUrl.startsWith('http') ? pathOrUrl : `${domain}${pathOrUrl}`;
  return new Promise((resolve) => {
    https.get(targetUrl, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          url: targetUrl,
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    }).on('error', (e) => {
      resolve({ url: targetUrl, error: e.message });
    });
  });
}

async function verifyAll() {
  console.log('--- Fetching Main Page HTML ---');
  const main = await get('/');
  console.log(`Status: ${main.statusCode}`);
  
  // Find any script tag references
  const lines = main.body.split('\n');
  console.log('Lines containing script tags in index:');
  for (const line of lines) {
    if (line.includes('<script')) {
      console.log(line.trim());
    }
  }
}

verifyAll();
