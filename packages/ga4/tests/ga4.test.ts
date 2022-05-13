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
 * Mocks
 *
 * -------------------------------- */

Object.defineProperty(navigator, 'sendBeacon', { value: jest.fn() });

/* -----------------------------------
 *
 * GA4
 *
 * -------------------------------- */

describe('ga4', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  describe('track()', () => {
    it('logs an error message if no tracking ID is provided', () => {
      track();

      expect(errorSpy).toHaveBeenCalledWith(errorTrackingId);
    });

    it('can be called directly with a tracking ID', () => {
      track(trackingId);

      expect(navigator.sendBeacon).toBeCalledWith(
        expect.stringContaining(analyticsEndpoint + `?v=${analyticsVersion}`)
      );
    });
  });
});
