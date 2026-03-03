// store.js

export const STORAGE_KEY = "navlogProto_v1";

export function defaultPlan() {
  return {
    aircraftId: "C172S",
    env: {
      // Departure & climb inputs
      depIcao: "KFRG",
      fieldElevFt: 20,
      surfaceWindFromDeg: 240,
      surfaceWindKt: 12,
      climbTcDeg: 180,
      climbKias: 74,
      cruiseAltFt: 5500,

      // Cruise performance inputs
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

    if (!parsed.env) parsed.env = {};
    if (!parsed.legs) parsed.legs = [];
    if (!parsed.aircraftId) parsed.aircraftId = "C172S";

    // Backfill missing env keys
    const defEnv = defaultPlan().env;
    for (const k of Object.keys(defEnv)) {
      if (parsed.env[k] === undefined || parsed.env[k] === null) {
        parsed.env[k] = defEnv[k];
      }
    }

    return parsed;
  } catch (err) {
    console.warn("loadPlan failed, resetting to default:", err);
    return defaultPlan();
  }
}

export function savePlan(plan) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch (err) {
    console.warn("savePlan failed:", err);
  }
}

/* ------------------------------------------------------------------
   LOWERCASE ALIASES (so your current inputs.html keeps working)
-------------------------------------------------------------------*/

export const loadplan = loadPlan;
export const saveplan = savePlan;
