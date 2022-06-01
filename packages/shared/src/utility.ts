/* -----------------------------------
 *
 * Debounce
 *
 * -------------------------------- */

function debounce(callback: TimerHandler, frequency = 500, timer = 0) {
  return (...args) => (
    clearTimeout(timer), (timer = setTimeout(callback, frequency, ...args))
  );
}

/* -----------------------------------
 *
 * RandomID
 *
 * -------------------------------- */

function getRandomId(length = 16) {
  const randomId = `${Math.floor(Math.random() * 1e16)}`;

  length = length > 16 ? 16 : length;

  return randomId.padStart(length, '0').substring(-1, length);
}

/* -----------------------------------
 *
 * HashId
 *
 * -------------------------------- */

function getHashId(value: string, length = 16) {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash = hash & hash;
  }

  hash = Math.abs(hash);

  return `${hash}`.padStart(length, '0').substring(-1, length);
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
 * TargetElement
 *
 * -------------------------------- */

function isTargetElement(element: Element, selector: string): Element | undefined {
  let target = element;

  while (target) {
    target = target.parentNode as Element;

    if (!target || target.matches(selector)) {
      break;
    }
  }

  return target;
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { debounce, getRandomId, getHashId, getScrollPercentage, isTargetElement };
