---
layout  : wiki
title   : Blocking NonBlocking Synchronous Asynchronous
summary : I/O Models
date    : 2023-03-18 15:05:32 +0900
updated : 2023-03-18 15:15:24 +0900
tag     : reactive 
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Simplified matrix of basic Linux I/O models

![](/resource/wiki/reactive-asycn-nonblokcing/matrix.png)

관심사가 무엇인지를 중심으로 보는것이 이해하는데 도움이 된다.

- Sync, Async 는 __작업 완료 여부__ 를 누가 신경 쓰는지
  - 호출하는 함수가 호출된 함수로부터 리턴을 기다리거나 혹은 바로 리턴 받더라도 작업 완료 여부를 계속 신경 쓴다면 Synchronous 이다.
- Blocking, NonBlocking 은 __제어권__ 을 바로 넘겨주는지, 아닌지.

## Synchronous Blocking I/O

Synchronous 와 Blocking 을 따로 비교하면 코드는 다를 수 있더라도 그래프의 모양은 똑같다. 아래 그림은 Sync + Blocking 조합의 그림이다.

![](/resource/wiki/reactive-asycn-nonblokcing/syncblocking.png)

__Synchronous:__

```kotlin
fun synchronousFunction() {
    println("Step 1")
    println("Step 2") 
    println("Step 3")
}
```

각기 다른 println() 은 서로의 작업 완료 여부를 신경쓰지 않는다.

__Blocking:__

```kotlin
fun blockingFunction() {
    Thread.sleep(5000) // blocks for 5 seconds
    println("Finished blocking function")
}

// calling blockingFunction will block for 5 seconds and then output:
// Finished blocking function
```

Blocking 코드를 보자. 예를 들어 Thread.sleep(5000) 라는 작업이 I/O 작업이라면 I/O 작업을 처리하기 위해서 __제어권__ 이 넘어간 상태라고 할 수 있다. 그리고 5초뒤에 제어권을 돌려준다. Scanner 도 Blocking 의 한 예이다. 개발자가 직접 값을 입력하기 전까지 제어권이 넘어간 상태이다.

## Synchronous Non-Blocking I/O

![](/resource/wiki/reactive-asycn-nonblokcing/sycnnonblocking.png)

1. I/O 작업을 Non-Blocking 방식으로 요청한다. 그러면 호출 당하는 쪽에서 바로 제어권을 넘겨준다.
2. 호출한 함수에서는 제어권을 받았으니 다른 일을 할 수 있다.
3. 하지만 호출 당하는 쪽 함수의 작업이 끝났는지 끝나지 않았는지 계속해서 확인해야한다. (마치 Polling)

Sync + NonBlocking 은 NonBlocking + Polling 의 조합으로 이해하면 쉽다.

## Asynchronous blocking I/O

![](/resource/wiki/reactive-asycn-nonblokcing/asyncblocking.png)

NodeJs + MySQL 조합에서 async 를 통해 작업을 처리하다가 MySQL 드라이버를 호출(Blocking)하게 되면 async + blocking 이 생길 수 있다.

Asynchronous NonBlocking 에서 __Blocking 코드가 있으면__ 발생하는 케이스이다. 그래서 WebFlux 를 도입하는 경우 Entry ~ Endpoint 까지 모든 과정이 NonBlocking 으로 이뤄져야 한다. 

따라서 Spring WebFlux 를 사용하는 경우 JPA 보다는 Reactive Streams Spec 을 기반으로 하는 R2DBC(Reactive Relational Database Connectivity) 를 사용하는 것이 좋다.

## Asynchronous non-blocking I/O (AIO)

![](/resource/wiki/reactive-asycn-nonblokcing/asyncnonblocking.png)

## Links

- [Boost application performance using asynchronous I/O](https://developer.ibm.com/articles/l-async/)
- [Blocking-NonBlocking-Synchronous-Asynchronous](http://homoefficio.github.io/2017/02/19/Blocking-NonBlocking-Synchronous-Asynchronous/)
- [I/O Models](https://notes.shichao.io/unp/ch6/)