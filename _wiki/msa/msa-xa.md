---
layout  : wiki
title   : eXtended Architecture
summary : Distributed Transaction and Consensus Algorithm
date    : 2022-12-21 17:54:32 +0900
updated : 2022-12-21 20:15:24 +0900
tag     : msa architecture dod distributed
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Distributed Transaction

Two-phase Commit 으로 구현된 분산 트랜잭션은 평판이 엇갈린다. 한편에서는 다른 방법으로 달성하기 어려운 중요한 안전성 보장을 제공하는 것으로 본다. 다른 한편에서는 운영상의 문제를 일으키고 성능을 떨어뜨린다는 비판을 받는다. __여러 클라우드 서비스들은 분산 트랜잭션이 낳는 운영상 문제 때문에 분산 트랜잭션을 구현하지 않는 선택을 한다.__

MySQL 의 분산 트랜잭션은 단일 노드 트랜잭션보다 [10배 이상 느리다고 보고](https://www.amazon.com/Weapons-Math-Destruction-Increases-Inequality/dp/0553418815)된다.

2PC 가 성공적으로 트랜잭션을 커밋하려면 모든 참여자가 응답해야 한다. 즉, 시스템의 어떤 부분 한 곳이라도 고장나면 트랜잭션에 실패한다. __따라서 분산 트랜잭션은 장애를 증폭 시키는 경향이 있으며 내결함성(Fault tolerance) 을 지닌 시스템을 구축하려는 목적에 어긋난다.__

## Two-Phase Commit

Two-phase Commit 은 여러 노드에 걸친 원자적 트랜잭션 커밋을 달성하는, 즉 모든 노드가 commit 되거나 모든 노드가 abort 되도록 보장하는 알고리즘이다.

![](/resource/wiki/msa-xa/twopc.png)

2PC 는 단일 노드 트랜잭션에서는 보통 존재하지 않는 새로운 컴포넌트인 __코디네이터(coordinator, 트랜잭션 관리자)__ 를 사용한다. 2PC 는 각 데이터베이스 노드를 __참여자(participant)__ 라고 부른다.

- 모든 참여자가 커밋할 준비가 됐다는 뜻으로 'YES' 를 응답하면 코디네이터는 2단계에서 commit 요청을 보내고 커밋이 실제로 일어난다.
- 참여자 중 누구라도 'NO' 를 응답하면 코디네이터는 2단계에서 모든 노드에 abort 요청을 보낸다.

> __Two-Phase Commit Process__
> 
> 1. 애플리케이션은 분산 트랜잭션을 시작하기를 원할 때 코디네이터에게 __Transaction ID__ 를 요청한다. 이 트랜잭션 ID 는 전역적으로 __유일__ 하다.
> 
> 2. 애플리케이션은 각 참여자에서 단일 노드 트랜잭션을 시작하고 단일 노드 트랜잭션에 전역적으로 유일한 트랜잭션 ID 를 붙인다. 모든 읽기와 쓰기는 이런 단일 노드 트랜잭션 중 하나에서 실행된다. 이 단계에서 뭔가 잘못되면(노드가 죽거나 타임아웃) 코디네이터 참여자 중 누군가가 어보트 할 수 있다.
> 
> 3. 애플리케이션이 커밋할 준비가 되면 코디네이터는 모든 참여자에게 전역 트랜잭션 ID 로 태깅된 준비 요청을 보낸다. 이런 요청 중 실패하거나 타임아웃된 것이 있으면 코디네이터는 모든 참여자에게 그 트랜잭션 ID 로 어보트 요청을 보낸다.
> 
> 4. 참여자가 준비 요청을 받으면 모든 상황에서 분명히 트랜잭션을 커밋할 수 있는지 확인한다. 여기에는 모든 트랜잭션이 데이터를 디스크에 쓰는 것(죽거나 전원 장애나 디스크 공간이 부족한 것은 나중에 커밋을 거부하는 용인되는 변명이 아니다)과 충돌이나 제약 조건 위반을 확인하는게 포함된다. 코디네이터에게 'YES' 라고 응답함으로써 노드는 요청이 있으면 트랜잭션을 오류 없이 커밋할 것이라고 약속한다. 달리 말하면 참여자들은 트랜잭션을 어보트할 권리를 포기하지만 실제로 커밋하지는 않는다.
> 
> 5. 코디네이터가 모든 준비 요청에 대해 응답을 받았을 때 __트랜잭션을 커밋할 것인지 어보트할 것인지 최종적 결정__ 을 한다(모든 참여자가 'YES' 에 투표했을 때만 커밋한다). 코디네이터는 추후 죽는 경우에 어떻게 결정했는지 알 수 있도록 그 __결정을 디스크에 있는 트랜잭션 로그에 기록__ 해야 한다. 이를 __Commit Point__ 라고 한다.
> 
> 6. 코디네이터의 결정이 디스크에 쓰여지면 모든 참여자에게 커밋이나 어보트 요청이 전송된다. 이 요청이 실패하거나 타임아웃이 되면 코디네이터는 성공할 때까지 영원히 재시도해야 한다. 더 이상 돌아갈 곳은 없다. 그 결정이 커밋이었다면 재시도를 몇 번 하든지 상관없이 그 결정을 강제해야 한다. 도중에 한 참여자가 죽었다면 트랜잭션은 그 참여자가 복구될 때 커밋된다. 참여자가 'YES' 라고 투표했으므로 복구될 때 커밋을 거부할 수 없다.

- __2PC 에서 돌아갈 수 없는 지점__
  - 참여자가 'YES' 에 투표할 때 분명히 나중에 커밋할 수 있을 것이라 약속한다.
  - 코디네이터의 commit or abort 결정
- __참여자들이 'YES' 에 투표하고 코디네이터가 죽으면 어떻게 될까?__
  - 이 경우 2PC 가 완료할 수 있는 유일한 방법은 코디네이터가 복구되길 기다리는 것 뿐이다. 이것이 코디네이터가 참여자들에게 커밋이나 어보트 요청을 보내기 전에, 그 결정을 디스크에 써야 하는 이유이다. 즉, 코디네이터는 Commit Point 를 잘 기록해야 한다.

### Voting Phase - Commit Request

1. The coordinator sends a query to commit message to all participants and waits until it has received a reply from all participants.
2. The participants execute the transaction up to the point where they will be asked to commit. They each write an entry to their undo log and an entry to their redo log.
3. Each participant replies with an agreement message (participant votes Yes to commit), if the participant's actions succeeded, or an abort message (participant votes No, not to commit), if the participant experiences a failure that will make it impossible to commit.

### Completion Phase - Commit

- __Success__

If the coordinator received an agreement message from all participants during the commit-request phase:

1. The coordinator sends a commit message to all the participants.
2. Each participant completes the operation, and releases all the locks and resources held during the transaction.
3. Each participant sends an acknowledgement to the coordinator.
4. The coordinator completes the transaction when all acknowledgements have been received.

- __Failure__

If any participant votes No during the commit-request phase (or the coordinator's timeout expires):

1. The coordinator sends a rollback message to all the participants.
2. Each participant undoes the transaction using the undo log, and releases the resources and locks held during the transaction.
3. Each participant sends an acknowledgement to the coordinator.
4. The coordinator undoes the transaction when all acknowledgements have been received.

### Drawbacks are Low Performance

__Two-phase Commit 이 느린 이유는 성능 비용의 많은 부분은 장애 복구를 위해 필요한 디스크 강제 쓰기(fsync)와 부가적인 네트워크 왕복 시간 때문이다.__

## Heterogeneous Distributed Transaction

이종 분산 트랜잭션(Heterogeneous Distributed Transaction)에서 참여자들은 둘 혹은 그 이상의 다른 기술이다. 예를 들면 서로 다른 벤더의 데이터베이스일 수도 있고, 메시지 브로커일 수도 있다. 이런 시스템에 걸친 분산 트랜잭션은 시스템 내부가 완전히 다르더라도 __원자적 커밋__ 을 보장해야 한다.

### Effectively exactly once

분산 트랜잭션에서 트랜잭션의 영향을 받는 모든 시스템들이(e.g RDB, Message Broker) 동일한 원자적 커밋 프로토콜을 사용할 수 있다면, 메시지 전달이나 데이터베이스 트랜잭션 중 하나가 실패하면 둘 다 어보트되고 메시지 브로커는 나중에 메시지를 안전하게 다시 전달할 수 있다.

만약에, 메시지 전송 시 이메일을 발송을 위해 이메일 서버를 사용 중이고, 해당 서버는 2PC 를 지원하지 않으면 메시지 처리가 실패하고 재시도되면 이메일은 두 번 전송될 수 있다.

## X/Open XA

> The goal of XA is to guarantee atomicity in __"global transactions"__ that are executed across heterogeneous components. To guarantee integrity, [XA](https://en.wikipedia.org/wiki/X/Open_XA) uses a [two-phase commit (2PC)](https://en.wikipedia.org/wiki/Two-phase_commit_protocol) to ensure that all of a transaction's changes either take effect (commit) or do not (roll back), i.e., atomically.

XA 는 PostgreSQL, MySQL, Oracle 등을 포함한 여러 전통적인 관계형 데이터베이스와 메시지 브로커에서 지원된다. 자바 EE 애플리케이션 서계에서 __XA Transaction__ 은 __JTA(Java Transaction API)__ 를 사용해 구현되며 JTA 는 JDBC(Java Database Connectivity) 를 사용하는 데이터베이스용 드라이버 다수와 자바 메시지 서비스(JMS, Java Message Service) API 를 사용하는 메시지 브로커용 드라이버에서 지원된다.

Transaction Coordinator 는 XA API 를 구현한다. 즉, 트랜잭션 참여자를 추적하고 참여자들에게 준비 요청을 보낸 후 그들의 응답을 수집하고 각 트랜잭션에 대한 커밋/어보트 결정을 추적하기 위해 로컬 디스크에 있는 로그를 사용한다.

## Heuristic Decision

Coordinator 장애가 발생하면 __Orphaned Transaction__ (어떤 이유 때문인지 그 결과를 결정할 수 없는 트랜잭션) 이 생길 수 있다. 이 경우에는 데이터베이스 서버를 재부팅해도 이 문제를 고칠 수 없으며, 관리자가 수동으로 커밋하거나 롤백할지 결정해야 한다.

__경험적 결정(Heuristic Decision)__ 은 코디네이터로부터 확정적 결정을 얻지 않고 의심스러운 트랜잭션을 어보트하거나 커밋할지를 일방적으로 결정할 수 있도록 하는 것을 의미한다. 정확히 말하면 __'경험적'__ 은 2PC 의 약속 체계를 위반하기 때문에 __아마도 원자성을 깰 수 있다__ 를 완곡하게 표현한 것이다. 따라서 경험적 결정은 큰 장애 상황을 벗어나고자 할 때만 쓰도록 의도된 것이다.

따라서, XA 를 구현하는 경우 __Heuristic Decision__ 이라는 비상 탈출구를 잘 마련해야 한다.

## Consensus Algorithm

[내결함성(Fault tolerance)](https://baekjungho.github.io/wiki/msa/msa-fault-tolerance/)을 지닌, 대표적인 합의 알고리즘(Consensus Algorithm)에는 __Raft Consensus Algorithm__ 이 있다.

- __합의 알고리즘의 핵심 Idea__
  - 균일한 동의: 어떤 두 노드도 다르게 저장하지 않는다.
  - 무결성: 어떤 두 노드도 두 번 결정하지 않는다.
  - 유효성: 한 노드가 값 v 를 결정한다면 v 는 어떤 노드에서 제안된 것이다.
  - 종료: 죽지 않는 모든 노드는 결국 어떤 값을 저장한다.

균일한 동의와 무결성 속성은 합의 알고리즘의 핵심 아이디어이다. 모듀 같은 결과로 결정하며 한 번 결정하면 마음을 바꿀 수 없다.

### Raft Consensus Algorithm

[뗏목 합의 알고리즘(Raft Consensus Algorithm)](https://raft.github.io/)은 다수 노드로 이루어진 분산 시스템에서 전체 노드의 최신화 및 동기화, 그리고 내결함성(False Tolerance)을 동시에 구현하기 위해 만들어진 합의 알고리즘의 일종이다.

Raft 알고리즘은 현재 쿠버네티스(Kubernetes)의 etcd 클러스터, MongoDB 의 레플리카 셋(replica set) 등 다양한 영역에 접목되어 활용되고 있다.

Kafka 또한 Zookeeper 에서 [KRaft](https://developer.confluent.io/learn/kraft/) 를 사용하도록 교체되었다.

뗏목 합의 알고리즘이 적용된 분산 시스템에서 모든 노드는 일반적으로 하나의 리더와 나머지 팔로워들로 구성되며, 후보자는 오직 리더가 없거나 무응답 상태일 경우에만 일시적으로 존재한다. 뗏목 합의 알고리즘은 클러스터 전체에 대한 명령이 __오직 리더로부터 팔로워에게 일방향으로 전파__ 되도록 동작한다.

![](/resource/wiki/msa-xa/raft.png)

- __Leader__: 리더는 클라이언트가 클러스터로 보낸 모든 명령의 수신 및 전파, 그리고 응답을 전담한다. 또한 리더는 자신의 상태 메시지(heartbeat)를 주기적으로 모든 팔로워에게 전파한다.
- __Follower__: 리더로부터 전파된 명령을 처리하는 역할만 담당한다.
- __Candidate__: 더가 없는 상황에서 새 리더를 정하기 위해 전환된 팔로워의 상태를 의미한다. 리더로부터 일정 시간 이상 상태 메시지(heartbeat)를 받지 못한 팔로워는 후보자로 전환된다.

> __Heartbeat__ 
> 
> 리더가 다른 모든 팔로워에게 일정 시간 간격으로 반복 전달하는 메시지다. 이 메시지에는 클라이언트의 명령 전파를 위한 로그(log)가 포함되지 않으며, 오직 리더가 자신의 상태를 유지하는 수단으로만 기능한다.

### Quorum

합의 알고리즘이 적용된 분산 시스템에서 어떤 변화를 적용하고자 할 때에는 클러스터의 전체 노드 수(N) 가운데 자기 자신을 포함하여 최소 과반의, 즉 __(N+1)/2 이상의 응답을 얻어야 한다.__ 이때 요구되는 최소한의 노드 수, 즉 (N+1)/2와 같거나 큰 자연수에 해당하는 수를 __정족수(Quorum)__ 라고 부른다.

정족수는 내결함성(Fault Tolerance)을 지닌 시스템을 구축하는데에도 중요하다. 예를 들어 전체 노드 3개 중에서 1개가 잘못되더라도 나머지 2개가 동작하기 때문에 잘못된 노드의 복구시간을 downtime 없이 벌 수 있다. 따라서, __이 정족수가 충족되지 않는다면 클러스터가 제대로 기능을 할 수 없게된다.__

Kafka 도 그렇고 합의 알고리즘(Consensus Algorithm)을 채택한 분산 시스템에서는 전체 노드 수를 가급적 3개 이상의 홀수로 유지하는 것이 권장된다. 이유는 다음과 같다.

1. 최소 3개의 노드가 있어야 클러스터가 내결함성(Fault Tolerance)을 갖출 수 있다.
2. 전체 노드 수가 홀수일 때 허용 가능한 장애 노드 수의 비율이 좀 더 높다.

- N 이 홀수(2k+1)일 때: k개 노드의 장애까지 허용 가능
- N 이 짝수(2k)일 때  k-1개 노드의 장애까지 허용 가능

### Epoch Number

대부분의 합의 프로토콜은 리더를 사용하지만 리더가 유일하다고 보장하진 않는다. 대신 그들은 더 약한 보장을 할 수 있다. 이 프로토콜들은 __Epoch Number(Raft 에서는 term number 라고 함)__ 라는 것을 사용한다.

![](/resource/wiki/msa-xa/term.png)

__각 Epoch 내에서는 리더가 유일하다고 보장한다.__ 현재 리더가 죽었다고 생각될 때마다 새 노드를 선출하기 위해 노드 사이에서 투표가 시작된다. 이 선출은 에포크 번호를 증가 시킨다. 다른 에포크에 있는 두 가지 다른 리더 사이에 충돌이 있으면 에포크 번호가 높은 리더가 이긴다.

노드는 자신의 판단을 꼭 믿을 수 있는 것은 아니다. 노드가 자신이 리더라고 생각한다고 해서 다른 노드가 반드시 그 노드를 리더로 받아들인다는 뜻은 아니다. 대신 노드의 __정족수(Quorum)__ 로 부터 투표를 받아야 한다. 즉, 과반수 이상의 투표를 받아야 하는데 2PC 의 과정과 비슷해 보인다. 하지만 합의 알고리즘은 새로운 리더가 선출된 후 노드를 일관적인 상태로 만들어주는 __복구 과정__ 을 정의해서 __안정성 속성이 항상 만족 되도록 보장__ 한다. 이런 차이점은 합의 알고리즘의 정확성과 내결함성의 핵심이다.

### Drawbacks

합의 시스템은 장애 노드를 감지하기 위해 일반적으로 __타임아웃(timeout)__ 에 의존한다. __네트워크 지연의 변동이 심한 환경__ 에서, 특히 지리적으로 분산된 시스템에서 일시적인 네트워크 문제 때문에 노드가 리더에 장애가 발생했다고 잘못 생각하는 일이 종종 생긴다. 이 오류는 __잦은 리더 선출로 인해 성능에 악영향__ 을 끼친다. 즉, 합의 알고리즘은 __네트워크 문제__ 에 특히 민감하다.

## Membership Service

Zookeeper 나 etcd 같은 프로젝트는 종종 '분산 키-값 저장소' 또는 '코디네이션과 설정 서비스'라고 설명된다. 주어진 키에 대한 값을 읽거나 쓸 수 있고 키에 대해 순회할 수 있다.

Zookeeper 와 etcd 는 완전히 메모리 안에 들어올 수 있는 소량의 데이터를 보관하도록 설계됐다. (여전히 지속성을 위해 디스크에 쓰긴 한다.) 따라서 애플리케이션의 모든 데이터를 여기에 저장하는 것은 올바르지 않다. 이 소량의 데이터는 내결함성을 지닌 __전체 순서 브로드캐스트 알고리즘__ 을 사용해 __모든 노드에 걸쳐 복제__ 된다. 따라서 복제본들이 서로 일관성을 유지할 수 있다.

Zookeeper 와 유사 프로젝트들은 오랜 __멤버십 서비스(Membership Service)__ 연구 역사의 일부로 볼 수 있다. 그 역사는 1980 년대로 거슬로 올라가며 항공 교통 관제 같은 고신뢰성 시스템을 구축하는 데 중요한 역할을 했다.

합의는 시스템에서 어떤 노드가 현재 멤버십을 구성하는지 동의하는 데 매우 유용하다. 예를 들어 리더 선택을 현재 멤버들 중 번호가 낮은 것을 선택하는 식으로 간단히 구현할 수도 있지만 다른 노드와 현재 멤버가 누군지에 대해 의견이 갈린다면 이 방법은 동작하지 않는다.

## Links

- [Eventual Consistency](https://baekjungho.github.io/wiki/msa/msa-eventual-consistency/)
- [Raft Consensus Algorithm and Quorum](https://seongjin.me/raft-consensus-algorithm/)
- [In Search of an Understandable Consensus Algorithm](https://raft.github.io/raft.pdf)
- [KIP-500: Replace ZooKeeper with a Self-Managed Metadata Quorum](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum#KIP500:ReplaceZooKeeperwithaSelfManagedMetadataQuorum-Motivation)

## References

- 데이터 중심 애플리케이션 설계 / Martin Kleppmann 저 / 위키북스