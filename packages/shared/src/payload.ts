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
  const title = document.title;
  const hostname = document.location.hostname;
  const origin = document.location.origin;
  const pathname = document.location.pathname;
  const search = document.location.search;
  const referrer = document.referrer;

  return { location: origin + pathname + search, hostname, referrer, title };
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
  const sessionId = `${Math.floor(Math.random() * 1000000000) + 1}`;
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
