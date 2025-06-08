---
layout  : wiki
title   : DIGITAL TREE
summary : 
date    : 2025-06-08 11:28:32 +0900
updated : 2025-06-08 12:15:24 +0900
tag     : datastructures trie
toc     : true
comment : true
public  : true
parent  : [[/datastructures]]
latex   : true
---
* TOC
{:toc}

## DIGITAL TREE

A ___[trie](https://en.wikipedia.org/wiki/Trie)___, also known as a ___digital tree___ or ___prefix tree___, is a specialized search tree data structure used to store and retrieve strings from a dictionary or set.

![](/resource/wiki/algorithm-trie/trie-page.png)
<small>Fredkin, E. (1960). Trie Memory.</small>

___[Tire](https://bioinformatics.cvr.ac.uk/trie-data-structure/)___ 는 "retrieval"의 중간 철자에서 유래된 단어로, 핵심은 ___공통 접두사(prefix)를 공유함으로써 공간을 절약하고, 검색 속도를 높이는 것___ 이다.

__Time Complexity__:
- 삽입/검색/삭제: O(k)
- 메모리: O(N × K), N은 문자열 개수, K는 평균 길이
- 와일드카드 매칭, 접두사 탐색 등이 필요할 경우에는 Trie 가 HashMap 보다 유리하다.

Trie 의 핵심 철학은 <mark><em><strong>PREFIX SHARING</strong></em></mark> 이다.
접두사(prefix)를 공유함으로써 중복을 제거하고, 그 결과 빠른 검색과 공간 절약이라는 실용적인 성능을 제공한다.

실무에서는 검색 자동완성, 라우팅 테이블, pub/sub 시스템(___[NATS - Subject-Based Messaging](https://docs.nats.io/nats-concepts/subjects)___ 등), 사전(dict) 구현 등에 쓰인다.
실무에서 데이터를 검색하고 필터링하고 매칭해야 할 때, 한 번쯤 Trie 로 해결할 수 있는지 고민해보는 것도 좋다.

__Examples__:

| Scenario | Description |
|----------|-------------|
|검색 자동완성, 추천|	빠른 prefix 탐색|
|API 라우팅|	path 기반 탐색 최적화|
|Pub/Sub 토픽 매칭|	wildcard 포함 효율적 매칭|
|키워드 필터링|	불쾌어 등 필터링 트리 구성|

## Radix Tree

기존 Trie 는 노드가 문자 하나만 가지면 낭비가 된다. 따라서, 공통으로 사용되는 공통 접두사(common prefix) 를 압축(compact) 하여 사용하는 것을 ___[compact prefix tree (or Radix tree, PATRICIA tree)](https://en.wikipedia.org/wiki/Radix_tree)___ 라고 한다.

Trie 에서는 모든 비교에 상수 시간이 필요하지만, 길이가 m 인 문자열을 조회하려면 m번의 비교가 필요하다. 기수 트리(radix tree)는 이러한 작업을 더 적은 비교로 수행할 수 있으며, 훨씬 적은 노드가 필요하다.

대표적으로 Go 의 고성능 라우터인 ___[HttpRouter](https://github.com/julienschmidt/httprouter)___ 에서 이 

## Links

- [NATS 내부에서 살펴보는 메시지 매칭 구현](https://on.com2us.com/tech/nats_sublist/)
