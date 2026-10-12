export type PictogramKey =
  | "cable-reel"
  | "network-cable"
  | "bulb"
  | "spot"
  | "smart-bulb"
  | "relay"
  | "blind-actuator"
  | "contactor"
  | "breaker"
  | "rcd"
  | "socket"
  | "bolt";

const BY_SKU: Record<string, PictogramKey> = {
  "CAB-H07VK-15-100": "cable-reel",
  "CAB-H07VK-25-100": "cable-reel",
  "CAB-CAT6-UTP-305": "network-cable",
  "ILU-HUE-E27-W": "bulb",
  "ILU-HUE-GU10-CA": "spot",
  "ILU-TPL-L530E": "smart-bulb",
  "AUT-SHELLY-1PM-G4": "relay",
  "AUT-SHELLY-2PM-CV": "blind-actuator",
  "AUT-HAG-CTR-25": "contactor",
  "PRO-MAG-2P-16-C": "breaker",
  "PRO-DIF-2P-40-30": "rcd",
  "MEC-SIM82-ENCH": "socket",
};

const BY_PREFIX: Record<string, PictogramKey> = {
  CAB: "cable-reel",
  ILU: "bulb",
  AUT: "relay",
  PRO: "breaker",
  MEC: "socket",
};

/** Pictograma de un producto: por SKU exacto, si no por prefijo de familia, si no un rayo genérico. */
export function pictogramFor(sku: string): PictogramKey {
  return BY_SKU[sku] ?? BY_PREFIX[sku.split("-")[0]] ?? "bolt";
}
