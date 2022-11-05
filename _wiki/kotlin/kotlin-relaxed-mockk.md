---
layout  : wiki
title   : RelaxedMockk
summary : 
date    : 2022-10-25 20:54:32 +0900
updated : 2022-10-25 21:15:24 +0900
tag     : kotlin mockk
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## RelaxedMockk

A relaxed mock is the mock that returns some simple value for all functions. This allows you to skip specifying behavior for each case, while still stubbing things you need. For reference types, chained mocks are returned.

```kotlin
val car = mockk<Car>(relaxed = true)

car.drive(Direction.NORTH) // returns null

verify { car.drive(Direction.NORTH) }

confirmVerified(car)
```

A typical mocked object will throw MockKException if we try to call a method where the return value hasn’t been specified. __If we don’t want to describe the behavior of each method, then we can use a relaxed mock__

```kotlin
@Test
fun test() {
    // given
    val service = mockk<AuthService>(relaxed = true)
 
    // when
    val result = service.signIn("Any Param")
 
    // then
    assertEquals("", result)
}
```

__We don't need Stubbing.__ We could've also used the __@RelaxedMockk__ annotation:

```kotlin
class RelaxedMockKUnitTest 

    @RelaxedMockK
    lateinit var service: TestableService

    // Tests here
}
```

## Links

- [Relaxed Mock - Mockk.io](https://mockk.io/#relaxed-mock)
- [Mockk - Baeldung](https://www.baeldung.com/kotlin/mockk)
