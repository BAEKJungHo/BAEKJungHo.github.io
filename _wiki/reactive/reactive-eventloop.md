---
layout  : wiki
title   : Forward to EventLoop
summary : Direct Memory Access, Java NIO, Streams, Buffers
date    : 2024-02-12 15:05:32 +0900
updated : 2024-02-12 15:15:24 +0900
tag     : reactive linux operatingsystem designpattern multiplexing java buffer
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Essence of Network I/O

[Everything is a file](https://en.wikipedia.org/wiki/Everything_is_a_file) 이라는 아이디어는 드라이브, 키보드, 프린터, 프로세스 간 및 네트워크 통신과 같은 리소스 와의 입출력을 간단한 __스트림(stream)__ 으로 처리한다는 아이디어이다.

Linux 에서는 소켓도 하나의 파일(file), 더 정확히는 파일 디스크립터(file descriptor)로 생성해 관리한다.

[File descriptor](https://en.wikipedia.org/wiki/File_descriptor) 는 다음과 같은 특징이 있다.

- 운영체제가 만든 파일을 구분하기 위한 일종의 숫자이다.
- 저수준 파일 입출력 함수는 입출력을 목적으로 파일 디스크립터를 요구한다.
- 저수준 파일 입출력 함수에 소켓의 파일 디스크립터를 전달하면, 소켓을 대상으로 입출력을 진행한다.

따라서, __Network I/O 의 본질은 File descriptors 에 대한 작업__ 이다.

## Multiplexing

[비동기 서버에서 이벤트 루프를 블록하면 안 되는 이유 1부 - 멀티플렉싱 기반의 다중 접속 서버로 가기까지 - LINE](https://engineering.linecorp.com/ko/blog/do-not-block-the-event-loop-part1)

__MultiProcessing__ 방식은 프로세스는 독립적 메모리 공간을 갖는다. 대신 단점으로는 서로 다른 독립적인 메모리 공간을 갖기 때문에 프로세스간 정보 교환이 어렵다.
__MultiThreading__ 방식은 서로 공유하는 메모리가 있기 때문에 스레드간 정보 교환이 쉽다. 단점으로는 일정 크기의 스레드를 생성해 풀로 관리하며 운영할 수 있지만 요청마다 스레드를 무한정 생성할 수 없기 때문에 많은 수의 요청을 동시에 처리할 수 없다. ([C10k problem](https://en.wikipedia.org/wiki/C10k_problem) 을 해결하지 못한다).

[I/O Multiplexing: The select and poll Functions](https://notes.shichao.io/unp/ch6/)

![](/resource/wiki/reactive-eventloop/iomultiplexing.png)

Multiplexing 모델에서는 [select](https://en.wikipedia.org/wiki/Select_(Unix)) 함수를 호출해서 여러 개의 소켓 중 read 함수 호출이 가능한 소켓이 생길 때까지 대기한다. select 의 결과로 read 함수를 호출할 수 있는 소켓의 목록이 반환되면, 해당 소켓들에 대해 read 함수를 호출한다.

Blocking I/O 모델은 하나의 스레드에서 하나의 소켓에 대해 read 함수를 호출해 데이터가 커널 공간에 도착했는지 확인하고 현재 읽을 수 있는 데이터가 없는 경우 블록돼 대기했다면, Multiplexing I/O 모델은 여러 소켓을 동시에 확인하며 그중 하나 이상의 사용 가능한 소켓이 준비될 때까지 대기한다.

## Direct Memory Access

Java NIO 에 대해서 살펴보기 전에, [How Java IO Works Internally](https://howtodoinjava.com/java/io/how-java-io-works-internally/) 에 대해서 살펴보자.

The very term “input/output” means nothing more than moving data in and out of __buffers__. 

Buffer 가 I/O 를 이해하는데 아주 중요한 역할을 한다.

In Java I/O, the data flows from a source known as a __data source__ to a destination known as a __data sink__.

![](/resource/wiki/reactive-eventloop/flow-stream.png)

__[Abstraction by Wrapping](https://baekjungho.github.io/wiki/java/java-abstraction-by-wrapping/)__ 여기서 JNI 를 통한 Blocking 방식의 system call 은 아래와 같은 과정으로 이뤄지는 것을 다뤘다.

```
// Blocking
JVM -> JNI -> 시스템 콜 -> 커널 -> 디스크 컨트롤러 -> 커널 버퍼 복사 -> JVM 버퍼 복사
```

Java 에서 Blocking I/O 방식은 운영체제 메모리에 있는 파일 내용을 JVM 내 메모리로 다시 복사해야하기 때문에, 직접 메모리를 관리하고 OS Level 의 system call 을 사용하는 C/C++ 보다 I/O 성능이 좋지 않다.
I/O 성능을 개선하기 위해 나온것이 [Java NIO](https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html) 이다.

__Direct Memory Access__:

![](/resource/wiki/reactive-eventloop/dma.png)

Java NIO 에서 ByteBuffer 를 allocateDirect() 메서드로 생성할 경우 __Direct Memory Access__ 를 사용하는 플로우로 진행된다.

```
JVM -> 시스템 콜 -> JNI -> 디스크 컨트롤러 -> DMA -> 복사
```

장점은 다음과 같다.

- 디스크에 있는 파일을 운영체제 메모리로 읽어들일 때 CPU 를 건드리지 않는다.
- 운영체제 메모리에 있는 파일 내용을 JVM 내 메모리로 다시 복사할 필요가 없다.
- JVM 내 힙 메모리를 쓰지 않으므로 GC를 유발하지 않는다.(물론 일정 크기를 가진 버퍼가 운영체제 메모리에 생성되는 것이고, 이 버퍼에 대한 참조 자체는 JVM 메모리 내에 생성된다)

단점은 다음과 같다.

- 시스템 메모리를 사용하기 때문에 할당/해제 비용이 다소 비싸다.

## Java NIO

[비동기 서버에서 이벤트 루프를 블록하면 안 되는 이유 2부 - Java NIO 와 멀티플렉싱 기반의 다중 접속 서버 - LINE](https://engineering.linecorp.com/ko/blog/do-not-block-the-event-loop-part2)

Java NIO 의 핵심은 다음과 같다.

- Channel and Buffer
  - 서버에서 클라이언트와 데이터를 주고받을 때 채널을 통해서 버퍼(ByteBuffer)를 이용해 읽고 쓴다.
- NonBlocking I/O
- Selector
  - Java NIO 에는 여러 개의 채널에서 이벤트(예: 연결 생성, 데이터 도착 등)를 모니터링할 수 있는 셀렉터가 포함돼 있기 때문에 하나의 스레드로 여러 채널을 모니터링할 수 있다.
  - 내부적으로 [SelectorProvider](https://docs.oracle.com/javase/7/docs/api/java/nio/channels/spi/SelectorProvider.html) 에서 운영체제와 버전에 따라 사용 가능한 멀티플렉싱 기술을 선택해 사용한다.

### Channels and Buffers

A channel is like a stream. It represents a connection between a data source/sink and a Java program for data transfer. In stream-based I/O, the basic unit of data transfer is a __byte__. In channel-based NIO, the basic unit of data transfer is a __buffer__.

![](/resource/wiki/reactive-eventloop/channel-buffer.png)

- A stream can be used for __one-way__ data transfer. That is, an input stream can only transfer data from a data source to a Java program; an output stream can only transfer data from a Java program to a data sink.
- However, a channel provides a __two-way__ data transfer facility.

__Channel Types__:
- FileChannel
- DatagramChannel
- SocketChannel
- ServerSocketChannel: 클라이언트의 TCP 연결 요청을 수신(listening)할 수 있으며, SocketChannel 은 각 연결마다 생성된다.

buffer 를 사용해 데이터를 읽고 쓰는데는 4단계로 진행된다.

- 버퍼에 데이터 쓰기
- 버퍼의 flip() 메서드 호출
- 버퍼에서 데이터 읽기
- 버퍼의 clear() 혹은 compact() 메서드 호출

채널은 양방향으로 사용하기 때문에 버퍼에 데이터를 쓰다가 이후 데이터를 읽어야 한다면 flip() 메서드를 호출해서 버퍼를 쓰기 모드에서 읽기 모드로 전환해야 한다. 또한 모든 데이터를 읽은 후에는 버퍼를 지우고 다시 쓸 준비를 해야 하며, 이때 clear() 메서드를 호출해서 전체 버퍼를 지울 수 있다.

### Selector

[Java NIO Selectors using NIO Client/Server](https://avaldes.com/java-nio-selectors-using-nio-client-server-example/)

Selector 를 사용하면 여러개의 Channel 에서 발생하는 I/O Events 를 확인할 수 있다.

__Create Selector Instance__:

```java
Selector selector = Selector.open();
```

__Registering Channels with Selector__:

```java
ServerSocketChannel channel = ServerSocketChannel.open();
channel.bind(new InetSocketAddress("localhost", 8080));
channel.configureBlocking(false); // 논블로킹 모드로 변경
SelectionKey key = channel.register(selector, SelectionKey.OP_READ); // 셀렉터에 채널을 등록
```

셀렉터에 채널을 등록하기 위해서는 반드시 해당 채널을 논블로킹 모드로 변환해야 한다. register() 메서드의 두 번째 매개 변수는 채널에서 발생하는 이벤트 중 Selector 를 통해 확인하고자(알림 받고자) 하는 이벤트의 종류를 전달할 때 사용한다. 이벤트에는 네 가지 종류가 있으며 SelectionKey 상수로 표시한다.

__SelectionKey__:

```java
public static final int OP_ACCEPT;  // socket-accept operations
public static final int  OP_CONNECT; // socket-connect operations
public static final int OP_READ;    // read operations
public static final int OP_WRITE;   // write operations
```

__Using selectedKeys() Method__:

```java
int readyChannels = selector.select();
logger.info("Keys with ready channels....: " + readyChannels);
 
Set<SelectionKey> selectedKeys = selector.selectedKeys();
 
Iterator<SelectionKey> i= selectedKeys.iterator();
 
while(i.hasNext()) {
  SelectionKey key = i.next();
 
  if (key.isAcceptable()) {
    processAcceptable(key);   // connection accepted
  } else if (key.isConnectable()) {
    processConnectable(key);  // connection established
  } else if (key.isReadable()) {
    processReadable(key);     // ready for reading
  } else if (key.isWritable()) {
    processWritable(key);     // ready for writing
  }
}
```

## EventLoop

__[EventLoop](https://en.wikipedia.org/wiki/Event_loop)__ 는 이벤트(event) 가 발생할 때 까지 대기했다가, 이벤트가 발생되면 dispatch 하는 방식으로 처리되는 디자인 패턴을 의미한다.

__Pseudo__:

```
function main
    initialize()
    while event != quit
        event := get_next_event()
        process_event(event)
    end while
end function
```

보통 반복문은 Infinite Loop 로 구현되며, 특정 이벤트(event) 가 발생되면 처리하는 방식이다.

[Spring WebFlux Concurrency EventLoop Model](https://www.baeldung.com/spring-webflux-concurrency#event_loop)

![](/resource/wiki/reactive-eventloop/webflux-eventloop.png)

__EventLoop Figure__:

![](/resource/wiki/reactive-eventloop/eventloop.png)

1. Event Emitter adding task to Event queue to be executed on a next loop cycle
2. Event Loop getting task from Event queue and processing it based on handlers

## Reactor Pattern

[비동기 서버에서 이벤트 루프를 블록하면 안 되는 이유 3부 - Reactor 패턴과 이벤트 루프 - LINE](https://engineering.linecorp.com/ko/blog/do-not-block-the-event-loop-part3)

Reactor 패턴은 관리하는 리소스에서 이벤트가 발생할 때까지 대기하다가 이벤트가 발생하면 해당 이벤트를 처리할 수 있는 핸들러(handler)에게 디스패치(dispatch)하는 방식으로 이벤트에 반응하는 패턴으로, '이벤트 핸들링(event handling)' 패턴이라고 한다.

__Reactor 패턴 구성요소__:
- Reactor: 무한 반복문을 실행해 이벤트가 발생할 때까지 대기하다가 이벤트가 발생하면 처리할 수 있는 핸들러에게 디스패치한다. 이벤트 루프라고 부르기도 한다.
- Handler: 이벤트를 받아 필요한 비즈니스 로직을 수행한다.

__Reactor.java__:

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.util.Set;
  
public class Reactor implements Runnable {
    final Selector selector;
    final ServerSocketChannel serverSocketChannel;
  
    Reactor(int port) throws IOException {
        selector = Selector.open();
  
        serverSocketChannel = ServerSocketChannel.open();
        serverSocketChannel.socket().bind(new InetSocketAddress(port));
        serverSocketChannel.configureBlocking(false);
        SelectionKey selectionKey = serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
  
        // Attach a handler to handle when an event occurs in ServerSocketChannel.
        selectionKey.attach(new AcceptHandler(selector, serverSocketChannel));
    }
  
    public void run() {
        try {
            // 무한 반복문을 실행하며 Selector 에서 이벤트가 발생하기까지 대기하다가 이벤트가 발생하는 경우 적절한 핸들러에서 처리할 수 있도록 dispatch 한다.
            while (true) {
                selector.select();
                Set<SelectionKey> selected = selector.selectedKeys();
                for (SelectionKey selectionKey : selected) {
                    dispatch(selectionKey);
                }
                selected.clear();
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }
  
    // 'Attached object' 로 등록돼 있던 핸들러를 가져와 비즈니스 로직을 처리
    void dispatch(SelectionKey selectionKey) {
        Handler handler = (Handler) selectionKey.attachment();
        handler.handle();
    }
}
```

## Netty

EventLoop 의 구현체 중 대표적인 것이 Netty 이다.

[Netty](https://netty.io/) is an asynchronous event-driven network application framework for rapid development of maintainable high performance protocol servers & clients. Netty is a NIO client server framework which enables quick and easy development of network applications such as protocol servers and clients. It greatly simplifies and streamlines network programming such as TCP and UDP socket server.

Netty 도 기본적으로는 지금까지 살펴본 [Java NIO 의 Selector 와 Reactor 패턴을 기반으로 구현](https://github.com/netty/netty/blob/4.1/transport/src/main/java/io/netty/channel/nio/NioEventLoop.java)되어 있다.

Netty adopts with interface io.netty.channel.EventLoop.

The basic idea of an event loop is illustrated in the following listing, where each task is an instance of __Runnable__.

```java
while (!terminated) {
    // Blocks until there are events that are ready to run
    List<Runnable> readyEvents = blockUntilEventsReady();
    // Loops over and runs all the events
    for (Runnable ev: readyEvents) {
        ev.run(); 
    }
}
```

## Data Buffers

- [Data Buffers and Codecs - Spring Docs](https://docs.spring.io/spring-framework/reference/core/databuffer-codec.html)
- 공식문서 한글 번역 본 - [WebFlux 의 DataBuffer 다루기](https://sungjk.github.io/2020/08/08/webflux-databuffer.html)
- [Log Request/Response Body in Spring WebFlux with Kotlin](https://www.baeldung.com/kotlin/spring-webflux-log-request-response-body)
 
## Links

- [Java NIO Tutorials](https://avaldes.com/category/java-development/nio/)
- [Building Highly Scalable Servers with Java NIO](https://zoo.cs.yale.edu/classes/cs434/cs434-2021-fall/programming/examples-java-socket/examples/Async2/ONJava.pdf)
- [I/O Models](https://rickhw.github.io/2019/02/27/ComputerScience/IO-Models/)
- [Concurrency vs Event Loop vs Event Loop + Concurrency](https://medium.com/@tigranbs/concurrency-vs-event-loop-vs-event-loop-concurrency-eb542ad4067b)
- [자바 NIO 의 동작원리 및 IO 모델 - 개발한입](https://brewagebear.github.io/fundamental-nio-and-io-models/)
- [Back to the Essence - Java 컴파일에서 실행까지](https://homoefficio.github.io/2019/01/31/Back-to-the-Essence-Java-%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C-%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80-1/)
- [Java NIO Direct Buffer 를 이용해서 대용량 파일 행 기준으로 쪼개기](https://homoefficio.github.io/2019/02/27/Java-NIO-Direct-Buffer%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%B4%EC%84%9C-%EB%8C%80%EC%9A%A9%EB%9F%89-%ED%8C%8C%EC%9D%BC-%ED%96%89-%EA%B8%B0%EC%A4%80%EC%9C%BC%EB%A1%9C-%EC%AA%BC%EA%B0%9C%EA%B8%B0/)
- [NIO (New Input/Output) vs IO (Input/Output) and NIO.2 in Java](https://java-latte.blogspot.com/2014/10/nio-tutorial-in-java-with-example-and-nio2-feature.html)
- [Introduction to the Java NIO Selector](https://www.baeldung.com/java-nio-selector)