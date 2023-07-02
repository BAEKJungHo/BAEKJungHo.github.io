---
layout  : wiki
title   : Multithreading
summary : 
date    : 2023-07-01 15:28:32 +0900
updated : 2023-07-01 19:15:24 +0900
tag     : java linux operatingsystem
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Multithreading

A thread is a sequence of control within a process. A single-threaded process follows a single sequence of control while executing. An MT process has several sequences of control, thus is capable of several independent actions at the same time. When multiple processors are available, those concurrent but independent actions can take place in parallel.

## Multithreading Models

### Green Threads - Many to One Model

__Many user threads to One kernel thread(Many to One Model)__ 에서 모든 Thread 의 활동은 UserSpace 로 제한된다.

![](/resource/wiki/java-multithreading/green-thread.png)

그림을 보면 알 수 있듯이, Additionally, __only one thread at a time can access the kernel__, so only one schedulable entity is known to the operating system. 즉, 여러개의 JavaThread 가 있더라도 딱 하나의 JavaThread 만 KernelThread 에 Mapping 된다고 보면된다.
This changed in Java 1.2, and there has not been any support for it at the JVM level since.

### One to One Model

__One user thread to One kernel thread(One to One Model)__ 에서 Each user-level thread created by the application 는 각각 Kernel 로 알려지며, All threads can access the kernel at the same time.

![](/resource/wiki/java-multithreading/one-to-one.png)

이 방식의 단점은, 지원되는 스레드의 수가 제한된다는 점이다.

### Native Threads - Many to Many Model

__Many user-level threads to Many kernel-level threads(Many to Many Model)__ 는 1:1 Model 의 제한을 피한다.

![](/resource/wiki/java-multithreading/many-to-many.png)

JavaApplication 은 Process 를 너무 무겁게 만들지 않을 정도의 스레드를 가질 수 있다.

The standard way of implementing multi-tasking in Java is to use threads. The standard threading model in Java, covering all JVM languages, uses native threads. This has been the case since Java 1.2 and is the case regardless of the underlying system that the JVM is running on.

Native Threads directly map to threads of execution on the computer CPU – and the operating system manages the mapping of threads onto CPU cores.

## Lightweight Process

위 Figures 를 살펴보면 LWP(Light Weight Process) 라는 개념이 등장하는데, 쉽게 말해 JavaThreads 와 KernelThreads 를 매핑해주는 역할을 한다고 보면된다. Intermediate Layer 이다.

__[Lightweight Processes](https://docs.oracle.com/cd/E19455-01/806-5257/6je9h032e/index.html)__:

![](/resource/wiki/java-multithreading/lwp.png)

The threads library uses underlying threads of control called lightweight processes that are supported by the kernel. You can think of an LWP as a __virtual CPU__ that executes code or system calls.

Automatic concurrency control for unbound threads. The threads library dynamically expands and shrinks the pool of LWPs to meet the demands of the application. All Java threads are unbound by default. Unbound user-level threads defer control of their concurrency to the threads library, which automatically expands and shrinks the pool of LWPs to meet the demands of the application's unbound threads.

### Scheduling

Each LWP is a kernel resource in a kernel pool, and is allocated (attached) and de-allocated (detached) to a thread on a per thread basis.

![](/resource/wiki/java-multithreading/lwp-scheduling.png)

[Scheduling](https://docs.oracle.com/cd/E19455-01/806-5257/6je9h032e/index.html#mtintro-69945) 문서에 설명이 잘 나와있다. 기본적으로 대부분의 Thread 는 unbound 상태이며, LWP Pool 에서 사용 가능한 LWP 와 Bound 될 수 있도록 User space 공간에서 예약된다.
Unbound threads are created [PTHREAD_SCOPE_PROCESS](https://man7.org/linux/man-pages/man3/pthread_attr_setscope.3.html).

Thread 가 LWP 와 Bound 되면 Bound Thread 라고 하며 System Scope 에 속한다.

## Java Native Interface

[자바 네이티브 인터페이스(Java Native Interface, JNI)](https://ko.wikipedia.org/wiki/%EC%9E%90%EB%B0%94_%EB%84%A4%EC%9D%B4%ED%8B%B0%EB%B8%8C_%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4)는 자바 가상 머신(JVM)위에서 실행되고 있는 자바코드가 네이티브 응용 프로그램(하드웨어와 운영 체제 플랫폼에 종속된 프로그램들) 그리고 C, C++ 그리고 어샘블리 같은 다른 언어들로 작성된 라이브러리들을 호출하거나 반대로 호출되는 것을 가능하게 하는 프로그래밍 프레임워크이다.

__[JNI Interface Functions and Pointers](https://docs.oracle.com/javase/9/docs/specs/jni/design.html#jni-interface-functions-and-pointers)__:

![](/resource/wiki/java-multithreading/jni.png)

A __VM implementing the JNI__ may allocate and store thread-local data in the area pointed to by the JNI interface pointer.

파일 읽기 및 쓰기, 네트워크 통신 같은 기능을 사용하기 위해서는 OS 에게 작업을 요청을 해야하는데 __system call__ 을 통해 요청하게 된다. 자바에서 system call 을 하기 위해서는 
보통 C,C++ 같은 Natvie Code 로 작성이 되어있다.

[Java 스레드가 JNI 를 통해 Linux 스레드에 매핑되는 방법을 보여주는 작은 데모 APP](https://github.com/unmeshjoshi/jvmthreads) 해당 GitHub 를 보면
Linux Threads 가 Java Threads 보다 적은 수를 가지고 있음을 알 수 있다. 

## Links

- [Threading Models in Java](https://www.baeldung.com/java-threading-models)
- [How Java thread maps to OS thread?](https://medium.com/@unmeshvjoshi/how-java-thread-maps-to-os-thread-e280a9fb2e06)

## References

- [Oracle Multithreading](https://docs.oracle.com/cd/E19620-01/805-4031/6j3qv1oed/index.html)