---
layout  : wiki
title   : Exception Handling in Kotlin Coroutine
summary : 
date    : 2023-09-13 20:54:32 +0900
updated : 2023-09-13 21:15:24 +0900
tag     : kotlin coroutine
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Exceptions according to Coroutine Scope

__별도의 Root CoroutineScope 를 가지는 Coroutine 에서 예외를 throw 하는 경우__:

```kotlin
fun main(): Unit = runBlocking { // Root CoroutineScope 1
    printWithThread("START")
    
    // CoroutineScope 를 사용하면 runBlocking 과의 별개의 root scope 를 갖는다.
    CoroutineScope(Dispatchers.IO).launch { // Root CoroutineScope 2
        printWithThread("IO Thread Start")
        throw IllegalArgumentException()
        printWithThread("IO Thread End")
    }
    
    delay(1000L)
    printWithThread("END")
}
```

위 결과는 실제로 예외가 출력되며 종료된다. launch 대신 async 를 사용하는 경우에는 jog 타입이 Deferred 이므로 await() 을 호출해야 예외가 발생 한다.

__부모(Root) CoroutineScope 를 가지는 Coroutine 에서 예외를 throw 하는 경우__:

```kotlin
fun main(): Unit = runBlocking { // Root CoroutineScope
    printWithThread("START")
    
    launch { // CoroutineScope
        printWithThread("IO Thread Start")
        throw IllegalArgumentException()
        printWithThread("IO Thread End")
    }
    
    delay(1000L)
    printWithThread("END")
}
```

자식 코루틴에서 발생한 예외는 부모 코루틴에게 __전파(propagation)__ 된다. 따라서, launch 든, async 든 예외를 내뱉고 종료된다. 이때 async 는 await 을 호출하지 않아도 예외가 발생한다.

async 를 사용하는 경우 SupervisorJob() 을 인자로 주게되면 await 을 사용해야 예외가 발생한다.

```kotlin
async(SupervisorJob()) {
    throw IllegalArgumentException()
}
```

## How to Exception Handling in Coroutine ?

__try-catch__:

```kotlin
fun main(): Unit = runBlocking {
    launch {
        try {
            throw IllegalArgumentException()
        } catch (e: Exception) {
            printWithThread("Catching Exception")
        }
    }
}
```

__[CoroutineExceptionHandler](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/test/guide/example-exceptions-06.kt)__:
- Exception 발생 이후 로깅, 예외 메시지 전송에 유용하다.
- launch 에만 적용 가능하며 부모 코루틴이 있으면 동작하지 않는다.

```kotlin
@OptIn(DelicateCoroutinesApi::class)
fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, exception ->
        println("CoroutineExceptionHandler got $exception")
    }
    
    val job = GlobalScope.launch(handler) {
        val inner = launch { // all this stack of coroutines will get cancelled
            launch {
                launch {
                    throw IOException() // the original exception
                }
            }
        }

        try {
            inner.join()
        } catch (e: CancellationException) {
            println("Rethrowing CancellationException with original cause")
            throw e // cancellation exception is rethrown, yet the original IOException gets to the handler
        }
    }

    job.join()
}
```

__Outputs__:

```
Rethrowing CancellationException with original cause
CoroutineExceptionHandler got java.io.IOException
```

## How Coroutines Distinguish Exceptions

- __CancellationException__
  - 코루틴을 취소로 간주한다. 예외를 부모로 전파하지 않는다. 
- __Other Exceptions__
  - 예외로 간주한다. 부모로 전파한다.

__State Machine__:
- NEW -> ACTIVE -> CANCELLING -> CANCELLED

여기서 `CANCELLING` 을 두는 이유는 ChatGPT 피셜 다음과 같다고 한다. 

- __Graceful Shutdown__: 코루틴은 일부 작업을 수행하고 있는 중에 취소 요청을 받을 수 있습니다. CANCELLING 상태를 사용하면 이러한 작업을 완료한 후에 코루틴을 취소할 수 있으며, 그동안 다른 리소스를 정리하고 정리 작업을 수행할 수 있습니다.
- __Cleanup and Resource Release__: 코루틴이 CANCELLING 상태에 있을 때, 리소스를 해제하거나 정리할 수 있습니다. 이는 예를 들어 열린 파일이나 네트워크 연결을 닫는 등의 작업을 수행할 때 유용합니다.
- __Progress Monitoring__: CANCELLING 상태를 사용하여 얼마나 많은 작업이 완료되었는지 또는 얼마나 많은 작업이 취소되었는지를 추적하고 모니터링할 수 있습니다.