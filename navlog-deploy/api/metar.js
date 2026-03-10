export default async function handler(req, res) {
  try {
    const icao = String(req.query.icao || "").trim().toUpperCase();
    if (!/^K[A-Z]{3}$/.test(icao)) {
      res.status(400).json({ error: "ICAO must look like KFRG" });
      return;
    }

    const upstream = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icao)}&format=json`;
    const r = await fetch(upstream, {
      headers: { "Accept": "application/json" }
    });
    if (!r.ok) {
      res.status(r.status).json({ error: `Upstream HTTP ${r.status}` });
      return;
    }

    const data = await r.json();
    const m = Array.isArray(data) ? data[0] : null;
    if (!m) {
      res.status(404).json({ error: `No METAR found for ${icao}` });
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      icao,
      oatC: m.temp ?? null,
      altimeterInHg: m.altim ?? null,
      windFromDeg: m.wdir ?? null,
      windKt: m.wspd ?? null
    });

  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
