/**
 * /api/proxy.js — Vercel Serverless Function
 *
 * Forwards requests to the PokeData.io API server-side,
 * eliminating all CORS issues for the browser.
 *
 * Usage from frontend:
 *   GET /api/proxy?path=/cards/search?q=charizard
 *   Header: x-pd-key: <user's JWT>
 */

// PokeData.io base URL candidates — tried in order until one succeeds
const POKEDATA_BASES = [
  'https://www.pokedata.io/api/v1',
  'https://api.pokedata.io/v1',
  'https://www.pokedata.io/api/v2',
];

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract the path the frontend wants to call
  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'Missing ?path= query parameter' });
  }

  // Get API key from request header (never exposed in the URL)
  const apiKey = req.headers['x-pd-key'];
  if (!apiKey || apiKey === 'DEMO') {
    return res.status(401).json({ error: 'Missing API key (x-pd-key header)' });
  }

  // Try each base URL
  let lastStatus = 500;
  let lastBody = '';

  for (const base of POKEDATA_BASES) {
    const targetUrl = base + path;

    try {
      const upstream = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'PokePulse/1.0',
        },
        // 10 second timeout via AbortController
        signal: AbortSignal.timeout(10000),
      });

      lastStatus = upstream.status;
      const responseText = await upstream.text();
      lastBody = responseText;

      if (upstream.ok) {
        // Cache successful responses for 60 seconds on Vercel CDN
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
        res.setHeader('X-Proxied-From', base);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(responseText);
      }

      // If 401/403, no point trying other bases — auth problem
      if (upstream.status === 401 || upstream.status === 403) {
        return res.status(upstream.status).json({
          error: `PokeData API returned ${upstream.status}`,
          detail: responseText.slice(0, 500),
          base_tried: base,
        });
      }

      // 404 might mean wrong base — keep trying
      if (upstream.status === 404) continue;

    } catch (err) {
      // Network error for this base — try next
      lastBody = err.message;
      continue;
    }
  }

  // All bases failed
  return res.status(lastStatus || 502).json({
    error: 'All PokeData.io base URLs failed',
    last_status: lastStatus,
    detail: lastBody.slice(0, 500),
    bases_tried: POKEDATA_BASES,
    hint: 'Check your API key and subscription tier at pokedata.io/pro',
  });
}
