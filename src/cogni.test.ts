import cogni from './cogni';

describe('cogni', () => {
  it('should compute basic operation', () => {
    const { define, get } = cogni<{}, { result: number }>();

    define('result', () => 42);

    expect(get('result', {})).toBe(42);
  });

  it('should handle dependency computation', () => {
    const { define, get } = cogni<{ base: number }, { double: number, triple: number }>();

    define('double', ({ base }) => base * 2);
    define('triple', ({ base }) => base * 3);

    expect(get('double', { base: 2 })).toBe(4);
    expect(get('triple', { base: 3 })).toBe(9);
  });

  it('should manage complex dependency tree computations', () => {
    const { define, get } = cogni<{ a: number, b: number }, { sum: number, product: number, combined: number }>();

    define('sum', ({ a, b }) => a + b);
    define('product', ({ a, b }) => a * b);
    define('combined', (params, { sum, product }) => sum + product, ['sum', 'product']);

    expect(get('combined', { a: 2, b: 3 })).toBe(11); // (2 + 3) + (2 * 3)
  });

  it('should return multiple values with getMany', () => {
    const { define, getMany } = cogni<{ value: number }, { double: number, square: number }>();

    define('double', ({ value }) => value * 2);
    define('square', ({ value }) => value * value);

    const result = getMany(['double', 'square'], { value: 3 });

    expect(result.double).toBe(6);
    expect(result.square).toBe(9);
  });

  it('should execute parent compute function only once when multiple children depend on it', () => {
    const { define, getMany } = cogni<{}, { parent: number, child1: number, child2: number }>();

    // Creating a mock function for the parent compute function
    const mockParentFunction = jest.fn().mockReturnValue(10);

    // Defining the parent node
    define('parent', mockParentFunction);

    // Defining child nodes that depend on the parent node
    define('child1', (params, { parent }) => parent + 1, ['parent']);
    define('child2', (params, { parent }) => parent + 2, ['parent']);

    // Retrieving both child nodes in a single call
    getMany(['child1', 'child2'], {});

    // Expect the parent mock function to have been called only once
    expect(mockParentFunction).toHaveBeenCalledTimes(1);
  });

  it('should throw error for undefined key', () => {
    type Params = { [key: string]: any };
    type Results = { [key: string]: any };

    const { get } = cogni<Params, Results>();

    expect(() => get('undefinedKey', {})).toThrow();
  });

  test('should throw error when defining a value with undefined parent value', () => {
    type Params = { base: number };
    type Results = { double: number, triple: number };

    const { define } = cogni<Params, Results>();

    // Attempt to define a node with a non-existent parent node
    expect(() => {
      define('triple', ({ base }, { double }) => base * 3, ['double']);
    }).toThrow();
  });
});