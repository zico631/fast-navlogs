// perfutils.js

export function lerp(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

export function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

export function round(n, places = 0) {
  const p = Math.pow(10, places);
  return Math.round(n * p) / p;
}

export function deg2rad(d) { return d * Math.PI / 180; }
export function rad2deg(r) { return r * 180 / Math.PI; }

export function norm360(d) {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

// ISA rule-of-thumb: 15°C at sea level, -2°C per 1000 ft
export function isaTempC(pressureAltFt) {
  return 15 - 2 * (pressureAltFt / 1000);
}

// Density ratio based on pressure altitude and OAT
export function densityRatio(pressureAltFt, oatC) {
  const tempK = oatC + 273.15;
  const isaK = isaTempC(pressureAltFt) + 273.15;
  return Math.pow(isaK / tempK, 1);
}

// CAS → TAS (knots)
export function casToTasKt(kcas, pressureAltFt, oatC) {
  const sigma = densityRatio(pressureAltFt, oatC);
  return kcas / Math.sqrt(sigma);
}

// 1D interpolation over points: [{x, y}, ...]
export function interp1(points, x) {
  const pts = [...points].sort((a, b) => a.x - b.x);
  if (x <= pts[0].x) return pts[0].y;
  if (x >= pts[pts.length - 1].x) return pts[pts.length - 1].y;

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (x >= a.x && x <= b.x) return lerp(x, a.x, b.x, a.y, b.y);
  }
  return pts[pts.length - 1].y;
}

// 2D bilinear interpolation on a grid
export function interp2({ xKeys, yKeys, getValue }, x, y) {
  const xs = [...xKeys].sort((a, b) => a - b);
  const ys = [...yKeys].sort((a, b) => a - b);

  const xC = clamp(x, xs[0], xs[xs.length - 1]);
  const yC = clamp(y, ys[0], ys[ys.length - 1]);

  const x0 = xs.reduce((p, c) => (c <= xC ? c : p), xs[0]);
  const x1 = xs.find(v => v >= xC) ?? xs[xs.length - 1];
  const y0 = ys.reduce((p, c) => (c <= yC ? c : p), ys[0]);
  const y1 = ys.find(v => v >= yC) ?? ys[ys.length - 1];

  const q11 = getValue(x0, y0);
  const q21 = getValue(x1, y0);
  const q12 = getValue(x0, y1);
  const q22 = getValue(x1, y1);

  const r1 = (x0 === x1) ? q11 : lerp(xC, x0, x1, q11, q21);
  const r2 = (x0 === x1) ? q12 : lerp(xC, x0, x1, q12, q22);

  return (y0 === y1) ? r1 : lerp(yC, y0, y1, r1, r2);
}

