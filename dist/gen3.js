/**
 * Gen3: A utility for managing and computing interdependent values within a tree.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen <claus.nuoskanen@gmail.com>
 * @license MIT
 */
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
export default class Gen3 {
    constructor() {
        this.fnMap = new Map();
    }
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
    define(key, fn, dependencies) {
        if (this.fnMap.has(key))
            throw new Error(`"${key}" is already defined!`);
        dependencies === null || dependencies === void 0 ? void 0 : dependencies.forEach((dependency) => {
            if (!this.fnMap.has(dependency))
                throw new Error(`Dependency "${dependency}" has not been defined yet!`);
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
    get(key, param) {
        var _a;
        const fn = this.fnMap.get(key);
        if (!fn)
            throw new Error(`ComputeFunction "${key}" is not defined!`);
        param.parent = (_a = param.parent) !== null && _a !== void 0 ? _a : {};
        if (param.parent[key])
            return param.value[key];
        param.parent[key] = fn(param);
        return param.parent[key];
    }
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
    wrapWithDependencies(fn, dependencies) {
        return ((param) => {
            return fn(Object.assign(Object.assign({}, param), { value: dependencies.reduce((acc, name) => {
                    acc[name] = this.get(name, param);
                    return acc;
                }, {}) }));
        });
    }
}
