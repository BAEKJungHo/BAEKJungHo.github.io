---
layout  : wiki
title   : Continuation Passing Style
summary : 
date    : 2022-12-16 20:54:32 +0900
updated : 2022-12-16 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Continuation

유보지점(suspension point) 에서의 코루틴 상태다. 개념적으로는 중지점 이후의 실행을 나타낸다.

```kotlin
sequence {
  for (i in 1..10) yield(i * i)
  println("over")
}
```

위의 예에서 yield 를 호출할 때마다 실행을 유보한다. 남은 실행을 continuation 으로 표현하므로 10개의 컨티뉴에이션을 갖게 된다.
첫번째 루프에서 i = 2인 곳에서 유보하고 두 번째 실행에서는 i = 3일 때 유보한다. 마지막에 이르러 "over"를 출력하면 컨티뉴에이션은 완료된다.

- The coroutine that is created, but is not started yet, is represented by its initial continuation of type `Continuation<Unit>` that consists of its whole execution.
    - 코루틴이 생성되면 시작되기 전에 컨티뉴에이션을 초기화하며 이때 타입은 Continuation 이 된다. 이 컨티뉴에이션이 전체 실행을 구성하게 된다.

### Continuation Interface

- Defined in kotlin.coroutines package

```kotlin
interface Continuation<in T> {
   val context: CoroutineContext
   fun resumeWith(result: Result<T>)
}
```

## CoroutineContext

> Defines a scope for new coroutines. Every coroutine builder (like launch, async, etc.) is an extension on CoroutineScope and inherits its coroutineContext to automatically propagate all its elements and cancellation.

```kotlin
interface CoroutineScope
```

프로퍼티로는 CoroutineContext 를 가지고 있다.

```kotlin
abstract val coroutineContext: CoroutineContext
```

사실 CoroutineScope 는 CoroutineContext 를 coroutine builder(Ex. launch 등) 확장 함수 내부에서 사용하기 위한 매개체 역할만을 담당한다.

> CoroutineContext - Persistent context for the coroutine. It is an indexed set of Element instances. An indexed set is a mix between a set and a map. Every element in this set has a unique Key.

CoroutineContext 는 Element 와 Key 라는 두 가지 타입이 있다.

> Element - An element of the CoroutineContext. An element of the coroutine context is a singleton context by itself.
>
> Key - Key for the elements of CoroutineContext. E is a type of element with this key.

CoroutineContext 는 실제로 코루틴이 실행 중인 여러 작업(Job 타입)과 디스패처를 저장하는 `Persistence Context` 라고 할 수 있다. 코틀린 런타임은 CoroutineContext 를 사용해서 다음에 실행할 작업을 선정하고, 어떻게 스레드에 배정할지에 대한 방법을 결정한다.

```kotlin
launch { // 부모 컨텍스트를 사용
    
}

launch(Dispatchers.Unconfined) { // 특정 스레드에 종속되지 않음. 메인 스레드 사용
    
}

launch(Dispatchers.Default) { // 기본 디스패처 사용
    
}

launch(newSingleThreadContext("Async-Thread")) { // 새 스레드를 사용
    
}
```

같은 launch 를 사용하더라도 전달하는 컨텍스트에 따라 서로 다른 스레드 상에서 코루틴이 실행된다.

## Links

- [Kotlin Coroutines - KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
- [Kotlin Coroutine series](https://github.com/tmdgusya/kotlin-coroutine-series)
- [Kotlin CoroutineKR](https://github.com/hikaMaeng/kotlinCoroutineKR)

## References

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘