/* -----------------------------------
 *
 * Debounce
 *
 * -------------------------------- */

function debounce(callback: TimerHandler, frequency = 500, timer = 0) {
  return (...args) => (clearTimeout(timer), (timer = setTimeout(callback, frequency, ...args)));
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { debounce };
