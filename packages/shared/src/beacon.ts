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

function sendBeacon(url: string | URL, data?: XMLHttpRequestBodyInit | null): boolean {
   const hasBeaconApi = (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function');
   if (hasBeaconApi) {
      if (data) {
         return navigator.sendBeacon(url, data);
      }
      return navigator.sendBeacon(url);
   }

   if (data) {
      return sendBeaconXHR(url, data);
   }
   return sendBeaconXHR(url);
}

export {
   sendBeaconXHR,
   sendBeacon,
};
