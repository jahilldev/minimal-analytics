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
 * Export
 *
 * -------------------------------- */

export { clientKey, sessionKey, counterKey, getDocument, getClientId, getSessionId };
