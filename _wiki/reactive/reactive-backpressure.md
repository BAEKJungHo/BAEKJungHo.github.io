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

## Downstream Consumer

데이터를 처리하는 것은 Subscriber 에게 국한되지 않는다. Upstream Publisher 로 부터 데이터를 전달 받아서 처리하는 Downstream Publisher 도 해당된다.
Downstream Publisher 를 Downstream Consumer 라고도 한다.

## Controlling Number Of Data

Subscriber 가 적절히 처리할 수 있는 수준의 데이터 개수를 request 메서드를 통해 Publisher 에게 전달한다.

```java
Flux.range(1, 5)
        .doOnRequest(n -> System.out.println("Request " + n + " values..."))
        .subscribe(new BaseSubscriber<Integer>() {
            @Override
            protected void hookOnSubscribe(Subscription subscription) {
                System.out.println("Subscribed and make a request...");
                request(1); // 구독 시점에 최초의 데이터 요청 개수 제어
            }

            @Override
            protected void hookOnNext(Integer value) {
                System.out.println("Get value [" + value + "]");
                request(1); // Publisher 에게 데이터를 전달 받아 처리한 후에 Publisher 에게 또 다시 데이터를 요청
            }
        });
```

## Backpressure Strategies

- __Buffering__
  - Downstream 으로 전달할 데이터가 버퍼에 가득 찰 경우, 버퍼 안에 있는 데이터부터 drop 시키는 전략
  - __DROP_LATEST 전략__
    - Downstream 으로 전달할 데이터가 버퍼에 가득 찰 경우, 가장 최근에(나중에) 버퍼 안에 채워진 데이터를 Drop 하여 폐기한 후, 확보된 공간에 emit 된 데이터를 채우는 전략
    - 1부터 10까지 의 데이터가 Buffer 에 가득차있는 상황에서 11이 emit 되면 11이 dropped 되는 전략
  - __DROP_OLDEST 전략__
    - Downstream 으로 전달할 데이터가 버퍼에 가득 찰 경우, 가장 오래전에(먼저) 버퍼 안에 채워진 데이터를 Drop 하여 폐기한 후, 확보된 공간에 emit 된 데이터를 채우는 전략
    - 1부터 10까지 의 데이터가 Buffer 에 가득차있는 상황에서 11이 emit 되면 1이 dropped 되고 11이 채워지는 전략
- __Dropping__
  - Downstream 으로 전달할 데이터가 버퍼에 가득 찰 경우, 버퍼 밖에서 대기하는 먼저 emit 된 데이터부터 drop 시키는 전략
- __Latest__
  - Downstream 으로 전달할 데이터가 버퍼에 가득 찰 경우, 버퍼 밖에서 대기하는 가장 최근에(나중에) emit 된 데이터부터 버퍼에 채우는 전략
- __Error__
  - 버퍼가 가득 차면 Subscriber 에게 에러를 전달
  - Downstream 의 데이터 처리 속도가 느려서 Upstream 의 emit 속도를 따라가지 못할 경우 IllegalStateException 발생. Publisher 가 Error signal 을 Subscriber 에게 전달
- __Ignore__
  - Backpressure 를 사용하지 않음
  - IllegalStateException 발생 가능성 있음

```java
Flux.interval(Duration.ofMillis(1L))
        .onBackpressureError()
        .doOnNext(data -> log.info("emit: {}", data)) // Publisher 가 emit 한 데이터 확인
        .publishOn(Schedulers.parallel())
        .subscribe( ... )
```

## Links

- [Backpressure explained — the resisted flow of data through software](https://medium.com/@jayphelps/backpressure-explained-the-flow-of-data-through-software-2350b3e77ce7)
- [Spring Webflux backpressure - baeldung](https://www.baeldung.com/spring-webflux-backpressure)
- [Backpressure mechanism in Spring Web-Flux - stackoverflow](https://stackoverflow.com/questions/52244808/backpressure-mechanism-in-spring-web-flux)
- [Webflux 공부하자 1편 - nurinamu](https://www.nurinamu.com/dev/2020/04/09/why-webflux-1/)
- [Spring’s WebFlux / Reactor Parallelism and Backpressure](https://www.e4developer.com/2018/04/28/springs-webflux-reactor-parallelism-and-backpressure/)
- [On Backpressure and Ways to Reshape Requests](https://projectreactor.io/docs/core/release/reference/#_on_backpressure_and_ways_to_reshape_requests)

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭