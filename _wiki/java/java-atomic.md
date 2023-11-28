---
layout  : wiki
title   : Volatile Solves Memory Visibility and Atomic Solves Concurrency
summary : 
date    : 2022-11-24 11:28:32 +0900
updated : 2022-11-24 12:15:24 +0900
tag     : java concurrency
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Volatile Solves Memory Visibility

__Shared Multiprocessor Architecture__:

![](/resource/wiki/ddd-claim/process.png)

프로세서는 프로그램 명령 실행을 담당한다. CPU 는 초당 많은 명령을 전송하기 때문에 RAM 에서 가져오기에는 적합하지 않다.
따라서 위 처럼 Caching 같은 트릭을 사용한다. 이렇게 하면 CPU 는 RAM 에서 데이터를 가져오지 않고, 캐시에서 데이터를 가져온다.
장점은 __성능 향상__ 이고, 단점은 __캐시 일관성__ 문제이다.

아래 예제를 보자.

```java
public class TaskRunner {

    private static int number;
    private static boolean ready;

    private static class Reader extends Thread {

        @Override
        public void run() {
            while (!ready) {
                Thread.yield();
            }

            System.out.println(number);
        }
    }

    public static void main(String[] args) {
        new Reader().start();
        number = 42;
        ready = true;
    }
}
```

동작 결과가 42일 것을 기대하지만, 영원히 멈추거나 0으로 출력될 수 있다. 이러한 문제는 __memory visibility and reordering__ 때문이다.

__Memory Visibility__:
- 스레드 캐시와 주 메모리 값은 다를 수 있다. 따라서 한 스레드가 주 메모리의 값을 업데이트하더라도 이러한 변경 사항은 다른 스레드에 즉시 표시되지 않는다.
- 대부분의 최신 프로세서는 쓰기를 특수 쓰기 버퍼에 대기시키는 경향이 있다. 쓰기 버퍼에 모아뒀다 메모리에 한꺼번에 적용한다.
- 말하자면, 메인 스레드가 number, ready 변수를 업데이트할 때 리더 스레드가 무엇을 볼지는 보장할 수 없다. 즉, 업데이트된 값을 즉시 볼 수도 있고 약간의 지연이 있을 수도 있다.

__Reordering__:

```java
public static void main(String[] args) { 
    new Reader().start();
    number = 42; 
    ready = true; 
}
```

성능 최적화를 위해 __재정렬(reordering)__ 이 발생할 수 있다. (코드의 순서와 다르게 실행될 수 있다는 의미이다.)

- 프로세서는 프로그램 순서가 아닌 순서로 쓰기 버퍼를 플러시할 수 있다. 
- 프로세서는 비순차적 실행 기술을 적용할 수 있다. 
- JIT 컴파일러는 재정렬을 통해 최적화할 수 있다.

### Volatile

이러한 캐시 일관성(cache coherence) 문제를 __volatile__ 키워드를 통해 해결할 수 있다.
즉, volatile 변수는 모든 스레드에서 동일한 값을 볼 수 있는 것이다.

Technically, any write to a volatile field happens-before every subsequent read of the same field. This is the volatile variable rule of the Java Memory Model.

가시성은 보장하지만 동시성은 보장하지 않는다. 따라서 synchorized 키워드를 추가로 사용해야하는데 이는 성능적으로 매우 좋지 않다.

## Atomic Solves Concurrency

### Compare And Swap(CAS)

CAS(compare and swap, 비교해서 바꾸기)는 저수준 프로세스 명령 및 OS 별 특성을 활용한다.

A typical CAS operation works on three operands:

- The __memory location__ on which to operate (M)
- The existing __expected value__ (A) of the variable
- The __new value__ (B) which needs to be set

The CAS operation updates atomically the value in M to B, but only if the existing value in M matches A, otherwise no action is taken.

CAS 는 여러 가지 중요한 고수준의 동시성 기능을 구성하는 기본 요소이다. CAS 하드웨어는 `sun.misc.Unsafe` 클래스를 통해 접근할 수 있다.

Unsafe 클래스는 공식적으로 지원하지 않는 내부 API 라서 언제라도 없어질 수 있다. JDK 9 부터는 jkd.unsupported 패키지로 위치를 옮겼다.

### Atomics

Atomic 인터페이스를 사용하면 동기화 문제 없이 값과 상호 작용하고 값을 업데이트할 수 있다. 내부적으로 원자 클래스는 이 경우 증분이 원자 연산이 되도록 보장한다.
따라서 Thread Safe 한 구현을 할 수 있다.

Atomics 는 값을 더하고 증감하는 복합 연한을 하며 get() 으로 계산한 결괏값을 돌려받는다.
즉, 두 개별 스레드가 증분 연산을 하면 currentValue + 1 과 currentValue + 2 가 반환된다.

__Unsafe 로 단순 아토믹 호출 구현하는 원리__:

```java
public class AtomicIntegerEx extends Number {
    
    private volatile int value;
    
    // Unsafe.compareAndSwapInt 로 업데이트하기 위해 설정
    private static final Unsafe unsafe = Unsafe.getUnsafe();
    private static final long valueOffset;
    
    static {
        try {
            valueOffset = unsafe.objectFieldOffset(AtomicIntegerEx.class.getDeclaredField("value"));
        } catch (Exception ex) {
            throw new Error(ex);
        }
    }
    
    public final int get() {
        return value;
    }
    
    public final void set(int newValue) {
        value = newValue;
    }
    
    public final int getAndSet(int newValue) {
        return unsafe.getAndAddInt(this, valueOffset, 1=newValue);
    }
    
    public final boolean compareAndSet(int expect, int update) {
        return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
    }
    
    public final native boolean compareAndSwapInt(Object o, long offset, int expected, int x);
}
```

JVM 을 호출하는 native code 가 핵심이다. 아토믹은 Lock Free 하기 때문에 Deadlock 이 없다.
비교 후 업데이트하는 작업이 실패할 경우를 대비해 내부적인 재시도 루프가 동반된다. 단점은 변수를 업데이트하기 위해 여러 차례 재시도를 하는 경우 그 횟수만큼 성능이 나빠진다.
성능을 고려할 때는 처리율을 높은 수준으로 유지하기 위해 __경합 수준__ 을 잘 모니터링해야 한다.

```java
public class SafeAtomicCounter {
    private final AtomicInteger counter = new AtomicInteger(0);
    
    public int getValue() {
        return counter.get();
    }
    
    public void increment() {
        counter.incrementAndGet();
    }
}
```

위 코드는 Thread safe 하며, 다중 스레드 애플리케이션에서 사용할 수 있다.

## Links

- [Guide to the Volatile Keyword in Java](https://www.baeldung.com/java-volatile)
- [An Introduction to Atomic Variables in Java](https://www.baeldung.com/java-atomic-variables)
- [Volatile vs. Atomic Variables in Java](https://www.baeldung.com/java-volatile-vs-atomic)

## References

- Optimizing Java / Benjamin Evans, James Gough, Chris Newland / O'REILLY
- Java Concurrency in Practice / Brian Goetz / Addison-Wesley Professional