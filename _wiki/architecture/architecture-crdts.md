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

## Links

- [When to use a CRDT-based database](https://www.infoworld.com/article/3305321/when-to-use-a-crdt-based-database.html)
- [Diving into Conflict-Free Replicated Data Types (CRDTs)](https://redis.com/blog/diving-into-crdts/)
- [Replicated abstract data types: Building blocks for collaborative applications](https://www.sciencedirect.com/science/article/abs/pii/S0743731510002716)
- [CAP Twelve Years Later: How the "Rules" Have Changed](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)