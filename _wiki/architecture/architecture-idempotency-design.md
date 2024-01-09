---
layout  : wiki
title   : Designing robust APIs with Idempotency
summary : Exponential backoff
date    : 2024-01-08 15:02:32 +0900
updated : 2024-01-08 15:12:24 +0900
tag     : architecture idempotency
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Designing robust APIs with Idempotency

Networks are [unreliable](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing).

불안정한 네트워크 환경에서(e.g SDV, Mobile, etc) 요청에 대한 응답을 클라이언트가 정상적으로 수신하지 못하면, [재시도(retry) 를 하게 되고 재시도로 인해 정합성(consistency) 문제](https://baekjungho.github.io/wiki/troubleshooting/troubleshooting-idempotency/)가 발생할 수 있다. 

이러한 문제를 __[idempotency](https://baekjungho.github.io/wiki/network/network-idempotency/)__ 을 활용하여 해결할 수 있다. 멱등성(idempotency)은 여러번 요청하더라도 결과가 같다는 의미이다.

HTTP 메소드 중 GET, PUT, DELETE 는 표준에 따라 멱등원 방식으로 구현되어야 하지만 POST 는 반드시 그렇게 할 필요는 없다.

### Guaranteeing “exactly once” semantics

고객에게 비용을 청구하기 위해 API 엔드포인트를 설계하는 경우를 예로 들 수 있습니다. 실수로 두 번 호출하면 고객에게 이중 요금이 청구될 수 있다.
여기서 __[idempotency keys](https://brandur.org/idempotency-keys)__ 를 활용하여 문제를 해결할 수 있다.

To perform an idempotent request, provide an additional `Idempotency-Key: <key>` header to the request. Idempotency keys can be up to 255 characters long.

멱등성 키는 클라이언트에서 서버로 요청할때 UUID 등을 사용하여 Header 에 담아 보낸다. 이때, 3가지 경우의 수를 생각하여 처리해야 한다.

1. 서버로 요청 자체가 안온 경우
2. 서버에서 요청은 받아서 처리가 됐지만, 클라이언트쪽에서 네트워크가 끊어져 응답을 받지 못한 경우
3. 서버에서 요청을 처리하다가 예외가 발생한 경우

1번의 경우에는 클라이언트로부터 요청을 다시 받아서 처리하면 된다. 2번의 경우에는 저장소(storage)에 처리된 결과를 저장(caching)한다.
3번의 경우에는 tx rollback 을 진행한다. 따로 예외에 대한 내용을 캐싱할 필요 없다.

### Exponential backoff

타임아웃 특성상 짧은 주기로 계속 재시도 요청을 보내게 되면 네트워크 지연 상황을 더욱 악화 시킬 수 있다. 네트워크 지연으로 인해 더 빈번한 타임아웃이 발생할 수 있다.

이러한 방법을 [지수적으로 재시도 요청](https://en.wikipedia.org/wiki/Exponential_backoff) 하는 방향으로 개선할 수 있다. 예를 들면, 1분, 2분, 4분, 8분에 한 번씩 보내도록 처리할 수 있다.

그럼에도 정합성이 틀어지는 경우에는 별도의 Batch 에서 정합성을 올바르게 맞추도록 할 수 있다.

### Codifying the design of robust APIs

Here are a few core principles to follow while designing your clients and APIs:
- Make sure that failures are handled consistently. Have clients retry operations against remote services. Not doing so could leave data in an inconsistent state that will lead to problems down the road.
- Make sure that failures are handled safely. Use idempotency and idempotency keys to allow clients to pass a unique value and retry requests as needed.
- Make sure that failures are handled responsibly. Use techniques like exponential backoff and random jitter. Be considerate of servers that may be stuck in a degraded state.

### Implementation with Kotlin and Spring AOP

__Idempotency annotation__:

```kotlin
@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION)
@Retention(RetentionPolicy.RUNTIME)
annotation class Idempotency(
    val timeout: Int = 10,
    val timeUnit: TimeUnit = TimeUnit.MINUTES
)
```

위 어노테이션을 멱등성이 필요한 API 에 붙인다. Spring AOP 를 활용하여 다음과 같이 처리한다.

__pseudocode__:

```
@Advice
class ControllerAdvice {
    @Around("@annotation(idempotency)")
    fun invoke(point: ProceedingJoinPoint) {
        val idempotencyAnnotation = method.getDeclaredAnnotation(Idempotency::class.java)
        idempotencyAnnotation?.let {
              // if exists cached response then return
        }
        val retVal = point.proceed() // Businsess Logic Result
        caching(reval) // Caching Result
    }
}
```

### Idempotency with Distributed Lock Flow

__Idempotency with [Distributed Lock](https://baekjungho.github.io/wiki/spring/spring-concurrency-resolve/#distributed-lock) Flow__:

![](/resource/wiki/architecture-idempotency-design/idempotency-lock-flow.png)

## Links

- [Idempotent REST API](https://restfulapi.net/idempotent-rest-apis/)
- [Implementing Stripe-like Idempotency Keys in Postgres](https://brandur.org/idempotency-keys)
- [Using Atomic Transactions to Power an Idempotent API](https://brandur.org/http-transactions)
- [Four Major Technologies Behind the Microservices Architecture](https://www.alibabacloud.com/blog/four-major-technologies-behind-the-microservices-architecture_596216)

## References

- [Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency)
