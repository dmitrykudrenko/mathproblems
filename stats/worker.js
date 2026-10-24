// Anonymous answer stats for mathparadoxes.com (Cloudflare Worker + D1).
// POST {"s": slug, "k": key, "h": hints} (as text/plain, so the browser sends no preflight) counts one first
// guess and returns the problem's counts per answer key; GET ?s=slug returns them. Nothing about the visitor is
// stored: no IP, no cookies, no time stamps, only a counter per (problem, answer key, hints opened before it).
const ORIGINS = [/^https:\/\/(www\.)?mathparadoxes\.com$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const SLUG = /^[a-z0-9-]{1,60}$/;
const KEY = /^[A-Za-z0-9.|+-]{1,60}$/;
const MAX_KEYS = 1000;   // distinct answers per problem; new ones above this are dropped
const MAX_HINTS = 9;
const MAX_SLUGS = 300;   // problems; guards against filling the table with made-up slugs

function cors(req) {
  const o = req.headers.get("Origin") || "";
  return ORIGINS.some(r => r.test(o)) ? { "Access-Control-Allow-Origin": o, "Vary": "Origin" } : {};
}

function json(req, body, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json", "Cache-Control": cache, ...cors(req) },
  });
}

async function counts(db, slug) {
  const { results } = await db.prepare("SELECT k, SUM(n) AS n FROM votes WHERE slug = ? GROUP BY k").bind(slug).all();
  const k = {};
  for (const r of results) k[r.k] = r.n;
  return { s: slug, k };
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors(req), "Access-Control-Allow-Methods": "GET, POST" } });
    if (req.method === "GET") {
      const slug = new URL(req.url).searchParams.get("s") || "";
      if (!SLUG.test(slug)) return json(req, { error: "bad slug" }, 400);
      return json(req, await counts(env.DB, slug), 200, "public, max-age=60");
    }
    if (req.method !== "POST") return json(req, { error: "method" }, 405);
    if (!Object.keys(cors(req)).length) return json(req, { error: "origin" }, 403);
    let b;
    try { b = JSON.parse(await req.text()); } catch (e) { return json(req, { error: "bad json" }, 400); }
    const slug = String(b && b.s || ""), key = String(b && b.k || ""), hints = Number(b && b.h || 0);
    if (!Number.isInteger(hints) || hints < 0 || hints > MAX_HINTS) return json(req, { error: "bad hints" }, 400);
    if (!SLUG.test(slug) || !KEY.test(key)) return json(req, { error: "bad vote" }, 400);
    const known = await env.DB.prepare(
      "SELECT (SELECT COUNT(DISTINCT k) FROM votes WHERE slug = ?) AS keys, (SELECT COUNT(DISTINCT slug) FROM votes) AS slugs, " +
      "(SELECT COUNT(*) FROM votes WHERE slug = ? AND k = ?) AS has").bind(slug, slug, key).first();
    const newSlug = !known.keys, full = known.keys >= MAX_KEYS || (newSlug && known.slugs >= MAX_SLUGS);
    if (known.has || !full) {
      await env.DB.prepare("INSERT INTO votes (slug, k, h, n) VALUES (?, ?, ?, 1) ON CONFLICT (slug, k, h) DO UPDATE SET n = n + 1")
        .bind(slug, key, hints).run();
    }
    return json(req, await counts(env.DB, slug));
  },
};
