---
layout  : wiki
title   : Conflict-Free Replicated Data Types
summary : CRDTs
date    : 2023-05-21 15:02:32 +0900
updated : 2023-05-21 15:12:24 +0900
tag     : architecture crdts msa
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Conflict-Free Replicated Data Types

Geo-distributed applications 을 설계할 때, [Network partition](https://en.wikipedia.org/wiki/Network_partition) 은 피할 수 없다.
[CAP](https://baekjungho.github.io/wiki/architecture/architecture-cap/) 이론에 따르면, 2개를 선택해야 하는데 분산 애플리케이션에서 P 는 절대 포기할 수 없고,
그렇다고 A 를 포기할 여유도 없다. 그래서 아키텍트들이 채택하는 방식이 [Eventual Consistency](https://baekjungho.github.io/wiki/msa/msa-eventual-consistency/) 이다.

Eventual Consistency 는 [2PC](https://baekjungho.github.io/wiki/msa/msa-xa/#two-phase-commit) 보다 빠르기 때문에, 더 많은 양의 쓰기가 가능하다. 하지만 한 가지 문제가 있는데, 바로 __충돌(conflicts)__ 가능성이다.

__Conflicts__:
- simultaneous writes on the same item at two different locations.

이거를 해결하는 방법 중, CRDTs 가 [Strong eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency#Strong_eventual_consistency) 를 제공한다.

[Conflict-Free Replicated Data Types](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) 는 __Commutative replicated data types__(교환 가능한 복제 데이터 타입) 이라고도 부른다.
특징 중 하나는, 충돌이 발생하지 않기 때문에 __충돌 해결(there is no concept of conflict resolution)__ 이라는 개념이 없다.

CRDTs are special data types that converge data from all database replicas.

### Optimistic replication

분산 애플리케이션을 설계할 때, __replicas__ (copies of some data need to be stored on multiple computers) 를 사용한다. 예를 들면, Google Docs 같은 collaborative editing 이나, 캘린더, 메모와 같은 모바일 앱 등에서 필요하다.

분산 시스템에서 데이터가 복제(replication)되면 __일관성(consistency)__ 문제가 발생한다.

데이터는 다른 복제본에서 동시에 수정될 수 있다. (서로 다른 클라이언트가 가지고 있는 복제본을 각 클라이언트가 수정할 수 있다.) 이것을 다루는 방법은 2가지가 있다.

__Strongly consistent replication__:
- CAP 이론은 복제본(replicas)이 시스템의 나머지 부분과 연결이 끊어진 동안(e.g 네트워크 분할 or 간헐적으로 연결되는 모바일 장치) 복제본의 데이터 변경이 불가능하다.

__Optimistic replication__:
- 복제본이 오프라인이거나 다른 복제본과 연결이 끊어진 경우에도 다른 복제본과 독립적으로 복제본의 데이터를 수정할 수 있다.
- 성능과 가용성이 최대화되지만 여러 클라이언트나 사용자가 동시에 동일한 데이터를 수정할 경우 충돌이 발생할 수 있다.

CRDT 는 낙관적 복제 시스템에서 사용된다. CRDT는 다른 복제본에서 어떤 데이터 수정이 이루어지더라도 데이터가 항상 일관된 상태로 병합될 수 있도록 보장한다. 

### State-based CRDTs

상태 복제 CRDT는 [보편 집합(Join-semilattice)](https://en.wikipedia.org/wiki/Semilattice) 이라는 개념을 사용한다.

![](/resource/wiki/architecture-crdts/state-crdts.png)

- Commutativity and Asociativity which means that we can perform out of order merge operations and still end up with correct state.
- Idempotency, so we don't need to care about potential duplicates send from replication layer.

더 자세한 내용은 [Bartosz Sypytkowski - An introduction to state-based CRDTs](https://www.bartoszsypytkowski.com/the-state-of-a-state-based-crdts/) 참고.

### Operation-based CRDTs

자세한 내용은 [Bartosz Sypytkowski - Operation-based CRDTs: registers and sets](https://www.bartoszsypytkowski.com/operation-based-crdts-registers-and-sets/) 참고.

## Links

- [CRDTs Tech](https://crdt.tech/)
- [Lars Hupel - An introduction to Conflict-Free Replicated Data Types](https://lars.hupel.info/topics/crdt/01-intro/)
- [When to use a CRDT-based database](https://www.infoworld.com/article/3305321/when-to-use-a-crdt-based-database.html)
- [Diving into Conflict-Free Replicated Data Types (CRDTs)](https://redis.com/blog/diving-into-crdts/)
- [Replicated abstract data types: Building blocks for collaborative applications](https://www.sciencedirect.com/science/article/abs/pii/S0743731510002716)
- [CAP Twelve Years Later: How the "Rules" Have Changed](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)