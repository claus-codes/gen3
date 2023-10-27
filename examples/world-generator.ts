import Gen3 from '../src/gen3';

// BYON: Bring Your Own Noise
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D();

// Expect the x and y coordinates in range of 0...1
type WorldGenParams = {
  x: number;
  y: number;
  noise2D: (x: number, y: number) => number;
  noiseScale: number;
};

// More complex results
type WorldGenResults = {
  continentShape: number;
  heightNoise: number;
  height: number;
  temperature: number;
  precipitation: number;
  biome: string;
  sample: {
    height: number;
    temperature: number;
    precipitation: number;
    biome: string;
  }
};

const worldGen = new Gen3<WorldGenParams, WorldGenResults>();

// Two horizontal bumps in a mathematical landscape
worldGen.define('continentShape', ({
  x, y,
}) => Math.abs(
        Math.cos(x * Math.PI + Math.PI * 0.5) * Math.sin(y * Math.PI)
      ));

// A little pepper pepper pepper
worldGen.define('heightNoise', ({
  x, y,
  noiseScale,
  noise2D,
}) => noise2D(x / noiseScale, y / noiseScale) * 0.5 + 0.5);

// Combine the two to achieve landscape
worldGen.define('height', ({
  parent: {
    continentShape,
    heightNoise,
  },
}) => continentShape * heightNoise,
  ['continentShape', 'heightNoise']
);

// High places are cold
worldGen.define('temperature', ({
  x, y,
  parent: {
    height,
  },
}) => height > 0.4
  ? y - (height - 0.4) * 2
  : y
);

// Hot places are dry
worldGen.define('precipitation', ({
  x, y,
  parent: {
    temperature
  },
}) => 1 - temperature,
  ['temperature']
);

// We can work with this...
worldGen.define('biome', ({
  parent: {
    height,
    temperature,
    precipitation,
  },
}) => {
  if (height < 0.2023) return 'ocean';
  if (temperature >= 0.666) return 'desert';
  if (temperature > 0.42 && precipitation > 0.42) return 'rainforest';
  if (temperature > 0.3 && precipitation > 0.3) return 'forest';
  if (temperature <= 0.21) return 'tundra';
  return 'meadows';
},['height', 'temperature', 'precipitation']);

// What are we after?
worldGen.define('sample', ({
  parent: {
    height,
    temperature,
    precipitation,
    biome
  }
}) =>
  ({
    height,
    temperature,
    precipitation,
    biome,
  }),
  ['height', 'temperature', 'precipitation', 'biome']
);

// Lets keep track of our biome counts
const counts: BiomeCounts = {
  ocean: 0,
  desert: 0,
  rainforest: 0,
  forest: 0,
  tundra: 0,
  meadows: 0,
};

// TypeScript...
type BiomeCounts = {
  ocean: number;
  desert: number;
  rainforest: number;
  forest: number;
  tundra: number;
  meadows: number;
};

type BiomeKey = keyof BiomeCounts;

// And our ranges!
const ranges = {
  height: {
    min: Infinity,
    max: -Infinity,
  },
  temperature: {
    min: Infinity,
    max: -Infinity,
  },
  precipitation: {
    min: Infinity,
    max: -Infinity,
  },
}

// Generate a 256x256 grid of samples
const r = 1 / 256;
let totalCellCount = 0;

// Iterate over the grid
for (let x = 0; x < 1; x += r) {
  for (let y = 0; y < 1; y += r) {
    // Get the sample
    const {
      height,
      biome,
      precipitation,
      temperature
    } = worldGen.get('sample', {
      x, y,
      noiseScale: 64,
      noise2D,
    });

    // Update our counts and ranges
    counts[biome as BiomeKey] = counts[biome as BiomeKey] + 1;
    totalCellCount++;

    // Update our ranges
    if (height > ranges.height.max)
      ranges.height.max = height;
    if (height < ranges.height.min)
      ranges.height.min = height;

    if (precipitation > ranges.precipitation.max)
      ranges.precipitation.max = precipitation;
    if (precipitation < ranges.precipitation.min)
      ranges.precipitation.min = precipitation;

    if (temperature > ranges.temperature.max)
      ranges.temperature.max = temperature;
    if (temperature < ranges.temperature.min)
      ranges.temperature.min = temperature;
  }
}

// Print out our results
console.log('RANGES:');
Object.keys(ranges).forEach((key) => {
  console.log(`${key}: ${ranges[key as keyof typeof ranges].min} - ${ranges[key as keyof typeof ranges].max}`);
});

// Print out biome distribution
console.log('\nDISTRIBUTION:');
Object.keys(counts).forEach((key) => {
  console.log(`${key}: ${Math.floor((counts[key as BiomeKey] / totalCellCount) * 100)} %`);
});
