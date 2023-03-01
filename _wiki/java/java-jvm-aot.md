---
layout  : wiki
title   : Ahead of Time Engine Optimizations
summary : Spring Native with GraalVM
date    : 2023-02-26 11:28:32 +0900
updated : 2023-02-26 12:15:24 +0900
tag     : java jvm spring
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Native

In the context of software development, the term __"native"__ typically refers to code that is compiled to run directly on a specific processor or operating system, without requiring any additional layers of abstraction or interpretation.

In this sense, native code is often used interchangeably with "machine code," as both refer to code that is compiled to run on a specific processor architecture. Native code is optimized for the specific hardware and operating system on which it is intended to run, which can result in faster performance and better resource utilization than code that is not native.

However, it is worth noting that "machine code" can also refer more broadly to any code that can be executed directly by a processor, including bytecode or assembly language, whereas "native code" specifically refers to code that is compiled to run on a particular processor architecture.

### Native Image

__A native image is a compiled executable file containing machine code optimized for a particular hardware and operating system architecture, typically created using an Ahead-of-Time compiler.__ They are often used in applications where performance is critical or in serverless computing environments.

[Native Image](https://www.graalvm.org/latest/reference-manual/native-image/) is a technology to compile Java code ahead-of-time to a binary – a native executable.

위 GraalVM Native Image 문서를 읽어보면 Native Image 를 사용했을때의 이점이라고 해서 아래와 같이 설명이 되어있다.

An executable file produced by Native Image has several important advantages, in that it

- Uses a fraction of the resources required by the Java Virtual Machine, so is cheaper to run
- Starts in milliseconds
- __Delivers peak performance immediately, with no warmup__
- Can be packaged into a lightweight container image for fast and efficient deployment
- Presents a reduced attack surface

이점들 중에서 warmup 이 필요 없다고 되어있다. 당연한 얘기지만 Compiler Time 에 미리 Native Code 로 변환해 놓으니 필요가 없을 것이다.

> [JVM Optimization with warm up](https://baekjungho.github.io/wiki/java/java-jvm-warmup/)
> 
> JIT compiler 는 실행 시점(runtime)에 bytecode 를 native code 로 변환한다. JIT Compiler 도 성능 최적화를 위해 생겨난 녀석이다.
JIT Compiler 는 Byte Code 를 Machine Code 로 변환하는 과정에서 Machine Code 를 Cache Code 에 저장하고 활용한다. JIT Compiler 는 런타임에 Byte Code 를 해석하는 Overhead 를 줄이기 위한 것이다.

## Ahead-Of-Time Engine

[AOT 컴파일(ahead-of-time compile)](https://ko.wikipedia.org/wiki/AOT_%EC%BB%B4%ED%8C%8C%EC%9D%BC)은 목표 시스템의 기계어와 무관하게 중간 언어 형태로 배포된 후 목표 시스템에서 인터프리터나 JIT 컴파일 등 기계어 번역을 통해 실행되는 중간 언어를 미리 목표 시스템에 맞는 기계어로 번역하는 방식을 지칭한다.

쉽게 말해, __AOT(ahead-of-time)는 네이티브 이미지 컴파일러__ 라고 생각하면 된다.

미리 실행 가능한 Native Code 로 Compiler 을 해둔다면, JIT Compiler 를 사용하는 것보다 많은 성능적 이점이 있을 것이다.

[Spring Native turns Spring apps into native executables](https://www.infoworld.com/article/3611975/spring-native-turns-spring-apps-into-native-executables.html)

Spring Native 0.11.0 은 GraalVM 의 Multi-Language Runtime 을 사용하여 Spring 애플리케이션을 네이티브 이미지로 컴파일한다 . 이러한 독립 실행형 실행 파일은 거의 즉각적인 시작(일반적으로 100ms 미만), 즉각적인 최고 성능, 낮은 메모리 소비 등의 이점을 제공하지만 JVM 보다 빌드 시간이 길고 런타임 최적화가 적다.

플랫폼에 맞게 미리 컴파일해서 사용하는 경우는 Embedded 같은 곳일 것이다. 그런데 JVM 의 장점은 __플랫폼 독립적__ 이라는 것을 ("자바를 처음 공부할때 배운다.") 알 것이다. 즉, Java 로 작성된 프로그램은 어떤 OS 던지간에 JVM 만 있으면 사용가능하기 때문에 플랫폼에 독립적이다.

그런데 Spring Native 를 쓰면 GraalVM 을 쓸테고 AOT Compiler 를 쓸텐데 JVM 의 이점인 __플랫폼 독립적__ 인 특징이 없어지는게 아닐까? 

> AOT 컴파일은 코드를 모든 JVM 에서 실행할 수 있는 바이트코드로 컴파일하는 대신 실행될 플랫폼 및 하드웨어 아키텍처에 특정한 기계 코드로 컴파일하는 작업을 포함한다.

JVM 과 같이 쓸 수 있다고 하고 [GraalVM Architecture](https://www.graalvm.org/latest/docs/introduction/#graalvm-architecture) 를 보면 __Java HotSpot VM__ 을 포함하고 있다.

It is possible to use GraalVM and the JVM (Java Virtual Machine) together in various configurations.

GraalVM is a high-performance, polyglot virtual machine that provides several benefits over the standard JVM, including improved startup time, reduced memory usage, and support for multiple programming languages.

One way to use GraalVM with the JVM is to use it as a replacement for the standard JVM. GraalVM includes a version of the JVM that is fully compatible with Java SE, so Java applications can be run on GraalVM without any modifications.

Another way to use GraalVM and the JVM together is to use GraalVM's just-in-time (JIT) compiler as an alternative to the JVM's default JIT compiler. GraalVM's JIT compiler can provide improved performance over the default JIT compiler in certain scenarios, particularly for code that makes heavy use of dynamic language features like method handles or reflection.

Finally, it is also possible to use GraalVM's Ahead-of-Time (AOT) compilation feature with the JVM. This involves pre-compiling Java bytecode to a native image that can be run without the need for a JVM. This can provide faster startup times and reduced memory usage compared to running on a standard JVM, but it also requires more upfront work to configure and optimize the AOT compilation process.

In summary, GraalVM can be used in various ways with the JVM, including as a replacement for the standard JVM, as a JIT compiler alternative, or with AOT compilation. The specific configuration will depend on the requirements and constraints of the application being developed.

## Why GraalVM has JIT

AOT 를 사용하면 컴파일 시점에 native code 로 컴파일 되니까 JIT 처럼 런타임에 최적화가 필요 없는 것으로 알고 있다. GraalVM 문서에서도 warm-up 이 필요 없다고 나와있다. 그런데도 GraalVM 에 JIT 가 있는 이유는 AOT 기능을 사용하지 않았을때를 위함인가 궁금해서 ChatGPT 에게 물어봤다.

GraalVM's JIT compiler can also be used to optimize code that has not been AOT-compiled. This can be useful in scenarios where AOT compilation is not practical or desirable, such as when the application code is frequently changing or when it needs to run on multiple platforms.

It is still possible to use JIT compilation with AOT-compiled code in GraalVM. GraalVM includes a highly optimized JIT compiler that can provide additional performance improvements on top of the already-optimized AOT-compiled code.

Native code 로 컴파일 되더라도 JIT 를 사용하여 더 최적화를 할 수 있다. (어찌보면 당연한 것 같기도하다, JIT Compiler 가 native code 를 cache 해서 최적화하는 것이니)

__How JIT optimizes native code compiled with AOT:__
1. __Inlining__: The JIT compiler can analyze the call graph of the code and inline frequently called functions or methods. This can reduce the overhead of function calls and improve performance.
2. __Code specialization__: The JIT compiler can generate specialized versions of the code that are optimized for specific input types or conditions. This can improve performance by avoiding generic code paths that may not be as efficient.
3. __Dead code elimination__: The JIT compiler can analyze the code and identify code paths that are never executed, and eliminate them from the compiled code. This can reduce the size of the compiled code and improve performance.
4. __Loop optimization__: The JIT compiler can analyze loops in the code and optimize them for better performance, such as by unrolling loops or optimizing loop conditions.

Profile-guided optimization: The JIT compiler can use runtime profiling data to guide optimizations, such as by prioritizing frequently executed code paths or optimizing code based on specific runtime conditions.

## GraalVM Native Image Support

[GraalVM Native Image Support](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#spring-aot)

Native Image 를 미리 만든다는 것은 정적이다. 하지만 Spring 애플리케이션은 동적이며 Runtime 에 수행된다. In fact, the concept of Spring Boot auto-configuration depends heavily on reacting to the state of the runtime in order to configure things correctly.
- [Understanding Spring Ahead-of-Time Processing](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html#native-image.introducing-graalvm-native-images.understanding-aot-processing)

## Links

- [New AOT Engine Brings Spring Native to the Next Level](https://spring.io/blog/2021/12/09/new-aot-engine-brings-spring-native-to-the-next-level)
- [Ahead of Time Optimizations in Spring 6](https://www.baeldung.com/spring-6-ahead-of-time-optimizations)
- [GraalVM Native Image Support](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html)
