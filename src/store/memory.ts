/**
 * Cogni: A library for managing computed values and their dependencies.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen <claus.nuoskanen@gmail.com>
*/

import { DefaultRecord, CogniInterface } from '../types';
import { CogniStoreInteraface } from './types';

/**
 * @template TParam - The type parameter extends a Record type, representing the types of parameters that can be used
 *                    in computation functions.
 * @template TResult - The result type parameter extends a Record type, indicating the types of results that can be
 *                     expected from computation functions.
 * @extends {CogniStore<TParam, TResult>}
 *
 * @property {Cogni<TParam, TResult>} cogni - An instance of Cogni used for computation.
 * @property {Record<string, TResult[keyof TResult]>} data - The in-memory storage object for caching computed values.
 */
class CogniStorgeMemory<
  TParam extends Record<string, any> = DefaultRecord,
  TResult extends Record<string, any> = DefaultRecord,
> extends CogniStoreInteraface<TParam, TResult> {

  /**
   * Constructs a new CogniStorgeMemory instance.
   *
   * @param {Cogni<TParam, TResult>} cogni - An instance of Cogni used for computation.
   * @param {Record<string, TResult[keyof TResult]>} [data={}] - An optional initial cache object.
   */
  constructor(protected cogni: CogniInterface<TParam, TResult>, private data: Record<string, TResult[keyof TResult]> = {}) {
    super(cogni);
  }

  /**
   * Checks if a given key exists in the cache.
   *
   * @param {string} key - The key to check in the cache.
   * @returns {Promise<boolean>} A promise that resolves to true if the key exists, false otherwise.
   */
  async has(key: string): Promise<boolean> {
    return !!this.data[key];
  }

  /**
   * Stores a value in the cache associated with a given key.
   *
   * @param {string} key - The key under which the value is stored.
   * @param {TResult[keyof TResult]} value - The value to be stored in the cache.
   * @returns {Promise<boolean>} A promise that resolves to true once the value is stored.
   */
  async set(key: string, value: TResult[keyof TResult]): Promise<boolean> {
    this.data[key] = value;
    return true;
  }

  /**
   * Retrieves a value from the cache corresponding to a given key.
   *
   * @param {string} key - The key whose value is to be retrieved.
   * @returns {Promise<TResult[K]>} A promise that resolves to the value associated with the key, if it exists.
   */
  async get<K extends keyof TResult>(key: K): Promise<TResult[K]> {
    return this.data[key as string] as TResult[K];
  }

  /**
   * Removes a value from the cache associated with a given key.
   *
   * @param {string} key - The key whose associated value is to be removed.
   * @returns {Promise<boolean>} A promise that resolves to true once the value is removed.
   */
  async remove(key: string): Promise<boolean> {
    delete this.data[key];
    return true;
  }

  /**
   * Clears all values stored in the cache.
   *
   * @returns {Promise<boolean>} True after the cache is cleared.
   */
  async clear(): Promise<boolean> {
    this.data = {};
    return true;
  }
}

export default CogniStorgeMemory;
