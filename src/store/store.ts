/**
 * Cogni: A library for managing computed values and their dependencies.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen <claus.nuoskanen@gmail.com>
*/

import type {
  CogniInterface,
  DefaultRecord,
} from '../cogni';

/**
 * CogniStore: A class that acts as a centralized manager for caching computation results.
 * It supports various storage strategies, enhancing performance by reducing redundant computations.
 * Utilizes a pluggable storage mechanism to accommodate different caching needs.
 *
 * @template TParam - Type of parameters used in computation functions.
 * @template TResult - Type of results expected from computation functions.
 */
class CogniStore<
  TParam extends Record<string, any> = DefaultRecord,
  TResult extends Record<string, any> = DefaultRecord
> {
  /**
   * Collection of storage instances for caching computed values.
   * These storages can be customized to suit various caching strategies.
   */
  protected storages: CogniStorage<TParam, TResult>[] = [];

  /**
   * Constructs a CogniStore instance, initializing it with a computation context and cache key management.
   * Throws an error if cache keys are not provided, ensuring proper cache key setup.
   *
   * @param cogni - Instance of Cogni for computation purposes.
   * @param cacheKeys - Keys used to generate unique cache identifiers.
   * @param defaultParameters - Default parameters for computations, providing a baseline for all calculations.
   * @throws {Error} If cache keys are not provided.
   */
  constructor(
    protected readonly cogni: CogniInterface<TParam, TResult>,
    protected readonly cacheKeys: (keyof TParam)[] = [],
    protected readonly defaultParameters: Partial<TParam> = {},
  ) {
    if (!cacheKeys.length) {
      throw new Error('Cache keys must be provided')
    }
  }

  /**
   * Retrieves a computed value for a given key, prioritizing cached values.
   * If the value is not in cache, it computes and caches the result.
   * This method optimizes data retrieval by reducing computational overhead.
   *
   * @param value - Key of the value to retrieve.
   * @param params - Parameters for computing the value, if not cached.
   * @returns A promise resolving to the computed or cached value, or null if not found.
   */
  async get<K extends keyof TResult>(value: K, params: Partial<TParam>): Promise<TResult[K] | null> {
    const key = this.generateCacheKey(params as TParam);

    // Read from all the storages
    for (const storage of this.storages) {
      const keyExists = await storage.has(key);
      if (keyExists) return await storage.get(key);
    }

    // No storage found, so as Cogni for the result'
    const computedResult: TResult[K] = await this.cogni.get(value, {
      ...this.defaultParameters,
      ...params,
    } as TParam);

    // Persist in all storages
    for (const storage of this.storages) {
      await storage.set(key, computedResult);
    }

    // Result the result
    return computedResult as TResult[K];
  }

  /**
   * Adds a new storage instance to the CogniStore, enhancing its caching capabilities.
   * This allows for flexibility in choosing and combining different caching strategies.
   *
   * @param storage - The storage instance to integrate into the CogniStore.
   */
  addStorage(storage: CogniStorage<TParam, TResult>) {
    this.storages.push(storage);
  }

  /**
   * Removes a specified storage instance from the CogniStore's caching system.
   * This is useful for dynamically adjusting caching strategies at runtime.
   *
   * @param storage - The storage instance to be removed from the CogniStore.
   */
  removeStorage(storage: CogniStorage<TParam, TResult>) {
    this.storages = this.storages.filter(s => s !== storage);
  }

  /**
   * Generates a unique cache key based on selected parameters.
   * This method is crucial for ensuring that each cache entry is accurately and uniquely identified.
   *
   * @param params - Parameters used to construct the cache key.
   * @returns The constructed cache key.
   */
  generateCacheKey(params: TParam): string {
    const keys = Object
      .keys(params)
      .filter(param => this.cacheKeys.includes(param))
      .sort()
    const keyValuePairs = keys.map(key => `${key}_${params[key]}`).join('-')
    return keyValuePairs
  }
}

/**
 * CogniStoreInterface: An abstract class that defines the contract for a store
 * managing and caching computed values. It acts as a blueprint for implementing
 * various storage strategies, enabling efficient data handling and retrieval.
 *
 * @template TParam - Generic type for input parameters, extending a key-value record.
 * @template TResult - Generic type for output results, also extending a key-value record.
 */
export abstract class CogniStorage<
  TParam extends Record<string, any> = DefaultRecord,
  TResult extends Record<string, any> = DefaultRecord,
> {
  /**
   * Constructs a new instance of CogniStoreInterface.
   *
   * @param {CogniInterface<TParam, TResult>} cogni - An instance of CogniInterface which this store interfaces with.
   */
  constructor(protected cogni: CogniInterface<TParam, TResult>) {}

  /**
   * Abstract method to check if a given key's value exists in the store.
   *
   * @param {K} key - The key to check in the store.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the key exists.
   */
  abstract has(key: string): Promise<boolean>;

  /**
   * Abstract method to set a value for a given key in the store.
   *
   * @param {K} key - The key for which to set the value.
   * @param {TResult[K]} value - The value to set in the store.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the value was successfully set.
   */
  abstract set<K extends keyof TResult>(key: string, value: TResult[K]): Promise<boolean>;

  /**
   * Abstract method to retrieve a value for a given key from the store.
   *
   * @param {K} key - The key whose value is to be retrieved.
   * @returns {Promise<TResult[K] | null>} A promise that resolves to the value associated with the key, or null if not found.
   */
  abstract get<K extends keyof TResult>(key: string): Promise<TResult[K] | null>;

  /**
   * Abstract method to remove a value associated with a given key from the store.
   *
   * @param {string} key - The key whose associated value is to be removed.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the value was successfully removed.
   */
  abstract remove(key: string): Promise<boolean>;

  /**
   * Clears all values stored in the cache.
   *
   * @returns {boolean} True after the cache is cleared.
   */
  abstract clear(): Promise<boolean>;
}

export default CogniStore;
