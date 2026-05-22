const https = require('https');
const urlModule = require('url');

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
  console.log('--- Checking Main Page ---');
  const main = await get('/');
  console.log(`Main Page Status: ${main.statusCode}`);
  if (main.body) {
    console.log(`Main Page Body Length: ${main.body.length}`);
    // Find script tags
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(main.body)) !== null) {
      scripts.push(match[1]);
    }
    console.log('Main Page JS Scripts:', scripts);
    for (const script of scripts) {
      const scriptRes = await get(script);
      console.log(`  Script ${script}: ${scriptRes.statusCode}`);
    }
  }

  console.log('\n--- Checking Admin Page ---');
  const admin = await get('/admin');
  console.log(`Admin Page Status: ${admin.statusCode}`);
  if (admin.body) {
    console.log(`Admin Page Body Length: ${admin.body.length}`);
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(admin.body)) !== null) {
      scripts.push(match[1]);
    }
    console.log('Admin Page JS Scripts:', scripts);
    for (const script of scripts) {
      const scriptRes = await get(script);
      console.log(`  Script ${script}: ${scriptRes.statusCode}`);
    }
    
    // Check if it contains the passcode form
    if (admin.body.includes('Loading security layer...')) {
      console.log('Admin page serves the SSR loading layer state.');
    } else {
      console.log('Admin page body snippet:', admin.body.substring(0, 500));
    }
  }
}

verifyAll();
