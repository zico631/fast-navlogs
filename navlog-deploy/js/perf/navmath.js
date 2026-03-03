// navmath.js

export function norm360(deg) {
  const d = ((deg % 360) + 360) % 360;
  return d;
}

export function norm180(deg) {
  let d = ((deg % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}

function degToRad(d) { return (d * Math.PI) / 180; }
function radToDeg(r) { return (r * 180) / Math.PI; }

export function computeWCA(tcDeg, windFromDeg, windKt, tasKt) {
  if (!Number.isFinite(tcDeg) || !Number.isFinite(windFromDeg) ||
      !Number.isFinite(windKt) || !Number.isFinite(tasKt) || tasKt <= 0) {
    return { wcaDeg: 0, side: "", absDeg: 0 };
  }

  const delta = norm180(windFromDeg - tcDeg);
  const cross = windKt * Math.sin(degToRad(delta));
  const ratio = cross / tasKt;

  const clamped = Math.max(-1, Math.min(1, ratio));
  const wca = radToDeg(Math.asin(clamped));

  const absDeg = Math.round(Math.abs(wca));
  const side = wca < 0 ? "L" : (wca > 0 ? "R" : "");

  return { wcaDeg: wca, side, absDeg };
}

export function computeTrueHeading(tcDeg, wcaDeg) {
  if (!Number.isFinite(tcDeg)) return NaN;
  if (!Number.isFinite(wcaDeg)) wcaDeg = 0;
  return norm360(tcDeg + wcaDeg);
}

export function applyVariation(trueHeadingDeg, varDir, varDeg) {
  if (!Number.isFinite(trueHeadingDeg)) return NaN;
  if (!Number.isFinite(varDeg)) varDeg = 0;

  const dir = String(varDir || "").toUpperCase();

  if (dir === "E") return norm360(trueHeadingDeg - varDeg);
  if (dir === "W") return norm360(trueHeadingDeg + varDeg);
  return norm360(trueHeadingDeg);
}

export function parseVarToken(tok) {
  const s = String(tok || "").trim().toUpperCase();
  const m = s.match(/^([EW])(\d{1,2})$/);
  if (!m) return { dir: null, deg: 0 };
  return { dir: m[1], deg: Number(m[2]) };
}

