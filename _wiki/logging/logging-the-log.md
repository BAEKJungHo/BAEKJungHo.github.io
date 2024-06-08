---
layout  : wiki
title   : The Log
summary : What every software engineer should know about real-time data's unifying abstraction
date    : 2024-05-28 20:54:32 +0900
updated : 2024-05-28 21:15:24 +0900
tag     : logging consensus distributed
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## The Log

### Log

로그는 가장 단순하게 추상화된 저장소이며, Append-only 만 가능하고, 전체 이벤트가 __시간 순서대로 정렬된__ 자료구조를 의미한다.
따라서, 시스템 간의 데이터 흐름을 처리하기 위한 자연스러운 데이터 구조이다.

![](/resource/wiki/logging-the-log/log-model.png)

실시간 구독을 위해 조직의 모든 데이터를 가져와 중앙 로그에 저장한다. 이러한 로그 개념은 모든 가입자를 측정할 수 있는 각 변경 사항에 대한 논리적 시계를 제공 한다.
로그는 데이터 생산과 데이터 소비를 비동기화하는 버퍼 역할도 한다.

### Logs in Databases

데이터베이스에서는 데이터를 변경하기 전에, 장애 발생시 복구가 가능하도록 "무엇을 변경하는 지" 에 대해서 기록을 해야 하는데 대부분의 데이터베이스에서
[WAL(write-ahead-logs, 로그 선행 기입)](https://en.wikipedia.org/wiki/Write-ahead_logging) 라는 개념을 사용한다. WAL 은 ACID 중 [atomicity and durability](https://github.com/NKLCWDT/cs/blob/main/Database/Transaction.md) 를 지원한다.

- Atomicity
  - 완벽히 수행되거나, 오류가 발생하면 이전상태로 되돌려야 함
- Durability
  - 성공적으로 완료된 트랜잭션의 결과는 시스템이 고장나더라도 영구적으로 반영되어야 함

로그는 __어떤(what)__ 이벤트가 __언제(when)__ 발생했는지에 대한 __시간순으로 정렬__ 된 기록이다. 따라서, 원격 복제를 구현할 때 매우 핵심이된다.

__Leader/Follower Model__:

![](/resource/wiki/logging-the-log/leaders-followers.png)

복제 노드(Replica)가 메인 노드(Primary)노드에게 데이터를 구독한다는 개념은 Primary/Secondary 모델 혹은 [Leader/Follower 모델](https://codexbook.medium.com/master-slave-architecture-leader-based-replication-79b7095443ec) 이라고 부르며, 거의 모든 데이터베이스가 이런 복제 모델을 택하고 있다. 이런 추상화는 데이터베이스에만 한정되지 않고 데이터 플로우와 실시간 처리 및 거의 모든 메시징 시스템의 매우 이상적이다.

### Logs in Distributed Systems

__[Fault-Tolerant Consensus](https://ebrary.net/64882/computer_science/fault_tolerant_consensus#247)__:

합의(consensus)란 여러 노드가 어떤 것에 동의하도록 하는 것을 의미한다.

예를 들어 여러 사람이 동시에 비행기의 마지막 좌석을 예약하려고 하거나 극장의 같은 좌석을 예약하려고 하거나 동일한 사용자 이름으로 계정을 등록하려고 하면 합의 알고리즘을 사용하여 둘 중 어느 것을 상호 결정할 수 있다.

하나 이상의 노드가 값을 제안 할 수 있으며 합의 알고리즘은 해당 값 중 하나를 결정한다. 이 형식에서의 합의 알고리즘은 다음을 충족해야 한다.

- Uniform agreement
  - No two nodes decide differently.
- Integrity
  - No node decides twice.
- Validity
  - If a node decides value v, then v was proposed by some node.

__State Replication Machine Principles__:

분산 로그는 합의 문제를 모델로 한 데이터 구조로 볼 수 있다. 로그는 추가할 "다음" 값에 대한 일련의 결정을 나타낸다.
분산 시스템은 로그 중심으로 설계되었으며 상태 복제 머신으로 작용한다.

상태 복제 머신의 원칙은 다음과 같다. 
- 두 개의 프로세스가 동일한 상태에서 출발해서, 동일한 입력을 같은 순서로 입력 받는다면 최종적으로 같은 상태를 가지게 된다.

![](/resource/wiki/logging-the-log/state-machine.png)

대표적인 예로, 쿠버네티스 내부에서 메타데이터 및 상태 정보를 저장하는데 쓰이는 etcd 는 Raft 로 구현된 상태복제머신이다.

근본적으로 분산 시스템에서 여러 노드가 동일한 값을 ‘합의(Consensus)'하는 것은 전체 순서가 동일한 로그를 복제하는 것과 같다.
이런 로그 복제 시스템의 아름다운 점은 로그의 인덱스 혹은 타임스탬프가 복제 노드들의 상태를 표현하는 역할을 한다.

__Database vs State Replication Machine__:

![](/resource/wiki/logging-the-log/smr-vs-primary-backup.png)

To understand the difference between these two approaches, let's look at a toy problem. Consider a replicated "arithmetic service" which maintains a single number as its state (initialized to zero) and applies additions and multiplications to this value. The active-active approach might log out the transformations to apply, say "+1", "*2", etc. Each replica would apply these transformations and hence go through the same set of values. The "active-passive" approach would have a single master execute the transformations and log out the result, say "1", "3", "6", etc. This example also makes it clear why ordering is key for ensuring consistency between replicas: reordering an addition and multiplication will yield a different result.

## Links

- [The Log 한국어 번역](https://medium.com/rate-labs/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4-%EC%97%94%EC%A7%80%EB%8B%88%EC%96%B4%EA%B0%80-%EC%95%8C%EC%95%84%EC%95%BC-%ED%95%A0-%EB%A1%9C%EA%B7%B8%EC%97%90-%EB%8C%80%ED%95%9C-%EB%AA%A8%EB%93%A0-%EA%B2%83-11513af8b998)

## References

- [The Log: What every software engineer should know about real-time data's unifying abstraction - Jay Kreps](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
- [Designing Data-Intensive Applications. The Big Ideas Behind Reliable, Scalable and Maintainable Systems](https://ebrary.net/64591/computer_science/designing_data-intensive_applications_the_big_ideas_behind_reliable_scalable_and_maintainable_syst)