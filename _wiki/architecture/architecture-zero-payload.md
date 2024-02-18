---
layout  : wiki
title   : ZERO PAYLOAD
summary : 
date    : 2024-02-11 15:02:32 +0900
updated : 2024-02-11 15:12:24 +0900
tag     : architecture eventdriven
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## ZERO PAYLOAD

[ZERO PAYLOAD](https://baekjungho.github.io/wiki/architecture/architecture-event-driven-system/#zero-payload)
는 이벤트 발행에 ID 와 몇 가지 정보만 넣어서 보내고 이외의 필요한 정보는 수신한 곳에서 ID 를 기반으로 API 를 호출하여 데이터를 채워서 처리하는 방식을 의미한다.

예를 들어, 차량 상태에 대한 정보를 수신하는 topic 을 하나 만들고, 해당 토픽에 mid(messageId) 와 timestamp, eventType 등의 최소한의 정보만 넣어서 메시지를 발행하면
해당 topic 을 구독하고 있는 다른 여러 서비스들이 이벤트를 수신하여, API Call 을 통해 __최신의 데이터__ or __이벤트 발행 시점의 데이터(mid 필요)__ 를 받아서 데이터를 동기화 할 수 있다.

Consumer 측에서 이벤트에 대해서 Event Source 데이터를 최신화하기만 하면 되는 경우에는 ZERO PAYLOAD 가 유리할 수 있다. 데이터의 최종 상태 동기화만 하면 되는 경우(Eventually Consistency 보장)에 사용하면 좋다.
API Call 을 통해 동기화받는 정보가 항상 최신일 거라 신뢰할 수 있음. Payload 에 mid(Message Id) 를 담아서 오는 경우도 있고, API 응답 결과에 Mid 를 포함하는 경우도 있음. 이때 API 쿼리 파라미터로 Mid 를 담아서 보내면, 이벤트가 발생된 시점의 데이터를 가져다 사용할 수 있다.

__Summary__:

- 데이터의 최종 상태만 동기화하면 되는 경우, Zero Payload 가 유리할 수 있다.
- API 호출을 통해 동기화받는 정보는 항상 최신 정보로 신뢰할 수 있다.
- 경우에 따라 payload 에 messageId(mid) 가 포함되고, API 응답 결과에 mid 가 포함될 수도 있다. API 요청에서 쿼리 파라미터로 mid 를 보내면 이벤트가 발생한 시점의 데이터를 사용할 수 있다.

## Links

- [Building event-driven architecture for member system - Delivery Hero](https://tech.deliveryhero.com/building-event-based-architecture-for-member-system/)
