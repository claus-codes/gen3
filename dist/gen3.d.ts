/**
 * Gen3: A utility for managing and computing interdependent values within a tree.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen <claus.nuoskanen@gmail.com>
 * @license MIT
 */
/**
 * Represents the parameters that can be passed to compute functions.
 *
 * The parent property within Params can be used to access previously computed values, thus ensuring
 * consistent and efficient calculations when iterating with different parameters.
 *
 * @template TParam - The parameters that can be passed to the compute function.
 * @template TResult - The expected result type of the compute function.
 */
export type Params<TParam extends Record<string, unknown>, TResult = Record<string, unknown>> = TParam & {
    parent: {
        [K in keyof TResult]: TResult[K];
    };
};
/**
 * The type for compute functions used within Gen3.
 *
 * Compute functions take in parameters and return a computed value. They may also depend on other computed
 * values, which can be accessed using the 'value' property of the parameters.
 *
 * @template TParam - The parameters that can be passed to the compute function.
 * @template ReturnType - The expected return type of the compute function.
 */
export interface ComputeFunction<TParam extends Record<string, unknown> = Record<string, unknown>, TResult extends Record<string, unknown> = Record<string, unknown>, ReturnType = unknown> {
    (param: Params<TParam, TResult>): ReturnType;
}
/**
 * Gen3 class: A structured way to manage and compute interdependent values within a tree hierarchy.
 *
 * By recognizing and respecting the hierarchical relationships between computations, Gen3 ensures that
 * parent values are calculated before their dependent child values. This characteristic is beneficial for
 * managing complex computations in which the hierarchical order of execution is crucial.
 *
 * @template TParam - The type of parameters that can be used throughout the tree computations.
 * @template TResult - The type of results that can be expected from the tree computations.
 */
export default class Gen3<TParam extends Record<string, any> = Record<string, unknown>, TResult extends Record<string, any> = Record<string, unknown>> {
    private fnMap;
    /**
     * Defines a computation function for a specific key.
     *
     * @param key - The unique key for which the compute function is defined.
     * @param fn - The compute function to be associated with the given key.
     * @param dependencies - Optional list of keys that the compute function depends upon.
     * @throws {Error} If the key is already defined.
     * @throws {Error} If a dependency key has not been defined prior to the current computation function.
     * @returns The current Gen3 instance, allowing chaining of method calls.
     */
    define<K extends keyof TResult>(key: K, fn: ComputeFunction<Params<TParam, TResult>, TResult, TResult[K]>, dependencies?: Array<keyof TResult>): Gen3<TParam, TResult>;
    /**
     * Retrieves the computed value for a specific key, given a set of parameters.
     *
     * @param key - The key for which the computed value is required.
     * @param param - The parameters used to compute the value.
     * @returns The computed value for the given key.
     * @throws {Error} If the key is not defined.
     */
    get<K extends keyof TResult>(key: K, param: Params<TParam, TResult> | TParam): TResult[K];
    /**
     * Wraps a compute function ensuring its dependencies are computed first.
     *
     * Given a compute function and its dependencies, this method returns a new function.
     * When invoked, the new function first computes the values for its dependencies
     * and then calls the original function with these values. This ensures that any
     * dependent value is available and up-to-date at the time of computation.
     *
     * @private
     * @param fn - The compute function to be wrapped.
     * @param dependencies - List of keys that the compute function depends upon.
     * @returns A new compute function that first computes the values of its dependencies.
     */
    private wrapWithDependencies;
}
