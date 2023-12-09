"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Cogni: A library for managing computed values and their dependencies.
 *
 * @copyright 2023 Claus Nuoskanen
 * @author Claus Nuoskanen <claus.nuoskanen@gmail.com>
*/
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const types_1 = require("./types");
/**
 * CogniStorageJSON: Provides a file-based caching mechanism by storing computed values as JSON files.
 * Ideal for scenarios where persistent and structured storage of cache data is required.
 * This class handles file operations including creation, reading, writing, and deletion,
 * offering a reliable and easy-to-use file-based caching solution.
 *
 * @template TParam - Parameter types for computation functions, extending a key-value record.
 * @template TResult - Result types from computation functions, also extending a key-value record.
 * @extends CogniStoreInteraface<TParam, TResult>
 *
 * @property cogni - Instance of Cogni for computation management.
 * @property filePath - Directory path for storing JSON cache files.
 */
class CogniStorageJSON extends types_1.CogniStoreInteraface {
    cogni;
    filePath;
    /**
     * Initializes a new instance of CogniStorageJSON.
     * Sets up the file path for storage and creates the directory if it doesn't exist.
     *
     * @param cogni - Cogni instance for computation.
     * @param filePath - Path where JSON files will be stored.
     * @param createDir - Flag to create directory if it doesn't exist (default: true).
     */
    constructor(cogni, filePath, createDir = true) {
        super(cogni);
        this.cogni = cogni;
        this.filePath = filePath;
        this.filePath = path_1.default.resolve(filePath);
        if (createDir && !fs_1.default.existsSync(this.filePath)) {
            fs_1.default.mkdirSync(this.filePath, { recursive: true });
        }
    }
    /**
     * Checks if a cached value exists for a given key using file existence.
     *
     * @param key - Cache key to check.
     * @returns A promise that indicates if the cache key exists.
     */
    async has(key) {
        try {
            await fs_1.default.promises.access(this.makeFilePath(key), fs_1.default.constants.F_OK);
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    /**
     * Stores a computed value under a given key in JSON format.
     * Serializes the value and writes it to a file.
     *
     * @param key - Key under which to store the value.
     * @param value - Computed value to be stored.
     * @returns A promise indicating successful storage.
     */
    async set(key, value) {
        try {
            const fileKey = this.makeFilePath(key);
            await fs_1.default.promises.writeFile(fileKey, JSON.stringify(value, null, 2));
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    /**
     * Retrieves a stored value for a specific key.
     * Reads the corresponding JSON file and parses its content.
     *
     * @param key - Key for which to retrieve the value.
     * @returns A promise resolving to the stored value.
     */
    async get(key) {
        try {
            const fileKey = this.makeFilePath(key);
            const fileContent = await fs_1.default.promises.readFile(fileKey, 'utf-8');
            return JSON.parse(fileContent);
        }
        catch (e) {
            console.error(e);
            throw null;
        }
    }
    /**
     * Removes a stored value associated with a given key.
     * Deletes the corresponding JSON file from the storage.
     *
     * @param key - Key whose associated value is to be removed.
     * @returns A promise indicating successful removal.
     */
    async remove(key) {
        try {
            await fs_1.default.promises.unlink(this.makeFilePath(key));
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    /**
     * Constructs a complete file path for a specific cache key.
     * Combines the base file path with the cache key to create a unique file path.
     *
     * @private
     * @param key - Cache key for file path generation.
     * @returns The complete file path for the cache key.
     */
    makeFilePath(key) {
        return path_1.default.join(this.filePath, `${key}.json`);
    }
    /**
     * Clears all values stored in the cache.
     *
     * @throws {Error} Due to lack of implemenetation.
     * @returns {Promise<boolean>} True after the cache is cleared.
     */
    async clear() {
        throw new Error('Not implemented');
    }
}
exports.default = CogniStorageJSON;
