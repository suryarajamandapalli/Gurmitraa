import { authenticateRequest } from "./auth-utils.js";

export default async function handler(req, res) {
  // Edge runtime
  if (req instanceof Request || (req && typeof req.json === "function" && !res)) {
    return handleWebRequest(req);
  }

  // Node runtime
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Token");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const authResult = authenticateRequest(req);
  if (!authResult.ok) {
    res.statusCode = authResult.status || 401;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: false, valid: false, error: authResult.error }));
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  return res.end(
    JSON.stringify({
      ok: true,
      valid: true,
      user: {
        email: authResult.user?.email,
      },
    })
  );
}

async function handleWebRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Admin-Token",
      },
    });
  }

  const authResult = authenticateRequest(request, env);
  if (!authResult.ok) {
    return new Response(
      JSON.stringify({ ok: false, valid: false, error: authResult.error }),
      {
        status: authResult.status || 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      valid: true,
      user: {
        email: authResult.user?.email,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    }
  );
}
