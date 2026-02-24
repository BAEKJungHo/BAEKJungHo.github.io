---
layout  : wiki
title   : Consistent Hashing
summary :
date    : 2026-02-22 11:02:32 +0900
updated : 2026-02-22 12:12:24 +0900
tag     : architecture hash
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---

* TOC
{:toc}

## Consistent Hashing

***[Consistent Hashing](https://en.wikipedia.org/wiki/Consistent_hashing)*** 은 분산 시스템에서 데이터를 여러 노드에 분배하는 기법으로, 노드의 추가 또는 제거 시 재분배되는 키의 수를 최소화하는 것이 핵심 목표이다.

1997년 Karger 등이 발표한 논문 "Consistent Hashing and Random Trees: Distributed Caching Protocols for Relieving Hot Spots on the World Wide Web" 에서 처음 제안되었으며, 이후 분산 캐시, 분산 데이터베이스, 로드 밸런서 등 거의 모든 분산 시스템의 핵심 구성 요소로 자리잡았다.

### Why Not Modular Hashing

분산 시스템에서 데이터를 N개의 노드에 분배하는 가장 단순한 방법은 ***Modular Hashing*** 이다.

```
node = hash(key) % N
```

이 방식은 N이 고정된 환경에서는 동작하지만, 노드 수가 변경되면 심각한 문제가 발생한다.

__Scenario 1: 노드 추가__

노드가 3개(N=3)인 상태에서 4개(N=4)로 변경되는 경우를 살펴보면:

| Key | hash(key) | hash % 3 | hash % 4 |
|-----|-----------|----------|----------|
| A   | 7         | 1        | 3        |
| B   | 11        | 2        | 3        |
| C   | 15        | 0        | 3        |
| D   | 20        | 2        | 0        |

거의 모든 키의 매핑이 변경된다. 통계적으로 N이 N+1로 변경될 때 약 N/(N+1) 비율의 키가 재매핑되며, 이는 N이 클수록 거의 전체 키가 재분배됨을 의미한다.

분산 캐시 시스템에서 이런 대규모 재분배가 일어나면 ***Cache Stampede*** (또는 Thundering Herd) 현상이 발생한다. 캐시에 저장된 데이터 대부분이 무효화되면서 원본 데이터베이스로의 요청이 폭증하여 시스템 전체가 장애에 빠질 수 있다.

<mark><em><strong>Consistent Hashing 은 노드 변경 시 평균적으로 K/N 개의 키만 재분배함으로써 이 문제를 해결한다. (K = 전체 키 수, N = 노드 수)</strong></em></mark>

### Hash Ring

Consistent Hashing 의 핵심 자료구조는 ***Hash Ring*** (또는 Hash Space) 이다. Hash Function 의 출력 범위를 원형(circular) 공간으로 매핑하는 구조이다.

```
             0 (= 2^m)
              |
        ------+------
      /       |       \
     /        |        \
    |   Node A (h=50)   |
    |         |         |
3/4·2^m -----+----- 1/4·2^m
    |         |         |
    |   Node B (h=180)  |
     \        |        /
      \       |       /
        ------+------
              |
           1/2·2^m
```

__Part1. Hash Space 구성__:

Hash Function 의 출력 범위 $[0, 2^m - 1]$ 을 논리적인 원(ring)으로 구성한다. 예를 들어 SHA-1 을 사용하면 출력은 160-bit 이므로 Hash Space 는 $[0, 2^{160} - 1]$ 이 된다. 이 공간의 시작점(0)과 끝점($2^{160} - 1$)이 논리적으로 연결되어 원형 구조를 형성한다.

__Part2. 노드와 키의 매핑__:

노드(서버)와 키(데이터) 모두 동일한 Hash Function 을 사용하여 Hash Ring 위의 한 점으로 매핑된다. 노드는 일반적으로 IP 주소, 호스트 이름, 또는 이들의 조합을 입력으로 사용한다.

```
hash("192.168.1.1") → Ring 위의 위치
hash("user:1234")   → Ring 위의 위치
```

### Clockwise Assignment

키가 매핑된 Hash Ring 위의 위치에서 ***시계 방향(clockwise)*** 으로 순회하여 처음 만나는 노드가 해당 키를 담당한다.

```
         0
         |   ← Key X (h=30)
    Node C
   (h=350)\
          |
          |          Node A (h=90)  ← Key X 는 Node A 가 담당
          |         /
          +--------+
          |
     Node B (h=200)
```

위 예시에서 Key X 의 해시값이 30이면, 시계 방향으로 순회하여 처음 만나는 Node A(해시값 90)가 Key X 를 담당한다.

이 구조에서 각 노드는 자신과 반시계 방향 이전 노드 사이의 구간에 속하는 모든 키를 담당하게 된다.

### Hash Function Selection

Consistent Hashing 에서 Hash Function 의 선택은 키 분배의 균일성에 직접적인 영향을 미친다.

| Hash Function | Output Size | Speed | Uniformity | 주요 용도 |
|---------------|-------------|-------|------------|-----------|
| ***MD5*** | 128-bit | 보통 | 좋음 | Ketama (Memcached) |
| ***SHA-1*** | 160-bit | 느림 | 우수 | 학술적 기준, Chord 등 |
| ***MurmurHash3*** | 128-bit | 빠름 | 우수 | Cassandra (Murmur3Partitioner) |
| ***xxHash*** | 64/128-bit | 매우 빠름 | 우수 | 고성능 시스템 |

Consistent Hashing 의 목적상 암호학적 안전성(cryptographic security)은 필요하지 않으므로, 실무에서는 속도와 분배 균일성이 우수한 ***MurmurHash*** 나 ***xxHash*** 를 주로 사용한다.

### Lookup Complexity

키가 어느 노드에 할당되는지를 조회하는 시간복잡도는 자료구조에 따라 달라진다.

__방법 1. Sorted List + Binary Search__:

Ring 위의 노드 위치를 정렬된 배열이나 Balanced BST(e.g. TreeMap)에 저장하면, 주어진 키의 해시값보다 크거나 같은 첫 번째 노드를 $O(\log N)$ 으로 탐색할 수 있다.

```java
// Java TreeMap 기반 구현 예시
TreeMap<Long, String> ring = new TreeMap<>();

// 노드 추가
ring.put(hash("NodeA"), "NodeA");
ring.put(hash("NodeB"), "NodeB");
ring.put(hash("NodeC"), "NodeC");

// 키 조회 - ceilingEntry 로 시계 방향 다음 노드 탐색
public String getNode(String key) {
    long h = hash(key);
    Map.Entry<Long, String> entry = ring.ceilingEntry(h);
    if (entry == null) {
        // Ring 의 끝을 넘어가면 처음(가장 작은 해시값)으로 순환
        entry = ring.firstEntry();
    }
    return entry.getValue();
}
```

__방법 2. Jump Consistent Hash__:

***[Jump Consistent Hash](https://arxiv.org/abs/1406.2294)*** (Lamping, Veach, 2014)는 $O(1)$ 메모리, $O(\ln N)$ 시간으로 동작하는 알고리즘이다. 별도의 자료구조 없이 수학적 계산만으로 키-노드 매핑을 결정한다.

```c
// Jump Consistent Hash (원문 논문의 C 구현)
int32_t JumpConsistentHash(uint64_t key, int32_t num_buckets) {
    int64_t b = -1, j = 0;
    while (j < num_buckets) {
        b = j;
        key = key * 2862933555777941757ULL + 1;
        j = (b + 1) * (double(1LL << 31) / double((key >> 33) + 1));
    }
    return b;
}
```

다만 Jump Consistent Hash 는 노드를 0부터 N-1까지의 연속적인 번호로만 관리할 수 있으므로, 임의의 노드 제거(중간 노드 삭제)를 지원하지 않는다는 제약이 있다.

### Adding and Removing Nodes

Consistent Hashing 의 가장 큰 장점은 노드 추가/제거 시 최소한의 키만 재분배된다는 점이다.

__노드 추가 시__:

새 노드 D 가 Ring 에 추가되면, Node D 와 반시계 방향 이전 노드 사이의 키만 Node D 로 이동한다. 나머지 키는 영향을 받지 않는다.

```
  Before:                   After (Node D 추가):

       A                         A
      / \                       / \
     /   \                     /   \
    C --- B                   C     B
                                \   /
                                 \ /
                                  D

  이동 대상: 기존에 B 가 담당하던 키 중
  Node D 의 범위에 속하는 키만 D 로 이전
```

평균적으로 K/N 개의 키만 재분배된다. (K = 전체 키 수, N = 변경 후 노드 수)

__노드 제거 시__:

제거된 노드가 담당하던 키가 시계 방향 다음 노드로 이전된다. 다른 노드의 키는 영향받지 않는다.

### Virtual Nodes

물리 노드가 적은 경우 Hash Function 의 특성만으로는 균일한 분배를 보장할 수 없다.

__문제: Non-uniform Distribution__

예를 들어 물리 노드가 3개인 경우, 이들이 Ring 위에서 특정 영역에 몰려 있으면 하나의 노드가 Ring 의 대부분의 구간을 담당하게 되어 부하가 편중된다.

```
  비균일 분배:                  균일 분배 (이상적):
       0                            0
       |                            |
  A----+                       A----+----B
  |    |                       |    |    |
  B    |                       |    |    |
  |    |                       C----+----D
  C----+                            |
       |
  (A, B, C 가 한쪽에 몰려있음)
```

__해결: Virtual Nodes (VNodes)__

***Virtual Node*** 는 하나의 물리 노드를 Ring 위의 여러 지점에 매핑하는 기법이다. 각 물리 노드에 대해 V개의 가상 노드를 생성하면, 대수의 법칙(law of large numbers)에 의해 키 분배가 균일해진다.

```
물리 노드 A → 가상 노드: A-0, A-1, A-2, ..., A-149
물리 노드 B → 가상 노드: B-0, B-1, B-2, ..., B-149
물리 노드 C → 가상 노드: C-0, C-1, C-2, ..., C-149
```

가상 노드의 해시값은 보통 다음과 같이 생성한다:

```
hash("NodeA-0"), hash("NodeA-1"), ..., hash("NodeA-149")
```

__Trade-offs__:

| 가상 노드 수 | 분배 균일성 | 메모리 오버헤드 | 조회 성능 |
|-------------|-----------|---------------|---------|
| 적음 (< 50) | 불균일 가능 | 낮음 | 빠름 |
| 보통 (100-200) | 양호 | 적정 | 적정 |
| 많음 (> 500) | 매우 균일 | 높음 | 느림 |

실무에서는 물리 노드당 100~200개의 가상 노드를 사용하는 것이 일반적이다. Cassandra 의 경우 기본값으로 256개의 token(vnode)을 사용한다.

이종(heterogeneous) 하드웨어 환경에서는 노드의 성능에 비례하여 가상 노드 수를 다르게 설정할 수 있다. 예를 들어 고성능 서버에는 300개, 일반 서버에는 100개의 가상 노드를 할당하여 자연스러운 가중치 기반 부하 분산을 구현할 수 있다.

### Mathematical Properties

Consistent Hashing 은 다음의 수학적 속성을 통해 분산 시스템에서의 유용성이 보장된다.

__Balance__:

모든 키가 노드들에 균등하게 분배되는 성질이다. V개의 가상 노드를 사용할 때, 각 노드에 할당되는 키의 비율은 이론적으로 1/N 에 수렴한다.

__Monotonicity__:

새로운 노드가 추가될 때, 키는 기존 노드에서 새 노드로만 이동하며, 기존 노드 간에는 키가 이동하지 않는다. 이 성질은 캐시 시스템에서 특히 중요하다. 캐시가 불필요하게 무효화되지 않음을 보장하기 때문이다.

$$\text{Node 추가 시}: \forall k, \text{ if } f(k) = n_i \text{ and } f'(k) \neq n_i, \text{ then } f'(k) = n_{\text{new}}$$

여기서 $f$ 는 노드 추가 전의 매핑 함수, $f'$ 는 추가 후의 매핑 함수이다.

__Spread__:

서로 다른 클라이언트(서로 다른 뷰를 가진)가 동일한 키를 서로 다른 노드에 매핑하는 경우의 수를 최소화하는 성질이다. 네트워크 파티션 등으로 인해 클라이언트마다 보이는 노드 집합이 다를 수 있는 상황에서 중요하다.

__Load__:

어떤 노드에 매핑되는 키의 수가 공평한 몫(fair share)을 넘지 않도록 하는 성질이다. Spread 가 키 관점의 속성이라면, Load 는 노드 관점의 속성이다.

### System Design Applications

#### Distributed Caching: Memcached, Redis Cluster

분산 캐시에서 Consistent Hashing 을 사용하는 핵심 이유는 ***Cache Invalidation 최소화*** 이다.

캐시 서버를 추가하거나 제거할 때(스케일 아웃/인, 서버 장애 등), Modular Hashing 을 사용하면 거의 모든 캐시가 miss 상태가 되어 백엔드 데이터베이스에 대한 요청이 폭증한다. Consistent Hashing 은 이 상황에서 K/N 개의 키만 영향받도록 보장한다.

***Memcached*** 의 경우 클라이언트 라이브러리 레벨에서 Consistent Hashing 을 구현한다. ***Ketama*** 라이브러리가 대표적이며, 각 서버에 대해 MD5 해시 기반으로 Ring 위에 여러 지점(기본 100~200개)을 할당한다.

***Redis Cluster*** 는 16384개의 ***Hash Slot*** 을 사용하는 변형된 접근을 취한다. CRC16(key) % 16384 로 키를 슬롯에 매핑하고, 각 슬롯은 특정 노드에 할당된다. 이는 엄밀한 의미의 Consistent Hashing 은 아니지만, 슬롯 단위의 재분배를 통해 유사한 이점을 제공한다.

#### Distributed Databases: Amazon DynamoDB, Apache Cassandra

분산 데이터베이스에서 Consistent Hashing 은 ***Data Partitioning*** 과 ***Replication*** 전략의 기반이 된다.

***[Amazon DynamoDB](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)*** (원래 Dynamo 논문, 2007):

- Consistent Hashing 을 사용하여 데이터를 파티셔닝한다.
- 각 키에 대해 Ring 을 시계 방향으로 순회하며 N개의 서로 다른 물리 노드를 찾아 ***Preference List*** 를 구성한다. 이 리스트의 첫 번째 노드가 coordinator 가 되어 해당 키의 읽기/쓰기를 조율한다.
- Virtual Node 를 활용하여 이종 하드웨어의 성능 차이를 반영한다. 고성능 서버에 더 많은 가상 노드를 할당한다.
- ***Vector Clock*** 을 사용하여 데이터 버전 충돌을 추적하고, 클라이언트 측에서 충돌을 해결한다.

***Apache Cassandra***:

- ***Token Ring*** 구조를 사용한다. 각 노드는 하나 이상의 token 을 소유하며, 이 token 이 Ring 위의 위치를 결정한다.
- ***Murmur3Partitioner*** 가 기본 파티셔너로, MurmurHash3 를 사용하여 파티션 키를 $[-2^{63}, 2^{63} - 1]$ 범위의 token 으로 매핑한다.
- VNode 설정은 `cassandra.yaml` 의 `num_tokens` 파라미터로 제어하며, 기본값은 256이다.
- Replication 은 Ring 위에서 시계 방향으로 다음 N개의 서로 다른 Rack/Datacenter 에 속하는 노드에 복제본을 배치하는 ***NetworkTopologyStrategy*** 를 지원한다.

#### Load Balancing: Nginx, HAProxy, Envoy

로드 밸런서에서 Consistent Hashing 은 ***Session Affinity*** (Sticky Session) 와 ***Connection Affinity*** 를 구현하는 데 사용된다.

클라이언트의 IP 주소나 요청 헤더의 특정 값을 키로 사용하여, 동일한 클라이언트의 요청이 항상 동일한 백엔드 서버로 라우팅되도록 보장한다. 백엔드 서버가 추가되거나 제거되어도 대부분의 기존 클라이언트-서버 매핑은 유지된다.

***Nginx*** 에서는 `upstream` 블록에서 `hash` 지시자를 사용하여 Consistent Hashing 을 활성화할 수 있다:

```nginx
upstream backend {
    hash $request_uri consistent;
    server backend1.example.com;
    server backend2.example.com;
    server backend3.example.com;
}
```

***Envoy*** proxy 는 ***Ketama*** 기반의 Consistent Hashing 을 Ring Hash Load Balancer 로 구현하고 있으며, Maglev 방식도 지원한다.

#### CDN: Content Delivery Network

CDN 에서 Consistent Hashing 은 ***Content Placement*** 와 ***Request Routing*** 에 활용된다.

특정 콘텐츠(URL 기반)가 항상 동일한 Edge Server 에 캐시되도록 하여, 캐시 적중률(hit ratio)을 극대화한다. Edge Server 의 추가/제거 시에도 대부분의 콘텐츠-서버 매핑이 유지되므로, 캐시 재구축 비용이 최소화된다.

```
Client Request → hash(URL) → Hash Ring → Edge Server
                                          |
                                    Cache Hit?
                                   /        \
                                 Yes         No
                                  |           |
                             Serve Cache   Fetch from Origin
                                              → Cache → Serve
```

#### Distributed Hash Tables: Chord, Kademlia

***[Chord](https://pdos.csail.mit.edu/papers/ton:chord/paper-ton.pdf)*** 프로토콜은 Consistent Hashing 위에 구축된 대표적인 P2P Lookup 프로토콜이다.

- 각 노드와 키에 SHA-1 해시를 적용하여 m-bit 식별자 공간에 매핑한다.
- 각 노드는 ***Finger Table*** 을 유지하며, i번째 항목은 현재 노드에서 $2^i$ 만큼 떨어진 위치를 담당하는 노드를 가리킨다.
- 이를 통해 N개 노드 네트워크에서 $O(\log N)$ 홉으로 임의의 키를 조회할 수 있다.
- 노드 가입/이탈 시 ***Stabilization Protocol*** 을 통해 Finger Table 을 점진적으로 업데이트한다.

***Kademlia*** 는 BitTorrent DHT 등에서 사용되는 프로토콜로, Consistent Hashing 과 동일한 핵심 아이디어(노드와 키를 동일한 식별자 공간에 매핑하고, 키를 가장 가까운 노드에 할당)를 공유한다. 다만 Ring 구조와 시계 방향 탐색 대신 ***XOR 거리 메트릭*** 을 사용하여 노드 간 "가까움"을 정의하며, 라우팅에는 k-bucket 기반의 라우팅 테이블을 사용한다는 점에서 구조적으로 다르다.

#### Message Queue Partitioning: Kafka

Apache Kafka 는 기본적으로 Consistent Hashing 을 직접 사용하지 않는다. Producer 의 기본 파티셔닝 전략은 `hash(key) % num_partitions` (Modular Hashing)이므로, 파티션 수 변경 시 키 매핑이 크게 변한다. 필요한 경우 커스텀 `Partitioner` 인터페이스를 구현하여 Consistent Hashing 을 적용할 수 있지만, 이는 Kafka 의 기본 기능은 아니다.

다만 Kafka 의 Consumer Group Rebalancing 에서 ***Sticky Assignor*** 와 ***Cooperative Sticky Assignor*** 는 Consistent Hashing 의 핵심 원리인 "기존 할당을 최대한 유지하고 변경을 최소화한다"는 개념에서 영감을 받았다. Consumer 가 추가되거나 제거될 때, 기존 Consumer-Partition 매핑을 가능한 한 유지하여 불필요한 재할당과 그에 따른 상태 재구축 비용을 최소화한다. 이는 Consistent Hashing 알고리즘 자체를 사용하는 것이 아니라, 동일한 설계 원칙(minimal disruption)을 차용한 것이다.

### Real-World Implementations

#### Amazon Dynamo

***[Amazon Dynamo](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)*** (2007, SOSP)는 Consistent Hashing 의 실무 적용에 있어 가장 영향력 있는 시스템 중 하나이다.

핵심 설계 결정:

- ***Preference List***: 각 키에 대해 Ring 위에서 시계 방향으로 N개의 서로 다른 물리 노드를 선택하여 복제 대상을 결정한다. Virtual Node 를 사용하므로, 동일 물리 노드의 여러 가상 노드가 연속으로 나타날 수 있어 이를 건너뛰고 서로 다른 물리 노드만 선택한다.
- ***Virtual Nodes for Heterogeneous Hardware***: 서버 사양에 따라 가상 노드 수를 조절한다. 성능이 2배인 서버에는 2배의 가상 노드를 할당하여 자연스러운 가중치 분배를 구현한다.
- ***Hinted Handoff***: 노드 장애 시 Ring 위의 다음 가용 노드가 임시로 키를 받아 저장하고, 장애 노드가 복구되면 데이터를 전달한다. 이 과정은 Ring 구조 덕분에 자연스럽게 수행된다.
- ***Merkle Trees***: 노드 간 데이터 동기화를 위해 각 가상 노드 범위별로 Merkle Tree 를 유지하여, 불일치 데이터를 효율적으로 탐지하고 복구한다.

#### Apache Cassandra

Cassandra 는 Dynamo 논문의 영향을 받아 설계되었으며, 다음과 같은 Consistent Hashing 관련 구현 세부사항이 있다:

- ***Partitioner***: 파티션 키를 token 으로 매핑하는 모듈이다.
    - `Murmur3Partitioner` (기본): MurmurHash3 사용, 출력 범위 $[-2^{63}, 2^{63} - 1]$
    - `RandomPartitioner`: MD5 사용, 출력 범위 $[0, 2^{127} - 1]$
- ***VNode 설정***: `num_tokens` (기본 256). 각 노드가 소유하는 token 수이며, token 은 Ring 위의 위치를 나타낸다.
- ***Token Allocation***: VNode 를 활성화하면 각 노드는 지정된 수의 token 을 무작위로 할당받는다. Cassandra 3.0 이상에서는 `allocate_tokens_for_keyspace` 옵션으로 좀 더 균일한 token 할당을 지원한다.

#### Ketama

***Ketama*** 는 Last.fm 에서 개발한 Memcached 용 Consistent Hashing 라이브러리이다.

- MD5 해시를 사용하여 서버를 Ring 에 배치한다.
- 각 서버에 대해 MD5("서버주소-가상노드번호")를 계산하여 여러 지점에 배치한다. MD5 의 128-bit 출력을 4개의 32-bit 값으로 분할하여 하나의 해시 계산으로 4개의 가상 노드를 생성한다.
- 서버당 기본 40회의 해시 계산을 수행하여 160개(40 x 4)의 가상 노드를 생성한다.
- 조회 시 TreeMap 기반의 정렬된 구조에서 Binary Search 로 $O(\log N)$ 에 대상 서버를 결정한다.
- 다양한 언어(C, Java, Python, PHP 등)로 포팅되어 사실상의 Memcached Consistent Hashing 표준으로 자리잡았다.

### Limitations and Edge Cases

Consistent Hashing 은 강력한 기법이지만 만능은 아니다. 실무에서 고려해야 할 한계와 경계 사례가 존재한다.

__Hotspot Key Problem__:

Consistent Hashing 은 키를 노드에 균등하게 분배하지만, 특정 키에 대한 접근 빈도(access frequency)까지 균등하게 분배하지는 않는다. 예를 들어 소셜 미디어에서 유명인의 프로필 데이터는 하나의 키에 집중된 트래픽을 유발하며, 해당 키가 매핑된 노드에 과부하가 걸린다. 이 문제는 Consistent Hashing 자체가 아닌 애플리케이션 레벨(캐시 복제, 읽기 분산 등)에서 해결해야 한다.

__Cascade Failure on Node Removal__:

노드가 장애로 제거되면 해당 노드의 부하가 시계 방향 다음 노드로 전이된다. 다음 노드가 이미 높은 부하 상태라면, 추가 부하로 인해 해당 노드도 장애가 발생할 수 있으며, 이것이 연쇄적으로 이어지는 ***Cascading Failure*** 가 발생할 수 있다. Bounded Load Consistent Hashing 은 이 문제를 완화하지만 완전히 해결하지는 못한다.

__Rebalancing Complexity in Practice__:

이론적으로 K/N 개의 키만 이동하면 되지만, 실제 프로덕션 환경에서의 데이터 마이그레이션은 복잡하다. 마이그레이션 중의 데이터 일관성 보장, 네트워크 대역폭 제한을 위한 throttling, 마이그레이션 진행 중 해당 키에 대한 읽기/쓰기 처리(dual-read 등)를 고려해야 한다.

### Advanced Topics

#### Bounded Load Consistent Hashing

***[Bounded Load Consistent Hashing](https://arxiv.org/abs/1608.01350)*** (Mirrokni, Thorup, Zadimoghaddam, 2016)은 Google 에서 제안한 기법으로, Consistent Hashing 의 최대 부하를 $(1 + \varepsilon) \times \text{평균 부하}$ 이하로 보장한다.

기본 Consistent Hashing 에서는 Virtual Node 를 사용해도 특정 노드에 부하가 집중될 수 있다. Bounded Load 방식은 다음과 같이 동작한다:

1. 키를 Ring 위에서 시계 방향으로 다음 노드에 할당하려 할 때, 해당 노드의 현재 부하가 임계값 $(1 + \varepsilon) \times (K/N)$ 을 초과하면 다음 노드로 넘어간다.
2. 이 과정을 부하에 여유가 있는 노드를 찾을 때까지 반복한다.

이 기법은 Monotonicity 를 일부 희생하지만, Balance 를 엄격하게 보장하며, Google 의 Cloud Load Balancing 등에 적용되었다.

#### Jump Consistent Hash

***[Jump Consistent Hash](https://arxiv.org/abs/1406.2294)*** (Lamping, Veach, 2014)는 메모리 사용량 $O(1)$, 시간복잡도 $O(\ln N)$ 의 효율적인 알고리즘이다.

핵심 원리:
- 버킷 수가 N에서 N+1로 증가할 때, 각 키가 $1/(N+1)$ 의 확률로 새 버킷으로 이동하도록 설계되었다.
- 상태 없이 수학적 계산만으로 매핑을 결정하므로 메모리 오버헤드가 없다.

제약사항:
- 버킷을 0부터 N-1까지 연속 번호로만 식별할 수 있다.
- 중간 번호의 버킷을 제거할 수 없다. 마지막 버킷만 제거 가능하다.
- 따라서 임의의 노드 추가/제거가 빈번한 환경에는 적합하지 않고, 노드 수가 순차적으로 증감하는 환경(e.g. 정적 스토리지 시스템)에 적합하다.

#### Rendezvous Hashing

***[Rendezvous Hashing](https://en.wikipedia.org/wiki/Rendezvous_hashing)*** (Highest Random Weight, HRW)은 Consistent Hashing 의 대안적 접근이다. 1996년 Thaler 와 Ravishankar 가 제안하였다.

동작 원리:
1. 키와 모든 노드의 조합에 대해 해시값을 계산한다: $\text{hash}(key, node_i)$ for all $i$
2. 해시값이 가장 높은 노드에 키를 할당한다.

```
key = "user:1234"
h("user:1234", NodeA) = 0.82  ← 최대값 → NodeA 에 할당
h("user:1234", NodeB) = 0.45
h("user:1234", NodeC) = 0.71
```

Consistent Hashing 과의 비교:

| 속성 | Consistent Hashing | Rendezvous Hashing |
|------|-------------------|-------------------|
| 조회 시간 | $O(\log N)$ | $O(N)$ |
| 메모리 | $O(N \times V)$ (가상 노드 포함) | $O(N)$ |
| 노드 변경 시 재분배 | K/N | K/N |
| 구현 복잡도 | 중간 (Ring + 가상 노드) | 낮음 |
| 가상 노드 필요 | 필요 | 불필요 (자체적으로 균일 분배) |

Rendezvous Hashing 은 구현이 단순하고 가상 노드 없이도 균일한 분배를 제공하지만, 조회 시 모든 노드에 대해 해시를 계산해야 하므로 노드 수가 매우 많은 환경에서는 비효율적이다. 노드 수가 적은(수십~수백) 환경에서는 좋은 대안이 될 수 있다.

#### Maglev Hashing

***[Maglev Hashing](https://research.google/pubs/pub44824/)*** 은 Google 이 2016년에 발표한 네트워크 로드 밸런서 Maglev 에서 사용하는 해싱 기법이다.

핵심 아이디어:
- 고정 크기의 ***Lookup Table*** (크기 M, 소수)을 사전에 구축한다.
- 각 노드가 Lookup Table 의 엔트리를 라운드 로빈으로 채워 넣는 방식으로, Populate 알고리즘을 통해 테이블을 구성한다.
- 조회 시 `table[hash(key) % M]` 으로 $O(1)$ 에 노드를 결정한다.

특성:
- Lookup Table 크기 M 이 클수록 분배가 균일해진다. 논문에서는 M = 65537 을 사용한다.
- 노드 변경 시 Lookup Table 을 재구축해야 하지만, 변경되는 엔트리 수는 최소화되도록 설계되었다.
- 특히 네트워크 로드 밸런서처럼 패킷 단위로 빠른 결정이 필요한 환경에서 $O(1)$ 조회 성능이 장점이다.

Consistent Hashing 과의 비교:

| 속성 | Consistent Hashing | Maglev Hashing |
|------|-------------------|----------------|
| 조회 시간 | $O(\log N)$ | $O(1)$ |
| 메모리 | $O(N \times V)$ | $O(M)$ (Lookup Table) |
| 노드 변경 시 영향 | 최소 | Lookup Table 재구축 필요 |
| 주요 용도 | 분산 스토리지, 캐시 | 네트워크 로드 밸런서 |
| 최소 disruption | K/N (이론적 최적) | K/N 에 가깝지만 정확히 K/N 은 아님 |

### Summary

```
+--------------------------------------------------------------+
|              Consistent Hashing 계열 비교                      |
+--------------------------------------------------------------+
| Algorithm       | Lookup  | Memory  | Arbitrary Node Removal |
|-----------------|---------|---------|------------------------|
| Ring + VNode    | O(lg N) | O(N*V)  | Yes                    |
| Jump CH         | O(ln N) | O(1)    | No (tail only)         |
| Rendezvous/HRW  | O(N)    | O(N)    | Yes                    |
| Maglev          | O(1)    | O(M)    | Yes (rebuild needed)   |
+--------------------------------------------------------------+
```

<mark><em><strong>Consistent Hashing 은 분산 시스템의 확장성(scalability)과 가용성(availability)을 지탱하는 핵심 기법이며, 캐시, 데이터베이스, 로드 밸런서, CDN, P2P 등 거의 모든 분산 시스템에서 활용된다.</strong></em></mark>

## Links

- [Consistent Hashing - Wikipedia](https://en.wikipedia.org/wiki/Consistent_hashing)
- [Consistent Hashing and Random Trees (Karger et al., 1997)](https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf)
- [Amazon Dynamo Paper (2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
- [Jump Consistent Hash Paper (Lamping, Veach, 2014)](https://arxiv.org/abs/1406.2294)
- [Bounded Loads Paper (Mirrokni et al., 2016)](https://arxiv.org/abs/1608.01350)
- [Maglev Paper (Eisenbud et al., 2016)](https://research.google/pubs/pub44824/)
- [Chord: A Scalable P2P Lookup Protocol](https://pdos.csail.mit.edu/papers/ton:chord/paper-ton.pdf)

## References

- Designing Data-Intensive Applications / Martin Kleppmann / O'Reilly
- System Design Interview Vol. 1 / Alex Xu / Chapter 5: Design Consistent Hashing
- Distributed Systems: Principles and Paradigms / Andrew S. Tanenbaum, Maarten Van Steen
- Amazon Dynamo: Highly Available Key-value Store / DeCandia et al. / SOSP 2007
- A Fast, Minimal Memory, Consistent Hash Algorithm / Lamping, Veach / 2014
- Consistent Hashing with Bounded Loads / Mirrokni, Thorup, Zadimoghaddam / 2016
- Maglev: A Fast and Reliable Software Network Load Balancer / Eisenbud et al. / NSDI 2016
