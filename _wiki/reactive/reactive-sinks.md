---
layout  : wiki
title   : Sinks
summary : 
date    : 2023-09-17 15:05:32 +0900
updated : 2023-09-17 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Sinks

Sinks are constructs through which Reactive Streams signals can be programmatically pushed, with Flux or Mono semantics.

Flux or Mono 가 onNext 같은 [Signal](https://baekjungho.github.io/wiki/reactive/reactive-signal/)을 전송하는 방식은 __내부적__ 으로 전송해주는 방식이다.

반면, Sinks 를 사용하면 프로그래밍 코드를 통해 명시적으로 Signal 을 전송할 수 있다.

Sinks 를 사용하지 않고 프로그래밍 방식으로 Signal 을 전송하려면 generate(), create() 같은 Operator 를 사용해야 한다. Operator 에 비해 Sinks 가 갖는 장점은 __Thread Safety__ 하다는 것이다.
즉, 멀티 스레드 방식으로 Signal 을 전송해도 스레드 안정성이 보장된다.

__스레드 안정성(Thread-Safety)__ 이란 공유 자원에 동시에 접근해도 프로그램 실행에 문제가 없는 것을 의미한다.

### How to ensure Thread Safety ?

__EmitFailureHandler__:

![](/resource/wiki/reactive-sinks/emitfailurehandler.png)

FAIL_FAST(구현체)를 사용하면 emit 도중 발생한 에러에 대해서 빠르게 실패 처리를 한다. 즉, __재시도를 하지 않고 즉시 실패 처리__ 를 한다.
이러한 전략 덕분에 교착 상태를 미연에 방지하고 스레드 안정성을 보장 받을 수 있다.

### Characteristics

__Sinks.One__:
- 한 건의 데이터를 전송할 때 사용

```java
Sinks.One<String> sink = Sinks.one();
Mono<String> mono = sink.asMono();
sink.emitValue("Hello", EmitFailureHandler.FAIL_FAST);
mono.subscribe(System.out::println);
```

sink.asMono() 코드 처럼 Mono 로 변환할 수 있다는 것이 Sinks 가 __Mono 의 의미 체계를 가진다(with Mono semantics)__ 라고 표현한다.

만약 emitValue 를 통해서 추가 데이터를 더 전송하려고하면 __onNextDropped__ 가 로그에 출력되면서 첫 번째 emit 된 데이터 외에는 drop 된다.

__Sinks.Many__:
- 다 건의 데이터를 전송할 때 사용

![](/resource/wiki/reactive-sinks/manyspec.png)

- UnicastSpec 은 단 하나의 Subscriber 에게만 데이터를 emit 함
- MulticastSpec 은 여러 Subscriber 에게 데이터를 emit 함
- MulticastReplaySpec 은 emit 된 데이터 중에서 특정 시점으로 되돌린(replay) 데이터부터 emit 함
  - replay 는 MP3 replay 와 같이 다시 재생이라고 생각하면 된다.

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭
