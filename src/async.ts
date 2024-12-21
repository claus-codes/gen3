/**
 * FimbulAsync - Asynchronous computation manager for dependency graphs
 */
import type { Dependencies, ResultObject } from "./index";

/** Maps object properties to their Promise-wrapped values */
export type AsyncResultObject<T> = { [K in keyof T]: Promise<T[K]> };

/**
 * Asynchronous computation node interface
 * @template P - Input parameter type
 * @template R - Result object type
 * @template ReturnType - Specific return type
 */
export type AsyncComputationNode<
  P = Record<string, unknown>,
  R = Record<string, unknown>,
  ReturnType = R[keyof R],
> = (
  param: P,
  dependencies: ResultObject<R>,
) => Promise<ReturnType> | ReturnType;

/** Internal type for Promise-normalized computation nodes */
type ResolvedComputationNode<
  P = Record<string, unknown>,
  R = Record<string, unknown>,
  ReturnType = R[keyof R],
> = (param: P, dependencies: AsyncResultObject<R>) => Promise<ReturnType>;

/**
 * Async computation manager
 * @template P - Input parameter type
 * @template R - Result object type
 */
export type FimbulAsync<
  P = Record<string, unknown>,
  R = Record<string, unknown>,
> = {
  /**
   * Defines an async computation node
   * @param key - Unique identifier
   * @param fn - Computation function that can return a value or Promise
   * @param dependencyKeys - Optional dependency node keys
   * @throws If key exists or dependencies are missing
   */
  define: <K extends keyof R>(
    key: K,
    fn: AsyncComputationNode<P, R, R[K]>,
    dependencies?: Dependencies<R>,
  ) => void;

  /**
   * Gets a computed value asynchronously
   * @param key - Node identifier to compute
   * @param param - Input parameters
   * @param results - Optional cached results
   * @returns Promise of the computed value
   */
  get: <K extends keyof R>(
    key: K,
    param: P,
    results?: ResultObject<R>,
  ) => Promise<R[K]>;

  /**
   * Gets multiple computed values asynchronously
   * @param keys - Node identifiers to compute
   * @param param - Input parameters
   * @param results - Optional cached results
   * @returns Promise of computed values
   */
  getMany: (
    keys: Dependencies<R>,
    param: P,
    results?: ResultObject<R>,
  ) => Promise<ResultObject<R>>;

  /**
   * Checks if a computation node exists
   * @param key - Node identifier
   * @return True if node exists
   */
  has: (key: keyof R) => boolean;
};

function FimbulAsync<
  P = Record<string, unknown>,
  R = Record<string, unknown>,
>(): FimbulAsync<P, R> {
  const functions: Map<
    keyof R,
    ResolvedComputationNode<P, R, R[keyof R]>
  > = new Map();

  function define<K extends keyof R>(
    key: K,
    fn: AsyncComputationNode<P, R, R[K]>,
    dependencies?: Dependencies<R>,
  ) {
    if (functions.has(key)) {
      throw new Error(`Key "${key as string}" already exists!`);
    }

    if (dependencies) {
      for (const dependencyKey of dependencies) {
        if (!functions.has(dependencyKey))
          throw new Error(`Key "${dependencyKey as string}" not found!`);
      }
    }

    functions.set(key, provideDependencies(fn, dependencies ?? []));
  }

  async function get<K extends keyof R>(
    key: K,
    param: P,
    results: ResultObject<R> = {} as ResultObject<R>,
  ): Promise<ResultObject<R>[K]> {
    if (results[key]) {
      return results[key];
    }

    return getInternal(key, param, resultsToPromises(results));
  }

  async function getInternal<K extends keyof R>(
    key: K,
    param: P,
    results: AsyncResultObject<R> = {} as AsyncResultObject<R>,
  ): Promise<R[K]> {
    const result = results[key];
    if (result !== undefined) {
      return await result;
    }

    const fn = functions.get(key);
    if (!fn) {
      throw new Error(`Key "${key as string}" not found!`);
    }

    results[key] = fn(param, results) as Promise<R[K]>;
    return await results[key];
  }

  async function getMany(
    keys: Dependencies<R>,
    param: P,
    results: ResultObject<R> = {} as ResultObject<R>,
  ): Promise<ResultObject<R>> {
    return resolveDependencies(keys, param, resultsToPromises(results));
  }

  function has(key: keyof R) {
    return functions.has(key);
  }

  function provideDependencies<ReturnType>(
    fn: AsyncComputationNode<P, R, ReturnType>,
    dependencies: Dependencies<R>,
  ): ResolvedComputationNode<P, R, ReturnType> {
    return async (
      param: P,
      results: AsyncResultObject<R>,
    ): Promise<ReturnType> => {
      const resolvedDependencies = await resolveDependencies(
        dependencies,
        param,
        results,
      );
      return await fn(param, resolvedDependencies);
    };
  }

  function resultsToPromises<R>(
    results: ResultObject<R>,
  ): AsyncResultObject<R> {
    return Object.fromEntries(
      Object.entries(results).map(([key, value]) => [
        key,
        Promise.resolve(value),
      ]),
    ) as AsyncResultObject<R>;
  }

  async function resolveDependencies(
    keys: Dependencies<R>,
    param: P,
    results: AsyncResultObject<R> = {} as AsyncResultObject<R>,
  ): Promise<ResultObject<R>> {
    const asyncResults = keys.map(async (key) => {
      if (!results[key]) {
        results[key] = getInternal(key, param, results).catch((error) => {
          throw new Error(
            `Failed to resolve dependencies for key "${
              key as string
            }": ${error}`,
          );
        });
      }
      return [key, await results[key]] as const;
    });
    const resolvedResults = await Promise.all(asyncResults);
    return Object.fromEntries(resolvedResults) as ResultObject<R>;
  }

  return {
    define,
    get,
    getMany,
    has,
  };
}

export default FimbulAsync;
