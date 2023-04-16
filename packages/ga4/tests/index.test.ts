import { clientKey, counterKey, getClientId, getSessionState, sessionKey } from '@minimal-analytics/shared';
import { track } from '../src/index';
import { param } from '../src/model';

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
const testDomain = 'google.com';
const testExtension = 'pdf';
const testLink = `https://${testDomain}/hello`;
const testFile = `/assets/junglistmanifesto.${testExtension}`;
const testId = 'testId';
const testClass = 'testClass';
const testAnchor = `
  <main>
    <a href="${testLink}" id="${testId}" class="${testClass}">
      <span>${testTitle}</span>
    </a>
    <a href="/" id="internal">${testTitle}</a>
    <a href="${testFile}" id="download">${testTitle}</a>
    <button download="${testFile}">${testTitle}</button>
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

Object.defineProperty(navigator, 'sendBeacon', {
  writable: true,
  configurable: true,
  value: jest.fn()
});

/* -----------------------------------
 *
 * GA4
 *
 * -------------------------------- */

describe('ga4 -> track()', () => {
  jest.setTimeout(15000);

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
    localStorage.clear();
    sessionStorage.clear();
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

  describe('when navigator.sendBeacon is not available', () => {
    const originalXhr = XMLHttpRequest;
    const originalSendBeacon = navigator.sendBeacon;
    const xhrMock: Partial<XMLHttpRequest> = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      readyState: 4,
      status: 200,
      response: 'OK'
    };

    beforeEach(() => {
      jest.spyOn(window, 'XMLHttpRequest')
        .mockImplementation(() => xhrMock as XMLHttpRequest);
      Object.defineProperty(navigator, 'sendBeacon', {
        writable: true,
        configurable: true,
        value: undefined
      });
    });
  
    afterEach(() => {
      window.XMLHttpRequest = originalXhr;
      Object.defineProperty(navigator, 'sendBeacon', {
        writable: true,
        configurable: true,
        value: originalSendBeacon
      });
    });

    it('it defaults to XMLHttpRequest', () => {
      track(trackingId);

      expect(xhrMock.open)
        .toBeCalledWith('POST', expect.stringContaining(analyticsEndpoint), expect.anything());
    });

    describe('when XMLHttpRequest is not available', () => {
      const originalFetch = global.fetch;
      const fetchMock = jest.fn();

      beforeEach(() => {
        Object.assign(window, {
          XMLHttpRequest: undefined,
        });
        global.fetch = fetchMock;
        fetchMock.mockImplementation(() => Promise.resolve(''));
      });

      afterEach(() => {
        global.fetch = originalFetch;
        Object.assign(window, {
          XMLHttpRequest: originalXhr,
        });
      });

      it('it defaults to fetch', () => {
        track(trackingId);

        expect(fetch)
          .toBeCalledWith(expect.stringContaining(analyticsEndpoint), expect.objectContaining({
            method: 'POST'
          }));
      });
    });
  });

  it('defines the correct query params when sending a default page view', () => {
    const params = [
      analyticsEndpoint,
      `${param.protocolVersion}=${analyticsVersion}`,
      `${param.trackingId}=${trackingId}`,
      `${param.language}=${testLanguage}`,
      `${param.eventName}=page_view`,
      `${param.referrer}=${encodeURIComponent(testUrl)}`,
      `${param.title}=${encodeURIComponent(testTitle)}`,
    ];

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining(param))
    );
  });

  it('correctly defines a users first visit when tracking is called ', () => {
    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);
    expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`${param.firstVisit}=1`)
    );
    expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`${param.sessionStart}=1`)
    );
    expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`${param.sessionCount}=1`)
    );

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(2);

    expect(navigator.sendBeacon).not.toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`${param.firstVisit}=1`)
    );

    expect(navigator.sendBeacon).not.toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`${param.sessionStart}=1`)
    );

    expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`${param.sessionCount}=1`)
    );
  });

  it('tracks engagement using document visibility and focus events', async () => {
    const events = [...Array(4).keys()];
    const timeExpected = events.length / 2;
    let isVisible = 'visible';

    const params = [
      `${param.eventName}=user_engagement`,
      `${param.enagementTime}=${timeExpected}`,
    ];

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    for (const _ of events) {
      Object.defineProperty(document, 'visibilityState', {
        value: (isVisible = isVisible === 'visible' ? 'hidden' : 'visible'),
        writable: true,
      });

      document.dispatchEvent(new Event('visibilitychange'));

      await sleep(1);
    }

    window.dispatchEvent(new Event('blur'));

    await sleep(2);

    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('beforeunload'));

    expect(navigator.sendBeacon).toBeCalledTimes(2);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining(param)
      )
    );
  });

  it('defines the correct query param when sending a custom event', () => {
    const params = [
      `${param.eventName}=${testEvent}`,
      `${param.eventParamNumber}.random=${testData}`,
    ];

    track(trackingId, {
      type: testEvent,
      event: { [`${param.eventParamNumber}.random`]: testData },
    });

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toBeCalledWith(expect.stringContaining(param))
    );
  });

  it('overrides existing params when set by user', () => {
    const testClientId = '123456789';
    const params = [
      `${param.eventParam}.${param.clientId}=${testClientId}`,
    ];

    track(trackingId, {
      type: testEvent,
      event: {
        [`${param.eventParam}.${param.clientId}`]: testClientId,
      },
    });

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

  it('triggers a tracking event when an external link is clicked', async () => {
    const params = [
      `${param.eventName}=click`,
      `${param.eventParam}.link_id=${testId}`,
      `${param.eventParam}.link_classes=${testClass}`,
      `${param.eventParam}.link_text=${testTitle}`,
      `${param.eventParam}.link_url=${encodeURIComponent(testLink)}`,
      `${param.eventParam}.link_domain=${testDomain}`,
      `${param.eventParam}.outbound=true`,
    ];

    root.innerHTML = testAnchor;

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    const link = root.querySelector('a');
    const event = new CustomEvent('click');

    Object.defineProperty(event, 'target', { value: link });

    document.dispatchEvent(event);

    expect(navigator.sendBeacon).toBeCalledTimes(2);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining(param)
      )
    );
  });

  it('does not trigger a tracking event when an internal link is clicked', () => {
    root.innerHTML = testAnchor;

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    const link = root.querySelector('a#internal');
    const event = new CustomEvent('click');

    Object.defineProperty(event, 'target', { value: link });

    document.dispatchEvent(event);

    expect(navigator.sendBeacon).toBeCalledTimes(1);
  });

  it('triggers a download tracking event when a file anchor is clicked', async () => {
    const params = [
      `${param.eventName}=file_download`,
      `${param.eventParam}.link_id=download`,
      `${param.eventParam}.link_text=${testTitle}`,
      `${param.eventParam}.link_url=${encodeURIComponent(testFile)}`,
      `${param.eventParam}.file_name=${encodeURIComponent(testFile)}`,
      `${param.eventParam}.file_extension=${testExtension}`,
      `${param.eventParam}.outbound=false`,
    ];

    root.innerHTML = testAnchor;

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    const link = root.querySelector('#download');
    const event = new CustomEvent('click');

    Object.defineProperty(event, 'target', { value: link });

    document.dispatchEvent(event);

    expect(navigator.sendBeacon).toBeCalledTimes(2);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining(param)
      )
    );
  });

  it('triggers a download tracking event when an element with a download attribute is clicked', async () => {
    const params = [
      `${param.eventName}=file_download`,
      `${param.eventParam}.button_text=${testTitle}`,
      `${param.eventParam}.file_name=${encodeURIComponent(testFile)}`,
      `${param.eventParam}.file_extension=${testExtension}`,
      `${param.eventParam}.outbound=false`,
    ];

    root.innerHTML = testAnchor;

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledTimes(1);

    const button = root.querySelector('button');
    const event = new CustomEvent('click');

    Object.defineProperty(event, 'target', { value: button });

    document.dispatchEvent(event);

    expect(navigator.sendBeacon).toBeCalledTimes(2);

    params.forEach((param) =>
      expect(navigator.sendBeacon).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining(param)
      )
    );
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
});
