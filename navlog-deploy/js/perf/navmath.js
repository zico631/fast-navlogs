// navmath.js
// Small navigation math helpers (case-consistent exports)

export function norm360(deg) {
  const d = ((Number(deg) % 360) + 360) % 360;
  return d;
}

export function norm180(deg) {
  let d = ((Number(deg) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return d; // -180..+180
}

function degToRad(d) { return (Number(d) * Math.PI) / 180; }
function radToDeg(r) { return (Number(r) * 180) / Math.PI; }

/**
 * Wind Correction Angle (WCA)
 * Returns:
 *  - wcaDeg (signed, + = right, - = left)
 *  - side ("L" or "R" or "")
 *  - absDeg (rounded absolute degrees)
 */
export function computeWCA(tcDeg, windFromDeg, windKt, tasKt) {
  const tc  = Number(tcDeg);
  const wf  = Number(windFromDeg);
  const wk  = Number(windKt);
  const tas = Number(tasKt);

  if (!Number.isFinite(tc) || !Number.isFinite(wf) ||
      !Number.isFinite(wk) || !Number.isFinite(tas) || tas <= 0) {
    return { wcaDeg: 0, side: "", absDeg: 0 };
  }

  const delta = norm180(wf - tc);
  const cross = wk * Math.sin(degToRad(delta));
  const ratio = cross / tas;

  const clamped = Math.max(-1, Math.min(1, ratio));
  const wca = radToDeg(Math.asin(clamped)); // signed

  const absDeg = Math.round(Math.abs(wca));
  const side = wca < 0 ? "L" : (wca > 0 ? "R" : "");

  return { wcaDeg: wca, side, absDeg };
}

export function computeTrueHeading(tcDeg, wcaDeg) {
  const tc = Number(tcDeg);
  const wca = Number(wcaDeg);

  if (!Number.isFinite(tc)) return NaN;
  return norm360(tc + (Number.isFinite(wca) ? wca : 0));
}

/**
 * Apply magnetic variation to True Heading:
 *  - East is least (subtract)
 *  - West is best (add)
 */
export function applyVariation(trueHeadingDeg, varDir, varDeg) {
  const th = Number(trueHeadingDeg);
  const vd = String(varDir || "").trim().toUpperCase();
  const vv = Number(varDeg);

  if (!Number.isFinite(th)) return NaN;
  const v = Number.isFinite(vv) ? vv : 0;

  if (vd === "E") return norm360(th - v);
  if (vd === "W") return norm360(th + v);
  return norm360(th);
}

/**
 * ✅ IMPORTANT:
 * Your inputs.html currently imports `parsevartoken` (lowercase),
 * but your old file exported `parseVarToken` (camel case).
 *
 * To make your current inputs.html work WITHOUT changing it,
 * we export BOTH names here:
 *  - parseVarToken (preferred, readable)
 *  - parsevartoken (compat alias)
 *
 * Token format: "W13" or "E02"
 */
export function parseVarToken(tok) {
  const s = String(tok || "").trim().toUpperCase();
  const m = s.match(/^([EW])(\d{1,2})$/);
  if (!m) return { dir: null, deg: 0 };
  return { dir: m[1], deg: Number(m[2]) };
}

// ✅ Back-compat alias for your current import/call style
export const parsevartoken = parseVarToken;
