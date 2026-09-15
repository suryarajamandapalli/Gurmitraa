import { createSessionToken, getJwtSecret, getMasterPassword } from "./_utils/auth-utils.js";

async function parseBody(req) {
  if (req instanceof Request || (req && typeof req.json === "function")) {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }

  if (typeof req.body === "object" && req.body !== null) {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  // Edge runtime
  if (req instanceof Request || (req && typeof req.json === "function" && !res)) {
    return handleWebRequest(req);
  }

  // Node runtime
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
  }

  try {
    const body = await parseBody(req);
    const email = (body?.email || "").trim().toLowerCase();
    const password = (body?.password || "").trim();

    if (!email || !password) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Email and password are required" }));
    }

    const masterPass = getMasterPassword();
    const isMaster = password === masterPass;

    let isValid = isMaster;

    // Check Firebase RTDB /admins if not master
    if (!isValid) {
      try {
        const rtdbRes = await fetch("https://gurumitraa-default-rtdb.firebaseio.com/admins.json", {
          signal: AbortSignal.timeout(2000),
        });
        if (rtdbRes.ok) {
          const admins = await rtdbRes.json();
          if (admins && typeof admins === "object") {
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
        console.warn("RTDB admin lookup notice:", err);
      }
    }

    if (!isValid) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Invalid email or password" }));
    }

    const secret = getJwtSecret();
    const token = createSessionToken(email, secret);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(
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
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: err.message || "Authentication failed" }));
  }
}

async function handleWebRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const email = (body?.email || "").trim().toLowerCase();
    const password = (body?.password || "").trim();

    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const masterPass = getMasterPassword(env);
    const isMaster = password === masterPass;

    let isValid = isMaster;

    if (!isValid) {
      try {
        const rtdbRes = await fetch("https://gurumitraa-default-rtdb.firebaseio.com/admins.json", {
          signal: AbortSignal.timeout(2000),
        });
        if (rtdbRes.ok) {
          const admins = await rtdbRes.json();
          if (admins && typeof admins === "object") {
            for (const key of Object.keys(admins)) {
              const adm = admins[key];
              if (adm && adm.email?.toLowerCase() === email && adm.password === password) {
                isValid = true;
                break;
              }
            }
          }
        }
      } catch {}
    }

    if (!isValid) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const secret = getJwtSecret(env);
    const token = createSessionToken(email, secret);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          email,
          token,
          expiresAt,
          loggedInAt: Date.now(),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "Auth error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
