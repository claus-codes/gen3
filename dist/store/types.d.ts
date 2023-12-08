/**
 * Cogni: A library for managing computed values and their dependencies.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen <claus.nuoskanen@gmail.com>
*/
import { CogniInterface, DefaultRecord } from "../types";
/**
 * CogniStoreInterface: An abstract class that defines the contract for a store
 * managing and caching computed values. It acts as a blueprint for implementing
 * various storage strategies, enabling efficient data handling and retrieval.
 *
 * @template TParam - Generic type for input parameters, extending a key-value record.
 * @template TResult - Generic type for output results, also extending a key-value record.
 */
export declare abstract class CogniStoreInteraface<TParam extends Record<string, any> = DefaultRecord, TResult extends Record<string, any> = DefaultRecord> {
    protected cogni: CogniInterface<TParam, TResult>;
    /**
     * Constructs a new instance of CogniStoreInterface.
     *
     * @param {CogniInterface<TParam, TResult>} cogni - An instance of CogniInterface which this store interfaces with.
     */
    constructor(cogni: CogniInterface<TParam, TResult>);
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
