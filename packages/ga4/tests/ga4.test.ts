import { clientKey, counterKey, sessionKey } from '@minimal-analytics/shared';
import { track } from '../src/index';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const trackingId = 'GX-XXXXX';
const analyticsEndpoint = 'https://www.google-analytics.com/g/collect';
const analyticsVersion = '2';
const errorTrackingId = 'GA4: Tracking ID is missing or undefined';
const testTitle = 'testTitle';
const testUrl = 'https://google.com';
const testLanguage = 'en-gb';
const testWidth = 1600;
const testHeight = 900;
const testEvent = 'custom_event';
const testData = Math.random();
const testLink = 'https://google.com';
const testAnchor = `
  <main>
    <a href="${testLink}">${testTitle}</a>
  </main>
`;

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

Object.defineProperty(navigator, 'sendBeacon', { value: jest.fn() });

/* -----------------------------------
 *
 * GA4
 *
 * -------------------------------- */

describe('ga4 -> track()', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  Object.defineProperties(document, {
    referrer: {
      value: testUrl,
    },
    title: {
      value: testTitle,
    },
  });

  Object.defineProperty(navigator, 'language', {
    value: testLanguage,
  });

  Object.defineProperty(self, 'screen', {
    value: { width: testWidth, height: testHeight },
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
    expect(navigator.sendBeacon).not.toBeCalled();
  });

  it('can be called directly with a tracking ID', () => {
    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);
  });

  it('defines the correct query params when sending a default page view', () => {
    const params = [
      analyticsEndpoint,
      `v=${analyticsVersion}`,
      `tid=${trackingId}`,
      `ul=${testLanguage}`,
      'en=page_view',
      `dr=${encodeURIComponent(testUrl)}`,
      `dt=${encodeURIComponent(testTitle)}`,
    ];

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining(param))
    );
  });

  it('correctly defines a users first visit when tracking is called ', () => {
    localStorage.removeItem(clientKey);
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem(counterKey);

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);
    expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining('_fv=1'));
    expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining('_ss=1'));
    expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining('sct=1'));

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(2);
    expect(navigator.sendBeacon).not.nthCalledWith(2, expect.stringContaining('_fv=1'));
    expect(navigator.sendBeacon).not.nthCalledWith(2, expect.stringContaining('_ss=1'));
    expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining('sct=1'));
  });

  it('defines the correct query param when sending a custom event', () => {
    const params = [`en=${testEvent}`, `ep.random=${testData}`];

    track(trackingId, { type: testEvent, event: { 'ep.random': testData } });

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining(param))
    );
  });

  it('uses the supplied analytics endpoint if defined on the window', () => {
    const testEndpoint = `${testUrl}/collect/${Math.random()}`;

    window.minimalAnalytics = {
      analyticsEndpoint: testEndpoint,
    };

    track(trackingId);

    delete window.minimalAnalytics;

    expect(navigator.sendBeacon).toBeCalledTimes(1);
    expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining(testEndpoint));
  });

  it('triggers a tracking event when a target element is clicked', async () => {
    root.innerHTML = testAnchor;

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    const link = root.querySelector('a');
    const event = new CustomEvent('click');

    Object.defineProperty(event, 'target', { value: link });

    document.dispatchEvent(event);

    expect(navigator.sendBeacon).toBeCalledTimes(2);
  });

  it('triggers a tracking event once when scroll is 90% of window', async () => {
    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    document.body.scrollTop = window.innerHeight * 0.95;
    document.dispatchEvent(new Event('scroll'));

    await sleep();

    expect(navigator.sendBeacon).toBeCalledTimes(2);
    expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`epn.percent_scrolled=90`)
    );

    document.dispatchEvent(new Event('scroll'));

    await sleep();

    expect(navigator.sendBeacon).toBeCalledTimes(2);
  });

  it('tracks engagement using document visibility event', async () => {
    const events = [...Array(4).keys()];
    let isVisible = 'visible';

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    for (const time of events) {
      Object.defineProperty(document, 'visibilityState', {
        value: (isVisible = isVisible === 'visible' ? 'hidden' : 'visible'),
        writable: true,
      });

      document.dispatchEvent(new Event('visibilitychange'));

      await sleep(time * 0.5);
    }

    window.dispatchEvent(new Event('beforeunload'));

    expect(navigator.sendBeacon).toBeCalledTimes(2);
    expect(navigator.sendBeacon).toBeCalledWith(
      expect.stringContaining('en=user_engagement')
    );
  });
});
