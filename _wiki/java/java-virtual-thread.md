---
layout  : wiki
title   : VirtualThread; Provide High-throughput not Low-Latency
summary : 
date    : 2024-10-31 12:28:32 +0900
updated : 2024-10-31 19:15:24 +0900
tag     : java kotlin coroutine spring virtualthread
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## VirtualThread

The thread is Java's unit of ___[concurrency](https://klarciel.net/wiki/spring/spring-concurrency/)___;

___[Virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html#GUID-BEC799E0-00E9-4386-B220-8839EA6B4F5C)___ are ___lightweight [threads](https://klarciel.net/wiki/kotlin/kotlin-coroutine-thread/)___.
Use virtual threads in high-throughput concurrent applications, especially those that consist of a great number of concurrent tasks that spend much of their time waiting.
Virtual threads(from ___JDK21___) are not faster threads; they do not run code any faster than platform threads. They exist to provide ___[scale (higher throughput), not speed (lower latency)](https://klarciel.net/wiki/network/network-throughput-latency/)___.

## The thread-per-request style

기존 Java Threading Model 의 경우에는 JVM 의 Heap 에 존재하는 ULT(User Level Thread) 가 ___[Kernel](https://klarciel.net/wiki/operatingsystem/os-kernel/)___ 에 존재하는 KLT(Kernel Level Thread) 에 1:1 매핑 되는 구조이다.
Unfortunately, the number of available threads is limited because the JDK implements threads as wrappers around operating system (OS) threads.

따라서 이러한 The thread-per-request style 에서는 요청마다 스레드를 무한정 생성할 수 없기 때문에 많은 수의 요청을 동시에 처리할 스레드 수가 OS 스레드 수에 제한되며, ___[C10K Problem](https://en.wikipedia.org/wiki/C10k_problem)___ 을 해결하지 못한다.

## Improving scalability with the asynchronous style

높은 수준의 처리량(high-throughput)을 위해서 thread-per-request style 대신 ___[async style](https://klarciel.net/wiki/reactive/reactive-eventloop/)___ 을 도입할 수 있다.
이는 비동기 프로그래밍 스타일이라고 부르며, I/O 작업이 완료될 때까지 기다리지 않고 나중에 완료를 콜백에 신호하는 별도의 I/O 메서드 세트를 사용한다.

이러한 비동기, NIO 방식을 사용하기 위해 Reactive Framework 를 도입하는 것이 일반적이며, high-throughput 을 달성할 순 있지만 단점도 많이 존재한다.

- high learning curve
- debugging is difficult
- readability; callback hell(flatmap hell)

짧은 파이프라인에서 데이터를 처리할 때는 람다 표현식을 구성하는 것이 관리하기 쉽지만 애플리케이션의 모든 요청 처리 코드를 이런 방식으로 작성해야 하는 경우에는 가독성에 문제가 많이 생긴다.

이러한 단점을 개선(특히 가독성)하기 위해서 Java 대신 Kotlin 언어를 선택하고, ___[Coroutine](https://klarciel.net/wiki/kotlin/kotlin-coroutines/)___ 을 활용하여 비동기 애플리케이션을 동기식 코드처럼 작성하여 사용하기도 한다.

## Preserving the thread-per-request style with virtual threads

Platform Thread(carrier) 는 OS Thread 에 1:1 바인딩되며, 1개의 Platform Thread 위에 여러개의 Virtual Thread 가 붙어있는 모습이다.
The platform thread to which the scheduler assigns a virtual thread is called the virtual thread's ___carrier___.
가상 스레드는 다른 멀티스레드 언어(예: Go의 고루틴 및 Erlang 의 프로세스)에서 성공한 UserModeThread 의 한 형태이다. OS는 가상 스레드의 존재를 인식하지 못한다.

- [Spring into the Future: Embracing Virtual Threads with Java's Project Loom](https://www.danvega.dev/blog/virtual-threads-spring)
- [Virtual Thread 의 기본 개념 이해하기 - Naver D2](https://d2.naver.com/helloworld/1203723)
- [Project Loom Virtual Thread 에 봄(Spring)은 왔는가 - Kakaopay](https://tech.kakaopay.com/post/ro-spring-virtual-thread/)
- [Java 의 미래, Virtual Thread](https://techblog.woowahan.com/15398/)

가상 스레드는 M:N 스케줄링을 사용하며, 여기서 많은 수(M)의 가상 스레드가 적은 수(N)의 OS 스레드에서 실행되도록 스케줄링된다.

- The identity of the carrier is unavailable to the virtual thread. The value returned by Thread.currentThread() is always the virtual thread itself.
- The stack traces of the carrier and the virtual thread are separate. An exception thrown in the virtual thread will not include the carrier's stack frames. Thread dumps will not show the carrier's stack frames in the virtual thread's stack, and vice-versa.
- Thread-local variables of the carrier are unavailable to the virtual thread, and vice-versa.

### Carrier; Mount/UnMount VirtualThread

PlatformThread(Carrier)는 가상 스레드를 ___Mount/UnMount___ 하여 사용한다. 일반적으로 가상 스레드는 JDK 에서 I/O or Block 될때 UnMount 된다.
이 시점에서 플랫폼 스레드는 자유로워지므로 스케줄러는 다른 가상 스레드를 마운트하여 플랫폼 스레드가 다시 캐리어가 될 수 있다.
가상 스레드의 마운트 및 언마운트는 빈번하고 투명하게 수행되며 OS 스레드를 차단하지 않는다.

### Using-virtual-threads-Example

__[Examples](https://openjdk.org/jeps/444#Using-virtual-threads-Example-2)__:

```java
// Virtual Thread 를 생성하고 10,000개의 작업을 제출하고 모든 작업이 완료될 때까지 대기
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}  // executor.close() is called implicitly, and waits
```

최신 하드웨어들은 이러한 작업을 처리하기 위한 10,000 개의 가상 스레드를 생성할 수 있다. 내부적으로 JDK 는 위와 같은 작업을 처리하기 위한 소수의 OS Thread (1개정도) 에서 위 코드를 실행한다.

만약 아래와 같이 가상 스레드가 아닌 thread-per-request style 이라면 

```java
// 초당 200개의 처리만 가능
Executors.newFixedThreadPool(200)
```

초당 200개의 처리만 가능하다.

### Avoid

스레드 풀은 값비싼 리소스를 공유하도록 설계되었지만 가상 스레드는 비싸지 않으므로 풀링할 필요가 없다.

- Don’t Pool Virtual Threads
- Use Semaphores for Limited Resources
- Avoid Pinning → synchronized 키워드와 같은 사용으로 인한 Pinning 구간을 지양
- Review Usage of Thread-Local Variables → Thread-Local 변수 사용을 지양

## Links

- [The Ultimate Guide to Java Virtual Threads](https://blog.rockthejvm.com/ultimate-guide-to-java-virtual-threads/)
- [VirtualThread Monitoring](https://jeyzer.org/virtual-threads/)
- [Non-blocking Algorithms](https://jenkov.com/tutorials/java-concurrency/non-blocking-algorithms.html)

## References

- [JEP 444: Virtual Threads / OpenJDK](https://openjdk.org/jeps/444)