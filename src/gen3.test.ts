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
    it('should invoke each dependent ComputeFunction only once per get invocation', () => {
        const gen = new Gen3<{ value: number }, { parent: number, child1: number, child2: number, finalChild: number }>();

        const parentMock = jest.fn().mockReturnValue(5);
        const child1Mock = jest.fn().mockImplementation(({ parent: { parent } }) => parent + 10);
        const child2Mock = jest.fn().mockImplementation(({ parent: { parent } }) => parent * 2);
        const finalChildMock = jest.fn().mockImplementation(({ parent: { child1, child2 } }) => child1 + child2);

        gen.define('parent', parentMock);
        gen.define('child1', child1Mock, ['parent']);
        gen.define('child2', child2Mock, ['parent']);
        gen.define('finalChild', finalChildMock, ['child1', 'child2']);

        gen.get('finalChild', { value: 5 });

        expect(parentMock).toHaveBeenCalledTimes(1);
        expect(child1Mock).toHaveBeenCalledTimes(1);
        expect(child2Mock).toHaveBeenCalledTimes(1);
        expect(finalChildMock).toHaveBeenCalledTimes(1);
        expect(finalChildMock).toHaveBeenCalledWith({ value: 5, parent: { child1: 15, child2: 10 } });
    });
  });
});
