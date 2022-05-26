import { getRandomId } from './utility';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const clientKey = 'clientId';
const sessionKey = 'sessionId';
const counterKey = 'sessionCount';

/* -----------------------------------
 *
 * Document
 *
 * -------------------------------- */

function getDocument() {
  const { hostname, origin, pathname, search } = document.location;
  const title = document.title;
  const referrer = document.referrer;

  return { location: origin + pathname + search, hostname, pathname, referrer, title };
}

/* -----------------------------------
 *
 * ClientId
 *
 * -------------------------------- */

function getClientId(key = clientKey) {
  const clientId = getRandomId();
  const storedValue = localStorage.getItem(key);

  if (!storedValue) {
    localStorage.setItem(key, clientId);

    return clientId;
  }

  return storedValue;
}

/* -----------------------------------
 *
 * SessionId
 *
 * -------------------------------- */

function getSessionId(key = sessionKey) {
  const sessionId = getRandomId();
  const storedValue = sessionStorage.getItem(key);

  if (!storedValue) {
    sessionStorage.setItem(key, sessionId);

    return sessionId;
  }

  return storedValue;
}

/* -----------------------------------
 *
 * SessionCount
 *
 * -------------------------------- */

function getSessionCount(key = counterKey) {
  let sessionCount = '1';
  const storedValue = sessionStorage.getItem(key);

  if (storedValue) {
    sessionCount = `${+storedValue + 1}`;
  }

  sessionStorage.setItem(key, sessionCount);

  return sessionCount;
}

/* -----------------------------------
 *
 * SessionState
 *
 * -------------------------------- */

function getSessionState(firstEvent: boolean) {
  const firstVisit = !localStorage.getItem(clientKey) ? '1' : void 0;
  const sessionStart = !sessionStorage.getItem(sessionKey) ? '1' : void 0;

  if (!firstEvent) {
    return {};
  }

  return { firstVisit, sessionStart, sessionCount: getSessionCount() };
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export {
  clientKey,
  sessionKey,
  counterKey,
  getDocument,
  getClientId,
  getSessionId,
  getSessionState,
};
