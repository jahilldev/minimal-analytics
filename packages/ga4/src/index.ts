import {
  EventParams,
  debounce,
  getDocument,
  getClientId,
  getSessionId,
  getSessionState,
  getScrollPercentage,
  getRandomId,
  isTargetElement,
  getUrlData,
  getEventParams,
} from '@minimal-analytics/shared';
import { param } from './model';

/* -----------------------------------
 *
 * Window
 *
 * -------------------------------- */

declare global {
  interface Window {
    minimalAnalytics?: {
      analyticsEndpoint?: string;
      trackingId?: string;
      autoTrack?: boolean;
    };
  }
}

/* -----------------------------------
 *
 * IProps
 *
 * -------------------------------- */

interface IProps {
  type?: string;
  event?: EventParams;
  debug?: boolean;
}

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const isBrowser = typeof window !== 'undefined';
const autoTrack = isBrowser && window.minimalAnalytics?.autoTrack;
const analyticsEndpoint = 'https://www.google-analytics.com/g/collect';
const searchTerms = ['q', 's', 'search', 'query', 'keyword'];
let trackCalled = false;
let clickHandler = null;
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
  click: 'click',
  viewSearchResults: 'view_search_results',
  userEngagement: 'user_engagement',
};

/* -----------------------------------
 *
 * Arguments
 *
 * -------------------------------- */

function getArguments(args: any[]): [string, IProps] {
  const globalId = window.minimalAnalytics?.trackingId;
  const trackingId = typeof args[0] === 'string' ? args[0] : globalId;
  const props = typeof args[0] === 'object' ? args[0] : args[1] || {};

  return [trackingId, { type: eventKeys.pageView, ...props }];
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

  const eventName = searchResults ? eventKeys.viewSearchResults : type;
  const searchTerm = searchTerms.find((term) => searchParams.get(term));

  let payload = [
    [param.eventName, eventName],
    [`${param.eventParam}.search_term`, searchTerm],
  ];

  if (event) {
    payload = payload.concat(getEventParams(event));
  }

  return payload;
}

/* -----------------------------------
 *
 * Query
 *
 * -------------------------------- */

function getQueryParams(trackingId: string, { type, event, debug }: IProps) {
  const { location, referrer, title } = getDocument();
  const { firstVisit, sessionStart, sessionCount } = getSessionState(!trackCalled);
  const screen = self.screen || ({} as Screen);

  let payload = [
    [param.protocolVersion, '2'],
    [param.trackingId, trackingId],
    [param.pageId, getRandomId()],
    [param.language, (navigator.language || '').toLowerCase() || void 0],
    [param.clientId, getClientId()],
    [param.firstVisit, firstVisit],
    [param.hitCount, '1'],
    [param.sessionId, getSessionId()],
    [param.sessionCount, sessionCount],
    [param.sessionEngagement, '1'],
    [param.sessionStart, sessionStart],
    [param.debug, debug ? '1' : void 0],
    [param.referrer, referrer],
    [param.location, location],
    [param.title, title],
    [param.screenResolution, `${screen.width}x${screen.height}`],
  ];

  payload = payload.concat(getEventMeta({ type, event }));
  payload = payload.filter(([, value]) => value);

  return new URLSearchParams(payload);
}

/* -----------------------------------
 *
 * ActiveTime
 *
 * -------------------------------- */

function getActiveTime() {
  const timeActive = engagementTimes
    .reduce((result, [visible, hidden = Date.now()]) => (result += hidden - visible), 0)
    .toString();

  return timeActive;
}

/* -----------------------------------
 *
 * ClickEvent
 *
 * -------------------------------- */

function onClickEvent(trackingId: string, event: Event) {
  const targetElement = isTargetElement(event.target as Element, 'a, button');
  const tagName = targetElement?.tagName?.toLowerCase();
  const elementType = tagName === 'a' ? 'link' : tagName;
  const elementParam = `${param.eventParam}.${elementType}`;
  const hrefAttr = targetElement?.getAttribute('href');
  const { isExternal, hostname } = getUrlData(hrefAttr);
  const isInternalLink = elementType === 'link' && hostname && !isExternal;

  if (!targetElement || isInternalLink) {
    return;
  }

  track(trackingId, {
    type: eventKeys.click,
    event: [
      [`${elementParam}_id`, targetElement.id],
      [`${elementParam}_classes`, targetElement.className],
      [`${elementParam}_text`, targetElement.textContent?.trim()],
      [`${elementParam}_url`, hrefAttr],
      [`${elementParam}_domain`, hostname],
      [`${param.eventParam}.outbound`, `${isExternal}`],
      [param.enagementTime, getActiveTime()],
    ],
  });
}

/* -----------------------------------
 *
 * BlurEvent
 *
 * -------------------------------- */

function onBlurEvent() {
  const timeIndex = engagementTimes.length - 1;
  const [, isHidden] = engagementTimes[timeIndex];

  if (!isHidden) {
    engagementTimes[timeIndex].push(Date.now());
  }
}

/* -----------------------------------
 *
 * FocusEvent
 *
 * -------------------------------- */

const onFocusEvent = debounce(() => {
  const timeIndex = engagementTimes.length - 1;
  const [, isHidden] = engagementTimes[timeIndex];

  if (isHidden) {
    engagementTimes.push([Date.now()]);
  }
});

/* -----------------------------------
 *
 * VisibilityEvent
 *
 * -------------------------------- */

function onVisibilityChange() {
  const timeIndex = engagementTimes.length - 1;
  const [, isHidden] = engagementTimes[timeIndex];
  const isVisible = document.visibilityState === 'visible';

  if (!isVisible) {
    !isHidden && engagementTimes[timeIndex].push(Date.now());

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

  track(trackingId, {
    type: eventKeys.scroll,
    event: [[`${param.eventParamNumber}.percent_scrolled`, 90]],
  });

  document.removeEventListener('scroll', scrollHandler);
});

/* -----------------------------------
 *
 * UnloadEvent
 *
 * -------------------------------- */

function onUnloadEvent(trackingId: string) {
  track(trackingId, {
    type: eventKeys.userEngagement,
    event: [[param.enagementTime, getActiveTime()]],
  });
}

/* -----------------------------------
 *
 * BindEvent
 *
 * -------------------------------- */

function bindEvents(trackingId: string) {
  if (trackCalled) {
    return;
  }

  clickHandler = onClickEvent.bind(null, trackingId);
  scrollHandler = onScrollEvent.bind(null, trackingId);
  unloadHandler = onUnloadEvent.bind(null, trackingId);

  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('mouseover', onFocusEvent);
  document.addEventListener('scroll', scrollHandler);
  document.addEventListener('click', clickHandler);

  window.addEventListener('blur', onBlurEvent);
  window.addEventListener('focus', onFocusEvent);
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
  const [trackingId, { type, event, debug }] = getArguments(args);

  if (!trackingId) {
    console.error('GA4: Tracking ID is missing or undefined');

    return;
  }

  const queryParams = getQueryParams(trackingId, { type, event, debug });
  const endpoint = window.minimalAnalytics?.analyticsEndpoint || analyticsEndpoint;

  navigator.sendBeacon(`${endpoint}?${queryParams}`);

  bindEvents(trackingId);

  trackCalled = true;
}

/* -----------------------------------
 *
 * Init
 *
 * -------------------------------- */

if (autoTrack) {
  track();
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { track };
