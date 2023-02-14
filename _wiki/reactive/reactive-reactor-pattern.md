---
layout  : wiki
title   : Reactor Pattern
summary : 
date    : 2022-10-05 15:05:32 +0900
updated : 2022-10-05 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## From: Reactive Systems Explained

> The reactor pattern, illustrated in Figure 3-2 in its most basic form,
approaches both concurrency and parallelism. In the typical imple‐
mentation of the pattern, asynchronously received requests are
demultiplexed (in a sense, serialized) for processing. The event loop,
running on one thread, cycles through the incoming events and
handles them. Callback functions are registered for requests that will
result in a long-running task or blocking operation. The handle for
the event gets added to a queue. The event loop iterates through the
queue and will eventually observe the completion of the longrunning task, trigger a callback, and return the result to the
application.
>
> ![](/resource/wiki/reactive-reactor-pattern/reactor-pattern.png)
> 
> Node.js is one implementation of the reactor pattern,
and [its website](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/) does an excellent job of explaining how
this implementation works.

### Multireactor Pattern

> The multireactor pattern is an approach to taking fuller advantage of
the available compute resources on multicore, multithreaded pro‐
cessors. In its basic form, instead of one event loop, you have many;
the number usually depends on the number of cores on your
machine. Vert.x, an open source toolkit for building reactive appli‐
cations on the JVM, works in this way. For example, multiple event
loops each run on their own thread, delivering events/tasks to han‐
dlers and servicing them upon completion. Code with blocking calls
should be handled in the same manner as described earlier and run
asynchronously on a separate thread (taken from a predefined
thread pool).

## Event Loop

![](/resource/wiki/reactive-reactor-pattern/event-loop.png)

Above is an abstract design of an event loop that presents the ideas of reactive asynchronous programming:

- __The event loop runs continuously in a single thread__, although we can have as many event loops as the number of available cores.
- __The event loop processes the events from an event queue sequentially and returns immediately__ after registering the callback with the platform.
- The platform can trigger the completion of an operation, like a database call or an external service invocation.
- __The event loop can trigger the callback on the operation completion notification and send back the result to the original caller.__

이벤트 루프는 작업 완료 알림에서 __callback__ 을 trigger 할 수 있다. 그리고 호출자에게 결과를 전송할 수 있다. 

In this pattern, a stream of data is represented by a Publisher.

__Responsibility of Event Loop:__
  - 이벤트 루프는 Publisher 로부터의 데이터 방출을 처리하고 연산자 체인을 통해 데이터를 처리할 뿐만 아니라 입출력 및 타임아웃과 같은 다른 비동기 연산을 처리할 책임이 있다.
  - 이벤트 루프를 사용하여 Reactor 패턴은 많은 수의 동시 연결 및 데이터 스트림을 처리해야 하는 애플리케이션에 높은 처리량과 낮은 지연 시간을 제공할 수 있다.
  - 이벤트 루프는 단일 스레드에서 많은 요청과 스트림을 처리할 수 있고 컨텍스트 전환과 스레드 동기화의 오버헤드를 피할 수 있기 때문에 시스템 리소스를 효율적으로 사용할 수 있다.

### Callback

When using Spring WebFlux, various types of callbacks may be registered in the event loop depending on the operations being performed. These include:

- __Subscriber callbacks__: These are registered when a reactive stream subscriber is created to handle the emission of data from a publisher.
- __Handler callbacks__: These are registered to handle incoming HTTP requests and produce responses.
- __Timeout callbacks__: These are registered to trigger an action when a specified amount of time has elapsed, such as a timeout on an HTTP request.
- __Runnable callbacks__: These are registered to execute a block of code on the event loop, such as scheduling a periodic task.
- __Error callbacks__: These are registered to handle errors that occur during the processing of a request or a stream of data.
- __Completion callbacks__: These are registered to handle the completion of a stream or request.

#### Subscriber callbacks

- __onNext__: This method is called whenever a new item is emitted by a publisher. Here's an example of how it can be used to log each item emitted by a Flux publisher:

```java
Flux.just("apple", "banana", "orange")
    .log()
    .subscribe(item -> System.out.println("Received item: " + item));
```

- __onError__: This method is called if an error occurs while processing a stream. Here's an example of how it can be used to log the error message and stack trace:

```java
Flux.error(new RuntimeException("Something went wrong!"))
    .log()
    .subscribe(
        item -> System.out.println("Received item: " + item),
        error -> {
            System.err.println("An error occurred: " + error.getMessage());
            error.printStackTrace();
        });
```

- __onComplete__: This method is called when a stream has completed successfully. Here's an example of how it can be used to log a message indicating that the stream has completed:

```java
Flux.just("apple", "banana", "orange")
    .log()
    .subscribe(
        item -> System.out.println("Received item: " + item),
        error -> System.err.println("An error occurred: " + error.getMessage()),
        () -> System.out.println("Stream completed successfully!"));
```

## Links

- [Concurrency in Spring WebFlux](https://www.baeldung.com/spring-webflux-concurrency)

## References

- Reactive Systems Explained / Grace Jansen & Peter Gollmar 저 / O'REILLY
