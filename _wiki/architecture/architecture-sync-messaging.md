---
layout  : wiki
title   : Synchronous Messaging Pattern
summary : 
date    : 2023-05-10 15:02:32 +0900
updated : 2023-05-10 15:12:24 +0900
tag     : architecture cloudnative designpattern
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Synchronous Messaging Pattern

동기 메시징 패턴(Synchronous Messaging Pattern)은 마이크로 서비스간 묵시적인 __의존성(dependency)__ 이 생긴다.

크게 요청-응답 패턴과 RPC 패턴이 존재한다.

### Request & Response

- HTTP & RESTFul 방식에서 주로 사용
- API Gateway 와 Orchestrator 랑 같이 사용하기도 함
- 이 패턴을 많이 사용하면 마이크로서비스간 묵시적인 의존성이 생김. 따라서 서비스의 수가 많으면 비동기 메시징 패턴을 고려
- 실시간 응답이 필요한 서비스, 외부 사용자에게 서비스를 노출해야 하는 경우 사용
- 서비스 이용이 자유롭고 유연해야할 경우 사용

### RPC

- 서비스간 정보 교환을 위해 사용하는 데이터 타입 등을 명세하는 __서비스 정의(interface definition language, IDL)__ 를 먼저 해야 함
- 서비스 정의를 통해 RPC 통신에 필요한 저수준 프로토콜을 처리해주는 클라이언트 코드와 서버 측 코드를 자동으로 만들 수 있음. 이 것을 __스터브(stub)__ 라고 함
- 마이크로서비스간 통신에 효율적이지만, 웹 or 모바일 같이 외부 사용자에게 노출되는 서비스의 경우에는 RPC 보다 RESTful 및 JSON 같은 방법이 더 적합함
- 서비스간 통신 속도 및 처리량이 매우 중요한 경우 사용
- 서비스간 엄격한 규격이 필요한 경우 사용

__[Remote Procedure Call (RPC) in Operating System](https://www.geeksforgeeks.org/remote-procedure-call-rpc-in-operating-system/):__

![](/resource/wiki/architecture-sync-messaging/rpc.png)

## References

- Design Patterns for Cloud Native Applications / Kasun Indrasiri, Sriskandarajah Suhothayan Author / O'REILLY

