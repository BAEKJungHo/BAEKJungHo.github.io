---
layout  : wiki
title   : Hexagonal Architecture
summary : Ports and Adapter Architecture
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

The idea of Hexagonal Architecture is to put inputs and outputs at the edges of our design. Business logic should not depend on whether we expose a REST or a GraphQL API, and it should not depend on where we get data from — a database, a microservice API exposed via gRPC or REST, or just a simple CSV file.

The pattern allows us to isolate the core logic of our application from outside concerns. Having our core logic isolated means we can easily change data source details without a significant impact or major code rewrites to the codebase.

One of the main advantages we also saw in having an app with clear boundaries is our testing strategy — the majority of our tests can verify our business logic without relying on protocols that can easily change.

![](/resource/wiki/architecture-hexagonal/dependencies.png)

___Port___ 랑 ___Adapter___ 라는 개념을 사용하여 ___Ports and Adapter Architecture___ 라고도 한다. ___핵심 로직을 주변 Infrastructure 영역으로 부터 분리하는 것이 핵심___ 이다.

___[Ports define an abstract API](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))___ that can be implemented by any suitable technical means (e.g. method invocation in an object-oriented language, remote procedure calls, or Web services)

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

### Examples

#### Domain Layer

```kotlin
data class User(val id: String, val name: String)

interface UserService {
    fun createUser(name: String): User
    fun getUserById(id: String): User?
}
```

#### Application Layer

__application.port.in__:

```kotlin
package com.example.hexagonal.application.port.`in`

import com.example.hexagonal.domain.User

interface CreateUserUseCase {
    fun createUser(name: String): User
}

interface GetUserUseCase {
    fun getUserById(id: String): User?
}
```

__application.port.out__:

```kotlin
package com.example.hexagonal.application.port.out

import com.example.hexagonal.domain.User

interface UserPersistencePort {
    fun saveUser(user: User): User
    fun findUserById(id: String): User?
}
```

### Adapter Layer

```kotlin
package com.example.hexagonal.adpater.`in`.web

@RestController
@RequestMapping("/api/users")
class UserController(
    private val createUserUseCase: CreateUserUseCase,
    private val getUserUseCase: GetUserUseCase
) {

    @PostMapping
    fun createUser(@RequestBody request: CreateUserRequest): User {
        return createUserUseCase.createUser(request.name)
    }

    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: String): User? {
        return getUserUseCase.getUserById(id)
    }
}

data class CreateUserRequest(val name: String)
```

__adapter.out.persistence__: 

```kotlin
package com.example.hexagonal.adapter.out.persistence

import com.example.hexagonal.application.port.out.UserPersistencePort
import com.example.hexagonal.domain.User
import org.springframework.stereotype.Component

@Component
class InMemoryUserRepository : UserPersistencePort {
    private val users = mutableMapOf<String, User>()

    override fun saveUser(user: User): User {
        users[user.id] = user
        return user
    }

    override fun findUserById(id: String): User? {
        return users[id]
    }
}
```

Repository 외에도 JpaEntity, Mapper 등이 들어갈 수 있다.

## Links

- [NetFlix - Ready for changes with Hexagonal Architecture](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749)
- [Mesh Korea - Hexagonal Architecture](https://mesh.dev/20210910-dev-notes-007-hexagonal-architecture/)
- [Get Your Hands Dirty on Clean Architecture](https://github.com/thombergs/buckpal)