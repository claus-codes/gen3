# Cogni Library API Reference

## Overview

The `cogni` library is a TypeScript library designed for efficient management of computed values in dependency graphs, ideal for data processing, reactive programming, and dynamic content generation.

- \*\*Version:\*\*1.1.2

## Modules

### cogni

#### Core Module Description

The core module for managing computation nodes.

#### Factory Function

- **cogni**: Initializes the cogni computation manager.
  ```typescript
  declare function cogni<TParam extends DefaultRecord, TResult extends DefaultRecord>(): cogni<TParam, TResult>;
  ```

#### Instance Methods

- **define**
  ```typescript
  define: <K extends keyof TResult>(key: K, fn: ComputeFunction<TParam, TResult, TResult[K]>, parentKeys?: Array<keyof TResult>) => void;
  ```
- **get**
  ```typescript
  get: <K extends keyof TResult>(key: K, param: TParam, results?: ResultObject<TResult>) => TResult[K];
  ```
- **getMany**
  ```typescript
  getMany: (keys: Array<keyof TResult>, param: TParam, results?: ResultObject<TResult>) => ResultObject<TResult>;
  ```

### cogniMemo

#### Description

Caching layer for the cogni library, enabling efficient memoization of computed values.

#### Function Signatures

- **cogniMemoGet**
  ```typescript
  function cogniMemoGet<TParam extends DefaultRecord, TResult extends DefaultRecord>(...): MemoizedCogniGet<TParam, TResult>;
  ```
- **cogniMemoGetMany**
  ```typescript
  function cogniMemoGetMany<TParam extends DefaultRecord, TResult extends DefaultRecord>(...): MemoizedCogniGetMany<TParam, TResult>;
  ```

### cogniAsync

#### Description

Extension of the cogni library with support for asynchronous computation functions.

#### Factory Function

- **cogniAsync**: Initializes the cogniAsync computation manager.
  ```typescript
  function cogniAsync<TParam extends DefaultRecord, TResult extends DefaultRecord>(): cogniAsync<TParam, TResult>;
  ```

#### Instance Methods

- **define**
  ```typescript
  define: <K extends keyof TResult>(key: K, fn: AsyncComputeFunction<TParam, TResult, TResult[K]>, parentKeys?: Array<keyof TResult>) => void;
  ```
- **get**
  ```typescript
  get: <K extends keyof TResult>(key: K, param: TParam, results?: ResultObject<TResult>) => Promise<TResult[K]>;
  ```
- **getMany**
  ```typescript
  getMany: (keys: Array<keyof TResult>, param: TParam, results?: ResultObject<TResult>) => Promise<ResultObject<TResult>>;
  ```

## Types and Interfaces

### DefaultRecord

```typescript
export type DefaultRecord = Record<string, unknown>;
```

### ResultObject

```typescript
export type ResultObject<T> = {
    [K in keyof T]: T[K];
};
```

### ComputeFunction

```typescript
export interface ComputeFunction<TParam extends DefaultRecord, TResult extends DefaultRecord, ReturnType = TResult[keyof TResult]> {
    (param: TParam, parents: ResultObject<TResult>): ReturnType;
}
```
