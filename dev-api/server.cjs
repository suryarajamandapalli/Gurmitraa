const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const PORT = process.env.PORT || 8787;

// Read .env from project root if present
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        const key = k.trim();
        const val = v.join('=').trim().replace(/^["'](.*)["']$/, '$1');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const MASTER = process.env.MASTER_PASSWORD || process.env.MASTER_PASS || '';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || MASTER || 'dev_insecure_jwt_secret_change_in_production';
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'di6akznvb';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const DEFAULT_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'gurmitraa';

if (API_KEY && API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

function createSessionToken(email) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const payload = {
    sub: email,
    iat: now,
    exp: now + 7 * 24 * 60 * 60 * 1000,
    jti: crypto.randomBytes(16).toString('hex'),
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64url');

  return `${dataToSign}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return { valid: false, error: 'Missing token' };
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, error: 'Malformed token' };

  const [encodedHeader, encodedPayload, receivedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64url');

  const expectedBuf = Buffer.from(expectedSignature);
  const receivedBuf = Buffer.from(receivedSignature);

  if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    return { valid: false, error: 'Invalid signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: true, payload, email: payload.sub };
  } catch {
    return { valid: false, error: 'Invalid payload' };
  }
}

function authenticateReq(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return { ok: false, error: 'Unauthorized: missing token' };
  const verification = verifySessionToken(token);
  if (!verification.valid) return { ok: false, error: `Unauthorized: ${verification.error}` };
  return { ok: true, email: verification.email, token };
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Admin-Token');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = (req.url || '').split('?')[0];

  // 1. Admin Login: /api/admin-login
  if (req.method === 'POST' && url === '/api/admin-login') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const email = (parsed.email || '').trim().toLowerCase();
        const password = (parsed.password || '').trim();

        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Email and password required' }));
          return;
        }

        let isValid = password === MASTER;

        if (!isValid) {
          try {
            const rtdbRes = await fetch('https://gurumitraa-default-rtdb.firebaseio.com/admins.json', {
              signal: AbortSignal.timeout(2000),
            });
            if (rtdbRes.ok) {
              const admins = await rtdbRes.json();
              if (admins && typeof admins === 'object') {
                for (const key of Object.keys(admins)) {
                  const adm = admins[key];
                  if (adm && adm.email?.toLowerCase() === email && adm.password === password) {
                    isValid = true;
                    break;
                  }
                }
              }
            }
          } catch (err) {
            console.warn('Firebase RTDB lookup failed:', err.message);
          }
        }

        if (!isValid) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Invalid email or password' }));
          return;
        }

        const token = createSessionToken(email);
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            user: {
              email,
              token,
              expiresAt,
              loggedInAt: Date.now(),
            },
          })
        );
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Login error' }));
      }
    });
    return;
  }

  // 2. Admin Verify: /api/admin-verify
  if ((req.method === 'GET' || req.method === 'POST') && url === '/api/admin-verify') {
    const auth = authenticateReq(req);
    if (!auth.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, valid: false, error: auth.error }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, valid: true, user: { email: auth.email } }));
    return;
  }

  // 3. Verify Master Passcode (Legacy support): /api/verify-master
  if (req.method === 'POST' && url === '/api/verify-master') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const pass = (parsed.passcode || '').trim();
        const passBuf = Buffer.from(pass);
        const masterBuf = Buffer.from(MASTER);
        if (passBuf.length === masterBuf.length && crypto.timingSafeEqual(passBuf, masterBuf)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Invalid passcode' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'invalid_json' }));
      }
    });
    return;
  }

  // 4. Cloudinary Sign Endpoint: /api/cloudinary/sign or /api/cloudinary-sign
  if ((req.method === 'GET' || req.method === 'POST') && (url === '/api/cloudinary/sign' || url === '/api/cloudinary-sign')) {
    const auth = authenticateReq(req);
    if (!auth.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: auth.error }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        let folder = DEFAULT_FOLDER;
        if (body) {
          try {
            const parsed = JSON.parse(body);
            if (parsed?.folder) folder = parsed.folder;
          } catch {}
        }
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, API_SECRET);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, timestamp, signature, apiKey: API_KEY, cloudName: CLOUD_NAME, folder }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 5. Cloudinary Upload Endpoint: /api/cloudinary/upload or /api/cloudinary-upload
  if (req.method === 'POST' && (url === '/api/cloudinary/upload' || url === '/api/cloudinary-upload')) {
    const auth = authenticateReq(req);
    if (!auth.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: auth.error }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const file = parsed.file;
        const targetFolder = parsed.folder || DEFAULT_FOLDER;

        if (!file) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'No file data provided.' }));
          return;
        }

        const uploadResult = await cloudinary.uploader.upload(file, {
          folder: targetFolder,
          resource_type: 'auto',
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            data: {
              public_id: uploadResult.public_id,
              url: uploadResult.url,
              secure_url: uploadResult.secure_url,
              format: uploadResult.format,
              width: uploadResult.width,
              height: uploadResult.height,
              bytes: uploadResult.bytes,
              resource_type: uploadResult.resource_type,
              created_at: uploadResult.created_at,
            },
          })
        );
      } catch (err) {
        console.error('Cloudinary upload error in dev API:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            error: err.message || 'Failed to upload to Cloudinary.',
          })
        );
      }
    });
    return;
  }

  // 6. Cloudinary Delete Endpoint: /api/cloudinary/delete or /api/cloudinary-delete
  if (req.method === 'POST' && (url === '/api/cloudinary/delete' || url === '/api/cloudinary-delete')) {
    const auth = authenticateReq(req);
    if (!auth.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: auth.error }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const public_id = parsed.public_id;
        const resource_type = parsed.resource_type || 'image';

        if (!public_id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Missing public_id parameter.' }));
          return;
        }

        const result = await cloudinary.uploader.destroy(public_id, {
          resource_type,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, result }));
      } catch (err) {
        console.error('Cloudinary delete error in dev API:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            error: err.message || 'Failed to delete asset from Cloudinary.',
          })
        );
      }
    });
    return;
  }

  // 7. CMS Write Endpoint: /api/cms-write
  if (req.method === 'POST' && url === '/api/cms-write') {
    const auth = authenticateReq(req);
    if (!auth.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: auth.error }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const { path: cmsPath, data } = parsed;
        if (!cmsPath || data === undefined || data === null) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Missing required fields: path, data' }));
          return;
        }

        const cleanPath = cmsPath.replace(/\.json$/, '');
        const publicId = `gurmitraa/cms/${cleanPath}`;
        const jsonString = JSON.stringify(data);
        const dataUri = `data:application/json;base64,${Buffer.from(jsonString).toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          public_id: publicId,
          resource_type: 'raw',
          format: 'json',
          overwrite: true,
          invalidate: true,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, url: uploadResult.secure_url, savedAt: new Date().toISOString() }));
      } catch (err) {
        console.error('CMS write error in dev API:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message || 'CMS write failed.' }));
      }
    });
    return;
  }

  // 8. CMS Read Endpoint: /api/cms-read
  if (req.method === 'GET' && url === '/api/cms-read') {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const cmsPath = (urlObj.searchParams.get('path') || 'global').replace(/\.json$/, '');
      const cloudUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/gurmitraa/cms/${cmsPath}.json?_t=${Date.now()}`;
      
      const response = await fetch(cloudUrl, { headers: { 'Cache-Control': 'no-cache' } });
      if (!response.ok) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'CMS data not found', data: null }));
        return;
      }
      const data = await response.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, data }));
    } catch (err) {
      console.error('CMS read error in dev API:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message || 'CMS read failed.' }));
    }
    return;
  }

  // 404 for any other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found.' }));
});

server.listen(PORT, () => {
  console.log(`Dev API server listening on http://localhost:${PORT}`);
});
