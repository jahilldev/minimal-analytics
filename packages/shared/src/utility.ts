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
 * RandomID
 *
 * -------------------------------- */

function getRandomId(length = 16) {
  length = length > 16 ? 16 : length;

  return `${Math.floor(Math.random() * 1e16)}`.substring(0, length);
}

/* -----------------------------------
 *
 * Hash
 *
 * -------------------------------- */

function getHash(value: string, length = 16) {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash = hash & hash;
  }

  return `${hash & 0xffff}`.padStart(length, '0').substring(0, length);
}

/* -----------------------------------
 *
 * ScrollPercentage
 *
 * -------------------------------- */

function getScrollPercentage() {
  const body = document.body;
  const scrollTop = window.pageYOffset || body.scrollTop;
  const { scrollHeight, offsetHeight, clientHeight } = document.documentElement;

  const documentHeight = Math.max(
    body.scrollHeight,
    scrollHeight,
    body.offsetHeight,
    offsetHeight,
    body.clientHeight,
    clientHeight
  );

  const trackLength = documentHeight - window.innerHeight;

  return Math.floor(Math.abs(scrollTop / trackLength) * 100);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { debounce, getRandomId, getHash, getScrollPercentage };
