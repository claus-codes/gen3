# Cogni Library API Reference

## Overview

The `cogni` library is a TypeScript library designed for efficient management of computed values in dependency graphs, ideal for data processing, reactive programming, and dynamic content generation.

- **Version:** 1.1.1

## Modules

### cogni

Core module for managing computation nodes.

### cogniMemo

Caching layer for the cogni library, enabling efficient memoization of computed values.

### cogniAsync

Extension of the cogni library with support for asynchronous computation functions.

## Types and Interfaces

### DefaultRecord

```typescript
export type DefaultRecord = Record<string, unknown>;
```

Generic record object used as a key-value pair structure.

### ResultObject

```typescript
export type ResultObject<T> = {
    [K in keyof T]: T[K];
};
```

Generic object type for computation outputs with a consistent key-value format.

### ComputeFunction

```typescript
export interface ComputeFunction<TParam extends DefaultRecord, TResult extends DefaultRecord, ReturnType = TResult[keyof TResult]> {
    (param: TParam, parents: ResultObject<TResult>): ReturnType;
}
```

Interface for computation functions within cogni's dependency graph.

## Factory Function

### cogni

Initializes the cogni computation manager.

```typescript
declare function cogni<TParam extends DefaultRecord, TResult extends DefaultRecord>(): cogni<TParam, TResult>;
```

#### Parameters

- `TParam`: Generic type for input parameters, defaults to `DefaultRecord`.
- `TResult`: Generic type defining the result types, defaults to `DefaultRecord`.

#### Usage Example

```typescript
const { define, get, getMany } = cogni<Params, Results>();
```

## Instance Methods

### define

Defines a new computation function with a unique key.

```typescript
define: <K extends keyof TResult>(key: K, fn: ComputeFunction<TParam, TResult, TResult[K]>, parentKeys?: Array<keyof TResult>) => void;
```

#### Parameters

- `key`: Unique identifier for the compute function.
- `fn`: Compute function for calculating values.
- `parentKeys`: (Optional) Keys of dependent computations.

#### Throws

- `Error`: If the key is already defined or dependencies are undefined.

### get

Retrieves a computed value for a given key.

```typescript
get: <K extends keyof TResult>(key: K, param: TParam, results?: ResultObject<TResult>) => TResult[K];
```

#### Parameters

- `key`: Identifier for the computed value.
- `param`: Parameters for the computation function.
- `results`: (Optional) Object containing previously computed values.

#### Throws

- `Error`: If the key is not defined.

### getMany

Retrieves multiple computed values for specified keys.

```typescript
getMany: (keys: Array<keyof TResult>, param: TParam, results?: ResultObject<TResult>) => ResultObject<TResult>;
```

#### Parameters

- `keys`: Keys for required dependencies.
- `param`: Parameters for the computation functions.
- `results`: (Optional) Object containing previously computed values.

#### Throws

- `Error`: If any key is not defined.
