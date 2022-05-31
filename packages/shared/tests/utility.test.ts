import { getRandomId, getHashId } from '../src/utility';

/* -----------------------------------
 *
 * Variables
 *
 * -------------------------------- */

const hashSeed = `${Math.random()}`;

/* -----------------------------------
 *
 * Shared
 *
 * -------------------------------- */

describe('shared -> utility', () => {
  describe('getRandomId', () => {
    it('generates a unique ID after every call', () => {
      const results = [...Array(10).keys()].map(() => getRandomId());

      results.forEach((result) => {
        expect(result).not.toEqual(getRandomId());
      });
    });

    it('generates an ID of correct length', () => {
      const lengths = [8, 12, 16];

      lengths.forEach((length) => {
        expect(getRandomId(length).length).toEqual(length);
      });
    });

    it('limits character length to 16 digits', () => {
      const lengths = [32, 64, 128];

      lengths.forEach((length) => {
        expect(getRandomId(length).length).toEqual(16);
      });
    });
  });

  describe('getHash', () => {
    it('generates a hash string from an input seed', () => {
      const iterations = [...Array(10).keys()];
      const result = getHashId(hashSeed);

      expect(result).not.toEqual(hashSeed);

      iterations.forEach(() => {
        expect(result).toEqual(getHashId(hashSeed));
      });
    });

    it('generates a hash of correct length', () => {
      const lengths = [8, 16, 32, 64];

      lengths.forEach((length) => {
        expect(getHashId(hashSeed, length).length).toEqual(length);
      });
    });
  });
});
