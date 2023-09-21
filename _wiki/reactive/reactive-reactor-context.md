---
layout  : wiki
title   : Context
summary : 
date    : 2023-09-20 15:05:32 +0900
updated : 2023-09-20 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Context

Reactor 의 Context 는 스레드에 매핑되는 것이 아니라 __Subscriber__ 에 매핑 된다.
즉, 구독이 발생할 때마다 해당 구독과 연결된 하나의 Context 가 생긴다.

__Write__:

```kotlin
chain.filter()
    .contextWrite(Context.of(Contexts.MEMBER_ID, PK))
```

읽기의 경우에는 두 가지 방식이 있다.

1. 원본 데이터 소스 레벨에서 읽는 방식
2. Operator 체인 중간에서 읽는 방식

__Read__:

```kotlin
// 원본 데이터 소스 레벨에서 읽는 방식 -> deferContextual() Operator 사용
Flux.deferContextual { ctx ->
    // ContextView 를 통해서 데이터 읽기
    val memberId = ctx.getOrDefault(Contexts.MEMBER_ID, 0L)
    memberRepository.findById(memberId)
}
```

여기서 람다에 있는 ctx 파라미터는 __ContextView__ 타입이다. Context 에 데이터를 쓸 때는 Context 를 사용하지만
데이터를 읽을 때는 ContextView 를 사용한다.

Reactor 에서는 Operator Chain 간의 서로 다른 스레드들이 Context 에 저장된 데이터에 손쉽게 접근할 수 있다.
매번 context.put() 을 통해 데이터를 쓰고 __불변(immutable)__ 객체를 contextWrite() Operator 로 전달함으로써 Thread-safe 를 보장한다.

## Characteristics

- Context 는 구독이 발생할 때마다 하나의 Context 가 해당 구독에 연결된다.

```kotlin
mono.contextWrite(Context.of("key1", "TESLA"))
    .subscribe { value -> println("value: $value") }

mono.contextWrite(Context.of("key2", "HYUNDAI"))
    .subscribe { value -> println("value: $value") }
```

TESLA, HYUNDAI 가 하나의 Context 에 있을 것 같지만 위 특징으로 인해 각각의 구독에 연결된 Context 가 생기게 된다.

- Context 는 Operator 체인의 아래에서 위로 [전파(propagation)](https://projectreactor.io/docs/core/release/reference/#context.propagation) 된다. 
- 동일한 키에 대한 값을 중복해서 저장하면 Operator 체인에서 가장 위쪽에 위치한 contextWrite() 저장한 값으로 덮어쓴다.

아래에서 위로 전파되기 때문에, 모든 Operator 에서 저장된 데이터를 읽을 수 있도록 contextWrite() 을 Chain 의 가장 마지막에 둔다.

```java
Mono.deferContextual(ctx -> Mono.just(ctx.get(key1)))
    .publishOn(Schedulers.parallel())
    .contextWrite(Context.of(key1, "TESLA"))
    .transformDeferredContextual((mono, ctx) -> mono.map(value -> ctx.getOrDefault(key1, "HYUNDAI")))
    .contextWrite(ctx -> ctx.put(key1, "GOOGLE"))
    .subscribe(value -> System.out.println("value: " + value));

Thread.sleep(1000L);
```

- Inner Sequence 내부에서는 외부 Context 에 저장된 데이터를 읽을 수 있다.
- Inner Sequence 외부에서는 Inner Sequence 에서 저장한 데이터를 읽을 수 없다.

## When use Context ?

인증 정보 같은 직교성(독립성)을 가지는 정보를 전송하는데 적합하다.

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭
