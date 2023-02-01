---
layout  : wiki
title   : Saga
summary : 
date    : 2023-01-25 15:54:32 +0900
updated : 2023-01-25 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Saga

Saga pattern in microservices architecture (MSA) is a way to handle transactions and ensure data consistency across multiple services. It involves breaking down a large transaction into smaller, independent steps and compensating actions, each managed by a separate service. If a step fails, the Saga pattern ensures that the compensating action is executed to undo the changes made by the previous step, maintaining data consistency.

![](/resource/wiki/msa-saga/saga.png)

위 그림은 [Database per Service](https://microservices.io/patterns/data/database-per-service.html) 로 구성되었을 때의 Saga 패턴 흐름을 나타낸다.

사가에서 이전 작업을 없던 일로 하거나 시스템을 좀 더 일관된 상태로 돌리기 위해 [보상 트랜잭션(compensating transactions)](https://baekjungho.github.io/wiki/msa/msa-eventual-consistency/#compensating-transaction) 이라는 것을 실행한다.

## Choreography-based saga

매도 주문 예제를 통해 자율적으로 구성된 사가 패턴을 살펴보자. (T 는 Transaction 을 의미한다.)

- T1: 주문을 생성한다.
- T2: 주식 수량만큼 예약한다. 이것은 계정 트랜잭션 서비스가 구현한다.
- T3: 수수료를 계산하고 부과한다. 이것은 수수료 서비스가 구현한다.
- T4: 매도 주문을 시장에 제출한다. 이것은 시장 서비스가 구현한다.
- T5: 주문 상태를 갱신한다.

이 프로세스를 구성하는 5단계를 설명하면 다음과 같다.

1. 주문 서비스는 T1 을 수행하고 OrderCreated 를 발행한다.
2. 수수료와 계정 트랜잭션, 시장 서비스가 이 이벤트를 수신한다.
3. 수수료와 계정 트랜잭션 서비스는 적절한 동작을 수행하고(T2 와 T3) 이벤트를 발행한다. 시장 서비스가 이 이벤트를 수신한다.
4. 주문이 사전 조건을 만족하면 시장 서비스는 주문을 시장에 제출하고(T4) OrderPlaced 를 발행한다.
5. 마지막으로 주문 서비스는 이 이벤트를 수신하고 주문 상태를 갱신한다.

각 태스크가 실패했을 때의 보상 동작은 다음과 같다.

- C1: 고객이 생성한 주문을 취소한다.
- C2: 주식 수량 예약을 되돌린다.
- C3: 수수료 부과를 되돌리고 고객에게 환불한다.
- C4: 시장에 제출된 주문을 취소한다.
- C5: 주문의 상태를 되돌린다.

이러한 동작을 실행되도록 하는 것은 __Event__ 이다.

> [Eventual Consistency](https://baekjungho.github.io/wiki/msa/msa-eventual-consistency/#compensating-transaction) 는 결과적 일관성이라고 부르며 여러 트랜잭션을 하나로 묶지 않고 별도의 로컬 트랜잭션을 각각 수행하고 일관성이 달라진 부분은 체크해서 보상 트랜잭션으로 일관성을 맞추는 개념이다.

이러한 형태의 롤백은 시스템의 일관성을 아주 정확히 유지하는 것이 아니라 __의미상(semantically)__ 유지하려고 한다. 롤백 동작을 수행한 시스템은 원래의 완전히 동일한 상태로 돌아갈 수 없을 수 있다.

### Benefits

- 자율적 상호작용 스타일은 참여하는 서비스가 서로를 명시적으로 알 필요가 없기 때문에 느슨하게 연결되도록 하는데 도움을 준다.
  - 각 서비스의 자율성을 증대하는 것이다. 하지만 완벽하진 않다.

### Drawbacks

- 규칙을 검증할 때 여러 구분된 서비스를 확인해야 해서 검증이 어렵다.
- 상태 관리를 복잡하게 만든다. 각 서비스는 주문 처리 과정에서 구분된 상태를 반영해야 한다. 예를 들어, 주문 서비스는 주무이 생성, 제출, 취소, 거절 등이 됐는지를 추적해야 한다. 이런 추가적인 복잡성이 시스템을 추론하는데 어려움을 가중한다.
- 순환 의존성을 유발한다. 주문 서비스는 시장 서비스가 구독하는 이벤트를 발행한다. 반대로 주문 서비스는 시장 서비스가 발행하는 이벤트를 구독한다. 따라서 결합도가 높아진다.

일반적으로, 비동기 커뮤니케이션 스타일을 선택할 경우 시스템의 실행 흐름을 추적할 수 있는 모니터링과 추적 기능에 투자해야 한다.

## Orchestration-based saga

조율(orchestration) 방식으로 사가를 구현할 수도 있다. 조율된 사가에서는 서비스가 조율자 역할을 한다. __조율 서비스__ 는 여러 서비스에 걸친 사가의 결과를 실행하고 추적하는 프로세스다. 조율자는 독립 서비스로 구성할 수 있다. 

가장 중요한 것은 프로세스의 각 단계에서 실행의 상태를 추적하는 것이다. 때때로 이것을 __사가 로그(saga log)__ 라고 한다.

조율된 사가에서 조율자는 실패한 트랜잭션에 영향을 받는 엔티티를 유효한 일관된 상태로 되돌리기 위해 적절한 __보상 동작(reconciliation action)__ 을 시작할 책임이 있다.

### Benefits

- 사가에서 일련의 로직을 단일 서비스에 집중시키면 한 곳에서 순서를 변경하는 것뿐만 아니라 사가의 결과와 진행 상황을 추론하기가 상당히 쉬워진다. 결국 로직이 조율자로 이동하므로 개별 서비스가 간단해지고 관리해야할 상태의 복잡도가 줄어든다.

### Drawbacks

- 조율자가 너무 많은 로직을 가진다는 위험이 있다. 최악의 경우 이것이 다른 서비스를 자율적이고 독립적으로 책임지는 비지니스 역량 대신 데이터 저장소를 감싸는 빈약한 래퍼로 만들 수 있다.
- 수많은 마이크로서비스 실무자들은 조율자(orchestration) 방식보다는 __동료 간(peer-to-peer) 자율적 구성__ 을 옹호한다. 그러나 조율 방식도 점점 인기를 얻어가고 있다. 특히 넷플릭스 컨덕터(Netflix Conductor) 프로젝트의 인기와 AWS 의 스템 워크플로(Step Workflows)에서 보듯이 긴 상호작용을 구축할 때 더욱더 그렇다.

## Interwoven-based saga

고객이 실수로 주문을 제출해서 취소하고 싶다고 가정해 보자. 주문이 시장에 제출되기 전에 취소 요청을 했다면 주문 제출 사가는 여전히 진행 중일 수 있고 이를 멈추기 위해 새로운 지시가 필요할 것이다.

이렇게 중첩된 사가를 다루기 위해 3가지 전략이 있다.

- 회로 차단하기(short-circuiting)
- 잠그기(locking)
- 인터럽트(interruption)

### Short Circuiting

사가에서 주문이 진행 중일때 새로운 사가가 시작되는 것을 막을 수 있다. 예를 들어 고객은 시장 서비스가 시장에 주문을 제출하기 전에 전에는 주문을 취소할 수 없다. 

가장 쉬운 전략이다.

### Locking

엔티티로의 접근을 제어하기 위해 Lock 을 사용할 수 있다. 엔티티의 상태를 변경하고자 하는 다른 사가는 Lock 을 얻기 위해 대기해야 한다. 이 방식은 여러 사가가 Lock 을 얻기 위해 서로를 방해하는 데드락이 빠질 수 있어서 시스템이 멈추는 것을 방지하기 위해 데드락 모니터링과 타임아웃을 구현해야 한다.

### Interruption

동작이 실행되는 것을 방해하도록 할 수 있다. 예를 들어, 주문 상태를 '실패'로 갱신할 수 있다. 이 방식은 비지니스 로직의 복잡도를 증가시키지만 데드락의 위험은 피할 수 있다.

## Links

- [Pattern: Saga - Microservices](https://microservices.io/patterns/data/saga.html)

## References

- 마이크로서비스 인 액션 / 모건 브루스, 파울로 페레이라 저 / 위키북스