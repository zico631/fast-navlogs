function decodeWindToken(tok) {
  // tok examples:
  //  "9900" (light/variable)
  //  "2412-05" (ddff + temp)
  //  "731960" (special 100+ kt encoding possible)
  //  "////" (missing)
  const t = String(tok || "").trim().toUpperCase();
  if (!t || t === "////" || t === "//////") return { dir: null, kt: NaN, tempC: null };

  // Light/variable
  if (t.startsWith("99")) return { dir: null, kt: 0, tempC: null };

  // Split wind part and temp part.
  // Wind part is first 4 chars (ddff)
  const windPart = t.slice(0, 4);
  const dd = Number(windPart.slice(0, 2));
  const ff = Number(windPart.slice(2, 4));
  if (!Number.isFinite(dd) || !Number.isFinite(ff)) return { dir: null, kt: NaN, tempC: null };

  // Decode 100+ kt rule: dd in 51..86 means add 100 kt, subtract 50 from dd
  let dirTens = dd;
  let speed = ff;
  if (dd >= 51 && dd <= 86) {
    dirTens = dd - 50;
    speed = ff + 100;
  }

  const dir = (dirTens * 10) % 360;

  // Temp part (may be absent at 3000 ft in many products)
  let tempC = null;
  const tempPart = t.slice(4); // could be "", "-05", "05", etc.
  if (tempPart) {
    // tempPart can include sign
    const m = tempPart.match(/^(-?\d{2})$/);
    if (m) tempC = Number(m[1]);
  }

  return { dir, kt: speed, tempC };
}

export default async function handler(req, res) {
  try {
    const region = String(req.query.region || "bos").toLowerCase();
    const level = String(req.query.level || "low").toLowerCase();
    const station = String(req.query.station || "").trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(station)) {
      res.status(400).json({ error: "Station must be 3 letters (ex: JFK)" });
      return;
    }

    // Correct upstream: windtemp
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

    // Pick altitude columns based on level
    const altsLow = [3000, 6000, 9000, 12000, 18000, 24000];
    const altsHigh = [18000, 24000, 30000, 34000, 39000];
    const alts = (level === "high") ? altsHigh : altsLow;

    // Find the station line
    const lines = text.split("\n");
    const line = lines.find(l => l.trim().startsWith(station + " "));
    if (!line) {
      res.status(404).json({ error: `Station ${station} not found in product` });
      return;
    }

    const parts = line.trim().split(/\s+/); // [STN, tok1, tok2, ...]
    const toks = parts.slice(1);

    const winds = [];
    for (let i = 0; i < Math.min(alts.length, toks.length); i++) {
      const altFt = alts[i];
      const { dir, kt, tempC } = decodeWindToken(toks[i]);

      // Match what your inputs.html expects: { altFt, dir, kt, tempC }
      winds.push({
        altFt,
        dir,     // can be null
        kt,      // number (can be 0)
        tempC    // number or null
      });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ winds });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
