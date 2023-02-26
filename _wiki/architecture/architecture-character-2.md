---
layout  : wiki
title   : Character of Architectures222
summary : 
date    : 2023-02-01 15:02:32 +0900
updated : 2023-02-01 15:12:24 +0900
tag     : ddd architecture
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Character of Architectures 

Clean Architecture and Hexagonal Architecture are both architectural patterns that aim to separate the concerns of software systems into isolated, independent, and interchangeable components.

__Clean Architecture__ emphasizes separating an application into layers, where the innermost layer contains business rules and the outermost layer consists of interface adapters. It also advocates for the separation of components based on their reason for change.

__Hexagonal Architecture__, also known as the Ports and Adapters pattern, focuses on separating the core of the application from the surrounding infrastructure. The core of the application is the hexagonal shape in the middle, and the infrastructure is represented by the adapters around it. The idea is to make the application's core independent from the infrastructure so that changes to the infrastructure don't affect the core.

Reducing dependencies between layers is one of the key benefits of using a __Layered architecture__. By limiting the interactions between layers and enforcing a clear separation of responsibilities, the layered architecture reduces the risk of changes in one layer affecting the behavior of another layer, making it easier to modify or replace components without affecting the entire system.

In addition to reducing dependencies, using a layered architecture can also:

- __Promote modularity__: By breaking down the system into smaller, more manageable components, a layered architecture makes it easier to develop, test, and maintain the software.
- __Increase scalability__: By allowing components to be added or removed without affecting the rest of the system, a layered architecture can help support growth and expansion of the system over time.
- __Improve reliability__: By enforcing a clear separation of responsibilities and minimizing the number of interactions between layers, a layered architecture can reduce the risk of bugs and other errors, and improve the overall reliability of the system.

__Summary:__
- Clean Architecture prioritizes separating concerns based on their reasons for change
- Hexagonal Architecture prioritizes separating the core of an application from the surrounding infrastructure
- Layered Architecture prioritizes reduce dependencies between layers