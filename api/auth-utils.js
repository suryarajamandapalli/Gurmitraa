import crypto from "crypto";

const DEFAULT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getJwtSecret(env) {
  return (
    env?.ADMIN_JWT_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    env?.MASTER_PASSWORD ||
    process.env.MASTER_PASSWORD ||
    "gurmitraa_secure_jwt_secret_2026_production"
  );
}

export function getMasterPassword(env) {
  return (
    env?.MASTER_PASSWORD ||
    process.env.MASTER_PASSWORD ||
    env?.MASTER_PASS ||
    process.env.MASTER_PASS ||
    "gurmitraa2026"
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token
 */
export function createSessionToken(email, secret, customExpiryMs = DEFAULT_EXPIRY_MS) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Date.now();
  const payload = {
    sub: email,
    iat: now,
    exp: now + customExpiryMs,
    jti: crypto.randomBytes(16).toString("hex"),
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64url");

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 session token with timing-safe check
 */
export function verifySessionToken(token, secret) {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing token" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed token structure" };
  }

  const [encodedHeader, encodedPayload, receivedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64url");

  // Constant-time signature comparison
  const expectedBuf = Buffer.from(expectedSignature);
  const receivedBuf = Buffer.from(receivedSignature);

  if (expectedBuf.length !== receivedBuf.length) {
    return { valid: false, error: "Invalid signature length" };
  }

  if (!crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    return { valid: false, error: "Invalid signature" };
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, error: "Session token expired", expired: true };
    }
    return { valid: true, payload, email: payload.sub };
  } catch {
    return { valid: false, error: "Invalid payload JSON" };
  }
}

/**
 * Hash password using PBKDF2 with salt
 */
export function hashPassword(password, salt) {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, "sha512").toString("hex");
  return { hash, salt: actualSalt };
}

/**
 * Verify password against PBKDF2 hash
 */
export function verifyPassword(password, storedHash, salt) {
  const { hash } = hashPassword(password, salt);
  const hashBuf = Buffer.from(hash);
  const storedBuf = Buffer.from(storedHash);
  if (hashBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, storedBuf);
}

/**
 * Universal authentication helper for both Node req/res and Web Request (Edge)
 */
export function authenticateRequest(req, env) {
  let authHeader = "";

  if (req instanceof Request || (req && typeof req.headers?.get === "function")) {
    authHeader = req.headers.get("authorization") || req.headers.get("x-admin-token") || "";
  } else if (req && req.headers) {
    authHeader = req.headers["authorization"] || req.headers["x-admin-token"] || "";
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, status: 401, error: "Unauthorized: Missing authentication token" };
  }

  const secret = getJwtSecret(env);
  const verification = verifySessionToken(token, secret);

  if (!verification.valid) {
    return { ok: false, status: 401, error: `Unauthorized: ${verification.error}` };
  }

  return { ok: true, user: { email: verification.email }, token };
}
