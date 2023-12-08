/**
 * Cogni: A utility for managing and computing interdependent values within a tree.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen <claus.nuoskanen@gmail.com>
 * @license MIT
 */

type ResultObject<T> = { [K in keyof T]: T[K] };
type DefaultRecord = Record<string, unknown>;

/**
 * Represents the parameters that can be passed to compute functions.
 *
 * The parent property within Params can be used to access previously computed values, thus ensuring
 * consistent and efficient calculations when iterating with different parameters.
 *
 * @template TParam - The parameters that can be passed to the compute function.
 * @template TResult - The expected result type of the compute function.
 */
type ParamsWithParents<
  TParam extends DefaultRecord,
  TResult = DefaultRecord
> = TParam & {
  parent: ResultObject<TResult>;
};

/**
 * The type for compute functions used within Cogni.
 *
 * Compute functions take in parameters and return a computed value. They may also depend on other computed
 * values, which can be accessed using the 'value' property of the parameters.
 *
 * @template TParam - The parameters that can be passed to the compute function.
 * @template ReturnType - The expected return type of the compute function.
 */
interface ComputeFunction<
  TParam extends DefaultRecord = DefaultRecord,
  TResult extends DefaultRecord = DefaultRecord,
  ReturnType = unknown
> {
  (param: ParamsWithParents<TParam, TResult>): ReturnType;
}

/**
 * Cogni class: A structured way to manage and compute interdependent values within a tree hierarchy.
 *
 * @template TParam - The type of parameters that can be used throughout the tree computations.
 * @template TResult - The type of results that can be expected from the tree computations.
 */
class Cogni<
  TParam extends Record<string, any> = DefaultRecord,
  TResult extends Record<string, any> = DefaultRecord
> {
  /**
   * A map of compute functions, keyed by the name of the computed value.
   */
  private fnMap: Map<keyof TResult, ComputeFunction<TParam, TResult, TResult[keyof TResult]>> = new Map();

  /**
   * Defines a computation function for a specific key.
   *
   * @param key - The unique key for which the compute function is defined.
   * @param fn - The compute function to be associated with the given key.
   * @param dependencies - Optional list of keys that the compute function depends upon.
   * @throws {Error} If the key is already defined.
   * @throws {Error} If a dependency key has not been defined prior to the current computation function.
   * @returns The current Cogni instance, allowing chaining of method calls.
   */
  define<K extends keyof TResult>(
    key: K,
    fn: ComputeFunction<ParamsWithParents<TParam, TResult>, TResult, TResult[K]>,
    dependencies?: Array<keyof TResult>
  ): Cogni<TParam, TResult> {
    if (this.fnMap.has(key))
      throw new Error(`"${key as string}" is already defined!`);

    dependencies?.forEach((dependency) => {
      if (!this.fnMap.has(dependency))
        throw new Error(`Dependency "${dependency as string}" has not been defined yet!`);
    });

    this.fnMap.set(key, dependencies ? this.wrapWithDependencies(fn, dependencies) : fn);
    return this;
  }

  /**
   * Retrieves the computed value for a specific key, given a set of parameters.
   *
   * @param key - The key for which the computed value is required.
   * @param param - The parameters used to compute the value.
   * @returns The computed value for the given key.
   * @throws {Error} If the key is not defined.
   */
  get<K extends keyof TResult>(key: K, param: ParamsWithParents<TParam, TResult> | TParam): TResult[K] {
    const fn = this.fnMap.get(key);
    if (!fn)
      throw new Error(`ComputeFunction "${key as string}" is not defined!`);

    param.parent = param.parent ?? {} as TResult;
    if (param.parent[key]) return param.parent[key];

    param.parent[key] = fn(param as ParamsWithParents<TParam, TResult>);
    return param.parent[key];
  }

  /**
   * Wraps a compute function ensuring its dependencies are computed first.
   *
   * @private
   * @param fn - The compute function to be wrapped.
   * @param dependencies - List of keys that the compute function depends upon.
   * @returns A new compute function that first computes the values of its dependencies.
   */
  private wrapWithDependencies<ReturnType>(
    fn: ComputeFunction<TParam, TResult, ReturnType>,
    dependencies: Array<keyof TResult>
  ): ComputeFunction<TParam, TResult, ReturnType> {
    return ((param: ParamsWithParents<TParam, TResult>): ReturnType =>
      fn({
        ...param,
        parent: this.getParentValues(dependencies, param)
      })
    );
  }

  /**
   * Computes and retrieves the values for the specified dependencies using the provided parameters.
   *
   * @private
   * @param dependencies - An array of keys representing the dependencies for which values need to be computed.
   * @param param - The parameters used to compute the values of the dependencies.
   * @returns An object containing the computed values for the specified dependencies.
   */
  private getParentValues(
    dependencies: Array<keyof TResult>,
    param: ParamsWithParents<TParam, TResult>
  ): ResultObject<TResult> {
    return dependencies.reduce((acc: { [key in keyof TResult]: TResult[key] }, name) => {
      acc[name] = this.get(name as keyof TResult, param);
      return acc;
    }, {} as TResult);
  }
}

export = Cogni;
