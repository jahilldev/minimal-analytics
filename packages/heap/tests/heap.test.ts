import { track } from '../src/index';
import { param } from '../src/model';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const trackingId = 'GX-XXXXX';
const analyticsEndpoint = 'https://heapanalytics.com/h';
const errorTrackingId = 'Heap: Tracking ID is missing or undefined';
const testDomain = 'localhost';
const testPath = '/';
const testReferrer = 'https://google.com';
const testTitle = 'testTitle';
const fetchOptions = { mode: 'no-cors' };
const testLink = 'https://google.com';
const testClass = 'testClass';
const testAnchor = `
  <section id="article">
    <main class="${testClass} ${testClass}">
      <a href="${testLink}" class="${testClass}">${testTitle}</a>
    </main>
  </section>
`;

/* -----------------------------------
 *
 * Utility
 *
 * -------------------------------- */

const sleep = (time = 1) => new Promise((resolve) => setTimeout(resolve, time * 1000));

/* -----------------------------------
 *
 * Path
 *
 * -------------------------------- */

function getElementPath(element: Element) {
  let result = [element];
  let parent = element.parentElement;

  while (parent && parent.tagName !== 'BODY') {
    result.push(parent);
    parent = parent.parentElement;
  }

  return result;
}

/* -----------------------------------
 *
 * Mocks
 *
 * -------------------------------- */

Object.defineProperty(window, 'fetch', { value: jest.fn() });

/* -----------------------------------
 *
 * Heap
 *
 * -------------------------------- */

describe('heap -> track()', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  Object.defineProperties(document, {
    referrer: {
      value: testReferrer,
    },
    title: {
      value: testTitle,
    },
  });

  let root;

  beforeEach(() => {
    jest.resetAllMocks();
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.removeChild(root);
  });

  it('logs an error message if no tracking ID is provided', () => {
    track();

    expect(errorSpy).toHaveBeenCalledWith(errorTrackingId);
    expect(window.fetch).not.toBeCalled();
  });

  it('can be called directly with a tracking ID', () => {
    track(trackingId);

    expect(window.fetch).toBeCalledTimes(1);
  });

  it('defines the correct query params when sending a default page view request', () => {
    const params = [
      analyticsEndpoint,
      `a=${trackingId}`,
      `d=${testDomain}`,
      `h=${encodeURIComponent(testPath)}`,
      `r=${encodeURIComponent(testReferrer)}`,
      `t=${testTitle}`,
    ];

    track(trackingId);

    expect(window.fetch).toBeCalledTimes(1);

    params.forEach((param) =>
      expect(window.fetch).toBeCalledWith(expect.stringContaining(param), fetchOptions)
    );
  });

  it('defines the correct query params when sending a click event request', () => {
    const params = [
      analyticsEndpoint,
      `${param.appId}=${trackingId}`,
      `${param.pageParam}=${param.domain}`,
      `${param.pageParam}=${testDomain}`,
      `${param.pageParam}=${param.path}`,
      `${param.pageParam}=${encodeURIComponent(testPath)}`,
      `${param.pageParam}=${param.referrer}`,
      `${param.pageParam}=${encodeURIComponent(testReferrer)}`,
      `${param.title}0=click`,
      `${param.targetTag}0=a`,
      `${param.targetText}0=${testTitle}`,
      `${param.targetClass}0=${testClass}`,
    ];

    root.innerHTML = testAnchor;

    track(trackingId);

    const link = root.querySelector('a');
    const event = new CustomEvent('click');

    Object.defineProperty(event, 'target', { value: link });
    Object.defineProperty(event, 'path', { value: getElementPath(link) });

    document.dispatchEvent(event);

    expect(window.fetch).toBeCalledTimes(2);

    params.forEach((param) =>
      expect(window.fetch).toBeCalledWith(expect.stringContaining(param), fetchOptions)
    );
  });
});
