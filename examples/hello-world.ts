/**
 * Create a single compute function that takes two parameters.
 */
import cogni from '../src/cogni';

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
