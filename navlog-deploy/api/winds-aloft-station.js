// Winds and temperatures aloft for one station.
// The NWS discontinued the FB winds aloft text tables on Nov 3, 2026 (NAM retirement).
// This now pulls GFS model winds/temps (via Open-Meteo) at the station's location and
// converts them to the same altitudes and the same output format as before:
//   { winds: [ { altFt, dir, kt, tempC }, ... ] }
// so inputs.html and navlog.html don't need any changes.

// id: [lat, lon, elevation ft, region]  (NWSI 10-812, Appendix A)
const STATIONS = {
  BDL: [41.9333, -72.6833, 174, "bos"],
  BGR: [44.8333, -68.8667, 192, "bos"],
  CAR: [46.8667, -68.0167, 623, "bos"],
  PWM: [43.6333, -70.3, 74, "bos"],
  EMI: [39.4833, -76.9667, 820, "bos"],
  ACK: [41.2667, -70.0167, 48, "bos"],
  BOS: [42.35, -70.9833, 20, "bos"],
  BML: [44.6333, -71.1833, 1158, "bos"],
  ACY: [39.45, -74.5667, 76, "bos"],
  ALB: [42.7333, -73.8, 285, "bos"],
  BUF: [42.9167, -78.6333, 725, "bos"],
  JFK: [40.6167, -73.7667, 12, "bos"],
  PLB: [44.8, -73.4, 371, "bos"],
  SYR: [43.15, -76.2, 421, "bos"],
  AGC: [40.2667, -80.0333, 1252, "bos"],
  AVP: [41.2667, -75.6833, 957, "bos"],
  PSB: [40.9, -77.9833, 1948, "bos"],
  ORF: [36.8833, -76.2, 27, "bos"],
  RIC: [37.5, -77.3167, 168, "bos"],
  ROA: [37.3333, -80.0667, 1175, "bos"],
  CRW: [38.3333, -81.7667, 982, "bos"],
  EKN: [38.9, -80.0833, 1987, "bos"],
  BHM: [33.55, -86.7333, 620, "mia"],
  HSV: [34.55, -86.7667, 629, "mia"],
  MGM: [32.2167, -86.3167, 221, "mia"],
  MOB: [30.6833, -88.2333, 190, "mia"],
  EYW: [24.5833, -81.8, 4, "mia"],
  JAX: [30.4333, -81.55, 30, "mia"],
  MIA: [25.95, -80.45, 10, "mia"],
  MLB: [28.1, -80.6333, 33, "mia"],
  PFN: [30.2, -85.6667, 20, "mia"],
  PIE: [27.9, -82.6833, 11, "mia"],
  TLH: [30.55, -84.3667, 81, "mia"],
  ATL: [33.6167, -84.4333, 1026, "mia"],
  CSG: [32.6, -85.0167, 397, "mia"],
  SAV: [32.15, -81.1, 50, "mia"],
  LOU: [38.1, -85.5667, 546, "mia"],
  JAN: [32.5, -90.1667, 346, "mia"],
  HAT: [35.2667, -75.55, 11, "mia"],
  ILM: [34.35, -77.8667, 32, "mia"],
  RDU: [35.8667, -78.7833, 437, "mia"],
  CAE: [33.85, -81.05, 236, "mia"],
  CHS: [32.8833, -80.0333, 45, "mia"],
  FLO: [34.2167, -79.65, 147, "mia"],
  GSP: [34.8833, -82.2167, 972, "mia"],
  BNA: [36.1167, -86.6667, 599, "mia"],
  MEM: [35.05, -89.9667, 332, "mia"],
  TRI: [36.4667, -82.4, 1519, "mia"],
  TYS: [35.9, -83.8833, 981, "mia"],
  JOT: [41.5333, -88.3167, 582, "chi"],
  SPI: [39.8333, -89.6667, 597, "chi"],
  EVV: [38.0333, -87.5167, 418, "chi"],
  FWA: [40.9667, -85.1833, 800, "chi"],
  IND: [39.8, -86.3667, 797, "chi"],
  BRL: [40.7167, -90.9167, 698, "chi"],
  DBQ: [42.4, -90.7, 1076, "chi"],
  DSM: [41.4333, -93.6333, 957, "chi"],
  MCW: [43.0833, -93.3167, 1213, "chi"],
  GCK: [37.9167, -100.7167, 2888, "chi"],
  GLD: [39.3833, -101.6833, 3654, "chi"],
  ICT: [37.7167, -97.45, 1332, "chi"],
  SLN: [38.8667, -97.6167, 1272, "chi"],
  ECK: [43.25, -82.7167, 810, "chi"],
  MKG: [43.1667, -86.0333, 628, "chi"],
  MQT: [46.5167, -87.5833, 1419, "chi"],
  SSM: [46.4, -84.3, 690, "chi"],
  TVC: [44.6667, -85.5333, 624, "chi"],
  AXN: [45.95, -95.2167, 1425, "chi"],
  DLH: [46.8, -92.2, 1428, "chi"],
  INL: [48.55, -93.4, 1184, "chi"],
  MSP: [45.1333, -93.3667, 841, "chi"],
  CGI: [37.2167, -89.5667, 342, "chi"],
  COU: [38.8, -92.2167, 889, "chi"],
  MKC: [39.2667, -94.5833, 758, "chi"],
  SGF: [37.35, -93.3333, 1267, "chi"],
  STL: [38.85, -90.4667, 589, "chi"],
  BFF: [41.8833, -103.4667, 3965, "chi"],
  GRI: [40.9833, -98.3, 1846, "chi"],
  OMA: [41.1667, -95.7333, 983, "chi"],
  ONL: [42.4667, -98.6833, 2030, "chi"],
  DIK: [46.85, -102.7667, 2589, "chi"],
  GFK: [47.95, -97.1833, 844, "chi"],
  MOT: [48.25, -101.2833, 1715, "chi"],
  CLE: [41.35, -82.15, 792, "chi"],
  CMH: [39.9833, -82.9167, 816, "chi"],
  CVG: [39.0, -84.7, 891, "chi"],
  ABR: [45.4167, -98.3667, 1301, "chi"],
  FSD: [43.6333, -96.7667, 1429, "chi"],
  PIR: [44.3833, -100.15, 1742, "chi"],
  RAP: [43.9667, -103.0, 3182, "chi"],
  GRB: [44.55, -88.1833, 695, "chi"],
  LSE: [43.8667, -91.25, 653, "chi"],
  FSM: [35.3833, -94.2667, 468, "dfw"],
  LIT: [34.6667, -92.1667, 258, "dfw"],
  LCH: [30.1333, -93.1, 16, "dfw"],
  MSY: [30.0167, -90.1667, 4, "dfw"],
  SHV: [32.7667, -93.8, 258, "dfw"],
  ABQ: [35.0333, -106.8, 5352, "dfw"],
  FMN: [36.7333, -108.0833, 5503, "dfw"],
  ROW: [33.3333, -104.6167, 3669, "dfw"],
  TCC: [35.1667, -103.5833, 4063, "dfw"],
  ZUN: [34.95, -109.15, 6454, "dfw"],
  GAG: [36.3333, -99.8667, 2223, "dfw"],
  OKC: [35.4, -97.6333, 1295, "dfw"],
  TUL: [36.1833, -95.7833, 676, "dfw"],
  ABI: [32.4667, -99.85, 1790, "dfw"],
  AMA: [35.2833, -101.6333, 3605, "dfw"],
  BRO: [25.9167, -97.3667, 22, "dfw"],
  CLL: [30.6, -96.4167, 319, "dfw"],
  CRP: [27.9, -97.4333, 44, "dfw"],
  DAL: [32.8333, -96.85, 487, "dfw"],
  DRT: [29.3667, -100.9167, 999, "dfw"],
  ELP: [31.8, -106.2667, 3956, "dfw"],
  HOU: [29.6333, -95.2667, 47, "dfw"],
  INK: [31.8667, -103.2333, 2818, "dfw"],
  LBB: [33.7, -101.9, 3281, "dfw"],
  LRD: [27.4667, -99.4167, 508, "dfw"],
  MRF: [30.2833, -103.6167, 4848, "dfw"],
  PSX: [28.75, -96.3, 15, "dfw"],
  SAT: [28.6333, -98.45, 809, "dfw"],
  SPS: [33.9833, -98.5833, 1015, "dfw"],
  PHX: [33.4167, -111.8833, 1132, "slc"],
  PRC: [34.7, -112.4667, 5042, "slc"],
  TUS: [32.1167, -110.8167, 2630, "slc"],
  ALS: [37.3333, -105.8, 7535, "slc"],
  DEN: [39.8, -104.8833, 5333, "slc"],
  GJT: [39.05, -108.7833, 4858, "slc"],
  PUB: [38.2833, -104.4167, 4726, "slc"],
  BOI: [43.5667, -116.2333, 2858, "slc"],
  LWS: [46.3667, -116.8667, 1438, "slc"],
  PIH: [42.8667, -112.65, 4448, "slc"],
  BIL: [45.8, -108.6167, 3605, "slc"],
  DLN: [45.2333, -112.5333, 5238, "slc"],
  GPI: [48.2, -114.1667, 2972, "slc"],
  GGW: [48.2, -106.6167, 2293, "slc"],
  GTF: [47.45, -111.4, 3674, "slc"],
  MLS: [46.3667, -105.95, 2628, "slc"],
  BAM: [40.5667, -116.9167, 4532, "slc"],
  ELY: [39.2833, -114.8333, 6255, "slc"],
  LAS: [36.0667, -115.15, 2174, "slc"],
  RNO: [39.5167, -119.65, 4412, "slc"],
  BCE: [37.6833, -112.3, 7586, "slc"],
  SLC: [40.85, -111.9667, 4227, "slc"],
  CZI: [43.9833, -106.4333, 4798, "slc"],
  LND: [42.8, -108.7167, 5586, "slc"],
  MBW: [41.8333, -106.0, 7000, "slc"],
  RKS: [41.5833, -109.0, 6760, "slc"],
  BIH: [37.3667, -118.35, 4120, "sfo"],
  BLH: [33.5833, -114.75, 397, "sfo"],
  FAT: [36.8833, -119.8, 332, "sfo"],
  FOT: [40.6667, -124.2333, 390, "sfo"],
  ONT: [34.05, -117.6, 952, "sfo"],
  RBL: [40.0833, -122.2333, 354, "sfo"],
  SAC: [38.4333, -121.55, 21, "sfo"],
  SAN: [32.7333, -117.1833, 15, "sfo"],
  SBA: [34.5, -119.7667, 10, "sfo"],
  SFO: [37.6167, -122.3667, 11, "sfo"],
  SIY: [41.7833, -122.45, 2648, "sfo"],
  WJF: [34.7333, -118.2167, 2347, "sfo"],
  AST: [46.15, -123.8667, 11, "sfo"],
  IMB: [44.6333, -119.7, 5220, "sfo"],
  LKV: [42.4833, -120.5, 4728, "sfo"],
  OTH: [43.4, -124.1667, 14, "sfo"],
  PDX: [45.7333, -122.5833, 26, "sfo"],
  RDM: [44.25, -121.3, 3077, "sfo"],
  GEG: [47.55, -117.6167, 2372, "sfo"],
  SEA: [47.4333, -122.3, 429, "sfo"],
  YKM: [46.5667, -120.4333, 1095, "sfo"],
  ADK: [51.9333, -176.4167, 133, "alaska"],
  ADQ: [57.7667, -152.5833, 112, "alaska"],
  AKN: [58.7333, -156.75, 49, "alaska"],
  ANC: [61.2333, -149.55, 131, "alaska"],
  ANN: [55.05, -131.6167, 112, "alaska"],
  BET: [60.5833, -161.5833, 51, "alaska"],
  BRW: [71.2833, -156.5167, 13, "alaska"],
  BTI: [70.1667, -143.9167, 49, "alaska"],
  BTT: [66.9, -151.5, 673, "alaska"],
  CDB: [55.1833, -162.3667, 102, "alaska"],
  CZF: [61.7833, -166.0333, 457, "alaska"],
  EHM: [58.65, -162.0667, 541, "alaska"],
  FAI: [64.7167, -148.1833, 453, "alaska"],
  FYU: [66.5833, -145.0833, 431, "alaska"],
  GAL: [64.7333, -156.9333, 152, "alaska"],
  GKN: [62.15, -145.45, 21, "alaska"],
  HOM: [59.65, -151.4833, 78, "alaska"],
  JNU: [58.4333, -134.6833, 23, "alaska"],
  LUR: [68.8833, -166.1167, 12, "alaska"],
  MCG: [62.8167, -155.4, 338, "alaska"],
  MDO: [59.5, -146.3, 72, "alaska"],
  OME: [64.6167, -165.0833, 23, "alaska"],
  ORT: [63.0667, -142.0667, 1722, "alaska"],
  OTZ: [66.65, -162.9, 16, "alaska"],
  SNP: [57.15, -170.6167, 30, "alaska"],
  TKA: [62.3167, -150.1, 358, "alaska"],
  UNK: [63.8833, -160.8, 21, "alaska"],
  YAK: [59.6167, -139.5, 30, "alaska"],
  IKO: [52.95, -168.85, 73, "alaska"],
  AFM: [67.1, -157.85, 289, "alaska"],
  ITO: [19.7167, -155.05, 38, "hawaii"],
  HNL: [21.3167, -157.9167, 13, "hawaii"],
  LIH: [21.9833, -159.3333, 153, "hawaii"],
  OGG: [20.9, -156.4333, 54, "hawaii"],
  LNY: [20.7833, -156.95, 1308, "hawaii"],
  KOA: [19.7333, -156.05, 47, "hawaii"],
  JON: [16.7333, -169.5333, 7, "other_pac"],
  MAJ: [7.0667, 171.2667, 6, "other_pac"],
  KWA: [8.7167, 167.7333, 16, "other_pac"],
  MDY: [28.2, -177.3833, 13, "other_pac"],
  PPG: [-14.3333, -170.7167, 30, "other_pac"],
  TTK: [5.35, 162.9667, 11, "other_pac"],
  AWK: [19.2833, 166.65, 14, "other_pac"],
  GRO: [14.1833, 145.2333, 607, "other_pac"],
  GSN: [15.1167, 145.7333, 215, "other_pac"],
  TNI: [15.0, 145.6167, 271, "other_pac"],
  GUM: [13.4833, 144.8, 298, "other_pac"],
  TKK: [7.4667, 151.85, 10, "other_pac"],
  PNI: [6.9833, 158.2167, 8, "other_pac"],
  ROR: [7.3667, 134.55, 176, "other_pac"],
};

const LEVELS_HPA = [1000, 975, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 250, 200, 150];
const FT_PER_M = 3.28084;

function interp(levels, altFt, key) {
  // levels sorted by height (ft) ascending
  for (let i = 0; i < levels.length - 1; i++) {
    const a = levels[i], b = levels[i + 1];
    if (altFt >= a.hFt && altFt <= b.hFt) {
      const f = (altFt - a.hFt) / (b.hFt - a.hFt);
      return a[key] + (b[key] - a[key]) * f;
    }
  }
  return NaN;
}

export default async function handler(req, res) {
  try {
    const level = String(req.query.level || "low").toLowerCase();
    const station = String(req.query.station || "").trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(station)) {
      res.status(400).json({ error: "Station must be 3 letters (ex: JFK)" });
      return;
    }

    const info = STATIONS[station];
    if (!info) {
      res.status(404).json({ error: `Station ${station} not found` });
      return;
    }
    const [lat, lon, elevFt] = info;

    // Same altitude columns as before
    const altsLow = [3000, 6000, 9000, 12000, 18000, 24000];
    const altsHigh = [18000, 24000, 30000, 34000, 39000];
    const alts = (level === "high") ? altsHigh : altsLow;

    const vars = [];
    for (const p of LEVELS_HPA) {
      vars.push(`temperature_${p}hPa`, `wind_speed_${p}hPa`, `wind_direction_${p}hPa`, `geopotential_height_${p}hPa`);
    }

    const upstream =
      `https://api.open-meteo.com/v1/gfs?latitude=${lat}&longitude=${lon}` +
      `&hourly=${vars.join(",")}&wind_speed_unit=kn&timezone=GMT&timeformat=unixtime` +
      `&past_hours=1&forecast_hours=12`;

    const r = await fetch(upstream, {
      headers: { "Accept": "application/json", "User-Agent": "FASTNavlog/1.0 (fastnavlog.com)" },
    });

    if (!r.ok) {
      const body = await r.text();
      res.status(502).json({ error: `Upstream HTTP ${r.status}`, detail: body.slice(0, 300) });
      return;
    }

    const data = await r.json();
    const h = data && data.hourly;
    if (!h || !Array.isArray(h.time) || h.time.length === 0) {
      res.status(502).json({ error: "No forecast data returned" });
      return;
    }

    // Use the forecast hour closest to now
    const nowSec = Date.now() / 1000;
    let idx = 0;
    for (let i = 1; i < h.time.length; i++) {
      if (Math.abs(h.time[i] - nowSec) < Math.abs(h.time[idx] - nowSec)) idx = i;
    }

    // Build a profile: height (ft MSL), wind as u/v components, temperature
    const levels = [];
    for (const p of LEVELS_HPA) {
      const gh = h[`geopotential_height_${p}hPa`]?.[idx];
      const t = h[`temperature_${p}hPa`]?.[idx];
      const spd = h[`wind_speed_${p}hPa`]?.[idx];
      const dir = h[`wind_direction_${p}hPa`]?.[idx];
      if ([gh, t, spd, dir].some(v => v == null || !Number.isFinite(Number(v)))) continue;
      const hFt = Number(gh) * FT_PER_M;
      if (hFt < elevFt) continue; // pressure level is below the ground here
      const rad = Number(dir) * Math.PI / 180;
      levels.push({
        hFt,
        t: Number(t),
        u: -Number(spd) * Math.sin(rad),
        v: -Number(spd) * Math.cos(rad),
      });
    }
    levels.sort((a, b) => a.hFt - b.hFt);

    const winds = alts.map(altFt => {
      // Same convention as the old FB tables: no wind within 1,500 ft of the
      // station elevation, no temperature within 2,500 ft.
      const windOk = altFt >= elevFt + 1500;
      const tempOk = altFt >= elevFt + 2500;

      const u = interp(levels, altFt, "u");
      const v = interp(levels, altFt, "v");
      const t = interp(levels, altFt, "t");

      let dir = null, kt = NaN, tempC = null;
      if (windOk && Number.isFinite(u) && Number.isFinite(v)) {
        kt = Math.round(Math.hypot(u, v));
        let d = Math.atan2(-u, -v) * 180 / Math.PI;
        if (d < 0) d += 360;
        dir = Math.round(d / 10) * 10;
        if (dir === 0) dir = 360;
      }
      if (kt === 0) dir = null;
      if (tempOk && Number.isFinite(t)) tempC = Math.round(t);

      return { altFt, dir, kt, tempC };
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, s-maxage=900");
    res.status(200).json({
      winds,
      station,
      validTime: new Date(h.time[idx] * 1000).toISOString(),
      source: "GFS via Open-Meteo (open-meteo.com, CC BY 4.0)",
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
