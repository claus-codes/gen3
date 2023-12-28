/**
 * World generator using cogni to demonstrate multi-parameter dependency computations.
 */
import cogni from '../src/cogni';
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

// Define the continent shape based on x and y coordinates.
// This creates two continents horiontally that span the height of the world.
define('continentShape', ({ x, y }) =>
  Math.abs(Math.cos(x * Math.PI * 2 + Math.PI * 0.5) * Math.sin(y * Math.PI)));

// Compute the height noise using the provided noise function and scale.
define('heightNoise',
  ({ x, y, noiseScale, noise2D }) =>
    noise2D(x * noiseScale, y * noiseScale) * 0.5 + 0.5); // Normalize to 0...1

// Calculate the height by combining continent shape and height noise to produce the final height value.
// Notice that it does not use any parameters, only the results from the previous computations.
define('height',
  (params, { continentShape, heightNoise }) =>
    continentShape * heightNoise,
  ['continentShape', 'heightNoise']);

// Define temperature, factoring in height and latitude (y-coordinate).
// North is cold, South is hot, and peaks are covered in frost.
define('temperature',
  ({ y }, { height }) =>
    (height > 0.4 ? y - (height - 0.4) * 2 : y),
  ['height']);

// Determine precipitation based on temperature.
// Hotter areas have less rainfall.
define('precipitation',
  (params, { temperature }) =>
    1 - temperature,
  ['temperature']);

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

// Initialize counters for biome distribution and value ranges.
type BiomeCounts = {
  ocean: number;
  desert: number;
  rainforest: number;
  forest: number;
  tundra: number;
  meadows: number;
};

type BiomeKey = keyof BiomeCounts;

const counts: BiomeCounts = {
  ocean: 0,
  desert: 0,
  rainforest: 0,
  forest: 0,
  tundra: 0,
  meadows: 0,
};

// Keep track of our ranges
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
};

// Analyze a 256x256 grid within the coordinate range of 0.0 to 1.0.
const r = 1 / 256;
let totalCellCount = 0;

// Iterate over the grid
for (let x = 0; x < 1; x += r) {
  for (let y = 0; y < 1; y += r) {
    // Compute and update counts and ranges...
    const { height, biome, precipitation, temperature } = getMany(
      ['height', 'biome', 'precipitation', 'temperature'],
      { x, y, noiseScale: 8, noise2D });

    // Update our counts and ranges.
    counts[biome as BiomeKey] = counts[biome as BiomeKey] + 1;
    totalCellCount++;

    if (height > ranges.height.max) ranges.height.max = height;
    if (height < ranges.height.min) ranges.height.min = height;

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

// Output computed ranges and biome distribution.
console.log('Value ranges:');
Object.keys(ranges).forEach((key) => {
  console.log(
    `${key}: ${ranges[key as keyof typeof ranges].min} - ${
      ranges[key as keyof typeof ranges].max
    }`,
  );
});

// Print out biome distribution
console.log('\nBiome distribution:');
Object.keys(counts).forEach((key) => {
  console.log(
    `${key}: ${Math.floor((counts[key as BiomeKey] / totalCellCount) * 100)} %`,
  );
});

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
console.log(`\n${biomeMessage}`);
