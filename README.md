# Gen3: Efficient Computation of Interdependent Values

This library is a tool for managing and computing interdependent values within a tree hierarchy.



By recognizing the hierarchical relationships between computations, Gen3 ensures that parent values are calculated before their dependent child values. This characteristic is crucial for managing complex computations where the hierarchical order of execution matters.

Designed with performance in mind, Gen3 caches results to achieve optimal performance, ensuring each function is called only once per `get` method invocation.

## Examples

- [Hello World!](examples/hello-world.ts)
- [Inheritance](examples/inheritance.ts)
- [World Generator](examples/world-generator.ts)

## License

This project is licensed under the MIT License. 
