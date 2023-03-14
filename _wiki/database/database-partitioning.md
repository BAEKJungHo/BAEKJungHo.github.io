---
layout  : wiki
title   : Partitioning
summary : Vertical Partitioning and Sharding
date    : 2023-03-12 15:28:32 +0900
updated : 2023-03-12 18:15:24 +0900
tag     : database
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Partitioning

- __향상된 성능__: 분할은 쿼리에 응답하기 위해 스캔해야 하는 데이터의 양을 줄임으로써 쿼리 성능을 크게 향상시킬 수 있습니다. 테이블이 분할되면 각 파티션에는 데이터의 하위 집합이 포함되며 쿼리는 전체 테이블을 스캔하는 대신 적절한 파티션으로 전달될 수 있습니다. 이를 통해 쿼리 실행 시간이 단축되고 전체 시스템 성능이 향상될 수 있습니다.
- __저장소 요구 사항 감소__: 파티셔닝은 또한 큰 테이블을 저장하는 데 필요한 저장소의 양을 줄일 수 있습니다. 테이블을 더 작은 파티션으로 나누면 __압축 또는 기타 기술을 사용하여 필요한 디스크 공간을 줄여 각 파티션을 보다 효율적으로 저장__ 할 수 있습니다. 이를 통해 스토리지 및 인프라 비용을 크게 절감할 수 있습니다.
- __관리 용이성 향상__: 큰 테이블은 특히 백업, 복원 및 인덱스 재구축과 같은 유지 관리 작업을 수행할 때 관리하기 어려울 수 있습니다. 파티션을 나누면 각 파티션을 서로 독립적으로 백업, 복원 또는 인덱싱할 수 있으므로 이러한 작업을 더 쉽게 수행할 수 있습니다. 이를 통해 관리를 단순화하고 유지 관리 작업 중 가동 중지 시간을 줄일 수 있습니다.
- __확장성__: 파티셔닝은 테이블을 여러 서버 또는 노드로 분할할 수 있도록 하여 확장성을 향상시킬 수도 있습니다. 여러 노드에 데이터를 분산하면 쿼리를 병렬로 처리할 수 있어 성능과 확장성이 향상됩니다. 이는 데이터가 지리적으로 분산되거나 여러 클라이언트가 동시에 액세스할 수 있는 분산 시스템에서 특히 유용합니다.

> 압축 또는 기타 기술을 사용하여 필요한 디스크 공간을 줄여 각 파티션을 보다 효율적으로 저장한다면, 그만큼 캐싱을 더 효율적으로 할 수 있다. 파티셔닝을 설계할 때 중요한 것은 __JOIN 대상인 테이블들이 앞으로도 서버 분할 하지 않을 것__ 이라고 보장할 수 있을 때만 사용하는 게 좋다. entry 와 tag 테이블이 JOIN 대상이었는데 다른 머신으로 분할이 된다면(MySQL 은 서로 다른 서버에 있는 테이블을 JOIN 할 수 있는 기능이 기본적으로는 없다. MySQL 5.1 에서는 FEDERATED 테이블을 이용하면 가능하다.) JOIN 대신 쿼리를 두 번날려서 데이터를 가져와야 한다.

대규모 서비스를 지탱하는 기술 책에서 위 처럼 설명이 되어있는데 서로 다른 머신에 저장시킨다는 내용을 봐서는 수평 파티셔닝(샤딩)을 의미하는 것 같음..  

공부할때 샤딩이라는게 되게 헷갈렸는데.. 샤딩은 파티셔닝의 일종이다.

파티셔닝은 크게 수직/수평 분할을 생각하면 된다. 

[AWS Database Sharding](https://aws.amazon.com/ko/what-is/database-sharding/) - 데이터베이스 샤딩은 수평 파티셔닝과 같습니다. 두 프로세스 모두 데이터베이스를 여러 개의 고유 행 그룹으로 분할합니다. 파티셔닝은 모든 데이터 그룹을 동일한 컴퓨터에 저장하지만, 데이터베이스 샤딩은 서로 다른 컴퓨터에 분산합니다.

### Vertical Partitioning

수직 파티셔닝은 모든 데이터 그룹을 동일한 컴퓨터에 저장한다. 일반적으로 파티셔닝이라 하면 수직 파티셔닝을 의미한다.

자주 사용되는 컬럼과, 그렇지 않은 컬럼을 대상으로 테이블을 쪼개는 것이다. 뭔가 정규화랑 살짝 비슷한 느낌인데... 목적이 다르다.
__정규화는 데이터 중복을 피하기 위해서 컬럼간의 종속성을 제거하는 거라면, 파티셔닝은 Access 빈도가 높은 테이블과 그렇지 않은 테이블로 분리하여 I/O 부하를 줄이는 것이 목적__ 이라 할 수 있다.

### Horizontal Partitioning - Sharding

데이터베이스 샤딩은 대규모 데이터베이스를 여러 머신에 저장하는 프로세스이다. 데이터베이스 샤딩은 데이터를 샤드라고 하는 더 작은 청크로 분할하고 여러 데이터베이스 서버에 저장함으로써 이러한 한계를 극복한다. 

__즉, 하나의 데이터베이스를 여러 부분으로 분할하여 서로 다른 컴퓨터(머신)에 저장하는 프로세스이다.__

샤드키(shard key)라는 것을 기준으로 데이터(row)를 서로 다른 서버에 저장한다. 해외향 애플리케이션을 만들때 대륙별로 사용자들을 나눠서 저장할 때 사용하기 유용할 듯. (e.g 유럽, 미국, 아시아)

샤딩 되게 좋아보이긴 하는데,, 관리도 힘들고 분할 개수가 많아질 수록 어디에 어떤 DB 가 있는 지 파악도 힘들 것 같다. 또한 실수로 JOIN 대상인 테이블을 샤딩 해버리면 ?

샤딩을 하면 Locality 가 증가해서 Caching 효과가 높아지고, 부하가 감소하지만, 운용이 복잡하고 고장 확률이 증가한다.

어디까지나 마지막 카드로 써야 한다.

## Redundancy Master Slave 

다중화(redundancy)는 시스템의 일부에 어떠한 장애가 발생했을 경우에 대비하여, 장애 발생 다음에도 시스템 전체의 기능을 계속 유지하도록 예비 장치를 평상시부터 백업으로서 배치해 운용하는 일이다.

Master 1대, Slave 3대가 다중화를 위한 기본 1세트(총 4대)이다. 

왜 Slave 가 2개면 안될까?

Slave 1개가 서비스 불능 상태일때, 다른 Slave 가 대신 읽기 처리를 할 것이다. 그리고 기존 불능 상태인 Slave 를 대체할 대체 서버가 들어오는 경우 데이터를 복사하기 위해서는 운영중인 Slave 한 대를 중지 시켜야 한다. 

## Links

- [Database Sharding](https://aws.amazon.com/ko/what-is/database-sharding/)

## References

- 대규모 서비스를 지탱하는 기술 / 이토 나오야, 다나카 신지 저 / 제이펍