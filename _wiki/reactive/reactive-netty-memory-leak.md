---
layout  : wiki
title   : Netty Memory Leak
summary : Native Memory Leak
date    : 2023-08-25 15:05:32 +0900
updated : 2023-08-25 15:15:24 +0900
tag     : reactive netty memoryleak
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Netty Memory Leak

### Exchange was deprecated in favor of Retrieve

WebClient 의 [exchange 메서드는 Memory Leak 가능성 때문에 deprecated](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/reactive/function/client/WebClient.RequestHeadersSpec.html) 되었다.

![](/resource/wiki/reactive-netty-memory-leak/exchange-deprecated.png)

__Memory Leak__:

![](/resource/wiki/reactive-netty-memory-leak/memory-leak.png)

## Native Memory Leak

[Reactor Netty Memory Leak - Toss](https://toss.tech/article/reactor-netty-memory-leak)

Netty 가 요청/응답 바디를 저장할때 Buffer 를 사용하는데, Direct Buffer 와 Heap Buffer 가 있다.
Reactor Netty HttpClient 는 기본적으로 Socket I/O 성능에 이점을 가지는 Direct Buffer 를 사용한다.

__Why need direct memory?__
- Direct memory have one fewer copy operation when compared with heap memory ("file/socket --- OS memory --- jvm heap" vs "file/socket --- direct memory")
- Direct memory could manage its own lifecycle, reducing the pressure on garbage collector.

따라서, Reactor Netty 를 사용하는 프로젝트에서 요청/응답 바디를 올바르게 처리하지 않으면 native memory leak 이 발생할 수 있다.

Netty 는 요청/응답을 담기 위해 ByteBuf 를 사용하는데, ThreadPool 처럼 Buffer Pool 을 구현해서 사용한다.
이때 pool 에서 buffer 를 할당받을때 [reference counter](https://netty.io/wiki/reference-counted-objects.html) 초기 값은 1이고, 동일한 buffer 를 다른 곳에서도 사용하면 `retain()` 함수를 통해
reference counter 를 증가시킨다. 반대로 buffer 를 사용하지 않을때는 `release()` 함수를 통해 reference counter 를 감소시킨다.

요청 바디를 캐싱하는 경우, 요청 바디를 가져올 때 reference counter 가 증가했지만, 저장된 바디를 잃어 버리면서 감소 로직이 실행되지 않으면 native memory leak 이 발생할 수 있다.

__connection pool 이슈와 memory leak 이슈 모두 잡기__:

```kotlin
.filter { request, next ->
    val isCancelled = AtomicReference(false)
    val responseRef = AtomicReference<ClientResponse?>(null)
    
    next.exchange(request)
        .doOnNext(responseRef::set)
        .doFinally { 
            if (isCancelled.get()) {
                releaseResponseBody(responseRef.get())
            }
        }
        .cache()
        .doOnCancel { 
            isCancelled.set(true)
            releaseResponseBody(responseRef.get())
        }
}
```

Netty 에서 [너무 큰 데이터(large data)를 한꺼번에 전송(write)하면 너무 많은 메모리를 사용하거나 OutOfMemory 가 발생](https://hungrydiver.co.kr/bbs/detail/develop?id=7) 한다고 한다.

ChannelInitializer 구현체에서 initChannel 할때 ChunkedWriteHandler 를 추가하고

```java
pipeline.addLast("ChunkedWriteHandler", new ChunkedWriteHandler());
```

대량데이터를 Mail Client 에 전송할때 ChunkedStream 을 write 해 주면 ChunkedStream 을 사용하면 데이터 크기를 기본 8192Byte 로 조각 내서 Context 에 write 한다.

```java
InputStream in = new ByteArrayInputStream(XXX);
ctx.write(new ChunkedStream(in));
```
