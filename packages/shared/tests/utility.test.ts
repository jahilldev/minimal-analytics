import { getRandomId, getHash } from '../src/utility';

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
      const result = getRandomId();

      expect(result).not.toEqual(getRandomId());
      expect(result).not.toEqual(getRandomId());
      expect(result).not.toEqual(getRandomId());
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
      const iterations = new Array(5);

      const result = getHash(hashSeed);

      expect(result).not.toEqual(hashSeed);

      iterations.forEach(() => {
        expect(result).toEqual(getHash(hashSeed));
      });
    });

    it('generates a hash of correct length', () => {
      const lengths = [8, 16, 32, 64];

      lengths.forEach((length) => {
        expect(getHash(hashSeed, length).length).toEqual(length);
      });
    });
  });
});
