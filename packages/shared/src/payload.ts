/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const clientKey = 'clientId';
const sessionKey = 'sessionId';

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
  const clientId = Math.random().toString(36);
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
  const sessionId = `${Math.floor(Math.random() * 1e16) + 1}`;
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

export { getDocument, getClientId, getSessionId };
