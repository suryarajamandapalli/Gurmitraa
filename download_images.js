import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES_DIR = path.resolve('public/images');

const candidates = {
  about_gurmitraa: [
    'https://raw.githubusercontent.com/chatwoot/chatwoot/master/.github/screenshots/dashboard-dark.png'
  ],
  synapse_studio: [
    'https://raw.githubusercontent.com/open-webui/open-webui/main/demo.png'
  ],
  orbit_analytics: [
    'https://user-images.githubusercontent.com/65415371/205059737-c8a4f836-4889-4654-902e-f302b187b6a0.png'
  ],
  lumen_commerce: [
    'https://user-images.githubusercontent.com/9268745/224249510-d3c7658e-6d5c-42c5-b4fb-93eaf65a5335.png'
  ],
  mentora_learn: [
    'https://raw.githubusercontent.com/frappe/lms/main/.github/hero.png'
  ],
  about_story: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
  ],
  about_why_us: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
  ]
};

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(true);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  for (const [key, urls] of Object.entries(candidates)) {
    let success = false;
    for (const url of urls) {
      console.log(`Trying to download ${key} from ${url}...`);
      const dest = path.join(IMAGES_DIR, `${key}.png`);
      try {
        await download(url, dest);
        console.log(`Successfully downloaded ${key} to ${dest}`);
        success = true;
        break;
      } catch (err) {
        console.warn(`Failed downloading ${url}: ${err.message}`);
      }
    }
    if (!success) {
      console.error(`Could not download any candidate for ${key}`);
    }
  }
}

main().catch(console.error);
