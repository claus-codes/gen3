# Gen3: Efficient Computation of Interdependent Values

Gen3 is a utility for managing and computing interdependent values within a tree hierarchy. By recognizing the hierarchical relationships between computations, Gen3 ensures that parent values are calculated before their dependent child values. This characteristic is crucial for managing complex computations where the hierarchical order of execution matters.

Designed with performance in mind, Gen3 caches results to achieve optimal performance, ensuring each function is called only once per `get` method invocation.

## Example: World Generator

First, define your parameters and computed values, and create an instance of Gen3:

```typescript
import Gen3 from 'gen3';

type WorldGenParams = {
  x: number;
  y: number;
  noise2D: (x: number, y: number) => number;
};

type WorldGenResults = {
  continentShape: number;
  heightNoise: number;
  height: number;
  temperature: number;
  precipitation: number;
  biome: string;
  sample: {
    height: number;
    biome: string;
  }
};

const worldGen = new Gen3<WorldGenParams, WorldGenResults>();
```

Define your computations:

```typescript
// Expect the x and y coordinates in range of 0...1
worldGen.define('continentShape', ({ x, y }) =>
  Math.abs(Math.cos(x * Math.PI + Math.PI * 0.5) * Math.sin(y * Math.PI));
);

worldGen.define('heightNoise', ({ x, y, noise2D }) =>
  noise2D(x, y);
);

worldGen.define('height', ({ parent: { continentShape, heightNoise } }) =>
  continentShape * heightNoise,
  ['continentShape', 'heightNoise']
);
```

Gen3 begins to shine when more than once child uses a parent, due to caching parent values:

```typescript
worldGen.define('temperature', (params) => ..., ['height']);
worldGen.define('precipitation', (params) => ..., ['height']);
worldGen.define('biome', (params) => ..., ['height', 'temperature', 'precipitation']);

worldGen.define('sample', ({ parent: { height, biome } }) =>
  ({ height, biome }),
  ['height', 'biome']
);
```

Retrieve computed values:

```typescript
const { height, biome } = worldGen.get('sample', {
  noise2D: makeNoise2D(seed),
  x: 0.5,
  y: 0.5,
});

console.log(height, biome);
```

## License

This project is licensed under the MIT License. 
