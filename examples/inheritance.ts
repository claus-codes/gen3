import Gen3 from '../src/gen3';

// The parameters to pass to this tree
type Params = {
  value1: number;
  value2: number;
  someValue: number;
}

// Expected computed results
type Results = {
  parentValue: number;
  child1: number;
  child2: number;
  root: number;
}

const gen = new Gen3<Params, Results>();

// One parent that uses a value
gen.define('parentValue', ({
  value1,
  value2
}) => value1 * value2);

// ...and another node in the tree
gen.define('child1', ({
  parent: {
    parentValue,
  },
  value1,
}) => parentValue * 2 - value1,
  ['parentValue']
);

// ...and another node in the tree
gen.define('child2', ({
  parent: {
    parentValue,
  },
  value2,
}) => parentValue / 2 + value2,
  ['parentValue']
);

// Root node that we will query
gen.define('root', ({
  parent: {
    child1,
    child2
  },
  someValue,
}) => child1 * child2 + someValue,
  ['child1', 'child2']
);

// Get the result of the tree
const value = gen.get('root', {
  value1: 4,
  value2: 2,
  someValue: -30,
});

console.log(`The meaning of life, the universe, and everything is ${value}`);
