import Gen3 from './gen3';

describe('Gen3', () => {
  describe('Inheritance of computed values', () => {
    it('should compute values based on dependent values', () => {
      const gen = new Gen3<{ x: number }, { parent: number, child: number }>();
      
      gen.define('parent', ({ x }) => x);
      gen.define('child', ({ parent: { parent } }) => parent * 2, ['parent']);

      const childValue = gen.get('child', { x: 5 });
      expect(childValue).toBe(10);
    });
  });

  describe('ComputeFunction invocation', () => {
    let mockFunction: jest.Mock;

    beforeEach(() => {
      mockFunction = jest.fn();
    });

    it('should invoke each dependent ComputeFunction only once per get invocation', () => {
      const gen = new Gen3<{ value: number }, { parent: number, child: number }>();

      const parentMock = jest.fn().mockReturnValue(5);
      const childMock = jest.fn().mockImplementation(({ value: { parent } }) => parent * 2);

      gen.define('parent', parentMock);
      gen.define('child', childMock, ['parent']);

      // Call the get method
      gen.get('child', { value: 5 });
      
      expect(parentMock).toHaveBeenCalledTimes(1);
      expect(childMock).toHaveBeenCalledTimes(1);
    });
  });
});
