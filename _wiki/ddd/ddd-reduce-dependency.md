---
layout  : wiki
title   : Reduce Dependency
summary : 
date    : 2023-02-02 15:02:32 +0900
updated : 2023-02-02 15:12:24 +0900
tag     : ddd architecture
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Reduce Dependency

There are several techniques that can be used to reduce dependencies and enforce a clear separation of responsibilities:

- __Use Interfaces__: By defining interfaces for each layer, you can clearly define the expected behavior of each component and reduce the risk of tight coupling between components. This allows you to change the implementation of one component without affecting the other components that depend on it.
- __Dependency Injection__: Dependency injection is a pattern in which objects are provided with their dependencies at runtime, rather than having to create them directly. By using dependency injection, you can reduce the number of dependencies between components and make it easier to test and maintain the code.
- __Avoid Circular Dependencies__: Circular dependencies occur when two or more components depend on each other, creating a cycle in the dependency graph. To avoid circular dependencies, you should design your components to depend on abstractions rather than concrete implementations.
- __Minimize the Use of Static Methods and Variables__: Static methods and variables create tight couplings between components and can make it difficult to test and maintain the code. By minimizing the use of static methods and variables, you can reduce the risk of tight couplings and improve the modularity of your code.
- __Use Aspect-Oriented Programming (AOP)__: AOP is a programming paradigm that separates concerns, such as logging, security, and transactions, into separate, modular components that can be applied to other parts of the code. By using AOP, you can reduce the dependencies between components and make it easier to maintain and test the code.

By following these techniques, you can __reduce interlayer dependencies__ in application and __enforce a clear separation of responsibilities__, which can make it easier to maintain, modify, and test the code over time.