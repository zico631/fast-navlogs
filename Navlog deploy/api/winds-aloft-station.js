export default async function handler(req, res) {
  try {
    const region = String(req.query.region || "bos").toLowerCase();
    const level = String(req.query.level || "low").toLowerCase();
    const station = String(req.query.station || "").trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(station)) {
      res.status(400).json({ error: "Station must be 3 letters (ex: JFK)" });
      return;
    }

    const upstream =
      `https://aviationweather.gov/api/data/winds?region=${encodeURIComponent(region)}&level=${encodeURIComponent(level)}&station=${encodeURIComponent(station)}&format=json`;

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

    const raw = await r.json();

    // ✅ Normalize to the exact shape your inputs.html expects:
    // { winds: [ { altFt, dir, kt, tempC } ... ] }
    // If upstream already matches, this will still work.
    const winds = (Array.isArray(raw) ? raw : (raw?.winds || raw?.data || []))
      .map(w => ({
        altFt: Number(w.altFt ?? w.alt ?? w.altitude ?? NaN),
        dir: (w.dir ?? w.dirDeg ?? w.direction ?? null),
        kt: Number(w.kt ?? w.spd ?? w.speed ?? NaN),
        tempC: (w.tempC ?? w.temp ?? w.temperature ?? null),
      }))
      .filter(w => Number.isFinite(w.altFt) && Number.isFinite(w.kt));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ winds });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}