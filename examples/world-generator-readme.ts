import Gen3 from '../src/gen3';

// BYON: Bring Your Own Noise
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D();

// Expect the x and y coordinates in range of 0...1
type WorldGenParams = {
  x: number;
  y: number;
  noise2D: (x: number, y: number) => number;
};

// More complex results
type WorldGenResults = {
  continentShape: number;
  heightNoise: number;
  height: number;
  biome: string;
  sample: {
    height: number;
    biome: string;
  }
};

const worldGen = new Gen3<WorldGenParams, WorldGenResults>();

// Some sort of formula for a continent
worldGen.define('continentShape', ({
  x, y,
}) => Math.abs(
        Math.cos(x * Math.PI + Math.PI * 0.5) * Math.sin(y * Math.PI)
      ));

// A little pepper pepper pepper (noise)
worldGen.define('heightNoise', ({
  x, y,
  noise2D,
}) => noise2D(x, y) * 0.5 + 0.5);

// Combine the two to achieve landscape
worldGen.define('height', ({
  parent: {
    continentShape,
    heightNoise,
  },
}) => continentShape * heightNoise,
  ['continentShape', 'heightNoise']
);

// We can work with this...
worldGen.define('biome', ({
  parent: {
    height,
  },
}) => {
  if (height < 0.1983) return 'ocean';
  if (height >= 0.4) return 'mountain';
  return 'forest';
},['height']);

// What are we after?
worldGen.define('sample', ({
  parent: {
    height,
    biome
  }
}) =>
  ({
    height,
    biome,
  }),
  ['height', 'biome']
);

const {
  height,
  biome,
} = worldGen.get('sample', {
  x: 0.5,
  y: 0.5,
  noise2D,
});

console.log(height, biome);
