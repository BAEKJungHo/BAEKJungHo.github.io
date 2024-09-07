---
layout  : wiki
title   : Circuit Breaker with Fallback Improving Resiliency
summary : 
date    : 2023-03-01 15:02:32 +0900
updated : 2023-03-01 15:12:24 +0900
tag     : architecture msa designpattern
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Circuit Breaker with Fallback Improving Resiliency

___[Circuit Breaker](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern)___ 패턴은 호출 당하는 서비스에서 응답이 늦거나 (미흡한 예외 처리로 인한) 예외가 발생하여 생기는 문제를 다른 마이크로서비스에게 전파되지 않도록 하기 위함이다. 즉, MSA 에서 시스템의 안정성과 복원력을 향상시키기 위한 패턴이다.
서비스 응답이 늦는 경우(Timeout), 지속적인 호출이 쌓이다보면 thread-hang 이 발생할 수 도 있다.

___Fallback___ 은 호출 당하는 서비스에서 위와 같은 문제가 발생했을때, 호출한 서비스에게 예외를 주는 것이 아닌 대체 로직을 실행해서 결과를 내주도록 하기 위한 매커니즘을 의미한다.

__Hystrix fallback prevents cascading failures:__

![](/resource/wiki/architecture-circuit-breaker/fallback.png)

__Circuit Breaker Pattern States:__
1. CLOSED
2. OPEN
3. HALF-OPEN

초기 상태는 CLOSED 이다. 정상인 상태를 의미한다. 그리고 프록시 구성에 지정된 횟수를 초과하면 상태가 Open 으로 변경되고 타이머가 시작된다. 상태가 OPEN 인 동안에는 서비스 호출이 없고 Fallback 로직을 실행하여 반환한다. 타이머가 종료되면 HALF-OPEN 상태로 변경되며 이때 서비스 호출을 한 번 더 할 수 있다. 만약 정상으로 복구가 되었다면 CLOSED 상태로 변경되고 실패 카운터가 0으로 초기화 된다. 여전히 문제가 발생한다면 OPEN 상태로 변경된다.

```kotlin
// @CircuitBreaker(maxAttempts = 3, openTimeout = 5000L, resetTimeout = 20000L)
@CircuitBreaker(name = "my-service", fallbackMethod = "fallbackRun")
fun run(): String {
    log.info("Calling external service...")
    if (Math.random() > 0.5) {
        throw RemoteAccessException("Something went wrong...")
    }
    log.info("Success calling external service")
    return "Success calling external service"
}

fun fallbackRun(ex: Throwable): String {
    log.error("Fallback for external service: ${ex.message}")
    return "Success on fallback"
}
```

- maxAttempts: fallback 을 호출하기 전에 최대 시도하는 횟수
- openTimeout: 최대 실패 시도 횟수를 시도해야 하는 기간
- resetTimeout: OPEN to HALF-OPEN timer

Circuit Breaker 패턴을 구현할때 __threshold of error__ 를 잘 정하는 것이 중요한 것 같다.

> NetFlix - The tripping of circuits kicks in when a DependencyCommand has passed a certain threshold of error (such as 50% error rate in a 10 second period) and will then reject all requests until health checks succeed.

__It’s very important to take into account that the complexity of the Circuit Breaker pattern’s implementation must answer our application’s real needs as well as the business requirements.__

Any change in breaker state should be logged and breakers should reveal details of their state for deeper monitoring.

## Making the Netflix API More Resilient

[Making the Netflix API More Resilient: 넷플릭스의 회로 차단기(circuit breaker) 구현 원칙](https://netflixtechblog.com/making-the-netflix-api-more-resilient-a8ec62159c2d)을 설명하고 있다.

### Principles of Resiliency by NetFlix

1. A failure in a service dependency should not break the user experience for members
2. The API should automatically take corrective action when one of its service dependencies fails
3. The API should be able to show us what’s happening right now, in addition to what was happening 15–30 minutes ago, yesterday, last week, etc.

__Netflix CircuitBreaker pattern in that fallbacks can be triggered in a few ways:__
1. A request to the remote service times out
2. The thread pool and bounded task queue used to interact with a service dependency are at 100% capacity
3. The client library used to interact with a service dependency throws an exception

These buckets of failures factor into a service’s overall error rate and when the error rate exceeds a defined threshold then we “trip” the circuit for that service and immediately serve fallbacks without even attempting to communicate with the remote service.

__Netflix Each service that’s wrapped by a circuit breaker implements a fallback using one of the following three approaches:__
1. __Custom fallback__ — in some cases a service’s client library provides a fallback method we can invoke, or in other cases we can use locally available data on an API server (eg, a cookie or local JVM cache) to generate a fallback response
2. __Fail silent__ — in this case the fallback method simply returns a null value, which is useful if the data provided by the service being invoked is optional for the response that will be sent back to the requesting client
3. __Fail fast__ — used in cases where the data is required or there’s no good fallback and results in a client getting a 5xx response. This can negatively affect the device UX, which is not ideal, but it keeps API servers healthy and allows the system to recover quickly when the failing service becomes available again.

## Fault Tolerance in a High Volume, Distributed System

[NetFlix - Fault Tolerance in a High Volume, Distributed System](https://netflixtechblog.com/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a):

![](/resource/wiki/architecture-circuit-breaker/netflix.png)

NetFlix 블로그 글을 읽어보면 다음과 같이 설명이 된 곳이 있다.

네트워크 호출을 포함하는 종속성 실행의 경우 동시성 및 병렬 처리의 이점이 각 작업에 대해 새 스레드를 생성하는 오버헤드보다 더 크기 때문에 이를 실행하는 데 여전히 별도의 스레드가 사용된다. 하지만 __메모리 내 캐시 조회__ 와 같이 __네트워크 호출을 수행하지 않는 종속성 실행의 경우__ 별도의 스레드를 생성하는 오버헤드가 너무 높을 수 있고, 작업이 빠르게 완료되어야 하는 경우 특히 그렇다.

이 경우에 __Semaphore 를 사용하여 Shared Resource 에 대한 액세스를 제어하는 것이 더 효율적일 수 있다.__

[Semaphore](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Semaphore.html) 를 코드로 구현하면 다음과 같다.

__It is important to note that every thread uses the same semaphore instance.__

```kotlin
import java.util.concurrent.Semaphore

class Cache {
    private val semaphore = Semaphore(10) // allow 10 threads to access the cache at a time
    private val data = mutableMapOf<String, String>()

    fun getValue(key: String): String? {
        // acquire a permit from the semaphore, blocking if necessary
        semaphore.acquire()

        val value = data[key]

        // release the permit when we're done accessing the cache
        semaphore.release()

        return value
    }

    fun setValue(key: String, value: String) {
        // acquire a permit from the semaphore, blocking if necessary
        semaphore.acquire()

        data[key] = value

        // release the permit when we're done accessing the cache
        semaphore.release()
    }
}
```

__Acquire a permit:__

```java
// Acquire one permit
semaphoreWithFivePermits.acquire();

// Acquire four permits
semaphoreWithFivePermits.acquire(4);

// Will try to immediately get a permit, and it ignores fairness
semaphoreWithFivePermits.tryAcquire();

// Will wait to acquire a permit for five seconds
semaphoreWithFivePermits.tryAcquire(5, TimeUnit.SECONDS);
```

tryAcquire() 가 공정하지 않다는 점이 Redisson tryLock() 과 유사하다.

## Links

- [DZone - Circuit Breaker Pattern](https://dzone.com/articles/the-circuit-breaker-pattern-1)
- [Martinflowler - CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Circuit breaker 패턴을 이용한 장애에 강한 MSA 서비스 구현하기](https://bcho.tistory.com/1250)
- [Resilience4j Circuit Breaker 를 이용한 장애 대비하기 - NHN](https://meetup.nhncloud.com/posts/385)
- [Spring Cloud Circuit Breaker: Hystrix Clients](https://cloud.spring.io/spring-cloud-netflix/multi/multi__circuit_breaker_hystrix_clients.html)
- [NetFlix - Hystrix](https://github.com/Netflix/Hystrix/)
- [How to use Java Semaphore](https://www.davidvlijmincx.com/posts/how-to-use-java-semaphore/)