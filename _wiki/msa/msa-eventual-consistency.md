---
layout  : wiki
title   : Eventual Consistency
summary :
date    : 2022-05-29 13:54:32 +0900
updated : 2022-05-29 15:15:24 +0900
tag     : msa architecture distributed
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Eventual Consistency

___Eventual Consistency___ 는 결과적 일관성이라고 부르며 여러 트랜잭션을 하나로 묶지 않고 별도의 로컬 트랜잭션을 각각 수행하고 일관성이 달라진 부분은 체크해서 보상 트랜잭션으로 일관성을 맞추는 개념이다.
또는 데이터가 시간이 지나면 결국 일관성 있는 상태로 수렴하는 방식을 의미한다. 즉, 실시간으로 동기화하지 않더라도, 일정 시간이 지나면 모든 서버에 동일한 데이터가 반영되는 비동기적 동기화 방식이다. 이는 성능과 확장성을 고려하여, 실시간 동기화보다 더 효율적인 방법으로 자주 조회되는 데이터를 처리할 수 있게 해준다.

> __[When to use a CRDT-based database](https://www.infoworld.com/article/3305321/when-to-use-a-crdt-based-database.html)__:
> 
> The main advantage of the eventual consistency model is that the database will be available to you to perform write operations even when the network connectivity between the distributed database replicas breaks down. In general, this model avoids the round-trip time incurred by a two-phase commit, and therefore supports far more write operations per second than the other models. One problem that eventual consistency must address is conflicts—simultaneous writes on the same item at two different locations. Based on how they avoid or resolve conflicts, the eventually consistent databases are further classified in the following categories:
> 
> 1. __Last writer wins (LWW)__. In this strategy, the distributed databases rely on the timestamp synchronization between the servers. The databases exchange the timestamp of each write operation along with the data itself. Should there be a conflict, the write operation with the latest timestamp wins.
The disadvantage of this technique is that it assumes all the system clocks are synchronized. In practice, it’s difficult and expensive to synchronize all the system clocks.
>
> 2. __Quorum-based eventual consistency__: This technique is similar to the two-phase commit. However, the local database doesn’t wait for the acknowledgement from all the databases; it just waits for the acknowledgement from a majority of the databases. The acknowledgement from the majority establishes a quorum. Should there be a conflict, the write operation that has established the quorum wins.
On the flip side, this technique adds network latency to the write operations, which makes the app less scalable. Also, the local database will not be available for writes if it gets isolated from the other database replicas in the topology.
> 
> 3. __Merge replication__: In this traditional approach, which is common among the relational databases, a centralized merge agent merges all the data. This method also offers some flexibility in implementing your own rules for resolving conflicts.
Merge replication is too slow to support real-time, engaging applications. It also has a single point of failure. As this method doesn’t support pre-set rules for conflict resolution, it often leads to buggy implementations for conflict resolution.
>
> 4. __Conflict-free replicated data type (CRDT)__: You will learn about CRDTs in detail in the next few sections. In a nutshell, CRDT-based databases support data types and operations that deliver conflict-free eventual consistency. CRDT-based databases are available even when the distributed database replicas cannot exchange the data. They always deliver local latency to the read and write operations.
Limitations? Not all database use cases benefit from CRDTs. Also, the conflict resolution semantics for CRDT-based databases are predefined and cannot be overridden.

## Two-phase Commit

> [Polyglot Persistence](https://baekjungho.github.io/wiki/msa/msa-polyglot/) 구조에서는 비지니스 처리를 위해서 일부 데이터의 복제와 중복 허용이 필요하며, 각 마이크로서비스의 저장소에 담긴 데이터의 비지니스 정합성을 맞춰야 하는 데이터 일관성 문제가 발생한다.
>
> 이러한 데이터 일관성 처리를 위해 [Two-phase commit](https://baekjungho.github.io/wiki/msa/msa-xa/#two-phase-commit) 같은 분산 트랜잭션 기법을 사용하기도 한다. 하지만 각 서비스를 하나의 트랜잭션으로 묶다보면 각 서비스의 독립성도 침해하고 NoSQL 저장소처럼 2단계 커밋을 지원하지 않는 경우도 있어서 두 서비스를 단일 트랜잭션으로 묶는 기법이 아닌 `Async Event` 처리를 통한 협업을 강조한다.

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

__Considering__:
- 데이터의 최종 일관성을 구현하는 보정 작업이 실패했을 때 파악하기 쉽지 않을 수 있다.
- 보정 트랜잭션은 수행하는 데 비용이 많이 들 수 있으며, [재시도 패턴](https://docs.microsoft.com/ko-KR/azure/architecture/patterns/retry)에 따라 실패한 작업을 다시 시도하는 효과적인 정책을 구현함으로써 보정 트랜잭션 사용을 최소화할 수 있다.

## Links

- [CAP Theory of Design Principles for Distributed Systems](https://baekjungho.github.io/wiki/architecture/architecture-cap/)
- [Introduction message queuing](https://www.ibm.com/docs/en/ibm-mq/9.0?topic=overview-introduction-message-queuing)
- [Compensating Transaction](https://docs.microsoft.com/ko-kr/azure/architecture/patterns/compensating-transaction)

## References

- [Principles of Eventual Consistency](https://www.nowpublishers.com/article/Details/PGL-011)
- 도메인 주도 설계로 시작하는 마이크로서비스 개발 / 한정헌, 유해식, 최은정, 이주영 저 / 위키북스