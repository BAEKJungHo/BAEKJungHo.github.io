---
layout  : wiki
title   : High Performance; Binary Packet Protocol
summary : How HTTP/2's Binary Foundation Transformed Web Communication Efficiency
date    : 2025-05-10 12:54:32 +0900
updated : 2025-05-10 14:15:24 +0900
tag     : network http protocol binary
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## High Performance; Binary Packet Protocol

HTTP/1 은 텍스트 기반 프로토콜이다. HTTP 메시지 본문에 바이너리 데이터를 넣을 수 있지만, 요청과 헤더 자체는 여전히 텍스트여야 한다.
이 단순성이 성능 문제를 가져온다. 

![](/resource/wiki/network-binary-based-protocol/http2-stream.png)

___[WebpageTest](https://www.webpagetest.org/)___ 를 통해 내 Wiki 가 ___[HTTP/2](https://hpbn.co/http2/)___ 로 동작함을 확인할 수 있다. Request3 에 대한 내용은 아래와 같다.

```
Request3

Host: klarciel.net
IP: 185.199.111.153
Error/Status Code: 200
Priority: Medium
Protocol: HTTP/2
HTTP/2 Stream: 5, weight 183, depends on 3, EXCLUSIVE
Request ID: 33401.5
```

만약, HTTP/1 을 사용하고 있는 도메인에서는 e.g 5~6개의 연결이 요청을 처리하고, 이것이 완료될 때까지 기다렸다가 다음 5~6개가 시작될 수 있다.

이러한 성능 문제를 해결하기 위해서 ___[HTTP/2](https://datatracker.ietf.org/doc/html/rfc9113)___ 는 Binary Packet Protocol 을 사용한다.

__HTTP/2 가 해결하고자 하는 HTTP/1 의 성능 문제__:
- 대역폭 효율성 - 바이너리 인코딩과 헤더 압축으로 전송량 감소
- 지연 시간 - 멀티플렉싱으로 여러 요청의 병렬 처리
- 연결 병목 현상 - 단일 연결로 여러 요청 처리
- 처리 효율성 - 파싱과 처리 속도 향상

### Binary

___[Binary](https://en.wikipedia.org/wiki/Binary_file)___ 란 0과 1, 두 숫자로만 이루어진 이진법(二進法) 을 의미한다.

Binary ___[Protocol](https://datatracker.ietf.org/doc/html/rfc793)___ 이 효율적인 이유는 컴퓨터가 텍스트 기반 데이터(예: JSON, XML)를 처리할 때 먼저 바이너리로 변환하는 과정이 필요한 반면, 바이너리 데이터는 이 변환 과정 없이 직접 처리할 수 있기 때문이다. 이로 인해 처리 속도가 빨라지고 메모리 사용량도 감소한다.

### Head of Line Blocking

HTTP/1 의 문제점중 하나는 ___[Head of Line Blocking](https://en.wikipedia.org/wiki/Head-of-line_blocking)___ 이다. 즉, HTTP/1.1에서는 하나의 연결에서 요청-응답이 순차적으로 처리되어 앞선 요청이 지연되면 뒤의 모든 요청이 차단된다.
이러한 문제를 해결하기 위해서 HTTP/2 는 단일 TCP 연결에서 여러 스트림의 프레임을 동시에 교차 전송할 수 있는 기능인 ___Multiplexing___ 이라는 것을 사용한다. 즉, 이전 요청이 완료될때 까지 기다리지 않고 단일 연결을 통해 여러 요청을 전달하는 것이다.

### Multiplexing

- 클라이언트는 동시에 여러 요청을 보내되, 각각을 스트림 ID로 구분
- 각 스트림의 프레임은 순서를 유지하면서 프레임 단위로 ___Interleaving___ 되어 전송
  - Interleaving: 여러 스트림의 프레임들이 하나의 연결 안에서 번갈아가며 순차적으로 섞여서 전송되는 방식
    - 성능 향상: 하나의 스트림이 느리더라도 다른 스트림의 데이터 전송을 막지 않음
    - 지연 감소: 대역폭을 효율적으로 사용하여 응답이 더 빨리 도착할 수 있음
    - 헤드 오브 라인 블로킹(Head-of-Line Blocking) 방지
- 서버는 수신된 프레임을 스트림 ID를 기준으로 조립해 각각의 요청에 대해 응답

### Binary Framing Layer

HTTP/2 에는 메시지가 캡슐화되고 전송되는 방식을 결정하는 새로운 바이너리 프레이밍 계층이 있다. 

![](/resource/wiki/network-binary-based-protocol/binary-framing-layer.png)

*<small><a href="https://jadhavsaurabh037.medium.com/grpc-deep-dive-efficient-network-communication-using-http-2-11bb97151b09">gRPC deep dive : Efficient network communication using HTTP/2</a></small>*

### Streams, Messages, and Frames

Once the HTTP/2 connection is established, endpoints can begin exchanging frames.

![](/resource/wiki/network-binary-based-protocol/streaming.png)
*<small><a href="https://hpbn.co/http2/">HTTP/2 streams, messages, and frames</a></small>*

__Meanings__:

| Type | Description                                                                                                                                                                                                                                                              |
|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
 | Stream| A bidirectional flow of bytes within an established connection, which may carry one or more messages.                                                                                                                                                                    
| Message | complete sequence of frames that map to a logical request or response message.                                                                                                                                                                                           |
| Frame | The smallest unit of communication in HTTP/2, each containing a frame header, which at a minimum identifies the stream to which the frame belongs. <br/> All communication is performed over a single TCP connection that can carry any number of bidirectional streams.<br/> Each stream has a unique identifier and optional priority information that is used to carry bidirectional messages.<br/>Each message is a logical HTTP message, such as a request, or response, which consists of one or more frames.<br/>The frame is the smallest unit of communication that carries a specific type of data—e.g., HTTP headers, message payload, and so on. Frames from different streams may be interleaved and then reassembled via the embedded stream identifier in the header of each frame.|

__Frame Layout__:

```kotlin
 +-----------------------------------------------+
    |                 Length (24)                   |
    +---------------+---------------+---------------+
    |   Type (8)    |   Flags (8)   |
    +-+-------------+---------------+-------------------------------+
    |R|                 Stream Identifier (31)                      |
    +=+=============================================================+
    |                   Frame Payload (0...)                      ...
    +---------------------------------------------------------------+
```

## Links

- [Head-of-Line Blocking: Explanation and Designing a Flexible Network Layer](https://medium.com/@aditimishra_541/head-of-line-blocking-explanation-and-designing-a-flexible-network-layer-6ef4b53488bc)
- [gRPC on HTTP/2 Engineering a Robust, High-performance Protocol](https://grpc.io/blog/grpc-on-http2/)
- [HTTP/2](https://hpbn.co/http2/)

## References

- HTTP/2 In Action / Barry Pollard / MANNING

