---
layout  : wiki
title   : Abstracted Native by Wrapping
summary : Synchronized with Monitors described to OS level
date    : 2024-03-31 11:28:32 +0900
updated : 2024-03-31 12:15:24 +0900
tag     : java reactive jni oop operatingsystem
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Abstraction by Wrapping

I/O Access(FileSystem, Disk ..) 를 하기 위해서는 __[system call](https://baekjungho.github.io/wiki/operatingsystem/os-system-call/)__ 을 통해 Kernel Space 에 진입하여 OS 와 상호 작용을 해야 한다.

예를 들어, C 언어에서 exit(1)을 호출하면 해당 함수는 내부적으로 올바른 레지스터/스택/기타에 시스템 호출의 [opcode](https://en.wikipedia.org/wiki/Opcode) 인수를 배치한 후 인터럽트를 트리거하는 기계 코드를 실행한다.

Java 에서는 [Java Native Interface](https://www.baeldung.com/jni) 라는 것이 있다. hardware handling or performance improvement 를 위해서 __Natvie Code__ (C/C++ 로 코딩된 네이티브 메서드) 를 사용해야 한다. 이 Native Code 는 바이트 코드로 컴파일 되지 않는다.

JDK 에서는 JVM 내에서 실행되는 byte code 와 native code 사이의 bridge 를 제공하는데 이것이 [JNI](https://docs.oracle.com/en/java/javase/21/docs/specs/jni/functions.html) 이고, JNI 를 통해서 system call 을 하게 된다.

__System call by JNI__:

```
JVM -> JNI -> 시스템 콜 -> 커널 -> 디스크 컨트롤러 -> 커널 버퍼 복사 -> JVM 버퍼 복사
```

Java 에서 System.exit 코드를 쭉 들어가면 아래와 같이 native code 를 사용하는 것을 알 수 있다. native code 를 사용하는 순간 thread 는 [_thread_in_native](https://hg.openjdk.org/jdk8u/jdk8u/hotspot/file/312e113bc3ed/src/share/vm/utilities/globalDefinitions.hpp#l852) 상태가 된다.

```java
static native void halt0(int status);
```

즉, Java 에서 OS Kernel Space 를 조작하기 위해서 JNI 를 통해 system call 을 하게 되고, 우리는 System.exit 과 같은 __추상화된(abstracted)__ 메서드를 사용하여 쉽게 I/O Access 등을 할 수 있는 것이다.

### Monitors in Process Synchronization

Java's execution environment supports mutual exclusion via an entrance queue & synchronized method.

Mutual exclusion - allows concurrent access & updates to shared resources without race conditions.

[Monitors are a higher-level synchronization construct that simplifies process synchronization](https://www.geeksforgeeks.org/monitors-in-process-synchronization/) by providing a high-level abstraction for data access and synchronization. Monitors are implemented as programming language constructs, typically in object-oriented languages, and provide mutual exclusion, condition variables, and data [encapsulation](https://baekjungho.github.io/wiki/oop/oop-encapsulation/) in a single construct.

Java 에서 synchronized 키워드를 사용하여 공유 자원(shared resources)을 보호 할 수 있다. 이 synchronized 도 잘 추상화된 API 라고 할 수 있다.

Java 의 synchronized 가 Monitors 라는 기법을 사용한다. Monitor in Java Concurrency is a synchronization mechanism. Monitors 는 본질적으로 __[encapsulates](https://baekjungho.github.io/wiki/oop/oop-encapsulation/) a [shared resource](https://baekjungho.github.io/wiki/spring/spring-concurrency/)__ 한다.
__[Monitors](https://docs.oracle.com/javase/7/docs/api/javax/management/monitor/Monitor.html)__ 는 __베타동기, 조건동기__ 라는 두개의 queue 를 활용하여 Critical Section 을 보호한다.

![](/resource/wiki/java-abstraction-by-wrapping/monitor.png)

- 베타동기: 하나의 스레드만 공유자원에 접근하게 해준다. 공유자원을 사용하는 스레드가 존재하면, 베타동기 큐에서 대기한다.
- 조건동기: 공유자원을 사용하는 스레드가 Block 을 당하면서, 새로운 스레드가 진입하게 해준다. Block 당한 스레드는 조건동기에서 대기한다. 만약 공유자원을 사용하는 스레드가 깨우고 임계영역에서 나가면, 깨워진 스레드가 진입한다.

__[Synchronization Docs](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.1)__:

The Java programming language provides multiple mechanisms for communicating between threads. The most basic of these methods is synchronization, which is implemented using monitors. Each object in Java is associated with a monitor, which a thread can lock or unlock. Only one thread at a time may hold a lock on a monitor. Any other threads attempting to lock that monitor are blocked until they can obtain a lock on that monitor.

## Links

- [Java Built-in Monitor Objects: Overview - Youtube](https://www.youtube.com/watch?v=NJ_ga8RlCr4)
- [Difference Between Lock and Monitor in Java Concurrency](https://www.geeksforgeeks.org/difference-between-lock-and-monitor-in-java-concurrency/)
- [시스템 콜과 자바에서의 시스템 콜 사용례 - 개발한입](https://brewagebear.github.io/java-syscall-and-io/)
- [운영체제 - 상호배제와 동기화(뮤텍스,TAS,세마포어,모니터)](https://coding-start.tistory.com/201)
- [자바를 이해하기 위한 운영체제 공부 2. 모니터(Monitors)](https://m.blog.naver.com/gngh0101/221174237333)
- [Java 로 동기화를 해보자! - Tecoble](https://tecoble.techcourse.co.kr/post/2021-10-23-java-synchronize/)

## References

- [Thread Synchronization](https://www.artima.com/insidejvm/ed2/threadsynch.html)
- [Monitor Object - An Object Behavioral Pattern for Concurrent Programming](https://www.dre.vanderbilt.edu/~schmidt/PDF/monitor.pdf)