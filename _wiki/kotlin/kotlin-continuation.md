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

## Problems at Call Stack and Suspend Function

```kotlin
fun first() {
    val name = "Jungho"
    val job = "Server Engineer"
    second()
    return "$name:$job"
}
```

위 코드에서 first() 함수를 실행 시키면 Thread Stack 에 Local variables 들을 저장한 뒤 second() 함수를 call stack 에 올리게 된다. first -> second -> first 로 돌아오기 위해서는 first() 의 데이터를 어딘가 저장해야하는데 그 공간이 __Thread Stack__ 이다.

만약 여기서 suspend 를 이용하게 된다면, suspend 되는 순간 Thread 는 코루틴을 떠나게 된다. 즉, __Thread Local 을 Clear 시켜야 한다는 것__ 이다. first -> second -> first 로 넘어갈 때 first() 의 Local 정보와 같이 연속적으로 물고 가야만 하는 데이터들이 생기는데 이러한 문제를 해결하기 위해 Kotlin 은 [Continuation(연속성)](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/) 이라는 개념을 도입하였다. 

## Continuation

> Continuations represent the rest of a program. They are a form of control flow.

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

### Compile Time

Each time Kotlin finds a suspend function, that represents a suspension point that the compiler will desugarize into a callback style.

```kotlin
suspend fun doSomething() = "Done!"

suspend fun main() { doSomething() }
```

- __Show Kotlin Bytecode__

```java
// FileKt.java
public final class FileKt {
   @Nullable
   public static final Object doSomething(@NotNull Continuation $completion) {
      return "Done!";
   }

   @Nullable
   public static final Object main(@NotNull Continuation $completion) {
      Object var10000 = doSomething($completion);
      return var10000 == IntrinsicsKt.getCOROUTINE_SUSPENDED() ? var10000 : Unit.INSTANCE;
   }
   
   // ...
}
```

The key point here is how both __suspend functions have been converted into static functions__ that get the Continuation passed as an explicit argument. This is formally called [CPS(Continuation Passing Style)](https://en.wikipedia.org/wiki/Continuation-passing_style).

You can see how the main function needs to forward the $completion continuation to the doSomething() call.

### Continuation Interface

Continuation is associated with a suspension point. A continuation is the implicit parameter that the Kotlin compiler passes to any suspend function when compiling it

```kotlin
// Defined in kotlin.coroutines package
interface Continuation<in T> {
   abstract val context: CoroutineContext
   abstract fun resumeWith(result: Result<T>)
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

## Continuation Passing Style

In functional programming, continuation-passing style(CPS) is a style of programming in which control is passed explicitly in the form of a continuation. A function written in continuation-passing style takes an extra argument: an explicit "continuation"; i.e., a function of one argument.

- __Related Articles__
  - [Continuation Passing Style](https://devroach.tistory.com/149)

## Links

- [Kotlin Coroutines - KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
- [Kotlin Coroutine series - Continuation](https://github.com/tmdgusya/kotlin-coroutine-series/blob/main/chapter/CONTINUATION.md)
- [Kotlin CoroutineKR](https://github.com/hikaMaeng/kotlinCoroutineKR)
- [Kotlin Continuation - jorgecastillo](https://jorgecastillo.dev/digging-into-kotlin-continuations#:~:text=A%20continuation%20is%20the%20implicit%20parameter%20that%20the,val%20context%3A%20CoroutineContext%20abstract%20fun%20resumeWith%28result%3A%20Result%3CT%3E%29%20%7D)
- [How does continuation work in kotlin coroutine](https://stackoverflow.com/questions/73679497/how-does-continuation-work-in-kotlin-coroutine)

## References

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘