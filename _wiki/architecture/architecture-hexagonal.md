---
layout  : wiki
title   : Hexagonal Architecture
summary : 
date    : 2023-02-23 15:02:32 +0900
updated : 2023-02-23 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Hexagonal Architecture

> 핵심 로직을 주변 Infrastructure 영역으로 부터 분리하기 위함

The idea of Hexagonal Architecture is to put inputs and outputs at the edges of our design. Business logic should not depend on whether we expose a REST or a GraphQL API, and it should not depend on where we get data from — a database, a microservice API exposed via gRPC or REST, or just a simple CSV file.

The pattern allows us to isolate the core logic of our application from outside concerns. Having our core logic isolated means we can easily change data source details without a significant impact or major code rewrites to the codebase.

One of the main advantages we also saw in having an app with clear boundaries is our testing strategy — the majority of our tests can verify our business logic without relying on protocols that can easily change.

Port 랑 Adapter 라는 개념을 사용함.

__[Ports define an abstract API](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) that can be implemented by any suitable technical means (e.g. method invocation in an object-oriented language, remote procedure calls, or Web services).__

코드로 구현하는 경우 Port 는 Interface, Adapter 는 구현체로 표현할 수 있음

```kotlin
// Ports
interface OrderCreationPort {
    fun createOrder(orderRequest: OrderRequest): Order
}

// Adapters
class OrderCreationAdapter(
    private val orderService: OrderService
): OrderCreationPort {
    
    @Override
    fun createOrder(orderRequest: OrderRequest): Order {
        return orderService.createOrder(orderRequest)
    }
}
```

## Links

- [NetFlix - Ready for changes with Hexagonal Architecture](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749)
- [Mesh Korea - Hexagonal Architecture](https://mesh.dev/20210910-dev-notes-007-hexagonal-architecture/)