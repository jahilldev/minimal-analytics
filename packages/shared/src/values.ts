import { getRootObject, MemoryStorage, NoopStorage, safeStorageFactory } from './storage';
import { getRandomId } from './utility';

/* -----------------------------------
 *
 * Types
 *
 * -------------------------------- */

type ParamValue = string | number | undefined | null;
type EventParams = Record<string, ParamValue> | [string, ParamValue][];

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
 * Storage
 *
 * -------------------------------- */

const LocalStorage = safeStorageFactory('localStorage', NoopStorage);
const SessionStorage = safeStorageFactory('sessionStorage', MemoryStorage);

/* -----------------------------------
 *
 * Document
 *
 * -------------------------------- */

function getDocument() {
  const root = getRootObject();
  const location = root.document?.location || root.location;

  const { hostname, origin, pathname, search } = location || { };
  const title = root.document?.title;
  const referrer = root.document?.referrer;

  return { location: origin + pathname + search, hostname, pathname, referrer, title };
}

/* -----------------------------------
 *
 * ClientId
 *
 * -------------------------------- */

function getClientId(key = clientKey) {
  const storedValue = LocalStorage.getItem(key);
  if (storedValue) {
    return storedValue;
  }

  const clientId = getRandomId();
  LocalStorage.setItem(key, clientId);

  return clientId;
}

/* -----------------------------------
 *
 * SessionId
 *
 * -------------------------------- */

function getSessionId(key = sessionKey) {
  const storedValue = SessionStorage.getItem(key);
  if (storedValue) {
    return storedValue;
  }

  const sessionId = getRandomId();
  SessionStorage.setItem(key, sessionId);

  return sessionId;
}

/* -----------------------------------
 *
 * SessionCount
 *
 * -------------------------------- */

function getSessionCount(key = counterKey) {
  let sessionCount = '1';
  const storedValue = SessionStorage.getItem(key);

  if (storedValue) {
    sessionCount = `${+storedValue + 1}`;
  }

  SessionStorage.setItem(key, sessionCount);

  return sessionCount;
}

/* -----------------------------------
 *
 * SessionState
 *
 * -------------------------------- */

function getSessionState(firstEvent: boolean) {
  const firstVisit = !SessionStorage.getItem(clientKey) ? '1' : void 0;
  const sessionStart = !SessionStorage.getItem(sessionKey) ? '1' : void 0;
  let sessionCount = SessionStorage.getItem(counterKey) || '1';

  if (firstEvent) {
    sessionCount = getSessionCount();
  }

  return { firstVisit, sessionStart, sessionCount };
}

/* -----------------------------------
 *
 * EventPrams
 *
 * -------------------------------- */

function getEventParams(event: EventParams) {
  if (Array.isArray(event)) {
    return event.map((items) => items.map((item) => item?.toString()));
  }

  return Object.keys(event).map((key) => [key, `${event[key]}`]);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export {
  EventParams,
  clientKey,
  sessionKey,
  counterKey,
  getDocument,
  getClientId,
  getSessionId,
  getSessionState,
  getEventParams,
};
