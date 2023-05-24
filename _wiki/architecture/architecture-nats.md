---
layout  : wiki
title   : NATS
summary : 
date    : 2023-05-20 15:02:32 +0900
updated : 2023-05-20 15:12:24 +0900
tag     : architecture cloudnative
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## NATS

NATS is __message oriented middleware__.

> [NATS](https://ko.wikipedia.org/wiki/NATS_%EB%A9%94%EC%8B%9C%EC%A7%95) 는 오픈 소스 메시징 시스템(메시지 지향 미들웨어)이다. NATS 서버는 Go 프로그래밍 언어로 작성되었다. 서버와의 인터페이스를 위한 클라이언트 라이브러리는 주요 프로그래밍 언어로 이용이 가능하다. NATS 의 핵심 설계 원리는 성능, 확장성, 쉬운 이용이다.
> 
> ![](/resource/wiki/architecture-nats/nats.png)

__Characteristics:__
- 고가용성 보장
- 여러 프로그래밍 언어 지원
- 단일 수진자와 다중 수신자 패턴에서 사용하는 최소 한 번 이상 전달이나 최대 한 번 전달과 같은 메시지 전송 규칙을 지원
- 카프카와 마찬가지로 로그를 사용해서 이벤트를 저장하고 이벤트 순번을 통해 이벤트를 추적하고 관리하며 재생 기능 역시 제공
- AMQP, STOMP, MQTT 같은 프로토콜을 지원하지 않음.
- 태생적으로 도커, 쿠버네티스, 서비스 메시, 그 외 클라우드 네이티브 기술을 염두에 두고 만들어져서 가볍고 확장성이 뛰어남. 클라우드 네이티브 분야에서 각광 받는 메시지 브로커.
- 이벤트 스트리밍, 사물 인터넷(IoT) 의 명령 및 제어 관리, 에지 시스템도 지원

## Links

- [NATS Docs](https://docs.nats.io/)

## References

- Design Patterns for Cloud Native Applications / Kasun Indrasiri, Sriskandarajah Suhothayan Author / O'REILLY

