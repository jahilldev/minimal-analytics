import {
  getDocument,
  getRandomId,
  getClientId,
  getSessionId,
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
  event?: string[][];
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

function getQueryParams(trackingId: string, { event }: IProps) {
  let payload = [
    [param.appId, trackingId],
    [param.version, '4.0'],
    [param.userId, getClientId()],
    [param.sessionId, getSessionId()],
    [param.viewId, getRandomId()],
    [param.sentTime, `${Date.now()}`],
    ['b', 'web'],
    ['sp', 'r'],
  ];

  payload = payload.concat(getPageData(!!event));
  payload = payload.concat(event ? event : []);

  payload.forEach(([, value], index) => value || delete payload[index]);

  return new URLSearchParams(payload);
}

/* -----------------------------------
 *
 * PageData
 *
 * -------------------------------- */

function getPageData(isEvent: boolean) {
  const { hostname, referrer, title, pathname } = getDocument();

  let payload = [
    [param.domain, hostname],
    [param.title, title],
    [param.path, pathname],
    [param.referrer, referrer],
    [param.previousPage, referrer],
    [param.timeStamp, `${Date.now()}`],
    ['z', '2'], // ?
  ];

  /* TODO
  - Encode list of params "pp" & "sp" (?) if event
  - Example below:
      sp: r (detail)
      sp: http://localhost:8080/articles/
      sp: ts (detail)
      sp: 1653495134162
      sp: d (payload)
      sp: localhost
      sp: h (detail)
      sp: /articles/
      pp: d
      pp: localhost
      pp: h
      pp: /articles/managing-third-party-scripts-performance/
      pp: t
      pp: Managing third party scripts - James Hill
      pp: ts
      pp: 1653495171266
      pp: pr
      pp: /articles/
  */

  if (isEvent) {
    payload = [].concat(
      ...payload.map(([key, value]) => [
        [param.pageParam, key],
        [param.pageParam, value],
      ])
    );
  }

  return payload;
}

/* -----------------------------------
 *
 * AttributeValue
 *
 * -------------------------------- */

function getAttributeValue(attributes: NamedNodeMap | undefined) {
  const { href } = Array.from(attributes || []).reduce(
    (result, { name, value }) => ({
      ...result,
      [name]: value,
    }),
    {} as Record<string, string>
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

  const getHeirachy = (element: Element) => [
    `@${getTagName(element)};`,
    getClassList(element.className),
    getAttributeValue(element.attributes),
  ];

  return nodePath.reduce(
    (result, element) => (result += `${getHeirachy(element).join('')}|`),
    ''
  );
}

/* -----------------------------------
 *
 * ElementData
 *
 * -------------------------------- */

function getElementData(element: Element | any): string[][] {
  const textContent = (element.textContent || '').substring(0, textLimit);

  const eventData = [
    [param.title, 'click'],
    [param.targetTag, getTagName(element)],
    [param.targetText, textContent],
    [param.targetClass, element.className],
    [param.path, element.href],
    [param.timeStamp, `${Date.now() - 5e2}`],
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

  eventData.push([param.hierachy, getElementHierachy(event.path)]);

  track(trackingId, {
    type: 'click',
    event: eventData.map(([param, value]) => [param + eventCounter, value]),
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
