export default async function handler(req, res) {
  try {
    const region = String(req.query.region || "bos").toLowerCase();
    const level = String(req.query.level || "low").toLowerCase();

    // Winds Aloft product (text) — correct upstream is windtemp
    const upstream =
      `https://aviationweather.gov/api/data/windtemp?region=${encodeURIComponent(region)}&level=${encodeURIComponent(level)}&fcst=06&layout=off`;

    const r = await fetch(upstream, {
      headers: { "Accept": "text/plain,*/*" },
    });

    if (!r.ok) {
      res.status(r.status).json({ error: `Upstream HTTP ${r.status}` });
      return;
    }

    const text = await r.text();

    // Parse station codes from the FD text product lines:
    // Lines typically start like: "JFK 9900 2412-05 ..."
    const stationsSet = new Set();
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z]{3})\s+/);
      if (m) stationsSet.add(m[1]);
    }

    const stations = Array.from(stationsSet).sort();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ stations });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
