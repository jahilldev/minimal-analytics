import { track } from '../src/ga4';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const trackingId = 'GX-XXXXX';
const analyticsEndpoint = 'https://www.google-analytics.com/g/collect';
const analyticsVersion = '2';
const errorTrackingId = 'GA4: Tracking ID is missing or undefined';

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

  beforeEach(() => jest.resetAllMocks());

  it('logs an error message if no tracking ID is provided', () => {
    track();

    expect(errorSpy).toHaveBeenCalledWith(errorTrackingId);
    expect(navigator.sendBeacon).not.toBeCalled();
  });

  it('can be called directly with a tracking ID', () => {
    const params = [`?v=${analyticsVersion}`, `&tid=${trackingId}`].join('');

    track(trackingId);

    expect(navigator.sendBeacon).toBeCalledWith(
      expect.stringContaining(analyticsEndpoint + params)
    );
  });

  it('triggers a scroll tracking event once when 90% of window', async () => {
    track(trackingId);

    document.body.scrollTop = window.innerHeight * 0.95;
    document.dispatchEvent(new Event('scroll'));

    await sleep();

    expect(navigator.sendBeacon).toBeCalledTimes(2);

    document.dispatchEvent(new Event('scroll'));

    await sleep();

    expect(navigator.sendBeacon).toBeCalledTimes(2);
  });
});
