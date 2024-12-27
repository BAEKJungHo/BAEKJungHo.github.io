---
layout  : wiki
title   : Deep Dive Concurrency
summary : 
date    : 2024-12-24 12:15:32 +0900
updated : 2024-12-24 12:55:24 +0900
tag     : redis concurrency synchronization lock
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## Deep Dive Concurrency

Concurrency 관련 Issue 해결을 위한 첫 번째 단계는 ___[Shared Resources](https://klarciel.net/wiki/spring/spring-concurrency/)___ 를 이해하는 것이다.

![](/resource/wiki/redis-deep-dive-concurrency/nasdaq.png)

___[2012년 5월 페이스북의 IPO 에서 나스닥 거래소 시스템에 동시성 이슈 문제가 발생](https://www.computerworld.com/article/1438226/nasdaq-s-facebook-glitch-came-from-race-conditions.html)___ 하여, 페이스북의 종목 거래 개시가 30분 정도 지연됐다.
이때 발생한 Race Condition 때문에 다수의 투자자가 손실을 보았다. 이 계기로 인해서 효율적인 동시성 제어의 필요성이 주목받게 됐다.

> While most race conditions can be identified by simply testing programs while in development, in some cases they may not become apparent until the software is stressed under heavy usage, said Scott Sellers.

공유 자원을 안전하게 사용하기 위해서는 ___[Thread Safe](https://klarciel.net/wiki/spring/spring-concurrency/#thread-safe-%ED%95%98%EA%B2%8C-%EC%84%A4%EA%B3%84%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95)___ 한 코드를 작성해야 한다. Thread Safe 란 실행 순서나 환경에 상관 없이 여러 스레드가 접근하더라도 의도대로 동작하는 것을 의미한다.

BRIAN GOETZ 는 Thread Safe 에 대해서 다음과 같이 정의 했다.

> 여러 스레드가 한 객체에 동시에 접근할 때, 어떤 런타임 환경에서든 다음 조건을 모두 충족하면서 객체를 호출하는 행위가 올바른 결과를 얻을 수 있다면, "그 객체는 스레드 안전하다" 라고 말한다.
> - 특별한 스레드 스케줄링이나 대체 실행 수단을 고려할 필요가 없다.
> - 추가적인 동기화 수단이나 호출자 측에서 조율이 필요 없다.
> - [Degrees of thread safety](http://www.anibalarias.name/docs/PCthreadSafety.pdf)

정리하면, ___동기화 등의 안전장치를 코드 자체에 완벽하게 내장해서, 호출자는 멀티스레드 환경 등을 고려하지 않아도 안전하게 사용할 수 있어야 한다___ 는 뜻이다.

### Synchronization

___[경쟁 조건(race condition)](https://en.wikipedia.org/wiki/Race_condition)___ 을 막기 위해서는 동기화를 해야 한다. ___동기화(synchronization)는 여러 작업 간에 공유 자원에 대한 접근을 제어하는 수단___ 이다.

가장 기본적인 동기화 기법에는 ___[Mutex(Mutual Exclusion, 상호 배제, binary semaphore)](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.sync/-mutex/)___ 가 있다.
Mutex 는 어떤 시점에서든 ___단 하나의 스레드___ 만 공유 자원에 접근할 수 있다. ___[Semaphore](https://github.com/NKLCWDT/cs/blob/main/Operating%20System/%ED%94%84%EB%A1%9C%EC%84%B8%EC%8A%A4%20%EB%8F%99%EA%B8%B0%ED%99%94.md)___ 는 Mutex 와 비슷하지만 공유 자원에 하나 이상의 작업이 접근할 있다는 특징이 있다.
즉, 두 개 이상의 작업이 Semaphore 에 락을 걸거나 해제할 수 있다. 여기서 말하는 Semaphore 는 Counting Semaphore 이다. counter 변수 값이 공유 데이터이다.

__Mutex__:

```
acquire(); // 락을 획득 : entry section
    critical section // 임계 구역
release(); // 락을 반환 : exit section
    remainder section // 나머지 구역
```

Critical Section 에 Mutex 를 적용하는 이유는 ___[교착상태(膠着狀態, Deadlock)](https://klarciel.net/wiki/operatingsystem/os-deadlock/)___ 을 방지하기 위함이다.
DeadLock 을 방지하는 다른 방법으로는 대기 상태에 제한 시간을 두는 방법도 있다. 작업이 제한 시간 내에 모든 락을 얻지 못하면, 작업이 가진 락을 모두 해제하는 방법인데, 이 방법은 ___[LiveLock](https://www.geeksforgeeks.org/deadlock-starvation-and-livelock/)___ 을 유발할 수도 있다.
LiveLock 은 ___기아 상태(Starvation)___ 일종이다. 기아 상태는 스레드가 필요한 자원을 얻지 못해 일하지 못하는 상황이다. 대표적으로 서버 자원을 고갈 시키는 공격 방식인 DDos 공격이 있다.

이러한 Mutex 의 특징을 활용한 대표적인 Java 의 동기화 기법에는 ___[synchronized](https://www.geeksforgeeks.org/synchronization-in-java/)___ 가 있다. synchronized 는 ___[Monitor](https://docs.oracle.com/javase/specs/jvms/se6/html/Instructions2.doc9.html)___ 라는 것을 사용한다. synchronized 키워드를 컴파일 하면 monitorenter 와 monitorexit 이라는 두 가지 바이트코드 명령어가 생성되고,
각각 동기화 블록 전, 후에 실행된다. synchronized 는 ___Reentrancy(재진입성)___ 특징을 지니고 있다. 동일한 스레드 내에서는 synchronized 로 동기화된 블록에 다시 진입할 수 있다. 즉, 락을 이미 소유한 스레드는 동기화된 블록에 여러번 진입해도 블록되지 않는다.
또한 ___가시성(Visibility)___ 특징을 지닌다. 블록을 빠져나올 때 스레드 로컬 메모리에 반영된 새로운 값을 메인 메모리에 반영한다.

Shared Memory 모델의 Concurrent Programming 에서는, 한 코어(CPU)에서의 값 변경을 여러 코어(CPU)가 공유하는 메인 메모리로 반영하는 작업을 적절히 수행해야 메모리 가시성을 유지할 수 있게된다.
이때 등장하는 개념이 ___[Memory Barrier(Fence)](https://en.wikipedia.org/wiki/Memory_barrier)___ 이다.
Memory Barrier 는 CPU 의 레지스터나 캐시 값의 변경 내용을 메인 메모리에 반영하도록 강제하는 동작을 말한다. 이 과정을 ___"메모리로의 Flush"___ 라고도 표현하며, 이를 통해 다른 CPU 코어가 최신 값을 읽을 수 있도록 보장한다.

__Monitor Lock__:

- monitorenter 를 실행하면 락을 얻으려고 시도하고, 객체가 잠겨있지 않거나 현재 스레드가 락을 이미 소유하고 있다면 lock counter 를 1 증가 시킨다.
- monitorexit 을 실행하면 lock counter 를 1씩 감소시킨다. 그리고 카운터가 0이되면 락이 해제된다.
- 락을 얻지 못한 스레드는 현재 락을 소유한 스레드가 일을 마치고 락을 해제할 때 까지 블록된다.

이쯤 ___[Thread State](https://www.javabrahman.com/corejava/understanding-thread-life-cycle-thread-states-in-java-tutorial-with-examples/)___ 에 대해서 살펴볼 때가 됐다.

![](/resource/wiki/redis-deep-dive-concurrency/thread-state.png)

___[Platform Thread(carrier) 는 OS Thread 에 1:1 바인딩](https://klarciel.net/wiki/java/java-virtual-thread/)___ 되는데, Platform Thread 를 정지하거나 깨우려면 OS 의 도움을 얻어야 하며, 이는 ___사용자 모드와 커널 모드 사이의 전환을 피할 수 없다는 뜻___ 이다.
따라서, ___Mode Conversion___ 에 시간을 많이 소모하게 된다. 이러한 모드 전환(Mode Conversion) 비용을 줄이기 위해 JVM 은 나름대로 최적화를 수행한다.
예를 들면, 스레드를 Block 하라고 OS 에 알리기 전에 busy waiting(or spinning) 코드를 추가하여 모드 전환이 자주 발생하지 않도록 한다.

__Mutex with Busy Waiting__:

```java
do {
    acquire(); // 락을 획득 : entry section
        critical section // 임계 구역
    release(); // 락을 반환 : exit section
        remainder section // 나머지 구역
} while(true);

acquire() {
    while(!available)
        ; /* busy wait */
    available = false;
}

release() {
    available =  true;
}
```

- acquire() 함수로 락을 획득, release() 함수로 락을 반환
- Mutex 락은 available 이라는 boolean 변수를 가지는데, 이 변수 값이 락의 가용 여부를 표시한다. 락이 가용하면 acquire() 호출은 성공하면서 락은 사용 불가 상태가 된다.
- 사용 불가능한 락을 획득하려고 시도하는 프로세스/쓰레드는 락이 반환될 때 까지 봉쇄된다.

___바쁜 대기(busy waiting)___ 란 한 프로세스가 자원을 사용 중이라면, 락이 사용 가능해질 때 까지 대기하는 방식을 의미한다.
하나의 프로세스/스레드가 자원을 사용 중이라면 다른 자원들은 락이 사용 가능해질 때까지 기다리면서 계속 회전하고 있기 때문에 spinlock 이라고도 부른다. 대신 장점은 락을 기다리는 동안 문맥 교환이 발생되지 않기 때문에 CPU 성능을 올릴 수 있다는 것이다. 단, 프로세스들이 짧은 시간 동안만 락을 소유한다고 하면 spinlock(Mutext Locks) 이 유용하다.

synchronized 는 성능 문제도 있지만, 단일 애플리케이션 내에서만 유용하다. synchronized 는 단일 JVM 의 Java 프로세스 내부의 스레드 동기화만 보장한다. 분산 애플리케이션 환경에서 문제가 발생할 수 있다.

JDK5 부터 제공되는 ___java.util.concurrent___ 패키지를 통해 동기화를 달성할 수 있다. 대표적으로 ___ReentrantLock___ 이 있는데, synchronized 와 똑같이 재진입이 가능한 락이다.
페어락을 지원하며, 락을 소유한 스레드가 오랜 시간 락을 해제하지 않을 때 같은 락을 얻기 위해 대기 중인 다른 스레드들은 락을 포기하고 다른 일을 할 수 있다.

하지만 synchronized 든 ReentrantLock 든 스레드 일시정지 및 깨우기 로 인한 성능 저하가 발생하는 Blocking Synchronization 이다. 즉, 성능이 좋지 않다.

성능을 높이려면 이와 같은 잠금 매커니즘 장치를 없애야 한다.

#### Nonblocking Synchronization, Atomic

잠금 매커니즘 없이 동기화하는 것을 ___Lock Free___ 라고 한다.

___Nonblocking Synchronization___ 중 대표적인 것이 ___[CAS(Compare and Swap)](https://klarciel.net/wiki/altorithm/algorithm-compare-and-swap/)___ 와 ___[Optimistic Locking](https://klarciel.net/wiki/spring/spring-concurrency-resolve/#optimistic-lock)___ 이 있다.
낙관적 동시성 전략은 ___작업 진행과 충돌 감지___ 라는 두 단계를 하나의 명령어 처럼 원자적으로 수행한다.

<mark><em><strong>원자적(Atomic)이라는 의미는, 해당 연산의 중간 단계를 다른 스레드가 엿볼 수 없다는 뜻이다.</strong></em></mark>

Java 에서는 ___[sun.misc.Unsafe](https://www.baeldung.com/java-unsafe)___ 클래스의 compareAndSwapInt() 등의 메서드로 CAS 연산을 지원한다. ___[ConcurrentHashMap](https://klarciel.net/wiki/altorithm/algorithm-compare-and-swap/#concurrenthashmap)___ 도 내부적으로 CAS 연산을 사용한다.
Hotspot JVM CAS 연산 메서드들을 처리하는 방식은 JIT 컴파일하여 메서드 호출은 없애고 밑단의 프로세서에 맞는 CAS 명령어로 대체하는 것이다. (Inlining)

AtomicInteger 와 같은 클래스들에서도 Unsafe 클래스의 CAS 연산을 이용하고 있다. 

![](/resource/wiki/redis-deep-dive-concurrency/atomicinteger.png)

AtomicInteger 를 보면 value 값이 volatile 로 되어있는 것을 볼 수 있다. 즉, 메모리 가시성을 위한 것임을 알 수 있다.
(예를 들어, 굳이 CAS 연산이 필요 없더라도 메모리 가시성을 유지해야하는 Integer 에 대해서는 AtomicInteger 를 사용해도 될 것 같다.)

CAS 연산이 완벽한 것 처럼 보이지만, ___[ABA](https://en.wikipedia.org/wiki/ABA_problem)___ 문제가 존재한다. 따라서, ABA 문제를 해결해야 한다면 Atomic Class 보다 기존의 Mutex 매커니즘을 이용하는 것이 좋다.

#### Concurrent Data Structures

Lock-Free 동시성 자료 구조들(Concurrent Data Structures)은 위에서 설명한 CAS 로 대부분 구현이 되어있다.

동시성 자료구조 중에 가장 중요한 자료구조를 뽑아보라고 한다면 ___Queue___ 라고 할 수 다. 큐를 활용하면 쓰레드 간의 소통을 할 수 있습니다. 그중에서도 ___채널(Channel)___ 은 큐에 더 이상 요소를 추가할 수 없도록 닫는 기능과 채널의 메시지를 대기하는 기능을 추가한 것이다. 채널을 활용하면 비동기적으로 처리되는 스트림을 구현할 수 있다.

쓰레드 간의 소통을 큐로 하는 방식은 ___[생산자-소비자 패턴(Producer-Consumer Pattern)](https://ko.wikipedia.org/wiki/%EC%83%9D%EC%82%B0%EC%9E%90-%EC%86%8C%EB%B9%84%EC%9E%90_%EB%AC%B8%EC%A0%9C)___ 을 기반으로 이루어진다.

이 패턴에서, 큐는 ___데이터를 공유하는 중간 매개체 역할___ 을 한다. 하나의 쓰레드(생산자)가 데이터를 생성하여 큐에 추가하고, 다른 쓰레드(소비자)가 큐에서 데이터를 가져와 처리하는 방식이다.
- 공유 큐(Shared Queue): 큐는 쓰레드 간에 공유되며, 동기화 메커니즘을 통해 안전하게 접근된다.
- 생산자(Producer): 데이터를 생성하고 큐에 넣는다.
- 소비자(Consumer): 큐에서 데이터를 꺼내 처리한다

큐를 기반으로 한 채널은 큐에 다음과 같은 기능을 추가한 구조:
- 닫기(Close): 더 이상 데이터를 추가할 수 없도록 큐를 닫는다.
- 대기(Blocking Wait): 큐가 비어 있을 때 대기하거나, 큐가 닫히면 작업을 종료한다.

ConcurrentLinkedQueue, BlockingQueue 등이 존재한다.

#### Synchronization-Free Mechanisms

___[Blocking, NonBlocking](https://klarciel.net/wiki/reactive/reactive-async-nonblocking/)___ 등의 동기화 도움 없이도 Thread-Safe 를 달성 할 수 있다.

Immutable Object 나 ___[Side Effect](https://klarciel.net/wiki/functional/functional-sideeffect/)___ 가 없는 ___[Pure Function](https://klarciel.net/wiki/kotlin/kotlin-first-citizen/)___ 을 이용하면 상태가 변하지 않으므로, 상태 무결성이 깨질 가능성 자체가 차단된다. 따라서 Thread Safe 를 확보할 수 있다. 순수 함수는 ___재진입 가능___ 하다.

재진입 가능한 코드란 전역 변수, 공유 시스템 자원등을 사용하지 않고 필요한 값을 매개변수로 받으며 반환 값을 예측 할 수 있고, 언제 실행되어도 상관 없는 코드를 의미한다.

___[ThreadLocal](https://klarciel.net/wiki/spring/spring-concurrency/#threadlocal-%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%A0-%EB%95%8C%EB%8F%84-%EC%A3%BC%EC%9D%98%EC%A0%90%EC%9D%B4-%EC%9E%88%EB%8A%94%EB%8D%B0)___ 또한 Synchronization-Free Mechanism 이다. 

### Synchronization Design

동기화를 설계할 때 대표적인 문제 2가지를 참고하면 좋다.

- [Producer-Consumer Problem](https://ko.wikipedia.org/wiki/%EC%83%9D%EC%82%B0%EC%9E%90-%EC%86%8C%EB%B9%84%EC%9E%90_%EB%AC%B8%EC%A0%9C)
- [Readers–writers Problem](https://en.wikipedia.org/wiki/Readers%E2%80%93writers_problem)
  - [rwlock](https://klarciel.net/wiki/go/go-rwlock/)

위 2가지 문제들은 Mutex 와 Semaphore 를 활용하여 해결할 수 있다.

#### Producer-Consumer Problems

__[Producer-Consumer Problem](https://ko.wikipedia.org/wiki/%EC%83%9D%EC%82%B0%EC%9E%90-%EC%86%8C%EB%B9%84%EC%9E%90_%EB%AC%B8%EC%A0%9C)__:

- 변수
  - Empty(Semaphore) : 버퍼 내에 저장할 공간이 있는지를 나타낸다. (초기값은 n)
  - Full(Semaphore) : 버퍼 내에 소비할 아이템이 있는지를 나타낸다. (초기값은 0)
  - Mutex(Lock) : 버퍼에 대한 접근을 통제한다. (초기값은 1)

- Producer

```
do {
     ...
     아이템을 생산한다.
     ...
     wait(empty);  //버퍼에 빈 공간이 생길 때까지 기다린다.
     wait(mutex); //임계 구역에 진입할 수 있을 때까지 기다린다.
     ...
     아이템을 버퍼에 추가한다.
     ...
     signal(mutex); //임계 구역을 빠져나왔다고 알려준다.
     signal(full);  //버퍼에 아이템이 있다고 알려준다.
} while (1);
```

- Consumer

```
do {
     wait(full);    //버퍼에 아이템이 생길 때까지 기다린다.
     wait(mutex);
     ...
     버퍼로부터 아이템을 가져온다.
     ...
     signal(mutex);
     signal(empty); //버퍼에 빈 공간이 생겼다고 알려준다.
     ...
     아이템을 소비한다.
     ...
} while (1);
```

이 개념을 잘 익혀두면 아래에서 분석할 Redisson TryLock 로직을 이해하기 편하다.

### Actor

___[Actor](https://en.wikipedia.org/wiki/Actor_model)___ 는 lock-based synchronization 를 제거한다.
각각의 액터가 독립적인 실행 단위로 동작하며 메시지 전달을 통해서만 상호작용하는 방식이다.

구현체로는 ___[Akka](https://doc.akka.io/libraries/akka-core/current/typed/actors.html)___ 가 있다.

### Software Transactional Memory

___[Software Transactional Memory](https://ko.wikipedia.org/wiki/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4_%ED%8A%B8%EB%9E%9C%EC%9E%AD%EC%85%94%EB%84%90_%EB%A9%94%EB%AA%A8%EB%A6%AC)___  공유 메모리으로의 접근을 제어하기 위한 데이터베이스 트랜잭션과 유사한 동시성 제어 구조이다.

- [Transactional Memory(트랜젝션 메모리)](https://blog.naver.com/jjoommnn/130038506187)

### Lock Optimization

Blocking 동기화 기법이 성능 문제를 야기 시키는 이유는 스레드를 일시 정지 시키고 재개하기 위해서 커널 모드로 전환해야 하는 모드 전환 비용이 들기 때문이다.
이를 최적화 하기 위한 방법 중 하나가 Spin Lock 이다. 대신 락이 잠겨 있는 시간이 길다면, 계속 루프를 돌기 때문에 자원 낭비가 발생한다.

다른 방법은 위에서 설명한 Synchronization-Free Mechanisms 을 사용하면 된다.

### In Depth Redisson TryLock 

Redisson TryLock 로직을 제대로 이해하기 위해선 온갖 지식을 다 써먹어야 한다. ___[Design to Performance; Redis Single-Threaded Architectures](https://klarciel.net/wiki/redis/redis-single-thread/)___ 글을 통해서 Redis 의 작업이 비차단이어야 하는 이유를 먼저 학습해야 한다.

Redis 는 높은 동시성을 제공한다. 따라서 Redisson 라이브러리도 이러한 지식 아래에 구현이 되어있을 것이란 걸 생각하고 코드를 살펴보면 좋다.

__tryLock__:

```java
@Override
public boolean tryLock(long waitTime, long leaseTime, TimeUnit unit) throws InterruptedException {
    long time = unit.toMillis(waitTime);
    long current = System.currentTimeMillis();
    long threadId = Thread.currentThread().getId();
    Long ttl = tryAcquire(waitTime, leaseTime, unit, threadId);
    
    // lock acquired
    if (ttl == null) {
        return true; // 락 획득 성공
    }
    
    time -= System.currentTimeMillis() - current;
    if (time <= 0) {
        acquireFailed(waitTime, unit, threadId);
        return false;
    }
    
    current = System.currentTimeMillis();
    
    // 락이 해제될 때 알림을 받기 위해 구독
    CompletableFuture<RedissonLockEntry> subscribeFuture = subscribe(threadId);
    try {
        subscribeFuture.get(time, TimeUnit.MILLISECONDS);
    } catch (TimeoutException e) {
        if (!subscribeFuture.completeExceptionally(new RedisTimeoutException(
                "Unable to acquire subscription lock after " + time + "ms. " +
                        "Try to increase 'subscriptionsPerConnection' and/or 'subscriptionConnectionPoolSize' parameters."))) {
            subscribeFuture.whenComplete((res, ex) -> {
                if (ex == null) {
                    unsubscribe(res, threadId);
                }
            });
        }
        acquireFailed(waitTime, unit, threadId);
        return false;
    } catch (ExecutionException e) {
        acquireFailed(waitTime, unit, threadId);
        return false;
    }

    try {
        time -= System.currentTimeMillis() - current;
        if (time <= 0) {
            acquireFailed(waitTime, unit, threadId);
            return false;
        }
    
        // 락 획득 재시도 루프
        while (true) {
            long currentTime = System.currentTimeMillis();
            ttl = tryAcquire(waitTime, leaseTime, unit, threadId);
            
            // lock acquired
            if (ttl == null) {
                return true; // 락 획득 성공
            }

            time -= System.currentTimeMillis() - currentTime;
            if (time <= 0) {
                acquireFailed(waitTime, unit, threadId);
                return false;
            }

            // Semaphore 를 사용한 대기
            // waiting for message
            currentTime = System.currentTimeMillis();
            if (ttl >= 0 && ttl < time) {
                // Semaphore(getLatch())를 사용해 다른 스레드가 락을 해제할 때까지 대기
                commandExecutor.getNow(subscribeFuture).getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
            } else {
                commandExecutor.getNow(subscribeFuture).getLatch().tryAcquire(time, TimeUnit.MILLISECONDS);
            }

            time -= System.currentTimeMillis() - currentTime;
            if (time <= 0) {
                acquireFailed(waitTime, unit, threadId);
                return false;
            }
        }
    } finally {
        unsubscribe(commandExecutor.getNow(subscribeFuture), threadId);
    }
//        return get(tryLockAsync(waitTime, leaseTime, unit));
}
```

코드를 쪼개서 살펴보자.

```java
long time = unit.toMillis(waitTime);
long current = System.currentTimeMillis();
long threadId = Thread.currentThread().getId();
Long ttl = tryAcquire(waitTime, leaseTime, unit, threadId);
// lock acquired
if (ttl == null) {
    return true;
}

time -= System.currentTimeMillis() - current;
if (time <= 0) {
    acquireFailed(waitTime, unit, threadId);
    return false;
}

current = System.currentTimeMillis();
CompletableFuture<RedissonLockEntry> subscribeFuture = subscribe(threadId);
```

높은 성능을 위해 Nonblocking 으로 동작하게끔 ___[CompletableFuture](https://www.baeldung.com/java-completablefuture-non-blocking)___ 을 사용한 것을 볼 수 있다.
또한 subscribe 를 통해 ___[Publish/Subscribe Architecture](https://klarciel.net/wiki/architecture/architecture-pub-sub/)___ 를 선택한 것을 볼 수 있다.

일단, 위에서 배웠던 ___[Semaphore](https://redisson.org/glossary/java-semaphore.html)___ 의 특징을 다시 되짚어 보면 다음과 같다.

- Blocking Synchronization Mechanism
- 여러 스레드가 접근 가능하다. 두 개 이상의 작업이 Semaphore 에 락을 걸거나 해제할 수 있다.

여기서 문제가 되는 지점이 Blocking 이다. 일반적인 Semaphore 를 사용하면 성능 문제가 있을 있다. 따라서 높은 성능을 위해서는 Semaphore 도 Async 하게 동작하도록 해야할 것이다. 그래서 subscribe 를 들여다 보면 ___AsyncSemaphore___ 를 만들어서 사용하는 것을 볼 수 있다.
CompletableFuture 와 잘 통합된다.

__subscribe__:

```java
/**
 * @param channelName threadId
 */
public CompletableFuture<E> subscribe(String entryName, String channelName) {
    AsyncSemaphore semaphore = service.getSemaphore(new ChannelName(channelName));
    CompletableFuture<E> newPromise = new CompletableFuture<>();

    semaphore.acquire().thenAccept(c -> {
        if (newPromise.isDone()) {
            semaphore.release();
            return;
        }

        E entry = entries.get(entryName);
        if (entry != null) {
            entry.acquire(); 
            semaphore.release();
            entry.getPromise().whenComplete((r, e) -> {
                if (e != null) {
                    newPromise.completeExceptionally(e);
                    return;
                }
                newPromise.complete(r);
            });
            return;
        }

        E value = createEntry(newPromise);
        value.acquire();

        E oldValue = entries.putIfAbsent(entryName, value);
        if (oldValue != null) {
            oldValue.acquire();
            semaphore.release();
            oldValue.getPromise().whenComplete((r, e) -> {
                if (e != null) {
                    newPromise.completeExceptionally(e);
                    return;
                }
                newPromise.complete(r);
            });
            return;
        }

        RedisPubSubListener<Object> listener = createListener(channelName, value);
        CompletableFuture<PubSubConnectionEntry> s = service.subscribeNoTimeout(LongCodec.INSTANCE, channelName, semaphore, listener);
        newPromise.whenComplete((r, e) -> {
            if (e != null) {
                s.completeExceptionally(e);
            }
        });
        s.whenComplete((r, e) -> {
            if (e != null) {
                entries.remove(entryName);
                value.getPromise().completeExceptionally(e);
                return;
            }
            value.getPromise().complete(value);
        });

    });

    return newPromise;
}
```

Pub/Sub 을 사용한 이유는 <mark><em><strong>이벤트(데이터 준비, 연결 요청 등)가 발생하면 알려주는 매커니즘</strong></em></mark> 을 위한 것이라 볼 수 있다. ___Design to Performance; Redis Single-Threaded Architectures___ 를 읽었다면 해당 매커니즘이 높은 동시성을 달성하기 위한 본질 이라는 것을 알 수 있다.
또한, ___[Redis Pub/Sub](https://redis.io/docs/latest/develop/interact/pubsub/)___ 을 통해 분산 노드 간 이벤트를 전달하고, 데이터를 공유하거나 연결을 관리하기가 용이하다.

여기서 entry 라는 것을 볼 수 있는데, id + Lock 의 Key 임을 알 수 있다. 

![](/resource/wiki/redis-deep-dive-concurrency/entry.png)

channelName 은 threadId 이다. 그리고 service.getSemaphore 로직을 보면 `private final AsyncSemaphore[] locks = new AsyncSemaphore[50];` 이렇게 되어있는 걸 볼 수 있다.
위에서 배운 것 처럼 Semaphore 는 N 개의 스레드가 동시에 접근 가능하도록 된 매커니즘이기 때문에, Entry 에 대해서 Lock 을 획득하면 semaphore 는 release 를 해줘야 다음 스레드가 들어올 수 있다.

entry.acquire 부분을 따라가면 다음과 같은 클래스를 볼 수 있다.

```java
public class RedissonLockEntry implements PubSubEntry<RedissonLockEntry> {

    // volatile 키워드를 사용하여 멀티스레드 환경에서 counter 변수의 가시성을 보장
    private volatile int counter;  // 락 획득 횟수를 추적, Reentrancy
    
    // Semaphore 를 통해 락 획득/해제 시의 동기화 처리
    // 락의 획득 가능 여부를 제어하는 세마포어
    // 다른 스레드의 접근을 블록하는데 사용됨
    // 해당 값을 통해 락을 획득할 수 있는지 알 수 있음
    private final Semaphore latch;  // 동기화를 위한 세마포어
    
    private final CompletableFuture<RedissonLockEntry> promise;  // 비동기 작업 완료를 처리
    
    // ConcurrentLinkedQueue 를 사용하여 thread-safe 한 리스너 관리
    private final ConcurrentLinkedQueue<Runnable> listeners;  // 이벤트 리스너 목록
    
    // permits 이 0으로 초기화된다는 것은 "처음에는 아무도 리소스를 획득할 수 없는 상태"를 의미
    // 락을 처음 생성할 때는 아무도 접근할 수 없게 하기 위함
    // 락이 해제될 때만 다른 스레드가 깨어나서 락 획득을 시도하도록 제어
    // 불필요한 락 획득 시도를 방지하고 효율적인 대기 구현
    public RedissonLockEntry(CompletableFuture<RedissonLockEntry> promise) {
        super();
        this.latch = new Semaphore(0);
        this.promise = promise;
    }

    // 현재 락 획득 횟수를 반환
    public int acquired() {
        return counter;
    }
    
    // 락 카운터를 증가
    public void acquire() {
        counter++;
    }

    // 락 카운터를 감소시키고 현재 값을 반환
    public int release() {
        return --counter;
    }

    // 락 작업의 완료를 비동기적으로 처리하기 위한 CompletableFuture 를 반환
    public CompletableFuture<RedissonLockEntry> getPromise() {
        return promise;
    }

    // 락 상태 변경 시 실행될 리스너를 추가
    public void addListener(Runnable listener) {
        listeners.add(listener);
    }

    public boolean removeListener(Runnable listener) {
        return listeners.remove(listener);
    }

    public ConcurrentLinkedQueue<Runnable> getListeners() {
        return listeners;
    }

    public Semaphore getLatch() {
        return latch;
    }

    @Override
    public String toString() {
        return "RedissonLockEntry{" +
                "counter=" + counter +
                '}';
    }
}
```

acquire()와 release() 메서드의 단순성
- 단순히 카운터를 증감하는 것만으로 재진입을 관리
- 동일 스레드가 여러 번 락을 획득할 수 있게 함

```java
public class RecursiveExample {
    private RedissonLockEntry lockEntry;

    public void recursiveMethod(int depth) {
        lockEntry.acquire();  // 첫 호출: counter = 1
        try {
            if (depth > 0) {
                recursiveMethod(depth - 1);  // 재귀 호출: counter = 2, 3, ...
            }
        } finally {
            lockEntry.release();  // 각 단계마다 counter 감소
        }
    }
}
```

만약 재진입성이 없다면:
- 동일 스레드가 락을 두 번 이상 획득하려고 할 때 데드락 발생
- 재귀적 호출이나 중첩된 메서드에서 락을 사용할 수 없음

재진입성이 있기 때문에:
- 동일 스레드는 락을 여러 번 획득 가능
- counter 가 0이 될 때까지 실제 락은 유지됨
- 다른 스레드는 counter 가 0이 될 때까지 대기

entry release 의 경우에는 unsubscribe 시에 처리된다.

```java
public void unsubscribe(E entry, String entryName, String channelName) {
    ChannelName cn = new ChannelName(channelName);
    AsyncSemaphore semaphore = service.getSemaphore(cn);
    semaphore.acquire().thenAccept(c -> {
        if (entry.release() == 0) {
            entries.remove(entryName);
            service.unsubscribeLocked(cn)
                    .whenComplete((r, e) -> {
                        semaphore.release();
                    });
        } else {
            semaphore.release();
        }
    });
}
```

AsyncSemaphore 를 살펴보자.

```java
public class AsyncSemaphore {

    private final AtomicInteger counter;
    private final Queue<CompletableFuture<Void>> listeners = new ConcurrentLinkedQueue<>();

    public AsyncSemaphore(int permits) {
        counter = new AtomicInteger(permits);
    }
    
    public int queueSize() {
        return listeners.size();
    }
    
    public void removeListeners() {
        listeners.clear();
    }

    public CompletableFuture<Void> acquire() {
        CompletableFuture<Void> future = new CompletableFuture<>();
        listeners.add(future);
        tryRun();
        return future;
    }

    private void tryRun() {
        while (true) {
            if (counter.decrementAndGet() >= 0) {
                CompletableFuture<Void> future = listeners.poll();
                if (future == null) {
                    counter.incrementAndGet();
                    return;
                }

                if (future.complete(null)) {
                    return;
                }
            }

            if (counter.incrementAndGet() <= 0) {
                return;
            }
        }
    }

    public int getCounter() {
        return counter.get();
    }

    public void release() {
        counter.incrementAndGet();
        tryRun();
    }

    @Override
    public String toString() {
        return "value:" + counter + ":queue:" + queueSize();
    }
}
```

Nonblocking Synchronization 을 위해 Atomic 과 incrementAndGet() 메서드를 통해 CAS 연산을 사용하는 것을 알 수 있다.

tryLock 의 다음 코드를 보자.

```java
CompletableFuture<RedissonLockEntry> subscribeFuture = subscribe(threadId);
try {
    subscribeFuture.get(time, TimeUnit.MILLISECONDS);
} catch (TimeoutException e) {
    if (!subscribeFuture.completeExceptionally(new RedisTimeoutException(
            "Unable to acquire subscription lock after " + time + "ms. " +
                    "Try to increase 'subscriptionsPerConnection' and/or 'subscriptionConnectionPoolSize' parameters."))) {
        subscribeFuture.whenComplete((res, ex) -> {
            if (ex == null) {
                unsubscribe(res, threadId);
            }
        });
    }
    acquireFailed(waitTime, unit, threadId);
    return false;
} catch (ExecutionException e) {
    acquireFailed(waitTime, unit, threadId);
    return false;
}
```

채널 이름을 threadId 로 사용하는 것을 알 수 있다. 또한, 최대 waitTime 까지 blocking 하는 것을 알 수 있다.

```java
try {
    time -= System.currentTimeMillis() - current;
    if (time <= 0) {
        acquireFailed(waitTime, unit, threadId);
        return false;
    }
    
    while (true) {
        long currentTime = System.currentTimeMillis();
        ttl = tryAcquire(waitTime, leaseTime, unit, threadId);
        // lock acquired
        if (ttl == null) {
            return true;
        }
    
        time -= System.currentTimeMillis() - currentTime;
        if (time <= 0) {
            acquireFailed(waitTime, unit, threadId);
            return false;
        }
    
        // waiting for message
        // 여기서 Semaphore tryAcquire 를 통해서 latch 를 증가시킴을 알 수 있다. 
        currentTime = System.currentTimeMillis();
        if (ttl >= 0 && ttl < time) {
            // 주어진 ttl 동안 permit 을 기다림
            commandExecutor.getNow(subscribeFuture).getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
        } else {
            commandExecutor.getNow(subscribeFuture).getLatch().tryAcquire(time, TimeUnit.MILLISECONDS);
        }
    
        time -= System.currentTimeMillis() - currentTime;
        if (time <= 0) {
            acquireFailed(waitTime, unit, threadId);
            return false;
        }
    }
} finally {
    unsubscribe(commandExecutor.getNow(subscribeFuture), threadId);
}
```

주어진 대기 시간 내에서 락을 획득하려 시도하며, 락을 획득하지 못할 경우 남은 시간 동안 메시지를 기다리다가 실패 시 구독을 해제한다.

`commandExecutor.getNow(subscribeFuture).getLatch().tryAcquire` 코드를 들어가면 다음과 같이 설명이 되어있다.

![](/resource/wiki/redis-deep-dive-concurrency/tryAcquire.png)

주석을 되게 잘 읽어야하는데, 잘 보면 ___Some other thread invokes the release method ~~___ 를 볼 수 있다. 
따라서, 다른 스레드에서 락을 해제할 없도록 하기 위해서는 Redisson TryLock 을 구현할 때, Redisson 에서 지원하는 아래 메서드를 finally 구문에 꼭 써줘야 한다.

```java
@Override
public boolean isHeldByCurrentThread() {
    return isHeldByThread(Thread.currentThread().getId());
}
```

다른 주의점은 tryLock 은 기본적으로 ___non-fair___ Lock 이다. 즉, 스레드가 진입한 순서대로 락을 획득하는게 아니다.

```java
Semaphore semaphore = new Semaphore(1); // permits = 1

// Thread A가 permit 보유 중
// Thread B, C, D가 대기 중...

// Thread E가 새로 도착
boolean acquired = semaphore.tryAcquire(5, TimeUnit.SECONDS);
```

이 경우 Thread E는:
- Thread A가 permit 을 release 할 때
- B, C, D가 대기 중이더라도
- 먼저 permit 을 획득할 수 있음 (비공정)

만약 FairLock 을 원하면 RedissonFairLock 을 사용하면 된다.

__LuaScript__:

세마포어 말고 코드에 작성된 tryAcquire 로직을 따라가면 LuaScript 를 사용 중인 것을 볼 수 있다.

```java
<T> RFuture<T> tryLockInnerAsync(long waitTime, long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    return evalWriteSyncedAsync(getRawName(), LongCodec.INSTANCE, command,
            "if ((redis.call('exists', KEYS[1]) == 0) " +
                        "or (redis.call('hexists', KEYS[1], ARGV[2]) == 1)) then " +
                    "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                    "return nil; " +
                "end; " +
                "return redis.call('pttl', KEYS[1]);",
            Collections.singletonList(getRawName()), unit.toMillis(leaseTime), getLockName(threadId));
}
```

요약하면 다음과 같다.

- 분산 노드 간 이벤트 전달 용이성 및 높은 성능을 위한 이벤트 기반 매커니즘을 채용한 Pub/Sub 아키텍처를 사용
- Async, Nonblocking 아키텍처를 위해서 Semaphore 를 Async 하게 사용
- Semaphore 사용 시 Atomic 연산과, CAS 연산을 활용하여 동기화
- LuaScript 를 통해 해당 연산이 Atomic 하게 Redis Server 에서 처리됨

## Links

- [Jeffrey Richter - Concurrent Affairs : Build a Richer Thread Synchronization Lock](https://learn.microsoft.com/en-us/archive/msdn-magazine/2006/march/concurrent-affairs-build-a-richer-thread-synchronization-lock)
- [9가지 프로그래밍 언어로 배우는 개념: 5편 - 동시성 프로그래밍](https://tech.devsisters.com/posts/programming-languages-5-concurrent-programming/)

## References

- JAVA Concurrency in Practice / BRIAN GOETZ
- Grokking Concurrency / Bobrov, Kirill
- JVM 밑바닥까지 파헤치기 / 저우즈밍(周志明)