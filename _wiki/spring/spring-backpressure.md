---
layout  : wiki
title   : Backpressure
summary : Spring Web-Flux Backpressure Mechanism
date    : 2022-09-01 21:28:32 +0900
updated : 2022-09-01 22:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
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

## Links

- [Spring Webflux backpressure - baeldung](https://www.baeldung.com/spring-webflux-backpressure)
- [Backpressure mechanism in Spring Web-Flux - stackoverflow](https://stackoverflow.com/questions/52244808/backpressure-mechanism-in-spring-web-flux)
- [Webflux 공부하자 1편 - nurinamu](https://www.nurinamu.com/dev/2020/04/09/why-webflux-1/)
- [Spring’s WebFlux / Reactor Parallelism and Backpressure](https://www.e4developer.com/2018/04/28/springs-webflux-reactor-parallelism-and-backpressure/)
- [On Backpressure and Ways to Reshape Requests](https://projectreactor.io/docs/core/release/reference/#_on_backpressure_and_ways_to_reshape_requests)