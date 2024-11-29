---
layout  : wiki
title   : Atomic instruction CAS to achieve synchronization
summary : Compare And Swap, ConcurrentHashMap
date    : 2024-11-29 15:54:32 +0900
updated : 2024-11-29 20:15:24 +0900
tag     : algorithm concurrency atomic os java
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Compare And Swap

___[CAS(Compare And Swap)](https://en.wikipedia.org/wiki/Compare-and-swap)___ is atomic instruction.

___[CAS](https://klarciel.net/wiki/java/java-atomic/#compare-and-swapcas)___ has three operands. A memory location `V` on which to operate, the expected old value `A`, and the new value `B`. CAS automatically 
updates `V` to the new value `B`, but only if the value in `V` matches the expected old value `A`; otherwise it does nothing.

When multiple threads attempt to update the same variable simultaneously using CAS, one wins and updates the variable's value, and the rest lose.

__Implementation of CAS__:
- Java package ___[java.util.concurrent.atomic](https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/concurrent/atomic/package-summary.html)___ implements 'compareAndSet' in various classes.
- Atomic read-modify-write operations such as compareAndSet.

__Simulated CAS Operation__:

```kotlin
import javax.annotation.concurrent.ThreadSafe

@ThreadSafe
class SimulatedCAS {

    @Volatile
    private var value: Int = 0

    @Synchronized
    fun get(): Int {
        return value
    }

    @Synchronized
    fun compareAndSwap(expectedValue: Int, newValue: Int): Int {
        val oldValue = value
        if (oldValue == expectedValue) {
            value = newValue
        }
        return oldValue
    }
}
```

CAS 는 다른 스레드의 간섭을 감지할 수 있기 때문에 잠금 없이 원자 read-modify-write 시퀀스를 구현하는 문제를 해결한다.

1. 읽기 (Read): 현재 메모리에서 값을 읽어옵니다. 이를 oldValue 또는 **expectedValue**라고 부른다.
2. 비교 (Compare): 스레드가 작업을 시작할 때 기억한 **expectedValue**와 메모리의 실제 값을 비교합니다.
  - 만약 메모리의 값이 **expectedValue**와 같다면, 다른 스레드가 간섭하지 않았다고 판단한다.
3. 교체 (Swap): 값이 같을 때만 **newValue**로 값을 교체한다. 이 연산은 원자적(Atomic)으로 수행된다.
4. 실패 감지: 값이 다를 경우, 다른 스레드가 값을 수정한 것으로 간주하여 교체를 취소한다. CAS 연산은 실패를 반환하여 간섭을 알린다.

### Compare and Exchange (CMPXCHG)

![](/resource/wiki/algorithm-compare-and-swap/compare-and-exchange.png)

**CAS(Compare-And-Swap)** 는 락 없이(lock-free) 스레드 세이프한 코드를 작성할 수 있게 하는 기술이다. CAS 는 원자적(atomic) 연산을 통해 값을 비교하고, 예상된 값과 같을 때만 새로운 값으로 교체하는 방식으로 동작한다. 이를 통해 **스레드 간 경쟁 상태(race condition)** 를 방지하면서도, 락을 사용하는 방식보다 성능이 뛰어나다.

- CAS 는 단일 원자적 연산으로 **비교(Compare)** 와 **교체(Swap)** 를 동시에 수행한다.
- CPU 수준에서 제공하는 하드웨어 명령어(예: CMPXCHG, LDREX/STREX)를 활용하여 중단 없이 수행되므로, 다른 스레드가 값에 개입했는지 감지할 수 있다.

## ConcurrentHashMap

ConcurrentHashMap 의 put 등의 메서드를 살펴보면 putval 메서드를 호출하는 것을 알 수 있다. 이 메서드를 분석해볼 것이다.

![](/resource/wiki/algorithm-compare-and-swap/putval.png)

Node 라고 불리는 key-value entry table 을 사용함을 알 수 있다. 그리고 casTabAt 을 통해 ___CAS___ 를 사용중임을 알 수 있다.

![](/resource/wiki/algorithm-compare-and-swap/compare-and-set-reference.png)

casTabAt 는 내부적으로 **JNI(Java Native Interface)** 를 통해 JVM 내부에서 네이티브 코드로 실행되는 원자적 CAS 연산을 수행하는 compareAndSetReference 메서드를 사용하는 것을 알 수 있다.

다음으로는 initTable 쪽을 보자.

![](/resource/wiki/algorithm-compare-and-swap/inittable.png)

__spin wait mechanism__:

```java
if ((sc = sizeCtl) < 0)
    Thread.yield(); // 다른 스레드가 초기화 중이면 양보
```

- **sizeCtl** 이 음수(< 0)인 경우, 다른 스레드가 이미 초기화를 진행 중임을 의미한다.
- 이 경우 **Thread.yield()** 를 호출하여 CPU 를 양보하고, 다른 스레드가 작업을 완료할 때까지 스핀 대기한다.

### Thread State, Lifecycle

![](/resource/wiki/algorithm-compare-and-swap/thread-state.png)

Java 의 스레드는 I/O, interrupt, sleep 과 같은 상황에서 blocked 또는 waiting 상태로 전환되며, 이때 CPU는 다른 스레드에게 제어권을 넘기기 위해 ___[Context Switching](https://klarciel.net/wiki/kotlin/kotlin-coroutine-thread/#context-switching)___ 이 발생한다. Context Switching 은 CPU 가 다른 스레드를 실행하기 위해 스레드의 실행 문맥을 저장하고 복원하는 작업이다.

## References

- JAVA Concurrency in Practice / BRIAN GOETZ