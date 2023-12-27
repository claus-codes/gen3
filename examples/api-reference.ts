import cogni from '../src/cogni';

// Define the structure for input parameters.
type Params = {
  a: number;
  b: number;
}

// Define the structure for computation results.
type Results = {
  multiply: number;
  otherValue: number;
}

// Initialize the cogni computation manager with defined parameter and result types.
const { define, get, getMany } = cogni<Params, Results>();

// Define a 'multiply' computation node that multiplies two numbers.
define('multiply', ({ a, b }) => a * b);

// Define another computation node 'otherValue' that depends on the result of 'multiply'.
// It multiplies the result of 'multiply' by 42.
define('otherValue', (params, { multiply }) => multiply * 42, ['multiply']);

// Retrieve and log the result of the 'multiply' computation node.
console.log('multiply', get('multiply', { a: 10, b: 2 }));

// Retrieve multiple computed values ('multiply' and 'otherValue') and log them.
const { multiply, otherValue } = getMany(['multiply', 'otherValue'], { a: 4, b: 20 });
console.log({ multiply, otherValue })
