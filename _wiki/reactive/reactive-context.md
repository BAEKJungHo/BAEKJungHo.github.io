---
layout  : wiki
title   : Mechanism of Context, Distributed Tracing with MDC
summary : Mechanism that transport contextual metadata in Project Reactor
date    : 2023-05-23 15:05:32 +0900
updated : 2023-05-23 15:15:24 +0900
tag     : reactive netty webflux logging
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Context Processing Mechanism

In Spring MVC, using __ThreadLocal__ for thread-safe. But Spring Webflux, using __Context__.
Project Reactor introduced a mechanism that is well aligned with functional programming to provide means to transport contextual metadata. It is simply called __Context__.

![](/resource/wiki/reactive-context/context.png)

ContextView is read-only versions.

__[Context Propagation with Project Reactor](https://spring.io/blog/2023/03/28/context-propagation-with-project-reactor-1-the-basics)__

```
Mono<Void> handleRequest() {
  long correlationId = correlationId();
  log("Assembling the chain", correlationId);

  Mono.just("test-product")
    .delayElement(Duration.ofMillis(1))
    .flatMap(product ->
      Flux.concat(addProduct(product), notifyShop(product))
          .then())
    .contextWrite(Context.of("CORRELATION_ID", correlationId));
```

When subscribed to, the output is as expected:

```
[      main][ 6328001264807824115] Assembling the chain
[parallel-1][ 6328001264807824115] Adding product: test-product
[parallel-1][ 6328001264807824115] Notifying shop about: test-product
```

The information flows from downstream operators to the upstream operators to initiate the processing.

Show this [Simple Context Examples](https://projectreactor.io/docs/core/release/reference/#_simple_context_examples).

## Context Storage Mechanism

[Past five user key/value pair, the Context will use a copy-on-write implementation backed by a new Map on each put.](https://github.com/reactor/reactor-core/tree/main/reactor-core/src/main/java/reactor/util/context)

```java
final class ContextN extends LinkedHashMap<Object, Object> {
  // ...
}
```

Like functional programming, Reactor copies and uses existing values whenever adding values to maintain invariant values, but until five data are stored in a context, it deceives them as if they were copied through the Copy-On-Write strategy and does not actually copy the values.

If there are more than five pieces of data stored in Context, it is stored through the __LinkedHashMap__, so if too much data is stored in the Map and used, __performance issues__ may arise.

## Distributed Tracing with MDC

__[Adding a Context to a Reactive Sequence](https://projectreactor.io/docs/core/release/reference/#context)__
- As a result, libraries that rely on ThreadLocal at least introduce new challenges when used with Reactor. At worst, they work badly or even fail. Using the __MDC of Logback__ to store and log correlation IDs is a prime example of such a situation.

> [Kotlin version - How can the MDC context be used in the reactive Spring applications](https://www.novatec-gmbh.de/en/blog/how-can-the-mdc-context-be-used-in-the-reactive-spring-applications/)
>
> In order to continue using the MDC feature in the reactive Spring application, we need to make sure that whenever a thread starts processing a request it has to update the state of the MDC context. This can be done by doing two things:
> 
> 1. All the values that we previously added directly to the MDC context should now be added to Reactor context. The framework will ensure that the reactive context is passed along the reactive execution and it will not be bounded to any specific thread.
>
> 2. Ensure that values residing in the reactive context are copied to the MDC context whenever there is a possibility that a thread that processes the request has changed. For this, we will implement the CoreSubscriber that will be hooked into the Reactor using Hooks.
>
> - [Java version for this solution](https://github.com/spring-projects/spring-framework/issues/20239#issuecomment-457030087)
> - [Reactor With MDC from 배달의민족 최전방 시스템! ‘가게노출 시스템’을 소개합니다.](https://techblog.woowahan.com/2667/)

## Introduce interop between CoroutineContext and Reactor Context

- [Introduce interop between CoroutineContext and Reactor Context](https://github.com/Kotlin/kotlinx.coroutines/issues/284)
- [Kotlin Coroutines 1.5: GlobalScope Marked as Delicate, Refined Channels API, and More](https://blog.jetbrains.com/kotlin/2021/05/kotlin-coroutines-1-5-0-released/)