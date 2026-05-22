const https = require('https');

const url = 'https://gurmitraa.vercel.app/admin';

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log(`Body Length: ${body.length}`);
    if (body.includes('Loading security layer...')) {
      console.log('Verification SUCCESS: Deployed page rendered the security preloader successfully!');
    } else if (body.includes('Verify &amp; Enter Dashboard')) {
      console.log('Verification SUCCESS: Deployed page has the login form markup!');
    } else {
      console.log('Body snippet (first 500 chars):');
      console.log(body.substring(0, 500));
    }
  });
}).on('error', (e) => {
  console.error('Request failed:', e.message);
});
