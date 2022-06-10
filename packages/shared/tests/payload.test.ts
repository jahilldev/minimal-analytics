import { getEventParams } from '../src/payload';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const testQuery1 = 'testQuery1';
const testQuery2 = 'testQuery2';
const testStringValue = `testValue-${Math.random()}`;
const testNumberValue = Math.random();
const localUrl = 'http://localhost/test';
const remoteUrl = 'https://www.google.com/test';

/* -----------------------------------
 *
 * Shared
 *
 * -------------------------------- */

describe('shared -> payload', () => {
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
