"use strict";
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
 * @template TParam - The type of parameters that can be used throughout the tree computations.
 * @template TResult - The type of results that can be expected from the tree computations.
 */
class Gen3 {
    fnMap = new Map();
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
        dependencies?.forEach((dependency) => {
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
        const fn = this.fnMap.get(key);
        if (!fn)
            throw new Error(`ComputeFunction "${key}" is not defined!`);
        param.parent = param.parent ?? {};
        if (param.parent[key])
            return param.parent[key];
        param.parent[key] = fn(param);
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
    wrapWithDependencies(fn, dependencies) {
        return ((param) => fn({
            ...param,
            parent: this.getParentValues(dependencies, param)
        }));
    }
    /**
     * Computes and retrieves the values for the specified dependencies using the provided parameters.
     *
     * @private
     * @param dependencies - An array of keys representing the dependencies for which values need to be computed.
     * @param param - The parameters used to compute the values of the dependencies.
     * @returns An object containing the computed values for the specified dependencies.
     */
    getParentValues(dependencies, param) {
        return dependencies.reduce((acc, name) => {
            acc[name] = this.get(name, param);
            return acc;
        }, {});
    }
}
module.exports = Gen3;
