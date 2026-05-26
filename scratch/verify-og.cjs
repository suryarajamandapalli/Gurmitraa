const https = require('https');

const paths = ['/', '/about', '/services', '/products', '/portfolio', '/contact'];

function verifyPath(path) {
  return new Promise((resolve) => {
    https.get(`https://gurmitraa.vercel.app${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const ogImage = body.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
                        body.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
        const ogTitle = body.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) ||
                        body.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i);
        const twitterImage = body.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i) ||
                             body.match(/<meta[^>]*content="([^"]+)"[^>]*name="twitter:image"/i);
        const twitterCard = body.match(/<meta[^>]*name="twitter:card"[^>]*content="([^"]+)"/i) ||
                            body.match(/<meta[^>]*content="([^"]+)"[^>]*name="twitter:card"/i);
                            
        console.log(`Path: ${path}`);
        console.log(`  og:image:       ${ogImage ? ogImage[1] : 'NOT FOUND'}`);
        console.log(`  og:title:       ${ogTitle ? ogTitle[1] : 'NOT FOUND'}`);
        console.log(`  twitter:image:  ${twitterImage ? twitterImage[1] : 'NOT FOUND'}`);
        console.log(`  twitter:card:   ${twitterCard ? twitterCard[1] : 'NOT FOUND'}`);
        resolve();
      });
    }).on('error', (e) => {
      console.error(`Path: ${path} failed: ${e.message}`);
      resolve();
    });
  });
}

async function run() {
  for (const p of paths) {
    await verifyPath(p);
    console.log('---');
  }
}

run();
