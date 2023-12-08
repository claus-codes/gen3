/**
 * Cogni: A TypeScript library designed for managing computed values and their dependencies.
 * It provides a flexible way to handle dynamic computations and caching mechanisms,
 * making it ideal for applications with complex data relationships.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen
 */
import type { CogniInterface, ComputeFunction, DefaultRecord, ParamsWithParents } from './types';
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
