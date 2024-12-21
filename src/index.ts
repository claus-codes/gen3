/**
 * Fimbul - Computation manager for dependency graphs
 */

/** Generic object type for computation outputs */
export type ResultObject<T> = { [K in keyof T]: T[K] };

/** Array containing result object keys */
export type Dependencies<R> = Array<keyof R>;

/**
 * Computation node interface
 * @template P - Input parameter type
 * @template R - Result object type
 * @template ReturnType - Specific return type
 */
export type ComputationNode<
  P = Record<string, unknown>,
  R = Record<string, unknown>,
  ReturnType = R[keyof R],
> = (param: P, dependencies: ResultObject<R>) => ReturnType;

/**
 * Initializes Fimbul computation manager
 * @template P - Input parameter type
 * @template R - Result object type
 */
export type Fimbul<P = Record<string, unknown>, R = Record<string, unknown>> = {
  /**
   * Defines a computation node
   * @param key - Unique identifier
   * @param fn - Computation function
   * @param dependencies - Optional dependency node keys
   * @throws If key exists or dependencies are missing
   */
  define: <K extends keyof R>(
    key: K,
    fn: ComputationNode<P, R, R[K]>,
    dependencies?: Dependencies<R>,
  ) => void;

  /**
   * Checks if a computation node exists
   * @param key - Node identifier
   * @return True if node exists
   */
  has: (key: keyof R) => boolean;

  /**
   * Gets a computed value
   * @param key - Node identifier to compute
   * @param param - Input parameters
   * @param results - Optional cached results
   * @return The computed value
   */
  get: <K extends keyof R>(key: K, param: P, results?: ResultObject<R>) => R[K];

  /**
   * Gets multiple computed values
   * @param keys - Node identifiers to compute
   * @param param - Input parameters
   * @param results - Optional cached results
   * @return The computed values
   */
  getMany: (
    keys: Dependencies<R>,
    param: P,
    results?: ResultObject<R>,
  ) => ResultObject<R>;
};

function Fimbul<
  P = Record<string, unknown>,
  R = Record<string, unknown>,
>(): Fimbul<P, R> {
  const functions: Map<keyof R, ComputationNode<P, R, R[keyof R]>> = new Map();

  function define<K extends keyof R>(
    key: K,
    fn: ComputationNode<P, R, R[K]>,
    dependencies?: Dependencies<R>,
  ) {
    if (functions.has(key)) {
      throw new Error(`Node "${key as string}" already exists!`);
    }

    if (dependencies) {
      for (const depKey of dependencies) {
        if (!functions.has(depKey))
          throw new Error(`Node "${depKey as string}" not found!`);
      }
    }

    functions.set(
      key,
      dependencies ? provideDependencies(fn, dependencies) : fn,
    );
  }

  function has(key: keyof R) {
    return functions.has(key);
  }

  function get<K extends keyof R>(
    key: K,
    param: P,
    results: ResultObject<R> = {} as ResultObject<R>,
  ): ResultObject<R>[K] {
    if (results[key]) {
      return results[key];
    }

    const fn = functions.get(key);
    if (!fn) {
      throw new Error(`Node "${key as string}" not found!`);
    }

    results[key] = fn(param, results) as R[K];
    return results[key];
  }

  function getMany(
    keys: Dependencies<R>,
    param: P,
    results: ResultObject<R> = {} as ResultObject<R>,
  ): ResultObject<R> {
    return keys.reduce(
      (acc, key) => ((acc[key] = get(key, param, results)), acc),
      results,
    );
  }

  /** Wraps computation node to resolve dependencies */
  function provideDependencies<ReturnType>(
    fn: ComputationNode<P, R, ReturnType>,
    dependencies: Dependencies<R>,
  ): ComputationNode<P, R, ReturnType> {
    return (param: P, results: ResultObject<R>): ReturnType =>
      fn(param, getMany(dependencies, param, results ?? {}));
  }

  return {
    define,
    has,
    get,
    getMany,
  };
}

export default Fimbul;
