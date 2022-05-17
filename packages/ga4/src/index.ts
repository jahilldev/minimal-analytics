import { debounce } from '@minimal-analytics/shared';

/* -----------------------------------
 *
 * Window
 *
 * -------------------------------- */

declare global {
  interface Window {
    gaTrackingId?: string;
  }
}

/* -----------------------------------
 *
 * IProps
 *
 * -------------------------------- */

interface IProps {
  type?: string;
  event?: Record<string, string | number>;
  debug?: boolean;
  error?: {
    message: string;
    fatal: boolean;
  };
}

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const clientKey = '_gacid';
const sessionKey = '_gasid';
const counterKey = '_gasct';
const analyticsEndpoint = 'https://www.google-analytics.com/g/collect';
const searchTerms = ['q', 's', 'search', 'query', 'keyword'];
let eventsBound = false;
let scrollHandler = null;
let unloadHandler = null;
let engagementTimes = [[Date.now()]];

/* -----------------------------------
 *
 * Events
 *
 * -------------------------------- */

const eventKeys = {
  pageView: 'page_view',
  scroll: 'scroll',
  viewSearchResults: 'view_search_results',
  userEngagement: 'user_engagement',
};

/* -----------------------------------
 *
 * Arguments
 *
 * -------------------------------- */

function getArguments(...args: any[]): [string, IProps] {
  const trackingId = typeof args[0] === 'string' ? args[0] : window.gaTrackingId;
  const props = typeof args[0] === 'object' ? args[0] : args[1] || {};

  return [trackingId, { type: eventKeys.pageView, ...props }];
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
 * EventMeta
 *
 * -------------------------------- */

function getEventMeta({ type, event }: Pick<IProps, 'type' | 'event'>) {
  const searchString = document.location.search;
  const searchParams = new URLSearchParams(searchString);

  const searchResults = searchTerms.some((term) =>
    new RegExp(`[\?|&]${term}=`, 'g').test(searchString)
  );

  const eventId = searchResults ? eventKeys.viewSearchResults : type;
  const searchTerm = searchTerms.find((term) => searchParams.get(term));

  return {
    en: eventId,
    'ep.search_term': searchTerm,
    ...(event && { ...event }),
  };
}

/* -----------------------------------
 *
 * Document
 *
 * -------------------------------- */

function getDocumentMeta() {
  const title = document.title;
  const origin = document.location.origin;
  const pathname = document.location.pathname;
  const search = document.location.search;
  const referrer = document.referrer;

  return { dr: referrer, dl: origin + pathname + search, dt: title };
}

/* -----------------------------------
 *
 * Device
 *
 * -------------------------------- */

function getDeviceMeta() {
  let screenSize = `${(self.screen || {}).width}x${(self.screen || {}).height}`;
  let colourDepth;
  let viewPort;

  const visual = {
    width: Math.floor((self.visualViewport || {}).width),
    height: Math.floor((self.visualViewport || {}).height),
  };

  if (screen.colorDepth) {
    colourDepth = `${screen.colorDepth}-bit`;
  }

  if (self.visualViewport) {
    viewPort = `${visual.width}x${visual.height}`;
  }

  return { sd: colourDepth, sr: screenSize, vp: viewPort };
}

/* -----------------------------------
 *
 * Query
 *
 * -------------------------------- */

function getQueryParams(trackingId: string, { type, event, debug, error }: IProps) {
  const firstVisit = localStorage.getItem(clientKey) ? '1' : void 0;
  const sessionStart = sessionStorage.getItem(sessionKey) ? '1' : void 0;

  const payload = {
    v: '2', // v2 for GA4
    tid: trackingId,
    _p: getSessionId('_gapid'),
    ul: (navigator.language || '').toLowerCase() || void 0,
    cid: getClientId(),
    _fv: firstVisit,
    _s: '1',
    sid: getSessionId(),
    sct: getSessionCount(),
    seg: '1',
    _ss: sessionStart,
    _dbg: debug ? '1' : void 0,
    exd: error?.message || void 0,
    ...getEventMeta({ type, event }),
    ...getDocumentMeta(),
    ...getDeviceMeta(),
  };

  Object.keys(payload).forEach((key) => payload[key] ?? delete payload[key]);

  return new URLSearchParams(payload);
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
 * VisibilityEvent
 *
 * -------------------------------- */

function onVisibilityChange() {
  const timeIndex = engagementTimes.length - 1;
  const isVisible = document.visibilityState === 'visible';

  if (!isVisible) {
    engagementTimes[timeIndex].push(Date.now());

    return;
  }

  engagementTimes.push([Date.now()]);
}

/* -----------------------------------
 *
 * ScrollEvent
 *
 * -------------------------------- */

const onScrollEvent = debounce((trackingId: string) => {
  const percentage = getScrollPercentage();

  if (percentage < 90) {
    return;
  }

  track(trackingId, { type: eventKeys.scroll, event: { 'epn.percent_scrolled': 90 } });

  document.removeEventListener('scroll', scrollHandler);
});

/* -----------------------------------
 *
 * UnloadEvent
 *
 * -------------------------------- */

function onUnloadEvent(trackingId: string) {
  const timeActive = engagementTimes.reduce(
    (result, [visible, hidden = Date.now()]) => (result += hidden - visible),
    0
  );

  track(trackingId, { type: eventKeys.userEngagement, event: { _et: timeActive } });
}

/* -----------------------------------
 *
 * BindEvent
 *
 * -------------------------------- */

function bindEvents(trackingId: string) {
  if (eventsBound) {
    return;
  }

  eventsBound = true;
  scrollHandler = onScrollEvent.bind(null, trackingId);
  unloadHandler = onUnloadEvent.bind(null, trackingId);

  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('scroll', scrollHandler);
  window.addEventListener('beforeunload', unloadHandler);
}

/* -----------------------------------
 *
 * Track
 *
 * -------------------------------- */

function track(trackingId: string, props?: IProps);
function track(props?: IProps);
function track(...args: any[]) {
  const [trackingId, { type, event, debug, error }] = getArguments(...args);

  if (!trackingId) {
    console.error('GA4: Tracking ID is missing or undefined');

    return;
  }

  const queryParams = getQueryParams(trackingId, { type, event, debug, error });
  const queryString = new URLSearchParams(queryParams).toString();

  navigator.sendBeacon(`${analyticsEndpoint}?${queryString}`);

  bindEvents(trackingId);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { track };
