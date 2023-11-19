---
layout  : wiki
title   : CRDTs
summary : Conflict-Free Replicated Data Types
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
그렇다고 A 를 포기할 여유도 없다. 그래서 아키텍트들이 채택하는 방식이 [Eventual Consistency](https://baekjungho.github.io/wiki/msa/msa-eventual-consistency/) 이다. Eventual Consistency 는 [2PC](https://baekjungho.github.io/wiki/msa/msa-xa/#two-phase-commit) 보다 빠르기 때문에, 더 많은 양의 쓰기가 가능하다. 하지만 한 가지 문제가 있는데, 바로 __충돌(conflicts)__ 가능성이다.

이 문제를(simultaneous writes on the same item at two different locations) 해결하는 방법 중, CRDTs 가 [Strong eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency#Strong_eventual_consistency) 를 제공한다. 

> Strong Eventual Consistency 란 사이트 A가 사이트 B의 상태 변경 사항을 즉시 반영하지 않을 수 있지만 A와 B가 메시지를 동기화하면 둘 다 일관성을 회복하고 잠재적인 충돌을 해결할 필요가 없음을 의미한다.(CRDT는 수학적으로 충돌 발생을 방지)

금융 거래, 독점 리소스 액세스 또는 할당과 같이 __즉각적인 일관성__ 이나 __트랜잭션 무결성__ 이 필요한 시나리오에서는 강력한 최종 일관성이 허용되지 않을 수 있어서 CRDTs 가 적합하지 않을 수 있다.

__[CRDT satisfies A + P + Eventual Consistency](https://www.loro.dev/docs/concepts/crdt)__

### What is CRDTs?

> [What is CRDTs ?](https://www.loro.dev/blog/loro-now-open-source)
> 
> CRDT 는 충돌 없이 여러 복제본에 걸쳐 업데이트를 병합할 수 있는 분산 시스템에서 사용되는 데이터 구조입니다. 이러한 맥락에서 "복제본"은 다양한 사용자 장치의 동일한 공동 작업 문서와 같이 시스템 내의 서로 다른 독립적인 데이터 인스턴스를 나타냅니다.
>
> CRDT 를 사용하면 사용자는 다른 복제본과 실시간 통신할 필요 없이 문서 편집과 같이 복제본에서 독립적으로 작업할 수 있습니다. CRDT는 이러한 작업을 병합하여 모든 복제본이 "강력한 최종 일관성"을 달성하도록 보장합니다. 모든 노드가 순서에 관계없이 동일한 업데이트 세트를 수신하는 한 해당 데이터 상태는 결국 일관됩니다.

[Conflict-Free Replicated Data Types](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) 는 __Commutative replicated data types__(교환 가능한 복제 데이터 타입) 이라고도 부른다.
특징 중 하나는, 충돌이 발생하지 않기 때문에 __충돌 해결(there is no concept of conflict resolution)__ 이라는 개념이 없다. CRDTs 는 eventual consistency 를 만족한다.

CRDTs are special data types that converge data from all database replicas.

__Partition-tolerance__:
- Partiton-tolerance 란 서로 다른 구성 요소 간의 통신이 끊어지거나 지연되어 파티션이나 네트워크 오류가 발생하는 경우에도 분산 시스템이 계속 제대로 작동할 수 있는 능력을 의미한다.
- 사용자는 오프라인 상태에서도 CRDT 를 사용할 수 있다. 네트워크가 복원되면 다른 사람들과 다시 동기화할 수 있다. 또한 P2P를 통해 다른 사용자와의 공동 편집도 지원한다. 이를 분할 내결함성 이라고 한다. 이를 통해 CRDT 는 분산형 애플리케이션을 매우 잘 지원할 수 있다. 중앙 집중식 서버 없이도 동기화를 수행할 수 있다.

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

- [Conflict-free Replicated Data Types (CRDTs)](https://arxiv.org/abs/1805.06358)
- [CRDTs Tech](https://crdt.tech/)
- [Lars Hupel - An introduction to Conflict-Free Replicated Data Types](https://lars.hupel.info/topics/crdt/01-intro/)
- [When to use a CRDT-based database](https://www.infoworld.com/article/3305321/when-to-use-a-crdt-based-database.html)
- [Diving into Conflict-Free Replicated Data Types (CRDTs)](https://redis.com/blog/diving-into-crdts/)
- [Replicated abstract data types: Building blocks for collaborative applications](https://www.sciencedirect.com/science/article/abs/pii/S0743731510002716)
- [CAP Twelve Years Later: How the "Rules" Have Changed](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)