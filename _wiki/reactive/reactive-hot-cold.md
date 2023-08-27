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
        .share();

// "Freddie", "Bono", "Amy"
hotPublisher.subscribe(c -> log.info("Subscriber 1: " + c)); 

Thread.sleep(2000);

// "Kurt", "Jimi", "Janis", "Elvis"
hotPublisher.subscribe(c -> log.info("Subscriber 2: " + c));

Thread.sleep(3000);
```

두 번째 Subscriber(콘서트 관람객) 는 첫 번째 Subscriber 가 이미 받은 데이터를 받지 못한다.

## Links

- [Project Reactor HotCold](https://projectreactor.io/docs/core/release/reference/#reactor.hotCold)

## References

- Reactive Spring / JOSH LONG / STARBUXMAN
- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭