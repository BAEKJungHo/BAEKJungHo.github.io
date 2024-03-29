---
layout  : wiki
title   : Debugging in a Reactive World
summary : 
date    : 2023-09-24 15:05:32 +0900
updated : 2023-09-24 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Debugging

__Examples__:

```kotlin
fun main() {
    val seconds = LocalTime.now().second
    val source: Mono<Int>
    source = if (seconds % 2 == 0) {
        Flux.range(1, 10)
            .elementAt(5)
    } else if (seconds % 3 == 0) {
        Flux.range(0, 4)
            .elementAt(5)
    } else {
        Flux.just(1, 2, 3, 4)
            .elementAt(5)
    }

    source.block()
}
```

__Errors__:

![](/resource/wiki/reactive-debugging/error1.png)

### log operator 

log operator 를 활성화 시키면 다음과 같다.

```kotlin
fun main() {
    val seconds = LocalTime.now().second
    val source: Mono<Int>
    source = if (seconds % 2 == 0) {
        Flux.range(1, 10)
            .elementAt(5)
            .log("source A")
    } else if (seconds % 3 == 0) {
        Flux.range(0, 4)
            .elementAt(5)
            .log("source B")
    } else {
        Flux.just(1, 2, 3, 4)
            .elementAt(5)
            .log("source C")
    }

    source.block()
}
```

__Errors__:

```
21:21:48.728 [main] INFO source A -- | onSubscribe([Fuseable] MonoElementAt.ElementAtSubscriber)
21:21:48.730 [main] INFO source A -- | request(unbounded)
21:21:48.730 [main] INFO source A -- | onNext(6)
21:21:48.731 [main] INFO source A -- | onComplete()
```

log() operator 를 추가하면 추가한 지점의 Reactor Signal 을 출력한다.

### Activate Debug Mode

__Debug Mode 활성화__:
- Hooks.onOperatorDebug()


```kotlin
fun main() {
    Hooks.onOperatorDebug()
    val seconds = LocalTime.now().second
    val source: Mono<Int>
    source = if (seconds % 2 == 0) {
        Flux.range(1, 10)
            .elementAt(5)
            .log("source A")
    } else if (seconds % 3 == 0) {
        Flux.range(0, 4)
            .elementAt(5)
            .log("source B")
    } else {
        Flux.just(1, 2, 3, 4)
            .elementAt(5)
            .log("source C")
    }

    source.block()
}
```

__Errors__:

![](/resource/wiki/reactive-debugging/error2.png)

Debug Mode 를 활성화 시키면 Operator 체인상에서 에러가 발생한 지점을 정확히 가리킨다.

Hooks.onOperatorDebug() 는 __애플리케이션 내에 있는 모든 Operator 들의 stacktrace 를 캡처(capture)__ 하기 때문에 비용이 많이 든다.

__IntelliJ IDEA 에서 Reactor Sequence 활성화__:
- File > Settings
- Languages & Frameworks > Reactive Streams
- Debugger > Enable Reactor Debug Mode 는 체크 되어있고, Debug method initialization method 는 none
- Hooks.onOperatorDebug() 를 선택

### Checkpoint

```kotlin
fun main() {
    val seconds = LocalTime.now().second
    val source: Mono<Int>
    source = if (seconds % 2 == 0) {
        Flux.range(1, 10)
            .elementAt(5)
            .checkpoint("source range(1,10)")
    } else if (seconds % 3 == 0) {
        Flux.range(0, 4)
            .elementAt(5)
            .checkpoint("source range(0,4)")
    } else {
        Flux.just(1, 2, 3, 4)
            .elementAt(5)
            .checkpoint("source just(1,2,3,4)")
    }

    source.block()
}
```

__Errors__:

![](/resource/wiki/reactive-debugging/error3.png)

checkpoint 를 사용하면 __코드베이스의 특정 지점에서만 어셈블리 추적 캡처를 활성화할 수 있다__. 따라서 비용이 절감된다.

You can even do entirely without the filling of a stacktrace if you give the checkpoint a unique and meaningful name using checkpoint(String).

checkpoint 에 식별자를 포함하면 Traceback 을 생략하고 Description 을 통해 에러 발생 지점을 예상할 수 있다.

checkpoint(description, forceStackTrace) 를 통해서 Traceback 과 Description 을 모두 출력할 수 있다.

## Assembly

Operator 들은 Mono or Flux 를 리턴하며, 체인을 형성한다. [This declarative phase is called assembly time](https://spring.io/blog/2019/03/06/flight-of-the-flux-1-assembly-vs-subscription).

## Traceback

디버그 모드를 활성화하면 Operator 의 Assembly 정보를 캡처(capture)하는데 이중에서 에러가 발생한 Operator 의 stacktrace 를 캡처한 Assembly 정보를 Traceback 이라고 한다.

Traceback 은 [Suppressed Exceptions](https://www.baeldung.com/java-suppressed-exceptions) 형태로 원본 stacktrace 에 추가된다.

## Links

- [Flight of the Flux 2 - Debugging Caveats](https://spring.io/blog/2019/04/16/flight-of-the-flux-2-debugging-caveats)

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭
