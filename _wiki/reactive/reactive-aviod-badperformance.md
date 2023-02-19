---
layout  : wiki
title   : Performance Impacts in Reactive Programming
summary : 
date    : 2023-02-17 15:05:32 +0900
updated : 2023-02-17 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Performance Impacts in Reactive Programming

1. __Blocking I/O__: Avoid using blocking I/O calls like FileInputStream, InputStreamReader, or OutputStreamWriter in a reactive application, since these can block the event loop and reduce performance. Instead, use non-blocking I/O libraries like java.nio or reactive libraries like Project Reactor to perform I/O operations.
2. __Heavy computation__: Avoid performing heavy computation inside the reactive chain, since this can block the event loop and reduce performance. Instead, offload heavy computation to a separate thread pool using operators like subscribeOn().
3. __Thread.sleep(__): Avoid using Thread.sleep() in a reactive application, since this can block the event loop and reduce performance. Instead, use operators like delayElements() or interval() to introduce delays.
4. __Synchronous JDBC calls__: Avoid using synchronous JDBC calls in a reactive application, since these can block the event loop and reduce performance. Instead, use a reactive database driver or offload database calls to a separate thread pool using operators like subscribeOn().
5. __Synchronous HTTP clients__: Avoid using synchronous HTTP clients like HttpClient or RestTemplate in a reactive application, since these can block the event loop and reduce performance. Instead, use reactive HTTP clients like WebClient.
6. __Excessive logging__: Avoid excessive logging in a reactive application, since this can add overhead and reduce performance. Instead, use appropriate logging levels and limit the amount of data logged.
7. __Large payloads__: Avoid processing large payloads in a reactive application, since this can consume large amounts of memory and reduce performance. Instead, use streaming to process large payloads in smaller chunks.
8. __Excessive use of filters__: Avoid excessive use of filters in a reactive application, since these can add overhead and reduce performance. Instead, use appropriate caching or offload processing to a separate thread pool using operators like subscribeOn().
9. __Excessive use of blocking adapters__: Avoid excessive use of blocking adapters in a reactive application, since these can block the event loop and reduce performance. Instead, use non-blocking or reactive adapters where possible.
10. __Not using reactive libraries__: Avoid not using reactive libraries in a reactive application, since this can limit performance benefits. Instead, use reactive libraries like Project Reactor to take advantage of reactive programming concepts and performance benefits.