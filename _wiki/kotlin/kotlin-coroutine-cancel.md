---
layout  : wiki
title   : Coroutine Cancel
summary : 
date    : 2023-09-11 20:54:32 +0900
updated : 2023-09-11 21:15:24 +0900
tag     : kotlin coroutine
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## How to cancel coroutine ?

### suspend function

코루틴을 취소시키기 위해서는 delay, yield 와 같은 __suspend__ 함수를 활용해야 한다.

```kotlin
fun main(): Unit = runBlocking {
    val job1 = launch {
        delay(1_000L)
        printWithThread("Job 1")
    }

    val job2 = launch {
        delay(1_000L)
        printWithThread("Job 2")
    }
    
    delay(500L)
    job1.cancel() // Job2 만 실행됨
}
```

job1 의 delay(10L) 과 같이 매우 낮게 설정된 경우에는 __취소 되기 전에 코루틴이 완료될 수 있다__.

```kotlin
fun main(): Unit = runBlocking {
    val job = launch {
        something() // 해당 함수에 delay 와 같은 suspend 메서드가 없는 경우
    }

    delay(500L)
    job.cancel() 
}
```

something() 함수에 suspend 메서드가 없기 때문에 취소가 되지 않는다.

### CancellationException

CancellationException 을 활용하면 코루틴을 취소 할 수 있다.

```kotlin
fun main(): Unit = runBlocking { // CoroutineScope
    printWithThread("START")

    // Dispatchers.Default - 다른 스레드에서 동작
    val job = launch(Dispatchers.Default) { // CoroutineScope
        for (i in 1..10) {
            printWithThread("Index - $i")

            // 현재 코루틴이 활성화 되었는지, 취소 신호를 받았는지 확인
            if (!isActive) {
                throw CancellationException()
            }

            Thread.sleep(500L)
        }

        println("${Thread.currentThread().name} -  Hello, World!")
    }

    delay(10L)
    job.cancel()
    printWithThread("END")
}
```

launch 에 Dispatchers.Default 를 넘겨줘서 별도의 스레드에서 동작하게 해야 한다. 그렇지 않으면 코루틴이 취소되지 않는다.

Dispatchers.Default 를 빼고 취소 시키려면, launch 내부에서 delay, yield 와 같은 suspend function 을 사용해줘야 한다.

CancellationException 은 __예외가 아니라 정상적인 취소로 간주__ 한다. 따라서, 부모 코루틴으로 전파되지 않으며, 다른 자식 코루틴들을 취소시키지 않는다.
