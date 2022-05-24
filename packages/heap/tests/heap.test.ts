import { track } from '../src/index';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const trackingId = 'GX-XXXXX';

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
 * Heap
 *
 * -------------------------------- */

describe('heap -> track()', () => {
  beforeEach(() => jest.resetAllMocks());

  it('does some temp stuff', () => {
    expect(true).toBe(true);
  });
});
