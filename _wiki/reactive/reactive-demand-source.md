---
layout  : wiki
title   : Demand, Source
summary : 
date    : 2023-08-18 15:05:32 +0900
updated : 2023-08-18 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Demand

Demand 는 '수요, 요구' 등의 의미를 갖고 있다. Reactive Streams 에서도 동일하다.

정확히 말하면, Publisher 가 아직 Subscriber 에게 전달하지 않은 Subscriber 가 요청한 데이터를 의미한다.

## Source

Reactive Programming 문서에서 등장하는 Source(or Original) 이라는 용어는 __'최초(원본)'__ 라는 의미를 가지고 있다.

```java
// Flux is Publisher
Flux<String> sequence = Flux.just("Hello", "Reactor");
sequence.map(data -> data.toLowerCase())
        .subscribe(data -> System.out.println(data));
// Subscriber is 'data -> System.out.println(data)'
```

"Hello", "Reactor" 가 Source 에 해당된다. __데이터 소스(data source)__ 라고도 한다.

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭
