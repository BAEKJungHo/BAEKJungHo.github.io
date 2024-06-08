---
layout  : wiki
title   : CAP Theory of Design Principles for Distributed Systems
summary : 
date    : 2023-03-21 15:02:32 +0900
updated : 2023-03-21 15:12:24 +0900
tag     : architecture msa distributed
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## CAP

> 분산 시스템의 설계 원칙을 설명하는 이론

The CAP theorem asserts that any networked shared-data system can have only two of three desirable properties.

![](/resource/wiki/architecture-cap/cap.png)

- __Consistency__: 데이터를 보유하고 있는 모든 노드가, 클라이언트가 데이터를 읽거나 쓸 때 언제나 동일한 결과를 반환해야 함을 의미함
- __Availability__: 노드 중 일부에 장애가 발생하더라도 사용자는 해당 서비스를 계속 이용할 수 있어야 함
- __Partition tolerance__: 분할 내성은 Replica 간의 연결되어있는 Node 가 네트워크 문제나 서버 장애 등으로 인해 노드끼리의 통신이 불가능하더라도 정상적으로 작동해야 한다는 것을 의미함
  - Availability 와의 차이점은 Availability 는 특정 노드가 “장애”가 발생한 상황에 대한 것이고 Tolerance to network Partitions 는 노드의 상태는 정상이지만 네트워크 등의 문제로 서로간의 연결이 끊어진 상황에 대한 것이다.

이 중에서 2개만 선택 가능함. 따라서 시스템 설계 시 이러한 요구사항을 고려하여 적절한 트레이드오프를 고려해야 한다.

Geo-distributed applications 을 설계하는 경우에는 P(partition tolerance) 를 포기할 수 없다. 따라서 C 와 A 중에서 선택해야 한다.
하지만 분산 애플리케이션에서 가용성을 포기할 수 없다. 그렇다고 C 를 포기하기도 힘들다.

그래서 등장한 것이 [Eventual Consistency](https://baekjungho.github.io/wiki/msa/msa-eventual-consistency/) 이다. 이 모델은 데이터베이스 관리 시스템에 의존하여 데이터의 모든 로컬 복사본을 병합하여 결과적으로 일관성을 유지한다.

CAP 이론은 복제본(replicas)이 시스템의 나머지 부분과 연결이 끊어진 동안(e.g 네트워크 분할 or 간헐적으로 연결되는 모바일 장치) 복제본의 데이터 변경이 불가능하다. 이것을 __Strongly consistent replication__ 이라고 한다.

### As a CAP trade-off

The CAP Theorem is based on three trade-offs: __consistency, availability, and partition tolerance__. Partition tolerance, in this context, means the ability of a data processing system to continue processing data even if a [network partition](https://en.wikipedia.org/wiki/Network_partition) causes communication errors between subsystems.

Distributed software must be designed to be partition-tolerant. A network partition is a division of a computer network into relatively independent [subnets](https://en.wikipedia.org/wiki/Subnet).

## Links

- [CAP Twelve Years Later: How the "Rules" Have Changed](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)
- [Please stop calling databases CP or AP](https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html)
- [DZone - Quick Notes: What is CAP Theorem?](https://dzone.com/articles/quick-notes-what-cap-theorem)
- [CAP 이론을 통한 네트워크 동기화 기법](https://www.youtube.com/watch?v=j3eQNm-Wk04)