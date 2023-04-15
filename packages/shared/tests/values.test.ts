import { EventParams, getClientId, getDocument, getEventParams, getSessionState, getSessionId, sessionKey  } from '../src/values';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testHost = 'localhost';
const testTitle = 'testTitle';
const testKey = 'testKey';
const testClientId = '1234509876';
const testQuery1 = 'testQuery1';
const testQuery2 = 'testQuery2';
const testStringValue = `testValue-${Math.random()}`;
const testNumberValue = Math.random();

/* -----------------------------------
 *
 * Mocks
 *
 * -------------------------------- */

jest.mock('../src/utility', () => ({
  getRandomId: jest.fn(() => testClientId),
}));

/* -----------------------------------
 *
 * Shared
 *
 * -------------------------------- */

describe('shared -> values', () => {
  describe('getDocument', () => {
    document.title = testTitle;

    it('returns the correct properties and values', () => {
      const result = getDocument();

      expect(result).toEqual({
        hostname: testHost,
        title: testTitle,
        location: `http://${testHost}/`,
        pathname: '/',
        referrer: '',
      });
    });

    describe('when document is not available', () => {
      let documentSpy;

      beforeEach(() => {
        documentSpy = jest.spyOn(window, "document", "get");
        documentSpy.mockImplementation(() => undefined);
      });

      afterEach(() => {
        documentSpy.mockClear();
      });

      it('returns when document is not available', () => {

        const result = getDocument();
        expect(result).toEqual({
          hostname: testHost,
          title: undefined,
          location: `http://${testHost}/`,
          pathname: '/',
          referrer: undefined,
        });
      });
    });
  });

  describe('getClientId', () => {
    let getSpy;
    let setSpy;

    beforeEach(() => {
      getSpy = jest.spyOn(Storage.prototype, 'getItem');
      setSpy = jest.spyOn(Storage.prototype, 'setItem');
    });

    afterEach(() => {
      getSpy.mockClear();
      setSpy.mockClear();
    });

    it('generates and defines a clientId in localStorage if not set', () => {
      const result = getClientId(testKey);

      expect(result).toEqual(testClientId);
      expect(getSpy).toBeCalledWith(testKey);
      expect(setSpy).toBeCalledWith(testKey, result);
    });

    it('returns a previously defined clientId if in localStorage', () => {
      getSpy.mockReturnValue(testClientId);

      const result = getClientId(testKey);

      expect(result).toEqual(testClientId);
      expect(getSpy).toBeCalledWith(testKey);
      expect(setSpy).not.toBeCalledWith(testKey, result);
    });

    describe('when localStorage is not available', () => {
      let storageSpy;
      let warnSpy;

      // Required because of memoized local var supportsLocalStorage
      jest.resetModules();
      const getClientIdCopy = (require('../src/values') as typeof import('../src/values')).getClientId;

      beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        storageSpy = jest.spyOn(window, "localStorage", "get");
        storageSpy.mockImplementation(() => undefined);
        getSpy.mockReturnValue(null);
      });


      afterEach(() => {
        storageSpy.mockRestore();
      });

      it('warns via a console statement', () => {
        getClientIdCopy(testKey);

        expect(warnSpy).toHaveBeenCalled();
      });

      it('generates a new clientId', () => {
        getClientIdCopy(testKey);
        getClientIdCopy(testKey);

        expect(getSpy).toHaveBeenCalledTimes(2);
        expect(setSpy).toHaveBeenCalledTimes(2);
        expect(getSpy).toBeCalledWith(testKey);
      });
    });
  });

  describe('getEventParams', () => {
    it('returns a multidimensional array of strings from an input object', () => {
      const event = { [testQuery1]: testStringValue, [testQuery2]: testNumberValue };
      const result = getEventParams(event);

      expect(result).toEqual([
        [testQuery1, testStringValue],
        [testQuery2, `${testNumberValue}`],
      ]);
    });

    it('returns input if already a multidimensional array and casts to string', () => {
      const event: EventParams = [
        [testQuery1, testStringValue],
        [testQuery2, testNumberValue],
      ];

      const result = getEventParams(event);

      expect(result).toEqual(event.map((items) => items.map((item) => item?.toString())));
    });
  });

  describe('getSessionState', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('correctly sets firstVisit, sessionStart, and sessionCount', () => {
      let state = getSessionState(true);

      expect(state.firstVisit).toEqual('1');
      expect(state.sessionStart).toEqual('1');
      expect(state.sessionCount).toEqual('1');

      state = getSessionState(false);
      getSessionId();

      expect(state.firstVisit).toBeUndefined;
      expect(state.sessionStart).toBeUndefined;
      expect(state.sessionCount).toEqual('1');
    });
  });

  describe('getSessionId', () => {
    let getSpy;
    let setSpy;

    beforeEach(() => {
      sessionStorage.clear();
      getSpy = jest.spyOn(Storage.prototype, 'getItem');
      setSpy = jest.spyOn(Storage.prototype, 'setItem');
    });

    afterEach(() => {
      getSpy.mockClear();
      setSpy.mockClear();
    });

    it('returns the same id after multiple calls', () => {
      const id1 = getSessionId();
      const id2 = getSessionId();

      expect(id1).toEqual(testClientId);
      expect(id1).toEqual(id2);

      expect(getSpy).toBeCalledWith(sessionKey);
      expect(setSpy).toBeCalledWith(sessionKey,testClientId );
    });
  });
});
