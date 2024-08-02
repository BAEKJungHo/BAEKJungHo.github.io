---
layout  : wiki
title   : Chatting System Design
summary : 
date    : 2024-07-31 15:02:32 +0900
updated : 2024-07-31 15:12:24 +0900
tag     : systemdesign
toc     : true
comment : true
public  : true
parent  : [[/systemdesign]]
latex   : true
---
* TOC
{:toc}

## Chatting System Design

먼저 __요구사항/기능을 잘 정의__ 해야 한다. 어떤 Chatting Application 인지에 따라서 요구사항과 기능이 완전히 다르다.
만약, 면접에서 두리뭉실하게 Chat Application System Design 을 해보라는 질문을 받는다면 __목적__ 이 무엇인지를 명확하게 물어보면 좋을 것 같다.

대화형 라이브 영상 서비스(e.g 스포츠 생중계)에 사용되는 Live Chat 의 경우에는 아래와 같은 특징을 지닐 수 있다.

- 동시 접속자 수 N 명
- 채팅 메시지 전송 및 수신 max 1초
- 금칙어 관리 (실시간 적용)
- 실시간 도배 탐지
- 채팅 메시지 영구 저장
- 실시간 채팅 지표 모니터링
- 채팅 Meta 정보 관리

또한 동시 접속자 수가 많기 때문에 일부 메시지의 순서가 섞이거나 서로 다른 메시지를 보고 있다고 하여도 대화의 맥락을 이해하는데 큰 문제는 없다.

반면, Kakao Talk, LINE 과 같은 채팅 애플리케이션의 경우 아래와 같은 기능을 충족 시켜야 한다.

1. 1:1 채팅
2. 그룹 채팅

Facebook 의 경우에는 하루에 600억 가량의 메시지를 주고 받는다. 또한 오래된 메시지를 잘 보지 않는 점이 있고, Read / Write 비율이 1:1 이다.

### Realtime Communications

채팅을 주고 받기 위해서는 클라이언트와 서버간 커넥션이 필요하다. 이때 사용되는 기술로 Polling, Long Polling, Websocket 등이 있다.

__Polling__:

Polling 은 클라이언트가 서버에게 새로운 메시지가 있는지 일정 주기 마다 물어봐야 한다. A-B 가 서로 채팅을 하고 있고 Polling 주기가 1초인 경우에는
서로는 상대방이 보낸 메시지를 1초 후에 알 수 있다. 즉, 약간의 Latency 가 추가가 된다. 또한 일정 주기 마다 요청을 보내야 하기 때문에 Request 수가 많아진다.

__Long Polling__:

Polling 은 클라이언트의 요청("메시지가 있는지 확인 하는 요청")에 즉각적으로 응답을 주지만, Long Polling 은 클라이언트의 요청("메시지가 있는지 확인 하는 요청")을 받고 나서
메시지가 들어올 때 까지 __Timeout__ 기간 동안 기다린다. Timeout 내에 메시지가 들어오면 응답을 주며, Timeout 이 발생하면 클라이언트로 Timeout 응답을 보내준다. 클라이언트는 Timeout 응답을 받으면
곧 바로 다시 서버로 요청을 보낸다. Polling 과 같은 테크닉이지만 클라이언트가 서버로 보내는 Request 수가 조금 줄어든다는 장점이 있다.

__WebSocket__:

WebSocket 은 클라이언트와 서버간의 Connection 을 유지시켜놓고, 서로 양방향 소통이 가능하다록 하는 기술이다. 
서버와 클라이언트간 Connection ㅇ 맺어져있기 때문에, 서버당 처리할 수 있는 클라이언트의 수가 제한이 있다는 단점이 있다. 대신 Connection 이 맺어져 있기 때문에 메시지 전달을 즉각 전달 가능하며, 모든 시점에서 사용자가 보고 있는 채팅의 내용이 일치하다.

<mark><em><strong>메시지 전달 지연이 사용자에게 부정적인 사용자 경험을 줄 수 있다 라고 판단한다면 WebSocket 을 선택</strong></em></mark> 하는 것이 더 좋다.

WebSocket 은 Connection 을 유지해줘야 하기 때문에, 보통 __Chat Server__ 를 만들어서 관리 한다. 그리고 일반적인 기능들(로그인/프로필 변경 등)은 API Server 로 관리한다.

### Asynchronous

Chat Application 이 갖는 특징 중 하나는 Async 하다는 것이다. REST or RPC Call 을 하는 경우에는 Synchronous 하게 동작한다. Asynchronous 하게 요청과 응답을 주고 받기 위해서는 __Message Queue__ 가 필요하다.
즉, ___[Publisher Subscriber Architecture](https://baekjungho.github.io/wiki/architecture/architecture-pub-sub/)___ 가 필요하다.
Pub/Sub Architecture 를 적용했을 때의 장점은 __Decoupling__ 할 수 있다는 것이다.

Chatting Application 에 사용되는 Server 가 여러개인 경우 (여러개의 서버가 서로 통신을 주고 받는 경우) REST 방식으로 설계하다 보면 각 서버간의 __Dependency__ 가 많아진다.
Message Queue 는 이러한 Dependency 를 줄일 수 있다.

### Push Notification

로그아웃 되어있는 유저는 Chat Server 를 통한 커넥션이 연결되어있지 않은 상태이므로, Message Queue 가 메시지를 받고나서 Push Notification 을 통해서 
로그아웃 되어있는 유저에게 전달할 수 있어야 한다.

### Database

많은 양의 트래픽, Read/Write 비율이 1:1, Chat 데이터들과 나머지 데이터들간의 Join 할 경우가 거의 없고 경우에 따라서는 메시지 타입별로 구조가 다를 수도 있기 때문에 __Schemaless__ 한 MongoDB 나, Key/Value Store 인 Cassandra, HBase 같은 것을 사용한다.
Key Value Store 를 사용하는 경우 메시지의 Key 를 Range Scan 하기 쉽게 디자인 해야 한다. (최근 메시지일 수록 Key 값을 높게)

그룹 채팅의 경우에는 그룹을 관리하기 위한 RDBMS 도 필요할 것이다.

## Links

- [카카오톡 시스템 디자인 - 코맹탈출 실리콘밸리 개발이야기](https://www.youtube.com/watch?v=VODXNECZOBQ&list=LL&index=3)
- [라이브채팅 플랫폼 구현기](https://kakaoentertainment-tech.tistory.com/109)