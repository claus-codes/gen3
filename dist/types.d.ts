/**
 * Cogni: A TypeScript library designed for managing computed values and their dependencies.
 * It provides a flexible way to handle dynamic computations and caching mechanisms,
 * making it ideal for applications with complex data relationships.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen
 */
/**
 * DefaultRecord: Represents a basic record type with string keys and unknown type values.
 * Useful as a default type for generic parameters where the specific type is flexible.
 */
export type DefaultRecord = Record<string, unknown>;
/**
 * ResultObject: A utility type for mapping all properties of a given type `T`
 * to their respective types. This is useful in scenarios where you need to transform
 * or mirror types while maintaining the original property types.
 *
 * @template T - The base type from which to create the result object.
 */
export type ResultObject<T> = {
    [K in keyof T]: T[K];
};
/**
 * ParamsWithParents: Enhances parameter types for compute functions by adding a `parent`
 * property. This enables access to precomputed values, optimizing computations by
 * avoiding redundant calculations in iterative processes.
 *
 * @template TParam - The parameters type for the compute function.
 * @template TResult - The expected result type from the compute function.
 */
export type ParamsWithParents<TParam extends DefaultRecord, TResult = DefaultRecord> = TParam & {
    parent: ResultObject<TResult>;
};
/**
 * ComputeFunction: Interface defining the structure of functions used in computational
 * processes. Specifies parameter types and return types, facilitating standardized
 * computations across different modules.
 *
 * @template TParam - The type of input parameters.
 * @template TResult - The type of output results.
 * @template ReturnType - The specific return type of the compute function.
 */
export interface ComputeFunction<TParam extends DefaultRecord = DefaultRecord, TResult extends DefaultRecord = DefaultRecord, ReturnType = unknown> {
    (param: ParamsWithParents<TParam, TResult>): ReturnType;
}
/**
 * CogniInterface: Central interface for the Cogni class, orchestrating computation
 * and dependency management. It defines the structure for managing computed values,
 * crucial for efficient data handling in dynamic and complex systems.
 *
 * @template TParam - Type for input parameters in computations.
 * @template TResult - Type for output results from computations.
 */
export interface CogniInterface<TParam extends Record<string, any> = DefaultRecord, TResult extends Record<string, any> = DefaultRecord> {
    /**
     * Associates a compute function with a unique key, enabling the computation of values based on dependencies.
     * This method allows for defining how specific values are computed and managed within the Cogni system.
     * @param key - The unique key for which the compute function is defined.
     * @param fn - The compute function to be associated with the given key.
     * @param dependencies - Optional list of keys that the compute function depends upon.
     * @returns The current Cogni instance, allowing for method chaining.
     */
    define<K extends keyof TResult>(key: K, fn: ComputeFunction<ParamsWithParents<TParam, TResult>, TResult, TResult[K]>, dependencies?: Array<keyof TResult>): CogniInterface<TParam, TResult>;
    /**
     * Retrieves the computed value for a specific key, given a set of parameters.
     * This method is crucial for accessing the results of computations defined by the `define` method,
     * ensuring the efficient use and retrieval of computed data.
     * @param key - The key for which the computed value is required.
     * @param param - The parameters used to compute the value.
     * @returns The computed value for the given key.
     */
    get<K extends keyof TResult>(key: K, param: ParamsWithParents<TParam, TResult> | TParam): TResult[K];
}
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
