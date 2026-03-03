// aircraftdb.js
// Cessna 172S / 172SP performance data (POH-based, for training use)

export const aircraftDb = {
  C172S: {
    id: "C172S",
    name: "Cessna 172S / 172SP",

    // POH (C172S NAV III) Figure 5-7: Time, Fuel, Distance to Climb (From Sea Level)
    // Standard temperature, 2550 lb, flaps up, full throttle
    // Notes in POH:
    // - Increase time/fuel/distance by 10% for each 10°C above standard
    // - Distances are based on zero wind
    climbPohFromSeaLevel: [
      { altFt: 0,     kias: 74, timeMin: 0,  fuelGal: 0.0, distNm: 0 },
      { altFt: 1000,  kias: 73, timeMin: 1,  fuelGal: 0.4, distNm: 2 },
      { altFt: 2000,  kias: 73, timeMin: 3,  fuelGal: 0.8, distNm: 4 },
      { altFt: 3000,  kias: 73, timeMin: 4,  fuelGal: 1.2, distNm: 6 },
      { altFt: 4000,  kias: 73, timeMin: 6,  fuelGal: 1.5, distNm: 8 },
      { altFt: 5000,  kias: 73, timeMin: 8,  fuelGal: 1.9, distNm: 10 },
      { altFt: 6000,  kias: 73, timeMin: 10, fuelGal: 2.2, distNm: 13 },
      { altFt: 7000,  kias: 73, timeMin: 12, fuelGal: 2.6, distNm: 16 },
      { altFt: 8000,  kias: 72, timeMin: 14, fuelGal: 3.0, distNm: 19 },
      { altFt: 9000,  kias: 72, timeMin: 17, fuelGal: 3.4, distNm: 22 },
      { altFt: 10000, kias: 72, timeMin: 20, fuelGal: 3.9, distNm: 27 },
      { altFt: 11000, kias: 72, timeMin: 24, fuelGal: 4.4, distNm: 32 },
      { altFt: 12000, kias: 72, timeMin: 28, fuelGal: 5.0, distNm: 38 }
    ],

    cruise: {
      2000: {
        2550: { m20:{ktas:117,gph:11.1}, std:{ktas:118,gph:10.5}, p20:{ktas:117,gph:9.9} },
        2500: { m20:{ktas:115,gph:10.6}, std:{ktas:115,gph:9.9},  p20:{ktas:115,gph:9.4} },
        2400: { m20:{ktas:111,gph:9.6},  std:{ktas:110,gph:9.0},  p20:{ktas:109,gph:8.5} },
        2300: { m20:{ktas:105,gph:8.6},  std:{ktas:104,gph:8.1},  p20:{ktas:102,gph:7.7} },
        2200: { m20:{ktas:99, gph:7.7},  std:{ktas:97, gph:7.3},  p20:{ktas:95, gph:6.9} },
        2100: { m20:{ktas:92, gph:6.9},  std:{ktas:90, gph:6.6},  p20:{ktas:89, gph:6.3} }
      },
      4000: {
        2600: { m20:{ktas:120,gph:11.1}, std:{ktas:120,gph:10.4}, p20:{ktas:119,gph:9.8} },
        2550: { m20:{ktas:118,gph:10.6}, std:{ktas:117,gph:9.9},  p20:{ktas:117,gph:9.4} },
        2500: { m20:{ktas:115,gph:10.1}, std:{ktas:115,gph:9.5},  p20:{ktas:114,gph:8.9} },
        2400: { m20:{ktas:110,gph:9.1},  std:{ktas:109,gph:8.5},  p20:{ktas:107,gph:8.1} },
        2300: { m20:{ktas:104,gph:8.2},  std:{ktas:102,gph:7.7},  p20:{ktas:101,gph:7.3} },
        2200: { m20:{ktas:98, gph:7.4},  std:{ktas:96, gph:7.0},  p20:{ktas:94, gph:6.7} },
        2100: { m20:{ktas:91, gph:6.6},  std:{ktas:89, gph:6.4},  p20:{ktas:87, gph:6.1} }
      },
      6000: {
        2650: { m20:{ktas:122,gph:11.1}, std:{ktas:122,gph:10.4}, p20:{ktas:121,gph:9.8} },
        2600: { m20:{ktas:120,gph:10.6}, std:{ktas:119,gph:9.9},  p20:{ktas:118,gph:9.4} },
        2500: { m20:{ktas:115,gph:9.6},  std:{ktas:114,gph:9.0},  p20:{ktas:112,gph:8.5} },
        2400: { m20:{ktas:109,gph:8.6},  std:{ktas:108,gph:8.2},  p20:{ktas:106,gph:7.7} },
        2300: { m20:{ktas:103,gph:7.8},  std:{ktas:101,gph:7.4},  p20:{ktas:99, gph:7.0} },
        2200: { m20:{ktas:96, gph:7.1},  std:{ktas:94, gph:6.7},  p20:{ktas:92, gph:6.4} }
      },
      8000: {
        2700: { m20:{ktas:125,gph:11.1}, std:{ktas:124,gph:10.4}, p20:{ktas:123,gph:9.7} },
        2650: { m20:{ktas:122,gph:10.5}, std:{ktas:122,gph:9.9},  p20:{ktas:120,gph:9.3} },
        2600: { m20:{ktas:120,gph:10.0}, std:{ktas:119,gph:9.4},  p20:{ktas:117,gph:8.9} },
        2500: { m20:{ktas:114,gph:9.1},  std:{ktas:112,gph:8.6},  p20:{ktas:111,gph:8.1} },
        2400: { m20:{ktas:108,gph:8.2},  std:{ktas:106,gph:7.8},  p20:{ktas:104,gph:7.4} },
        2300: { m20:{ktas:101,gph:7.5},  std:{ktas:99, gph:7.1},  p20:{ktas:97, gph:6.8} }
      },
      10000: {
        2700: { m20:{ktas:124,gph:10.5}, std:{ktas:123,gph:9.8},  p20:{ktas:122,gph:9.3} },
        2650: { m20:{ktas:122,gph:10.0}, std:{ktas:120,gph:9.4},  p20:{ktas:119,gph:8.9} },
        2600: { m20:{ktas:119,gph:9.5},  std:{ktas:117,gph:9.0},  p20:{ktas:115,gph:8.5} },
        2500: { m20:{ktas:113,gph:8.7},  std:{ktas:111,gph:8.2},  p20:{ktas:109,gph:7.8} },
        2400: { m20:{ktas:106,gph:7.9},  std:{ktas:104,gph:7.5},  p20:{ktas:102,gph:7.1} }
      },
      12000: {
        2650: { m20:{ktas:121,gph:9.5},  std:{ktas:119,gph:8.9},  p20:{ktas:117,gph:8.5} },
        2600: { m20:{ktas:118,gph:9.1},  std:{ktas:116,gph:8.5},  p20:{ktas:114,gph:8.1} },
        2500: { m20:{ktas:111,gph:8.3},  std:{ktas:109,gph:7.8},  p20:{ktas:107,gph:7.4} },
        2400: { m20:{ktas:105,gph:7.5},  std:{ktas:102,gph:7.1},  p20:{ktas:100,gph:6.8} }
      }
    },

    // Airspeed calibration (KIAS -> KCAS)
    airspeedCal: {
      UP: [
        { kias: 50, kcas: 56 }, { kias: 60, kcas: 62 }, { kias: 70, kcas: 70 },
        { kias: 80, kcas: 78 }, { kias: 90, kcas: 87 }, { kias: 100, kcas: 97 },
        { kias: 110, kcas: 107 }, { kias: 120, kcas: 117 }, { kias: 130, kcas: 127 },
        { kias: 140, kcas: 137 }, { kias: 150, kcas: 147 }, { kias: 160, kcas: 157 }
      ],
      FLAPS10: [
        { kias: 40, kcas: 51 }, { kias: 50, kcas: 57 }, { kias: 60, kcas: 63 },
        { kias: 70, kcas: 71 }, { kias: 80, kcas: 80 }, { kias: 90, kcas: 89 },
        { kias: 100, kcas: 99 }, { kias: 110, kcas: 109 }
      ],
      FLAPS30: [
        { kias: 40, kcas: 50 }, { kias: 50, kcas: 56 }, { kias: 60, kcas: 63 },
        { kias: 70, kcas: 72 }, { kias: 80, kcas: 81 }, { kias: 85, kcas: 86 }
      ]
    }
  }
};

