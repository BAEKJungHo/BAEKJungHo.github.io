---
layout  : wiki
title   : Distributed Messaging Queue
summary : Event Streaming Platform
date    : 2025-04-12 15:02:32 +0900
updated : 2025-04-12 18:12:24 +0900
tag     : systemdesign architecture kafka pulsar
toc     : true
comment : true
public  : true
parent  : [[/systemdesign]]
latex   : true
---
* TOC
{:toc}

## Distributed Messaging Queue

___[Messaging Queue](https://en.wikipedia.org/wiki/Message_queue)___ 를 활용하면 아래와 같은 이점을 얻을 수 있다.

- ___[DECOUPLING](https://klarciel.net/wiki/cleancode/cleancode-decoupling/)___
- Scalability: 트래픽 규모에 맞게 Producer 와 Consumer 를 독립적으로 확장할 수 있다.
- Availability: 시스템의 특정 컴포넌트에 장애가 발생해도 다른 컴포넌트는 MQ 와 통신할 수 있다.
- Performance: MQ 를 사용하면 ___[Async Communication](https://klarciel.net/wiki/architecture/architecture-async-nonblocking/)___ 이 쉽게 가능하다.

### Message Model

- 일대일(point-to-point)
- ___[Publish/Subscribe](https://klarciel.net/wiki/architecture/architecture-pub-sub/)___

point-to-point 는 Producer 가 생산한 메시지를 한 명의 Consumer 만 가져갈 수 있는 모델이다. Pub/Sub 을 설명하려면 ___Topic___ 이라는 개념이 필요하다.
Topic 은 메시지를 주제별로 구분하는 데 사용되며, 메시지를 보내고 받을 때 Topic 을 통해서 처리된다.

Distributed Messaging Queue 는 위 2가지 모델을 지원한다. point-to-point 는 ___Consumer Group___ 을 통해 지원할 수 있고, Pub/Sub 은 ___Topic___ 을 통해 지원할 수 있다.
그리고 보통 특정 파티션(토픽을 여러 파티션으로 분리한 것, 그리고 이 파티션을 유지하는 역할이 Broker 이다.) 내의 메시지는 한 Consumer Group 안에서는 오직 한 Consumer 만 소비할 수 있도록 한다.
따라서, 이 경우 그룹 내 Consumer 수가 Topic 의 Partition 수도바 크면, 특정 Consumer 는 해당 Topic 에서 데이터를 읽지 못할 수 있다.

### Coordination Service

조정 서비스(coordination service, e.g [Zookeeper](https://zookeeper.apache.org/doc/r3.5.4-beta/zookeeperOver.html)) 는 다음과 같은 역할을 한다.

- 서비스 탐색(service discovery): 어떤 Broker 가 살아있는지 알려준다.
- 리더 선출(leader election)
  - Apache Zookeeper 나 etcd 가 보통 컨트롤러 선출을 담당한다.

#### Zookeeper

___[Zookeeper](https://zookeeper.apache.org/doc/r3.5.4-beta/zookeeperOver.html)___ 는 계층적 키-값 저장소(hierarchical key-value store) 기능을 제공한다. Distributed Coordination Service, Synchronization Service, Naming Registry 등의 이름으로도 불린다.

Apache ZooKeeper 는 분산 시스템을 위한 코디네이션 서비스로, 다음과 같은 주요 역할을 수행한다.
- 메타데이터 저장소 - 구성 정보, 이름 지정, 분산 동기화 데이터를 저장
- 동기화 서비스 - 분산된 프로세스 간 조정 메커니즘 제공
- 리더 선출 - 분산 시스템에서 마스터 노드 선택 지원
- 잠금 서비스 - 분산 잠금 및 장벽 구현
- 네이밍 서비스 - 분산 시스템의 노드에 이름 등록 및 조회

## References

- Designing Software Architectures: A Practical Approach SECOND EDITION / Rick Kazman
- System Design Interview Volume 2