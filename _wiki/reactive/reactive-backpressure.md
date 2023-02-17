---
layout  : wiki
title   : Backpressure
summary : 
date    : 2022-09-01 21:28:32 +0900
updated : 2022-09-01 22:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Backpressure

> Backpressure in software systems is the capability to overload the traffic communication.

- __Problems__
  - Publisher 는 1초에 10k 만큼의 event 를 생성
  - Subscriber 는 1초에 8k 만큼의 event 를 소비
  - 이런 현상이 지속된다면 시스템에 문제가 생김
  - 이런 현상을 예방하기 위한 수단이 Backpressure 임 
- __Concepts__
  - Backpressure goal is to feed the data to subscribers at the rate at which they can reliably deal with that data
  - In Reactive Streams, backpressure also defines how to regulate the transmission of stream element
    - control how many elements the recipient can consume

### Controlling Backpressure

- __Pull Strategy__
  - Subscriber 가 요청할 때만 이벤트를 보냄
- __Limited push strategy__
  - 클라이언트 측에서 수신할 이벤트 수를 제한
- Subscriber 가 더 이상 이벤트를 처리할 수 없을 때 데이터 스트리밍을 취소
- Backpressure handling with a mix of a buffer, and a pull-push hybrid approach
  - Spring Webflux 내에서 [Project Reactor](https://projectreactor.io/docs/core/release/reference/#reactive.backpressure) 가 Backpressure 를 담당
  - ![](/resource/wiki/spring-backpressure/backpressure-handling.png)

### Subscription Specification

__The [Reactive Streams](https://baekjungho.github.io/wiki/reactive/reactive-streams-specification/) Subscription interface:__

```java
package org.reactivestreams;

public interface Subscription {
  public void request(long n);
  public void cancel();
}
```

The request method of the __Subscription interface in the Reactive Streams specification is used to implement backpressure__.

Backpressure is a technique used in reactive programming to prevent overwhelming a downstream component with more data than it can handle. In a reactive system, a publisher produces data, and a subscriber consumes the data. If the publisher produces data faster than the subscriber can consume it, the subscriber can become overloaded, causing problems like increased memory usage, slower performance, or even crashes.

To avoid this, the Reactive Streams specification provides a mechanism for the subscriber to request a certain amount of data from the publisher at a time. This is done using the request method of the Subscription interface. When the subscriber is ready to receive more data, it calls the request method with the number of elements it wants to receive. The publisher then sends that number of elements to the subscriber, which can process them at its own pace. Once the subscriber has processed the requested amount of data, it can call request again to request more data.

By using the request method to control the flow of data, the subscriber can prevent itself from being overwhelmed with data, and the publisher can avoid sending more data than the subscriber can handle. This helps ensure that the system is stable, performs well, and avoids problems like memory leaks or other resource constraints.

## Links

- [Backpressure explained — the resisted flow of data through software](https://medium.com/@jayphelps/backpressure-explained-the-flow-of-data-through-software-2350b3e77ce7)
- [Spring Webflux backpressure - baeldung](https://www.baeldung.com/spring-webflux-backpressure)
- [Backpressure mechanism in Spring Web-Flux - stackoverflow](https://stackoverflow.com/questions/52244808/backpressure-mechanism-in-spring-web-flux)
- [Webflux 공부하자 1편 - nurinamu](https://www.nurinamu.com/dev/2020/04/09/why-webflux-1/)
- [Spring’s WebFlux / Reactor Parallelism and Backpressure](https://www.e4developer.com/2018/04/28/springs-webflux-reactor-parallelism-and-backpressure/)
- [On Backpressure and Ways to Reshape Requests](https://projectreactor.io/docs/core/release/reference/#_on_backpressure_and_ways_to_reshape_requests)