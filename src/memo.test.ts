import cogni, { ResultObject } from '.';
import cogniAsync from './async';
import { cogniMemoGet, cogniMemoGetMany, KeyValueStorage, KeyValueStorageKey, MemoryStorage } from './memo';

class MockErrorStorage<TKey extends KeyValueStorageKey, TValue> extends MemoryStorage<TKey, TValue> {
  throwError: boolean;

  constructor(throwError: boolean = false) {
    super();
    this.throwError = throwError;
  }

  set(key: TKey, value: TValue): boolean {
    if (this.throwError) {
      throw new Error('Error setting value in storage');
    }
    return super.set(key, value);
  }

  get(key: TKey): TValue | null {
    if (this.throwError) {
      throw new Error('Error retrieving value from storage');
    }
    return super.get(key);
  }
}

describe('cogniMemo', () => {
  describe('cogniMemoGet', () => {
    it('should cache computed values', async () => {
      const { define, get } = cogni<{ a: number }, { double: number }>();
      const storage = new MemoryStorage<string, number>();

      define('double', ({ a }) => a * 2);

      // Create memoized version of 'double'
      const memoized = cogniMemoGet(get, 'double', ['a'], {}, storage);

      // First call, should compute
      await expect(memoized({ a: 2 })).resolves.toBe(4);

      // Second call with same parameters, should use cache
      await expect(memoized({ a: 2 })).resolves.toBe(4);
    });

    it('should handle different parameter sets correctly', async () => {
      const { define, get } = cogni<{ a: number }, { square: number }>();
      const storage = new MemoryStorage<string, number>();

      define('square', ({ a }) => a * a);

      const memoized = cogniMemoGet(get, 'square', ['a'], {}, storage);

      // Compute with first parameter
      await expect(memoized({ a: 3 })).resolves.toBe(9);

      // Compute with different parameter
      await expect(memoized({ a: 4 })).resolves.toBe(16);
    });

    it('should use default parameters when provided', async () => {
      const { define, get } = cogni<{ a: number, b: number }, { multiply: number }>();
      const defaultParams = { b: 5 };
      const storage = new MemoryStorage<string, number>();

      define('multiply', ({ a, b }) => a * b);

      const memoized = cogniMemoGet(get, 'multiply', ['a', 'b'], defaultParams, storage);

      // Use default for 'b'
      await expect(memoized({ a: 2 })).resolves.toBe(10);
    });

    it('should invalidate cache when input parameters change', async () => {
      const { define, get } = cogni<{ a: number }, { triple: number }>();
      const storage = new MemoryStorage<string, number>();

      define('triple', ({ a }) => a * 3);

      const memoized = cogniMemoGet(get, 'triple', ['a'], {}, storage);

      // Initial computation
      await expect(memoized({ a: 3 })).resolves.toBe(9);

      // Change in parameter, cache should be invalidated
      await expect(memoized({ a: 4 })).resolves.toBe(12);
    });

    it('should handle asynchronous computations', async () => {
      const { define, get } = cogniAsync<{ a: number, b: number }, { sum: number, product: number, combined: number }>();
      const storage = new MemoryStorage<string, number>();

      // Define asynchronous computation functions
      define('sum', async ({ a, b }) => a + b);
      define('product', async ({ a, b }) => a * b);
      define('combined', async (params, { sum, product }) => sum + product, ['sum', 'product']);

      const memoized = cogniMemoGet(get, 'combined', ['a'], {}, storage);

      // Perform an asynchronous computation
      await expect(memoized({ a: 2, b: 3 })).resolves.toBe(11); // (2 + 3) + (2 * 3)
    });

    it('should handle concurrent requests correctly', async () => {
      const { define, get } = cogniAsync<{ a: number }, { delayIncrement: number }>();
      const storage = new MemoryStorage<string, number>();

      define('delayIncrement', async ({ a }) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return a + 1;
      });

      const memoized = cogniMemoGet(get, 'delayIncrement', ['a'], {}, storage);

      const promise1 = memoized({ a: 1 });
      const promise2 = memoized({ a: 1 });

      await expect(Promise.all([promise1, promise2])).resolves.toEqual([2, 2]);
    });

    it('should call parent functions only once in a complex dependency tree', async () => {
      const { define, get } = cogni<{ a: number, b: number }, { sum: number, square: number, complexResult: number }>();
      const storage = new MemoryStorage<string, number>();

      const mockSum = jest.fn(({ a, b }) => a + b);
      const mockSquare = jest.fn(({ a }) => a * a);

      define('sum', mockSum);
      define('square', mockSquare);
      define('complexResult', (params, { sum, square }) => sum + square, ['sum', 'square']);

      const memoized = cogniMemoGet(get, 'complexResult', ['a', 'b'], {}, storage);

      // First call, should compute and cache
      await expect(memoized({ a: 2, b: 3 })).resolves.toBe(9); // (2 + 3) + 2*2

      // Second call with same parameters, should use cache
      await expect(memoized({ a: 2, b: 3 })).resolves.toBe(9);

      // Verify that parent functions were called only once
      expect(mockSum).toHaveBeenCalledTimes(1);
      expect(mockSquare).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in computation functions', async () => {
      const { define, get } = cogni<{ a: number }, { inverse: number }>();
      const storage = new MemoryStorage<string, number>();
      const memoized = cogniMemoGet(get, 'inverse', ['a'], {}, storage);

      define('inverse', ({ a }) => {
        if (a === 0) throw new Error('Division by zero');
        return 1 / a;
      });

      // Valid computation
      await expect(memoized({ a: 2 })).resolves.toBe(0.5);

      // Computation that should throw an error
      await expect(memoized({ a: 0 })).rejects.toThrow('Division by zero');
    });

    describe('cogniMemo with Error-Prone Storage', () => {
      it('should handle storage errors gracefully', async () => {
        const { define, get } = cogni<{ a: number }, { square: number }>();
        const storage = new MockErrorStorage<string, number>(true);

        define('square', ({ a }) => a * a);

        const memoized = cogniMemoGet(get, 'square', ['a'], {}, storage);

        // Attempt to compute with storage error
        await expect(memoized({ a: 2 })).rejects.toThrow('Error retrieving value from storage');
      });
    });
  });

  describe('cogniMemoGetMany', () => {
    it('should cache computed values for multiple keys', async () => {
      const { define, getMany } = cogniAsync<{ a: number, b: number }, { sum: number, product: number }>();
      const storage = new MemoryStorage<string, ResultObject<{ sum: number, product: number }>>();

      define('sum', async ({ a, b }) => a + b);
      define('product', async ({ a, b }) => a * b);

      const memoized = cogniMemoGetMany(getMany, ['sum', 'product'], ['a', 'b'], {}, storage);

      // First call, should compute
      await expect(memoized({ a: 2, b: 3 })).resolves.toEqual({ sum: 5, product: 6 });

      // Second call with same parameters, should use cache
      await expect(memoized({ a: 2, b: 3 })).resolves.toEqual({ sum: 5, product: 6 });
    });

    it('should handle different parameter combinations correctly', async () => {
      const { define, getMany } = cogniAsync<{ a: number, b: number }, { sum: number, product: number }>();
      const storage = new MemoryStorage<string, ResultObject<{ sum: number, product: number }>>();

      define('sum', async ({ a, b }) => a + b);
      define('product', async ({ a, b }) => a * b);

      const memoized = cogniMemoGetMany(getMany, ['sum', 'product'], ['a', 'b'], {}, storage);

      // Different combinations of parameters
      await expect(memoized({ a: 1, b: 2 })).resolves.toEqual({ sum: 3, product: 2 });
      await expect(memoized({ a: 3, b: 4 })).resolves.toEqual({ sum: 7, product: 12 });
    });

    it('should call parent functions only once for multiple computations', async () => {
      const { define, getMany } = cogniAsync<{ a: number, b: number }, { sum: number, square: number, complexResult: number }>();
      const storage = new MemoryStorage<string, ResultObject<{ sum: number, square: number, complexResult: number }>>();

      const mockSum = jest.fn(async ({ a, b }) => a + b);
      const mockSquare = jest.fn(async ({ a }) => a * a);

      define('sum', mockSum);
      define('square', mockSquare);
      define('complexResult', async (params, { sum, square }) => sum + square, ['sum', 'square']);

      const memoized = cogniMemoGetMany(getMany, ['sum', 'square', 'complexResult'], ['a', 'b'], {}, storage);

      // First call, should compute and cache
      await expect(memoized({ a: 2, b: 3 })).resolves.toEqual({ sum: 5, square: 4, complexResult: 9 });

      // Second call with same parameters, should use cache
      await expect(memoized({ a: 2, b: 3 })).resolves.toEqual({ sum: 5, square: 4, complexResult: 9 });

      // Verify that parent functions were called only once
      expect(mockSum).toHaveBeenCalledTimes(1);
      expect(mockSquare).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent requests with different parameters correctly', async () => {
      // Define mock functions for computations
      const { define, getMany } = cogniAsync<{ a: number }, { increment: number, decrement: number }>();
      const storage = new MemoryStorage<string, ResultObject<{ increment: number, decrement: number }>>();

      define('increment', async ({ a }) => a + 1);
      define('decrement', async ({ a }) => a - 1);

      const memoized = cogniMemoGetMany(getMany, ['increment', 'decrement'], ['a'], {}, storage);

      // Perform concurrent computations with different parameters
      const promise1 = memoized({ a: 1 }); // Should resolve to { increment: 2, decrement: 0 }
      const promise2 = memoized({ a: 2 }); // Should resolve to { increment: 3, decrement: 1 }

      // Expect the results to be correctly computed for each set of parameters
      await expect(promise1).resolves.toEqual({ increment: 2, decrement: 0 });
      await expect(promise2).resolves.toEqual({ increment: 3, decrement: 1 });
    });

    it('should handle complex data types correctly', async () => {
      // Define a mock function that returns a complex data type
      const { define, getMany } = cogniAsync<{ params: { x: number, y: number }[] }, { complexResult: number[] }>();
      const storage = new MemoryStorage<string, ResultObject<{ complexResult: number[] }>>();

      define('complexResult', async ({ params }) => params.map(p => p.x + p.y));

      const memoized = cogniMemoGetMany(getMany, ['complexResult'], ['params'], {}, storage);

      // Perform a computation with a complex data type as parameter
      const complexParams = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
      await expect(memoized({ params: complexParams })).resolves.toEqual({ complexResult: [3, 7] });
    });

    it('should handle errors in multiple computations correctly', async () => {
      // Define mock functions, one of which throws an error
      const { define, getMany } = cogniAsync<{ a: number }, { safe: number, unsafe: number }>();
      const storage = new MemoryStorage<string, ResultObject<{ safe: number, unsafe: number }>>();

      define('safe', async ({ a }) => a + 1);
      define('unsafe', async ({ a }) => {
        if (a === 0) throw new Error('Unsafe operation');
        return a * 2;
      });

      const memoized = cogniMemoGetMany(getMany, ['safe', 'unsafe'], ['a'], {}, storage);

      // Expect the computation to throw an error for unsafe operation
      await expect(memoized({ a: 0 })).rejects.toThrow('Unsafe operation');

      // Ensure safe operation still works correctly
      await expect(memoized({ a: 1 })).resolves.toEqual({ safe: 2, unsafe: 2 });
    });
  });
});
