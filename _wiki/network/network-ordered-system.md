---
layout  : wiki
title   : Never Trust the Network Designing Ordered Systems
summary :
date    : 2026-02-24 11:54:32 +0900
updated : 2026-02-24 22:15:24 +0900
tag     : network architecture http tcp idempotency distributed
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
favorite: true
---
* TOC
{:toc}

# Never Trust the Network: Designing Ordered Systems

***"네트워크를 믿지 마라."*** 이 문장은 분산 시스템 설계의 첫 번째 원칙이다. TCP는 바이트 스트림의 순서를 보장한다. 하지만 현실의 시스템에서는 재연결, 재시도, 비동기 처리, 로드 밸런싱, 셀룰러 핸드오버 등 수많은 이유로 ***"요청의 의미상 순서"*** 가 역전된다.

이 글은 TCP가 실제로 보장하는 범위를 정확히 규정한 뒤, 순서 역전이 발생하는 실무 시나리오를 분석하고, 이를 해결하기 위한 애플리케이션 레벨 설계 패턴을 다룬다. 차량 제어, 금융 트랜잭션, 분산 시스템 이론까지 단계적으로 확장하여, **순서 보장이 필요한 시스템을 어떻게 설계해야 하는지** 구체적으로 살펴본다.

## TCP Byte-Stream Ordering: Exact Scope

### What TCP Guarantees

***[TCP(Transmission Control Protocol)](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)*** 는 [RFC 793](https://datatracker.ietf.org/doc/html/rfc793)에서 최초 정의되었으며, 현행 표준은 [RFC 9293](https://datatracker.ietf.org/doc/html/rfc9293)이다. TCP는 32-bit Sequence Number를 사용하여 바이트 스트림의 순서를 보장한다. 송신 측은 전송하는 각 바이트에 시퀀스 번호를 부여하고, 수신 측은 이 번호를 기반으로 수신 버퍼에서 재조립(reordering)을 수행한 뒤 애플리케이션에 전달한다.

IP 계층에서 패킷이 뒤죽박죽으로 도착하더라도, TCP의 수신 버퍼가 시퀀스 번호 순서대로 재정렬하여 `recv()`/`read()` 호출 시점에는 **전송 순서 그대로** 애플리케이션에 넘긴다.

핵심은 이것이다. **하나의 TCP 연결(single connection) 안에서, 바이트는 전송 순서대로 애플리케이션에 전달된다.**

### What TCP Does NOT Guarantee

TCP가 보장하지 않는 것을 명확히 구분해야 한다.

- **서로 다른 TCP 연결 간의 순서**: 연결 A에서 보낸 데이터와 연결 B에서 보낸 데이터 사이에 순서 관계는 없다
- **요청 단위(Request-level) 순서**: TCP는 바이트 스트림을 다룰 뿐, "요청"이라는 애플리케이션 개념을 모른다
- **응답 완료 순서**: 서버가 요청 A를 먼저 받았더라도 요청 B를 먼저 처리 완료할 수 있다
- **서버 처리 순서**: 게이트웨이가 순서대로 전달하더라도 내부 워커의 처리 완료 순서는 다를 수 있다

### What Network Never Guarantees

네트워크가 절대 보장하지 않는 세 가지를 명확히 인식해야 한다.

- **Exactly-once delivery**: 네트워크 분할, 재전송, 중복 수신이 발생할 수 있다. 분산 환경에서 "정확히 한 번 전달"은 네트워크 계층만으로 보장할 수 없다
- **End-to-end ordering**: TCP는 단일 연결 내 바이트 순서만 보장한다. 여러 연결, 여러 노드를 거치는 end-to-end 경로에서의 요청 순서는 보장되지 않는다
- **Processing order**: 요청이 도착한 순서와 서버가 처리를 완료하는 순서는 별개이다. 비동기 처리, 워커 풀, 락 경합 등으로 처리 순서가 달라진다

### Network Layer Diagram

```
Application   : reads byte stream in order     <- TCP guarantees this

TCP Layer     : reorders segments using seq#,
                retransmits lost segments       <- reordering happens here

IP Layer      : best-effort delivery,
                packets CAN arrive out of order,
                duplicated, or lost             <- no ordering guarantee

Physical      : bits on wire, radio waves       <- raw signal
```

<mark><em><strong>TCP가 보장하는 것은 바이트 스트림(byte-stream)의 순서이다. 세그먼트의 순서가 아니고, 요청의 순서가 아니고, 처리의 순서가 아니다.</strong></em></mark>

"TCP니까 순서 괜찮겠지"라는 생각은 위험 신호이다. TCP는 바이트를 순서대로 전달할 뿐, 그 바이트가 의미하는 "요청"이나 "명령"의 논리적 순서까지 보장하지 않는다.

## HTTP/1.1 vs HTTP/2 Request-Response Ordering

### HTTP/1.1 with Keep-Alive

HTTP/1.1의 keep-alive는 TCP 연결을 재사용하여 핸드셰이크 비용을 절약한다. 하지만 한 연결에서 동시에 하나의 요청-응답 쌍만 처리할 수 있다(pipelining을 사용하지 않는 경우).

***[HTTP Pipelining](https://en.wikipedia.org/wiki/HTTP_pipelining)*** 은 [RFC 7230](https://datatracker.ietf.org/doc/html/rfc7230)에서 정의되었으며, 현행 표준은 [RFC 9112](https://datatracker.ietf.org/doc/html/rfc9112)이다. 응답을 기다리지 않고 여러 요청을 연속으로 보내는 기법이지만, 응답은 반드시 요청 순서대로 반환해야 한다. 첫 번째 요청의 응답이 느리면 뒤따르는 모든 응답이 대기하게 되는 ***Head-of-Line(HoL) Blocking*** 이 발생한다. 이 문제 때문에 대부분의 브라우저와 클라이언트는 pipelining을 비활성화한다.

keep-alive 환경에서도 **재연결이 발생하면** 서로 다른 TCP 연결이 되므로, 이전 연결의 요청과 새 연결의 요청 사이에 순서 보장은 사라진다.

### HTTP/2 Multiplexing

***[HTTP/2](https://klarciel.net/wiki/network/network-binary-based-protocol/)*** ([RFC 9113](https://datatracker.ietf.org/doc/html/rfc9113))는 하나의 TCP 연결 위에 여러 개의 ***Stream*** 을 동시에 운용한다. 각 스트림은 하나의 요청-응답 쌍에 대응하며, 스트림들은 와이어 위에서 인터리브(interleave)되어 전송된다.

이 구조의 핵심적인 의미는 다음과 같다.

- 서버는 Stream 5를 Stream 3보다 먼저 완료할 수 있다
- **요청 생성 순서 != 서버 처리 순서 != 응답 도착 순서**
- 스트림 우선순위(priority/weight)는 advisory에 불과하며, 서버가 반드시 따를 의무는 없다

HTTP/2가 Application-level HoL blocking을 해결한 대신, 하나의 TCP 연결을 여러 스트림이 공유하므로 **TCP-level HoL blocking** 이 발생한다. TCP 패킷이 하나라도 유실되면 해당 패킷의 재전송이 완료될 때까지 모든 스트림의 데이터 전달이 지연된다. 이것이 HTTP/3(QUIC)가 TCP 대신 UDP 위에서 독립적인 스트림별 재전송을 구현한 주요 동기이다.

### Comparison Table

| Aspect | HTTP/1.1 (keep-alive) | HTTP/2 |
|--------|----------------------|--------|
| Requests per connection | 1 at a time (serial) | Multiple (multiplexed) |
| Response order | Same as request order | Any order |
| Head-of-line blocking | Application level | TCP level (packet loss blocks all streams) |
| Connection count | Multiple connections for concurrency | Single connection |
| Ordering guarantee | Within single connection, sequential | No ordering across streams |

결론적으로, HTTP/1.1이든 HTTP/2이든 **네트워크 프로토콜 수준에서 요청의 의미상 순서를 보장받을 수 없다**. 금융 시스템이 "요청 전송 순서를 믿지 않고 요청에 seq/nonce를 반드시 포함"하는 이유가 바로 이것이다.

## Five Scenarios of Apparent Order Reversal

IVI(In-Vehicle Infotainment) -> GW(Gateway) -> Cloud 흐름에서 REST API를 호출하는 과정을 기준으로, TCP를 사용함에도 순서가 역전되어 보이는 대표적인 시나리오 5가지를 살펴본다.

```
IVI (Vehicle)           Gateway              Cloud Server
     |                    |                       |
     |--- Request A ----->|--- Forward A -------->|
     |   (conn drops)     |                       |
     |--- Request B ----->|--- Forward B -------->|  <- B arrives first
     |   (new conn)       |                       |
     |                    |                       |  Processing: B -> A
```

### Scenario A: Different TCP Connections (Reconnection / Connection Pool)

__Scenario A-1: 재연결(Reconnection)과 논리적 역전__

IVI가 요청 A를 보낸 뒤 서버 ACK를 받기 전에 연결이 끊어진다. IVI는 재연결 후 새 커넥션으로 요청 B를 보낸다. B는 새 커넥션으로 빠르게 도착하고, A는 재전송되거나 서버에 도착하지 못한다. 서버 입장에서 처리 순서는 B -> A가 된다.

이 과정을 시퀀스로 표현하면:

```
IVI                         Network                        Server
 |                            |                              |
 |-- [A] send (seq=41) ------>|                              |
 |                            |--- [A] forwarding ---------->| (not yet delivered)
 |    ** connection drops **  |                              |
 |                            |  [A] lost in transit         |
 |-- [reconnect] ----------->|                              |
 |-- [B] send (seq=42) ------>|--- [B] delivered ---------->| B processed first
 |                            |                              |
 |-- [A'] retry (seq=41) ---->|--- [A'] delivered ---------->| A processed second
 |                            |                              |
 |                            |                              | Result: B -> A (논리적 역전)
```

이것이 ***논리적 역전(Logical Reversal)*** 이다. TCP 레벨에서는 아무런 오류가 없다. 각각의 TCP 연결은 자신의 바이트 스트림을 정확히 전달했다. 하지만 서로 다른 연결에 걸쳐 있는 요청 A와 B 사이에는 TCP가 순서를 보장하지 않으므로, 애플리케이션의 의도와 다른 순서로 처리된다.

__Scenario A-2: 커넥션 풀(Connection Pool)__

커넥션 풀을 사용하는 환경에서 요청 A는 conn1(느린 경로)으로, 요청 B는 conn2(빠른 경로)로 전송된다. B가 먼저 처리 완료되어 상태가 역전된다.

### Scenario B: Timeout and Retry (Duplicate Transmission)

__Scenario B__:

IVI가 요청 A를 전송하지만 응답이 늦어 타임아웃이 발생한다. IVI는 A를 재시도(A')하고, 그 사이에 요청 B도 전송한다. 서버 입장에서:

1. B가 먼저 커밋된다
2. 나중에 A 또는 A'가 도착하여 적용되면 **상태가 "역행"** 한다

이 시나리오는 순서 역전뿐 아니라 **중복 처리** 문제도 동시에 발생시킨다. Idempotency Key 없이 재시도하면 동일 요청이 두 번 적용될 수 있다.

### Scenario C: Async Processing at Gateway/Server

__Scenario C__:

게이트웨이가 요청 A, B를 순서대로 수신하더라도, 내부에서 비동기 처리(fan-out, task queue, thread pool)가 발생하면 처리 완료 순서가 달라진다.

```
GW receives:  A (t=0)  ->  B (t=1)
Worker Pool:  Worker1 picks A  |  Worker2 picks B
Processing:   A takes 500ms    |  B takes 100ms
Commit order: B (t=101ms)  ->  A (t=500ms)
```

"도착 순서"가 아니라 **완료/커밋 순서** 가 바뀌는 것이다. 이것은 네트워크 문제가 아니라 서버 아키텍처의 본질적 특성이다.

### Scenario D: Load Balancing / Multi-Instance

__Scenario D__:

게이트웨이 뒤에 여러 서버 인스턴스가 있고 세션 고정(session affinity)이 없는 경우:

- 요청 A -> Instance 1 (느린 인스턴스, GC 발생)
- 요청 B -> Instance 2 (빠른 인스턴스)
- 결과: B가 먼저 반영된다

### Scenario E: NAT/Cellular Handover

__Scenario E__:

셀룰러 환경에서 기지국 핸드오버가 발생하면:

1. 기존 연결이 터널 변경 과정에서 "반쯤 살았다가 죽는다"
2. 새 연결로 요청이 다시 나간다
3. 기존 경로의 미처리 요청과 새 경로의 요청이 뒤섞인다

<mark><em><strong>같은 TCP 연결의 바이트 순서는 TCP가 보장한다. 하지만 재연결, 재시도, HTTP/2, 비동기 처리, 로드 밸런싱 때문에 "요청이 역전된 것처럼" 발생하는 것은 현실에서 흔한 일이다.</strong></em></mark>

### What Breaks When Order Fails

순서 역전은 단순한 기술적 문제가 아니라 도메인 차원의 피해로 이어진다.

**금융 도메인**:
- **이중 출금(Double Withdrawal)**: 출금 요청 A(seq=41)와 출금 요청 B(seq=42)가 역전되어, B가 먼저 처리되고 A가 나중에 처리되면 잔액 검증이 무효화될 수 있다
- **잔액 역행(Balance Regression)**: 잔액 100 -> 출금 30 -> 잔액 70이 정상인데, 순서가 뒤바뀌면 잔액이 100으로 되돌아가는 것처럼 보일 수 있다
- **원장 불일치(Ledger Inconsistency)**: 이벤트 순서가 뒤바뀌면 원장의 시퀀스 무결성이 깨진다

**차량 제어 도메인**:
- **Unlock/Lock 역전**: Unlock -> Lock 순서로 명령을 보냈는데 Lock이 먼저 실행되고 Unlock이 나중에 실행되면, 차량이 잠기지 않은 상태로 남는다
- **Preconditioning 순서 역전**: 공조 ON -> 공조 설정 변경 순서가 뒤바뀌면, 설정 변경이 적용되지 않거나 의도하지 않은 설정으로 동작할 수 있다

## Application-Level Ordering Patterns

네트워크 레벨에서 순서를 믿을 수 없으므로, 애플리케이션 레벨에서 순서를 "프로토콜로 만들어야" 한다.

### Monotonic Sequence Number

엔티티(vehicleId, accountId) 단위로 단조 증가하는 시퀀스 번호를 부여하는 방식이다. 순서를 보장해야 하는 단위(ordering unit)가 무엇인지 먼저 결정해야 한다. global ordering이 아니라 **entity-level ordering**이 핵심이다. 사용자 단위, 계정 단위, 차량 단위, 세션 단위 중 도메인에 적합한 단위를 선택한다.

- 요청마다 seq를 증가시켜 전송한다
- 서버는 엔티티별로 expectedSeq를 관리한다

```
seq == expectedSeq      -> process, increment expectedSeq
seq <  expectedSeq      -> duplicate/stale, drop or return cached result
seq >  expectedSeq      -> out-of-order, reject with 409 or 425
```

### Out-of-Order Request Handling Strategies

out-of-order 요청을 받았을 때의 처리 전략은 네 가지가 있다.

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Reject** | 즉시 거부(409/425)하고 클라이언트가 재동기화 | 차량 제어, 금융 -- 대부분의 시스템이 선택 |
| **Hold** | 보류 큐에 넣고, 앞선 seq가 도착하면 순서대로 처리 | 메시지 시스템 -- 복잡도가 크게 증가 |
| **Reorder** | 서버가 수신한 요청을 정렬하여 순서대로 실행 | 배치 처리 -- 실시간 시스템에는 부적합 |
| **Idempotent Merge** | 순서 무관하게 결과가 동일하도록 연산 설계 (CRDT 등) | 상태 동기화 -- 모든 연산이 교환 가능해야 한다 |

대부분의 시스템은 **Reject** 후 클라이언트 재동기화 전략을 선택한다. 보류 큐를 운영하면 복잡도가 폭증하고, 메모리 관리, 타임아웃, 큐 가득 참 등의 부가 문제가 발생하기 때문이다.

### Idempotency Key

***[Idempotency](https://en.wikipedia.org/wiki/Idempotence)*** Key는 클라이언트가 논리적 연산마다 고유한 키(UUID 또는 UUID + body hash)를 생성하여 요청에 포함하는 방식이다.

- 서버는 `key -> result` 매핑을 저장한다 (dedup store)
- 동일 키로 중복 요청이 들어오면 캐시된 결과를 반환한다
- "이중 이체" 같은 사고를 원천 차단한다

**중요한 구분**: Idempotency Key는 **중복 처리를 방지**하는 것이지, **순서를 강제**하는 것이 아니다. Idempotency Key만으로는 요청 A와 B의 처리 순서를 보장할 수 없다. 순서가 필요하면 반드시 seq와 함께 사용해야 한다.

### Version-Based Optimistic Concurrency Control

***[Optimistic Concurrency Control(OCC)](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)*** 은 `If-Match: <etag>` 또는 version 필드를 사용하여 조건부 업데이트를 수행한다.

```
Client: "현재 상태가 version=10일 때만 version=11로 변경하라"
Server: version != expected -> 409 Conflict
Client: re-read, retry with new version
```

상태 기반 업데이트(프로필, 설정 등)에는 자연스러운 방식이다. 하지만 "A 다음에 B가 반드시 실행되어야 하는" 명령형 흐름에는 seq가 더 직관적이다.

OCC만으로 충분한가? 충돌 빈도가 낮은 환경에서는 OCC가 효과적이지만, 동일 엔티티에 대한 동시 쓰기가 빈번한 환경에서는 retry loop가 많아져 처리량이 급감한다. 이 경우 Single-Writer Model이나 Pessimistic Lock(SELECT FOR UPDATE)이 더 적합하다.

### Practical Combination

실무에서는 이 세 가지를 도메인 특성에 맞게 조합한다.

| Domain | Pattern | Rationale |
|--------|---------|-----------|
| Vehicle Control (imperative) | seq + idempotency + TTL | 명령 순서가 중요하고, 만료 시간이 필요하다 |
| State Sync (profile, settings) | version/etag + idempotency | 최종 상태만 중요하고, 중간 과정은 무관하다 |
| Financial Transaction | accountSeq + idempotency + ledger append | 순서, 중복 방지, 감사 추적이 모두 필요하다 |

## Designing Idempotency with Order Guarantee

### Idempotency Alone Does Not Guarantee Order

많은 엔지니어가 혼동하는 지점이 있다. Idempotency Key를 도입하면 순서도 보장된다고 착각하는 것이다.

Idempotency Key의 역할은 명확하다. **"같은 요청이 두 번 들어왔을 때, 두 번째는 무시하고 첫 번째 결과를 반환한다."** 이것은 중복 방지(deduplication)이지, 순서 강제(ordering)가 아니다.

예를 들어:

1. 클라이언트가 요청 A(key=aaa), 요청 B(key=bbb)를 순서대로 보낸다
2. 네트워크 이유로 B가 먼저 도착하여 처리된다
3. A가 나중에 도착하여 처리된다
4. Idempotency Key는 이 상황을 전혀 감지하지 못한다 -- 각각 다른 키이기 때문이다

### Retry Breaks Ordering

재시도(retry)는 순서를 깨는 대표적인 원인이다. 구체적인 메커니즘을 살펴보자.

__Scenario: Exponential Backoff with Interleaved Requests__

```
t=0     Client sends A (seq=41)
t=100ms No response for A -> timeout
t=200ms Client retries A' (seq=41) with exponential backoff
t=150ms Client sends B (seq=42) -- B was queued before A' retry
```

서버 입장에서 B(seq=42)가 먼저 도착하면 expectedSeq=41이므로 OUT_OF_ORDER로 거부한다. 이것이 올바른 동작이다.

문제는 재시도 시 **새로운 idempotency key를 사용하는 경우**이다. 재시도는 반드시 **동일한 idempotency key + 동일한 seq**로 수행해야 한다. 새 키를 사용하면 서버가 원래 요청과 재시도 요청을 별개의 요청으로 인식하여 중복 처리가 발생한다.

재시도 시 순서를 보존하는 규칙:

1. 동일 idempotency key 사용 -- 중복 처리 방지
2. 동일 seq 사용 -- 순서 정합성 유지
3. 이전 요청의 결과 확인 전까지 다음 요청 보류 -- "1-in-flight" 제약

### Combining Sequence Number with Idempotency

순서가 보장되는 멱등 처리를 위해서는 **seq + idempotency key**를 결합해야 한다. 서버의 검증 흐름은 다음과 같다.

```
1. Idempotency Check   : commandId로 이미 처리된 요청인가?
   -> YES: return cached result (idempotent response)

2. TTL Check            : 요청이 만료되었는가?
   -> YES: return expired error

3. Sequence Validation  : seq == expectedSeq인가?
   -> seq < expected  : STALE (이미 처리된 과거 요청)
   -> seq > expected  : OUT_OF_ORDER (아직 처리 안 된 이전 요청이 있음)
   -> seq == expected : VALID -> process

4. Atomic Commit        : 처리 결과 저장 + seq 증가 + idempotency 캐시 (원자적)
```

<mark><em><strong>Idempotency는 "같은 요청의 중복"을 막고, Sequence Number는 "다른 요청의 순서"를 강제한다. 이 둘은 직교(orthogonal)하는 관심사이며, 반드시 함께 사용해야 완전한 보장이 가능하다.</strong></em></mark>

### Exactly-Once vs Idempotency

***Exactly-once delivery*** 는 분산 환경에서 이론적으로 보장하기 어렵다. 네트워크 분할, 프로세스 장애, 타이밍 문제 때문에 메시지가 정확히 한 번만 전달되었음을 양쪽이 동시에 확인할 수 없기 때문이다.

현실의 시스템은 ***at-least-once delivery + idempotent processing*** 조합으로 "실질적으로 exactly-once"와 동등한 효과를 달성한다.

```
at-least-once:  메시지가 최소 한 번은 전달됨 (중복 가능)
+
idempotent:     같은 메시지를 여러 번 처리해도 결과가 동일함
=
practically exactly-once:  중복 전달이 발생해도 최종 결과가 한 번 처리한 것과 같음
```

"진짜 exactly-once"가 필요한가, 아니면 멱등이면 충분한가? 대부분의 시스템에서는 at-least-once + idempotency로 충분하다. "진짜 exactly-once"를 추구하면 합의(consensus) 프로토콜이 필요해지고 처리량과 가용성이 크게 저하된다.

### Kotlin Implementation: Command Handler

아래는 seq + idempotency + TTL을 결합한 서버 측 핸들러 구현이다. Redis 클라이언트 인터페이스는 추상화하여 특정 라이브러리(Lettuce, Jedis 등)에 의존하지 않도록 한다.

```kotlin
data class VehicleCommand(
    val commandId: String,
    val vehicleId: String,
    val seq: Long,
    val action: String,
    val ttl: Int,
    val timestamp: Long,
    val nonce: String
)

enum class SeqValidation { VALID, STALE, OUT_OF_ORDER }

/**
 * Redis 연산을 추상화한 인터페이스.
 * 실제 구현에서는 Lettuce RedisCommands<String, String> 또는
 * Jedis를 사용한다.
 */
interface RedisOperations {
    fun get(key: String): String?
    fun eval(script: String, keys: List<String>, args: List<String>): Any?
}

class CommandHandler(
    private val redis: RedisOperations,
    private val processor: CommandProcessor
) {

    fun handle(cmd: VehicleCommand): CommandResponse {
        // 1. Idempotency check
        val cached = redis.get("idem:${cmd.commandId}")
        if (cached != null) return deserialize(cached)

        // 2. TTL check
        val age = System.currentTimeMillis() / 1000 - cmd.timestamp
        if (age > cmd.ttl) return CommandResponse.expired()

        // 3. Sequence validation + preemption (atomic via Lua)
        //    Lua 스크립트가 VALID를 반환하면 동시에 seq를 선점(increment)한다.
        //    이후 처리 실패 시에는 별도의 rollback Lua 스크립트로 seq를 복원한다.
        val seqResult = validateAndPreemptSeqAtomic(cmd.vehicleId, cmd.seq, cmd.commandId)
        return when (seqResult) {
            SeqValidation.STALE -> CommandResponse.rejected("stale sequence")
            SeqValidation.OUT_OF_ORDER -> CommandResponse.outOfOrder(409)
            SeqValidation.VALID -> {
                try {
                    val result = processor.execute(cmd)
                    // Store result for idempotency
                    storeResult(cmd, result)
                    result
                } catch (e: Exception) {
                    // Processing failed -> rollback seq preemption
                    rollbackSeq(cmd.vehicleId, cmd.seq)
                    throw e
                }
            }
        }
    }

    private fun validateAndPreemptSeqAtomic(
        vehicleId: String,
        seq: Long,
        commandId: String
    ): SeqValidation {
        val result = redis.eval(
            SEQ_VALIDATE_AND_PREEMPT_LUA,
            listOf("seq:$vehicleId", "idem:$commandId"),
            listOf(seq.toString())
        )
        return when (result) {
            "VALID" -> SeqValidation.VALID
            "STALE" -> SeqValidation.STALE
            else -> SeqValidation.OUT_OF_ORDER
        }
    }

    private fun rollbackSeq(vehicleId: String, seq: Long) {
        redis.eval(
            SEQ_ROLLBACK_LUA,
            listOf("seq:$vehicleId"),
            listOf(seq.toString())
        )
    }
}
```

핵심은 **seq 검증과 선점(preemption)을 원자적(atomic)으로** 수행해야 한다는 것이다. validation만 하고 seq를 증가시키지 않으면, 그 사이에 동일 seq에 대해 두 번의 VALID가 반환될 수 있는 race condition이 발생한다.

### Redis Lua Script: Atomic Validation and Preemption

Redis의 ***Lua Scripting*** 을 사용하면 여러 Redis 명령을 하나의 원자적 연산으로 묶을 수 있다. Redis는 단일 스레드로 Lua 스크립트를 실행하므로, 스크립트 실행 중 다른 명령이 끼어들 수 없다.

```lua
-- SEQ_VALIDATE_AND_PREEMPT_LUA
-- KEYS[1] = seq:{vehicleId}  (현재 엔티티의 시퀀스 번호)
-- KEYS[2] = idem:{commandId} (idempotency 캐시 키)
-- ARGV[1] = 요청의 시퀀스 번호

local currentSeq = tonumber(redis.call('GET', KEYS[1]) or '0')
local requestSeq = tonumber(ARGV[1])

-- Check if already processed (idempotency)
local existing = redis.call('GET', KEYS[2])
if existing then
    return existing  -- Return cached result
end

-- Sequence validation
if requestSeq <= currentSeq then
    return 'STALE'
end
if requestSeq ~= currentSeq + 1 then
    return 'OUT_OF_ORDER'
end

-- Preempt: increment seq atomically with validation
redis.call('SET', KEYS[1], tostring(requestSeq))
return 'VALID'
```

```lua
-- SEQ_ROLLBACK_LUA
-- KEYS[1] = seq:{vehicleId}
-- ARGV[1] = seq to rollback to (requestSeq - 1)

local currentSeq = tonumber(redis.call('GET', KEYS[1]) or '0')
local rollbackTarget = tonumber(ARGV[1])

-- Only rollback if current seq matches what we preempted
if currentSeq == rollbackTarget then
    redis.call('SET', KEYS[1], tostring(rollbackTarget - 1))
end
```

validation Lua 스크립트에서 VALID 판정 시 **seq를 즉시 증가(선점)**시키므로, 동일 seq에 대해 두 번 VALID가 반환되는 race condition이 방지된다. 처리 실패 시에는 rollback 스크립트로 seq를 복원한다.

## Server-Level Serialization

애플리케이션 레벨의 seq/idempotency 외에, 서버 아키텍처 자체에서 순서 문제를 구조적으로 제거하는 방법이 있다.

### Single-Writer Model

***Single-Writer Model*** 은 특정 엔티티에 대한 쓰기를 단일 처리 파이프라인으로 제한하는 패턴이다.

- **파티션 키 = entityId**: vehicleId, accountId 등으로 파티셔닝한다
- **파티션 당 단일 처리자**: 한 파티션에 대해 동시에 하나의 워커만 처리한다
- **순서 문제가 구조적으로 사라진다**: 동일 엔티티에 대한 동시 쓰기가 존재하지 않기 때문이다

예를 들어, Kafka에서 `partition key = vehicleId`로 설정하면, 동일 차량의 모든 커맨드는 같은 파티션에 들어가고, 하나의 컨슈머가 순서대로 처리한다.

**Trade-off**: 파티션 전략이 곧 스케일링 전략이 된다. 특정 엔티티에 트래픽이 집중되면(hot partition) 병목이 된다.

분산 락(DB row-level lock)으로 동일 엔티티의 동시 쓰기를 직렬화하는 방법도 있지만, 고 QPS 환경에서는 락 경합이 커져서 **큐 기반 Single-Writer**가 일반적으로 선호된다.

### Ledger and Event Sourcing

***[Event Sourcing](https://en.wikipedia.org/wiki/Event_sourcing)*** 은 상태를 직접 변경(UPDATE)하는 대신, 변경 이벤트를 불변(immutable) 로그에 순차적으로 기록하는 패턴이다.

```
Event Structure:
{
  ledgerSeq: 10042,         // 전체 원장의 시퀀스
  entitySeq: 187,           // 엔티티 단위 시퀀스
  idempotencyKey: "uuid-x", // 중복 방지 키
  payload: { ... }          // 이벤트 내용
}
```

현재 상태는 이벤트를 처음부터 재생(replay)하거나, 스냅샷 + 이후 이벤트 델타로 계산한다.

### State-Based Model vs Event-Based Model

잔액을 직접 UPDATE하는 **상태 기반 모델**과, 거래 이벤트를 append하는 **이벤트 기반 모델**은 근본적으로 다른 설계이다.

| Aspect | State-Based (UPDATE) | Event-Based (Append) |
|--------|---------------------|---------------------|
| 동시성 문제 | Lost Update, Write Skew 발생 가능 | Append-only이므로 덮어쓰기 없음 |
| 감사 추적 | 별도의 audit log 필요 | 이벤트 자체가 audit trail |
| 복구 | 최신 상태만 존재, 과거 복원 어려움 | 이벤트 재생으로 임의 시점 복원 가능 |
| 복잡도 | 단순 | 스냅샷 관리, 이벤트 스키마 진화 필요 |
| 순서 문제 | 명시적 락/버전 필요 | 시퀀스가 자연스럽게 내장됨 |

이벤트 기반 모델에서 **at-least-once delivery + idempotent append = practically exactly-once** 가 성립한다. 분산 환경에서 "진짜 exactly-once delivery"는 이론적으로 어렵지만, 멱등 적재를 통해 실질적으로 exactly-once와 동등한 효과를 달성할 수 있다.

## Vehicle Control: Command Ordering Design

차량 제어 도메인은 순서 보장이 특히 중요한 영역이다. 문을 잠근 뒤(Lock) 여는(Unlock) 것과, 여는 것을 먼저 하고 잠그는 것은 완전히 다른 결과를 만든다.

### Command Type: Imperative vs State-Based

차량 제어 커맨드는 두 가지 유형으로 분류된다.

| Type | Example | Ordering Requirement |
|------|---------|---------------------|
| Imperative | "문을 열어라" (UNLOCK_DOOR) | 엄격한 순서 보장 필요 |
| State-based | "문 상태를 UNLOCKED로 만들어라" | Last-Writer-Wins 가능 |

Imperative 커맨드는 실행 자체가 부수 효과(side effect)를 발생시키므로 순서가 뒤바뀌면 위험하다. State-based 커맨드는 최종 목표 상태만 중요하므로 Desired/Actual State Pattern으로 처리할 수 있다.

이 절에서는 Imperative 커맨드의 순서 보장에 초점을 맞춘다.

### Command Structure

```json
{
  "commandId": "uuid-v4",
  "vehicleId": "VIN-123",
  "seq": 42,
  "action": "UNLOCK_DOOR",
  "params": {"door": "DRIVER"},
  "ttl": 30,
  "timestamp": 1708776000,
  "nonce": "random-once",
  "hmac": "sha256-signature"
}
```

각 필드의 역할:

| Field | Purpose |
|-------|---------|
| `commandId` | Idempotency Key -- 중복 요청 감지 |
| `vehicleId` | 파티션 키 -- Single-Writer 모델의 기준 |
| `seq` | 순서 강제 -- 엔티티 단위 단조 증가 |
| `ttl` | 만료 시간 -- 오래된 명령 거부 |
| `timestamp` | 발행 시각 -- TTL 계산 + replay 방지 |
| `nonce` | 일회용 토큰 -- replay attack 방지 |
| `hmac` | 서명 -- 무결성 + 인증 |

### vehicleId Single-Writer Pipeline

vehicleId를 파티션 키로 사용하여 동일 차량의 커맨드를 단일 파이프라인으로 처리한다.

```
Command Queue (Kafka / Internal Queue)
  Partition Key = vehicleId

  [VIN-001] -> Consumer-1: seq=40, 41, 42 ... (serial processing)
  [VIN-002] -> Consumer-2: seq=10, 11, 12 ... (serial processing)
  [VIN-003] -> Consumer-1: seq=5, 6, 7 ...    (serial processing)
```

같은 차량에 대한 커맨드는 절대 동시에 처리되지 않는다. 순서 문제가 구조적으로 제거된다.

### Offline to Reconnect Strategy

차량이 터널 진입 등으로 오프라인 상태가 되면 커맨드가 큐에 쌓인다. 재연결 시:

1. **TTL 기반 필터링**: 큐에 쌓인 커맨드 중 만료된 것(현재 시각 - timestamp > ttl)은 폐기한다
2. **seq 순서대로 재전송**: 유효한 커맨드를 seq 오름차순으로 재전송한다
3. **서버 측 검증**: 서버는 seq < currentSeq인 커맨드는 stale로 거부하고, seq == currentSeq + 1인 커맨드만 수락한다

오프라인 동안 30초 TTL의 "문 열기" 명령이 쌓여 있었는데, 2분 후 재연결되었다면 해당 명령은 이미 만료되어 폐기된다. 이것은 의도된 동작이다 -- 2분 전에 보낸 "문 열기" 명령이 지금 실행되는 것은 사용자의 의도가 아닐 수 있기 때문이다.

### ACK Levels

차량 제어에서 "커맨드가 실행되었는가"는 단순한 질문이 아니다. 여러 단계의 ACK가 존재한다.

| ACK Level | Meaning | Mechanism |
|-----------|---------|-----------|
| Level 1 | 서버가 수신했다 | HTTP 200/202 응답 |
| Level 2 | 차량이 수신했다 | MQTT delivery confirm / WebSocket ACK |
| Level 3 | ECU가 적용 완료했다 | Status feedback (차량 -> 서버) |

Level 1만으로는 차량이 명령을 수신했는지 알 수 없다. Level 2까지 확인해야 "전달"이 보장되고, Level 3까지 확인해야 "실행"이 보장된다. 사용자에게 어떤 수준의 확인을 보여줄지는 UX 설계와 직결되는 문제이다.

### Replay Attack Prevention

차량 제어는 탈취 시 물리적 피해로 이어지므로 보안이 특히 중요하다.

- **nonce**: 일회용 토큰으로, 서버는 dedup 윈도우 동안 사용된 nonce를 저장하고 재사용을 거부한다
- **timestamp**: `|now - timestamp| > threshold`이면 요청을 거부한다. 오래된 명령의 재전송을 차단한다
- **HMAC**: 메시지 무결성과 인증을 동시에 보장한다. commandId, vehicleId, seq, action, params, timestamp, nonce를 모두 포함하여 서명하므로, 필드 하나라도 변조되면 검증에 실패한다

### Dedup Store Design: Redis + TTL + Lua

커맨드 처리 결과와 시퀀스 상태를 저장하는 dedup store는 다음과 같이 설계한다.

```
Redis Key Design:
  seq:{vehicleId}              -> current expected sequence number
  idem:{commandId}             -> cached command result (TTL: command TTL * 2)
  nonce:{vehicleId}:{nonce}    -> "1" (TTL: dedup window, e.g., 5 minutes)
```

TTL 설정이 중요하다. idempotency 캐시의 TTL은 커맨드의 TTL보다 충분히 길어야 한다. 커맨드 TTL이 30초라면, idempotency 캐시 TTL은 최소 60초 이상이어야 재시도 시 캐시된 결과를 반환할 수 있다.

<mark><em><strong>차량 제어의 순서 보장은 "seq + idempotency + TTL + single-writer + atomic dedup"의 조합으로 달성한다. 이 중 하나라도 빠지면 edge case에서 장애가 발생한다.</strong></em></mark>

## Financial Domain: Ledger-Based Ordering

금융 도메인은 순서 보장의 실패가 곧 금전적 손실로 이어지는 영역이다.

### Why UPDATE Balance is Dangerous

잔액(balance)을 직접 UPDATE하는 모델의 위험성을 살펴보자.

__Scenario: Lost Update__

```
T1: SELECT balance FROM accounts WHERE id = 'A001'  -> 100
T2: SELECT balance FROM accounts WHERE id = 'A001'  -> 100
T1: UPDATE accounts SET balance = 90 WHERE id = 'A001'  (100 - 10)
T2: UPDATE accounts SET balance = 80 WHERE id = 'A001'  (100 - 20)
-- T1의 출금 10이 사라졌다 (Lost Update)
```

__Write Skew__: 두 트랜잭션이 각각 다른 조건을 확인하고 양쪽 다 커밋하여 불일치 상태가 발생하는 현상이다. 예를 들어, 두 트랜잭션이 각각 "잔액이 100 이상인가?"를 확인한 후 각자 50을 출금하여 잔액이 0이 되는 경우이다.

__Race Condition__: "잔액이 충분한가?" CHECK 후 "출금한다" ACT가 원자적이지 않으면, 두 출금이 동시에 잔액 체크를 통과하여 잔액을 초과하는 출금이 일어날 수 있다.

이러한 문제들의 근본 원인은 **mutable state에 대한 concurrent write**이다.

### Ledger Model: Append-Only Events

***Ledger(원장)*** 기반 모델은 잔액을 직접 수정하지 않고, 거래 이벤트를 append-only로 기록한다.

```
Ledger Table:
| ledgerSeq | accountId | accountSeq | idempotencyKey | type   | amount |
|-----------|-----------|------------|----------------|--------|--------|
| 10041     | A001      | 186        | uuid-001       | DEBIT  | -10000 |
| 10042     | A002      | 92         | uuid-001       | CREDIT | +10000 |
| 10043     | A001      | 187        | uuid-002       | DEBIT  | -50000 |
```

현재 잔액 = SUM(해당 계좌의 모든 이벤트 amount) 또는 최근 스냅샷 + 이후 이벤트 합산으로 계산한다.

이 모델의 이점:

- **Lost Update 불가**: 아무것도 UPDATE하지 않으므로 덮어쓸 일이 없다
- **감사 추적(Audit Trail)**: 모든 거래 이력이 불변으로 보존된다
- **재처리/복구 용이**: 이벤트를 재생(replay)하면 어느 시점의 상태든 복원할 수 있다
- **정합성 검증**: 이벤트 합산 결과와 스냅샷 잔액이 일치하는지 검증할 수 있다

### Account-Level Serial Processing

금융 시스템은 "계정 단위로는 동시에 쓰지 않는다"에 가깝게 설계한다.

- **Partition key = accountId**: Kafka 또는 내부 큐에서 accountId로 파티셔닝한다
- **파티션 당 단일 처리자**: 동일 계좌에 대한 트랜잭션을 순서대로 직렬 처리한다
- **순서 문제 구조적 제거**: Single-Writer Model과 동일한 원리이다

### DB Transaction and Isolation Levels

DB Isolation Level은 트랜잭션 간 어떤 anomaly를 허용할지 결정한다.

| Isolation Level | Prevents | Allows | Trade-off |
|----------------|----------|--------|-----------|
| Read Committed | Dirty reads | Non-repeatable reads, Phantom reads | 가장 일반적 |
| Repeatable Read | Dirty + Non-repeatable reads | Write skew (구현에 따라 다름) | DB마다 구현 차이 존재 |
| Serializable | All anomalies | - | 최고 안전성 / 최저 처리량 |

**주의**: Repeatable Read의 구현은 DB마다 다르다. PostgreSQL에서는 Snapshot Isolation으로 구현되어 write skew를 허용한다. MySQL InnoDB에서는 next-key locking을 사용하여 phantom read를 부분적으로 방지하지만, 이는 Snapshot Isolation과 다른 동작이다. Repeatable Read와 Snapshot Isolation을 동일하게 취급하면 안 된다.

금융의 핵심 트랜잭션에는 Serializable 또는 이에 준하는 수준의 격리가 필요하다. 하지만 Serializable의 비용이 부담스러우므로, **Repeatable Read + 명시적 락(SELECT FOR UPDATE)** 또는 **Single-Writer + Ledger Append** 조합이 실무에서 많이 사용된다.

### Transfer API Flow

실제 이체 API의 처리 흐름을 살펴보자.

```
Request:
  POST /transfer
  Idempotency-Key: "uuid-abc"
  X-Account-Seq: 187
  Body: { from: "A001", to: "A002", amount: 50000 }

Server:
  1. idempotency check: GET idem:A001:uuid-abc -> if exists, return cached
  2. seq check: A001.expectedSeq == 187? -> if not, 409
  3. balance check: A001.balance >= 50000?
  4. atomic commit:
     - INSERT ledger (debit A001, -50000, seq=187)
     - INSERT ledger (credit A002, +50000)
     - UPDATE A001.expectedSeq = 188
     - SETEX idem:A001:uuid-abc {result} TTL 7d
  5. return 200 OK
```

4단계의 atomic commit이 핵심이다. 출금 이벤트 삽입, 입금 이벤트 삽입, seq 증가, idempotency 캐시 저장이 하나의 DB 트랜잭션 안에서 수행되어야 한다. 출금 계좌(A001)와 입금 계좌(A002)가 다른 파티션에 있는 cross-account 이체의 경우, Saga 패턴으로 분리하여 각 계좌에 대해 개별적으로 트랜잭션을 수행하고, 실패 시 보상 트랜잭션(compensating transaction)으로 복구한다.

<mark><em><strong>금융 시스템의 순서 보장 전략은 "Idempotency Key(중복 제거) + Account Sequence(순서 강제) + Ledger Append + Atomic Commit(정합성/감사/복구)"의 조합이다.</strong></em></mark>

### System Restart and Ordering Preservation

시스템이 죽었다가 재기동하면 순서가 유지되는가?

**금융 (Ledger 기반 모델)**: 모든 상태 변경이 불변 이벤트로 기록되어 있으므로, 마지막 커밋된 이벤트의 seq부터 이어서 처리하면 된다. 처리 중 crash가 발생한 경우, idempotency key 덕분에 재시도해도 중복 적용되지 않는다. DB 트랜잭션이 커밋되지 않은 상태에서 crash가 발생하면 rollback되므로 부분 적용이 없다.

**차량 제어**: Redis에 저장된 seq와 idempotency 캐시가 핵심이다. Redis를 AOF(Append-Only File) 또는 RDB 스냅샷으로 persistence 설정해야 재기동 시 seq 상태가 보존된다. Kafka 기반 파이프라인을 사용하는 경우, 컨슈머 오프셋이 커밋된 지점부터 재처리하므로 순서가 유지된다. 오프셋 커밋과 처리 완료를 원자적으로 수행하는 것이 핵심이다(exactly-once semantics in Kafka consumer).

## Distributed Systems Theory: Time, Order, and Consensus

순서 보장 문제는 분산 시스템 이론의 핵심 주제와 깊이 연결되어 있다.

### Physical Time vs Logical Time

분산 시스템에서 물리적 시계(physical clock)는 신뢰할 수 없다.

- ***NTP(Network Time Protocol)***: 밀리초(ms) 수준의 정밀도를 제공하지만, 네트워크 지연, 시계 드리프트(drift)가 항상 존재한다
- ***GPS 기반 시계***: 마이크로초(us) 수준이지만, 여전히 완벽하지 않다
- **근본 문제**: 분산된 노드들의 시계는 항상 어긋나 있다. 물리적 시간만으로는 이벤트의 순서를 정확히 결정할 수 없다

이 문제를 해결하기 위해 ***논리적 시간(Logical Time)*** 이 도입되었다.

### Lamport Clock

***[Lamport Clock](https://en.wikipedia.org/wiki/Lamport_timestamp)*** 은 1978년 Leslie Lamport가 제안한 스칼라 논리 시계이다.

규칙:
1. 각 프로세스는 로컬 카운터 C를 유지한다
2. 로컬 이벤트 발생 시: C = C + 1
3. 메시지 전송 시: 메시지에 현재 C를 포함한다
4. 메시지 수신 시: C = max(C_local, C_received) + 1

**핵심 성질**: 인과관계 a -> b (a가 b보다 먼저 발생)이면 L(a) < L(b)이다. 그러나 **역은 성립하지 않는다**. L(a) < L(b)라고 해서 a -> b인 것은 아니다. 서로 독립적인 이벤트(concurrent events)도 서로 다른 Lamport timestamp를 가질 수 있다.

### Vector Clock

***[Vector Clock](https://en.wikipedia.org/wiki/Vector_clock)*** 은 Lamport Clock의 한계를 보완한다. N개의 프로세스가 있으면 N차원 벡터 [c1, c2, ..., cn]을 사용한다.

**비교 규칙**: VC(a) < VC(b)는 "모든 i에 대해 VC(a)[i] <= VC(b)[i]이고, 적어도 하나의 j에 대해 VC(a)[j] < VC(b)[j]"로 정의된다. 두 벡터가 이 관계를 만족하지 않으면 두 이벤트는 ***동시적(concurrent)*** 이다.

**핵심 성질**: a -> b **이면 그리고 오직 그럴 때만(if and only if)** VC(a) < VC(b)이다. 따라서 두 이벤트가 인과적으로 관련이 있는지, 독립적(concurrent)인지 정확히 판별할 수 있다. 이것이 Lamport Clock과의 결정적 차이이다.

대신 Vector Clock은 프로세스 수에 비례하는 공간이 필요하므로 비용이 더 크다.

### Global Ordering vs Partial Ordering

***Global Total Order*** 는 시스템의 모든 이벤트에 대해 단일 선형 순서를 부여하는 것이다. 합의(consensus) 프로토콜이 필요하며 비용이 높다.

***Partial Order*** 는 특정 범위(엔티티, 파티션) 안에서만 순서를 보장하는 것이다.

**현실의 대부분의 시스템에서는 entity-level partial ordering이면 충분하다.** vehicleId 단위, accountId 단위로 순서가 보장되면 비즈니스 요구사항을 만족한다. 모든 차량의 모든 커맨드에 대한 global ordering은 필요하지 않다.

### Linearizability vs Sequential Consistency

이 두 개념은 분산 시스템에서 가장 자주 혼동되는 일관성 모델이다.

***[Linearizability](https://en.wikipedia.org/wiki/Linearizability)***: 모든 연산이 호출(call)과 반환(return) 사이의 어느 한 시점에 원자적으로 실행된 것처럼 보인다. **실시간(real-time) 순서를 존중한다.** 연산 A가 반환된 후에 연산 B가 호출되었다면, B는 반드시 A 이후의 상태를 관측한다.

***[Sequential Consistency](https://en.wikipedia.org/wiki/Sequential_consistency)***: 모든 프로세스의 연산에 대해 어떤 전체 순서(total order)가 존재하며, 이 순서는 각 프로세스 내부의 프로그램 순서와 일치한다. 그러나 **실시간 순서는 존중하지 않는다.** 프로세스 P1의 쓰기가 완료된 후 프로세스 P2가 읽더라도, P1의 쓰기 이전 값을 볼 수 있다.

Linearizability는 Sequential Consistency보다 **엄격하게 더 강한** 보장이다.

### Consensus Protocols for Total Ordering

전체 순서(total ordering)가 필요한 경우 합의 프로토콜을 사용한다.

- ***[Raft](https://en.wikipedia.org/wiki/Raft_(algorithm))***: 리더 기반 합의 프로토콜이다. 리더가 로그 인덱스(log index)를 할당하여 전체 순서를 결정한다. 모든 팔로워는 동일한 순서로 로그를 복제한다
- ***[Paxos](https://en.wikipedia.org/wiki/Paxos_(computer_science))***: 고전적인 합의 프로토콜로, 더 복잡하지만 같은 목적을 달성한다

**비용**: 리더가 병목이 되며, 합의에 도달하기 위해 여러 번의 네트워크 왕복이 필요하다.

### Kafka Partition-Level Ordering

***[Apache Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)*** 는 분산 이벤트 스트리밍 플랫폼으로, append-only 로그 구조를 사용한다.

- **하나의 파티션 내**: 엄격한 순서 보장 (append-only log)
- **파티션 간**: 순서 보장 없음
- **전역 순서가 필요하면**: 단일 파티션을 사용해야 하지만, 처리량이 급격히 저하된다

이것이 "파티션 키 = entityId" 전략의 이론적 기반이다. 동일 entityId의 이벤트는 같은 파티션에 들어가므로 순서가 보장되고, 서로 다른 entity 간에는 순서가 필요 없으므로 파티션을 분리하여 처리량을 확보한다.

### FLP Impossibility

***[FLP Impossibility](https://en.wikipedia.org/wiki/Consensus_(computer_science)#Impossibility_results)*** (Fischer, Lynch, Paterson, 1985)는 분산 시스템 이론의 근본적 불가능 결과이다.

**비동기(asynchronous) 분산 시스템에서, 단 하나의 프로세스라도 장애가 발생할 수 있으면, 합의(consensus)의 종료(termination)를 보장하는 결정론적 알고리즘은 존재하지 않는다.**

이것이 순서 보장과 관련되는 이유는, 전체 순서를 부여하려면 합의가 필요한데, FLP는 합의가 항상 성공한다는 보장이 없다는 것을 증명하기 때문이다. 실용적인 시스템은 timeout을 도입(순수 비동기 가정을 깨뜨림)하고 리더 선출을 사용하여 이 한계를 우회한다.

### CRDT: Giving Up Order for Availability

***[CRDT(Conflict-free Replicated Data Types)](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)*** 는 순서를 포기하는 대신 가용성과 파티션 허용성을 확보하는 접근이다.

CRDT에는 두 가지 유형이 있다.

**State-based CRDT (CvRDT)**: 각 노드가 전체 상태를 보유하고, merge 함수로 합친다. merge 함수는 join-semilattice를 형성해야 하며, 다음 세 성질을 만족해야 한다:

- **교환법칙(Commutative)**: merge(a, b) = merge(b, a)
- **결합법칙(Associative)**: merge(a, merge(b, c)) = merge(merge(a, b), c)
- **멱등성(Idempotent)**: merge(a, a) = a

**Operation-based CRDT (CmRDT)**: 연산(operation)을 전파한다. concurrent operation에 대해서만 **교환법칙**을 만족하면 된다. delivery layer가 at-least-once를 보장하는 경우에는 멱등성도 필요하다.

이러한 성질 덕분에, 네트워크 분할 상황에서도 각 노드가 독립적으로 연산을 적용하고, 나중에 합쳐도(merge) 모든 노드가 동일한 상태로 수렴한다.

대표적인 CRDT:

- **G-Counter**: 증가만 가능한 카운터. 각 노드의 로컬 카운터를 벡터로 유지하고, merge 시 각 성분별 max를 취한다. 전체 카운터 값은 벡터의 합산으로 계산한다
- **LWW-Register**: Last-Writer-Wins 레지스터. 타임스탬프가 가장 큰 쓰기가 승리한다 (clock skew에 취약하다)

Eventually Consistent 시스템에서 순서를 근사(approximate)하는 방법으로는 타임스탬프, 버전 벡터(version vector), 인과적 일관성(causal consistency) 프로토콜 등이 있다. Last-Writer-Wins(LWW)는 타임스탬프 기반이므로 시계 편차(clock skew) 하에서 데이터 손실이 발생할 수 있다.

<mark><em><strong>대부분의 실용적 시스템은 global ordering이 아닌 entity-level partial ordering으로 충분하며, 이를 위해 Kafka 파티션, Single-Writer Model, Sequence Number 등을 조합하여 달성한다.</strong></em></mark>

## Scaling Ordering Strategies

순서 보장 전략이 확장 가능한가(scalable)는 중요한 설계 질문이다.

### QPS Scaling

| QPS Range | Strategy | Notes |
|-----------|----------|-------|
| < 1,000 | DB row-level lock + version | 단순하고 충분하다 |
| 1,000 - 10,000 | Redis atomic ops + Kafka partition | Single-Writer + 파티션 기반 직렬화 |
| 10,000+ | Sharded partitions + async pipeline | 파티션 수 증가 + 비동기 처리 + 백프레셔 |

### Shard Expansion

파티션 수를 늘릴 때(rebalancing) 순서 보장이 일시적으로 깨질 수 있다. Kafka에서 파티션 수를 변경하면 동일 키의 메시지가 다른 파티션에 할당될 수 있다. 이를 방지하기 위해:

- **Consistent Hashing**: 파티션 변경 시 최소한의 키만 재배치된다
- **Stop-the-world rebalancing**: 잠시 쓰기를 중단하고 파티션을 재배치한 뒤 재개한다
- **Dual-write migration**: 구 파티션과 신 파티션에 동시에 쓰고, 전환 완료 후 구 파티션을 제거한다

### Multi-Region Environment

multi-region 환경에서 entity-level ordering을 유지하려면:

- **Region Affinity**: 특정 entity를 특정 region에 고정(pinning)하여 해당 region에서만 쓰기를 수행한다. 읽기는 어느 region에서든 가능하다
- **Cross-Region Consensus**: entity에 대한 global ordering이 필요하면 cross-region Raft/Paxos를 사용하지만, 지연(latency)이 크게 증가한다 (수십~수백 ms)
- **대부분의 경우**: region affinity + entity-level partition으로 충분하다. global ordering은 비용 대비 필요성이 낮다

## Three-Layer Defense: The Key Design Principle

"네트워크를 믿지 마라"는 원칙을 구현하는 핵심 설계 패턴은 **3중 방어(Three-Layer Defense)** 이다.

```
Layer 1: Idempotency Key
  -> Prevents duplicate processing
  -> Same request arriving twice? Return cached result.

Layer 2: Sequence Number
  -> Enforces entity-level ordering
  -> Out-of-order request? Reject with 409.

Layer 3: Atomic Dedup Store (Redis + Lua / DB Transaction)
  -> Ensures consistency
  -> Seq check + idempotency check + state update in one atomic operation.
```

이 세 가지가 결합되면:

- **재시도(retry)**: Idempotency Key가 중복을 제거한다
- **순서 역전(reordering)**: Sequence Number가 비순차 요청을 거부한다
- **동시성(concurrency)**: Atomic Dedup Store가 race condition을 방지한다

### Failure Behavior: Three Modes

순서 보장이 실패했을 때 시스템의 동작은 세 가지로 분류된다.

| Mode | Behavior | Result |
|------|----------|--------|
| **Safe Reject** | out-of-order 요청을 감지하고 거부 (409/425) | 클라이언트가 재동기화 후 재시도 -- **기본 전략이어야 한다** |
| **Silent Corruption** | out-of-order를 감지하지 못하고 적용 | 잔액 역행, 차량 오동작 -- **가장 위험하다** |
| **Recoverable** | out-of-order를 적용했지만 감사 로그로 복구 가능 | Ledger replay로 정합성 복구 가능 |

### Ordering Strategy Layer Location

순서 보장 전략이 어떤 레이어에 있는지 인식해야 한다.

| Layer | Mechanism | Guarantee |
|-------|-----------|-----------|
| Network (TCP) | Byte-stream ordering | 단일 연결 내 바이트 순서만 |
| Application | seq + idempotency | Entity-level request ordering |
| Data | Ledger + event sourcing | Event-level ordering + audit trail |
| Message Queue | Kafka partition ordering | Partition-level ordering |

하나의 레이어에만 의존하는 것은 위험하다. 여러 레이어에 걸친 방어가 필요하다.

### Design Questions Every Architect Must Answer

순서 보장이 필요한 시스템을 설계할 때, 다음 질문에 답할 수 있어야 한다.

| Question | Example Answer |
|----------|---------------|
| 나는 네트워크를 믿고 있는가? | 믿으면 안 된다 -- 설계 냄새(design smell)이다 |
| 순서 보장의 단위(ordering unit)는 무엇인가? | vehicleId, accountId |
| Global ordering인가, partial ordering인가? | 거의 항상 partial |
| Out-of-order 요청을 받으면 어떻게 하는가? | reject 409, hold, merge? |
| 중복 요청을 받으면 어떻게 하는가? | idempotent response 반환 |
| 실패 + 재시도 시 어떻게 하는가? | 동일 idempotency key로 재시도 |
| 순서 보장 전략은 확장 가능한가? | partition 기반이면 확장 가능 |
| 순서 보장이 실패하면 시스템은 어떻게 동작하는가? | 안전하게 거부? 조용히 오염? |

가장 위험한 것은 **"조용히 데이터가 오염되는" 설계**이다. 순서가 잘못되었는데 시스템이 그것을 감지하지 못하고 적용하면, 잔액이 역행하거나 차량이 의도와 반대로 동작할 수 있다. **안전한 거부(fail-safe reject)** 가 기본 전략이어야 한다.

```
"TCP니까 순서 괜찮겠지"         -> 위험
"HTTP는 요청 순서대로 오겠지"    -> 위험
"재시도해도 큰 문제 없겠지"      -> 위험

"네트워크는 순서를 보장하지 않는다. 내 코드가 보장한다." -> 올바른 태도
```

<mark><em><strong>순서 보장의 핵심은 네트워크가 아니라 애플리케이션에 있다. Idempotency Key(중복 제거) + Sequence Number(순서 강제) + Atomic Dedup Store(정합성 보장)의 3중 방어가 모든 도메인에 공통으로 적용되는 설계 원칙이다.</strong></em></mark>

# Links

- [RFC 793 - Transmission Control Protocol (Original)](https://datatracker.ietf.org/doc/html/rfc793)
- [RFC 9293 - Transmission Control Protocol (Current)](https://datatracker.ietf.org/doc/html/rfc9293)
- [RFC 7230 - HTTP/1.1 Message Syntax and Routing (Obsoleted)](https://datatracker.ietf.org/doc/html/rfc7230)
- [RFC 9112 - HTTP/1.1 (Current)](https://datatracker.ietf.org/doc/html/rfc9112)
- [RFC 9113 - HTTP/2](https://datatracker.ietf.org/doc/html/rfc9113)
- [SOCKET, PROTOCOL](https://klarciel.net/wiki/network/network-socket-protocol/)

# References

- Lamport, L. (1978). "Time, Clocks, and the Ordering of Events in a Distributed System." Communications of the ACM, 21(7), 558-565
- Fischer, M. J., Lynch, N. A., & Paterson, M. S. (1985). "Impossibility of Distributed Consensus with One Faulty Process." Journal of the ACM, 32(2), 374-382
- Kleppmann, M. (2017). Designing Data-Intensive Applications. O'Reilly Media
- Shapiro, M. et al. (2011). "Conflict-free Replicated Data Types." SSS 2011
- Herlihy, M. P., & Wing, J. M. (1990). "Linearizability: A Correctness Condition for Concurrent Objects." ACM Transactions on Programming Languages and Systems, 12(3), 463-492
