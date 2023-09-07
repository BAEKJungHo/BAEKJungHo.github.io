---
layout  : wiki
title   : Job, Async, Deferred
summary : 
date    : 2023-09-05 20:54:32 +0900
updated : 2023-09-05 21:15:24 +0900
tag     : kotlin coroutine
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Job

Job 은 Coroutine 을 제어하는 역할을 담당한다.

## Async

async 의 반환 타입은 Deferred 이며, Job 을 상속받고 있다.

```kotlin
fun main(): Unit = runBlocking {
    val time = measureTimeMillis {
        val one: Deferred<Int> = async { call1() }
        val two: Deferred<Int> = async { call2() }
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms") // ex. Completed in 1017 ms
}

suspend fun call1(): Int {
    delay(1000L)
    return 1
}

suspend fun call2(): Int {
    delay(1000L)
    return 2
}
```

## Escape callback hell

```kotlin
fun main(): Unit = runBlocking {
    val time = measureTimeMillis {
        val one: Deferred<Int> = async { doSomethingUsefulOne() }
        val two: Deferred<Int> = async { doSomethingUsefulTwo(one.await()) }
        println("The answer is ${two.await()}")
    }
    println("Completed in $time ms") // ex. Completed in 2049 ms
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L)
    return 1
}

suspend fun doSomethingUsefulTwo(number: Int): Int {
    delay(1000L)
    return 2 + number
}
```

## CoroutineStart Lazy

CoroutineStart LAZY 옵션을 주게 되면 await() 을 호출했을때 계산 결과를 계속 기다린다.

```kotlin
fun main(): Unit = runBlocking {
    val time = measureTimeMillis {
        val one: Deferred<Int> = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two: Deferred<Int> = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms") // ex. Completed in 2049 ms
```

LAZY 옵션을 사용하더라도 start() 를 사용해주면 동시에 API 호출이 가능하다.

```kotlin
fun main(): Unit = runBlocking {
    val time = measureTimeMillis {
        val one: Deferred<Int> = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two: Deferred<Int> = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        
        one.start()
        two.start()
        
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms") // ex. Completed in 2049 ms
```