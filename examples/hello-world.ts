/**
 * Create a single compute function that takes two parameters.
 */
import Arvo from '../src/arvo';

// The parameters to pass to this tree
type Params = {
  greeting: string;
  recipient: string;
}

// Expected computed results
type Results = {
  output: string;
}

// Create a new tree
const gen = new Arvo<Params, Results>();

// Define a node in the tree
gen.define('output', ({
  greeting,
  recipient,
}) => `${greeting} ${recipient}!`);

// Get the result of the tree
const output = gen.get('output', {
  greeting: 'Hello',
  recipient: 'World',
});

console.log(output); // Hello World
