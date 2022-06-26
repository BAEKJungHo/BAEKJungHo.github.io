---
layout  : wiki
title   : Real-time Web Communication
summary : Polling, Long-Polling, WebSockets, Server-Sent Events
date    : 2022-06-21 15:54:32 +0900
updated : 2022-06-21 20:15:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Polling

> 클라이언트가 HTTP 를 사용하여 N 초 간격으로 서버로 요청을 보내서, Response 를 전달 받는 방식

- 실시간 통신이라고 부르기는 하지만 실시간 정도의 빠른 응답을 기대하기는 어렵다.
- 클라이언트가 서버에 계속 요청해야 하기 때문에, 결과적으로 많은 응답이 비어 있어 HTTP 오버헤드가 발생한다.

## Long Polling

> 클라이언트가 HTTP 로 서버로 요청을 보내놓고, Timeout 이 발생할 떄 까지 기다리다, 중간에 이벤트가 발생하여 보낼 데이터가 있으면 Response 를 전달하는 방식

- polling 방식보다는 서버의 부담이 줄지만, 데이터 업데이트가 빈번해진다면 polling 방식과 큰 차이가 없다.
- Timeout(시간 초과)이 발생하면 클라이언트는 서버에 재 요청을 보내야 함

## WebSocket

> 단일 TCP 연결을 통해 전이중 통신 채널을 제공한다. 따라서 클라이언트와 서버간의 양방향 통신이 가능하다. 클라이언트는 __WebSocket Handshake__ 라고 하는 프로세스를 통해 WebSocket 연결을 설정한다. 프로세스가 성공하면 서버와 클라이언트는 언제든지 양방향으로 데이터를 교환할 수 있다.

WebSocket 프로토콜은 오버헤드가 낮은 클라이언트와 서버 간의 통신을 가능하게 하여 서버에서 실시간 데이터 전송을 용이하게 한다.

## WebSocket Handshake

![](/resource/wiki/network-polling/websocket.png)

- __WebSocket Handshake__
  - Opening Handshake
  - Data Transfer
  - Closing Handshake

### Opening Handshake
  
Opening Handshake 에서는 클라이언트가 Handshake Request(HTTP Upgrade) 를 전송하고 응답으로 Handshake Response 를 받는다.
이때의 응답 코드는 __101(프로토콜 전환을 서버가 승인)__ 이다.

```idle
# ws://localhost:8080/chat 으로 접속하려는 경우

GET /chat HTTP/1.1
Host: localhost:8080
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://localhost:9000
출처: https://kellis.tistory.com/65 [Flying Whale:티스토리]
```

- __Upgrade__
  - 프로토콜을 전환하기 위해 사용하는 헤더
  - 웹소켓 요청 시에는 반드시 websocket 이라는 값을 가지고, 이 값이 없거나 다른 값이면 cross-protocol attack 이라고 간주하여 웹소켓 접속을 중지
- __Connection__
  - 현재의 전송이 완료된 후 네트워크 접속을 유지할 것인가에 대한 정보
  - 웹 소켓 요청 시에는 반드시 Upgrade 값을 가지며 이 값이 없거나, 다른 값이면 웹소켓 접속을 중지
- __Sec-WebSocket-Key__
  - 유효한 요청인지 확인하기 위해 사용하는 키값
- __Sec-WebSocket-Protocol__
  - 사용하고자 하는 하나 이상의 웹소켓 프로토콜 지정
  - 필요한 경우에 사용
- __Sec-WebSocket-Version__
  - 클라이언트가 사용하고자하는 웹소켓 프로토콜 버전
- __Origin__
  - 모든 브라우저는 보안을 위해 이 헤더를 보냄(Cross-Site WebSocket Hijacking 와 같은 공격을 피하기 위함)
- __and so on__
  - 이 외에도, 여러 메시지나 서브 프로토콜, Referer, 인증 헤더 등을 보낼 수 있음

```idle
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
Sec-WebSocket-Protocol: chat
```

- __Sec-WebSocket-Accept__ 
  - 요청 헤더의 Sec-WebSocket-Key 에 유니크 아이디를 더해서 SHA-1 로 해싱한 후, base64 로 인코딩한 결과
  - 웹소켓 연결이 개시되었음을 알림

### Data Transfer

WebSocket Handshake 를 통해 연결이 되면, 데이터 전송이 시작된다. 클라이언트와 서버는 메시지라는 개념으로 데이터를 주고 받으며, 메시지는 한 개 이상의 `Frame` 으로 구성되어있다. 

HandShake 가 끝난 시점부터, 클라이언트와 서버는 서로 살아있는지 확인하기 위해 `heartbeat` 패킷을 보내며, 주기적으로 ping 을 보내 체크한다. 이는 클라이언트와 서버 양측에서 설정 가능하다.

### Closing HandShake

클라이언트와 서버 모두 커넥션을 종료하기 위한 `Control Frame` 을 전송할 수 있다. 이 컨트롤 프레임은 Closing Handshake 를 시작하라는 특정한 `Control Sequence` 를 포함한 데이터를 가지고 있다.

예를 들어, 서버가 커넥션을 종료한다는 프레임을 보내고, 클라이언트가 응답으로 Close 프레임을 전송한다. 이후에는 웹소켓 연결이 종료된다. 연결 종료 이후에 수신되는 모든 추가적인 데이터는 버려진다.

## Server-Sent Events

> SSE(Server-Sent Events) 는 클라이언트가 HTTP 연결을 통해 서버로부터 자동 업데이트를 수신할 수 있도록 하는 __서버 푸시 기술__ 이며 초기 클라이언트 연결이 설정되면 서버가 클라이언트로 데이터 전송을 시작할 수 있는 방법을 설명한다. 일반적으로 메시지 업데이트 또는 지속적인 데이터 스트림을 브라우저 클라이언트에 보내는 데 사용되며 클라이언트가 이벤트 스트림을 수신하기 위해 특정 URL 을 요청하는 EventSource 라는 JavaScript API 를 통해 기본 크로스 브라우저 스트리밍을 향상하도록 설계되었다.

SSE 는 서버에서 클라이언트로의 실시간 트래픽이 필요하거나 서버가 루프에서 데이터를 생성하고 여러 이벤트를 클라이언트에 보낼 때 가장 좋다.

## Links

- [Ajax Polling vs Long-Polling vs WebSockets vs Server-Sent Events](https://medium.com/geekculture/ajax-polling-vs-long-polling-vs-websockets-vs-server-sent-events-e0d65033c9ba)
- [WebSocket Handshake](https://kellis.tistory.com/65)