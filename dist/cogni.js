/**
 * Cogni: A TypeScript library designed for managing computed values and their dependencies.
 * It provides a flexible way to handle dynamic computations and caching mechanisms,
 * making it ideal for applications with complex data relationships.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen
 */
/**
 * Cogni class: Manages the computation of values and their dependencies.
 * Allows for dynamic parameterization and structured output in tree-like computation models.
 * Ideal for applications that need to compute values based on interdependent variables.
 *
 * @template TParam - Type of parameters for tree computations.
 * @template TResult - Type of results produced by tree computations.
 */
class Cogni {
    /**
     * A map storing compute functions, each keyed by a unique identifier representing the computed value's name.
     * Enables efficient retrieval and management of compute functions.
     */
    fnMap = new Map();
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
    define(key, fn, dependencies) {
        if (this.fnMap.has(key)) {
            throw new Error(`"${key}" is already defined!`);
        }
        // Ensure all required dependencies are defined
        dependencies?.forEach((dependency) => {
            if (!this.fnMap.has(dependency))
                throw new Error(`Dependency "${dependency}" has not been defined yet!`);
        });
        this.fnMap.set(key, dependencies ? this.wrapWithDependencies(fn, dependencies) : fn);
        return this;
    }
    /**
     * Retrieves the computed value for a given key, computing it if necessary.
     * Essential for accessing results in the computation graph.
     *
     * @param key - Identifier for the computed value.
     * @param param - Parameters for the computation.
     * @returns Computed value for the key.
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
     * Wraps a compute function to resolve dependencies first.
     * Ensures correct computation order by pre-computing dependencies.
     *
     * @private
     * @param fn - Original compute function.
     * @param dependencies - Keys of required dependencies.
     * @returns Compute function with dependencies resolved first.
     */
    wrapWithDependencies(fn, dependencies) {
        return ((param) => fn({
            ...param,
            parent: this.getParentValues(dependencies, param)
        }));
    }
    /**
     * Accumulates computed values for dependencies.
     * Used internally for preparing inputs for compute functions.
     *
     * @private
     * @param dependencies - Keys for required dependencies.
     * @param param - Parameters for computing dependencies.
     * @returns Object with dependency keys mapped to their computed values.
     */
    getParentValues(dependencies, param) {
        return dependencies.reduce((acc, name) => {
            acc[name] = this.get(name, param);
            return acc;
        }, {});
    }
}
export default Cogni;
