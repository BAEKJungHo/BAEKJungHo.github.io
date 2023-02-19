---
layout  : wiki
title   : Offload Processing
summary : 
date    : 2023-02-19 15:05:32 +0900
updated : 2023-02-19 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Offload Processing

Offloading processing is the practice of delegating certain tasks or operations to a separate thread pool or executor service in order to free up the main event loop and maintain good performance in a reactive application. By offloading processing to a separate thread pool, the event loop can continue processing other requests without being blocked.

Here are some examples of how to offload processing in a Spring WebFlux application:
- __Using subscribeOn()__: You can use the subscribeOn() operator to switch to a separate thread pool for specific parts of the reactive chain. For example, to offload database queries to a separate thread pool, you can use the following code:

```java
Flux.fromIterable(ids)
    .flatMap(id -> Mono.fromCallable(() -> repository.findById(id)).subscribeOn(Schedulers.boundedElastic()))
    .map(entity -> entity.toDto())
    .collectList();
```

- __Using publishOn()__: You can use the publishOn() operator to switch to a separate thread pool for downstream operators. For example, to offload expensive computation to a separate thread pool, you can use the following code:

```java
Flux.range(1, 10)
    .map(i -> {
        // expensive computation
        return i * i;
    })
    .publishOn(Schedulers.boundedElastic())
    .map(i -> i.toString())
    .subscribe(System.out::println);
```

- __Using flatMap()__: You can use the flatMap() operator to perform expensive operations in a separate thread pool. For example, to offload file I/O to a separate thread pool, you can use the following code:

```java
Flux.fromIterable(fileList)
    .flatMap(file -> Mono.fromCallable(() -> {
        // expensive file I/O operation
        return Files.readAllLines(file.toPath());
    }).subscribeOn(Schedulers.boundedElastic()))
    .flatMapIterable(lines -> lines)
    .subscribe(System.out::println);
```

In each of these examples, we use a separate thread pool to perform expensive or blocking operations, freeing up the main event loop to process other requests. This helps to maintain good performance and responsiveness in a reactive application.

## Schedulers

![](/resource/wiki/reactive-offload-processing/schedulers.png)

- [Threading and Schedulers](https://projectreactor.io/docs/core/release/reference/#schedulers)
- [Schedulers Docs](https://projectreactor.io/docs/core/release/api/reactor/core/scheduler/Schedulers.html)
- [How Do I Wrap a Synchronous, Blocking Call?](https://projectreactor.io/docs/core/release/reference/#faq.wrap-blocking)