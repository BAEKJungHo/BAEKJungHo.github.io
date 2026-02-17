---
layout  : wiki
title   : KAFKA FUNDAMENTALS
summary : 
date    : 2026-02-17 07:54:32 +0900
updated : 2026-02-17 08:15:24 +0900
tag     : kafka architecture distributed
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

# KAFKA FUNDAMENTALS

## Kafka Architecture Overview

Apache Kafka 는 분산 이벤트 스트리밍 플랫폼이다. 높은 처리량(Throughput), 내구성(Durability), 수평 확장성(Horizontal Scalability) 을 동시에 달성하기 위해 설계된 아키텍처를 가지고 있다.

### Broker Internal Architecture

***Broker*** 는 Kafka 클러스터를 구성하는 개별 서버 프로세스이다. 각 Broker 는 고유한 `broker.id` 를 가지며, 하나 이상의 Topic 의 Partition 데이터를 저장한다. Broker 내부는 Reactor 패턴 기반의 네트워크 처리 파이프라인으로 구성된다.

```
Client Request Flow (Broker Internal Pipeline)

  Client
    ↓
  Acceptor Thread (1개, ServerSocketChannel)
    ↓  accept()
  Network Thread Pool (num.network.threads, 기본값 3)
    ↓  read() → Request 파싱
  Request Queue (공유 BlockingQueue)
    ↓  poll()
  I/O Thread Pool (num.io.threads, 기본값 8)
    ↓  실제 비즈니스 로직 수행 (디스크 I/O, 메타데이터 조회)
  Response Queue (Network Thread 별 개별 큐)
    ↓
  Network Thread
    ↓  write()
  Client
```

**Acceptor Thread** 는 `java.nio.channels.ServerSocketChannel` 을 통해 클라이언트 연결을 수락한다. 수락된 연결은 `java.nio.channels.Selector` 를 사용하는 Network Thread 에 round-robin 방식으로 분배된다. 이 구조는 Doug Lea 의 Scalable I/O in Java 에서 제시한 Multiple ***[Reactor](https://klarciel.net/wiki/reactive/reactive-eventloop/)*** 패턴의 구현이다.

**`num.network.threads`** 는 NIO Selector 기반의 Network Thread 수를 결정한다. 이 스레드들은 커널의 `epoll` (Linux) 또는 `kqueue` (macOS) 시스템 콜을 통해 소켓 I/O 다중화를 수행한다. 커널 레벨에서 보면, 각 Network Thread 는 하나의 `epoll_fd` (epoll file descriptor) 를 소유하고, `epoll_wait()` 시스템 콜로 등록된 소켓들의 I/O 이벤트를 감시한다. 클라이언트 수가 증가하면 하나의 Selector 가 관리하는 소켓 수가 늘어나므로, `num.network.threads` 를 증가시켜 부하를 분산해야 한다. 일반적으로 CPU 코어 수의 절반 정도를 설정한다.

**`num.io.threads`** 는 실제 디스크 I/O 와 비즈니스 로직을 처리하는 스레드 수이다. 이 스레드들은 Request Queue 에서 요청을 꺼내 처리한 후 결과를 해당 Network Thread 의 Response Queue 에 넣는다. 커널 레벨에서 Produce 요청은 `pwrite()` 시스템 콜을 통해 Segment 파일에 데이터를 기록하고, Fetch 요청은 `sendfile()` 또는 `transferTo()` 를 통해 Page Cache 에서 직접 소켓으로 데이터를 전송한다. I/O Thread 가 디스크 접근 중 블로킹될 수 있으므로, Network Thread 보다 더 많은 수를 설정하는 것이 일반적이다. CPU 코어 수의 1~2배를 설정한다.

**Request Queue** 는 `java.util.concurrent.ArrayBlockingQueue` 로 구현되며, `queued.max.requests` (기본값 500) 로 크기가 제한된다. 큐가 가득 차면 Network Thread 가 블로킹되어 새로운 요청을 읽지 못하게 되고, 이는 클라이언트 측에서 타임아웃으로 나타난다.

### Controller

***Controller*** 는 Kafka 클러스터에서 단 하나의 Broker 가 수행하는 특수한 역할이다. Controller 는 클러스터 전체의 메타데이터 관리와 상태 변경을 책임진다.

**Leader Election**: Partition 의 Leader Broker 가 장애로 이탈하면 Controller 가 해당 Partition 의 ISR (In-Sync Replica) 목록에서 새로운 Leader 를 선출한다. Controller 는 ISR 목록에서 현재 살아 있는(클러스터에 등록된) 첫 번째 Replica 를 새 Leader 로 선출한다. ISR 목록은 순서가 있는 리스트이며, Replica 가 ISR 에서 제거되었다가 다시 추가되면 목록의 끝에 추가된다. `unclean.leader.election.enable=true` 설정 시 ISR 이 비어있으면 Out-of-Sync Replica 에서도 Leader 를 선출할 수 있지만, 이 경우 데이터 유실이 발생할 수 있다.

**Partition Reassignment**: Broker 추가/제거 시 Partition 을 재배치한다. `kafka-reassign-partitions.sh` 도구를 통해 수동으로 실행하거나, Cruise Control 같은 자동화 도구를 사용한다. 재배치 과정에서 Controller 는 새로운 Replica 를 생성하고, 데이터 동기화가 완료된 후 기존 Replica 를 제거한다.

**ISR 변경 감지**: Follower Broker 가 `replica.lag.time.max.ms` (기본값 30초) 이내에 Leader 의 최신 데이터를 복제하지 못하면, Leader Replica 가 이를 감지하고 ISR 에서 해당 Follower 를 제거하는 요청을 보낸다. ZooKeeper 모드에서는 Leader 가 ZooKeeper 에 직접 ISR 변경을 기록하고, KRaft 모드에서는 Leader 가 Controller 에 `AlterPartition` 요청을 보낸다. 반대로, 복제가 따라잡으면 다시 ISR 에 추가한다.

### ZooKeeper Dependency and KRaft Transition

Kafka 는 초기부터 Apache ZooKeeper 를 외부 메타데이터 저장소로 사용해왔다. ZooKeeper 에 저장되는 정보는 Broker 목록, Topic 설정, Partition Leader/ISR 정보, ACL, Consumer Group Offset (구버전) 등이다.

ZooKeeper 의존성이 문제가 되는 이유는 다음과 같다:

- **운영 복잡성 증가**: Kafka 클러스터 외에 ZooKeeper 앙상블(최소 3노드)을 별도로 운영해야 한다. 모니터링, 백업, 업그레이드 대상이 두 배로 늘어난다.
- **확장성 병목**: ZooKeeper 는 모든 메타데이터를 메모리에 유지하므로, Partition 수가 수십만 개를 넘어가면 ZooKeeper 의 메모리가 부족해진다. 또한, Controller 가 ZooKeeper Watch 를 통해 변경 사항을 감지하는 방식은 대규모 클러스터에서 Watch Storm 을 유발할 수 있다.
- **Controller Failover 지연**: Controller Broker 가 장애 시 새로운 Controller 가 선출되면, ZooKeeper 에서 전체 메타데이터를 다시 읽어와야 한다. Partition 수가 많으면 이 과정이 수 분까지 걸릴 수 있다.

***KRaft*** (Kafka Raft Metadata Mode) 는 ZooKeeper 를 제거하고 Kafka 자체에 Raft 합의 알고리즘을 내장한 새로운 메타데이터 관리 방식이다. KRaft 의 핵심 장점은 다음과 같다:

- **단일 시스템 운영**: ZooKeeper 앙상블이 불필요하므로 운영 대상이 절반으로 줄어든다.
- **메타데이터 로그 기반 복제**: 메타데이터 변경 사항이 `__cluster_metadata` 라는 Internal Topic 에 로그로 기록되고, Raft 프로토콜을 통해 복제된다. 이 방식은 Kafka 의 기존 로그 복제 메커니즘과 동일한 패턴이므로 아키텍처적 일관성이 확보된다.
- **빠른 Controller Failover**: 새로운 Controller 가 메타데이터 로그의 최신 스냅샷에서 시작하므로, ZooKeeper 방식보다 Failover 가 수 초 이내로 빨라진다.
- **Partition 수 확장**: ZooKeeper 의 메모리 제약이 사라지므로, 단일 클러스터에서 수백만 개의 Partition 을 지원할 수 있게 된다.

KRaft 모드에서는 **Controller Quorum** 이라는 별도의 프로세스 그룹이 메타데이터를 관리한다. Controller Quorum 은 Raft 프로토콜에 따라 Leader 를 선출하고, 메타데이터 변경은 과반수(Quorum) 의 동의를 받아야 커밋된다. `controller.quorum.voters` 설정으로 Quorum 구성원을 지정한다.

### Cluster Membership

Broker 가 클러스터에 참여하는 과정은 다음과 같다:

1. Broker 프로세스가 시작되면 `bootstrap.servers` 또는 `controller.quorum.voters` (KRaft 모드) 에 지정된 주소로 연결을 시도한다.
2. ZooKeeper 모드에서는 ZooKeeper 의 `/brokers/ids/{broker.id}` 경로에 Ephemeral ZNode 를 생성한다. 이 ZNode 에는 Broker 의 호스트, 포트, rack 정보가 포함된다.
3. Controller 가 새로운 Broker 의 등록을 감지하면 클러스터 메타데이터를 업데이트하고, 필요 시 Partition Reassignment 를 수행한다.

Broker 가 클러스터에서 이탈하는 과정은 다음과 같다:

1. **Graceful Shutdown**: Broker 프로세스가 정상 종료되면 `controlled.shutdown.enable=true` (기본값) 설정에 따라, 해당 Broker 가 Leader 인 모든 Partition 의 Leadership 을 다른 ISR Broker 에게 이전한 후 종료한다. 이로써 클라이언트의 가용성 중단이 최소화된다.
2. **Hard Failure**: Broker 가 비정상 종료되면 ZooKeeper 의 Ephemeral ZNode 가 세션 타임아웃 (`zookeeper.session.timeout.ms`, 기본값 18초) 후 삭제된다. Controller 가 이를 감지하고 해당 Broker 의 모든 Leader Partition 에 대해 Leader Election 을 수행한다.

```
Producer → Broker (Leader) → Disk (Segment Files)
                ↓
         Broker (Follower) → Replication
                ↓
         Consumer ← Fetch
```

---

## Log Storage Internals

Kafka 가 압도적인 처리 성능을 달성하는 근본적인 이유는 **OS 커널의 I/O 최적화 메커니즘을 최대한 활용하는 저장소 설계** 에 있다. <mark><em><strong>Kafka 는 JVM Heap 에 데이터를 캐싱하지 않고, OS 의 Page Cache 에 데이터 캐싱을 위임함으로써 GC 오버헤드를 제거하고, Zero-Copy 전송을 가능하게 한다.</strong></em></mark>

### Segment File Structure

Kafka 의 각 Partition 은 디스크 상에서 하나의 디렉토리로 표현되며, 그 안에 여러 개의 ***Segment*** 파일들이 순차적으로 저장된다. 디렉토리 이름은 `{topic-name}-{partition-number}` 형식이다.

각 Segment 는 세 가지 파일로 구성된다:

**`.log` 파일**: 실제 메시지 데이터가 저장되는 파일이다. 각 레코드는 `RecordBatch` 형식으로 저장되며, 배치 내에는 여러 개의 개별 레코드가 포함된다. RecordBatch 헤더에는 base offset, batch length, partition leader epoch, magic byte (레코드 포맷 버전), CRC32 checksum, attributes (압축 코덱, 타임스탬프 타입, 트랜잭션 여부), last offset delta, base timestamp, max timestamp, producer id, producer epoch, base sequence 등의 메타데이터가 포함된다. 파일 이름은 해당 Segment 의 첫 번째 offset 을 20자리 0-padding 으로 표현한다 (예: `00000000000000000000.log`).

**`.index` 파일**: offset 에서 `.log` 파일 내 물리적 위치(byte position)로의 매핑을 저장하는 인덱스 파일이다. 각 엔트리는 4바이트 상대 offset + 4바이트 물리적 위치, 총 8바이트로 구성된다. Consumer 가 특정 offset 의 메시지를 요청하면, Kafka 는 이 인덱스를 이진 탐색(Binary Search) 하여 해당 offset 이 저장된 `.log` 파일의 대략적인 위치를 빠르게 찾는다.

**`.timeindex` 파일**: 타임스탬프에서 offset 으로의 매핑을 저장하는 인덱스 파일이다. 각 엔트리는 8바이트 타임스탬프 + 4바이트 상대 offset, 총 12바이트로 구성된다. 시간 기반 메시지 조회 (`offsetsForTimes()` API) 에 사용된다.

**Segment 분할 기준**:

- `log.segment.bytes` (기본값 1GB): Segment 파일 크기가 이 값에 도달하면 새로운 Segment 가 생성된다.
- `log.roll.ms` / `log.roll.hours` (기본값 168시간 = 7일): 현재 Segment 의 첫 번째 메시지 타임스탬프로부터 이 시간이 경과하면 새로운 Segment 가 생성된다.
- 두 조건 중 하나라도 먼저 만족하면 새로운 Segment 로 롤링된다.

**Sparse Index**: `.index` 파일은 모든 offset 을 인덱싱하지 않는다. `index.interval.bytes` (기본값 4096바이트) 만큼의 데이터가 `.log` 파일에 기록될 때마다 하나의 인덱스 엔트리를 추가한다. 모든 offset 을 인덱싱하지 않는 이유는 다음과 같다:

1. **인덱스 파일 크기 절약**: 수억 개의 offset 을 모두 인덱싱하면 인덱스 파일 자체가 거대해져서 메모리와 디스크를 낭비한다.
2. **Sequential Read 활용**: 인덱스에서 가장 가까운 위치를 찾은 후, `.log` 파일에서 순차적으로 스캔하여 정확한 offset 을 찾는다. Kafka 의 데이터 접근 패턴은 대부분 sequential 이므로 이 스캔 비용은 매우 낮다.
3. **mmap 효율**: 인덱스 파일은 `mmap()` 시스템 콜로 메모리에 매핑되므로, 파일이 작을수록 Page Cache 효율이 높아진다.

### Page Cache and Zero-Copy

***Page Cache*** 는 OS 커널의 VFS (Virtual File System) 계층에서 디스크 블록을 메모리에 캐싱하는 메커니즘이다. Linux 커널은 사용 가능한 물리 메모리의 대부분을 Page Cache 로 활용한다. 파일 I/O 시 커널은 먼저 Page Cache 를 확인하고, 캐시 히트 시 디스크 접근 없이 메모리에서 데이터를 반환한다 (캐시 미스 시 디스크에서 읽어 Page Cache 에 적재한 후 반환한다).

Kafka 가 JVM Heap 대신 Page Cache 에 데이터 캐싱을 위임하는 것은 의도적인 설계 결정이다:

- **GC 회피**: JVM Heap 에 대량의 메시지 데이터를 캐싱하면 GC Pause 가 발생한다. 특히 Full GC 는 수 초 이상의 STW (Stop-The-World) 를 유발하여 Broker 의 응답 지연을 초래한다. Page Cache 는 커널이 관리하므로 JVM GC 의 영향을 받지 않는다.
- **프로세스 재시작 시 캐시 유지**: Kafka Broker 를 재시작해도 Page Cache 는 커널 메모리에 남아있으므로, 재시작 직후에도 디스크 I/O 없이 데이터를 서빙할 수 있다. JVM Heap 캐시는 프로세스 종료 시 소멸된다.
- **Zero-Copy 전송 가능**: 데이터가 Page Cache 에 있으면 `sendfile()` 시스템 콜을 통해 커널 공간에서 직접 네트워크로 전송할 수 있다.

전통적인 데이터 전송 방식에서는 파일 데이터를 네트워크로 전송하기 위해 다음과 같은 과정을 거친다:

1. `read()` 시스템 콜 → 커널 모드 전환 (Context Switch 1)
2. DMA (Direct Memory Access) 가 디스크에서 Kernel Buffer (Page Cache) 로 데이터 복사 (Copy 1)
3. 커널이 Kernel Buffer 에서 User Buffer 로 데이터 복사 (Copy 2) → 유저 모드 복귀 (Context Switch 2)
4. `write()` 시스템 콜 → 커널 모드 전환 (Context Switch 3)
5. 커널이 User Buffer 에서 Socket Buffer 로 데이터 복사 (Copy 3)
6. DMA 가 Socket Buffer 에서 NIC Buffer 로 데이터 복사 (Copy 4) → 유저 모드 복귀 (Context Switch 4)

총 **4번의 데이터 복사, 4번의 Context Switch** 가 발생한다.

***Zero-Copy*** 는 `sendfile()` 시스템 콜 (Java 의 `FileChannel.transferTo()`) 을 사용하여 이 과정을 극적으로 최적화한다:

1. `sendfile()` 시스템 콜 → 커널 모드 전환 (Context Switch 1)
2. DMA 가 디스크에서 Kernel Buffer (Page Cache) 로 데이터 복사 (Copy 1) — 이미 Page Cache 에 있으면 생략
3. DMA 가 Kernel Buffer 에서 직접 NIC Buffer 로 데이터 복사 (Copy 2) → 유저 모드 복귀 (Context Switch 2)

총 **2번의 데이터 복사, 2번의 Context Switch** 로 줄어든다. 데이터가 유저 공간을 전혀 거치지 않으므로 CPU 사용률도 크게 감소한다. Linux 커널 2.4 이상에서 NIC 가 Scatter-Gather DMA 를 지원하면, Kernel Buffer 에서 NIC Buffer 로의 복사조차 descriptor 만 전달하는 방식으로 최적화되어 실질적으로 CPU 복사가 0번이 된다.

```
Traditional:
  Disk → [DMA] → Kernel Buffer → [CPU] → User Buffer → [CPU] → Socket Buffer → [DMA] → NIC
  (4 copies, 4 context switches)

Zero-Copy (sendfile):
  Disk → [DMA] → Kernel Buffer (Page Cache) → [DMA] → NIC
  (2 copies, 2 context switches, 0 CPU copies with scatter-gather)
```

Kafka Broker 의 Fetch 요청 처리 코드에서 `FileRecords.writeTo()` 메서드는 내부적으로 `FileChannel.transferTo()` 를 호출하여 Zero-Copy 전송을 수행한다. 이것이 Kafka 가 Consumer 에게 데이터를 전달할 때 극도로 낮은 레이턴시와 높은 처리량을 달성하는 핵심 메커니즘이다.

### Sequential I/O Advantage

Kafka 는 모든 데이터를 Append-Only Log 로 기록한다. 즉, 기존 데이터를 수정(Random Write)하지 않고 항상 파일의 끝에 추가(Sequential Write)만 한다. 이 설계가 유리한 이유를 저장 매체별로 분석한다.

**HDD (Hard Disk Drive)**:

HDD 에서 Sequential Read/Write 가 Random Read/Write 보다 100배 이상 빠른 이유는 **디스크 헤드의 기계적 움직임(Seek)** 때문이다. Random I/O 에서는 매 요청마다 디스크 헤드가 다른 트랙으로 이동해야 하며, 이 Seek Time 은 평균 5~10ms 이다. 디스크가 한 바퀴 회전하는 Rotational Latency 까지 포함하면 약 10~15ms 가 소요된다. 반면, Sequential I/O 에서는 헤드가 한 트랙에 위치한 채로 연속된 섹터를 읽으므로 Seek 이 발생하지 않는다. 결과적으로 HDD 의 Sequential Write 성능은 200~300 MB/s 에 달하지만, Random Write 성능은 1~2 MB/s 에 불과하다.

**SSD (Solid State Drive)**:

SSD 에는 기계적 Seek 이 없지만, Sequential Write 가 Random Write 보다 빠른 이유가 존재한다:

- **Write Amplification Factor (WAF) 최소화**: SSD 의 NAND Flash 는 Page 단위 (4~16KB) 로 쓰기를 수행하지만, 삭제는 Block 단위 (256KB~4MB) 로만 가능하다. Random Write 시 이미 사용 중인 Page 가 포함된 Block 을 삭제하기 위해, 유효한 Page 를 다른 Block 으로 복사한 후 Block 전체를 삭제해야 한다. 이 과정에서 실제 기록할 데이터보다 더 많은 물리적 쓰기가 발생하며, 이를 Write Amplification 이라 한다. Sequential Write 는 Block 을 순차적으로 채우므로 WAF 가 최소화된다.
- **GC (Garbage Collection) 효율**: SSD Controller 의 GC 는 유효 데이터가 적은 Block 을 찾아 정리한다. Sequential Write 패턴에서는 오래된 Block 이 통째로 무효화되므로 GC 가 효율적이다. Random Write 패턴에서는 모든 Block 에 유효/무효 Page 가 섞여 GC 오버헤드가 증가한다.
- **FTL (Flash Translation Layer) 매핑 효율**: Sequential Write 는 논리-물리 주소 매핑이 연속적이므로 FTL 의 매핑 테이블 크기가 작아진다.

**OS Read-ahead 최적화**:

Linux 커널은 `readahead` 메커니즘을 통해 Sequential Access 패턴을 감지하고, 아직 요청되지 않은 데이터를 미리 Page Cache 에 적재한다. 커널의 `ondemand readahead` 알고리즘은 다음과 같이 동작한다:

1. 처음 파일을 읽을 때 `ra_pages` (기본값 128KB, `/sys/block/{device}/queue/read_ahead_kb` 로 조정 가능) 만큼의 데이터를 추가로 읽는다.
2. Prefetch 된 데이터가 실제로 사용되면 Sequential Access 로 판단하고, Read-ahead Window 를 점진적으로 확대한다 (최대 `max_readahead_kb`).
3. Random Access 패턴이 감지되면 Read-ahead 를 비활성화한다.

Kafka 의 Consumer Fetch 는 항상 순차적으로 offset 을 증가시키며 데이터를 읽으므로, 커널의 Read-ahead 가 최대 효율로 동작한다. Consumer 가 요청하기 전에 데이터가 이미 Page Cache 에 적재되어 있을 확률이 높다.

### Log Compaction vs Log Retention

***Log Retention*** 은 시간 또는 크기 기반으로 오래된 Segment 를 삭제하는 정책이다.

- `log.retention.hours` (기본값 168시간 = 7일): Segment 의 마지막 수정 시간 (또는 Segment 내 최대 타임스탬프) 이 이 시간을 초과하면 삭제 대상이 된다.
- `log.retention.bytes` (기본값 -1, 무제한): Partition 의 전체 로그 크기가 이 값을 초과하면 가장 오래된 Segment 부터 삭제한다.
- `log.retention.ms` > `log.retention.minutes` > `log.retention.hours` 순으로 우선순위가 적용된다.
- `cleanup.policy=delete` (기본값) 로 설정한다.

***Log Compaction*** 은 같은 Key 를 가진 메시지 중 가장 최신 값만 유지하는 정책이다. `cleanup.policy=compact` 로 설정한다. 이 정책은 Key-Value 스토어의 스냅샷과 유사한 역할을 한다. 예를 들어, 사용자 프로필 업데이트 이벤트에서 각 사용자(Key)의 최신 프로필(Value)만 유지하고 싶을 때 사용한다.

**Compaction 의 내부 동작**:

1. **Cleaner Thread**: `log.cleaner.threads` (기본값 1) 개의 Cleaner Thread 가 백그라운드에서 Compaction 을 수행한다.
2. **Dirty Ratio 계산**: 각 Partition 의 dirty ratio 를 계산한다. Dirty ratio 는 `(아직 Compaction 되지 않은 Segment 의 바이트 수) / (전체 로그 바이트 수)` 이다. `min.cleanable.dirty.ratio` (기본값 0.5) 를 초과하면 Compaction 대상이 된다.
3. **Offset Map 구축**: Cleaner Thread 는 dirty segment 를 순회하며 각 Key 의 최신 offset 을 메모리 내 해시맵 (Offset Map) 에 기록한다. `log.cleaner.dedupe.buffer.size` (기본값 128MB) 가 이 맵의 크기를 결정한다.
4. **Clean Segment 생성**: clean segment 와 dirty segment 를 병합하면서, Offset Map 에 기록된 최신 offset 이 아닌 레코드는 폐기한다. 동일 Key 의 최신 레코드만 새로운 Segment 에 기록된다.
5. **Tombstone**: Value 가 `null` 인 레코드는 해당 Key 의 삭제를 의미한다. Tombstone 레코드는 `delete.retention.ms` (기본값 24시간) 동안 유지된 후 완전히 제거된다. 이 기간 동안 Consumer 가 Tombstone 을 읽고 자신의 상태에서 해당 Key 를 삭제할 수 있다.

`cleanup.policy=compact,delete` 로 두 정책을 동시에 적용할 수도 있다. 이 경우 Compaction 이 먼저 적용되고, Retention 기간이 지난 Segment 는 삭제된다.

---

## Producer Internals

### RecordAccumulator and Sender Thread

Kafka Producer 는 **2-Thread 아키텍처** 로 설계되어 있다. 사용자의 `send()` 호출을 처리하는 Main Thread 와, 실제 네트워크 I/O 를 수행하는 Sender Thread 가 분리되어 동작한다. 이 분리를 통해 사용자 코드의 메시지 생성 속도와 네트워크 전송 속도를 독립적으로 조절할 수 있다.

**Main Thread 의 동작 과정**:

1. `KafkaProducer.send(ProducerRecord)` 호출
2. **Interceptor**: `ProducerInterceptor.onSend()` 가 호출된다. 메시지 변환, 메트릭 수집 등에 사용된다.
3. **Serializer**: Key 와 Value 를 `byte[]` 로 직렬화한다. `key.serializer`, `value.serializer` 설정으로 지정한다.
4. **Partitioner**: 대상 Partition 을 결정한다. Key 가 있으면 `murmur2(key) % numPartitions`, 없으면 Sticky Partition 전략이 적용된다.
5. **RecordAccumulator**: 결정된 Topic-Partition 에 해당하는 `Deque<ProducerBatch>` 의 마지막 Batch 에 레코드를 추가한다. Batch 가 가득 찼거나 존재하지 않으면 새로운 ProducerBatch 를 생성한다. ProducerBatch 의 메모리는 `BufferPool` 에서 할당되며, `buffer.memory` (기본값 32MB) 로 전체 메모리 사용량이 제한된다. BufferPool 이 가득 차면 `max.block.ms` (기본값 60초) 동안 블로킹되며, 타임아웃 시 `TimeoutException` 이 발생한다.

***Sender Thread*** 의 동작 과정:

1. RecordAccumulator 에서 전송 준비된 Batch 를 drain 한다. 전송 준비 조건은 `batch.size` 도달 또는 `linger.ms` 경과이다.
2. drain 된 Batch 들을 대상 Broker(Leader) 별로 그룹화하여 `ProduceRequest` 를 생성한다. 하나의 Request 에 여러 Topic-Partition 의 Batch 가 포함될 수 있다.
3. `NetworkClient` 를 통해 Broker 에 Request 를 전송한다. `max.in.flight.requests.per.connection` (기본값 5) 설정에 따라, 응답을 기다리지 않고 동시에 여러 Request 를 전송할 수 있다.
4. Broker 로부터 응답을 수신하면 Callback 을 실행하고, 실패 시 재시도 (`retries`, 기본값 `Integer.MAX_VALUE`) 를 수행한다.

**`batch.size` 와 `linger.ms` 의 상호작용**:

- `batch.size` (기본값 16384바이트 = 16KB): Batch 의 최대 크기이다. Batch 에 누적된 데이터가 이 크기에 도달하면 즉시 전송된다.
- `linger.ms` (기본값 0): Batch 가 `batch.size` 에 도달하지 않아도, 첫 번째 레코드가 Batch 에 추가된 후 이 시간이 경과하면 전송된다.
- `linger.ms=0` 이면 Sender Thread 가 drain 시점에 사용 가능한 레코드만 즉시 전송한다. `linger.ms` 를 약간 늘리면 (예: 5~10ms) Batch 에 더 많은 레코드가 누적되어 네트워크 왕복 횟수가 줄어들고 처리량이 향상된다.

```
Main Thread                          Sender Thread
    ↓                                     ↓
Serialize → Partition              Drain batches from
    ↓                              RecordAccumulator
RecordAccumulator                        ↓
  [Topic-Partition → Batch]         Create Requests
  [Topic-Partition → Batch]              ↓
  [Topic-Partition → Batch]       Send to Broker (Leader)
                                         ↓
                                  Handle Response/Retry
```

### Partitioner Strategy

Partition 전략은 메시지의 분산 방식과 순서 보장 범위를 결정하는 핵심 요소이다.

***DefaultPartitioner*** (Kafka 2.4 이전): Key 가 존재하면 `Utils.toPositive(Utils.murmur2(key)) % numPartitions` 으로 Partition 을 결정한다. murmur2 는 비암호학적 해시 함수로, 균일한 분포와 빠른 연산 속도를 제공한다. 같은 Key 는 항상 같은 Partition 에 할당되므로, Key 단위의 순서 보장이 가능하다. Key 가 `null` 이면 round-robin 방식으로 Partition 을 선택한다 (Kafka 2.4 이전).

***RoundRobinPartitioner***: Key 의 유무에 관계없이 모든 Partition 에 순서대로 분배한다. 메시지를 가장 균등하게 분산시키지만, 같은 Key 의 메시지가 다른 Partition 에 할당될 수 있으므로 Key 기반 순서 보장이 불가능하다. 또한, 각 메시지가 서로 다른 Partition 의 Batch 에 할당되므로 Batch 효율이 낮아지는 문제가 있다.

***UniformStickyPartitioner*** (Kafka 2.4+): Key 가 `null` 인 메시지의 Batch 효율을 극대화하기 위해 도입된 전략이다. 기존 round-robin 방식은 매 메시지마다 다른 Partition 을 선택하여, 각 Batch 에 레코드가 하나씩만 들어가는 비효율이 발생했다. UniformStickyPartitioner 는 하나의 Batch 가 가득 찰 때까지 동일한 Partition 에 메시지를 "sticky" 하게 할당하고, Batch 가 전송되면 다른 Partition 으로 전환한다. 이를 통해 Batch 가 빠르게 채워지고, 네트워크 요청 수가 감소하며, 전체 처리량이 향상된다. Kafka 3.3 부터는 DefaultPartitioner 가 deprecated 되고 이 동작이 기본값이 되었다.

**Custom Partitioner**: `org.apache.kafka.clients.producer.Partitioner` 인터페이스를 구현하여 커스텀 파티셔닝 로직을 작성할 수 있다. 예를 들어, 특정 고객의 메시지를 전용 Partition 에 할당하거나, 지역(region) 기반으로 Partition 을 결정하는 로직을 구현할 수 있다.

```java
public class RegionPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                         Object value, byte[] valueBytes, Cluster cluster) {
        List<PartitionInfo> partitions = cluster.partitionsForTopic(topic);
        int numPartitions = partitions.size();
        if (key == null) {
            // Key 가 null 이면 round-robin 으로 분배
            // Kafka 3.3+ 에서는 Partitioner 인터페이스 대신 기본 파티셔너 사용 권장
            return Utils.toPositive(Utils.murmur2(
                String.valueOf(System.nanoTime()).getBytes())) % numPartitions;
        }
        String region = extractRegion((String) key);
        // 지역별로 고정된 Partition 할당
        return Utils.toPositive(Utils.murmur2(region.getBytes())) % numPartitions;
    }
}
```

### Compression

Kafka 는 Producer 에서 메시지 배치 단위로 압축을 수행하고, Broker 는 압축된 상태 그대로 디스크에 저장하며, Consumer 에서 해제하는 **End-to-End Compression** 아키텍처를 사용한다. 이로써 네트워크 대역폭과 디스크 공간을 동시에 절약한다.

***snappy***: Google 에서 개발한 압축 알고리즘이다. 압축률은 중간 수준이지만, 압축/해제 속도가 매우 빠르고 CPU 오버헤드가 낮다. CPU bound 환경에서 추천된다. 일반적인 JSON 데이터에 대해 약 1.5~2배의 압축률을 제공한다.

***lz4***: snappy 보다 더 빠른 압축/해제 속도를 제공하면서 유사한 압축률을 달성한다. 특히 해제 속도가 메모리 대역폭에 근접할 정도로 빠르다. 실시간 스트리밍 처리에서 레이턴시가 중요한 환경에 추천된다. Kafka 의 기본 벤치마크에서 가장 높은 처리량을 보이는 경우가 많다.

***zstd*** (Zstandard): Facebook 에서 개발한 압축 알고리즘이다. 기본 레벨에서 gzip 과 유사한 압축률을 제공하면서 압축/해제 속도가 훨씬 빠르다. 높은 레벨(17+)에서는 gzip 을 초과하는 압축률도 가능하다. 압축 레벨을 1~22 까지 조정할 수 있어, 처리량과 압축률 사이의 트레이드오프를 세밀하게 제어할 수 있다. 네트워크 대역폭이 병목인 크로스 데이터센터 복제나 대용량 로그 전송에 추천된다. Kafka 2.1 부터 지원한다.

***gzip***: zstd 의 높은 압축 레벨과 유사하거나 약간 더 높은 압축률을 달성할 수 있지만, 압축/해제 속도가 현저히 느리다. CPU 사용량이 높으므로 실시간 처리에는 부적합하다. 배치 처리나 장기 보관 로그 등 저장 공간 절약이 최우선인 환경에 추천된다.

**Compression 동작 방식**: Producer 의 `compression.type` 설정으로 압축 알고리즘을 지정한다. RecordAccumulator 의 ProducerBatch 에 레코드가 추가될 때, 내부적으로 `CompressorFactory` 를 통해 지정된 알고리즘의 `OutputStream` 래퍼가 적용된다. Batch 가 전송될 때 이미 압축된 상태이므로 Sender Thread 에서 추가 처리가 필요 없다. Broker 측에서 `compression.type=producer` (기본값) 이면 Producer 가 보낸 압축 포맷을 그대로 유지한다. Broker 에서 다른 압축 타입을 지정하면 재압축이 발생하여 Broker CPU 오버헤드가 증가한다.

### Idempotent Producer

네트워크 장애로 인해 Producer 가 Broker 의 응답을 받지 못하면, 같은 메시지를 재전송할 수 있다. Broker 입장에서는 이미 기록된 메시지가 다시 도착하므로 중복 기록이 발생한다. `enable.idempotence=true` 설정은 이 문제를 해결한다.

<mark><em><strong>Idempotent Producer 는 PID + Sequence Number 조합을 통해 Broker 측에서 메시지 중복을 감지하고, Exactly-Once Semantics 를 단일 Partition 범위에서 보장한다.</strong></em></mark>

**동작 원리**:

***PID (Producer ID)***: Producer 가 초기화될 때 (`InitProducerIdRequest`), Broker 의 Transaction Coordinator (또는 아무 Broker) 가 고유한 PID 를 할당한다. 이 PID 는 Producer 프로세스의 생명주기 동안 유지되며, Producer 재시작 시 새로운 PID 가 할당된다.

***Sequence Number***: 각 `<PID, Topic-Partition>` 쌍에 대해 0부터 시작하는 monotonically increasing 정수이다. Sequence Number 는 각 레코드마다 1씩 증가하며, RecordBatch 의 `baseSequence` 는 배치 내 첫 번째 레코드의 sequence number 이다. Broker 는 마지막으로 커밋된 배치의 `lastSequence` (= `baseSequence + recordCount - 1`) 를 추적한다.

**Broker 의 중복 감지 메커니즘**:

1. Broker 는 각 `<PID, Topic-Partition>` 쌍에 대해 마지막으로 커밋된 5개의 Batch 의 Sequence Number 를 메모리에 유지한다 (ProducerStateManager).
2. 새로운 Batch 가 도착하면, Batch 의 `baseSequence` 가 기대값 (마지막 커밋된 `lastSequence + 1`) 과 일치하는지 확인한다.
3. `baseSequence` 가 기대값과 일치하면 정상 기록한다.
4. `baseSequence` 가 기대값보다 작으면 (즉, 이미 기록된 Sequence) 중복으로 판단하고 `DuplicateSequenceException` 을 반환한다. 이때 메시지는 기록하지 않지만, Producer 에게는 성공 응답과 동일하게 처리된다.
5. `baseSequence` 가 기대값보다 크면 (즉, 중간에 빠진 Sequence 가 있으면) `OutOfOrderSequenceException` 을 반환한다.

**순서 보장**: `max.in.flight.requests.per.connection` 이 1보다 크면 (기본값 5), 동시에 여러 Batch 가 전송 중일 수 있다. 첫 번째 Batch 가 실패하고 두 번째 Batch 가 성공하면 순서가 뒤바뀔 수 있다. Idempotent Producer 는 `max.in.flight.requests.per.connection ≤ 5` 범위에서 Sequence Number 를 통해 순서를 보장한다. Broker 가 Sequence 순서가 맞지 않는 Batch 를 거부하고, Producer 가 올바른 순서로 재전송하기 때문이다.

```java
// Idempotent Producer 설정
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "broker1:9092,broker2:9092");
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // 핵심 설정
props.put(ProducerConfig.ACKS_CONFIG, "all"); // idempotence 시 자동으로 all
props.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE); // 자동 설정
props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5); // 최대 5
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
// send() 사용법은 동일 — 내부적으로 PID, Sequence Number 가 자동 할당됨
producer.send(new ProducerRecord<>("topic", "key", "value"));
```

### Transactional Producer

Idempotent Producer 가 단일 Partition 범위의 중복 방지를 제공한다면, Transactional Producer 는 **여러 Partition 에 걸친 원자적(Atomic) 쓰기** 를 보장한다. 예를 들어, Kafka Streams 에서 입력 Topic 의 메시지를 읽고, 처리 결과를 출력 Topic 에 쓰고, Consumer Offset 을 커밋하는 세 가지 작업을 하나의 트랜잭션으로 묶을 수 있다. 하나라도 실패하면 전부 롤백된다.

**`transaction.id`** 설정으로 Transaction 을 활성화한다. `transaction.id` 는 Producer 인스턴스를 고유하게 식별하는 문자열이며, Producer 재시작 시에도 동일한 값을 사용해야 한다. 이 값이 설정되면 `enable.idempotence` 가 자동으로 `true` 가 된다.

***Transaction Coordinator***: 트랜잭션의 상태를 관리하는 Broker 측 컴포넌트이다. `__transaction_state` 라는 Internal Topic 에 트랜잭션 상태를 기록한다. 이 Topic 의 Partition 수는 `transaction.state.log.num.partitions` (기본값 50) 이며, 각 `transaction.id` 는 `hash(transaction.id) % numPartitions` 에 의해 특정 Partition 에 매핑된다. 해당 Partition 의 Leader Broker 가 그 `transaction.id` 의 Coordinator 가 된다.

**2-Phase Commit 유사 프로토콜**:

트랜잭션의 전체 라이프사이클은 다음과 같다:

**Phase 1: 초기화**

1. `initTransactions()`: Producer 가 Transaction Coordinator 를 찾고 (`FindCoordinatorRequest`), PID 를 할당받는다 (`InitProducerIdRequest`). 이 과정에서 같은 `transaction.id` 를 가진 이전 Producer 의 미완료 트랜잭션이 있으면 abort 처리된다.

**Phase 2: 트랜잭션 실행**

2. `beginTransaction()`: 로컬 상태를 `IN_TRANSACTION` 으로 전환한다 (Coordinator 에게 별도 요청은 보내지 않는다).
3. `send()`: 메시지를 전송한다. 첫 번째 send 시 `AddPartitionsToTxnRequest` 를 Coordinator 에 보내 해당 Topic-Partition 을 트랜잭션에 등록한다. Coordinator 는 `__transaction_state` 에 이 정보를 기록한다.
4. `sendOffsetsToTransaction()`: Consumer Group 의 Offset 커밋을 트랜잭션에 포함시킨다. `AddOffsetsToTxnRequest` 로 Consumer Group 의 `__consumer_offsets` Partition 을 트랜잭션에 등록한다.

**Phase 3: 커밋/중단**

5. `commitTransaction()`: Coordinator 에 `EndTxnRequest(COMMIT)` 를 보낸다. Coordinator 는 다음 단계를 수행한다:
   - `__transaction_state` 에 `PREPARE_COMMIT` 상태를 기록한다.
   - 트랜잭션에 참여한 모든 Partition 의 Leader Broker 에 `WriteTxnMarkersRequest` 를 보내, 각 Partition 의 로그에 **COMMIT Marker** (`ControlBatch`) 를 기록한다.
   - 모든 Marker 가 기록되면 `__transaction_state` 에 `COMPLETE_COMMIT` 상태를 기록한다.
6. `abortTransaction()`: 위와 동일한 과정이지만, `PREPARE_ABORT` → `ABORT Marker` → `COMPLETE_ABORT` 로 진행된다.

**Consumer 측에서의 트랜잭션 읽기**: Consumer 의 `isolation.level` 설정에 따라 트랜잭션 메시지의 가시성이 결정된다.

- `read_uncommitted` (기본값): 트랜잭션 상태와 관계없이 모든 메시지를 읽는다.
- `read_committed`: COMMIT Marker 가 기록된 트랜잭션의 메시지만 읽는다. 진행 중인 트랜잭션의 메시지는 버퍼링되었다가, COMMIT 시 전달되고 ABORT 시 폐기된다. 이를 위해 Broker 는 **LSO (Last Stable Offset)** 를 추적한다. LSO 는 아직 완료되지 않은 가장 오래된 트랜잭션의 첫 번째 offset 이다. `read_committed` Consumer 는 LSO 이전의 메시지만 반환한다.

**Zombie Fencing**:

분산 환경에서 네트워크 파티션이나 GC Pause 로 인해 동일한 `transaction.id` 를 가진 두 개의 Producer 인스턴스가 동시에 존재할 수 있다. 이전 인스턴스 (Zombie) 가 트랜잭션을 계속 수행하면 데이터 정합성이 깨진다.

이를 방지하기 위해 Kafka 는 **epoch** 메커니즘을 사용한다:

1. `initTransactions()` 호출 시 Coordinator 는 해당 `transaction.id` 의 epoch 를 1 증가시킨다.
2. 새로운 epoch 는 PID 와 함께 `__transaction_state` 에 기록된다.
3. 이전 epoch 를 가진 Producer (Zombie) 가 `send()` 또는 `commitTransaction()` 을 시도하면, Broker 가 `ProducerFencedException` 을 반환하고 요청을 거부한다.
4. Zombie Producer 는 이 예외를 받으면 더 이상 메시지를 전송할 수 없으며, `close()` 만 호출할 수 있다.

```java
// Transactional Producer 사용 예시
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "broker1:9092");
props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "order-processing-tx-1"); // 핵심 설정
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
producer.initTransactions(); // PID 할당 + epoch 증가

try {
    producer.beginTransaction();

    // 여러 Topic-Partition 에 원자적으로 쓰기
    producer.send(new ProducerRecord<>("orders", "order-123", "created"));
    producer.send(new ProducerRecord<>("inventory", "item-456", "reserved"));
    producer.send(new ProducerRecord<>("notifications", "user-789", "order confirmed"));

    // Consumer Offset 도 트랜잭션에 포함
    producer.sendOffsetsToTransaction(
        Collections.singletonMap(
            new TopicPartition("input-topic", 0),
            new OffsetAndMetadata(currentOffset + 1)
        ),
        new ConsumerGroupMetadata("my-consumer-group")
    );

    producer.commitTransaction(); // 모두 성공하면 커밋
} catch (ProducerFencedException e) {
    // Zombie Fencing — 이 인스턴스는 더 이상 사용 불가
    producer.close();
} catch (KafkaException e) {
    producer.abortTransaction(); // 하나라도 실패하면 전체 롤백
}
```
## Consumer Internals

### Consumer Group and Group Coordinator

***Consumer Group*** 은 같은 `group.id` 를 공유하는 Consumer 들의 논리적 그룹이다. Kafka 는 하나의 파티션을 동일 Consumer Group 내에서 오직 하나의 Consumer 에게만 할당하여, 메시지의 순서 보장과 병렬 처리를 동시에 달성한다. 만약 Consumer 수가 파티션 수보다 많으면, 초과된 Consumer 는 유휴 상태가 되어 어떤 파티션도 할당받지 못한다.

각 Consumer Group 마다 하나의 ***Group Coordinator*** 가 할당된다. Group Coordinator 는 특정 Broker 에서 동작하는 컴포넌트로, 해당 Consumer Group 의 전체 생명주기를 관리한다.

Group Coordinator 가 결정되는 메커니즘은 다음과 같다:

```
1. hash(group.id) % __consumer_offsets_partition_count
   → 결과값이 __consumer_offsets 의 특정 파티션 번호가 됨

2. 해당 파티션의 Leader Replica 가 위치한 Broker 가 Group Coordinator 가 됨

예시:
  group.id = "order-service"
  __consumer_offsets partition 수 = 50 (기본값)
  hash("order-service") % 50 = 23
  → __consumer_offsets 파티션 23번의 Leader Broker = Broker 2
  → Broker 2 가 "order-service" Consumer Group 의 Coordinator
```

Group Coordinator 의 핵심 역할은 네 가지이다:

1. **Consumer 멤버십 관리**: Consumer 의 JoinGroup, LeaveGroup 요청을 처리하고, 현재 Group 에 속한 Consumer 목록을 유지한다.
2. **Rebalance 트리거**: Consumer 추가/제거/장애 발생 시 Rebalance 프로토콜을 시작한다.
3. **Offset Commit 처리**: Consumer 가 전송하는 OffsetCommit 요청을 받아 `__consumer_offsets` 토픽에 기록한다.
4. **Heartbeat 모니터링**: Consumer 로부터 주기적으로 수신되는 heartbeat 를 감시하여 Consumer 의 생존 여부를 판단한다.

Group Coordinator 자체가 장애를 일으키면, `__consumer_offsets` 해당 파티션의 Leader 가 다른 Broker 로 이동하면서 새로운 Coordinator 가 선출된다. 이 과정에서 Consumer Group 전체에 Rebalance 가 발생한다.

### Partition Assignment Strategy

파티션 할당 전략은 Consumer Group 내에서 어떤 Consumer 가 어떤 파티션을 담당할지 결정하는 알고리즘이다. `partition.assignment.strategy` 설정으로 지정하며, 실제 할당 계산은 Group Leader Consumer 에서 수행된다.

#### RangeAssignor (기본값)

***RangeAssignor*** 는 Kafka 의 전통적인 기본 파티션 할당 전략이다. (Kafka 3.1+ 에서는 기본값이 `[RangeAssignor, CooperativeStickyAssignor]` 로 변경되었다) **토픽 단위**로 파티션을 분배한다.

알고리즘 동작 방식:

1. 각 토픽에 대해 파티션을 번호 순으로 정렬한다.
2. Consumer 를 사전순(lexicographic)으로 정렬한다.
3. 각 토픽에서 `파티션 수 / Consumer 수` 만큼 균등 분배하고, 나머지를 앞쪽 Consumer 에게 추가 할당한다.

```
예시: Topic A (6 partitions), Topic B (6 partitions), 3 Consumers

Topic A 할당:
  파티션 정렬: [A-0, A-1, A-2, A-3, A-4, A-5]
  6 / 3 = 2 (나머지 0)
  Consumer-0 → [A-0, A-1]
  Consumer-1 → [A-2, A-3]
  Consumer-2 → [A-4, A-5]

Topic B 할당:
  파티션 정렬: [B-0, B-1, B-2, B-3, B-4, B-5]
  6 / 3 = 2 (나머지 0)
  Consumer-0 → [B-0, B-1]
  Consumer-1 → [B-2, B-3]
  Consumer-2 → [B-4, B-5]

결과 (균등):
  Consumer-0: A-0, A-1, B-0, B-1  (4개)
  Consumer-1: A-2, A-3, B-2, B-3  (4개)
  Consumer-2: A-4, A-5, B-4, B-5  (4개)
```

문제점은 나머지가 발생할 때 드러난다:

```
예시: Topic A (3 partitions), Topic B (3 partitions), 2 Consumers

Topic A 할당:
  3 / 2 = 1 (나머지 1) → Consumer-0 에 1개 추가
  Consumer-0 → [A-0, A-1]
  Consumer-1 → [A-2]

Topic B 할당:
  3 / 2 = 1 (나머지 1) → Consumer-0 에 1개 추가
  Consumer-0 → [B-0, B-1]
  Consumer-1 → [B-2]

결과 (편중):
  Consumer-0: A-0, A-1, B-0, B-1  (4개) ← 과부하
  Consumer-1: A-2, B-2             (2개)
```

토픽 수가 증가할수록 편중이 심해진다. 10개 토픽에서 나머지가 발생하면 Consumer-0 이 10개의 추가 파티션을 담당하게 된다.

#### RoundRobinAssignor

***RoundRobinAssignor*** 는 모든 토픽의 파티션을 하나의 리스트로 합친 후, 순환(round-robin) 방식으로 분배한다.

알고리즘 동작 방식:

1. 모든 토픽의 모든 파티션을 하나의 리스트로 합친다.
2. 파티션을 `(토픽명, 파티션번호)` 기준으로 정렬한다.
3. 정렬된 파티션을 Consumer 순서대로 하나씩 돌아가며 할당한다.

```
예시: Topic A (3 partitions), Topic B (3 partitions), 2 Consumers

전체 파티션 리스트 (정렬): [A-0, A-1, A-2, B-0, B-1, B-2]

Round-Robin 분배:
  A-0 → Consumer-0
  A-1 → Consumer-1
  A-2 → Consumer-0
  B-0 → Consumer-1
  B-1 → Consumer-0
  B-2 → Consumer-1

결과 (균등):
  Consumer-0: A-0, A-2, B-1  (3개)
  Consumer-1: A-1, B-0, B-2  (3개)
```

RangeAssignor 에서 발생한 편중 문제를 해결한다. 그러나 **모든 Consumer 가 동일한 토픽 세트를 구독해야만** 균등 분배가 보장된다.

```
문제 시나리오: Consumer-0 이 Topic A, B 구독, Consumer-1 이 Topic A 만 구독

전체 파티션 리스트: [A-0, A-1, A-2, B-0, B-1, B-2]

분배:
  A-0 → Consumer-0
  A-1 → Consumer-1
  A-2 → Consumer-0
  B-0 → Consumer-0  (Consumer-1 은 B 미구독이므로 skip)
  B-1 → Consumer-0
  B-2 → Consumer-0

결과 (심한 편중):
  Consumer-0: A-0, A-2, B-0, B-1, B-2  (5개)
  Consumer-1: A-1                        (1개)
```

구독 토픽이 다른 Consumer 들이 혼재할 때 오히려 RangeAssignor 보다 불균등해질 수 있다.

#### StickyAssignor

***StickyAssignor*** 는 두 가지 목표를 동시에 추구한다:

1. **균등 분배**: 파티션을 가능한 한 균등하게 분배한다.
2. **최소 이동**: Rebalance 시 기존 할당을 최대한 유지하고, 필요한 최소한의 파티션만 이동시킨다.

기존 RoundRobinAssignor 와의 차이점:

```
초기 상태: Topic A (3 partitions), 3 Consumers
  Consumer-0: A-0
  Consumer-1: A-1
  Consumer-2: A-2

Consumer-2 가 떠남 → Rebalance

RoundRobinAssignor 결과:
  Consumer-0: A-0, A-2  (A-0 유지, A-2 신규)
  Consumer-1: A-1       (A-1 유지)
  → 1번 이동 (A-2 만 재할당)

그러나 복잡한 시나리오에서:

초기 상태: 6 Topics (각 1 partition), 3 Consumers
  Consumer-0: T0-0, T3-0
  Consumer-1: T1-0, T4-0
  Consumer-2: T2-0, T5-0

Consumer-0 이 떠남 → Rebalance

RoundRobinAssignor 결과 (전체 재배치):
  Consumer-1: T0-0, T2-0, T4-0
  Consumer-2: T1-0, T3-0, T5-0
  → Consumer-1 에서 T1-0 제거 + T0-0, T2-0 추가
  → Consumer-2 에서 T2-0 제거 + T1-0, T3-0 추가
  → 총 4번 이동

StickyAssignor 결과 (최소 이동):
  Consumer-1: T1-0, T4-0, T0-0
  Consumer-2: T2-0, T5-0, T3-0
  → Consumer-0 의 T0-0, T3-0 만 각각 재할당
  → 총 2번 이동 (기존 할당 100% 유지)
```

StickyAssignor 는 내부적으로 이전 할당 정보를 Consumer 의 `subscription.userData` 에 인코딩하여 전달한다. Group Leader 가 이 정보를 기반으로 기존 할당을 최대한 유지하면서 새로운 할당을 계산한다. 파티션 이동이 적다는 것은 Consumer 의 로컬 캐시, 상태 저장소, TCP 연결 등을 재활용할 수 있어 Rebalance 이후 warm-up 시간이 단축된다는 의미이다.

#### CooperativeStickyAssignor

***CooperativeStickyAssignor*** 는 StickyAssignor 의 최소 이동 특성에 ***Incremental Rebalancing*** 을 결합한 전략이다.

핵심 차이점은 Rebalance 프로토콜 자체에 있다:

- **Eager (기존)**: Rebalance 시 모든 Consumer 가 모든 파티션을 즉시 반환한 후 재할당을 받는다.
- **Cooperative**: Rebalance 시 이동이 필요한 파티션만 선택적으로 반환하고, 나머지 파티션은 계속 처리한다.

```
Eager Rebalancing (StickyAssignor):
  시간 ──────────────────────────────────────→
  Consumer-0: [P0,P1,P2] ──→ [    정지    ] ──→ [P0,P1]
  Consumer-1: [P3,P4,P5] ──→ [    정지    ] ──→ [P3,P4]
  Consumer-2:        (신규) ──→ [    정지    ] ──→ [P2,P5]
                              ↑ 전체 정지 구간 ↑

Cooperative Rebalancing (CooperativeStickyAssignor):
  시간 ──────────────────────────────────────→
  Consumer-0: [P0,P1,P2] ──→ [P0,P1    ] ──→ [P0,P1]
  Consumer-1: [P3,P4,P5] ──→ [P3,P4    ] ──→ [P3,P4]
  Consumer-2:        (신규) ──→ [          ] ──→ [P2,P5]
                              ↑ P2,P5만 정지 ↑
```

CooperativeStickyAssignor 를 사용하려면 `partition.assignment.strategy` 에 `org.apache.kafka.clients.consumer.CooperativeStickyAssignor` 를 지정한다. Rolling Deploy 시 Eager 에서 Cooperative 로 전환하려면, 먼저 두 전략을 모두 설정에 포함시킨 후 배포하고, 이후 Cooperative 만 남기는 2단계 배포가 필요하다.

### Offset Management

Kafka 에서 Offset 은 파티션 내 메시지의 순서를 나타내는 단조 증가 정수값이다. Consumer 의 진행 상태를 추적하는 데 핵심적인 역할을 한다.

***__consumer_offsets*** 는 Offset 정보를 저장하기 위한 Internal Topic 이다. 기본적으로 50개의 파티션과 replication factor 3 으로 생성된다. 각 Consumer Group 의 offset commit 은 `hash(group.id) % 50` 으로 결정된 파티션에 기록된다. 이 토픽의 메시지 형식은 key 가 `(group.id, topic, partition)` 이고 value 가 `(offset, metadata, timestamp)` 인 compacted log 이다.

네 가지 주요 Offset 개념이 있다:

***Current Offset (Consumed Offset)*** 은 Consumer 가 `poll()` 을 통해 마지막으로 읽은 메시지의 다음 위치이다. Consumer 프로세스의 메모리에만 존재하며, Consumer 가 죽으면 이 정보는 사라진다.

***Committed Offset*** 은 Broker 의 `__consumer_offsets` 토픽에 영구적으로 기록된 Offset 이다. Consumer 가 재시작되면 이 위치부터 메시지를 다시 읽기 시작한다. Auto Commit 또는 Manual Commit 을 통해 기록된다.

***Log End Offset (LEO)*** 은 파티션의 Leader Replica 에 마지막으로 기록(append)된 메시지의 다음 Offset 이다. Producer 가 메시지를 전송할 때마다 LEO 가 증가한다. 각 Replica 마다 자신의 LEO 를 가지고 있으며, Follower 의 LEO 는 Leader 로부터 Fetch 하면서 점진적으로 따라간다.

***High Watermark (HW)*** 은 모든 ISR(In-Sync Replicas) 이 복제를 완료한 가장 높은 Offset 이다. Consumer 는 HW 이하의 메시지만 읽을 수 있다. 아직 모든 ISR 에 복제되지 않은 메시지를 Consumer 에게 노출하면, Leader 장애 시 해당 메시지가 유실될 수 있으므로 HW 를 통해 이를 방지한다.

```
Partition Log:
|msg0|msg1|msg2|msg3|msg4|msg5|msg6|msg7|msg8|msg9|
                 ↑                   ↑         ↑
          Committed Offset     High Watermark  LEO
          (Consumer restart     (Consumer can   (Latest
           starts here)         read up to)     written)
```

이 다이어그램에서 중요한 관계를 정리하면:

- `Committed Offset <= Current Offset <= HW <= LEO`
- `Current Offset - Committed Offset` = 아직 commit 되지 않은 처리 완료 메시지 (Rebalance 시 중복 소비 위험 구간)
- `LEO - Committed Offset` = Consumer Lag (표준 정의, `kafka-consumer-groups.sh` 에서 사용)
- `HW - Current Offset` = Consumer 가 아직 fetch 하지 않은 readable 메시지
- `LEO - HW` = ISR 복제가 진행 중인 메시지 (Consumer 에게 아직 보이지 않음)

Auto Commit 모드(`enable.auto.commit=true`)에서는 `auto.commit.interval.ms` (기본 5000ms) 간격으로 `poll()` 호출 시 자동 commit 된다. 정확히는 `poll()` 내부에서 이전 poll 에서 반환한 offset 을 비동기적으로 commit 한다. 이 방식의 위험은 `poll()` 로 가져온 메시지를 아직 처리하지 않았는데 다음 `poll()` 에서 auto commit 이 발생하여, 처리 실패 시 메시지가 유실될 수 있다는 점이다.

Manual Commit 모드(`enable.auto.commit=false`)에서는 `commitSync()` 또는 `commitAsync()` 를 명시적으로 호출해야 한다:

```java
// Synchronous Commit - 성공까지 블로킹, 실패 시 예외 발생
consumer.commitSync();

// Asynchronous Commit - 논블로킹, 콜백으로 결과 확인
consumer.commitAsync((offsets, exception) -> {
    if (exception != null) {
        log.error("Commit failed for offsets: {}", offsets, exception);
    }
});

// 특정 파티션의 특정 Offset 까지만 Commit
Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
offsets.put(
    new TopicPartition("orders", 0),
    new OffsetAndMetadata(currentOffset + 1)  // 다음에 읽을 offset
);
consumer.commitSync(offsets);
```

`commitSync()` 는 commit 이 성공할 때까지 재시도하므로 안전하지만 처리량이 저하된다. `commitAsync()` 는 재시도하지 않으므로 빠르지만 commit 실패 시 중복 소비가 발생할 수 있다. 실무에서는 일반적으로 `commitAsync()` 를 사용하다가 Consumer shutdown 시점에 `commitSync()` 를 호출하는 패턴을 적용한다.

### poll() Loop Internals

`Consumer.poll(Duration timeout)` 은 단순히 메시지를 가져오는 것이 아니라 Consumer 의 전체 라이프사이클을 관리하는 핵심 메서드이다.

`poll()` 내부 동작 흐름:

```
poll(Duration timeout)
│
├─ 1. Coordinator 확인 및 Group Join
│   ├─ Coordinator 가 알려져 있는지 확인
│   ├─ 없으면 FindCoordinator 요청
│   ├─ Group 에 Join 되어 있지 않으면 JoinGroup 수행
│   └─ Rebalance 가 필요하면 Rejoin 수행
│
├─ 2. Auto-Commit (enable.auto.commit=true 일 때)
│   ├─ 마지막 commit 이후 auto.commit.interval.ms 경과 확인
│   └─ 경과했으면 이전 poll() 에서 반환한 offset 을 비동기 commit
│
├─ 3. Fetch 데이터 반환 (이미 가져온 데이터가 있으면)
│   ├─ Fetcher 의 내부 버퍼에 데이터가 있는지 확인
│   ├─ 있으면 max.poll.records 만큼 잘라서 즉시 반환
│   └─ 여기서 반환되면 네트워크 I/O 없이 빠르게 완료
│
├─ 4. Fetcher 를 통해 Broker 에 Fetch 요청
│   ├─ 할당된 파티션의 Leader Broker 에 Fetch 요청 전송
│   ├─ fetch.min.bytes 이상의 데이터가 쌓일 때까지 대기
│   ├─ fetch.max.wait.ms 초과 시 있는 데이터만 반환
│   ├─ 응답을 내부 버퍼에 저장
│   └─ max.poll.records 만큼 잘라서 반환
│
└─ timeout 까지 데이터가 없으면 빈 레코드 반환
```

Fetch 요청의 주요 설정:

- `fetch.min.bytes` (기본 1): Broker 가 응답하기 위한 최소 데이터 크기. 값을 높이면 요청 횟수가 줄어들지만 지연이 증가한다.
- `fetch.max.wait.ms` (기본 500ms): `fetch.min.bytes` 를 충족하지 못할 때 Broker 가 대기하는 최대 시간이다.
- `max.partition.fetch.bytes` (기본 1MB): 파티션당 가져올 최대 데이터 크기이다.
- `max.poll.records` (기본 500): `poll()` 한 번에 반환할 최대 레코드 수이다.
- `fetch.max.bytes` (기본 50MB): Fetch 요청 전체의 최대 데이터 크기이다.

***Heartbeat Thread*** 는 Consumer 의 poll() 루프와 독립적으로 동작하는 별도 스레드이다. Kafka 0.10.1 이전에는 `poll()` 내부에서 heartbeat 를 전송했기 때문에, `poll()` 호출 간격이 길어지면 Consumer 가 죽은 것으로 오판되는 문제가 있었다. 현재는 별도 스레드에서 동작하므로 poll() 이 오래 걸려도 heartbeat 는 계속 전송된다.

Heartbeat Thread 관련 설정:

- `heartbeat.interval.ms` (기본 3000ms): heartbeat 전송 주기이다. 일반적으로 `session.timeout.ms` 의 1/3 이하로 설정한다.
- `session.timeout.ms` (기본 45000ms, Kafka 3.0+): 이 시간 동안 heartbeat 가 없으면 Group Coordinator 가 해당 Consumer 를 Group 에서 제거하고 Rebalance 를 트리거한다.

```
시간 흐름 →

Heartbeat Thread:  ♥───♥───♥───♥───♥───♥───♥───♥───♥
                   3s  3s  3s  3s  3s  3s  3s  3s

poll() Thread:     [poll]──[처리 10s]──[poll]──[처리 5s]──[poll]
                   ↑                    ↑                  ↑

두 스레드가 독립적으로 동작하므로:
- poll() 처리가 10초 걸려도 heartbeat 는 3초마다 전송
- session.timeout.ms (45s) 내에 heartbeat 가 계속 도착하므로 Consumer 생존 판정
```

***max.poll.interval.ms*** (기본 300000ms = 5분) 는 `poll()` 호출 간격의 상한이다. 이 시간을 초과하면 Consumer 가 Group 에서 강제 제거된다. Heartbeat Thread 가 정상적으로 동작하더라도 `poll()` 간격이 `max.poll.interval.ms` 를 초과하면 Consumer 는 제거된다. 이는 "살아 있지만 일을 하지 않는" Consumer 를 탐지하기 위한 메커니즘이다.

```
max.poll.interval.ms 초과 시나리오:

poll() ──→ [매우 무거운 처리 6분] ──→ poll()
  t=0                                t=360s

- heartbeat 는 정상 전송 중 (session.timeout.ms 이내)
- 그러나 t=300s 시점에 max.poll.interval.ms (5분) 초과
- Consumer 가 Coordinator 에게 LeaveGroup 전송
- Rebalance 트리거

대응 방안:
1. max.poll.records 를 줄여서 처리 시간 단축
2. 처리 로직을 별도 스레드 풀에 위임하고 poll() 은 빠르게 반환
3. max.poll.interval.ms 를 처리 시간에 맞게 증가 (권장하지 않음)
```

## Rebalancing Deep Dive

<mark><em><strong>Rebalancing 은 Consumer Group 의 파티션 소유권을 재분배하는 과정이며, 이 과정에서 일시적으로 모든 Consumer 가 메시지 처리를 중단하므로 대규모 시스템에서는 성능에 치명적인 영향을 줄 수 있다.</strong></em></mark>

Rebalancing 은 Consumer Group 의 파티션-Consumer 매핑을 재계산하고 적용하는 프로토콜이다. 이 과정은 Group Coordinator 가 주도하며, 모든 Consumer 가 참여해야 완료된다. Rebalance 중에는 Consumer 가 메시지를 가져갈 수 없으므로, Rebalance 빈도와 소요 시간을 최소화하는 것이 Kafka 운영의 핵심 과제이다.

### When Does Rebalancing Occur?

Rebalancing 이 트리거되는 시나리오는 다음 일곱 가지이다.

**1. Consumer 추가**

새로운 Consumer 가 Consumer Group 에 Join 하면 Rebalance 가 발생한다. 새 Consumer 가 `poll()` 을 최초 호출하면 Group Coordinator 에게 JoinGroup 요청을 보내고, Coordinator 는 기존 Consumer 들에게 Rebalance 를 알린다. 스케일 아웃 시 발생하며, 예측 가능한 시점에서 발생하므로 상대적으로 관리가 용이하다.

**2. Consumer 정상 제거**

Consumer 가 `close()` 를 명시적으로 호출하면 Group Coordinator 에게 LeaveGroup 요청을 전송한다. Coordinator 는 즉시 해당 Consumer 를 Group 에서 제거하고 나머지 Consumer 들에게 Rebalance 를 트리거한다. `close()` 를 호출하면 `session.timeout.ms` 를 기다리지 않고 즉시 Rebalance 가 시작되므로, 정상 종료 시에는 반드시 `close()` 를 호출해야 한다.

**3. Consumer Crash**

Consumer 프로세스가 비정상 종료되어 heartbeat 를 보내지 못하면, `session.timeout.ms` 경과 후 Group Coordinator 가 해당 Consumer 를 죽은 것으로 판단하고 Group 에서 제거한다. 이 경우 Rebalance 까지 `session.timeout.ms` 만큼의 지연이 발생하며, 그 동안 해당 Consumer 에 할당되었던 파티션의 메시지는 처리되지 않는다.

```
시간 흐름:
Consumer Crash    session.timeout.ms (45s)     Rebalance 시작
     ↓           ←────────────────────→        ↓
     X................................................[Rebalance]

이 45초 동안 해당 Consumer 의 파티션은 "orphaned" 상태
→ 메시지 처리 중단, Consumer Lag 증가
```

**4. Slow Consumer**

Consumer 가 `max.poll.interval.ms` 내에 다음 `poll()` 을 호출하지 못하면, Consumer 내부의 Heartbeat Thread 가 LeaveGroup 요청을 전송하고 Rebalance 가 트리거된다. 주요 원인은 다음과 같다:

- 메시지 처리 로직이 과도하게 무거운 경우 (외부 API 호출, 복잡한 변환)
- GC(Garbage Collection) pause 가 긴 경우 (Full GC)
- DB 쿼리 타임아웃이나 네트워크 지연
- 데드락이나 무한 루프

이 시나리오가 가장 위험한 이유는 Rebalance 후 해당 Consumer 가 다시 `poll()` 을 호출하면 또 다시 JoinGroup 이 발생하여 **Rebalance Storm** 이 일어날 수 있기 때문이다.

**5. Partition 수 변경**

Topic 에 Partition 을 추가하면(`kafka-topics.sh --alter --partitions`) 새로운 파티션을 Consumer 에게 할당하기 위해 Rebalance 가 발생한다. 파티션 삭제는 Kafka 에서 지원하지 않으므로 삭제로 인한 Rebalance 는 발생하지 않는다.

**6. Subscription 변경**

Consumer 가 정규식 패턴으로 토픽을 구독하는 경우(`subscribe(Pattern.compile("order-.*"))`), 패턴에 매칭되는 새로운 토픽이 생성되면 Consumer 의 구독 목록이 변경되어 Rebalance 가 발생한다. Metadata Refresh 주기(`metadata.max.age.ms`, 기본 5분)에 따라 새 토픽 감지까지 지연이 있을 수 있다.

**7. Rolling Deployment**

애플리케이션 배포 시 가장 빈번하게 Rebalance 가 발생하는 시나리오이다:

```
Rolling Deploy 시 Rebalance 흐름:

인스턴스 3개 (C0, C1, C2) 에서 순차 배포:

단계 1: C0 종료 → Rebalance #1 (C1, C2 로 재분배)
단계 2: C0' 시작 → Rebalance #2 (C0', C1, C2 로 재분배)
단계 3: C1 종료 → Rebalance #3 (C0', C2 로 재분배)
단계 4: C1' 시작 → Rebalance #4 (C0', C1', C2 로 재분배)
단계 5: C2 종료 → Rebalance #5 (C0', C1' 로 재분배)
단계 6: C2' 시작 → Rebalance #6 (C0', C1', C2' 로 재분배)

총 6번의 Rebalance 발생!
```

인스턴스 수가 N 이면 최대 2N 번의 Rebalance 가 발생한다. `group.initial.rebalance.delay.ms` (기본값 3초) 를 배포 간격에 맞게 늘리면 (예: 10~30초) 초기 Rebalance 횟수를 줄일 수 있다. 각 Rebalance 마다 수 초에서 수십 초의 처리 중단이 발생하므로, 대규모 Consumer Group 에서는 배포 시간 동안 심각한 처리 지연이 생길 수 있다.

### Rebalance Protocol Flow

Rebalance 프로토콜은 JoinGroup 과 SyncGroup 의 두 단계로 구성된다. Rebalance 완료 후에는 Heartbeat 기반의 정상 동작(Steady State) 상태로 진입한다.

```
Consumer A (기존)          Group Coordinator          Consumer B (신규)
     |                           |                         |
     |  ← Rebalance Trigger →   |   ← JoinGroup Request  |
     |                           |                         |
     |  JoinGroup Request →      |                         |
     |                           |                         |
     |  ← JoinGroup Response     |  ← JoinGroup Response  |
     |    (Leader 선출)           |    (Follower)           |
     |                           |                         |
     | SyncGroup Request →       |                         |
     | (파티션 할당 계획 포함)      |  ← SyncGroup Request   |
     |                           |    (빈 요청)             |
     |  ← SyncGroup Response     |  ← SyncGroup Response  |
     |    (할당 결과)              |    (할당 결과)           |
     |                           |                         |
     |  Heartbeat ←→             |   Heartbeat ←→         |
```

**Phase 1: JoinGroup**

Rebalance 가 트리거되면 Group 의 모든 Consumer 가 Coordinator 에게 JoinGroup 요청을 보낸다. Coordinator 는 `rebalance.timeout.ms` (기본값은 `max.poll.interval.ms` 와 동일) 동안 모든 Consumer 의 JoinGroup 요청을 기다린다. 이 시간 내에 JoinGroup 을 보내지 않은 Consumer 는 Group 에서 제거된다.

JoinGroup Request 에는 다음 정보가 포함된다:
- `group.id`: Consumer Group 식별자
- `member.id`: Consumer 의 고유 ID (최초 join 시 빈 문자열, Coordinator 가 할당)
- `protocol_type`: "consumer"
- `protocols`: 지원하는 파티션 할당 전략 목록과 구독 토픽 정보

Coordinator 는 모든 JoinGroup 요청을 수집한 후 ***Group Leader*** 를 선출한다. 일반적으로 가장 먼저 JoinGroup 을 보낸 Consumer 또는 기존 Leader 가 선출된다.

JoinGroup Response 는 Leader 와 Follower 에게 다르게 전송된다:
- **Leader 에게**: 전체 Consumer 멤버 목록과 각 Consumer 의 구독 정보가 포함된다.
- **Follower 에게**: 자신의 member.id 와 generation.id 만 포함된다.

**Phase 2: SyncGroup**

Group Leader 는 JoinGroup Response 에서 받은 멤버 정보를 기반으로 파티션 할당 계획을 수립한다. 이 계산은 설정된 `partition.assignment.strategy` 에 따라 수행된다.

모든 Consumer 가 SyncGroup 요청을 Coordinator 에게 보낸다:
- **Leader 의 SyncGroup**: 파티션 할당 계획 (어떤 Consumer 가 어떤 파티션을 담당하는지) 포함
- **Follower 의 SyncGroup**: 빈 요청 (할당 계획 없음)

Coordinator 는 Leader 가 보낸 할당 계획을 모든 Consumer 에게 SyncGroup Response 로 전달한다. 각 Consumer 는 자신에게 할당된 파티션 목록을 받아 해당 파티션에서 메시지를 consume 하기 시작한다.

**Phase 3: Steady State (Heartbeat)**

Rebalance 가 완료된 후 Consumer 는 정상 동작 상태에 진입한다. Heartbeat Thread 가 `heartbeat.interval.ms` 간격으로 Coordinator 에게 heartbeat 를 전송한다. Coordinator 는 heartbeat 응답에 Rebalance 가 필요한지 여부를 플래그로 포함시킨다. Consumer 는 이 플래그를 확인하여 다음 `poll()` 에서 Rejoin 을 수행한다.

```
generation.id 의 역할:

Rebalance #1 완료: generation.id = 1
  Consumer A: [P0, P1], Consumer B: [P2, P3]

Rebalance #2 완료: generation.id = 2
  Consumer A: [P0], Consumer B: [P1, P2], Consumer C: [P3]

지연된 Commit 방지:
  Consumer A 가 generation 1 시절의 P1 offset 을 commit 시도
  → Coordinator 가 generation 불일치 감지
  → CommitFailedException 발생
  → 이미 P1 은 Consumer B 에게 할당되었으므로 잘못된 commit 방지
```

### Eager Rebalancing (Stop-the-World)

Eager Rebalancing 은 Kafka 의 전통적인 Rebalance 프로토콜이다. Rebalance 가 트리거되면 모든 Consumer 가 현재 할당된 파티션을 즉시 포기(revoke)하고, 새로운 할당을 받을 때까지 메시지 처리를 완전히 중단한다.

```
Eager Rebalance 타임라인:

t=0s   : Rebalance 트리거 (예: 새 Consumer 추가)
t=0s   : 모든 Consumer 가 파티션 revoke → 처리 중단
t=0~3s : Consumer 들이 JoinGroup 요청 전송
t=3s   : Coordinator 가 모든 JoinGroup 수집 완료
t=3~4s : Leader 가 할당 계산, SyncGroup 완료
t=4s   : 모든 Consumer 가 새 파티션 할당받고 처리 재개

→ 약 4초간 전체 Consumer Group 이 메시지 처리 중단
```

**Eager Rebalancing 의 문제점:**

1. **전체 처리 중단**: Rebalance 기간 동안 Consumer Group 전체가 메시지를 처리하지 못한다. Consumer 수가 적을 때는 수 초이지만, 수십~수백 개의 Consumer 가 있으면 수십 초까지 길어질 수 있다.

2. **불필요한 파티션 이동**: 모든 파티션을 일단 revoke 하고 재할당하므로, 실제로 이동이 필요하지 않은 파티션까지 revoke 된다. Consumer A 에 P0 이 할당되어 있고 Rebalance 후에도 P0 이 A 에 할당되지만, 그 사이 일시적으로 P0 이 누구에게도 할당되지 않은 상태가 된다.

3. **상태 재구축 비용**: Kafka Streams 같은 stateful 처리에서 파티션이 이동하면 로컬 상태 저장소를 재구축해야 한다. 불필요한 이동이 발생하면 수 GB 의 상태를 다시 복원해야 할 수도 있다.

4. **Rolling Deploy 의 증폭 효과**: N 개 인스턴스의 Rolling Deploy 에서 최대 2N 번의 Stop-the-World Rebalance 가 발생하여, 배포 시간 동안 지속적인 처리 중단이 반복된다.

### Cooperative (Incremental) Rebalancing

Kafka 2.4 에서 도입된 Cooperative Rebalancing 은 Eager 방식의 Stop-the-World 문제를 해결하기 위한 ***Incremental Cooperative Protocol*** 이다.

핵심 아이디어는 "이동이 필요한 파티션만 선택적으로 revoke 하고, 나머지 파티션은 계속 처리한다" 는 것이다. 이를 위해 Rebalance 를 2번에 나누어 수행한다.

```
Cooperative Rebalance 흐름 (Consumer C 추가 시):

초기 상태:
  Consumer A: [P0, P1, P2]
  Consumer B: [P3, P4, P5]

[1차 Rebalance]
  1. 모든 Consumer 가 JoinGroup 요청 (현재 할당 정보 포함)
  2. Leader 가 새로운 할당 계산:
     A: [P0, P1], B: [P3, P4], C: [P2, P5]
  3. 기존 할당과 비교하여 revoke 대상 결정:
     A 에서 P2 revoke, B 에서 P5 revoke
  4. SyncGroup Response 로 "P2, P5 를 revoke 하라" 전달
  5. A 와 B 는 P2, P5 만 revoke (나머지는 계속 처리!)

[2차 Rebalance]
  1. P2, P5 가 반환되었으므로 다시 JoinGroup
  2. Leader 가 반환된 P2, P5 를 C 에게 할당
  3. SyncGroup Response 로 최종 할당 전달

최종 상태:
  Consumer A: [P0, P1]    ← P0, P1 은 한 번도 중단 없음
  Consumer B: [P3, P4]    ← P3, P4 는 한 번도 중단 없음
  Consumer C: [P2, P5]    ← P2, P5 만 일시적 중단 후 할당
```

**Cooperative Rebalancing 의 장점:**

1. **최소 중단**: 이동 대상 파티션만 일시적으로 중단되고, 나머지 파티션은 계속 처리된다. 6개 파티션 중 2개만 이동하면 나머지 4개는 영향을 받지 않는다.

2. **Rolling Deploy 최적화**: 배포 시에도 이동 대상 파티션만 잠시 중단되므로 전체 처리량 저하가 크게 줄어든다.

3. **점진적 수렴**: 여러 번의 짧은 Rebalance 를 통해 최적 상태로 수렴한다. 각 Rebalance 는 짧고, 영향 범위가 제한적이다.

**주의 사항:**

- Rebalance 횟수 자체는 Eager 보다 많을 수 있다 (최소 2번). 그러나 각 Rebalance 의 영향이 작으므로 총 비용은 적다.
- `ConsumerRebalanceListener` 의 `onPartitionsRevoked()` 는 revoke 대상 파티션에서만 호출된다 (Eager 에서는 모든 파티션에서 호출됨).
- Cooperative 프로토콜에서는 `onPartitionsLost()` 콜백이 추가로 사용된다. 이 콜백은 Consumer 가 파티션을 정상적으로 반환하지 못한 경우 (crash 등) 에 호출된다.

### Static Group Membership

***Static Group Membership*** 은 Kafka 2.3 에서 도입된 기능으로, `group.instance.id` 를 설정하여 활성화한다.

기본적으로 Consumer 는 Group 에 Join 할 때마다 새로운 `member.id` 를 할당받는다. 따라서 Consumer 가 재시작되면 Coordinator 입장에서는 "기존 Consumer 가 떠나고 새로운 Consumer 가 왔다" 고 인식하여 Rebalance 가 2번 (leave + join) 발생한다.

Static Group Membership 에서는 Consumer 에 고정된 `group.instance.id` 를 부여한다. Consumer 가 재시작하여 같은 `group.instance.id` 로 JoinGroup 을 보내면, Coordinator 는 이를 기존 멤버의 복귀로 인식하고 이전 파티션 할당을 그대로 유지한다.

```
일반 Consumer (Dynamic Membership):

  C0 종료 → session.timeout.ms 대기 → Rebalance #1 (leave)
  C0' 시작 →                         → Rebalance #2 (join)

  결과: 2번 Rebalance, session.timeout.ms 만큼 지연

Static Group Membership (group.instance.id 설정):

  C0 종료 → C0' 시작 (session.timeout.ms 이내)
  C0' 가 같은 group.instance.id 로 JoinGroup
  → Coordinator 가 기존 멤버로 인식
  → Rebalance 없이 기존 파티션 할당 유지!

  결과: 0번 Rebalance, 즉시 처리 재개
```

**설정 시 주의 사항:**

- `session.timeout.ms` 를 배포 소요 시간보다 길게 설정해야 한다. Consumer 가 종료된 후 새 Consumer 가 시작될 때까지 `session.timeout.ms` 가 만료되면, Coordinator 가 해당 멤버를 제거하고 Rebalance 가 발생한다.
- 각 Consumer 의 `group.instance.id` 는 Group 내에서 고유해야 한다. 동일한 `group.instance.id` 를 가진 두 Consumer 가 동시에 Join 하면 기존 Consumer 가 강제 제거된다 (fencing).
- `session.timeout.ms` 를 길게 설정하면, Consumer 가 실제로 crash 했을 때 해당 파티션이 오래 orphaned 상태로 남는 부작용이 있다.

```properties
# Static Group Membership 권장 설정 예시
group.instance.id=order-consumer-0     # 인스턴스별 고유 ID
session.timeout.ms=300000              # 5분 (배포 시간 + 여유)
heartbeat.interval.ms=10000            # 10초
```

### Rebalancing and Duplicate Consumption

Rebalance 과정에서 Committed Offset 과 Current Offset 사이의 gap 은 중복 소비의 원인이 된다. 이는 Kafka 의 at-least-once 시맨틱에서 근본적으로 발생하는 문제이다.

상세 시나리오:

```
Consumer A 의 파티션 P0 처리 상태:

파티션 P0: |m85|m86|m87|m88|m89|m90|m91|m92|m93|m94|m95|m96|m97|m98|m99|m100|
                              ↑                        ↑
                       Committed Offset = 90     Current Offset = 97
                       (마지막 commit 시점)       (실제로 처리 완료한 위치)

상황: Consumer A 가 m90~m96 까지 처리했지만 아직 commit 하지 않음

[Rebalance 발생] → P0 이 Consumer B 에게 재할당

Consumer B 는 Committed Offset (90) 부터 읽기 시작:
  m90 → 중복 처리!
  m91 → 중복 처리!
  m92 → 중복 처리!
  m93 → 중복 처리!
  m94 → 중복 처리!
  m95 → 중복 처리!
  m96 → 중복 처리!
  m97 → 정상 (새로운 메시지)
```

이 gap (Committed Offset ~ Current Offset) 의 크기는 commit 빈도에 의해 결정된다. Auto Commit 모드에서는 `auto.commit.interval.ms` (기본 5초) 마다 commit 되므로, 최대 5초 동안 처리한 메시지가 중복될 수 있다.

**해결 전략:**

**1. Commit 빈도 증가**

```properties
# Auto Commit 간격을 줄여서 gap 을 최소화
auto.commit.interval.ms=1000  # 1초마다 commit (기본 5초)
```

gap 이 줄어들지만 Broker 에 대한 commit 요청이 증가하여 네트워크/디스크 부하가 높아진다.

**2. Manual Commit + 멱등성(Idempotency) 처리**

```java
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        // 멱등성 키 기반 처리 (같은 메시지가 와도 결과가 동일)
        String idempotencyKey = record.topic() + "-" + record.partition() + "-" + record.offset();
        if (!processedKeys.contains(idempotencyKey)) {
            processMessage(record);
            processedKeys.add(idempotencyKey);
        }
        // 레코드별 즉시 commit
        consumer.commitSync(Collections.singletonMap(
            new TopicPartition(record.topic(), record.partition()),
            new OffsetAndMetadata(record.offset() + 1)
        ));
    }
}
```

**3. ConsumerRebalanceListener 활용**

```java
consumer.subscribe(List.of("orders"), new ConsumerRebalanceListener() {
    @Override
    public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
        // Rebalance 직전에 현재까지 처리한 offset 을 commit
        // 이렇게 하면 gap 을 최소화할 수 있음
        consumer.commitSync(getCurrentOffsets());
        log.info("Committed offsets before rebalance for partitions: {}", partitions);
    }

    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
        log.info("Partitions assigned after rebalance: {}", partitions);
    }
});
```

`onPartitionsRevoked()` 는 Rebalance 가 시작되기 직전, Consumer 가 파티션을 반환하기 전에 호출된다. 이 콜백에서 현재까지 처리한 offset 을 commit 하면 Committed Offset 과 Current Offset 사이의 gap 을 0 에 가깝게 줄일 수 있다. 그러나 `onPartitionsRevoked()` 에서 commit 이 실패하거나, commit 후 ~  파티션 revoke 사이에 추가 처리가 발생하면 여전히 중복이 발생할 수 있으므로 완전한 해결책은 아니다.

궁극적으로 exactly-once 시맨틱이 필요하면 Kafka Transactions (`isolation.level=read_committed`) 또는 외부 저장소와의 idempotent write 를 사용해야 한다.

## Replication and Fault Tolerance

### ISR (In-Sync Replicas)

***ISR (In-Sync Replicas)*** 는 Leader Replica 와 데이터 동기화 상태를 유지하고 있는 Replica 들의 집합이다. Leader 자신도 ISR 에 포함된다. ISR 은 Kafka 가 데이터 내구성과 가용성 사이의 균형을 조절하는 핵심 메커니즘이다.

Follower Replica 는 Leader 에게 주기적으로 Fetch 요청을 보내 새로운 메시지를 가져온다. 이 Fetch 동작은 Consumer 의 Fetch 와 동일한 프로토콜을 사용하며, Follower 는 사실상 "특수한 Consumer" 로 동작한다.

ISR 에서의 제거 조건:

- `replica.lag.time.max.ms` (기본 30000ms = 30초): Follower 가 이 시간 내에 Leader 에게 Fetch 요청을 보내지 않거나, Fetch 했지만 Leader 의 LEO 를 따라잡지 못하면 ISR 에서 제거된다.

```
ISR 관리 예시:

초기 상태: ISR = {Broker-0(L), Broker-1(F), Broker-2(F)}

t=0s  : Leader 에 메시지 m100 기록, LEO = 101
t=1s  : Broker-1 이 m100 Fetch 완료 → LEO(Broker-1) = 101
t=2s  : Broker-2 이 m100 Fetch 완료 → LEO(Broker-2) = 101
        ISR = {Broker-0, Broker-1, Broker-2}

t=10s : Broker-2 네트워크 장애 발생
t=10s : Leader 에 m101~m110 기록, LEO = 111
t=15s : Broker-1 이 m110 까지 Fetch 완료
        Broker-2 는 Fetch 불가 (네트워크 장애)

t=40s : replica.lag.time.max.ms (30s) 초과
        Broker-2 를 ISR 에서 제거
        ISR = {Broker-0, Broker-1}
        Controller 가 ZooKeeper/KRaft 에 ISR 변경 기록

t=50s : Broker-2 네트워크 복구, Fetch 재개
t=55s : Broker-2 가 Leader 의 LEO 를 따라잡음
        Broker-2 를 ISR 에 다시 추가
        ISR = {Broker-0, Broker-1, Broker-2}
```

ISR 의 크기는 성능과 내구성에 직접적인 영향을 미친다:

- **ISR 크기가 클수록**: 데이터 내구성이 높아지지만, `acks=all` 일 때 모든 ISR 의 복제 완료를 기다려야 하므로 지연(latency) 이 증가한다.
- **ISR 크기가 작을수록**: 복제 대기가 줄어 지연이 감소하지만, Broker 장애 시 데이터 손실 위험이 높아진다.
- **ISR = {Leader 만}**: `acks=all` 이라도 Leader 만 기록하면 응답하므로 `acks=1` 과 동일한 효과가 된다. `min.insync.replicas` 로 이를 방지한다.

### High Watermark and Leader Epoch

***High Watermark (HW)*** 은 ISR 의 모든 Replica 가 복제를 완료한 가장 높은 Offset 이다. Consumer 는 HW 이하의 메시지만 읽을 수 있다.

HW 가 존재하는 이유는 아직 모든 ISR 에 복제되지 않은 메시지를 Consumer 에게 노출하면, Leader 장애 시 새 Leader 에 해당 메시지가 없어 Consumer 입장에서 "이미 읽은 메시지가 사라지는" 현상이 발생하기 때문이다.

```
HW 업데이트 메커니즘:

Leader (Broker-0)           Follower (Broker-1)
LEO=100, HW=100             LEO=100, HW=100

[Producer 가 m100 전송]
LEO=101, HW=100             LEO=100, HW=100
  ↑ 아직 Follower 가 복제 안 함

[Follower 가 Fetch 요청 (fetch_offset=100)]
  → Leader 가 m100 을 응답하면서 HW=100 도 전달
LEO=101, HW=100             LEO=101, HW=100
                               ↑ m100 복제 완료

[Follower 가 다음 Fetch 요청 (fetch_offset=101)]
  → Leader 가 Follower 의 LEO(101)를 확인
  → 모든 ISR 이 101 까지 복제 완료 → HW=101 로 업데이트
LEO=101, HW=101             LEO=101, HW=101
                               ↑ Fetch 응답에 HW=101 포함

Consumer 는 이제 m100 을 읽을 수 있음 (HW=101 이므로 offset 100 까지 visible)
```

**HW 만으로는 부족한 시나리오:**

HW 기반의 복제 프로토콜에는 두 가지 알려진 문제가 있다:

1. **Data Loss**: Leader 와 Follower 의 HW 업데이트 시점 차이로 인해, 특정 타이밍에 장애가 발생하면 committed 메시지가 유실될 수 있다.
2. **Data Divergence**: Leader 변경 후 이전 Leader 가 복귀할 때, 서로 다른 메시지를 같은 offset 에 가진 상태가 될 수 있다.

이 문제를 해결하기 위해 Kafka 0.11 에서 ***Leader Epoch*** 가 도입되었다.

Leader Epoch 는 Leader 가 변경될 때마다 1씩 증가하는 단조 증가(monotonically increasing) 정수값이다. 각 메시지는 어떤 Leader Epoch 에서 기록되었는지 추적된다.

```
Leader Epoch 의 동작:

[Epoch 0] Leader = Broker-0
  offset 0~99: Epoch 0 에서 기록

[Broker-0 장애] → Leader 변경
[Epoch 1] Leader = Broker-1
  offset 100~150: Epoch 1 에서 기록

[Broker-0 복귀]
  Broker-0 이 Broker-1 에게 OffsetForLeaderEpoch 요청:
  "Epoch 0 의 마지막 offset 은 무엇인가?"
  → 응답: offset 100

  Broker-0 의 로컬 로그에서 offset 100 이후 데이터를 truncate
  → Broker-1 (현재 Leader) 의 데이터와 일관성 보장
  → Data Divergence 방지
```

Leader Epoch 레코드는 각 Replica 의 로컬 파일(`leader-epoch-checkpoint`)에 저장되며, 형식은 `(epoch, start_offset)` 쌍의 리스트이다.

```
leader-epoch-checkpoint 예시:
0  0       # Epoch 0 은 offset 0 에서 시작
1  100     # Epoch 1 은 offset 100 에서 시작
2  250     # Epoch 2 은 offset 250 에서 시작
```

Follower 가 재시작되면 Leader 에게 OffsetForLeaderEpoch 요청을 보내 자신의 마지막 Epoch 에 대한 정확한 end offset 을 확인하고, 필요하면 로그를 truncate 한다. 이 메커니즘으로 HW 만 사용할 때 발생하던 Data Loss 와 Data Divergence 문제를 해결한다.

### Unclean Leader Election

Leader Replica 가 위치한 Broker 가 장애를 일으키면, ISR 에 있는 다른 Replica 중 하나가 새 Leader 로 선출된다. 그러나 ISR 이 비어 있는 경우 (Leader 를 제외한 모든 Replica 가 이미 ISR 에서 제거된 상태에서 Leader 마저 장애) 에는 두 가지 선택지가 있다.

**`unclean.leader.election.enable=true` (가용성 우선):**

ISR 에 없는 Replica 도 Leader 가 될 수 있다. ISR 에 없다는 것은 Leader 와 동기화가 되지 않은 상태이므로, 해당 Replica 에는 Leader 가 마지막으로 기록한 일부 메시지가 없을 수 있다.

```
Unclean Leader Election 시나리오:

초기: ISR = {Broker-0(L), Broker-1(F)}
  Leader LEO = 200, Follower LEO = 180

t=0  : Broker-1 이 느려져서 ISR 에서 제거
       ISR = {Broker-0(L)}

t=5  : Leader 에 m200~m210 기록 (LEO = 211)

t=10 : Broker-0 (Leader) 장애!
       ISR 에 Leader 후보 없음

[unclean.leader.election.enable=true]
  → Broker-1 이 Leader 로 선출 (LEO = 180)
  → m180~m210 (31개 메시지) 유실!
  → 파티션은 사용 가능 (가용성 유지)

[unclean.leader.election.enable=false]
  → Leader 후보 없음
  → 파티션이 offline 상태로 전환
  → 해당 파티션에 대한 produce/consume 불가
  → Broker-0 또는 다른 ISR 멤버가 복구될 때까지 대기
  → 데이터 무손실 보장
```

**`unclean.leader.election.enable=false` (기본값, 일관성 우선):**

ISR 에 있는 Replica 만 Leader 가 될 수 있다. ISR 이 비어 있으면 파티션이 사용 불가 상태가 되지만, committed 메시지의 유실은 발생하지 않는다.

실무에서의 선택 기준:

- **금융 거래, 결제, 주문**: `false` (데이터 손실 불가)
- **로그 수집, 메트릭, 클릭스트림**: `true` (일부 유실보다 서비스 중단이 더 치명적)
- **이벤트 소싱**: `false` (이벤트 유실 시 상태 복원 불가)

### min.insync.replicas Best Practice

`min.insync.replicas` 는 Producer 가 `acks=all` 로 전송할 때, 쓰기 성공으로 간주하기 위해 필요한 최소 ISR 수이다. ISR 수가 `min.insync.replicas` 미만이면 Producer 에게 `NotEnoughReplicasException` 이 발생한다.

**권장 구성: replication.factor=3, min.insync.replicas=2, acks=all**

```
구성: RF=3, min.insync.replicas=2, acks=all

정상 상태: ISR = {B0(L), B1, B2}
  → 3개 ISR >= 2 (min.insync.replicas)
  → 쓰기 성공, 3개 Broker 모두에 복제

1개 Broker 장애: ISR = {B0(L), B1}
  → 2개 ISR >= 2
  → 쓰기 성공, 2개 Broker 에 복제
  → 데이터 손실 없음 (2개 복제본 존재)

2개 Broker 장애: ISR = {B0(L)}
  → 1개 ISR < 2
  → NotEnoughReplicasException!
  → 쓰기 불가 (가용성 희생)
  → 그러나 기존 데이터는 안전 (최소 2개 복제본 보장)
```

이 구성은 **N-1 개 Broker 장애 허용** (N = min.insync.replicas) 을 의미하며, 1개 Broker 장애까지 데이터 손실 없이 정상 운영된다. 2개 Broker 장애 시 쓰기가 중단되지만, 이는 데이터 일관성을 보호하기 위한 의도적인 설계이다.

**비권장 구성: replication.factor=3, min.insync.replicas=1, acks=all**

```
구성: RF=3, min.insync.replicas=1, acks=all

ISR = {B0(L)} 일 때도 쓰기 성공
  → Leader 한 곳에만 기록되어도 "all ISR 에 복제됨" 으로 판정
  → 사실상 acks=1 과 동일한 내구성
  → Leader 장애 시 데이터 유실 가능

이 구성은 acks=all 의 의미를 무력화하므로 비권장
```

**실무 설정 요약:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 설정 조합               │ 장애 허용  │ 내구성    │ 가용성    │
├─────────────────────────────────────────────────────────────────┤
│ RF=3, ISR=2, acks=all   │ 1 Broker  │ 높음     │ 보통     │
│ RF=3, ISR=1, acks=all   │ 0 Broker  │ 낮음     │ 높음     │
│ RF=3, ISR=2, acks=1     │ -         │ 보통     │ 높음     │
│ RF=5, ISR=3, acks=all   │ 2 Broker  │ 매우높음  │ 보통     │
└─────────────────────────────────────────────────────────────────┘

※ RF = replication.factor, ISR = min.insync.replicas
※ 장애 허용 = 데이터 손실 없이 견딜 수 있는 Broker 장애 수
※ 공식: 장애 허용 수 = RF - min.insync.replicas
  (단, acks=all 이어야 유효)
```

`replication.factor - min.insync.replicas` 가 허용 가능한 최대 Broker 장애 수이다. 이 값이 너무 크면 내구성이 떨어지고, 너무 작으면 가용성이 떨어진다. 대부분의 프로덕션 환경에서 `RF=3, min.insync.replicas=2, acks=all` 조합이 내구성과 가용성의 최적 균형점으로 권장된다.
## High-Traffic Production Guide (10M+ TPS)

<mark><em><strong>Kafka 를 대규모 트래픽 환경에서 안정적으로 운영하려면, 단순히 설정값을 튜닝하는 것이 아니라 Kafka 의 내부 동작 원리를 이해하고 병목 지점을 정확히 파악해야 한다.</strong></em></mark>

대규모 트래픽 환경에서 Kafka 의 성능을 극대화하기 위해서는 크게 세 가지 레이어를 동시에 최적화해야 한다. 첫째는 Kafka 자체의 설정(Broker, Producer, Consumer), 둘째는 JVM 튜닝, 셋째는 OS/커널 레벨 튜닝이다. 이 세 레이어는 서로 밀접하게 연관되어 있으며, 하나의 레이어만 최적화해서는 전체 시스템의 병목을 해소할 수 없다.

### Partition Design Strategy

Partition 은 Kafka 의 ***parallelism unit*** 이다. Topic 의 메시지는 Partition 단위로 분산 저장되며, Consumer Group 내의 각 Consumer 는 하나 이상의 Partition 에 할당되어 병렬로 메시지를 처리한다. 따라서 Partition 수의 설계는 전체 시스템의 throughput 과 직결된다.

Partition 수 산정 공식은 다음과 같다:

```
필요 Partition 수 = 목표 throughput / 단일 Partition throughput

예시:
  목표 throughput: 1,000,000 msg/sec
  단일 Partition Producer throughput: 50,000 msg/sec
  단일 Partition Consumer throughput: 30,000 msg/sec

  Producer 관점: 1,000,000 / 50,000 = 20 Partitions
  Consumer 관점: 1,000,000 / 30,000 ≈ 34 Partitions

  → 병목은 Consumer 쪽이므로 최소 34 Partitions 필요
```

단일 Partition 의 throughput 은 `kafka-producer-perf-test.sh` 와 `kafka-consumer-perf-test.sh` 로 측정한다. 이 도구들은 실제 Kafka 클러스터에 부하를 주면서 throughput 과 latency 를 측정하므로, 반드시 production 과 동일한 환경에서 테스트해야 한다.

**Partition 수 증가의 trade-off** 는 반드시 이해해야 한다:

장점:
- 처리량이 선형적으로 증가한다. Partition 은 독립적인 commit log 이므로 각 Partition 에 대한 I/O 가 병렬로 수행된다.
- Consumer 병렬성이 증가한다. Consumer Group 내의 Consumer 수를 Partition 수만큼 늘릴 수 있다.

단점:
- **더 많은 open file handle 이 필요하다.** 각 Partition 은 최소 3개의 파일을 사용한다: `.log` (실제 메시지 데이터), `.index` (offset-to-position 매핑), `.timeindex` (timestamp-to-offset 매핑). Segment rotation 시 추가 FD 가 필요하며, Partition 수가 수천 개를 넘으면 `ulimit -n` 설정을 반드시 올려야 한다.
- **Leader Election 시간이 증가한다.** Controller 가 Broker 장애를 감지하면 해당 Broker 가 Leader 인 모든 Partition 에 대해 새로운 Leader 를 선출해야 한다. ZooKeeper 기반에서는 Partition 당 약 5~10ms 가 소요되므로, 10,000 개의 Partition Leader 를 가진 Broker 가 죽으면 50~100초 동안 해당 Partition 들이 사용 불가 상태가 된다. KRaft 기반에서는 이 시간이 대폭 단축되지만 여전히 무시할 수 없다.
- **End-to-End Latency 가 증가할 수 있다.** Producer 가 메시지를 전송하면 Leader Broker 는 해당 메시지를 모든 ISR Follower 에 복제해야 한다. Partition 수가 많으면 Follower 의 Fetch 요청이 많아져 복제 지연이 발생할 수 있다.
- **Producer 의 메모리 사용이 증가한다.** Producer 는 Partition 별로 독립적인 ***RecordAccumulator*** batch buffer 를 유지한다. `batch.size` 가 128KB 이고 Partition 이 1,000개면 최소 128MB 의 메모리가 batch buffer 에만 필요하다.
- **Rebalancing 시간이 증가한다.** Consumer Group Rebalance 시 Partition 재할당 알고리즘의 시간 복잡도는 Partition 수에 비례한다.

**실무 권장사항**:
- Partition 수는 줄일 수 없으므로(topic 재생성 없이는) 보수적으로 시작한다. 향후 2~3배 정도의 트래픽 증가를 고려하여 설계한다.
- 경험적 기준으로 브로커당 Partition 수는 4,000개 이하, 클러스터 전체 200,000개 이하를 권장한다 (KRaft 기준). ZooKeeper 기반에서는 이보다 훨씬 낮은 수치를 유지해야 한다.
- Consumer 수 이상으로 Partition 을 설정한다. 1:1 매핑이 이상적이며, Consumer 수보다 Partition 이 적으면 유휴 Consumer 가 발생하여 리소스가 낭비된다.

### Broker Configuration for High Traffic

```properties
# Network & I/O Threads
num.network.threads=8          # 네트워크 요청 처리 스레드 (CPU 코어 수에 비례)
num.io.threads=16              # 디스크 I/O 처리 스레드 (디스크 수에 비례)

# Socket Buffer
socket.send.buffer.bytes=1048576      # 1MB (기본 102400)
socket.receive.buffer.bytes=1048576   # 1MB (기본 102400)
socket.request.max.bytes=104857600    # 100MB

# Log Flush (대부분의 환경에서 설정하지 않는 것을 권장)
# Replication (RF=3, min.insync.replicas=2) 으로 내구성을 보장하고,
# fsync 는 OS 에 위임하는 것이 성능과 내구성의 최적 균형점이다.
# log.flush.interval.messages=Long.MAX_VALUE  (기본값, 미설정 권장)
# log.flush.interval.ms=Long.MAX_VALUE        (기본값, 미설정 권장)

# Replication
num.replica.fetchers=4                # Follower 의 Fetch 스레드 수
replica.fetch.max.bytes=1048576       # Follower 가 한 번에 가져오는 최대 크기

# Log Retention
log.retention.hours=168               # 7일
log.segment.bytes=1073741824          # 1GB segment
log.retention.check.interval.ms=300000 # 5분마다 체크
```

각 설정의 의미를 OS/커널 레벨에서 상세히 설명한다.

**num.network.threads** 는 Java NIO ***Selector*** 기반의 Network Acceptor/Processor Thread 수이다. Kafka Broker 의 네트워크 처리 아키텍처는 ***Reactor Pattern*** 을 따른다. 1개의 Acceptor Thread 가 새로운 TCP 연결을 수락(accept)하고, `num.network.threads` 만큼의 Processor Thread 가 소켓에서 데이터를 읽어 Request Queue 에 넣는다. 각 Processor Thread 는 Java NIO Selector 를 사용하여 여러 소켓의 I/O readiness 를 non-blocking 으로 감시한다. CPU 코어 수의 50~100% 로 설정하는 것이 일반적이다.

```
+----------+     +-----------+     +---------------+     +----------+
|  Client  | --> | Acceptor  | --> | Processor (N) | --> | Request  |
| (TCP)    |     | Thread(1) |     | NIO Selector  |     | Queue    |
+----------+     +-----------+     +---------------+     +----------+
                                                              |
                                                              v
                                                     +----------------+
                                                     | I/O Thread (M) |
                                                     | (num.io.threads)|
                                                     +----------------+
                                                              |
                                                              v
                                                     +----------------+
                                                     | Response Queue |
                                                     +----------------+
                                                              |
                                                              v
                                                     +---------------+
                                                     | Processor (N) |
                                                     | → Client      |
                                                     +---------------+
```

**num.io.threads** 는 ***Request Handler Thread Pool*** 의 크기이다. Request Queue 에서 요청을 꺼내 실제 디스크 I/O 를 수행하고 응답을 생성하여 Response Queue 에 넣는다. Produce 요청의 경우 메시지를 Log Segment 파일에 append 하고, Fetch 요청의 경우 해당 offset 의 메시지를 디스크(또는 Page Cache)에서 읽는다. 디스크 수의 2~4배로 설정하는 것이 일반적이다. SSD 의 경우 IOPS 가 높으므로 더 많은 스레드가 효과적이다.

**socket.send.buffer.bytes / socket.receive.buffer.bytes** 는 TCP 소켓의 `SO_SNDBUF` / `SO_RCVBUF` 크기를 설정한다. 커널의 TCP 송수신 버퍼 크기를 결정하며, 이 값이 작으면 TCP Window 가 제한되어 네트워크 대역폭을 충분히 활용하지 못한다. 특히 ***BDP(Bandwidth-Delay Product)*** 가 큰 환경(고대역폭, 높은 RTT)에서는 이 값을 충분히 크게 설정해야 한다. BDP = Bandwidth(bytes/sec) * RTT(sec) 보다 커야 파이프라인이 가득 찬다.

**log.flush** 관련 설정은 `fsync()` 시스템 콜의 호출 빈도를 결정한다. `fsync()` 는 OS Page Cache 의 dirty page 를 디스크에 강제 write-back 한다. Kafka 는 기본적으로 OS Page Cache 에 메시지를 쓰고, 디스크 flush 는 OS 에 위임하는 전략을 사용한다. 이 방식이 성능상 유리한 이유는, OS 커널이 dirty page 를 비동기적으로 flush 하면서 sequential write 를 최적화할 수 있기 때문이다. 그러나 Broker 가 비정상 종료(crash)되면 아직 flush 되지 않은 메시지가 유실될 수 있다. Replication factor 가 2 이상이면 다른 Broker 에 복제된 데이터로 복구 가능하므로, 대부분의 production 환경에서는 `log.flush` 를 OS 에 위임하는 것이 권장된다.

**num.replica.fetchers** 는 각 Follower Broker 가 Leader 로부터 데이터를 가져오는 Fetch Thread 수이다. 하나의 Fetch Thread 가 여러 Partition 의 데이터를 가져오는데, Partition 수가 많으면 병목이 된다. 이 값을 늘리면 복제 지연(replication lag)이 줄어들지만, Leader Broker 의 네트워크 부하와 CPU 부하가 증가한다.

### Producer Optimization for High Traffic

```properties
# Batching
batch.size=131072                # 128KB (기본 16KB)
linger.ms=5                     # 5ms 대기 (기본 0)

# Compression
compression.type=lz4             # 또는 zstd

# Buffer
buffer.memory=67108864           # 64MB (기본 32MB)
max.block.ms=60000              # 60초 (buffer 가 full 일 때 대기 시간)

# Reliability
acks=all                        # 또는 acks=1 (throughput 우선)
retries=2147483647              # Integer.MAX_VALUE (Kafka 2.1+ 기본값)
delivery.timeout.ms=120000      # 2분
enable.idempotence=true         # 중복 방지

# In-flight
max.in.flight.requests.per.connection=5  # idempotent 일 때 5까지 순서 보장
```

각 설정의 상호작용과 trade-off 를 상세히 설명한다.

**batch.size 와 linger.ms 의 상호작용**: Producer 는 ***RecordAccumulator*** 내부에서 Partition 별로 ***ProducerBatch*** 를 유지한다. `send()` 가 호출되면 메시지는 해당 Partition 의 현재 batch 에 추가된다. batch 가 전송되는 조건은 두 가지이다: (1) batch 크기가 `batch.size` 에 도달하거나, (2) batch 생성 후 `linger.ms` 만큼 시간이 경과하는 것이다. 둘 중 하나라도 충족되면 Sender Thread 가 해당 batch 를 네트워크로 전송한다.

`batch.size` 를 128KB 로, `linger.ms` 를 5ms 로 설정하면 두 가지 효과가 있다. 첫째, 더 많은 메시지를 하나의 네트워크 요청으로 보내므로 per-message 네트워크 오버헤드가 감소한다. 둘째, compression 이 활성화된 경우 더 큰 batch 에서 더 높은 압축률을 얻는다. 반대로 개별 메시지의 latency 는 최대 `linger.ms` 만큼 증가한다. 즉, `batch.size ↑ + linger.ms ↑ = throughput ↑, latency ↑` 이다.

**compression.type 선택 기준**: 압축 알고리즘 선택은 CPU 와 Network bandwidth 중 어느 쪽이 병목인가에 따라 달라진다.

```
+----------+----------+-----------+-------------+
| Algorithm|  Speed   |   Ratio   | CPU Usage   |
+----------+----------+-----------+-------------+
| none     |  fastest |  1.0x     | none        |
| lz4      |  fast    |  ~2x     | low         |
| snappy   |  fast    |  ~1.7x   | low         |
| zstd     |  medium  |  ~2.5x   | medium-high |
| gzip     |  slow    |  ~2.5x   | high        |
+----------+----------+-----------+-------------+
```

네트워크 대역폭이 병목이면 압축률이 높은 `zstd` 를 선택한다. CPU 가 병목이면 압축 속도가 빠른 `lz4` 를 선택한다. 대부분의 production 환경에서는 `lz4` 가 최적의 균형점이다. 주의할 점은 Kafka 의 압축은 ***batch-level compression*** 이라는 것이다. 즉, 개별 메시지가 아니라 전체 batch 를 하나의 단위로 압축한다. 이 때문에 batch 크기가 클수록 압축률이 높아진다.

**buffer.memory 와 max.block.ms 의 관계**: `buffer.memory` 는 RecordAccumulator 가 사용할 수 있는 전체 메모리의 상한이다. 모든 Partition 의 batch buffer 와 전송 대기 중인 메시지가 이 메모리를 공유한다. buffer 가 가득 차면 `send()` 호출은 `max.block.ms` 만큼 block 된 후 `TimeoutException` 을 발생시킨다. 이 상황은 일반적으로 Producer 의 전송 속도보다 메시지 생산 속도가 빠를 때, 또는 Broker 응답이 느려 batch 가 해제되지 않을 때 발생한다. `buffer.memory` 를 늘리면 일시적인 트래픽 급증(spike)을 흡수할 수 있지만, 근본적인 해결은 Broker 성능 개선 또는 Producer 수를 늘리는 것이다.

**acks=all 과 min.insync.replicas 의 조합**: `acks=all` 은 Leader 가 모든 ISR Follower 로부터 복제 확인을 받은 후에 Producer 에게 ACK 를 보내는 것이다. 이때 `min.insync.replicas=2` 로 설정하면, ISR 에 최소 2개 이상의 replica(Leader 포함)가 있어야 produce 가 성공한다. Replication factor=3, `min.insync.replicas=2` 조합이 안정성과 성능의 균형점으로 가장 널리 사용된다. 이 설정은 1대의 Broker 장애까지 데이터 유실 없이 처리할 수 있다.

**max.in.flight.requests.per.connection** 과 idempotence 의 관계: idempotent producer(`enable.idempotence=true`)에서는 이 값을 최대 5까지 설정해도 메시지 순서가 보장된다. Broker 가 sequence number 기반으로 out-of-order 메시지를 감지하고 정확한 순서로 저장하기 때문이다. 반면 idempotence 가 비활성화된 상태에서 이 값이 1보다 크면, 재시도(retry) 시 메시지 순서가 뒤바뀔 수 있다. 예를 들어 batch1 전송 실패, batch2 전송 성공 후 batch1 재시도 성공 시 순서가 뒤집힌다.

### Consumer Optimization for High Traffic

```properties
# Poll & Processing
max.poll.records=500             # 한 번 poll() 에 가져오는 최대 레코드 수
max.poll.interval.ms=300000      # 5분 (처리 시간이 긴 경우)

# Fetch
fetch.min.bytes=1048576          # 1MB (기본 1)
fetch.max.wait.ms=500            # 500ms
max.partition.fetch.bytes=1048576 # 1MB

# Session & Heartbeat
session.timeout.ms=30000         # 30초 (빠른 장애 감지와 안정성의 균형)
heartbeat.interval.ms=10000      # 10초 (session.timeout.ms 의 1/3)

# Offset
enable.auto.commit=false         # 수동 commit 권장
auto.offset.reset=latest
```

각 설정의 의미와 상호작용을 상세히 설명한다.

**max.poll.records 의 양면성**: 이 값은 한 번의 `poll()` 호출로 반환되는 최대 레코드 수이다. 너무 크게 설정하면 한 batch 의 처리 시간이 `max.poll.interval.ms` 를 초과하여 Consumer Group Coordinator 가 해당 Consumer 를 dead 로 판단하고 ***Rebalance*** 를 트리거한다. 너무 작게 설정하면 `poll()` 호출 빈도가 증가하여 fetch 요청 오버헤드가 늘고 throughput 이 저하된다. 최적값은 "한 batch 처리 시간이 `max.poll.interval.ms` 의 50% 를 넘지 않는 범위에서 최대한 크게" 하는 것이다.

**fetch.min.bytes 와 fetch.max.wait.ms 의 상호작용**: Consumer 의 Fetch 요청에 대해 Broker 는 두 조건 중 하나를 만족할 때까지 응답을 보류한다: (1) 가져올 데이터가 `fetch.min.bytes` 이상 모이거나, (2) `fetch.max.wait.ms` 시간이 경과하는 것이다. `fetch.min.bytes` 를 1MB 로 설정하면 Broker 는 최소 1MB 의 데이터가 모일 때까지 응답을 지연한다. 이는 네트워크 요청 횟수를 줄여 throughput 을 높이지만, 트래픽이 적은 시간대에는 `fetch.max.wait.ms` 까지 기다려야 하므로 latency 가 증가한다. 즉, `fetch.min.bytes ↑ = throughput ↑, latency ↑` 이다.

**session.timeout.ms 와 heartbeat.interval.ms 의 관계**: Consumer 는 ***Heartbeat Thread*** 를 통해 주기적으로 Group Coordinator 에게 heartbeat 를 전송한다. `session.timeout.ms` 내에 heartbeat 가 도착하지 않으면 Coordinator 는 해당 Consumer 를 죽은 것으로 판단하고 Rebalance 를 시작한다. `session.timeout.ms` 가 너무 짧으면 ***False Positive*** 가 발생한다. 즉, 정상적으로 메시지를 처리 중인 Consumer 가 GC pause 나 일시적 네트워크 지연으로 heartbeat 를 놓쳐 제거되는 것이다. 너무 길면 실제 장애 발생 시 감지가 지연된다. `heartbeat.interval.ms` 는 `session.timeout.ms` 의 1/3 이하로 설정하는 것이 권장된다. 이렇게 하면 2번의 heartbeat 를 연속으로 놓쳐도 1번의 여유가 있다.

**enable.auto.commit=false 를 권장하는 이유**: auto commit 이 활성화되면 `poll()` 호출 시 이전 poll 에서 가져온 offset 이 자동으로 commit 된다. 이 방식은 두 가지 문제가 있다. 첫째, 메시지 처리가 완료되기 전에 offset 이 commit 되면 ***at-most-once*** 의미론이 된다(Consumer crash 시 처리되지 않은 메시지 유실). 둘째, offset commit 과 메시지 처리 완료의 시점이 불일치할 수 있다. 수동 commit 을 사용하면 메시지 처리 완료 후 명시적으로 `commitSync()` 또는 `commitAsync()` 를 호출하여 정확한 offset 을 관리할 수 있다.

### Consumer Scaling Strategy

Consumer 확장 전략은 throughput 요구사항에 따라 체계적으로 계산한다.

```
시나리오: 초당 100만 메시지 처리 필요

Step 1. 단일 Consumer throughput 측정
   - kafka-consumer-perf-test.sh 사용
   - 측정 결과: 초당 10,000 메시지

Step 2. 필요 Consumer 수 산정
   - 1,000,000 / 10,000 = 100 Consumers

Step 3. 필요 Partition 수 산정
   - 최소 100 Partitions (Consumer 수 이상)
   - 향후 확장 고려: 150~200 Partitions

Step 4. 최적 매핑
   - Consumer Group 내 Consumer 수 = Partition 수 → 최적
   - 각 Consumer 가 정확히 1개의 Partition 을 담당

Step 5. 비효율 케이스
   - Consumer 수 > Partition 수 → 유휴 Consumer 발생 (낭비)
   - Consumer 수 < Partition 수 → 일부 Consumer 가 여러 Partition 담당 (가능하지만 부하 불균형)
```

추가적으로 Consumer Scaling 시 고려해야 할 사항이 있다.

***Cooperative Sticky Assignor*** (KIP-429)를 사용하면 Rebalance 시 모든 Partition 할당이 해제되는 것이 아니라, 변경이 필요한 Partition 만 재할당된다. 이 방식은 대규모 Consumer Group 에서 Rebalance 로 인한 처리 중단 시간을 대폭 줄인다. `partition.assignment.strategy` 를 `org.apache.kafka.clients.consumer.CooperativeStickyAssignor` 로 설정하여 활성화한다.

여러 Consumer Group 이 같은 Topic 을 구독하는 패턴도 유효하다. 예를 들어 실시간 처리용 Consumer Group 과 배치 분석용 Consumer Group 을 분리하면 각 Group 의 처리 특성에 맞게 독립적으로 확장할 수 있다.

### JVM Configuration

```bash
# GC 설정 (Kafka 3.0+)
export KAFKA_HEAP_OPTS="-Xms6g -Xmx6g"
export KAFKA_JVM_PERFORMANCE_OPTS="
  -server
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=20
  -XX:InitiatingHeapOccupancyPercent=35
  -XX:G1HeapRegionSize=16M
  -XX:MinMetaspaceFreeRatio=50
  -XX:MaxMetaspaceFreeRatio=80
"
```

***G1GC*** (Garbage-First Garbage Collector)가 Kafka 에 적합한 이유는 다음과 같다.

G1GC 는 Heap 을 고정 크기의 ***Region*** 으로 분할하고, Garbage 가 가장 많은 Region 을 우선적으로 수집하는 알고리즘이다. `MaxGCPauseMillis` 로 목표 pause 시간을 설정하면, G1GC 가 이 목표를 최대한 맞추기 위해 한 번에 수집할 Region 수를 자동으로 조절한다. Kafka Broker 는 많은 수의 short-lived object (메시지 buffer, 네트워크 요청/응답 등)를 생성하므로, 예측 가능한 GC pause 가 중요하다. GC pause 가 길어지면 heartbeat 전송이 지연되어 다른 Broker 가 해당 Broker 를 죽은 것으로 오판할 수 있다.

`InitiatingHeapOccupancyPercent=35` 는 Heap 사용량이 35% 를 넘으면 concurrent marking cycle 을 시작하도록 한다. 기본값(45%)보다 낮게 설정하는 이유는 Kafka 의 메모리 할당 패턴이 burst 성이 강하기 때문이다. burst 트래픽으로 메모리가 급격히 증가할 때 GC cycle 이 미리 시작되어 있어야 Full GC 를 피할 수 있다.

`G1HeapRegionSize=16M` 은 Region 크기를 16MB 로 설정한다. Kafka 는 비교적 큰 object (메시지 batch 등)를 자주 할당하므로, Region 크기를 키우면 ***humongous allocation*** (Region 크기의 50% 를 초과하는 할당)의 빈도가 줄어든다. Humongous allocation 은 연속된 빈 Region 을 찾아야 하므로 GC 성능에 부정적이다.

JDK 17+ 환경에서는 ***ZGC*** (`-XX:+UseZGC`) 도 Kafka Broker 에 적합한 대안이다. ZGC 는 Heap 크기에 관계없이 수 밀리초 이하의 pause time 을 제공하므로, heartbeat timeout 으로 인한 오판 위험이 더욱 줄어든다. 단, ZGC 는 G1GC 대비 약간 더 높은 CPU 오버헤드와 메모리 오버헤드가 있으므로, 충분한 벤치마크 후 적용해야 한다.

Heap 크기를 6~8GB 로 제한하는 것이 중요하다. Kafka Broker 가 메시지를 디스크에 쓸 때 실제로는 OS 의 ***Page Cache*** 에 쓰는 것이다. 커널은 가용 메모리를 Page Cache 로 활용하여 디스크 I/O 를 최소화한다. Consumer 의 Fetch 요청도 대부분 Page Cache 에서 서비스된다(특히 Consumer Lag 가 적은 경우). 따라서 Heap 을 너무 크게 잡으면 Page Cache 용 메모리가 부족해져 오히려 성능이 저하된다.

```
물리 메모리 64GB 기준:
+--------------------+
| JVM Heap: 6GB      |  ← Kafka Broker 프로세스
+--------------------+
| JVM Non-Heap: 1GB  |  ← Metaspace, Thread Stack 등
+--------------------+
| OS + Others: 5GB   |  ← 커널, 기타 프로세스
+--------------------+
| Page Cache: ~52GB  |  ← 디스크 I/O 캐싱 (핵심!)
+--------------------+
```

### OS Level Tuning

```bash
# Page Cache 관련
vm.swappiness=1                  # Swap 최소화 (0이면 OOM Killer 위험)
vm.dirty_ratio=80                # Dirty page 비율 80% 까지 허용
vm.dirty_background_ratio=5      # 5% 부터 background flush 시작

# File Descriptors
fs.file-max=1000000              # 시스템 전체 FD 상한
ulimit -n 100000                 # 프로세스당 FD 상한

# Network
net.core.wmem_max=2097152        # TCP 송신 버퍼 최대
net.core.rmem_max=2097152        # TCP 수신 버퍼 최대
net.ipv4.tcp_window_scaling=1    # TCP Window Scaling 활성화
net.ipv4.tcp_max_syn_backlog=2048

# Disk I/O
# ext4 또는 XFS 파일시스템 사용
# noatime mount 옵션 (access time 업데이트 방지)
```

각 OS 설정의 의미를 커널 레벨에서 상세히 설명한다.

**vm.swappiness**: 리눅스 커널의 ***memory reclaim*** 알고리즘에서 anonymous page(Heap, Stack 등 파일 백업이 없는 메모리)를 swap out 할 경향성을 제어한다. 값이 높을수록(최대 100) 커널은 적극적으로 swap 을 사용한다. Kafka 에서는 JVM Heap 이 swap 되면 GC pause 가 수백 배 느려지므로 swap 을 최소화해야 한다. `vm.swappiness=0` 으로 설정하면 커널이 메모리 부족 상황에서 swap 대신 ***OOM Killer*** 를 먼저 실행할 수 있어 위험하다. `vm.swappiness=1` 은 최소한의 swap 만 허용하면서 OOM Killer 위험을 줄이는 균형점이다.

**vm.dirty_ratio**: 전체 가용 메모리 대비 dirty page(디스크에 아직 쓰여지지 않은 변경된 Page Cache 페이지) 비율이 이 값을 초과하면, 해당 write 를 시도한 프로세스가 ***synchronous writeback*** 에 들어가 block 된다. 즉, dirty page 비율이 이 임계값 아래로 내려갈 때까지 모든 write 가 중단된다. Kafka 에서 이 값을 80% 로 높게 설정하는 이유는, 일시적인 트래픽 급증 시 write 가 block 되는 것을 방지하기 위해서이다. 반면 `vm.dirty_background_ratio=5` 는 dirty page 비율이 5% 를 넘으면 커널의 ***pdflush/flush*** 데몬이 background 에서 dirty page 를 비동기적으로 디스크에 쓰기 시작한다. 이 두 설정의 조합으로, 5% 부터 background flush 가 시작되지만 80% 까지는 write 가 block 되지 않는다.

**File Descriptor 설정**: Kafka 는 Partition 당 여러 개의 File Descriptor 를 사용한다. 각 Log Segment 는 3개의 파일로 구성된다: `.log` (메시지 데이터), `.index` (offset 인덱스 - offset 을 물리적 파일 위치로 매핑하는 sparse index), `.timeindex` (timestamp 인덱스 - timestamp 를 offset 으로 매핑). 활성 segment 와 이전 segment 들이 동시에 열려 있을 수 있으며, 네트워크 소켓도 FD 를 소비한다. 수천 개의 Partition 을 운영하는 Broker 는 수만 개의 FD 가 필요할 수 있다. `fs.file-max` 은 시스템 전체의 FD 상한이고, `ulimit -n` 은 프로세스당 FD 상한이다. 둘 다 충분히 높게 설정해야 한다.

**noatime mount 옵션**: 리눅스 파일시스템은 기본적으로 파일이 읽힐 때마다 해당 파일의 ***atime***(access time) 메타데이터를 업데이트한다. 이 메타데이터 업데이트는 디스크 write 를 발생시킨다. Kafka 는 Log Segment 파일을 빈번하게 읽으므로, atime 업데이트가 불필요한 write I/O 를 대량으로 발생시킨다. `noatime` mount 옵션으로 이를 비활성화하면 불필요한 write 가 제거되어 디스크 I/O 성능이 개선된다.

**네트워크 설정**: `net.core.wmem_max` / `net.core.rmem_max` 는 TCP 소켓 버퍼의 최대 크기를 커널 레벨에서 제한한다. Kafka Broker 의 `socket.send.buffer.bytes` / `socket.receive.buffer.bytes` 설정이 이 값보다 크면 커널이 무시한다. `net.ipv4.tcp_window_scaling` 은 RFC 1323 에 정의된 TCP Window Scaling 옵션을 활성화하여, TCP Window 크기를 기본 64KB 를 넘어 확장할 수 있게 한다. 고대역폭 네트워크에서 필수적이다. `net.ipv4.tcp_max_syn_backlog` 는 TCP 3-way handshake 에서 SYN 을 받았지만 아직 ESTABLISHED 되지 않은 연결의 큐 크기이다. 많은 Producer/Consumer 가 동시에 연결을 시도하는 환경에서는 이 값을 높여야 연결 거부(connection refused)를 방지할 수 있다.

### Monitoring Key Metrics

핵심 모니터링 메트릭은 다음과 같다. 이 메트릭들은 JMX 를 통해 수집하며, Prometheus + Grafana 또는 Datadog 등의 모니터링 시스템과 연동하는 것이 일반적이다.

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Consumer Lag | 마지막 produced offset - 마지막 consumed offset | > 10,000 (서비스에 따라 조정) |
| Under-replicated Partitions | ISR 수 < replication factor 인 파티션 | > 0 |
| ISR Shrink Rate | ISR 에서 제거되는 빈도 | > 0/min 지속 |
| Request Handler Idle Ratio | I/O Thread 유휴 비율 | < 0.3 (70% 이상 사용 시 위험) |
| Network Processor Idle Ratio | Network Thread 유휴 비율 | < 0.3 |
| Produce/Fetch Latency (p99) | 요청 처리 지연시간 | 서비스 SLA 에 따라 |
| Log Flush Latency | fsync 지연시간 | > 100ms |
| Disk Utilization | 디스크 사용률 | > 70% |

각 메트릭의 의미를 구체적으로 설명한다.

**Consumer Lag** 는 가장 중요한 메트릭이다. Producer 가 쓴 최신 offset 과 Consumer 가 마지막으로 읽은 offset 의 차이로, Consumer 의 처리 속도가 생산 속도를 따라가지 못하면 이 값이 증가한다. Lag 가 지속적으로 증가하면 Consumer 가 점점 오래된 데이터를 읽게 되어 실시간성이 떨어진다. 심각한 경우 Consumer 가 이미 삭제된 segment 의 offset 을 읽으려 하면 `OffsetOutOfRangeException` 이 발생한다. `kafka-consumer-groups.sh --describe` 명령이나 ***Burrow*** 같은 도구로 Lag 를 모니터링한다.

**Under-replicated Partitions** 이 0보다 크면 일부 Partition 의 복제가 정상적으로 이루어지지 않는 것이다. Broker 장애, 네트워크 문제, 디스크 I/O 병목 등이 원인일 수 있다. 이 상태에서 Leader Broker 가 추가로 장애가 발생하면 데이터 유실 가능성이 있다.

**ISR Shrink Rate** 가 지속적으로 0 이상이면 Follower 가 Leader 의 복제를 따라잡지 못하여 ISR 에서 제거되고 있는 것이다. `replica.lag.time.max.ms`(기본 30초) 동안 Follower 가 Leader 에게 Fetch 를 하지 않거나, Fetch 해도 Leader 의 Log End Offset 을 따라잡지 못하면 ISR 에서 제거된다. 원인으로는 네트워크 대역폭 부족, Follower 의 디스크 I/O 병목, GC pause 등이 있다.

**Request Handler Idle Ratio** 와 **Network Processor Idle Ratio** 는 각각 I/O Thread 와 Network Thread 의 유휴 비율이다. 이 값이 0.3 미만이면 해당 Thread Pool 이 70% 이상 사용 중인 것으로, 포화 상태에 가까워지고 있다. 이 경우 `num.io.threads` 또는 `num.network.threads` 를 늘리거나, Broker 를 수평 확장해야 한다.

### Kafka on Kubernetes Considerations

Kafka 를 Kubernetes 환경에서 운영할 때는 stateful 워크로드 특성을 고려한 설계가 필수적이다.

***StatefulSet*** 사용이 필수이다. Kafka Broker 는 stateful 프로세스로, 각 Broker 는 고유한 `broker.id` 와 로컬 디스크에 저장된 Log Segment 를 가진다. StatefulSet 은 Pod 에 안정적인 네트워크 ID(예: `kafka-0`, `kafka-1`)와 순서 보장된 배포/삭제를 제공한다. Deployment 는 stateless 워크로드를 위한 것이므로 Kafka 에 적합하지 않다.

***PersistentVolume*** 사용이 필수이다. Local SSD 또는 AWS EBS io2/gp3 를 사용하는 PersistentVolumeClaim 을 설정해야 한다. `emptyDir` 는 Pod 이 재스케줄링될 때 데이터가 삭제되므로 절대 사용해서는 안 된다. Local PV 를 사용하면 네트워크 I/O 오버헤드가 없어 성능이 좋지만, Node 장애 시 데이터 복구에 의존해야 한다. EBS 같은 네트워크 스토리지는 Node 간 이동이 가능하지만 latency 가 더 높다. Kafka 의 replication 이 내장된 데이터 복구 메커니즘을 제공하므로, 성능을 위해 Local SSD 를 선택하는 것이 일반적이다.

Pod Anti-Affinity 설정으로 Broker Pod 이 같은 Kubernetes Node 에 배치되지 않도록 해야 한다. 같은 Node 에 여러 Broker 가 있으면 Node 장애 시 여러 Broker 가 동시에 다운되어 데이터 유실 위험이 높아진다.

Readiness Probe 는 Broker 가 트래픽을 받을 준비가 되었는지 확인한다. Kafka Broker 는 시작 후 ISR 복원, Log Recovery 등의 과정이 필요하므로, 단순 TCP 연결 체크가 아닌 Kafka API 레벨의 health check 를 구현해야 한다. Liveness Probe 는 Broker 프로세스가 정상 동작 중인지 확인하지만, 너무 공격적으로 설정하면 GC pause 중에 Pod 이 재시작되는 문제가 발생할 수 있다.

Resource Request 와 Limit 을 반드시 명시해야 한다. CPU Limit 은 설정하지 않거나 넉넉하게 설정하는 것이 권장된다. CPU throttling 이 발생하면 Broker 응답 시간이 급격히 증가하고, 이는 ISR Shrink, Consumer Rebalance 등의 연쇄 문제를 일으킨다. Memory Limit 은 JVM Heap + Non-Heap + Page Cache 를 고려하여 충분히 설정한다.

Graceful Shutdown 을 위해 `terminationGracePeriodSeconds` 를 최소 120초 이상으로 설정해야 한다. Broker 종료 시 Controlled Shutdown 과정에서 Leader Partition 의 리더십 이전, 진행 중인 요청 처리 완료 등이 필요하다. 이 시간이 부족하면 강제 종료(SIGKILL)되어 불필요한 Leader Election 과 Log Recovery 가 발생한다.

***Headless Service*** (`clusterIP: None`) 가 StatefulSet 과 함께 필수적으로 생성되어야 한다. 이를 통해 각 Broker Pod 이 안정적인 DNS 이름 (예: `kafka-0.kafka-headless.default.svc.cluster.local`) 을 갖게 되며, `advertised.listeners` 설정에 이 DNS 이름을 사용한다.

***Strimzi*** 또는 ***Confluent Operator*** 같은 Kubernetes Operator 사용을 권장한다. 이 Operator 들은 Broker 설정 변경 시 Rolling Update, Topic 관리, User 인증, 모니터링 통합 등을 자동화한다. 수동으로 StatefulSet 을 관리하는 것보다 운영 부담이 크게 줄어든다.

## Message Delivery Semantics

### Delivery Guarantees

메시지 전달 보장 수준은 분산 시스템 설계의 핵심 개념이다. Kafka 는 세 가지 전달 보장 수준을 제공한다.

| Guarantee | Description | Data Loss | Duplication |
|-----------|-------------|-----------|-------------|
| ***At-most-once*** | 메시지를 최대 1번 전달 | 가능 | 없음 |
| ***At-least-once*** | 메시지를 최소 1번 전달 | 없음 | 가능 |
| ***Exactly-once*** | 메시지를 정확히 1번 전달 | 없음 | 없음 |

**At-most-once** 는 Producer 가 메시지를 보낸 후 ACK 를 기다리지 않거나(acks=0), Consumer 가 메시지를 읽은 직후 offset 을 commit 하고 처리하는 방식이다. 메시지 처리 중 Consumer 가 crash 하면 이미 commit 된 offset 이후부터 다시 읽으므로 해당 메시지는 유실된다. 로그 수집, 메트릭 전송 등 일부 유실이 허용되는 시나리오에서 사용된다.

**At-least-once** 는 Producer 가 ACK 를 받지 못하면 재전송하고(retries > 0), Consumer 가 메시지를 처리한 후 offset 을 commit 하는 방식이다. 네트워크 문제로 ACK 가 유실되면 이미 저장된 메시지를 Producer 가 다시 보내므로 중복이 발생할 수 있다. Consumer 가 메시지를 처리한 후 commit 전에 crash 하면, 재시작 시 이전 offset 부터 다시 읽어 중복 처리가 발생한다. 대부분의 시스템에서 기본적으로 사용되는 수준이다.

**Exactly-once** 는 Kafka 0.11(KIP-98)에서 도입된 기능으로, Idempotent Producer 와 Kafka Transactions 의 조합으로 구현된다. 이론적으로 분산 시스템에서 exactly-once 는 불가능하다는 것이 통설이지만, Kafka 는 scope 를 제한(Kafka 내부의 read-process-write 패턴)하여 실질적인 exactly-once 를 구현했다.

### Idempotent Producer Internals

Idempotent Producer 의 PID, Sequence Number, Epoch 메커니즘은 Producer Internals 섹션에서 상세히 설명했다. 여기서는 Broker 측 중복 감지 흐름을 보충한다.

```
Producer (PID=1)                  Broker (Partition 0)
     |                                  |
     |  send(seq=0) ---- batch 1 -----> |  last_seq = -1
     |                                  |  0 == last_seq + 1 → 저장, last_seq = 0
     |  <--------- ACK (success) ------ |
     |                                  |
     |  send(seq=1) ---- batch 2 -----> |  last_seq = 0
     |                                  |  1 == last_seq + 1 → 저장, last_seq = 1
     |  <--------- ACK (lost!) ----X    |
     |                                  |
     |  send(seq=1) ---- retry -------> |  last_seq = 1
     |                                  |  1 == last_seq → 중복! ACK 반환, 저장 안 함
     |  <--------- ACK (success) ------ |
     |                                  |
     |  send(seq=3) ---- batch 4 -----> |  last_seq = 1
     |                                  |  3 != last_seq + 1 → OutOfOrderSequenceException
```

Broker 측 동작을 정리하면:
- 기대 sequence = `last_committed_sequence + 1`
- 수신된 sequence 가 기대 sequence 와 일치하면: 정상 → 메시지 저장, `last_committed_sequence` 업데이트
- 수신된 sequence 가 `last_committed_sequence` 와 같으면: 중복으로 판단 → ACK 반환하지만 저장하지 않음
- 수신된 sequence 에 gap 이 있으면: `OutOfOrderSequenceException` → Producer 가 재시도 또는 에러 처리

이 메커니즘은 Partition 수준에서만 동작한다는 점에 주의해야 한다. 서로 다른 Partition 간에는 idempotency 가 보장되지 않는다. 또한 비-트랜잭션 Idempotent Producer 가 재시작되면 새로운 PID 가 할당되므로, 재시작 전후의 중복은 감지하지 못한다.

### Kafka Transactions

Kafka Transactions 의 Transaction Coordinator, 2-Phase Commit 프로토콜, Zombie Fencing 등의 상세 동작은 Producer Internals 섹션에서 설명했다. 여기서는 트랜잭션 상태 머신과 Consumer 측 동작을 보충한다.

***Transaction Log***: 트랜잭션의 상태 전이를 기록하는 compacted topic 이다. 각 트랜잭션은 다음과 같은 상태 머신을 따른다:

```
+-------+     +--------+     +---------------+     +----------------+
| Empty | --> |Ongoing | --> | PrepareCommit | --> | CompleteCommit |
+-------+     +--------+     +---------------+     +----------------+
                  |
                  |           +---------------+     +----------------+
                  +---------> | PrepareAbort  | --> | CompleteAbort  |
                              +---------------+     +----------------+
```

트랜잭션 흐름의 각 단계(FindCoordinator → InitPID → beginTransaction → send → sendOffsetsToTransaction → commitTransaction)는 Producer Internals 섹션에서 상세히 설명했다.

***isolation.level*** (Consumer 설정)은 트랜잭션 메시지의 가시성을 제어한다:
- `read_uncommitted` (기본값): 트랜잭션 미완료(아직 COMMIT/ABORT marker 가 없는) 메시지도 읽는다. 트랜잭션을 사용하지 않는 환경과 동일하게 동작한다.
- `read_committed`: COMMIT marker 가 있는 트랜잭션의 메시지만 읽는다. 진행 중인 트랜잭션의 메시지는 건너뛴다. 이때 Consumer 는 ***LSO(Last Stable Offset)*** 까지만 메시지를 반환한다. LSO 는 "열려 있는 트랜잭션의 첫 번째 offset - 1" 로 정의된다.

```
Partition Log:
  offset 0: msg-a (committed)
  offset 1: msg-b (txn-1, ongoing)    ← LSO 는 여기서 멈춤
  offset 2: msg-c (committed)
  offset 3: msg-d (txn-1, ongoing)
  offset 4: msg-e (committed)

read_uncommitted Consumer: 0, 1, 2, 3, 4 모두 읽음
read_committed Consumer:   0 만 읽음 (LSO = 0)
  → txn-1 이 commit 되면: 0, 1, 2, 3, 4 읽음
  → txn-1 이 abort 되면:  0, 2, 4 읽음 (1, 3 은 건너뜀)
```

### Exactly-once in Practice

Exactly-once semantics 의 적용 범위와 한계를 명확히 이해해야 한다.

**Kafka-to-Kafka (완전한 EOS)**: Transactional Producer 와 Consumer `isolation.level=read_committed` 의 조합으로 완전한 exactly-once 가 가능하다. 이 패턴은 Kafka Streams 의 기본 동작 방식이다. Consumer 가 메시지를 읽고, 가공한 결과를 다른 Topic 에 produce 하면서, Consumer offset commit 과 produce 를 하나의 트랜잭션으로 묶는다. 트랜잭션이 실패하면 모든 것이 롤백되므로 중복이나 유실이 없다.

```
+----------+     +-----------+     +-----------+     +----------+
| Input    | --> | Consumer  | --> | Process   | --> | Output   |
| Topic    |     | (read_    |     | Logic     |     | Topic    |
|          |     | committed)|     |           |     |          |
+----------+     +-----------+     +-----------+     +----------+
                      |                                    |
                      +-------- Transaction ---------------+
                      |  consume offset + produce output   |
                      +------------------------------------+
```

**Kafka-to-External (Idempotent Consumer 필요)**: 외부 시스템(DB, API, 파일 등)에 대해서는 Kafka Transaction 이 보장하는 범위 밖이다. Kafka 트랜잭션은 Kafka 내부의 offset commit 과 produce 만 atomic 하게 묶을 수 있으며, 외부 시스템의 상태 변경까지 트랜잭션으로 묶을 수는 없다. 따라서 외부 시스템에 exactly-once 를 구현하려면 ***Idempotent Consumer*** 패턴이 필요하다.

**방법 1: Message ID 기반 중복 체크 (Redis/DB)**: 각 메시지에 고유한 ID 를 부여하고, Consumer 가 메시지를 처리하기 전에 이 ID 가 이미 처리되었는지 확인한다. 처리된 ID 를 Redis 의 Set 이나 DB 테이블에 저장하여 중복을 감지한다. 이 방식은 구현이 간단하지만, ID 저장소에 대한 추가적인 I/O 가 발생하고, ID 저장소의 TTL 관리가 필요하다.

```
Consumer 처리 흐름:
  1. poll() → messages 수신
  2. for each message:
     a. message.id 가 Redis 에 존재하는지 확인
     b. 존재하면 → skip (중복)
     c. 존재하지 않으면 → 비즈니스 로직 처리 → Redis 에 message.id 저장
  3. commitSync()
```

**방법 2: Outbox Pattern**: 비즈니스 로직 수행과 이벤트 발행을 동일한 DB 트랜잭션으로 묶는 패턴이다. 비즈니스 테이블과 Outbox 테이블에 대한 write 를 하나의 DB 트랜잭션으로 수행하고, 별도의 프로세스(CDC 또는 Polling)가 Outbox 테이블에서 이벤트를 읽어 Kafka 에 produce 한다. DB 트랜잭션이 rollback 되면 Outbox 레코드도 함께 rollback 되므로, 비즈니스 로직과 이벤트 발행의 일관성이 보장된다.

**방법 3: DB Transaction + Offset Commit 동기화**: Consumer 가 메시지를 처리한 결과를 DB 에 저장할 때, offset 정보도 같은 DB 트랜잭션에 함께 저장하는 방식이다. Consumer 재시작 시 Kafka 가 아닌 DB 에서 마지막으로 처리한 offset 을 읽어 `seek()` 로 해당 위치부터 다시 소비한다. 이 방식은 offset 관리를 Kafka 의 `__consumer_offsets` 가 아닌 외부 DB 에서 하므로, DB 트랜잭션의 ACID 특성으로 exactly-once 를 보장할 수 있다.

```
Consumer 처리 흐름:
  1. DB 에서 마지막 처리 offset 조회
  2. consumer.seek(partition, last_offset + 1)
  3. poll() → messages 수신
  4. BEGIN DB TRANSACTION
     a. 비즈니스 로직 처리 결과 저장
     b. offset 정보 저장 (consumer_offsets 테이블)
  5. COMMIT DB TRANSACTION
  6. 다음 poll() (Kafka 에 offset commit 하지 않음)
```

이 세 가지 방법 모두 trade-off 가 있으며, 시스템의 요구사항에 따라 적절한 방법을 선택해야 한다. Message ID 기반 방법은 가장 범용적이고, Outbox Pattern 은 이벤트 소싱 아키텍처와 잘 어울리며, DB Transaction 동기화 방법은 DB 중심의 아키텍처에서 효과적이다.

## Links

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Kafka Documentation](https://docs.confluent.io/platform/current/kafka/kafka-basics.html)
- [KIP-98: Exactly Once Delivery and Transactional Messaging](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)
- [KIP-429: Kafka Consumer Incremental Rebalance Protocol](https://cwiki.apache.org/confluence/display/KAFKA/KIP-429%3A+Kafka+Consumer+Incremental+Rebalance+Protocol)
- [KIP-500: Replace ZooKeeper with a Self-Managed Metadata Quorum](https://cwiki.apache.org/confluence/display/KAFKA/KIP-500%3A+Replace+ZooKeeper+with+a+Self-Managed+Metadata+Quorum)

## References

- Kafka: The Definitive Guide / Neha Narkhede, Gwen Shapira, Todd Palino / O'Reilly
- Designing Data-Intensive Applications / Martin Kleppmann / O'Reilly
- [KIP-848: The Next Generation of the Consumer Rebalance Protocol](https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol)
- [Confluent Blog - Kafka Internals](https://www.confluent.io/blog/)
