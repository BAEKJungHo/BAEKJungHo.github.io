---
layout  : wiki
title   : Testing in a Reactive World
summary : 
date    : 2023-09-25 15:05:32 +0900
updated : 2023-09-25 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Testing

[Reactor Core Test Examples](https://github.com/reactor/reactor-core/tree/main/reactor-core/src/test) 와 [reactor-test/test](https://github.com/reactor/reactor-core/tree/main/reactor-test/src/test) 를 통해서 다양한 테스트 방법을 확인할 수 있다.


__[StepVerifier](https://projectreactor.io/docs/test/release/api/reactor/test/StepVerifier.html)__ 를 사용하여 Operator 를 테스트할 수 있다.

```java
StepVerifier.create(
         Flux.just(1, 2, 3, 4, 5), stepVerifierOptions.create().scenarioName("test"))
    .expectSubscription()
    .as("# expect subscription") // 이전 expect 에 대한 description
    .expectNext(1, 2, 3, 4, 5)
    .verifyComplete();
```

### Time based Test

```java
StepVerifier
        .withVirtualTime(() -> service.getMemberCount(Flux.interval(Duration.ofHours(1)).take(1))) // Sequence
        .expectSubscription()
        .then(() -> VirtualTimeScheduler.get().advanceTimeBy(Duration.ofHours(1)))
        .expectNext(11)
        .expectComplete()
        .verify();
```

현재 시점에서 1시간 뒤의 회원 수를 count 하려는데, 1시간을 기다리는 것은 비효율적이다. VirtualTimeScheduler 의 advanceTimeBy 를 사용하여 1시간 앞당길 수 있다.

### Backpressure Test

thenConsumeWhile 을 통해서 Backpressure 테스트를 할 수 있다.

```java
public static Flux<Integer> generateNumbers() {
        FLux.create(emitter -> {
            for (int i = 0; i < 100; i++) {
                emitter.next(i);
            }
        emitter.complete();
        }, FluxSink.OverflowStrategy.ERROR); // Overflow 발생하면 OverflowException 발생
    }
}

@Test
void generateNumbersTest() { 
    StepVerifier.create(generateNumbers(), 1L) // 데이터 요청 개수를 1로 지정해서 Overflow 발생
        .thenConsumeWhile(i -> i >= 1)
        .verifyComplete();
}
```

### Context Test

[Reactor ContextTests](https://github.com/reactor/reactor-core/blob/main/reactor-core/src/test/java/reactor/core/publisher/ContextTests.java)

```java
StepVerifier.create(...)
        .expectSubscription()
        .expectAccessibleContext()
        .hasKey("key")
        .hasKey("Authorization")
        .then()
        .expectNext(...)  
        .expectComplete()
        .verify();
```

### Record Based Test

Reactor Sequence 를 테스트할 때 emit 된 데이터의 단순 기댓값만 평가하는게 아니라 더 구체적으로 테스트 해야할 수도 있다.
이 때, __recordWith__ 을 사용하여 테스트하면 된다. recordWith 은 파라미터로 전달한 Java 의 컬렉션에 emit 된 데이터를 추가(기록)하는 세션을 시작한다.

```java
StepVerifier.create(Flux.just(1, 2, 3, 4, 5)
        .recordWith(ArrayList::new)
        .thenConsumeWhile(i -> i >= 1)
    .expectNextCount(5)
    .consumeRecordedWith(list -> {
        assertThat(list).containsExactly(1, 2, 3, 4, 5);
    })
    .verifyComplete();
```

## Links
- [Reactor Core Testing](https://godekdls.github.io/Reactor%20Core/testing/)
- [Testing Reactive Streams Using StepVerifier and TestPublisher](https://www.baeldung.com/reactive-streams-step-verifier-test-publisher)
- [Backpressure Mechanism in Spring WebFlux](https://www.baeldung.com/spring-webflux-backpressure)

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭
