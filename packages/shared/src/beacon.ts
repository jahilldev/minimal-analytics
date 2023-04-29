/* -----------------------------------
 *
 * sendBeacon with XMLHttpRequest
 *
 * -------------------------------- */

const syncEvents = new Set(['unload', 'beforeunload', 'pagehide']);

function sendBeaconXHR(url: string | URL, data?: XMLHttpRequestBodyInit | null): boolean {
   const eventType = this?.event?.type;
   const sync = syncEvents.has((eventType || '').toLowerCase());

   const xhr = new XMLHttpRequest();
   xhr.open('POST', url, !sync);
   xhr.withCredentials = true;
   xhr.setRequestHeader('Accept', '*/*');


   if (typeof data === 'string') {
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      xhr.responseType = 'text';
   } else if ((data instanceof Blob) && data.type) {
      xhr.setRequestHeader('Content-Type', data.type);
   }

   try {
      xhr.send(data);
   } catch (error) {
      return false;
   }

   return true;
}

/* -----------------------------------
 *
 * sendBeacon with Fetch
 *
 * -------------------------------- */

function sendBeaconFetch(url: string | URL, data?: XMLHttpRequestBodyInit | null): boolean {
   try {
      fetch(url, {
         method: 'POST',
         body: data,
         credentials: 'include',
         mode: 'cors',
         keepalive: true, // Not present on Firefox
      })
      .catch(() => { }); // Avoid unhandledrejection
      return true;
   } catch (e) {
      return false;
   }
}

/* -----------------------------------
 *
 * sendBeacon
 *
 * -------------------------------- */

function sendBeacon(url: string | URL, data?: XMLHttpRequestBodyInit | null): boolean {
   // #1: navigator.sendBeacon (window Scope)
   const hasBeaconApi = (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function');
   if (hasBeaconApi) {
      if (data) {
         return navigator.sendBeacon(url, data);
      }
      return navigator.sendBeacon(url);
   }

   // #2: XMLHttpRequest (Worker Scope, except ServiceWorker)
   // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#sect1
   const hasXHR = (typeof XMLHttpRequest !== 'undefined');
   if (hasXHR) {
      if (data) {
         return sendBeaconXHR(url, data);
      }
      return sendBeaconXHR(url);
   }

   // #3: fetch (ServiceWorker Scope)
   const hasFetch = (typeof fetch !== 'undefined');
   if (hasFetch) {
      if (data) {
         return sendBeaconFetch(url, data);
      }
      return sendBeaconFetch(url);
   }

   return false;
}

/* -----------------------------------
 *
 * Exports
 *
 * -------------------------------- */

export {
   sendBeaconXHR,
   sendBeaconFetch,
   sendBeacon,
};
