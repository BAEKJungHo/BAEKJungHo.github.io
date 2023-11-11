---
layout  : wiki
title   : Event Driven System
summary : 
date    : 2023-11-02 15:02:32 +0900
updated : 2023-11-02 15:12:24 +0900
tag     : architecture eventdriven dod
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Event Driven System

EDA(Event Driven Architecture) 의 핵심은 당연, __Event__ 이다. Application 에서 발생하는 [Event 의 종류를 두 가지로](https://baekjungho.github.io/wiki/msa/msa-event-deconcern/) 나눌 수 있다.

1. Internal Event
2. External Event

내부 이벤트(internal event)의 경우에는 __비관심사 를 분리__ 하는 것이 주 목적이다. 다시 말하면, __도메인 로직__ 과 도메인 로직에 붙어있는 __부가적인 정책__ 을 분리 하는 것을 의미한다.

외부 이벤트(external event)의 경우에는 __외부 시스템과의 의존성 격리__ 가 주 목적이다. 이벤트 발행처(publisher)는 이벤트를 발행할 뿐, 구독자(subscriber) 가 발행된 이벤트를 가지고 무엇을 하는지 알 필요가 없다. 구독자가 비지니스 로직을 처리하는데 필요한 이벤트를 발행처에서 담아서 발행하는 순간 __결합(coupling)__ 이 생기게 된다.

### ZERO-PAYLOAD

ZERO-PAYLOAD 방식이란 이벤트 발행에 ID 와 몇 가지 정보만 넣어서 보내고 이외의 필요한 정보는 수신한 곳에서 ID 를 기반으로 API 를 호출하여 데이터를 채워서 처리하는 방식을 의미한다.
장점은 새로운 요구 사항에 따라 Event Data 가 재설계될 필요가 없다.

### Saga

[Saga](https://fraktalio.com/fmodel/docs/domain/modeling-the-behaviour?concept=order#saga) 패턴은 데이터 일관성을 보장하고 이벤트 중심 시스템에서 비즈니스 트랜잭션을 관리하는 데 도움을 주는 패턴이다.

The output/event/action result of one service is translated into the input/command/action of another service. This is the essence of the [Saga pattern](https://baekjungho.github.io/wiki/msa/msa-saga/). It reacts!

__Imagine extending this saga to include compensating actions in case of order being rejected__:

![](/resource/wiki/architecture-event-driven-system/saga.png)

### Event Sourcing

이벤트 소싱 패턴(event sourcing pattern) 은 아래와 같은 문제를 해결할 수 있다.

__Problems__:
- 데이터베이스를 원자적으로 업데이트하고 메시지 브로커에 메시지를 보내는 방법

__Strengths__:
- 데이터베이스 트랜잭션이 커밋되면 메시지를 보내야 한다. 반대로 데이터베이스가 롤백되면 메시지가 전송되어서는 안 된다. 
- 메시지는 서비스에서 전송한 순서대로 메시지 브로커로 전송되어야 한다.
- [2PC 는 고려 대상이 아니다.](https://baekjungho.github.io/wiki/msa/msa-xa/#two-phase-commit)
  - 데이터베이스에서 2PC 를 지원 안할 수도 있고, 무엇보다 성능이 너무 떨어진다.

__Solution__:
- [Event Sourcing Pattern](https://microservices.io/patterns/data/event-sourcing.html)

Event sourcing persists the state of a business entity. __state-changing events__ are stored as a sequence of events.

이벤트 데이터베이스인 이벤트 저장소에 이벤트를 유지한다.

- [이벤트 소싱 패턴을 사용하는 몇 가지 애플리케이션](https://eventuate.io/exampleapps.html)

애플리케이션은 항상 일관된 데이터 처리를 해야 하고, 쿼리를 하기 위해서는 __[CQRS](https://microservices.io/patterns/data/cqrs.html)__ 패턴을 사용해야 한다.

## Links

- [Integration Of Event Driven Systems](https://fraktalio.com/blog/integration-of-event-driven-systems.html)
- [Amazon SNS message filtering](https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html)
- [Event Sourcing Pattern - Microsoft](https://learn.microsoft.com/ko-kr/azure/architecture/patterns/event-sourcing)
- [FStore SQL - Event Store based on the PostgreSQL Database](https://github.com/fraktalio/fstore-sql)
- [FModel](https://fraktalio.com/fmodel/)
- [Understanding Integration Patterns in Event-Driven Architecture](https://community.aws/concepts/understanding-integration-patterns-in-event-driven-architecture)
- [Events as a Storage Mechanism](https://cqrs.wordpress.com/documents/events-as-storage-mechanism/)
- [Introducing Event Sourcing- Microsoft](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/jj591559(v=pandp.10)?redirectedfrom=MSDN)