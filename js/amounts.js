// Turning a scaled number into something you can measure in a kitchen.
// Pure functions only (no DOM), so they can be unit tested in Node.

// The fractions a normal set of measuring cups and spoons can do.
const FRACTIONS = [
  [0, ""],
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [1 / 2, "½"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [1, ""],
];

// Units that are weighed or measured precisely, so they get decimals
// instead of fractions. The value is the unit to switch to past 1000.
const METRIC = { g: "kg", ml: "L" };

/**
 * Round a number to the nearest kitchen fraction.
 * Returns the text, e.g. 1.5 -> "1½", 0.3333 -> "⅓", 2 -> "2".
 * Anything above zero stays above zero: a pinch is still a pinch.
 */
export function kitchenFraction(value) {
  let whole = Math.floor(value);
  const rest = value - whole;

  let [best, symbol] = FRACTIONS[0];
  for (const [fraction, text] of FRACTIONS) {
    if (Math.abs(rest - fraction) < Math.abs(rest - best)) {
      [best, symbol] = [fraction, text];
    }
  }
  if (best === 1) {
    whole += 1;
    symbol = "";
  }
  if (whole === 0 && symbol === "") {
    return value > 0 ? "⅛" : "0";
  }
  return (whole > 0 ? String(whole) : "") + symbol;
}

/** Grams and millilitres: whole numbers, nearest 5 once it's big enough to not matter. */
export function metricAmount(value, unit) {
  if (value >= 1000) {
    const big = Math.round((value / 1000) * 100) / 100; // at most 2 decimals
    return `${big} ${METRIC[unit]}`;
  }
  const step = value >= 50 ? 5 : 1;
  return `${Math.max(1, Math.round(value / step) * step)} ${unit}`;
}

/**
 * Text for one ingredient amount.
 * unit: "g", "ml", "tsp", "cup", "onion"...  plural: e.g. "onions" (optional)
 */
export function formatAmount(value, unit, plural) {
  if (unit in METRIC) {
    return metricAmount(value, unit);
  }
  const amount = kitchenFraction(value);
  const word = plural && value > 1 ? plural : unit;
  return word ? `${amount} ${word}` : amount;
}

/** Servings typed by a person -> a whole number in a sensible range,
 *  or null if there's nothing usable (yet) in the field. */
export function parseServings(text, min = 1, max = 24) {
  // Number("") is 0, not NaN, so an empty field has to be caught first
  if (String(text).trim() === "") {
    return null;
  }
  const number = Math.round(Number(text));
  if (!Number.isFinite(number)) {
    return null;
  }
  return Math.min(max, Math.max(min, number));
}
