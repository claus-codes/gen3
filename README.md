# Cogni: Efficient Computation of Interdependent Values

`Cogni` is a powerful TypeScript utility designed to efficiently manage and compute interdependent values within a tree hierarchy. By defining a series of compute functions that can depend on each other, making it simple and intuitive to calculate values that rely on multiple inputs and previous computations.

Efficiency is a core principle in the design of this utility. When you request a result by invoking a compute function, `Cogni` ensures that each compute function is invoked only once, regardless of how many other compute functions depend on its output. This not only conserves computational resources but also ensures consistent results across the tree hierarchy.

This design choice allows for complex compositions of compute functions without the worry of redundant calculations, leading to faster and more predictable outcomes.

## Features:

- **Interdependent Computation**: Easily define and manage values that depend on other computed values.
- **Chaining**: Define compute functions and retrieve their values in a chainable manner.
- **Highly Customizable**: Tailored to work with custom parameter types and result types.
- **Type Safety**: Written in TypeScript, ensuring type safety and improved developer experience.

## Installation:

```sh
npm install cogni
```

## Usage

### Example 1: Hello World

Create a single compute function that takes two parameters.

```js
import Cogni from 'cogni';

const gen = new Cogni();

gen.define('output', ({ greeting, recipient }) => `${greeting} ${recipient}!`);

const output = gen.get('output', { greeting: 'Hello', recipient: 'World' });
console.log(output); // Hello World!
```

### Example 2: Inheritance

Compute values based on the results from parent compute functions.

```js
const gen = new Cogni();

// parentValue uses both value1 and value2 parameters
gen.define('parentValue', ({ value1, value2 })
=> value1 * value2);

// child1 uses value1 parameter, and the parentValue
gen.define('child1', ({ value1, parent: { parentValue } })
=> parentValue * 2 - value1,
  ['parentValue']);

// child2 uses value2 parameter, and the parentValue
gen.define('child2', ({ value2, parent: { parentValue } })
=> parentValue / 2 + value2,
  ['parentValue']);

// root uses someValue parameter, and parents child1 and child2
gen.define('root', ({ someValue, parent: { child1, child2 } })
=> child1 * child2 + someValue,
  ['child1', 'child2']);

const value = gen.get('root', { value1: 4, value2: 2, someValue: -30 });
console.log(`The meaning of life, the universe, and everything is ${value}`); // 42
```

### Example 3: World Generator

Lets build a basic world generator using multiple compute functions, and a gradient noise function as a parameter. The `x` and `y` coordinate parameters range between 0...1, so the size of the world is arbitrarily scalable.

```js
import Cogni from 'arvo';
import { createNoise2D } from 'simplex-noise';

const worldGen = new Cogni();
const noise2D = createNoise2D();

// Two continents horiontally spanning the height of the world
worldGen.define('continentShape', ({ x, y })
=> Math.abs(Math.cos(x * Math.PI * 2 + Math.PI * 0.5) * Math.sin(y * Math.PI)));
```
![Continent shapes](./images/world-gen-continent-shape.png "Continent shapes")

```js
// Gradient noise makes the world less flat
worldGen.define('heightNoise', ({ x, y, noiseScale, noise2D })
=> noise2D(x * noiseScale, y * noiseScale) * 0.5 + 0.5);
```
![Height noise](./images/world-gen-height-noise.png "Height noise")

```js
// Combine continent shape and height noise for the final noise value
worldGen.define('height', ({ parent: { continentShape, heightNoise } })
=> continentShape * heightNoise,
  ['continentShape', 'heightNoise']);
```
![Height](./images/world-gen-height.png "Height")

```js
// North is cold, South is hot, and peaks are covered in frost
worldGen.define('temperature', ({ x, y, parent: { height } })
=> height > 0.4 ? y - (height - 0.4) * 2 : y,
  ['height']);
```
![Preview of temperature map](./images/world-gen-temperature.png "Temperature")

```js
// Hotter areas have less rainfall
worldGen.define('precipitation', ({ parent: { temperature } })
=> 1 - temperature,
  ['temperature']);
```
![Image for precipitation](./images/world-gen-precipitation.png "Precipitation")

```js
// Height, temperature and precipitation are used to determine the biome
worldGen.define('biome', ({ parent: { height, temperature, precipitation } })
=> {
  if (height < 0.2023) return 'ocean';
  if (temperature >= 0.666) return 'desert';
  if (temperature > 0.42 && precipitation > 0.42) return 'rainforest';
  if (temperature > 0.3 && precipitation > 0.3) return 'forest';
  if (temperature <= 0.21) return 'tundra';
  return 'meadows';
}, ['height', 'temperature', 'precipitation']);
```
![Image for biomes](./images/world-gen-biome.png "Biome")

```js
// Sampling returns the height and biome
worldGen.define('sample', ({ parent: { height, biome } })
=> ({ height, biome }),
  ['height', 'biome']);

// For x and y, pick any fractional value between 0.0 and 1.0
const { height, biome } = worldGen.get('sample', {
  x: 0.5,
  y: 0.5,
  noiseScale: 8,
  noise2D
});
```

## TypeScript Examples

Explore the following TypeScript examples to get a better understanding of how `Cogni` can be used:

- [Hello World!](examples/hello-world.ts)
- [Inheritance](examples/inheritance.ts)
- [World Generator](examples/world-generator.ts)

## License

This project is licensed under the MIT License.
