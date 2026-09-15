import crypto from "crypto";
import { getMasterPassword } from "./auth-utils.js";

export default async function handler(req, res) {
  if (req instanceof Request || (req && typeof req.json === "function" && !res)) {
    return handleWebRequest(req);
  }

  // Node runtime
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch {}
    } else if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      try { body = JSON.parse(Buffer.concat(chunks).toString("utf-8")); } catch { body = {}; }
    }

    const passcode = (body?.passcode || "").trim();
    const secret = getMasterPassword();

    const passBuf = Buffer.from(passcode);
    const secretBuf = Buffer.from(secret);

    if (passBuf.length === secretBuf.length && crypto.timingSafeEqual(passBuf, secretBuf)) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ ok: true }));
    }

    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: "Invalid master passcode" }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: "Verification failed" }));
  }
}

async function handleWebRequest(request, env) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const passcode = (body?.passcode || "").trim();
  const secret = getMasterPassword(env);

  const passBuf = Buffer.from(passcode);
  const secretBuf = Buffer.from(secret);

  if (passBuf.length === secretBuf.length && crypto.timingSafeEqual(passBuf, secretBuf)) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: false, error: "Invalid passcode" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
