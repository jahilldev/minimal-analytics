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
  event?: Record<string, string>;
}

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const isBrowser = typeof window !== 'undefined';
const autoTrack = isBrowser && window.minimalAnalytics?.autoTrack;
const analyticsEndpoint = 'https://heapanalytics.com/h';
const textLimit = 64;
const blockedTags = ['html', 'body'];
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

  return [trackingId, { type: 'view', ...props }];
}

/* -----------------------------------
 *
 * Query
 *
 * -------------------------------- */

function getQueryParams(trackingId: string, { type, event }: IProps) {
  const { hostname, referrer, title, pathname } = getDocument();

  let payload = {
    [params.appId]: trackingId,
    [params.domain]: hostname,
    [params.version]: '4.0',
    [params.userId]: getClientId(),
    [params.sessionId]: getSessionId(),
    [params.viewId]: getRandomId(),
    [params.sentTime]: `${Date.now()}`,
    b: 'web',
    sp: 'r', // ?
  };

  if (type === 'view') {
    payload = {
      ...payload,
      [params.title]: title,
      [params.path]: pathname,
      [params.referrer]: referrer,
      [params.previousPage]: referrer,
      [params.timeStamp]: `${Date.now()}`,
      z: '2', // ?
    };
  }

  if (type === 'click') {
    payload = {
      ...payload,
      ...event,
    };
  }

  Object.keys(payload).forEach((key) => payload[key] || delete payload[key]);

  return new URLSearchParams(payload);
}

/* -----------------------------------
 *
 * AttributeValue
 *
 * -------------------------------- */

function getAttributeValue(attributes: NamedNodeMap | undefined) {
  const { href } = Object.assign(
    {},
    ...Array.from(attributes || [], ({ name, value }) => ({ [name]: value }))
  );

  let result = '';

  if (href) {
    result = `[href=${href}];`;
  }

  return result;
}

/* -----------------------------------
 *
 * ClassList
 *
 * -------------------------------- */

function getClassList(className: string) {
  return !className ? className : `.${className.split(' ').join(';.')};`;
}

/* -----------------------------------
 *
 * TagName
 *
 * -------------------------------- */

function getTagName(element: Element) {
  return (element.tagName || element.parentElement?.tagName).toLowerCase();
}

/* -----------------------------------
 *
 * Hierachy
 *
 * -------------------------------- */

function getElementHierachy(path: Element[]) {
  const nodePath = path.reverse().filter(({ tagName }) => {
    return !!tagName && !blockedTags.includes(tagName.toLowerCase());
  });

  return nodePath.reduce(
    (result, element) =>
      (result += `${[
        `@${getTagName(element)};`,
        getClassList(element.className),
        getAttributeValue(element.attributes),
      ].join('')}|`),
    ''
  );
}

/* -----------------------------------
 *
 * ElementData
 *
 * -------------------------------- */

function getElementData(element: Element | any) {
  const textContent = (element.textContent || '').substring(0, textLimit);

  const eventData = [
    [params.title, 'click'],
    [params.targetTag, getTagName(element)],
    [params.targetText, textContent],
    [params.targetClass, element.className],
    [params.path, element.href],
    [params.timeStamp, Date.now()],
  ];

  return eventData;
}

/* -----------------------------------
 *
 * ClickEvent
 *
 * -------------------------------- */

function onClickEvent(trackingId: string, event: PointerEvent | any) {
  const target = event.target as Element;
  const eventData = getElementData(target);

  eventData.push([params.hierachy, getElementHierachy(event.path)]);

  track(trackingId, {
    type: 'click',
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
  const [trackingId, { type, event }] = getArguments(args);

  if (!trackingId) {
    console.error('Heap: Tracking ID is missing or undefined');

    return;
  }

  const queryParams = getQueryParams(trackingId, { type, event });

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
