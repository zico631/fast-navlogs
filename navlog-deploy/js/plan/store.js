// store.js
export const STORAGE_KEY = "navlogProto_v1";

export function defaultPlan() {
  return {
    aircraftId: "C172S",
    env: {
      // NEW: Departure & climb inputs (required)
      depIcao: "KFRG",
      fieldElevFt: 20,
      surfaceWindFromDeg: 240,
      surfaceWindKt: 12,
      climbTcDeg: 180,
      climbKias: 74,
      cruiseAltFt: 5500,

      // EXISTING: Cruise performance inputs (keep for now so nothing breaks)
      pressureAltFt: 4000,
      oatC: 15,
      rpm: 2500,
      windFromDeg: 240,
      windKt: 15,
      flapSetting: "UP",
      cruiseKias: 100
    },
    legs: [
      { from: "KAAA", to: "CP1", tcDeg: 90, distNm: 12.5 },
      { from: "CP1", to: "KBBB", tcDeg: 120, distNm: 25.0 }
    ]
  };
}

export function loadPlan() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPlan();

  try {
    const parsed = JSON.parse(raw);

    // Ensure top-level structure exists
    if (!parsed.env) parsed.env = {};
    if (!parsed.legs) parsed.legs = [];
    if (!parsed.aircraftId) parsed.aircraftId = "C172S";

    // Fill in any missing env fields with defaults (so upgrades don't break old saved plans)
    const defEnv = defaultPlan().env;
    for (const k of Object.keys(defEnv)) {
      if (parsed.env[k] === undefined || parsed.env[k] === null) {
        parsed.env[k] = defEnv[k];
      }
    }

    return parsed;
  } catch {
    return defaultPlan();
  }
}

export function savePlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}
