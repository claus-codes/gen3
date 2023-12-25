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
  greeting: string;
  recipient: string;
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
  param1: number;
  param2: number;
  param3: number;
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

This example demonstrates the use of [`getMany`](#api-reference) for retrieving multiple computed values simultaneously, as opposed to using [`get`](#api-reference) for individual values. It showcases `cogni` in a scenario of procedural content generation, utilizing [`simplex-noise`](https://www.npmjs.com/package/simplex-noise) and multiple computation functions to create a world generator.

```typescript
import { createNoise2D } from 'simplex-noise';

// Gradient noise function for organic shapes.
const noise2D = createNoise2D();

// Parameters for the world generation, including coordinates (x, y) ranging from 0.0 to 1.0 for scalability.
type WorldGenParams = {
  x: number;
  y: number;
  noise2D: (x: number, y: number) => number;
  noiseScale: number;
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

The `x` and `y` coordinate parameters range between 0...1, so the size of the world is arbitrarily scalable.

I include a visual representation of the computed value after each function.
```typescript
// Define the continent shape based on x and y coordinates.
// This creates two continents horiontally that span the height of the world.
define('continentShape', ({ x, y }) =>
  Math.abs(Math.cos(x * Math.PI * 2 + Math.PI * 0.5) * Math.sin(y * Math.PI)));
```
![Continent shapes](./images/world-gen-continent-shape.png "Continent shapes")

```typescript
// Compute the height noise using the provided noise function and scale.
define('heightNoise',
  ({ x, y, noiseScale, noise2D }) =>
    noise2D(x * noiseScale, y * noiseScale) * 0.5 + 0.5); // Normalize to 0...1
```
![Height noise](./images/world-gen-height-noise.png "Height noise")

```typescript
// Calculate the height by combining continent shape and height noise to produce the final height value.
// Notice that it does not use any parameters, only the results from the previous computations.
define('height',
  (params, { continentShape, heightNoise }) =>
    continentShape * heightNoise,
  ['continentShape', 'heightNoise']);
```
![Height](./images/world-gen-height.png "Height")

```typescript
// Define temperature, factoring in height and latitude (y-coordinate).
// North is cold, South is hot, and peaks are covered in frost.
define('temperature',
  ({ y }, { height }) =>
    (height > 0.4 ? y - (height - 0.4) * 2 : y),
  ['height']);
```
![Temperature](./images/world-gen-temperature.png "Temperature")

```typescript
// Determine precipitation based on temperature.
// Hotter areas have less rainfall.
define('precipitation',
  (params, { temperature }) =>
    1 - temperature,
  ['temperature']);
```
![Precipitation](./images/world-gen-precipitation.png "Precipitation")

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
![Biome](./images/world-gen-biome.png "Biome")

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
- `cogni<TParam, TResult>()`:  Initializes the computation graph, returning an instance of `cogni`.
  - `TParam`: Type for input parameters (default: `DefaultRecord`).
  - `TResult`: Type for output results (default: `DefaultRecord`).

### `cogni` Instance Methods
- `define(key, fn, parentKeys)`: Defines a new computation function with a unique key.
  - **Parameters**:
    - `key`: Unique identifier for the compute function.
    - `fn`: The compute function itself.
    - `parentKeys`: (Optional) Array of keys representing dependencies.
  - **Example**:
    ```typescript
    define('multiply', ({ a, b }) => a * b);
    define('otherValue', (params, { multiply }) => multiply * 42, ['multiply']);
    ```

    Here, we define a basic 'multiply' computation function that multiplies two inputs.

- `get(key, param)`: Retrieves the computed value for a specific key.
  - **Parameteres**
    - `key`: The compute function to invoke.
    - `param`: The input parameters.
  - **Returns**: the computed value.
  - **Example**:
    ```typescript
    get('multiply', { a: 10, b: 2 });
    ```

- `getMany(keys, param)`: Retrieves multiple computed values.
  - **Parameteres**
    - `key`: The compute functions to invoke, and return their results..
    - `param`: The input parameters.
  - **Returns**: the computed values as an object with keys.
  - **Example**:
    ```typescript
    getMany(['multiply', 'otherValue'], { a: 10, b: 2 });
    ```

### Types and Interfaces
- `DefaultRecord`: Type alias for a generic record object.
- `ResultObject<T>`: Type alias for a generic object with keys and values of the same type.
- `ComputeFunction<TParam, TResult, ReturnType = TResult[keyof TResult]>`: Interface describing the computation function signature.

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
