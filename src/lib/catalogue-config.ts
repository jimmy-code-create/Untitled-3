/**
 * Catalogue switches.
 *
 * Demo badges are off. Hallmark and scarcity chips never render unless they are
 * switched on here AND the individual product carries the flag, so a single
 * piece can be marked without turning the claim on for the whole catalogue.
 */
export const CATALOGUE_FLAGS = {
  /** “BIS Hallmark” chip on catalogue cards. */
  showHallmark: false,
  /** “Only N left” strip on catalogue cards. */
  showScarcity: false,
} as const;

/** Line printed on every card and detail sheet — required by the shop. */
export const DESIGN_REFERENCE_NOTE = "Design reference, final piece may vary.";

/** Shown next to an approximate price. */
export const PRICE_NOTE = "Final price as per weight at the store.";

/** Short note used under a computed price on cards. */
export const LIVE_PRICE_NOTE = "Live-rate price";
