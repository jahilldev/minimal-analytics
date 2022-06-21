import { getClientId, getDocument, getEventParams } from '../src/payloads';

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
const localUrl = 'http://localhost/test';
const remoteUrl = 'https://www.google.com/test';

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

describe('shared -> payload', () => {
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
      const event = [
        [testQuery1, testStringValue],
        [testQuery2, testNumberValue],
      ];

      const result = getEventParams(event);

      expect(result).toEqual(event.map((items) => items.map((item) => item.toString())));
    });
  });
});
