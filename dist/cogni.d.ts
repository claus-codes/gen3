/**
 * Cogni: A TypeScript library designed for managing computed values and their dependencies.
 * It provides a flexible way to handle dynamic computations and caching mechanisms,
 * making it ideal for applications with complex data relationships.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen
 */
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
 * Cogni class: Manages the computation of values and their dependencies.
 * Allows for dynamic parameterization and structured output in tree-like computation models.
 * Ideal for applications that need to compute values based on interdependent variables.
 *
 * @template TParam - Type of parameters for tree computations.
 * @template TResult - Type of results produced by tree computations.
 */
declare class Cogni<TParam extends Record<string, any> = DefaultRecord, TResult extends Record<string, any> = DefaultRecord> implements CogniInterface<TParam, TResult> {
    /**
     * A map storing compute functions, each keyed by a unique identifier representing the computed value's name.
     * Enables efficient retrieval and management of compute functions.
     */
    private fnMap;
    /**
     * Registers a compute function under a unique key, ensuring no duplication and verifying dependencies.
     * Ideal for constructing a computation graph where each node represents a computable value.
     *
     * @param key - Unique identifier for the compute function.
     * @param fn - Compute function for calculating values.
     * @param dependencies - Keys of dependent computations.
     * @throws {Error} If the key is already defined or dependencies are undefined.
     * @returns The Cogni instance for method chaining.
     */
    define<K extends keyof TResult>(key: K, fn: ComputeFunction<ParamsWithParents<TParam, TResult>, TResult, TResult[K]>, dependencies?: Array<keyof TResult>): Cogni<TParam, TResult>;
    /**
     * Retrieves the computed value for a given key, computing it if necessary.
     * Essential for accessing results in the computation graph.
     *
     * @param key - Identifier for the computed value.
     * @param param - Parameters for the computation.
     * @returns Computed value for the key.
     * @throws {Error} If the key is not defined.
     */
    get<K extends keyof TResult>(key: K, param: ParamsWithParents<TParam, TResult> | TParam): TResult[K];
    /**
     * Wraps a compute function to resolve dependencies first.
     * Ensures correct computation order by pre-computing dependencies.
     *
     * @private
     * @param fn - Original compute function.
     * @param dependencies - Keys of required dependencies.
     * @returns Compute function with dependencies resolved first.
     */
    private wrapWithDependencies;
    /**
     * Accumulates computed values for dependencies.
     * Used internally for preparing inputs for compute functions.
     *
     * @private
     * @param dependencies - Keys for required dependencies.
     * @param param - Parameters for computing dependencies.
     * @returns Object with dependency keys mapped to their computed values.
     */
    private getParentValues;
}
export default Cogni;
