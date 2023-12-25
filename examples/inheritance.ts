/**
 * Compute values based on the results from parent compute functions.
 */
import cogni from '../src/cogni';

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

// Define a child node that depends on the 'parentValue'.
// 'child1' computes a value based on 'parentValue' and 'param1'.
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
