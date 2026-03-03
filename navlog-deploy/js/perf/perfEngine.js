// perfEngine.js
import {
  clamp,
  lerp,
  interp1,
  interp2,
  isaTempC,
  deg2rad,
  rad2deg,
  norm360,
  casToTasKt
} from "./perfUtils.js";

// Helper to choose POH temp columns based on delta from standard
function tempKeyFromDelta(deltaC) {
  if (deltaC <= -20) return { aKey: "m20", bKey: "m20", t: 0 };
  if (deltaC >=  20) return { aKey: "p20", bKey: "p20", t: 0 };
  if (deltaC < 0) {
    return { aKey: "m20", bKey: "std", t: (deltaC + 20) / 20 };
  }
  return { aKey: "std", bKey: "p20", t: deltaC / 20 };
}

// ------------------------------------------------------------
// CRUISE (existing)
// ------------------------------------------------------------

// Cruise performance lookup with interpolation
export function lookupCruise(aircraft, pressureAltFt, rpm, oatC) {
  const cruise = aircraft.cruise;

  const altKeys = Object.keys(cruise).map(Number).sort((a, b) => a - b);
  const alt = clamp(pressureAltFt, altKeys[0], altKeys[altKeys.length - 1]);

  const isa = isaTempC(alt);
  const delta = clamp(oatC - isa, -20, 20);
  const { aKey, bKey, t } = tempKeyFromDelta(delta);

  const rpmKeysForAlt = a => Object.keys(cruise[a]).map(Number).sort((x, y) => x - y);
  const allRpmKeys = [...new Set(altKeys.flatMap(rpmKeysForAlt))].sort((a, b) => a - b);
  const rrpm = clamp(rpm, allRpmKeys[0], allRpmKeys[allRpmKeys.length - 1]);

  function valueAt(altKey, rpmKey) {
    const cell = cruise[altKey][rpmKey];
    const A = cell[aKey];
    const B = cell[bKey];
    return {
      ktas: lerp(t, 0, 1, A.ktas, B.ktas),
      gph:  lerp(t, 0, 1, A.gph,  B.gph)
    };
  }

  const ktas = interp2({
    xKeys: allRpmKeys,
    yKeys: altKeys,
    getValue: (xRpm, yAlt) => {
      const locals = rpmKeysForAlt(yAlt);
      const localRpm = clamp(xRpm, locals[0], locals[locals.length - 1]);
      return valueAt(yAlt, localRpm).ktas;
    }
  }, rrpm, alt);

  const gph = interp2({
    xKeys: allRpmKeys,
    yKeys: altKeys,
    getValue: (xRpm, yAlt) => {
      const locals = rpmKeysForAlt(yAlt);
      const localRpm = clamp(xRpm, locals[0], locals[locals.length - 1]);
      return valueAt(yAlt, localRpm).gph;
    }
  }, rrpm, alt);

  return {
    ktas,
    gph,
    isaC: isa,
    deltaFromStdC: delta
  };
}

// Wind correction and groundspeed (training-style)
export function computeWinds({ tcDeg, tasKt, windFromDeg, windKt }) {
  const delta = deg2rad(norm360(windFromDeg - tcDeg));
  const crosswind = windKt * Math.sin(delta);
  const headwind = windKt * Math.cos(delta);

  const ratio = Math.max(-1, Math.min(1, crosswind / Math.max(1, tasKt)));
  const wcaDeg = rad2deg(Math.asin(ratio));
  const thDeg = norm360(tcDeg + wcaDeg);

  const gsKt = Math.max(1, tasKt - headwind);

  return {
    wcaDeg,
    thDeg,
    gsKt,
    headwindKt: headwind,
    crosswindKt: crosswind
  };
}

// KIAS → KCAS via POH calibration table
export function kiasToKcas(aircraft, flapSetting, kias) {
  const table = aircraft.airspeedCal?.[flapSetting];
  if (!table) return kias;
  return interp1(table.map(p => ({ x: p.kias, y: p.kcas })), kias);
}

// ------------------------------------------------------------
// WIND PROFILE (prep for accurate+fast local interpolation)
// ------------------------------------------------------------

function windToUV(dirDeg, kt) {
  // Wind is "from" direction. Convert to a vector pointing TO.
  // Meteorology convention: u = west->east, v = south->north
  // TO direction = dir + 180
  const toDeg = norm360((dirDeg ?? 0) + 180);
  const r = deg2rad(toDeg);
  const u = kt * Math.sin(r);
  const v = kt * Math.cos(r);
  return { u, v };
}

function uvToWind(u, v) {
  const kt = Math.sqrt(u*u + v*v);
  if (kt < 0.5) return { dir: null, kt: 0 };
  const toRad = Math.atan2(u, v);
  const toDeg = norm360(rad2deg(toRad));
  const fromDeg = norm360(toDeg + 180);
  return { dir: fromDeg, kt };
}

export function buildWindProfile({ surfaceDir, surfaceKt, windsAloft }) {
  // windsAloft: [{altFt, dir, kt}, ...]
  const pts = [];

  // Surface point at 0 ft AGL-ish reference (for blending)
  if (Number.isFinite(surfaceDir) && Number.isFinite(surfaceKt)) {
    const { u, v } = windToUV(surfaceDir, surfaceKt);
    pts.push({ altFt: 0, u, v });
  }

  for (const w of (windsAloft ?? [])) {
    if (!Number.isFinite(w?.altFt)) continue;
    const dir = w?.dir;
    const kt = w?.kt ?? 0;

    // If dir is null (e.g., 9900 light/variable), treat as calm vector
    const { u, v } = (dir == null) ? { u: 0, v: 0 } : windToUV(dir, kt);
    pts.push({ altFt: w.altFt, u, v });
  }

  pts.sort((a, b) => a.altFt - b.altFt);
  return pts;
}

export function windAtAltFt(profilePts, altFt) {
  if (!profilePts || profilePts.length === 0) return { dir: null, kt: 0 };

  const a = clamp(altFt, profilePts[0].altFt, profilePts[profilePts.length - 1].altFt);

  // Find bracket
  let i = 0;
  while (i < profilePts.length - 1 && profilePts[i + 1].altFt < a) i++;

  const p1 = profilePts[i];
  const p2 = profilePts[Math.min(i + 1, profilePts.length - 1)];

  if (p1.altFt === p2.altFt) return uvToWind(p1.u, p1.v);

  const t = (a - p1.altFt) / (p2.altFt - p1.altFt);
  const u = lerp(t, 0, 1, p1.u, p2.u);
  const v = lerp(t, 0, 1, p1.v, p2.v);

  return uvToWind(u, v);
}

// ------------------------------------------------------------
// DESCENT / TOD (NEW) — 3:1 baseline + wind-profile GS refinement
// ------------------------------------------------------------

function ktsToFpm(kts) {
  return (Number(kts) * 6076.12) / 60;
}

export function computeDescentAngleDeg({ vsFpm = 500, gsKt }) {
  const vs = Math.abs(Number(vsFpm));
  const gsFpm = ktsToFpm(Number(gsKt));
  if (!Number.isFinite(vs) || !Number.isFinite(gsFpm) || gsFpm <= 0) return NaN;
  return Math.atan(vs / gsFpm) * 180 / Math.PI;
}

/**
 * TOD profile:
 * - TAS fixed (default 90 kt)
 * - VS fixed (default 500 fpm)
 * - Winds sampled at leaving / mid / target altitude using wind profile
 * - Average GS drives TOD distance
 */
export function computeTodProfile({
  tcDeg,
  altLeavingFt,
  altTargetFt,
  tasKt = 90,
  vsFpm = 500,
  windProfilePts = null,  // from buildWindProfile()
}) {
  const tc = Number(tcDeg);
  const a0 = Number(altLeavingFt);
  const aT = Number(altTargetFt);
  const tas = Number(tasKt);
  const vs = Math.abs(Number(vsFpm));

  if (![tc, a0, aT, tas, vs].every(Number.isFinite)) {
    return { ok: false, reason: "bad inputs" };
  }

  const altToLoseFt = Math.max(0, a0 - aT);
  const timeMin = altToLoseFt / vs;

  // if no descent needed
  if (altToLoseFt <= 0) {
    return {
      ok: true,
      altToLoseFt: 0,
      timeMin: 0,
      todNm: 0,
      avgGsKt: NaN,
      descentAngleDeg: NaN,
      samples: []
    };
  }

  const aMid = aT + altToLoseFt / 2;

  // If no wind profile provided, assume calm (still gives basic 3:1-ish output)
  function windAt(altFt) {
    if (!windProfilePts) return { dir: null, kt: 0 };
    return windAtAltFt(windProfilePts, altFt);
  }

  const w0 = windAt(a0);
  const wM = windAt(aMid);
  const wT = windAt(aT);

  const gs0 = computeWinds({ tcDeg: tc, tasKt: tas, windFromDeg: w0.dir ?? 0, windKt: w0.kt ?? 0 }).gsKt;
  const gsM = computeWinds({ tcDeg: tc, tasKt: tas, windFromDeg: wM.dir ?? 0, windKt: wM.kt ?? 0 }).gsKt;
  const gsT = computeWinds({ tcDeg: tc, tasKt: tas, windFromDeg: wT.dir ?? 0, windKt: wT.kt ?? 0 }).gsKt;

  const avgGsKt = (gs0 + gsM + gsT) / 3;
  const todNm = avgGsKt * (timeMin / 60);

  return {
    ok: true,
    altToLoseFt,
    timeMin,
    avgGsKt,
    todNm,
    descentAngleDeg: computeDescentAngleDeg({ vsFpm: vs, gsKt: avgGsKt }),
    samples: [
      { label: "leaving", altFt: a0, dir: w0.dir, kt: w0.kt, gsKt: gs0 },
      { label: "mid",     altFt: aMid, dir: wM.dir, kt: wM.kt, gsKt: gsM },
      { label: "target",  altFt: aT, dir: wT.dir, kt: wT.kt, gsKt: gsT }
    ]
  };
}

// ------------------------------------------------------------
// CLIMB GS (existing, constant IAS at a single altitude)
// ------------------------------------------------------------

export function computeClimbGS({
  aircraft,
  flapSetting,
  climbTcDeg,
  climbKias,
  pressureAltFt,
  oatC,
  windFromDeg,
  windKt
}) {
  const kcas = kiasToKcas(aircraft, flapSetting, climbKias);
  const tasKt = casToTasKt(kcas, pressureAltFt, oatC);

  const wind = computeWinds({
    tcDeg: climbTcDeg,
    tasKt,
    windFromDeg,
    windKt
  });

  return {
    kcas,
    tasKt,
    ...wind
  };
}

// ------------------------------------------------------------
// POH CLIMB (NEW) — Accurate time/fuel/distance
// ------------------------------------------------------------

function interpPohRow(table, altFt) {
  // table: [{altFt, timeMin, fuelGal, distNm, kias}, ...]
  const alts = table.map(r => r.altFt);
  const a = clamp(altFt, alts[0], alts[alts.length - 1]);

  const timeMin = interp1(table.map(r => ({ x: r.altFt, y: r.timeMin })), a);
  const fuelGal = interp1(table.map(r => ({ x: r.altFt, y: r.fuelGal })), a);
  const distNm  = interp1(table.map(r => ({ x: r.altFt, y: r.distNm })), a);
  const kias    = interp1(table.map(r => ({ x: r.altFt, y: r.kias })), a);

  return { altFt: a, timeMin, fuelGal, distNm, kias };
}

function pohTempFactor({ oatC, refAltFt }) {
  // POH note: increase by 10% for each 10°C above standard.
  // We'll compute delta from ISA at a reference altitude (we use field elevation).
  const isa = isaTempC(refAltFt);
  const delta = oatC - isa;
  if (delta <= 0) return 1;
  return 1 + 0.10 * (delta / 10);
}

/**
 * POH-accurate climb segment from field elevation to cruise altitude.
 *
 * - Uses aircraft.climbPohFromSeaLevel (time/fuel/dist from sea level)
 * - Applies POH temp correction (+10% per +10C above standard)
 * - Returns still-air POH distance + (optionally) wind-corrected distance
 *
 * For wind-corrected distance we will integrate with small slices USING POH time
 * between altitudes and a wind profile (fast local interpolation).
 */
export function computeClimbSegmentPOH({
  aircraft,
  flapSetting,
  climbTcDeg,
  fieldElevFt,
  cruiseAltFt,
  oatC,
  altimeterInHg,

  // Wind model inputs (optional; used for wind-corrected ground distance)
  windProfilePts = null,   // from buildWindProfile()
  stepFt = 500             // accuracy level: 500 ft slices
}) {
  const table = aircraft.climbPohFromSeaLevel;
  if (!table || table.length < 2) {
    throw new Error("Aircraft is missing climbPohFromSeaLevel table.");
  }

  // ✅ Altimeter -> pressure altitude offset (ft)
  // If altimeter is missing/invalid, treat as "standard" (no offset).
  const alt = Number(altimeterInHg);
  const altOffsetFt = Number.isFinite(alt) ? (29.92 - alt) * 1000 : 0;

  // Convert MSL altitude -> Pressure Altitude (PA)
  const toPA = (mslFt) => Number(mslFt) + altOffsetFt;

  const startAlt = Math.max(0, fieldElevFt);
  const endAlt = Math.max(startAlt, cruiseAltFt);

  // ✅ POH table lookup uses PRESSURE ALTITUDE (PA), not MSL
  const startPA = toPA(startAlt);
  const endPA   = toPA(endAlt);

  // POH values from sea level to each PA altitude (interpolated)
  const start = interpPohRow(table, startPA);
  const end   = interpPohRow(table, endPA);

  // Raw POH deltas (still-air, standard temp)
  let timeMin = Math.max(0, end.timeMin - start.timeMin);
  let fuelGal = Math.max(0, end.fuelGal - start.fuelGal);
  let distNmStillAir = Math.max(0, end.distNm - start.distNm);

  // Apply POH temperature correction factor (use PA reference for ISA comparison)
  const tf = pohTempFactor({ oatC, refAltFt: startPA });
  timeMin *= tf;
  fuelGal *= tf;
  distNmStillAir *= tf;

  // If we don't have a wind profile, stop here (still-air POH distance)
  if (!windProfilePts) {
    return {
      method: "POH",
      stepFt,
      startAltFt: startAlt,
      endAltFt: endAlt,
      deltaAltFt: endAlt - startAlt,
      tempFactor: tf,
      timeMin,
      fuelGal,
      distNmStillAir,
      distNmWindCorrected: null
    };
  }

  // Wind-corrected ground distance:
  // Integrate across altitude slices using POH TIME between slice endpoints.
  // IMPORTANT:
  // - POH rows are keyed by PA, so r1/r2/kias must use PA
  // - Winds aloft are keyed by MSL, so windAtAltFt uses MSL (amid)
  const deltaAlt = endAlt - startAlt;
  const n = Math.max(1, Math.ceil(deltaAlt / stepFt));

  let distNmWind = 0;

  for (let i = 0; i < n; i++) {
    const a1 = startAlt + (i * deltaAlt) / n;          // MSL
    const a2 = startAlt + ((i + 1) * deltaAlt) / n;    // MSL
    const amid = (a1 + a2) / 2;                        // MSL

    const pa1 = toPA(a1);
    const pa2 = toPA(a2);
    const paMid = toPA(amid);

    // POH time between PA(a1) and PA(a2), then apply temp factor
    const r1 = interpPohRow(table, pa1);
    const r2 = interpPohRow(table, pa2);

    let sliceTimeMin = Math.max(0, r2.timeMin - r1.timeMin);
    sliceTimeMin *= tf;

    // Use POH climb speed schedule keyed by PA
    const kias = interpPohRow(table, paMid).kias;

    // Convert IAS -> CAS, then CAS -> TAS using PRESSURE ALTITUDE
    const kcas = kiasToKcas(aircraft, flapSetting, kias);
    const tasKt = casToTasKt(kcas, paMid, oatC);

    // Wind at this altitude (winds aloft are MSL-based)
    const w = windAtAltFt(windProfilePts, amid);

    const wind = computeWinds({
      tcDeg: climbTcDeg,
      tasKt,
      windFromDeg: w.dir ?? 0,
      windKt: w.kt ?? 0
    });

    distNmWind += (wind.gsKt * sliceTimeMin) / 60;
  }

  return {
    method: "POH",
    stepFt,
    startAltFt: startAlt,
    endAltFt: endAlt,
    deltaAltFt: endAlt - startAlt,
    tempFactor: tf,
    timeMin,
    fuelGal,
    distNmStillAir,
    distNmWindCorrected: distNmWind
  };
}