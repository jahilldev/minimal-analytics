import { hasStorage, isStorageClassSupported, MemoryStorage, safeStorageFactory } from './storage';
import { getRandomId } from './utility';

/* -----------------------------------
 *
 * Types
 *
 * -------------------------------- */

type ParamValue = string | number | undefined | null;
type EventParams = Record<string, ParamValue> | [string, ParamValue][];
type EventParamArray = [string, string][];

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

const LocalStorage = safeStorageFactory('localStorage', MemoryStorage);
const SessionStorage = safeStorageFactory('sessionStorage', MemoryStorage);

/* -----------------------------------
 *
 * Document
 *
 * -------------------------------- */

function getDocument() {
  const location = globalThis.document?.location || globalThis.location;

  const { hostname, origin, pathname, search } = location || { };
  const title = globalThis.document?.title;
  const referrer = globalThis.document?.referrer;

  return { location: origin + pathname + search, hostname, pathname, referrer, title };
}

/* -----------------------------------
 *
 * ClientId
 *
 * -------------------------------- */

let supportsLocalStorage = null;
function maybeWarnStorage() {
  if (typeof supportsLocalStorage !== 'boolean') {
    const hasLocalStorage = hasStorage('localStorage');
    const isLocalStorageSupported = isStorageClassSupported(globalThis['localStorage']);
    supportsLocalStorage = (hasLocalStorage && isLocalStorageSupported);
  }

  if (!supportsLocalStorage) {
    console.warn('Minimal Analytics: localStorage not available, ClientID will not be persisted.');
  }
}

function getClientId(key = clientKey) {
  const storedValue = LocalStorage.getItem(key);
  if (storedValue) {
    return storedValue;
  }

  maybeWarnStorage();

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
  const firstVisit = !LocalStorage.getItem(clientKey) ? '1' : void 0;
  const sessionStart = !SessionStorage.getItem(sessionKey) ? '1' : void 0;
  let sessionCount = SessionStorage.getItem(counterKey) || '1';

  if (firstEvent) {
    sessionCount = getSessionCount();
  }

  return { firstVisit, sessionStart, sessionCount };
}

/* -----------------------------------
 *
 * EventParams
 *
 * -------------------------------- */

function getEventParams(event: EventParams): EventParamArray {
  if (Array.isArray(event)) {
    return event.map((items) => ([ items[0]?.toString(), items[1]?.toString() ]));
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
  EventParamArray,
  clientKey,
  sessionKey,
  counterKey,
  getDocument,
  getClientId,
  getSessionId,
  getSessionState,
  getEventParams,
};
