import * as beacon from '../src/beacon';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const analyticsEndpoint = 'https://www.google-analytics.com/g/collect';

/* -----------------------------------
 *
 * Shared
 *
 * -------------------------------- */

const xhrMock: Partial<XMLHttpRequest> = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  response: 'OK'
};

describe('shared -> beacon', () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(window, 'XMLHttpRequest')
      .mockImplementation(() => xhrMock as XMLHttpRequest);
    global.fetch = fetchMock;
    fetchMock.mockImplementation(() => Promise.resolve(''));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('sendBeaconXHR', () => {
    it('makes a POST request using XMLHttpRequest', () => {
      beacon.sendBeaconXHR(analyticsEndpoint);

      expect(xhrMock.open)
        .toBeCalledWith('POST', analyticsEndpoint, expect.anything());
    });

    it('returns true if no error is thrown', () => {
      const response = beacon.sendBeaconXHR(analyticsEndpoint);

      expect(response).toBe(true);
    });

    it('returns false if an error is thrown', () => {
      const throwXhrMock: Partial<XMLHttpRequest> = {
        open: jest.fn(),
        send: jest.fn(() => { throw new Error('InvalidStateError'); }),
        setRequestHeader: jest.fn(),
        readyState: 4,
        status: 200,
        response: 'OK'
      };

      jest.spyOn(window, 'XMLHttpRequest')
        .mockImplementation(() => throwXhrMock as XMLHttpRequest);

      expect(() => {
        const response = beacon.sendBeaconXHR(analyticsEndpoint);

        expect(response).toBe(false);
      }).not.toThrow(Error);
    });
  });

  describe('sendBeaconFetch', () => {
    it('makes a POST request using fetch', () => {
      beacon.sendBeaconFetch(analyticsEndpoint);

      expect(fetch)
        .toBeCalledWith(analyticsEndpoint, expect.objectContaining({
          method: 'POST',
        }));
    });

    it('returns true if no error is thrown', () => {
      const response = beacon.sendBeaconFetch(analyticsEndpoint);

      expect(response).toBe(true);
    });

    it('returns false if an error is thrown', () => {
      fetchMock.mockImplementation(() => { throw new TypeError('Invalid header name.'); });

      expect(() => {
        const response = beacon.sendBeaconFetch(analyticsEndpoint);

        expect(response).toBe(false);
      }).not.toThrow(Error);
    });
  });

  describe('sendBeacon', () => {
    const originalSendBeacon = navigator.sendBeacon;
    const sendBeaconMock = jest.fn();
    beforeAll(() => {
        navigator.sendBeacon = sendBeaconMock;
    });

    afterAll(() => {
        navigator.sendBeacon = originalSendBeacon;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses navigator.sendBeacon if available', () => {
      beacon.sendBeacon(analyticsEndpoint);

      expect(navigator.sendBeacon)
        .toBeCalledWith(analyticsEndpoint);
    });

    describe('if navigator is not available', () => {
      const navigatorSpy = jest.spyOn(window, "navigator", "get");
      beforeEach(() => {
        navigatorSpy.mockImplementation(() => undefined);
      });

      afterEach(() => {
        navigatorSpy.mockRestore();
      });

      it('uses XMLHttpRequest', () => {
        beacon.sendBeacon(analyticsEndpoint);

        expect(sendBeaconMock)
          .not.toBeCalled();
        expect(xhrMock.open)
          .toBeCalledWith('POST', analyticsEndpoint, expect.anything());
      });
    });

    it('uses XMLHttpRequest if sendBeacon is not available', () => {
      Object.assign(navigator, {
        sendBeacon: undefined,
      });

      beacon.sendBeacon(analyticsEndpoint);

      expect(xhrMock.open)
        .toBeCalledWith('POST', analyticsEndpoint, expect.anything());
      expect(sendBeaconMock)
        .not.toBeCalled();
    });

    it('uses fetch if XMLHttpRequest is not available', () => {
      Object.assign(navigator, {
        sendBeacon: undefined,
      });

      Object.assign(window, {
        XMLHttpRequest: undefined,
      });

      beacon.sendBeacon(analyticsEndpoint);

      expect(fetch)
        .toBeCalledWith(analyticsEndpoint, expect.objectContaining({
          method: 'POST',
        }));
      expect(sendBeaconMock)
        .not.toBeCalled();
    });
  });
});
