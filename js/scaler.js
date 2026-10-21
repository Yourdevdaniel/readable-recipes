// Servings scaler. The controls are built here, not written in the
// HTML: without JavaScript they wouldn't work, so without JavaScript
// they shouldn't be on the page at all. The recipe still reads fine
// with its original amounts.

import { formatAmount, parseServings } from "./amounts.js";

const MIN = 1;
const MAX = 24;
const ANNOUNCE_DELAY_MS = 600;

const recipe = document.querySelector(".recipe[data-servings]");
if (recipe) {
  setUpScaler(recipe);
}

function setUpScaler(recipe) {
  const baseServings = Number(recipe.dataset.servings);
  const amounts = [...recipe.querySelectorAll(".ingredients data")];
  for (const amount of amounts) {
    amount.dataset.base = amount.value; // the value for baseServings
  }

  const controls = buildControls(baseServings);
  recipe.querySelector("#ingredients-title").after(controls.root);
  const servesFact = recipe.querySelector("#serves-count");

  let announceTimer;

  function update(servings) {
    const factor = servings / baseServings;
    for (const amount of amounts) {
      const value = Number(amount.dataset.base) * factor;
      amount.value = String(value);
      amount.textContent = formatAmount(value, amount.dataset.unit, amount.dataset.plural);
    }
    controls.input.value = servings;
    controls.less.disabled = servings <= MIN;
    controls.more.disabled = servings >= MAX;
    servesFact.textContent = servings;

    // Announce once the person stops clicking or typing, not on every
    // step: pressing "+" four times should be one message, not four.
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      controls.status.textContent = `Ingredients updated for ${servings} servings.`;
    }, ANNOUNCE_DELAY_MS);
  }

  function current() {
    return parseServings(controls.input.value, MIN, MAX) ?? baseServings;
  }

  controls.less.addEventListener("click", () => update(Math.max(MIN, current() - 1)));
  controls.more.addEventListener("click", () => update(Math.min(MAX, current() + 1)));
  controls.input.addEventListener("input", () => {
    const servings = parseServings(controls.input.value, MIN, MAX);
    if (servings !== null) {
      update(servings);
    }
  });
}

function buildControls(servings) {
  const root = document.createElement("div");
  root.className = "scaler";
  root.innerHTML = `
    <label for="servings">Servings</label>
    <div class="stepper">
      <button type="button" class="less" aria-label="Fewer servings">−</button>
      <input id="servings" type="number" inputmode="numeric"
             min="${MIN}" max="${MAX}" step="1" value="${servings}">
      <button type="button" class="more" aria-label="More servings">+</button>
    </div>
    <p class="visually-hidden" role="status"></p>
  `;
  return {
    root,
    input: root.querySelector("input"),
    less: root.querySelector(".less"),
    more: root.querySelector(".more"),
    status: root.querySelector("[role=status]"),
  };
}
