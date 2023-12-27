# cogni: Manage Computed Values and Their Dependencies

`cogni` is a TypeScript utility for efficient management of computed values in dependency trees, ideal for scenarios like game development and dynamic content generation. It minimizes redundant computations, ensuring compute functions are called as needed.

## Installation

Ensure Node.js, and optionally TypeScript, are set up before installing `cogni`. Install using npm or yarn:

```sh
npm install cogni
# or
yarn add cogni
```

## Examples

### Example 1: Hello World

This example shows how to define and use compute functions with `cogni`, using [`define`](#api-reference) for creating computation nodes and [`get`](#api-reference) for retrieving results.

```typescript
import cogni from 'cogni';

// Define 'Params' type to specify the input parameters for your compute functions.
// In this example, our compute functions will expect two parameters: 'greeting' and 'recipient'.
type Params = {
  readonly greeting: string;
  readonly recipient: string;
};

// Define 'Results' type to specify the structure of the output from your compute functions.
// Here, we only have one computed value, 'output', which will be a string.
type Results = {
  output: string;
};

// Initialize a new computation tree with the specified 'Params' and 'Results' types.
// This sets up the structure for your computation graph, allowing cogni to manage dependencies and computations effectively.
const { define, get } = cogni<Params, Results>();

// Define a computation node in the tree.
// Here, 'output' is a computed value that concatenates the 'greeting' and 'recipient' parameters.
define('output', ({ greeting, recipient }) => `${greeting} ${recipient}!`);

// Retrieve the computed value 'output' from the tree by providing the necessary parameters.
// 'get' executes the computation and returns the result based on the input parameters.
const output = get('output', {
  greeting: 'Hello',
  recipient: 'World',
});

console.log(output); // Hello World!
```

### Example 2: Inheritance

This example illustrates how computed values can be derived from other computations, demonstrating `cogni`'s handling of hierarchical data dependencies.

```typescript
// Define input parameters for the computation tree.
// In this example, we have three numerical parameters.
type Params = {
  readonly param1: number;
  readonly param2: number;
  readonly param3: number;
};

// Define the structure for the computed results.
// This includes values computed at different levels of the tree.
type Results = {
  parentValue: number;
  child1: number;
  child2: number;
  root: number;
};

const { define, get } = cogni<Params, Results>();

// Define a parent node in the computation tree.
// 'parentValue' is computed using 'param1' and 'param2'.
define(
  'parentValue',
  ({ param1, param2 }) => param1 * param2,
)

// 'child1' is a child node that derives its value from 'parentValue', illustrating how nodes can inherit and transform data from parent nodes.
define(
  'child1',
  ({ param1 }, { parentValue }) => parentValue * 2 - param1,
  ['parentValue'],
)

// Another child node dependent on 'parentValue'.
// 'child2' computes a value based on 'parentValue' and 'param2'.
define(
  'child2',
  ({ param2 }, { parentValue }) => parentValue / 2 + param2,
  ['parentValue'],
)

// Define the root node of the tree, depending on both child nodes.
// 'root' computes its value based on 'child1', 'child2', and 'param3'.
define(
  'root',
  ({ param3 }, { child1, child2 }) => child1 * child2 + param3,
  ['child1', 'child2'],
);

// Retrieve the computed value at the root of the tree.
const value = get('root', {
  param1: 4,
  param2: 2,
  param3: -30,
});

console.log(`The meaning of life, the universe, and everything is ${value}`); // 42
```

### Example 3: World Generator

The World Generator example showcases cogni's prowess in procedural content generation. Here, we create a dynamic map where each compute function plays a role in shaping the landscape, demonstrated through our step-by-step visual renderings.

This example demonstrates the use of [`getMany`](#api-reference) for retrieving multiple computed values simultaneously, as opposed to using [`get`](#api-reference) for individual values. It showcases `cogni` in a scenario of procedural content generation, utilizing [`simplex-noise`](https://www.npmjs.com/package/simplex-noise) and multiple computation functions to create a world generator.

```typescript
import { createNoise2D } from 'simplex-noise';

// Gradient noise function for organic shapes.
const noise2D = createNoise2D();

// Parameters for the world generation, including coordinates (x, y) ranging from 0.0 to 1.0 for scalability.
type WorldGenParams = {
  readonly x: number;
  readonly y: number;
  readonly noise2D: (x: number, y: number) => number;
  readonly noiseScale: number;
};

// Result structure for world generation computations.
type WorldGenResults = {
  continentShape: number;
  heightNoise: number;
  height: number;
  temperature: number;
  precipitation: number;
  biome: string;
};

const { define, getMany } = cogni<WorldGenParams, WorldGenResults>();
```

Now that we've defined our parameters and results, we can start defining the functions that sculpt the world.

```typescript
// Define the continent shape based on x and y coordinates.
// This creates two continents horiontally that span the height of the world.
define('continentShape', ({ x, y }) =>
  Math.abs(Math.cos(x * Math.PI * 2 + Math.PI * 0.5) * Math.sin(y * Math.PI)));
```
![Preview of Continent shapes](./images/world-gen-continent-shape.png "Preview of Continent shapes")

```typescript
// Compute the height noise using the provided noise function and scale.
define('heightNoise',
  ({ x, y, noiseScale, noise2D }) =>
    noise2D(x * noiseScale, y * noiseScale) * 0.5 + 0.5); // Normalize to 0...1
```
![Preview of Height noise](./images/world-gen-height-noise.png "Preview of Height noise")

```typescript
// Calculate the height by combining continent shape and height noise to produce the final height value.
// Notice that it does not use any parameters, only the results from the previous computations.
define('height',
  (params, { continentShape, heightNoise }) =>
    continentShape * heightNoise,
  ['continentShape', 'heightNoise']);
```
![Preview of Height](./images/world-gen-height.png "Preview of Height")

```typescript
// Define temperature, factoring in height and latitude (y-coordinate).
// North is cold, South is hot, and peaks are covered in frost.
define('temperature',
  ({ y }, { height }) =>
    (height > 0.4 ? y - (height - 0.4) * 2 : y),
  ['height']);
```
![Preview of Temperature](./images/world-gen-temperature.png "Preview of Temperature")

```typescript
// Determine precipitation based on temperature.
// Hotter areas have less rainfall.
define('precipitation',
  (params, { temperature }) =>
    1 - temperature,
  ['temperature']);
```
![Preview of Precipitation map](./images/world-gen-precipitation.png "Preview of Precipitation map")

```typescript
// Determines the 'biome' based on 'height', 'temperature', and 'precipitation', influenced by the 'x' and 'y' coordinates from the parent nodes.
define('biome',
  (params, { height, temperature, precipitation }) => {
    if (height < 0.2023) return 'ocean';
    if (temperature >= 0.666) return 'desert';
    if (temperature > 0.42 && precipitation > 0.42) return 'rainforest';
    if (temperature > 0.3 && precipitation > 0.3) return 'forest';
    if (temperature <= 0.21) return 'tundra';
    return 'meadows';
  },
  ['height', 'temperature', 'precipitation']);
```
![Preview of Biome map](./images/world-gen-biome.png "Preview of Biome map")

```typescript
// Retrieve sample values within the 0.0 to 1.0 range for a random location.
const sample = getMany(
  ['height', 'biome', 'precipitation', 'temperature'],
  {
    x: Math.random(),
    y: Math.random(),
    noiseScale: 8,
    noise2D
  });

const biomeMessage = sample.biome === 'ocean'
  ? 'I am sailing the ocean.'
  : `I am exploring in the ${sample.biome}.`;

// It's a surprise!
console.log(biomeMessage);
```

## API Reference

Below is an overview of `cogni`'s main functions and methods, providing essential details for utilizing the library.

### Factory Function for creating a `cogni` instance

**Introduction**: The `cogni` library is initialized through its factory function, which sets up the computation graph and returns an instance with the necessary methods.

- `cogni<TParam, TResult>()`:  Initializes the computation graph, returning an instance of `cogni`.

  - `TParam`: Generic type for input parameters. Defaults to `DefaultRecord` when not specified.

    >  We recommend declaring `TParam` properties as `readonly` to ensure immutability of input parameters in `cogni`. This practice prevents unintended modifications, maintaining data integrity and consistent state throughout computations.

  - `TResult`: Generic type defining the types of results. Defaults to `DefaultRecord` when not specified.

  - **Example**:
    ```typescript
    // Define the structure for input parameters.
    type Params = {
      readonly a: number;
      readonly b: number;
    }

    // Define the structure for computation results.
    type Results = {
      multiply: number;
      otherValue: number;
    }

    // Initialize cogni computation graph with defined parameter and result types.
    const { define, get, getMany } = cogni<Params, Results>();
    ```

### Types and Interfaces

  - `DefaultRecord`: Type alias for a generic record object. Used as a fallback type for `TParam` and `TResult`, facilitating generic computations.

  - `ResultObject<TResult>`: Represents a collection of computed results. Each key corresponds to an optional value from `TResult`, allowing for flexibility in handling partial computations.

  - `ComputeFunction<TParam, TResult, ReturnType = TResult[keyof TResult]>(param: TParam, parents: ResultObject<TResult>)`: Interface describing the computation function signature.

    - **Parameteres**
      - `param`: `TParam` - The input parameters.
      - `parents`: `ResultObject<TResult>` - The computed parent values.

    - **Returns**: `TResult[keyof TResult]` - The result of the compute function.

### `cogni` Instance Methods

- `define(key: string, fn: ComputeFunction, parentKeys?: string[])`: Defines a new computation function with a unique key.

  - **Parameters**:
    - `key`: `string` - Unique identifier for the compute function.
    - `fn`: `ComputeFunction` - The compute function itself.
    - `parentKeys`: `string[]` (Optional) - Array of keys representing dependencies.

  - **Throws**: `Error` - if the same key is defined more than once, or if a `parentKey` is not defined. This prevents circular references.

  - **Example**:
    ```typescript
    // Define a 'multiply' computation node.
    // This function multiplies 'a' and 'b', two numbers provided in 'Params'.
    define('multiply', ({ a, b }) => a * b);

    // Define 'otherValue', a dependent computation node.
    // It uses the result of 'multiply' and multiplies it by 42.
    define('otherValue', (params, { multiply }) => multiply * 42, ['multiply']);
    ```

- `get(key: string, param: TParam)`: Retrieves the computed value for a given key.

  - **Parameteres**
    - `key`: `string` - The compute function to invoke.
    - `param`: `TParam` - The input parameters.

  - **Returns**: `TResult[keyof TResult]` - The result of the compute function.

  - **Throws**: `Error` if a key is not defined.

  - **Example**:
    ```typescript
    // Retrieve the result of the 'multiply' computation node.
    const value = get('multiply', { a: 10, b: 2 });
    ```

- `getMany(keys: string[], param: TParam)`: Retrieves multiple computed values.

  - **Parameteres**
    - `keys`: `string[]` - The compute functions to invoke.
    - `param`: `TParam` - The input parameters.

  - **Returns**: `ResultObject<TResult>` - The computed values as an object with keys.

  - **Throws**: `Error` if any key is not defined.

  - **Example**:
    ```typescript
    // Retrieve multiple computed values ('multiply' and 'otherValue').
    const { multiply, otherValue } = getMany(['multiply', 'otherValue'], { a: 10, b: 2 });
    ```

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
