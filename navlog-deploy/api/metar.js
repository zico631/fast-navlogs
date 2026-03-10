export default async function handler(req, res) {
  try {
    const icao = String(req.query.icao || "").trim().toUpperCase();
    if (!/^K[A-Z]{3}$/.test(icao)) {
      res.status(400).json({ error: "ICAO must look like KFRG" });
      return;
    }

    // Fetch METAR and airport data in parallel
    const [metarRes, airportRes] = await Promise.all([
      fetch(`https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icao)}&format=json`, { headers: { "Accept": "application/json" } }),
      fetch(`https://aviationweather.gov/api/data/airport?ids=${encodeURIComponent(icao)}&format=json`, { headers: { "Accept": "application/json" } })
    ]);

    const metarData = metarRes.ok ? await metarRes.json() : [];
    const airportData = airportRes.ok ? await airportRes.json() : [];

    const m = Array.isArray(metarData) ? metarData[0] : null;
    const a = Array.isArray(airportData) ? airportData[0] : null;

    if (!m && !a) {
      res.status(404).json({ error: `No data found for ${icao}` });
      return;
    }

    const fieldElevFt = a?.elev != null ? Math.round(a.elev * 3.28084) : null;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      icao,
      oatC: m?.temp ?? null,
      altimeterInHg: m?.altim ? Math.round((m.altim * 0.02953) * 100) / 100 : null,
      windFromDeg: m?.wdir ?? null,
      windKt: m?.wspd ?? null,
      rawOb: m?.rawOb ?? null,
      fieldElevFt,
      tpaFt: fieldElevFt != null ? Math.round(fieldElevFt / 100) * 100 + 1000 : null
    });

  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
