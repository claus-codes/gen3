import { DefaultRecord } from '../cogni';
import { CogniStorageInterface } from './store';
/**
 * CogniStorageJSON: Provides a file-based caching mechanism by storing computed values as JSON files.
 * Ideal for scenarios where persistent and structured storage of cache data is required.
 * This class handles file operations including creation, reading, writing, and deletion,
 * offering a reliable and easy-to-use file-based caching solution.
 *
 * @template TParam - Parameter types for computation functions, extending a key-value record.
 * @template TResult - Result types from computation functions, also extending a key-value record.
 *
 * @property cogni - Instance of Cogni for computation management.
 * @property filePath - Directory path for storing JSON cache files.
 */
declare class CogniStorageJSON<TParam extends Record<string, any> = DefaultRecord, TResult extends Record<string, any> = DefaultRecord> implements CogniStorageInterface<TParam, TResult> {
    private filePath;
    /**
     * Initializes a new instance of CogniStorageJSON.
     * Sets up the file path for storage and creates the directory if it doesn't exist.
     *
     * @param filePath - Path where JSON files will be stored.
     * @param createDir - Flag to create directory if it doesn't exist (default: true).
     */
    constructor(filePath: string, createDir?: boolean);
    /**
     * Checks if a cached value exists for a given key using file existence.
     *
     * @param key - Cache key to check.
     * @returns A promise that indicates if the cache key exists.
     */
    has(key: string): Promise<boolean>;
    /**
     * Stores a computed value under a given key in JSON format.
     * Serializes the value and writes it to a file.
     *
     * @param key - Key under which to store the value.
     * @param value - Computed value to be stored.
     * @returns A promise indicating successful storage.
     */
    set(key: string, value: TResult[keyof TResult]): Promise<boolean>;
    /**
     * Retrieves a stored value for a specific key.
     * Reads the corresponding JSON file and parses its content.
     *
     * @param key - Key for which to retrieve the value.
     * @returns A promise resolving to the stored value.
     */
    get<K extends keyof TResult>(key: string): Promise<TResult[K]>;
    /**
     * Removes a stored value associated with a given key.
     * Deletes the corresponding JSON file from the storage.
     *
     * @param key - Key whose associated value is to be removed.
     * @returns A promise indicating successful removal.
     */
    remove(key: string): Promise<boolean>;
    /**
     * Constructs a complete file path for a specific cache key.
     * Combines the base file path with the cache key to create a unique file path.
     *
     * @private
     * @param key - Cache key for file path generation.
     * @returns The complete file path for the cache key.
     */
    private makeFilePath;
    /**
     * Clears all values stored in the cache.
     *
     * @throws {Error} Due to lack of implemenetation.
     * @returns {Promise<boolean>} True after the cache is cleared.
     */
    clear(): Promise<boolean>;
}
export default CogniStorageJSON;
