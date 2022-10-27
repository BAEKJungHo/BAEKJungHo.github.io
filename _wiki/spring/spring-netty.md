---
layout  : wiki
title   : Netty
summary : 
date    : 2022-10-20 15:05:32 +0900
updated : 2022-10-20 15:15:24 +0900
tag     : spring netty reactive
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## I/O Models

### Blocking I/O

This code will handle only one connection at a time. To manage multiple, concurrent clients, you need to allocate a new Thread for each new client Socket.

```kotlin
val serverSocket = ServerSocket(portNumber)
// accept() call blocks until a connection is established. 
val clientSocket=serverSocket.accept()
doProcess()
```

![](/resource/wiki/spring-netty/blocking.png)

- __Demerits__
  - First, at any point __many threads could be dormant__, just waiting for input or output data to appear on the line.
  - Second, each thread requires an __allocation of stack memory__ whose default size ranges form 64KB to 1MB, depending on the OS.
  - Third, even if a Java virtual machine (JVM) can physically support a very large number of threads, __the overhead of context-switching__ will begin to be troublesome long before that limit is reached, say by the time you reach 10,000 connections.

### Non-Blocking I/O

Java support for non-blocking I/O was introduced in 2002, with the JDK 1.4 package java.nio.

![](/resource/wiki/spring-netty/nio.png)

The class java.nio.channels.Selector is the linchpin of Java’s non-blocking I/O implementation. It uses the event notification API to indicate which, among a set of non-blocking sockets, are ready for I/O.

- __This model provides much better resource management than the blocking I/O model:__
  - Many connections can be handled with fewer threads, and thus with far less overhead due to memory management and context-switching.
  - Threads can be retargeted to other tasks when there is no I/O to handle.

## Netty

> Netty is an asynchronous event-driven network application framework
for rapid development of maintainable high performance protocol servers & clients.

![](/resource/wiki/spring-netty/netty.png)

Besides being an asynchronous network application framework, Netty also includes built-in implementations of SSL/TLS, HTTP, HTTP/2, HTTP/3, WebSockets, DNS, Protocol Buffers, SPDY and other protocols. Netty is not a Java web container, but is able to run inside one, and supports message compression.

![](/resource/wiki/spring-netty/netty-feature.png)

## Core Concepts

- __Core Concepts__
  - `Channel`: Channel is a basic construct of Java NIO.
  - `Callbacks`: A callback is simply a method, a reference to which has been provided to another method.
  - `Future`: Every IO operation on a Channel in Netty is non-blocking.
  - `Events and Handlers`: Events and handlers can be related to the inbound and outbound data flow.

### Channel

An open connection to an entity such as a hardware device, a file, a network socket, or a program component that is capable of performing one or more distinct I/O operations, for example reading or writing.

All I/O operations in Netty are __asynchronous__. It means any I/O calls will return immediately with no guarantee that the requested I/O operation has been completed at the end of the call. Instead, you will be returned with a [ChannelFuture](https://netty.io/4.1/api/io/netty/channel/ChannelFuture.html) instance which will notify you when the requested I/O operation has succeeded, failed, or canceled.

### Callbacks

Netty uses callbacks internally when handling events; when a callback is triggered the event can be handled by an implementation of interface ChannelHandler.

```java
public class ConnectHandler extends ChannelInboundHandlerAdapter {
   // channelActive(ChannelHandlerContext) is called when a new connection is established.
   @Override
   public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // ...
   }
}
```

### Futures

A Future provides another way to notify an application when an operation has completed. The JDK ships with interface java.util.concurrent.Future, but the provided implementations allow you only to check manually whether the operation has completed or to block until it does. This is quite cumbersome, so Netty provides its own implementation, ChannelFuture, for use when an asynchronous operation is executed.

- Netty provides its own implementation, ChannelFuture, for use when an asynchronous operation is executed.
- ChannelFuture provides additional methods that allow us to register one or more ChannelFutureListener instances.
- Each of Netty’s outbound I/O operations returns a ChannelFuture

```kotlin
// Connects asynchronously
val future = channel.connect(InetSocketAddress("192.168.0.1", 25)) // ChannelFuture

// Registers a ChannelFutureListener to be notified once the operation completes
future.addListener(object: ChannelFutureListener() {
    @Override
    fun operationComplete(future: ChannelFuture) {
        if (future.isSuccess()) {
            val buffer = Unpooled.copiedBuffer("Callback", Charset.defaultCharset())
            // Sends the data asynchronously. Returns a ChannelFuture
            val cf = future.channel().writeAndFlush(buffer) // ChannelFuture
        } else {
            // If an error occurred, accesses the Throwable that describes the cause
            val cause = future.cause() // Throwable
        }
    }
})
```

### Events and handlers

Netty uses distinct events to notify us about changes of state or the status of operations:
- Logging
- Data transformation
- Flow-control
- Application Logic

Netty is a networking framework, so events are categorized by their relevance to inbound or outbound data flow:
- Active or inactive connections
- Data reads
- User events
- Error events

Inbound and outbound events flowing through a chain of ChannelHandlers:
- ![](/resource/wiki/spring-netty/channelHandlers.png)

## Netty components and design

### EventLoop

Will handle all the I/O operations for a [Channel](https://netty.io/4.1/api/io/netty/channel/Channel.html) once registered. One [EventLoop](https://netty.io/4.1/api/io/netty/channel/EventLoop.html) instance will usually handle more than one Channel but this may depend on implementation details and internals.

EventLoop is assigned to each Channel to handle all of the events, including:
- Registration of interesting events
- Dispatching events to ChannelHandlers
- Scheduling further actions

The EventLoop defines Netty’s core abstraction for handling events that occur during the lifetime of a connection:
- An EventLoopGroup contains one or more EventLoops.
- An EventLoop is bound to a single Thread for its lifetime.
- All I/O events processed by an EventLoop are handled on its dedicated Thread.
- A Channel is registered for its lifetime with a single EventLoop.
- A single EventLoop may be assigned to one or more Channels.

![](/resource/wiki/spring-netty/eventloop.png)

### ChannelHandler

ChannelHandler class hierarchy:
- ![](/resource/wiki/spring-netty/channelHandlerHierarchy.png)

ChannelPipeline with inbound and outbound ChannelHandlers:
- ![](/resource/wiki/spring-netty/channelpipeline.png)

### Encoders and decoders

When you send or receive a message with Netty, a data conversion takes place. An
inbound message will be decoded; that is, converted from bytes to another format, typically a Java object. If the message is outbound, the reverse will happen: it will be encoded to bytes from its current format. The reason for both conversions is simple: network data is always a series of bytes. Various types of abstract classes are provided for encoders and decoders, corresponding to specific needs.

In general, base classes will have a name resembling ByteToMessageDecoder or MessageToByteEncoder. In the case of a specialized type, you may find something like ProtobufEncoder and ProtobufDecoder, provided to support Google’s protocol buffers.

## Transport API

At the heart of the transport API is interface Channel, which is used for all I/O operations.

Channel interface hierarchy:
- ![](/resource/wiki/spring-netty/channel.png)

The selector is to serve as a registry where you request to be notified when the state of a Channel changes. The possible state changes are:
- A new Channel was accepted and is ready.
- A Channel connection was completed.
- A Channel has data that is ready for reading.
- A Channel is available for writing data

Selecting and processing state changes:
- ![](/resource/wiki/spring-netty/selecting.png)

## ByteBuf

> Class ByteBuf - Netty's data container

Netty’s API for data handling is exposed through two components—abstract class ByteBuf and interface ByteBufHolder.

These are some of the advantages of the ByteBuf API:
- It’s extensible to user-defined buffer types.
- Transparent zero-copy is achieved by a built-in composite buffer type.
- Capacity is expanded on demand (as with the JDK StringBuilder).
- Switching between reader and writer modes doesn’t require calling ByteBuffer’s flip() method.
- Reading and writing employ distinct indices.
- Method chaining is supported.
- Reference counting is supported.
- Pooling is supported.

### How it works

ByteBuf maintains two distinct indices: one for reading and one for writing. When you read from a ByteBuf, its readerIndex is incremented by the number of bytes read. Similarly, when you write to a ByteBuf, its writerIndex is incremented.

![](/resource/wiki/spring-netty/bytebuf.png)

Trigger an IndexOutOfBoundsException, just as when you attempt to access data beyond the end of an array.

## What Is Reactor Netty?

> Reactor Netty is an asynchronous event-driven network application framework.

If we're using WebFlux in a Spring Boot application, Spring Boot automatically configures Reactor Netty as the default server.

## Links

- [Netty.io](https://netty.io/)
- [Wikipedia](https://en.wikipedia.org/wiki/Netty_(software))
- [Reactor Netty Reference Guide](https://projectreactor.io/docs/netty/snapshot/reference/index.html#getting-started)
- [Spring Boot Reactor Netty - Baeldung](https://www.baeldung.com/spring-boot-reactor-netty)
- [Netty - Baeldung](https://www.baeldung.com/netty)

## References

- Netty In Action / Trustin Lee 저 / MANNING