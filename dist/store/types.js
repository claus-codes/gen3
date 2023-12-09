"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CogniStoreInteraface = void 0;
/**
 * CogniStoreInterface: An abstract class that defines the contract for a store
 * managing and caching computed values. It acts as a blueprint for implementing
 * various storage strategies, enabling efficient data handling and retrieval.
 *
 * @template TParam - Generic type for input parameters, extending a key-value record.
 * @template TResult - Generic type for output results, also extending a key-value record.
 */
class CogniStoreInteraface {
    cogni;
    /**
     * Constructs a new instance of CogniStoreInterface.
     *
     * @param {CogniInterface<TParam, TResult>} cogni - An instance of CogniInterface which this store interfaces with.
     */
    constructor(cogni) {
        this.cogni = cogni;
    }
}
exports.CogniStoreInteraface = CogniStoreInteraface;
