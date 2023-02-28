---
layout  : wiki
title   : JVM Optimization with warm up (작성중)
summary : 
date    : 2023-02-25 11:28:32 +0900
updated : 2023-02-25 12:15:24 +0900
tag     : java jvm
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## JIT Compiler

__A JIT compiler compiles bytecode to native code for frequently executed sections.__ This is in contrast to ahead-of-time (AOT) compilation, where the source code is compiled into machine code before the program is executed.

When a program is run with a JIT compiler, the source code is initially interpreted by the runtime environment, and then the JIT compiler generates machine code for the parts of the program that are frequently executed. This generated code is then stored in memory and used for subsequent calls to that part of the program. By generating optimized code for frequently executed parts of the program, JIT compilers can improve the overall performance of the program.

JIT compilers are commonly used in environments such as Java and .NET, where the source code is compiled into an intermediate language (bytecode), which is then executed by the runtime environment. In these cases, the JIT compiler generates machine code from the bytecode as the program is running.

![](/resource/wiki/java-jvm-warmup/jit-process.png)

__JIT Compiler 는 Byte Code 를 Machine Code 로 변환하는 과정에서 Machine Code 를 [Cache Code](https://www.baeldung.com/jvm-code-cache) 에 저장하고 활용한다.__ JIT Compiler 는 런타임에 Byte Code 를 해석하는 Overhead 를 줄이기 위한 것이다. (Interpreter 가 갖고있는 성능적 한계를 개선하기 위함)
즉, Bytecode 의 성능을 최적화하기 위한 용도이다. Oracle 에서는 JIT Compiler 를 Hotspot JIT Compiler 라고 부른다.

JIT Compiler 는 실행하는 과정에서 기계어로 변환하는 과정을 최적화 하기 위한 것이다. 하지만, 애플리케이션이 처음 실행되는 시점에는 자주 사용되는 바이트코드가 캐시된 내역이 없기 때문에 자연스럽게 성능 이슈가 발생할 수 있다.

따라서, 애플리케이션 실행 시 의도적으로 __warm up__ 과정을 통해 미리 Cache 해두는 과정이 필요하다.

## JVM warm-up

> Application 시작 단계에서 발생할 수 있는 초기 오버헤드를 줄이기 위한 목적

- [How to Warm Up the JVM](https://www.baeldung.com/java-jvm-warmup)

새 JVM 프로세스가 시작될 때마다 필요한 모든 클래스가 ClassLoader 인스턴스에 의해 메모리에 로드된다.
- [Run-time Built-in Class Loaders](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/ClassLoader.html)

Once class-loading is complete, all important classes (used at the time of process start) are pushed into the JVM cache (native code) – which makes them accessible faster during runtime. Other classes are loaded on a per-request basis.

Keeping this in mind, for __low-latency applications__, we need to cache all classes beforehand – so that they're available instantly when accessed at runtime. 

대기 시간이 짧아야 하는 애플리케이션의 경우(e.g 계정 서비스, 인증 서비스 등)에 초기 오버헤드를 줄이는 것이 중요하다.

This process of tuning the JVM is known as warming up.

- [Java virtual machine cache custom properties](https://www.ibm.com/docs/en/was-nd/8.5.5?topic=offload-java-virtual-machine-cache-custom-properties)

> JVM warm-up refers to the process of preparing the Java Virtual Machine (JVM) for optimal performance by executing a set of preliminary tasks before running the actual application code. The goal of JVM warm-up is to ensure that the JVM has completed any necessary initialization and optimization steps, so that the application runs smoothly and efficiently from the start.
>
> When a Java program is executed for the first time, the JVM may need to perform certain initialization steps such as loading classes and optimizing code. These steps can cause some performance overhead, which may slow down the execution of the program during the initial phase.
>
> JVM warm-up involves executing the application code several times to give the JVM a chance to perform these initialization and optimization steps, which results in better performance and faster execution times in subsequent runs. This is particularly important for long-running applications such as servers, where the initial overhead can be amortized over time.
>
> There are various techniques for JVM warm-up, such as executing the application with different input parameters or simulating a typical usage pattern to trigger the JIT compiler to optimize the code. Some Java frameworks and tools also provide specific mechanisms for JVM warm-up, such as Apache JMeter for load testing or Spring Boot for running microservices.

### Kubernetes liveness, and readiness probes

Combining JVM warm-up, Kubernetes liveness, and readiness probes can improve performance in a number of ways:

1. __JVM warm-up__: As mentioned earlier, JVM warm-up involves executing an application several times to give the JVM a chance to perform initialization and optimization steps. This can result in better performance and faster execution times in subsequent runs. By using a JVM warm-up process, we can ensure that the application is fully optimized and ready to run at peak performance.
2. __Kubernetes liveness probes__: Liveness probes(health-check) are used by Kubernetes to check whether an application is still running and responding to requests. By configuring liveness probes to run at regular intervals, we can ensure that the application is always available and ready to handle requests. This can help to improve performance by minimizing downtime and ensuring that the application is always ready to serve requests.
3. __Kubernetes readiness probes__: Readiness probes are used by Kubernetes to check whether an application is ready to receive requests. By configuring readiness probes to run after the JVM warm-up process has completed, we can ensure that the application is fully optimized and ready to handle requests. This can help to improve performance by ensuring that requests are only routed to the application when it is ready to handle them.

![](/resource/wiki/java-jvm-warmup/warm-up.png)

JVM warm-up 은 Liveness, Readiness Probes 과정에서 처리하게된다. 즉, warm-up 이 완료된 이후에만 Traffic 이 유입되도록 개선할 수 있다. 각 Pod 마다 Localhost GET API 요청을 하도록 하여 Warm-up 을 진행할 수 있다.

By using a JVM warm-up process to ensure that the application is fully optimized and ready to run, and by using liveness and readiness probes to ensure that the application is always available and ready to handle requests, we can improve performance and ensure that the application runs smoothly and efficiently.

위와 같은 방식으로 Kakao T 계정 서비스 팀에서 개선하여 배포하였으나 TPS 가 더 높아지고나서 비슷한 양상이 나왔다고 함.

그리고 개선하기 위한 아이디어로는 다음과 같았다고 함

1. ~~Graal JIT~~
2. ~~AOT(Ahead of time) Compile~~
3. ~~Redis 사용 API 에서 Latency 가 많아 Redis Connection Pool 도입~~
4. 실제 트래픽과 같은 수로 warm-up 을 시도 (warm-up count)

warm-up count 로 이슈를 해결했다고 함. 이를 위해 JIT 내부 동작에 대해 알아야 함.

## Tiered Compilation

JIT 은 Method 전체 단위로 컴파일을 함. __Method__ 내 모든 Bytecode 는 Native Code 로 컴파일됨. 그 후 후속 최적화 작업을 위해
__Profiling__ 정보를 수집함. 그리고 단계별 최적화를 위해 __Tiered compilation__ 을 실행함.

[Tiered Compilation in JVM](https://www.baeldung.com/jvm-tiered-compilation)

![](/resource/wiki/java-jvm-warmup/tiered-compiliation.png)

The tiered compilation concept was first introduced in Java 7. Its goal was to use a mix of C1 and C2 compilers in order to achieve both fast startup and good long-term performance.

Tiered Compilation 은 아래 두 단계 Compile 로 이루어짐
- C1: optimization (간략한 최적화)
- C2: fully optimization (최대 최적화)

C1 의 임계치 만큼 메서드가 호출되면 C1 이 실행되며, 그 후 C2 임계치 만큼의 메서드가 호출되면 C2 가 실행됨.

Here is a brief overview of how the JIT Compiler works:

1. __Method inlining__: The JIT Compiler identifies frequently called methods in the application code and inlines the method code into the calling code to avoid the overhead of method invocation.
2. __Profiling__: The JIT Compiler uses profiling data to determine which sections of the code are executed most frequently. The profiling data can include information about how many times each method is called, which code paths are executed most frequently, and how long each method takes to execute. This information is used to guide the JIT Compiler's optimization decisions. __JVM also collects profiling information on the C1 compiled code.__
3. __Tiered Compilation__: The JIT Compiler uses a tiered compilation model to gradually optimize the code over time. In the first tier, the code is compiled quickly using a simple algorithm, which allows the code to start running as quickly as possible. In the second tier, the code is compiled more aggressively using more complex optimization techniques, which improves the performance of the code over time. This approach allows the JIT Compiler to quickly generate code that is good enough for most cases, while still providing the ability to optimize the code further as needed.

## Links

- [JVM warm up / if(kakao)2022](https://www.youtube.com/watch?v=CQi3SS2YspY)
- [JVM warm up](https://speakerdeck.com/kakao/jvm-warm-up)

