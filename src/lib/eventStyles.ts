export const EVENT_TYPES = {
  Show: {
    pattern: "none",
    badge: "SHOW",
  },
  Rehearsal: {
    pattern: "diagonal",
    badge: "REHEARSAL",
  },
  "Get-in": {
    pattern: "wideDiagonal",
    badge: "GET-IN",
  },
  "Get-out": {
    pattern: "wideDiagonalReverse",
    badge: "GET-OUT",
  },
  Maintenance: {
    pattern: "hazard",
    badge: "MAINTENANCE",
  },
  "Site Visit": {
    pattern: "dots",
    badge: "SITE VISIT",
  },
} as const;

export type EventType = keyof typeof EVENT_TYPES;