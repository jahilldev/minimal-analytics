import { track } from '../src/index';

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

/* -----------------------------------
 *
 * Utility
 *
 * -------------------------------- */

const sleep = (time = 1) => new Promise((resolve) => setTimeout(resolve, time * 1000));

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

  beforeEach(() => jest.resetAllMocks());

  it('logs an error message if no tracking ID is provided', () => {
    track();

    expect(errorSpy).toHaveBeenCalledWith(errorTrackingId);
    expect(window.fetch).not.toBeCalled();
  });

  it('can be called directly with a tracking ID', () => {
    track(trackingId);

    expect(window.fetch).toBeCalledTimes(1);
  });

  it('defines the correct query params when sending a default page view', () => {
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
});
