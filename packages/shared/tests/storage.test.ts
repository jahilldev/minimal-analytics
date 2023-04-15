import { isStorageClassSupported } from '../dist';
import { safeStorageFactory, MemoryStorage, hasStorage } from '../src/storage';

/* -----------------------------------
 *
 * Tests
 *
 * -------------------------------- */

describe('storage', () => {
   beforeEach(() => {
   });

   describe('safeStorageFactory', () => {
      it('uses sessionStorage when available', () => {
         const safeSessionStorage = safeStorageFactory('sessionStorage', MemoryStorage);
         expect(safeSessionStorage).toEqual(sessionStorage);
      });

      it('uses localStorage when available', () => {
         const safeLocalStorage = safeStorageFactory('localStorage', MemoryStorage);
         expect(safeLocalStorage).toEqual(localStorage);
      });

      describe('when localStorage is not available', () => {
         let storageSpy;
         beforeEach(() => {
            storageSpy = jest.spyOn(window, "localStorage", "get");
            storageSpy.mockImplementation(() => undefined);
         });

         afterEach(() => {
            storageSpy.mockRestore();
         });

         it('uses provided storage', () => {
            const safeLocalStorage = safeStorageFactory('localStorage', MemoryStorage);
            expect(safeLocalStorage).toBeInstanceOf(MemoryStorage);
         });
      });
   });

   describe('MemoryStorage', () => {
      beforeEach(() => {
         localStorage.clear();
      });

      it('stores KVs like localStorage', () => {
         const memoryStorage = new MemoryStorage();

         memoryStorage.setItem('foo', 'bar');
         localStorage.setItem('foo', 'bar');

         expect(localStorage.getItem('foo'))
            .toEqual(memoryStorage.getItem('foo'));
         expect(localStorage.length)
            .toEqual(memoryStorage.length);

         memoryStorage.removeItem('foo');
         localStorage.removeItem('foo');

         expect(localStorage.getItem('foo'))
            .toEqual(memoryStorage.getItem('foo'));
         expect(localStorage.length)
            .toEqual(memoryStorage.length);
         expect(localStorage.key(0))
            .toEqual(memoryStorage.key(0));
      });
   });

   describe('hasStorage', () => {
      it('if localStorage is available it returns true', () => {
         expect(hasStorage('localStorage')).toBe(true);
      });

      describe('when localStorage is not available', () => {
         let storageSpy;
         beforeEach(() => {
            storageSpy = jest.spyOn(window, "localStorage", "get");
            storageSpy.mockImplementation(() => undefined);
         });

         afterEach(() => {
            storageSpy.mockRestore();
         });

         it('it returns false', () => {
            expect(hasStorage('localStorage')).toBe(false);
         });
      });
   });

   describe('isStorageClassSupported', () => {
      it('if localStorage is available it returns true', () => {
         expect(isStorageClassSupported(localStorage)).toBe(true);
      });

      describe('when localStorage throws an error', () => {
         let getSpy;
         beforeEach(() => {
            getSpy = jest.spyOn(Storage.prototype, 'getItem');
            getSpy.mockImplementation(() => {
               throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
            });
         });

         afterEach(() => {
            getSpy.mockRestore();
         });

         it('it returns false', () => {
            expect(isStorageClassSupported(localStorage)).toBe(false);
         });
      });
   });
});
