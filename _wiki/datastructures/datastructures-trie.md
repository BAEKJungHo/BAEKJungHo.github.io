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

대표적으로 Go 의 고성능 라우터인 ___[HttpRouter](https://github.com/julienschmidt/httprouter)___ 에서 Radix Tree 를 사용한다.
URL 경로는 계층 구조를 가지고 있으며 제한된 문자 집합(바이트 값)만 사용하기 때문에 공통 접두사(common prefix)가 많을 가능성이 높다. 이를 통해 라우팅 문제를 훨씬 더 작은 단위로 쉽게 줄일 수 있다.

Here is a short example what the routing tree for the GET request method could look like:

```
Priority   Path             Handle
9          \                *<1>
3          ├s               nil
2          |├earch\         *<2>
1          |└upport\        *<3>
2          ├blog\           *<4>
1          |    └:post      nil
1          |         └\     *<5>
2          ├about-us\       *<6>
1          |        └team\  *<7>
1          └contact\        *<8>
```

`*<number>` 는 핸들러 함수(포인터)의 메모리 주소를 나타낸다.

Priority 값은 주로 라우팅 최적화에서 사용된다. 예를 들어 httprouter 에서는 퍼포먼스를 높이기 위해서 자식 노드 탐색 시 우선순위를 고려해 가장 가능성이 높은 경로부터 먼저 탐색한다.
즉, 많은 경로를 품고 있는(자식이 많은) 노드부터 먼저 살펴본다. 왜냐하면 그럴수록 우리가 원하는 경로를 찾을 확률이 높기 때문이다.
많은 경로를 담당하는 노드를 먼저 살펴보는 이유는, "한 번의 탐색으로 많은 경로를 커버할 수 있어서" 이다. 이것은 비용 대비 효율이 좋은 탐색 방식이라서, Priority 값을 기반으로 왼쪽부터 오른쪽으로 탐색한다.

- Root /는 9 → 서브트리에 총 9개의 경로가 있음
- s → search/ + support/ 두 개 포함 → priority 3
- blog/ 아래엔 3개의 노드 → priority 2
- leaf 노드는 priority 1

__/blog/:post/ 경로의 경우__:

```
├blog\           *<4>
└:post           nil
 └\             *<5>
```

- blog\ → /blog/로 끝나는 경로 → 핸들러 4
- :post → path parameter (예: /blog/golang에서 post=golang)
- \ → path 가 슬래시로 종료될 때만 매칭됨 → 핸들러 5
- e.g
  - GET /blog/ → 핸들러 4
  - GET /blog/intro/ → 핸들러 5
  - GET /blog/intro → 매칭 안됨 (핸들러 없음, nil)
