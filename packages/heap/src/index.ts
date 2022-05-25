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

const isBrowser = typeof window !== 'undefined';
const autoTrack = isBrowser && window.minimalAnalytics?.autoTrack;
const analyticsEndpoint = 'https://heapanalytics.com/h';
let eventsBound = false;
let clickHandler = null;

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

function getQueryParams(trackingId: string, { type, event, debug, error }: IProps) {
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
    b: 'web',
    sp: 'r', // ?
    z: '2', // ?
  };

  Object.keys(payload).forEach((key) => payload[key] ?? delete payload[key]);

  return new URLSearchParams(payload);
}

/* -----------------------------------
 *
 * ClickEvent
 *
 * -------------------------------- */

function onClickEvent(trackingId: string, event: PointerEvent) {
  const nodePath = (event as any).path.reverse() as Element[];

  const classList = (className: string) =>
    !className ? className : `.${className.split(' ').join(';.')};`;

  const attrValue = (attributes: NamedNodeMap) => {
    const { href } = Object.assign(
      {},
      ...Array.from(attributes, ({ name, value }) => ({ [name]: value }))
    );

    if (href) {
      return `[href=${href}];`;
    }

    return '';
  };

  const pathValue = nodePath.reduce(
    (result, element) =>
      (result += `${[
        `@${element.tagName.toLowerCase()};`,
        classList(element.className),
        attrValue(element.attributes),
      ].join('')}|`),
    ''
  );

  console.log('##### -> onClickEvent()', { trackingId, pathValue });
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
  const [trackingId, { type, event, debug, error }] = getArguments(args);

  if (!trackingId) {
    console.error('Heap: Tracking ID is missing or undefined');

    return;
  }

  const queryParams = getQueryParams(trackingId, { type, event, debug, error });

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
