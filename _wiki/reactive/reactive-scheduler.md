---
layout  : wiki
title   : Scheduler
summary : 
date    : 2023-09-19 15:05:32 +0900
updated : 2023-09-19 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Scheduler

Reactor 에서 Scheduler 는 스레드를 관리해주는 역할을 담당한다. 

Scheduler 전용 Operator 에는 subscribeOn, publishOn, parallel 메서드가 있다.

### subscribeOn

subscribeOn 은 구독이 발생한 직후 실행될 스레드를 지정한다. __원본 Publisher 의 동작을 처리하기 위한 스레드를 할당__ 한다.

__Examples__:

```kotlin
fun main() {
    Flux.fromArray(arrayOf(1, 2, 3, 4, 5)) // 원본 Publisher = 원본 Flux
        .subscribeOn(Schedulers.boundedElastic())
        .doOnNext { i: Int -> printWithThread("# doOnNext: $i") } // emit 되는 데이터 로깅
        .doOnSubscribe { i: Subscription ->
            printWithThread(
                "# doOnSubscribe: $i"
            )
        }
        .subscribe { i: Int -> printWithThread("# onNext: $i") }
    Thread.sleep(1000L)
}
```

__Outputs__:

```
main - # doOnSubscribe: reactor.core.publisher.FluxPeek$PeekSubscriber@6a1aab78
boundedElastic-1 - # doOnNext: 1
boundedElastic-1 - # onNext: 1
boundedElastic-1 - # doOnNext: 2
boundedElastic-1 - # onNext: 2
boundedElastic-1 - # doOnNext: 3
boundedElastic-1 - # onNext: 3
boundedElastic-1 - # doOnNext: 4
boundedElastic-1 - # onNext: 4
boundedElastic-1 - # doOnNext: 5
boundedElastic-1 - # onNext: 5
```

doOnSubscribe 는 구독이 발생한 시점에 추가적인 작업을 실행할 수 있다.

doOnSubscribe 시 로그에 찍히는 스레드는 main 이다. (최초 실행 스레드가 main) 그 이후부턴 subscribeOn 을 통해 원본 Publisher 를 처리할 스케줄러를 지정하였기 때문에
boundedElastic 으로 로그에 찍히게 된다.

### publishOn

publishOn Operator 는 Downstream 으로 Signal 을 전송할 때 실행되는 스레드를 제어하는 역할을 하는 Operator 라고 할 수 있다.

__Examples__:

```kotlin
fun main() {
    Flux.fromArray(arrayOf(1, 2, 3, 4, 5)) // 원본 Publisher = 원본 Flux
        .doOnNext { i: Int -> printWithThread("# doOnNext: $i") } // emit 되는 데이터 로깅
        .doOnSubscribe { i: Subscription ->
            printWithThread(
                "# doOnSubscribe: $i"
            )
        }
        .publishOn(Schedulers.parallel()) // Downstream 으로 emit 하는 스레드를 변경
        .subscribe { i: Int -> printWithThread("# onNext: $i") }
    Thread.sleep(1000L)
}
```

__Outputs__:

```
main - # doOnSubscribe: reactor.core.publisher.FluxPeekFuseable$PeekFuseableSubscriber@76a3e297
main - # doOnNext: 1
main - # doOnNext: 2
main - # doOnNext: 3
main - # doOnNext: 4
main - # doOnNext: 5
parallel-1 - # onNext: 1
parallel-1 - # onNext: 2
parallel-1 - # onNext: 3
parallel-1 - # onNext: 4
parallel-1 - # onNext: 5
```

publishOn 을 통해 __Downstream 으로 emit 하는 스레드를 변경__ 하였다. 이 사실이 중요하다.

publishOn 을 여러개 사용하는 경우, publishOn 을 기준으로 사용되는 스레드가 변경된다.

### parallel

subscribeOn 과 publishOn 은 동시성을 가지는 논리적인 스레드에 해당되고, parallel 은 물리적인 스레드에 해당된다.
__parallel 은 Round-Robin 방식으로 CPU 코어 개수 만큼의 스레드를 병렬로 실행__ 한다.

여기서 "CPU 코어 개수 만큼의 스레드란" __논리적인 코어__ 의 개수를 의미한다. CPU 에서 1개의 물리적인 코어는 2개의 논리적인 코어를 갖는다.
이 2개의 논리적인 코어를 __물리적인 thread__ 라고 한다.

__Examples__:

```kotlin
fun main() {
    Flux.fromArray(arrayOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)) // 원본 Publisher = 원본 Flux
        .parallel() // CPU 의 논리적인 코어(물리적인 스레드) 수에 맞게 작업을 골고루 분배
        .runOn(Schedulers.parallel()) // 실제로 작업을 수행할 스레드 할당을 담당
        .subscribe { i: Int -> printWithThread("# onNext: $i") }
    Thread.sleep(1000L)
}
```

__Outputs__:

```
parallel-1 - # onNext: 1
parallel-5 - # onNext: 5
parallel-6 - # onNext: 6
parallel-7 - # onNext: 7
parallel-1 - # onNext: 9
parallel-4 - # onNext: 4
parallel-2 - # onNext: 2
parallel-2 - # onNext: 10
parallel-8 - # onNext: 8
parallel-3 - # onNext: 3
```

만약 runOn Operator 를 주석처리하면 병렬 처리가 적용되지 않고, main 스레드 위에서 처리되는 것을 볼 수 있다.

CPU 의 논리적인 코어 수(물리적인 Thread 수)에 맞게 데이터를 그룹화 한 것을 Reactor 에서는 __rail__ 이라고 한다.

## Kinds

__Schedulers.immediate()__:
- 별도의 스레드를 추가 생성하지 않고 현재 스레드에서 작업을 처리할 때 사용

__Schedulers.single()__:
- 단일 스레드를 내에서 처리할 때 사용
- 하나의 스레드를 재사용하여 작업을 처리하기 때문에 __지연 시간이 짧은 작업__ 을 처리하는데 좋음

__Schedulers.newSingle()__:
- 호출 시 마다 새로운 스레드를 하나 생성
- 두 번째 인자에 데몬 스레드(demon thread)로 동작하게 할지 여부를 정할 수 있음
  - 데몬 스레드는 주 스레드가 종료되면 자동으로 종료됨

__Schedulers.boundedElastic()__:
- ExecutorServicd 기반의 스레드 풀을 생성한 후, 그 안에서 정해진 수 만큼의 스레드를 사용하고 작업을 처리, 처리 후에는 스레드 반납
- 스레드 풀의 크기는 CPU 코어 수에 따라 자동으로 설정됨 (CPU 코어 수 * 10)
- 대기 가능한 스레드는 최대 100,000 개 이며 큐에서 대기함
- HTTP 요청 같은 실행 시간이 긴 Blocking I/O 작업에 효과적

__Schedulers.parallel()__:
- Non-Blocking I/O 작업에 효과적
- CPU 의 논리적인 코어(물리적인 스레드) 수에 맞게 작업을 분배

__Schedulers.fromExecutorService()__:
- 기존에 사용 중인 ExecutorService 가 있다면 ExecutorService 로 부터 Scheduler 생성

## Summary

- subscribeOn 은 원본 Publisher 의 동작을 처리하기 위한 스레드를 할당한다.
- publishOn 은 Downstream 으로 emit 하는 스레드를 변경한다.
- publishOn 은 한 개 이상 사용할 수 있다.
- subscribeOn 과 publishOn 을 적절하게 사용하면 emit 하는 스레드와 emit 된 데이터를 처리하는 스레드를 분리할 수 있다.
- parallel 은 CPU 의 논리적인 코어(물리적인 스레드) 수에 맞게 작업을 골고루 분배한다.

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭
