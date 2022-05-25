import { getDocument, getRandomId, getClientId, getSessionId } from '@minimal-analytics/shared';
import { params } from './model';

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
  event?: Record<string, string | number>;
}

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const isBrowser = typeof window !== 'undefined';
const autoTrack = isBrowser && window.minimalAnalytics?.autoTrack;
const analyticsEndpoint = 'https://heapanalytics.com/h';
let eventsBound = false;
let clickHandler = null;
let eventCounter = 0;

/* -----------------------------------
 *
 * Arguments
 *
 * -------------------------------- */

function getArguments(args: any[]): [string, IProps] {
  const globalId = window.minimalAnalytics?.trackingId;
  const trackingId = typeof args[0] === 'string' ? args[0] : globalId;
  const props = typeof args[0] === 'object' ? args[0] : args[1] || {};

  return [trackingId, { ...props }];
}

/* -----------------------------------
 *
 * Query
 *
 * -------------------------------- */

function getQueryParams(trackingId: string, { event }: IProps) {
  const { hostname, referrer, title, pathname } = getDocument();

  const payload = {
    [params.appId]: trackingId,
    [params.domain]: hostname,
    [params.path]: pathname,
    [params.version]: '4.0',
    [params.userId]: getClientId(),
    [params.referrer]: referrer,
    [params.sessionId]: getSessionId(),
    [params.viewId]: getRandomId(),
    [params.title]: title,
    [params.previousPage]: referrer,
    [params.timeStamp]: `${Date.now()}`,
    [params.sentTime]: `${Date.now()}`,
    ...(event && { ...event }),
    b: 'web',
    sp: 'r', // ?
    z: '2', // ?
  };

  Object.keys(payload).forEach((key) => payload[key] ?? delete payload[key]);

  return new URLSearchParams(payload);
}

/* -----------------------------------
 *
 * AttributeValue
 *
 * -------------------------------- */

function getAttributeValue(attributes: NamedNodeMap) {
  const { href } = Object.assign(
    {},
    ...Array.from(attributes, ({ name, value }) => ({ [name]: value }))
  );

  let result = '';

  if (href) {
    result = `[href=${href}];`;
  }

  return result;
}

/* -----------------------------------
 *
 * ClickEvent
 *
 * -------------------------------- */

function onClickEvent(trackingId: string, event: PointerEvent) {
  const target = event.target as any;
  const nodePath = (event as any).path.reverse() as Element[];

  const classList = (className: string) =>
    !className ? className : `.${className.split(' ').join(';.')};`;

  const pathValue = nodePath.reduce(
    (result, element) =>
      (result += `${[
        `@${element.tagName.toLowerCase()};`,
        classList(element.className),
        getAttributeValue(element.attributes),
      ].join('')}|`),
    ''
  );

  const eventData = [
    [params.title, 'click'],
    [params.targetTag, target.tagName?.toLowerCase()],
    [params.targetText, target.textContent],
    [params.targetClass, target.className],
    [params.path, target.href],
    [params.hierachy, pathValue],
    [params.timeStamp, Date.now()],
  ];

  track(trackingId, {
    event: eventData.reduce(
      (result, [param, value]) => ({
        ...result,
        [param + eventCounter]: value,
      }),
      {}
    ),
  });

  eventCounter += 1;
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
  clickHandler = onClickEvent.bind(null, trackingId);

  document.addEventListener('click', clickHandler);
}

/* -----------------------------------
 *
 * Track
 *
 * -------------------------------- */

function track(trackingId: string, props?: IProps);
function track(props?: IProps);
function track(...args: any[]) {
  const [trackingId, { event }] = getArguments(args);

  if (!trackingId) {
    console.error('Heap: Tracking ID is missing or undefined');

    return;
  }

  const queryParams = getQueryParams(trackingId, { event });

  window.fetch(`${analyticsEndpoint}?${queryParams}`, {
    mode: 'no-cors',
  });

  bindEvents(trackingId);
}

/* -----------------------------------
 *
 * Init
 *
 * -------------------------------- */

if (autoTrack) {
  track(window.minimalAnalytics?.trackingId);
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { track };
