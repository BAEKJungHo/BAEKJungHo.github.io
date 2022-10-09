---
layout  : wiki
title   : Actor Model and Akka
summary : Akka Streams 에서의 Actor Model
date    : 2022-10-06 15:05:32 +0900
updated : 2022-10-06 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/Reactive]]
latex   : true
---
* TOC
{:toc}

## Parallelism Models

- __Actor Model__ Erlang, Scala, Rust, Java, .Net
- __Communication Sequential Processes (CSP)__ Golang
- __Threads__  Java, C#, C++, C, and others.

## From: Reactive Systems Explained

### Actor Model

> The [actor model concept](https://dl.acm.org/doi/10.5555/1624775.1624804) was introduced by Carl Hewitt, Peter
Bishop, and Richard Steiger in 1973 as an architectural foundation
14 | Chapter 3: Your Toolbox to Reactive
for artificial intelligence. The model has been refined over the deca‐
des, and many excellent resources on the topic are now available.
In the actor model, actors are the fundamental unit of computation,
and they have some important qualities that make them especially
suitable to a distributed systems environment. __First__, actors are light‐
weight, loosely coupled, and maintain their own state. __Second__,
message-passing between actors is completely asynchronous and
without restriction to message ordering, making computations done
throughout a system of actors inherently concurrent. __Also__, because
interaction between actors is limited to message passing, they can be
distributed across nodes (servers, virtual machines, containers). The
result is a computational model that achieves concurrency, parallel‐
ism, and an inherent ability to scale horizontally.
The actor model does require you to think differently in your
approach to programming, but there are languages and frameworks
to help out.
> 
> - __Anatomy of Actor Model__
>
> ![](/resource/wiki/reactive-actor-model/actor.png)

### Akka

> [Akka](https://akka.io/) is an open source “toolkit for building highly concurrent, dis‐
tributed, and resilient message-driven applications” running on a
JVM. In addition to providing a hierarchical actor implementation
(essential for failure detection/recovery), Akka includes libraries for
actor cluster management, sharding, and persistence (invaluable for
distributing applications across compute resources).
Let’s go back to our discussion of concurrency, parallelism, and
threads. In Akka, a message [dispatcher](https://doc.akka.io/docs/akka/current/dispatchers.html#introduction) is central to how threads are
managed within an actor system. The dispatcher defines the execu‐
tor service to be used, the size of the thread pool, and how many
messages an actor may process before it relinquishes a thread. The
dispatcher assigns a thread to an actor only when it has a message in
its queue. The actor processes the messages and then gives back the
thread. The obvious advantage is that threads are consumed only
when there is actual work to be done. A less obvious advantage is
that idle actors remain in memory, meaning they are immediately
available for execution at all times. This presents little impact to sys‐
tem resources given that actors are quite small (less than one kilo‐
byte), even if there are hundreds of thousands of them on a given
node. The result is a highly efficient use of processor resources.
 
## From: Akka Docs

### Akka Streams

> Akka Streams implements the Reactive Streams standard for asynchronous stream processing with non-blocking back pressure.
>
> Since Java 9 the APIs of Reactive Streams has been included in the Java Standard library, under the java.util.concurrent.Flow namespace. For Java 8 there is instead a separate Reactive Streams artifact with the same APIs in the package org.reactivestreams.
>
> Akka streams provides interoperability for both these two API versions, the Reactive Streams interfaces directly through factories on the regular Source and Sink APIs. 

## Links

- [Introduction Reactive System. Akka Actor Model & Akka Modules Fundamental](https://www.linkedin.com/pulse/introduction-reactive-system-akka-actor-model-modules-oluwaseyi-otun/)
- [Reactive Streams Interop - Akka Doc](https://doc.akka.io/docs/akka/current/stream/reactive-streams-interop.html)

## 참고 문헌

- Reactive Systems Explained / Grace Jansen & Peter Gollmar 저 / O'REILLY