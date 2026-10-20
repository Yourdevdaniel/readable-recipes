import { test } from "node:test";
import assert from "node:assert/strict";

import { formatAmount, kitchenFraction, metricAmount, parseServings } from "../js/amounts.js";

test("whole numbers stay whole", () => {
  assert.equal(kitchenFraction(2), "2");
  assert.equal(kitchenFraction(1), "1");
});

test("common fractions become kitchen symbols", () => {
  assert.equal(kitchenFraction(0.5), "½");
  assert.equal(kitchenFraction(0.25), "¼");
  assert.equal(kitchenFraction(0.75), "¾");
  assert.equal(kitchenFraction(1.5), "1½");
});

test("thirds survive floating point", () => {
  // 1/3 cup for 4 servings, scaled to 6: 0.3333 * 1.5
  assert.equal(kitchenFraction(0.3333 * 1.5), "½");
  assert.equal(kitchenFraction(0.3333 * 2), "⅔");
  assert.equal(kitchenFraction(0.3333 * 3), "1");
});

test("rounds to the nearest fraction a measuring spoon can do", () => {
  assert.equal(kitchenFraction(0.3), "⅓");
  assert.equal(kitchenFraction(0.9), "1");
  assert.equal(kitchenFraction(2.97), "3");
});

test("a tiny amount never rounds down to nothing", () => {
  assert.equal(kitchenFraction(0.02), "⅛");
  assert.equal(kitchenFraction(0), "0");
});

test("grams and millilitres use numbers, not fractions", () => {
  assert.equal(metricAmount(300, "g"), "300 g");
  assert.equal(metricAmount(333.33, "g"), "335 g");
  assert.equal(metricAmount(12.4, "g"), "12 g");
  assert.equal(metricAmount(0.2, "g"), "1 g");
});

test("big metric amounts switch to kg and L", () => {
  assert.equal(metricAmount(1000, "ml"), "1 L");
  assert.equal(metricAmount(1500, "ml"), "1.5 L");
  assert.equal(metricAmount(2250, "g"), "2.25 kg");
});

test("countable things get a plural above one", () => {
  assert.equal(formatAmount(1, "onion", "onions"), "1 onion");
  assert.equal(formatAmount(1.5, "onion", "onions"), "1½ onions");
  assert.equal(formatAmount(0.5, "lemon", "lemons"), "½ lemon");
});

test("units without a plural form stay as they are", () => {
  assert.equal(formatAmount(2, "tbsp"), "2 tbsp");
  assert.equal(formatAmount(0.75, "tsp"), "¾ tsp");
});

test("servings input is clamped to a whole number in range", () => {
  assert.equal(parseServings("6"), 6);
  assert.equal(parseServings("2.6"), 3);
  assert.equal(parseServings("0"), 1);
  assert.equal(parseServings("500"), 24);
  assert.equal(parseServings("abc"), null);
});
