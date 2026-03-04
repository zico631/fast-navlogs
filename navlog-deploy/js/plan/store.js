// store.js
export const STORAGE_KEY = "navlogProto_v1";
export function defaultPlan() {
  return {
    aircraftId: "C172S",
    env: {
      // Departure & climb inputs
      depIcao: "",
      fieldElevFt: "",
      surfaceWindFromDeg: "",
      surfaceWindKt: "",
      climbTcDeg: "",
      climbKias: 74,
      cruiseAltFt: "",
      // Cruise performance inputs
      pressureAltFt: "",
      oatC: "",
      rpm: 2500,
      windFromDeg: "",
      windKt: "",
      flapSetting: "UP",
      cruiseKias: 100
    },
    // start with NO default legs
    legs: []
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
