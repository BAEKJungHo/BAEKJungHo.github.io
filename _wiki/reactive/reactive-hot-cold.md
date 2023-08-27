---
layout  : wiki
title   : Hot, Cold Sequence
summary : 
date    : 2023-02-15 21:28:32 +0900
updated : 2023-02-15 22:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Meaning

__Cold: 무언가를 새로 시작함__

![](/resource/wiki/reactive-hot-cold/cold.png)

__Hot: 이미 시작된 것을 계속함__

![](/resource/wiki/reactive-hot-cold/hot.png)

## Cold Sequence

```java
Flux<String> coldPublisher = Flux
        .fromIterable(Arrays.asList("blue", "green", "orange", "purple"))
        .map(String::toUpperCase);

// This will only emit data when someone subscribes.
coldPublisher.subscribe(c -> System.out.println("Subscriber 1: " + c)); // BLUE, GREEN, ORANGE, PURPLE
coldPublisher.subscribe(c -> System.out.println("Subscriber 2: " + c)); // BLUE, GREEN, ORANGE, PURPLE
```

## Hot Sequence

```java
String[] singers = {"Freddie", "Bono", "Amy", "Kurt", "Jimi", "Janis", "Elvis"};

log.info("Begin Concert");

Flux<String> hotPublisher = Flux
        .fromArray(singers)
        .delayElements(Duration.ofSeconds(1))
        .share(); // Returns a new Flux that multicasts (shares) the original Flux.

// "Freddie", "Bono", "Amy"
hotPublisher.subscribe(c -> log.info("Subscriber 1: " + c)); 

Thread.sleep(2000);

// "Kurt", "Jimi", "Janis", "Elvis"
hotPublisher.subscribe(c -> log.info("Subscriber 2: " + c));

Thread.sleep(3000);
```

두 번째 Subscriber(콘서트 관람객) 는 첫 번째 Subscriber 가 이미 받은 데이터를 받지 못한다.

Multicast 의 의미는 여러 Subscriber 가 하나의 원본 Flux 를 공유한다는 의미다.

### Warmup and Hot

Hot Sequence 는 Warmup 과 Hot 으로 나뉜다.

- Subscriber 의 최초 구독이 발생했을때 데이터를 emit 하는 것을 warmup 이라고 한다.
- Subscriber 의 구독 여부와 상관 없이 데이터를 emit 하는 것을 hot 이라고 한다.

### cache operator

cache operator turn this Mono into hot source and cache last emitted signals for further subscribers.

```java
Mono<String> mono = getTokenAPICall().cache();
mono.subscribe(token -> log.info("Subscriber 1: " + token)); // API call
mono.subscribe(token -> log.info("Subscriber 2: " + token)); // Cached value
```

만약, cache() 같은 Hot Sequence 로 변환해주는 operator 를 사용하지 않아서 아래와 같이 구현했다면

```java
Mono<String> mono = getTokenAPICall();
```

Subscriber 1, 2 모두 API Call 을 하여 결과를 전달 받게 된다.

## Links

- [Project Reactor HotCold](https://projectreactor.io/docs/core/release/reference/#reactor.hotCold)

## References

- Reactive Spring / JOSH LONG / STARBUXMAN
- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭