export default async function handler(req, res) {
  try {
    const region = String(req.query.region || "bos").toLowerCase();
    const level = String(req.query.level || "low").toLowerCase();

    // AviationWeather winds aloft "data server" endpoints commonly return JSON.
    // If your old setup used a different upstream, we’ll adjust later.
    const upstream =
      `https://aviationweather.gov/api/data/winds?region=${encodeURIComponent(region)}&level=${encodeURIComponent(level)}&format=json`;

    const r = await fetch(upstream, {
      headers: {
        "User-Agent": "fast-navlog",
        "Accept": "application/json,text/plain,*/*",
      },
    });

    if (!r.ok) {
      res.status(r.status).json({ error: `Upstream HTTP ${r.status}` });
      return;
    }

    const data = await r.json();

    // ✅ We normalize to: { stations: ["JFK","ISP",...] }
    // Many APIs return items with station fields; we extract and dedupe.
    const stations = Array.from(new Set(
      (Array.isArray(data) ? data : (data?.data || data?.stations || []))
        .map(x => (typeof x === "string" ? x : x?.station))
        .filter(Boolean)
        .map(s => String(s).toUpperCase())
    )).sort();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ stations });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}