---
layout  : wiki
title   : Eventual Consistency
summary :
date    : 2022-05-29 13:54:32 +0900
updated : 2022-05-29 15:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Eventual Consistency

> Eventual Consistency 는 결과적 일관성이라고 부르며 여러 트랜잭션을 하나로 묶지 않고 별도의 로컬 트랜잭션을 각각 수행하고 일관성이 달라진 부분은 체크해서 보상 트랜잭션으로 일관성을 맞추는 개념이다.

## Two-phase Commit

> [Polyglot Persistence](https://baekjungho.github.io/wiki/msa/msa-polyglot/) 구조에서는 비지니스 처리를 위해서 일부 데이터의 복제와 중복 허용이 필요하며, 각 마이크로서비스의 저장소에 담긴 데이터의 비지니스 정합성을 맞춰야 하는 데이터 일관성 문제가 발생한다.
>
> 이러한 데이터 일관성 처리를 위해 보통 `Two-phase commit` 같은 분산 트랜잭션 기법을 사용하기도 한다. 하지만 각 서비스를 하나의 트랜잭션으로 묶다보면 각 서비스의 독립성도 침해하고 NoSQL 저장소처럼 2단계 커밋을 지원하지 않는 경우도 있어서 두 서비스를 단일 트랜잭션으로 묶는 기법이 아닌 `Async Event` 처리를 통한 협업을 강조한다.

## Message Queue

- 메시징이란 프로그램이 서로를 직접 호출하지 않고 메시지로 서로 데이터를 전송하여 통신하는 것을 의미한다.
- 큐잉은 메시지가 저장소의 큐에 배치되어 프로그램이 서로 다른 속도와 시간, 다른 위치에서 논리적 연결 없이 서로 독립적으로 실행될 수 있도록 하는 것을 의미한다.

큐 매커니즘을 사용하여 비지니스 일관성을 맞추는 방법은 아래와 같다.

![](/resource/wiki/msa-eventual-consistency/eventual-consistency.png)

## Compensating Transaction

- 특정 작업이 실패했을 때 이전 작업 단계의 결과들을 실행 취소하기 위한 트랜잭션이다.
- 수행 취소시 다른 인스턴스가 수행한 내용을 덮어쓸 수 있으므로, 현재 상태를 작업 시작 전으로 쉽게 바꾸지 못한다.
- 보상 트랜잭션은 원래 작업의 정확히 반대 순서로 실행 취소할 필요는 없으며, 일부 취소 단계를 동시에 수행할 수 있다.
- 보상 트랜잭션은 최종적으로 데이터의 일관성을 맞추는 작업이며, 실패할 수도 있다.

### Considering 

- 데이터의 최종 일관성을 구현하는 보정 작업이 실패했을 때 파악하기 쉽지 않을 수 있다.
- 보정 트랜잭션은 수행하는 데 비용이 많이 들 수 있으며, [재시도 패턴](https://docs.microsoft.com/ko-KR/azure/architecture/patterns/retry)에 따라 실패한 작업을 다시 시도하는 효과적인 정책을 구현함으로써 보정 트랜잭션 사용을 최소화할 수 있다.

## Links

- [Introduction message queuing](https://www.ibm.com/docs/en/ibm-mq/9.0?topic=overview-introduction-message-queuing)
- [Compensating Transaction](https://docs.microsoft.com/ko-kr/azure/architecture/patterns/compensating-transaction)

## References

- 도메인 주도 설계로 시작하는 마이크로서비스 개발 / 한정헌, 유해식, 최은정, 이주영 저 / 위키북스