import { track } from '../src/ga4';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const trackingId = 'GX-XXXXX';

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
    it('can be called directly with a tracking ID', () => {
      track(trackingId);

      expect(navigator.sendBeacon).toBeCalled();
    });
  });
});
