---
layout  : wiki
title   : SCALABLE STREAMING PLATFORM
summary : 
date    : 2026-04-12 15:02:32 +0900
updated : 2026-04-12 18:12:24 +0900
tag     : architecture systemdesign go network
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
favorite: true
---
* TOC
{:toc}

# SCALABLE STREAMING PLATFORM

확장 가능한 양방향 스트리밍 플랫폼을 만들기 위한 반드시 알아야할 **본질**에 대해서 정리 한다.

## Introduction

서버와 디바이스 사이에 실시간 양방향 통신이 필요한 시스템은 어디에나 있다. IoT 디바이스 관제, 커넥티드 카, 실시간 협업 도구, 게임 서버 등
이들이 공유하는 본질적인 문제는 **수만~수십만 개의 커넥션을 안정적으로 유지하면서, 메시지를 빠르고 안전하게 양방향으로 전달하는 것**이다.

이 글은 양방향 스트리밍 플랫폼을 설계할 때 반드시 마주치게 되는 **9가지 본질(essence)** 을 다룬다. 

이 9가지를 이해하면, 어떤 ***[프로토콜(WebSocket, gRPC, MQTT, QUIC)](https://klarciel.net/wiki/network/network-socket-protocol/)*** 을 쓰든 핵심 파이프라인의 구조는 동일하다는 것을 알게 된다.

## Essence

### Transport — Protocol Abstraction

디바이스는 WebSocket으로, 서버 간 통신은 ***[gRPC](https://klarciel.net/wiki/grpc/grpc-fundamentals/)*** 로, 향후에는 ***[MQTT](https://klarciel.net/wiki/architecture/architecture-mqtt/)*** 나 QUIC이 추가될 수 있다고 가정한다. 프로토콜마다 별도의 파이프라인을 만들면 코드가 N배 증가하고, 배압(backpressure) 로직과 종료 전파를 프로토콜마다 재구현해야 한다.

__Question__:
- **커넥션 파이프라인(Reader, Writer, Queue, Heartbeat)에서 프로토콜에 의존하는 부분은 무엇인가?**

답은 **바이트를 읽고 쓰는 물리적 I/O** 단 하나다. Reader→Queue→Writer 흐름, 배압, 종료 전파는 프로토콜에 독립적이다. 해당 부분은 공유가 가능하다.
하지만, 바이트를 읽고 쓰는 물리적 I/O(WebSocket frame vs gRPC stream vs raw TCP)는 공유가 불가능하다.

따라서 interface는 "시간 제한이 있는 바이트 읽기/쓰기"만 노출하면 충분하다.

***[GO](https://klarciel.net/wiki/go/go-fundamental/)*** 표준 라이브러리의 `net.Conn`이 이미 이 본질을 구현하고 있다. Read, Write, Deadline, Close. 모든 네트워크 프로토콜이 이 interface 뒤에서 동작한다. 스트리밍 플랫폼의 Transport interface 도 동일한 원리를 따른다.

__Code__:

```go
// Transport is the protocol-agnostic interface for network I/O.
// All protocol-specific details hide behind this boundary.
type Transport interface {
    Recv() ([]byte, error)
    Send(data []byte) error
    WriteMany(messages [][]byte) error
    SetWriteDeadline(t time.Time) error
    SetReadDeadline(t time.Time) error
    Close(reason *Disconnect) error
}
```

공유 불가능한 부분만 — `Recv() ([]byte, error)`, `Send([]byte) error`, `WriteMany([][]byte) error`. 그리고 배압의 전제인 `SetWriteDeadline`, `SetReadDeadline`. 종료를 위한 `Close` 를 인터페이스로 노출한다.
`Send`를 제거하고 `WriteMany`만 남길 수 있지만, 단일 메시지 전송(Ping 응답 등)에 불필요한 슬라이스 할당이 생긴다. 반대로 `Batch()`, `Flush()` 등을 추가할 수 있지만, 이는 구현 상세를 interface에 노출하는 것이다.

이 interface 위의 모든 코드 — Reader, Writer, Heartbeat — 는 WebSocket인지 gRPC인지 모른다. 프로토콜 고유 기능(WebSocket Ping/Pong 등)은 타입 단언으로 처리하고, interface를 오염시키지 않는다.

<mark><em><strong>Transport interface 의 본질은 "시간 제한이 있는 바이트 읽기/쓰기"이다.</strong></em></mark> 이것만 추상화하면 상위 계층(Connection, Queue, Heartbeat)이 프로토콜에 독립적으로 작동한다.

#### Deadline

Write deadline은 **네트워크 쓰기 작업에 시간 제한을 거는 것**이다. 지정한 시간 내에 쓰기가 완료되지 않으면 에러를 반환한다. Read deadline도 마찬가지로 **읽기 작업에 시간 제한** 을 건다.
Go 의 net.Conn 에서 Read deadline 은 SetReadDeadline(t time.Time) 코드가 존재하는데, "t 시점까지 데이터가 읽히지 않으면 read가 timeout 에러로 실패한다" 라는 의미이다.
즉, 지정한 시간까지 아무것도 안 들어오면 **connection dead** 로 판단한다.

### Connection — I/O Path Separation

하나의 커넥션에서 수신(Read)과 송신(Write)을 단일 실행 흐름으로 처리하면, TCP 송신 버퍼가 가득찬 순가에 Write 가 블로킹되고, 같은 흐름의 Read 도 멈춘다.
즉, **느린 상대방 하나가 빠른 상대방의 수신까지 막는다.** 이것이 ***[Head-of-Line-Blocking](https://klarciel.net/wiki/network/network-socket-protocol/)*** 이다.

***[네트워크 I/O 는 본질적으로 비대칭](https://klarciel.net/wiki/network/network-ordered-system/)*** 이다. 
수신 속도(상대방의 전송 속도)와 송신 속도(상대방의 수신 처리 능력 및 네트워크 상태)는 독립 변수다. 따라서, <mark><em><strong>수신 경로와 송신 경로는 반드시 독립적으로 실행되어야 한다.</strong></em></mark>

Go에서의 자연스러운 형태는 **1 Connection = 2 Goroutines (Reader + Writer)**. 메모리 비용은 커넥션당 약 4KB (2 goroutines x 2KB 스택). 10만 커넥션이면 약 400MB — 합리적인 수준이다.
실제로 ***[Tesla Fleet-Telemetry](https://github.com/teslamotors/fleet-telemetry)*** 가 이런 구조를 사용하고 있다.

Reader는 `Recv()`에서 블로킹하며 수신 메시지를 처리하고, Writer는 큐에서 대기하며 배치 전송을 담당한다. 둘 사이의 유일한 접점은 Queue다.

__Code__:

```go
// Connection manages a single client connection with dedicated Reader/Writer goroutines.
// 1 Connection = 2 Goroutines: Reader reads inbound, Writer drains outbound queue.
type Connection struct {
    transport Transport
    queue     *Queue
    handler   Handler
    closedCh  chan struct{}
    closeOnce sync.Once
}

// Start launches the Reader and Writer goroutines.
func (c *Connection) Start() {
    go c.readLoop()
    go c.writeLoop()
}

// readLoop runs as the Reader goroutine.
//
// Core responsibilities:
// 1. Block on Recv() to receive inbound data (no busy waiting, OS handles sleep).
// 2. Dispatch each message to the handler (decode / route / enqueue downstream).
// 3. On exit, SIGNAL the Writer to stop by closing the queue (cross-signal).
//
// Key design principle:
// - Blocking 자체는 문제가 아니다. "깨울 수 없는 blocking"이 문제다.
// - Reader는 queue.Close()를 통해 Writer의 Wait()를 깨운다.
//
// Lifecycle:
// Recv() blocks → message arrives → handler → repeat
// Recv() error → exit → queue.Close() → Writer wakes up → Writer exits
func (c *Connection) readLoop() {
    // Cross-signal:
    // Reader가 종료되면 Writer는 더 이상 데이터를 받을 수 없으므로
    // queue.Close()로 Writer의 blocking 상태(queue.Wait)를 깨운다.
    defer c.queue.Close()

    for {
        // Blocking point:
        // 데이터가 올 때까지 OS 레벨에서 sleep (CPU 사용 X)
        data, err := c.transport.Recv()
        if err != nil {
            // 종료 조건:
            // - 네트워크 끊김
            // - Read deadline 초과 (Writer가 깨운 경우 포함)
            // → defer 실행 → queue.Close() → Writer 종료 유도
            return
        }

        // 메시지 처리:
        // 일반적으로 여기서 decode → validate → routing → enqueue 발생
        c.handler.OnMessage(c, data)
    }
}

// writeLoop runs as the Writer goroutine.
//
// Core responsibilities:
// 1. Wait on the queue (block without CPU usage).
// 2. Batch messages to improve throughput (reduce syscall).
// 3. Write to transport (network I/O).
// 4. On exit, FORCE the Reader's blocking Recv() to return (cross-signal).
//
// Key design principle:
// - Reader와 Writer는 서로 독립적으로 blocking될 수 있다.
// - 따라서 서로의 blocking 지점을 "깨워줄 책임"이 있다.
//
// Lifecycle:
// queue.Wait() blocks → data enqueued → batch dequeue → WriteMany()
// queue closed → Wait() returns false → exit → force Reader wakeup
func (c *Connection) writeLoop() {
    defer func() {
        // Cross-signal:
        // Writer가 종료되면 Reader는 여전히 Recv()에서 blocking 중일 수 있다.
        //
        // Recv()는 queue나 context를 알지 못하는 OS-level blocking이므로,
        // 강제로 깨우기 위해 ReadDeadline을 설정한다.
        //
        // 동작:
        // SetReadDeadline(now + 50ms)
        // → 50ms 후 timeout 발생
        // → Recv() error 반환
        // → readLoop 종료
        //
        // 즉, "blocking을 피하는 것이 아니라, 깨울 수 있도록 설계"하는 것
        _ = c.transport.SetReadDeadline(time.Now().Add(50 * time.Millisecond))
    }()

    for {
        // Blocking point:
        // queue가 비어 있으면 sleep
        // queue.Close() 되면 false 반환 → 종료
        if !c.queue.Wait() {
            // Reader가 종료되면서 queue.Close() 호출한 경우
            // → Writer도 자연스럽게 종료
            return
        }

        // Batch dequeue:
        // 여러 메시지를 묶어서 보내면 syscall 횟수 감소 → throughput 증가
        items, _ := c.queue.RemoveMany(16)

        // 실제 네트워크 전송:
        // 여기서도 blocking 가능 (TCP buffer, network 상태 등)
        // → 상위 레벨(WriteMany)에서는 WriteDeadline으로 제어하는 것이 일반적
        _ = c.transport.WriteMany(toByteBatch(items))
    }
}
```

__Anti-Pattern__:

Writer 는 생각보다 자주 블로킹 된다. 
- 클라이언트가 느림 (slow consumer)
- 네트워크 지연
- TCP send buffer 가득 참

```go
func (c *Connection) OnMessage(data []byte) {
    go func() {
        response := process(data)

        // 위험한 코드
        c.transport.Send(response)
    }()
}
```

위와 같은 코드에서 클라이언트 1명이 느리게 되면, 메모리 증가(goroutine stack)로 인해서 OOM 등이 발생할 수 있다.

하나의 스트림에서 읽기와 쓰기를 교대하는 방식은 → 느린 메시지 하나가 전체 스트림을 차단한다.

### Queue — Bounded Ring Buffer

독립된 두 흐름(Reader, Writer) 사이에는 경계(bounded buffer)가 존재해야 한다. 이 경계는 속도 차이를 흡수하는 동시에, 그 차이가 무한히 누적되는 것을 방지한다.

<mark><em><strong>경계가 없으면 느린 하나가 전체를 죽인다. 경계는 "속도 차이의 흡수"와 "무한 누적의 차단"이라는 상충되는 두 목표를 동시에 달성한다.</strong></em></mark>

Reader(수신)와 Writer(송신)의 속도가 다르기 때문에 Reader가 받은 응답을 Writer가 바로 보낼 수 없을 때 **임시 저장**이 필요하다.

네트워크 I/O는 상대방의 처리 능력과 네트워크 상태에 의해 결정되므로, 송신은 언제든 지연될 수 있고, 이때 수신된 데이터를 임시로 저장할 완충 지점이 필요하다. 그러나 이 버퍼가 무한하면, 느린 소비자(slow consumer) 하나로 인해 데이터가 끝없이 누적되어 결국 서버 전체가 메모리 고갈(OOM)로 붕괴된다. 따라서 큐는 반드시 유한한 경계를 가져야 하며, 이 경계에 도달했을 때는 데이터를 버리거나(drop) 커넥션을 종료(disconnect)하는 정책적 선택이 필요하다. 결국 큐의 본질은, 속도 차이를 흡수하면서도 무한 누적을 차단하는 경계를 제공하여, 단일 지연이 전체 시스템 장애로 전파되는 것을 막는 데 있다.

커넥션당 하나의 FIFO Ring Buffer. **바이트 기반** 상한선으로 메모리를 제한한다.
왜 메시지 개수가 아니라 바이트인가? 메시지 크기의 편차가 크기 때문이다. 10바이트 텔레메트리와 1MB 바이너리가 공존하는 시스템에서 "최대 1000개"라는 제한은 10KB일 수도, 1GB일 수도 있다. 바이트 기반이면 메모리 사용량을 직접 제어할 수 있다.

__Code__:

```go
const DefaultMaxSize = 1 << 20 // 1MB byte limit

// Queue is a FIFO ring buffer with byte-based size limit.
// Single queue per connection — no priority levels needed.
type Queue struct {
    mu      sync.Mutex
    cond    *sync.Cond
    nodes   []Item
    head    int
    tail    int
    cnt     int
    size    int    // current bytes
    maxSize int    // byte limit
    closed  bool
}

// Add enqueues an item. Returns false if the queue is closed.
func (q *Queue) Add(item Item) bool {
    q.mu.Lock()
    defer q.mu.Unlock()
    if q.closed {
        return false
    }
    if q.cnt == len(q.nodes) {
        q.resize(q.cnt * 2) // 2x growth
    }
    q.nodes[q.tail] = item
    q.tail = (q.tail + 1) % len(q.nodes)
    q.size += len(item.Data)
    q.cnt++
    q.cond.Signal() // wake Writer
    return true
}

// Wait blocks until the queue has items or is closed.
func (q *Queue) Wait() bool {
    q.mu.Lock()
    defer q.mu.Unlock()
    for q.cnt == 0 && !q.closed {
        q.cond.Wait()
    }
    return !q.closed
}

// Overflowed reports whether the queue exceeds its byte limit.
func (q *Queue) Overflowed() bool {
    q.mu.Lock()
    defer q.mu.Unlock()
    return q.maxSize > 0 && q.size > q.maxSize
}
```

큐가 가득 찼을 때의 정책은 disconnect만 있는 것이 아니다. Drop Oldest(오래된 데이터 폐기), Drop Latest(새 데이터 거부) 같은 전략도 존재한다. 텔레메트리처럼 최신값만 중요한 도메인에서는 Drop Oldest가 이론적으로 더 합리적이다. 다만 이 글에서 제시하는 구조는 disconnect를 선택한다 — 큐가 넘칠 정도로 느린 클라이언트는 drop으로 연명시키는 것보다 재연결시키는 것이 더 빠르고 상태가 깨끗하기 때문이다. 도메인별 drop 전략은 기본 파이프라인이 안정화된 후 최적화 단계에서 검토할 수 있다.

__Anti-Pattern__:
- **Unbounded buffer**: `make(chan T, math.MaxInt)` → OOM. 한 커넥션의 문제가 서버 전체를 죽인다.
- **Global queue**: 모든 커넥션이 하나의 큐를 공유 → 한 slow consumer가 전체 throughput을 지배. **Per-connection queue가 핵심이다.**

### Backpressure — Write Deadline + Queue Limit

생산자(서버)가 소비자(클라이언트)보다 빠르면, 그 차이가 서버 내부에 누적되어 자원이 고갈된다. **"언제 포기할 것인가"에 대한 명확한 기준**이 없으면, 무한히 기다리거나 무한히 축적된다.

자원 고갈의 두 축은 **시간**과 **공간**이다.
- **시간**: "얼마나 오래 기다릴 것인가" → Write Deadline
- **공간**: "얼마나 많이 쌓을 것인가" → Queue Byte Limit

<mark><em><strong>Backpressure의 본질은 "포기 기준"이다. 기준은 시간(deadline)과 공간(byte limit) 두 축뿐이다.</strong></em></mark>

Batching(배치 전송)은 throughput을 높이지만 slow consumer를 끊지 않는다. Sharding(샤딩)은 lock 경합을 줄이지만 이미 쌓인 부하를 해소하지 않는다. Rate Limiting(속도 제한)은 유입을 제한하지만 유출 문제를 해결하지 않는다. **이것들은 최적화(optimization)이지 배압(backpressure)이 아니다.**

Writer goroutine에서 두 가지를 검사한다:
1. **Queue Overflow** → 공간 초과 시 DisconnectSlow
2. **Write Deadline** → 시간 초과 시 DisconnectWriteError

__Code__:

```go
const (
    writeDeadline = 10 * time.Second
    maxQueueBytes = 1 << 20 // 1MB
)

func (c *Connection) writeLoop() {
    for {
        if !c.queue.Wait() {
            return
        }

        // Backpressure #1 — Space: queue byte limit exceeded.
        if c.queue.Overflowed() {
            c.close(DisconnectSlow)
            return
        }

        items, ok := c.queue.RemoveMany(16)
        if !ok || len(items) == 0 {
            continue
        }

        // Backpressure #2 — Time: write must complete within deadline.
        c.transport.SetWriteDeadline(time.Now().Add(writeDeadline))

        err := c.transport.WriteMany(toByteBatch(items))

        // 항상 clear
        c.transport.SetWriteDeadline(time.Time{})

        if err != nil {
            c.close(DisconnectWriteError)
            return
        }
    }
}
```

__Anti-Pattern__
- **Deadline 없는 Write**: TCP 송신 버퍼가 포화되면 write가 블로킹된다. Deadline이 없으면 Writer goroutine이 영원히 반환하지 않는다 → goroutine leak
- **Buffer 크기 무제한**: slow consumer 1개가 서버 메모리 전체를 소비 → OOM → 전체 서비스 중단
- **"5-Layer Backpressure"**: 실질적 배압은 2개뿐이다. 나머지를 배압이라 부르면 혼란만 가중된다

### Termination — Cross-Signal Shutdown

Reader와 Writer가 독립적으로 실행되는 순간, 새로운 문제가 생긴다: **한쪽이 죽었는데 상대방이 모르면 어떻게 되는가?**

Reader는 `Recv()`에서 블로킹 중이고, Writer는 `queue.Wait()`에서 블로킹 중이다. 상대방의 종료를 알리지 않으면 영원히 블로킹된다 → goroutine leak → 해당 커넥션의 goroutine, TCP 파일 디스크립터, 큐 메모리가 영원히 해제되지 않는다.

<mark><em><strong>종료의 본질은 "상대방의 블로킹을 깨뜨리는 것" 이다. 각 흐름은 상대방이 어디서 블로킹되는지 알고, 그 지점을 깨뜨리는 수단을 가져야 한다.</strong></em></mark>

두 방향의 교차 신호(cross-signal):
1. **Reader → Writer**: Reader가 종료되면 `queue.Close()`를 호출한다. `Close()`는 `cond.Broadcast()`를 실행하여 `queue.Wait()`에서 블로킹 중인 Writer를 깨운다.
2. **Writer → Reader**: Writer가 종료되면 `SetReadDeadline(50ms)`를 설정한다. 이것은 OS 레벨에서 Reader의 `Recv()` 블로킹을 강제로 깨뜨린다.

프로세스 수준에서는 `context.Done()` → `Registry.CloseAll()` → 각 커넥션 Close → 각 goroutine 종료. 3계층 종료 전파다.

__Code__:

```go
func (c *Connection) readLoop() {
    defer c.queue.Close() // Reader exit → wake Writer via cond.Broadcast()
    for {
        data, err := c.transport.Recv()
        if err != nil {
            return
        }
        c.handler.OnMessage(c, data)
    }
}

func (c *Connection) writeLoop() {
    defer func() {
        // Writer exit → force Reader's blocking Recv() to return
        c.transport.SetReadDeadline(time.Now().Add(50 * time.Millisecond))
    }()
    for {
        if !c.queue.Wait() {
            return // queue closed by Reader
        }
        items, _ := c.queue.RemoveMany(16)
        if err := c.transport.WriteMany(toByteBatch(items)); err != nil {
            return
        }
    }
}

// close ensures cleanup runs exactly once, regardless of which goroutine triggers it.
func (c *Connection) close(reason *Disconnect) {
    c.closeOnce.Do(func() {
        c.queue.Close()
        c.transport.Close(reason)
        close(c.closedCh)
    })
}
```

`sync.Once`가 중요하다. 양쪽이 동시에 죽을 때 double-close panic을 방지한다.

- **종료 전파 없음**: Writer가 죽었는데 Reader가 `Recv()`에서 영원히 블로킹 → goroutine, TCP fd, 큐 메모리가 영원히 해제되지 않는다.
- **context.Cancel() 단독**: `Recv()`가 블로킹 중이면 `select <-ctx.Done()`에 도달하지 못한다. context만으로는 네트워크 I/O를 깨뜨릴 수 없다. OS-level deadline이 필요하다.

### Heartbeat — Liveness Detection

서버와 클라이언트간 커넥션이 맺어져 있는 상황에서 'IVI/모바일 네트워크 끊김', 'NAT Timeout', 'WiFi disconnect', '앱 강제 종료' 등이 발생하면
클라이언트는 커넥션이 종료되었음에도 서버는 TCP Connection 이 살아있는 것처럼(ESTABLISHED) 인식한다. 
왜냐하면 TCP는 상대방이 갑자기 사라져도(네트워크 케이블 분리, 프로세스 강제 종료, OS crash) 알 수 없다.
이것이 **Half-Open Connection** 이다. Half-Open Connection 문제를 해결하기 위해서는 **상대방이 살아있는지 주기적으로 확인** 해야 한다.

TCP Keep-Alive가 있지만 기본 간격이 2시간이라 실시간 시스템에는 부적합하다.

10,000개 커넥션 중 1,000개가 half-open이면 서버 자원의 10%가 유령에게 소비된다. Registry에도 유령이 남아 "이 디바이스는 연결됨"이라고 잘못 보고한다.

<mark><em><strong>생존 감지의 본질은 "무음을 죽음과 구분하는 메커니즘"이다. "주기적 신호 + 응답 타임아웃"이 이 구분을 가능하게 한다. 타임아웃 없는 신호는 무의미하고, 신호 없는 타임아웃은 데이터 전송 시에만 작동한다.</strong></em></mark>

WebSocket의 ***[Ping/Pong 프레임(RFC 6455 §5.5)](https://datatracker.ietf.org/doc/html/rfc6455)*** 을 활용한다. 서버가 주기적으로 Ping(2바이트)을 보내고, 클라이언트는 Pong으로 응답한다. 핵심은 **ReadDeadline이 곧 Pong 타임아웃**이라는 것이다:

1. 커넥션 수립 시 ReadDeadline = PingInterval + PongTimeout
2. Pong 수신 → PongHandler에서 ReadDeadline을 미래로 리셋
3. Pong 미수신 → ReadDeadline 만료 → `Recv()` 에러 → 커넥션 Close

별도의 "pong miss counter"가 필요 없다. ReadDeadline이 자연스럽게 타임아웃 역할을 한다.

서버→클라이언트 단방향 Ping만으로 충분하다. 클라이언트는 `Recv()` 실패로 서버의 죽음을 감지한다.

__Code__:

```go
const (
    pingInterval = 15 * time.Second
    pongTimeout  = 5 * time.Second
)

// StartHeartbeat initializes the ping/pong mechanism with ReadDeadline-based timeout.
func (c *Connection) StartHeartbeat() {
    // Initial deadline: if no pong within interval+timeout, connection is dead
    c.transport.SetReadDeadline(time.Now().Add(pingInterval + pongTimeout))

    // Pong handler:
    // 상대방이 Ping에 응답하면 이 핸들러가 호출된다.
    // 여기서 하는 일은 단 하나 → deadline을 미래로 연장
    //
    // 중요:
    // - 별도의 "pong miss counter" 필요 없음
    // - deadline 자체가 timeout 역할을 수행
    _ = c.transport.SetPongHandler(func() error {
        // Pong을 받았다는 것은 연결이 살아있다는 의미
        // → 다시 pingInterval + pongTimeout 만큼 생존 시간 연장
        return c.transport.SetReadDeadline(time.Now().Add(pingInterval + pongTimeout))
    })

    // Ping 전송 루프 시작 (비동기)
    go c.pingLoop()
}

func (c *Connection) pingLoop() {
    ticker := time.NewTicker(pingInterval)
    defer ticker.Stop()
    for {
        select {
        case <-ticker.C:
            // Write 실패는 다음을 의미:
            // - TCP 연결 끊김
            // - 네트워크 단절
            // - 상대방 프로세스 종료
            //
            // → 즉시 connection 종료
            if err := c.transport.WritePing(nil); err != nil {
                c.close(DisconnectPingError)
                return
            }
        case <-c.closedCh:
            return
        }
    }
}
```

dead connection 감지 최대 시간 = PingInterval + PongTimeout. 15s + 5s = 20s. 이것은 **"허용 가능한 유령 시간"에 대한 운영 판단**이다.

한 가지 보충하면, write failure(broken pipe, ECONNRESET)도 상대방의 죽음을 알려주는 신호다. 데이터를 보내는 순간 네트워크가 끊겨 있으면 WriteDeadline 만료로 즉시 에러가 반환되므로, Ping 주기를 기다리지 않고 감지할 수 있다. 다만 이것은 "마침 보낼 데이터가 있을 때"만 작동하는 수동적(passive) 감지다. 아무 데이터도 보내지 않는 idle 구간에서는 여전히 Ping/Pong이 유일한 능동적(active) 감지 수단이다.

__Anti-Pattern__
- **무거운 요청으로 Heartbeat를 대체**: 15초마다 전체 상태 동기화 요청을 보내면 대역폭 낭비. Heartbeat의 목적은 "살아있는가"만 확인하는 것이다. WebSocket Ping은 2바이트면 충분하다
- **타임아웃 없는 Ping**: Ping을 보내고 Pong을 기다리되 타임아웃이 없으면 half-open과 동일하다
- **데이터 유무로 생존 판단**: "최근 N초 내 메시지가 없으면 죽음" → 할 말이 없는 정상 상태와 구분 불가

### Identity — Server-Side Stamping

클라이언트가 보낸 발신자 ID를 그대로 신뢰하면, 악의적이든 버그이든 다른 디바이스를 사칭할 수 있다. 모든 하류 처리자(handler, router, command queue)가 독립적으로 "이 메시지가 정말 이 커넥션에서 왔는가?"를 검증해야 하고, **한 곳이라도 누락되면 보안 구멍**이 된다.

<mark><em><strong>신원의 본질은 "인증 경계에서 한 번 확정하고, 이후 경로에서 무조건 신뢰하는 것"이다.</strong></em></mark> 확정 지점이 늦어지거나 없으면, 신뢰 비용이 처리 경로 전체로 확산된다. 

서버가 인증 시점에 확정한 ID를 모든 메시지에 강제 덮어쓰면, 이후 모든 코드가 `msg.SenderID`를 무조건 신뢰할 수 있다. 검증 비용이 O(N x M)에서 O(M)으로 줄어든다.

eader가 메시지를 디코딩한 직후, handler에게 전달하기 직전에 서버가 인증한 ID로 강제 덮어쓴다. 이 지점이 **신뢰 경계(trust boundary)** 다. 이전은 신뢰 불가, 이후는 무조건 신뢰.

mTLS 환경이라면 TLS 인증서의 CN(Common Name)에서, JWT 환경이라면 토큰의 subject에서 ID를 추출한다. 인증 방식이 무엇이든 원리는 동일하다.

__Code__:

```go
func (c *Connection) readLoop() {
    defer c.queue.Close()
    for {
        data, err := c.transport.Recv()
        if err != nil {
            return
        }
        msg, err := decode(data)
        if err != nil {
            c.close(DisconnectBadRequest)
            return
        }
        // Server-side stamp: overwrite sender with the identity
        // established during TLS/JWT authentication.
        // After this line, all downstream code trusts msg.SenderID unconditionally.
        msg.SenderID = c.authenticatedID
        c.handler.OnMessage(c, msg)
    }
}
```

__Anti-Pattern__:
- **클라이언트 자기선언 ID**: 클라이언트가 `deviceId`를 자유롭게 설정 → 스푸핑 가능 → 모든 handler에서 별도 검증 필요 → 검증 누락 시 보안 구멍
- **인증 없는 커넥션 허용**: 누구든 연결 가능 → 서버 자원 고갈 공격

### Routing — Sharded Registry

실시간 메시징에서 **전달 패턴이 자료구조를 결정한다**:

- **1:1 (서버↔디바이스)**: `map[deviceID]*Connection`. 단순 조회(lookup)면 충분하다.
- **1:N (pub/sub)**: `map[channelID]map[subscriberID]*Connection`. 구독 관리 + 팬아웃(fan-out) 필요.
- **N:M (topic broker)**: 파티셔닝, 오프셋 추적, 리밸런싱 추가.

64개 샤드로 분할된 맵(sharded map). FNV-1a 해시로 deviceID를 샤드에 매핑한다. 각 샤드가 자체 RWMutex를 가지므로 동시성이 높은 Register/Lookup 연산에서 lock 경합이 감소한다.

불변식: **1 Device = 1 Connection**. 같은 ID로 재연결 시 기존 커넥션을 강제 종료(kick)하고 새 커넥션을 등록한다.

```go
const numShards = 64

type shard struct {
    mu    sync.RWMutex
    conns map[string]Connection
}

// Registry is a sharded map that routes deviceID → Connection.
type Registry struct {
    shards [numShards]shard
    count  atomic.Int64
}

func shardIndex(id string) int {
    h := fnv.New32a()
    h.Write([]byte(id))
    return int(h.Sum32() % numShards)
}

// Register adds a connection. If an existing connection with the same ID exists,
// it is forcefully closed (kick-on-reconnect) to maintain the 1:1 invariant.
func (r *Registry) Register(id string, c Connection) {
    s := &r.shards[shardIndex(id)]
    s.mu.Lock()
    if old, exists := s.conns[id]; exists {
        old.Close(DisconnectStale) // kick existing
    } else {
        r.count.Add(1)
    }
    s.conns[id] = c
    s.mu.Unlock()
}

// Lookup returns the connection for the given ID, or nil if not found. O(1).
func (r *Registry) Lookup(id string) Connection {
    s := &r.shards[shardIndex(id)]
    s.mu.RLock()
    c := s.conns[id]
    s.mu.RUnlock()
    return c
}
```

- **1:1에 Hub 적용**: 구독 관리 오버헤드 + 불필요한 복잡도. 전달 패턴을 분석하지 않고 자료구조를 선택하면 과잉 설계
- **샤딩 없는 단일 map**: 10K+ 동시 커넥션에서 Register/Deregister 빈발 → 단일 RWMutex 경합 → throughput 병목
- **Kick 없이 중복 등록**: 같은 ID로 2개 커넥션 공존 → 메시지가 어디로 갈지 비결정적 → 상태 불일치

위 코드에서 `Register`와 `Lookup`만 보여줬지만, 프로덕션에서는 커넥션 종료 시 map에서 제거하는 `Deregister`가 반드시 필요하다. 없으면 종료된 커넥션이 map에 남아 메모리 누수와 stale 참조가 발생한다. 이때 주의할 점은 **인스턴스 비교**다. 재연결 경쟁 상황에서 old Connection A의 정리 루틴이 이미 교체된 new Connection B의 등록을 제거하면 안 된다. 현재 등록된 인스턴스가 제거하려는 인스턴스와 동일할 때만 삭제하는 것이 안전하다.

### Delivery 

Delivery 는 ***[Telsa Vehicle Command](https://klarciel.net/wiki/sdv/sdv-tesla-signed-command-protocol/)*** 를 참고하여 작성하기 때문에
***Domain-Based Guarantee*** 를 전제로 한다.

<mark><em><strong>전달 보장의 수준은 "실패 시 재전송의 비용" 이 결정한다.</strong></em></mark>

전달 보장은 비용 함수다. at-least-once의 비용(복잡도, 자원, 지연)이 유실 비용보다 작은 도메인에만 적용한다. 나머지는 유실을 허용하는 것이 합리적이다.

문 잠금 명령이 유실되면 보안 위협이다 — 재전송 비용(ACK 추적 + retry)은 유실 비용에 비하면 미미하다. 반면 텔레메트리(속도, 배터리 상태)는 초당 수십 건 발생하고, 유실되면 다음 배치에서 최신값이 온다. 재전송하면 이미 낡은 값을 보내는 셈이다.

따라서 **재전송 비용 < 유실 비용인 도메인만 at-least-once**를 적용하고, 나머지는 at-most-once면 충분하다. 모든 메시지에 at-least-once를 적용하는 것은 과잉이다.

도메인(보안 경계)별로 전달 정책을 차등 적용한다:

| Domain | Guarantee | Reason |
|--------|-----------|--------|
| SECURITY | at-least-once | 유실 비용(보안 위협) >>> 재전송 비용(ACK + retry) |
| CONTROL | at-most-once + UX retry | 사용자가 재시도 여부를 결정 (시트 열선, 에어컨 등) |
| TELEMETRY | at-most-once | 다음 배치에서 최신값이 온다. 재전송은 낡은 데이터 전송 |

```go
// DomainRouter dispatches messages based on their security domain.
type DomainRouter struct {
    security  DomainHandler // at-least-once: ACK + retry + offline queue
    control   DomainHandler // at-most-once: forward + retriable flag
    telemetry DomainHandler // at-most-once: latest-wins, no retry
}

func (r *DomainRouter) OnMessage(conn *Connection, msg *Message) {
    switch msg.Domain {
    case DomainSecurity:
        r.security.Handle(conn, msg)
    case DomainControl:
        r.control.Handle(conn, msg)
    case DomainTelemetry:
        r.telemetry.Handle(conn, msg)
    }
}

// ControlHandler forwards commands with at-most-once semantics.
// If the target is offline, it reports failure — the app UI decides whether to retry.
type ControlHandler struct {
    registry *Registry
}

func (h *ControlHandler) Handle(conn *Connection, msg *Message) {
    target := h.registry.Lookup(msg.TargetID)
    if target == nil {
        conn.SendAck(msg.CommandID, StatusFailed, "device offline")
        return
    }
    target.Enqueue(msg.Data)
    conn.SendAck(msg.CommandID, StatusCompleted, "")
}

// SecurityHandler provides at-least-once delivery with ACK tracking and offline queue.
type SecurityHandler struct {
    registry *Registry
    pending  *CommandQueue  // ACK pending commands
    offline  *OfflineQueue  // Redis-backed queue for offline devices
}

func (h *SecurityHandler) Handle(conn *Connection, msg *Message) {
    h.pending.Store(msg.CommandID, msg)
    target := h.registry.Lookup(msg.TargetID)
    if target == nil {
        h.offline.Enqueue(msg)
        conn.SendAck(msg.CommandID, StatusQueued, "")
        return
    }
    target.Enqueue(msg.Data)
}
```

- **모든 메시지에 at-least-once**: 텔레메트리에 at-least-once 적용 시 초당 10만 배치 x ACK 추적 = 불필요한 서버 부하. 재전송된 낡은 텔레메트리가 State Cache의 최신값을 덮어쓸 수 있다 → 데이터 품질 저하
- **서버가 모든 재시도를 결정**: CONTROL 도메인에서 서버가 자동 재시도하면 사용자가 모르는 사이에 에어컨이 켜질 수 있다. "사용자가 재시도를 결정한다"는 유효한 전략이다

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 Clients                                     │
│                                                                             │
│     ┌────────────┐        ┌────────────┐        ┌────────────┐              │
│     │  Device    │        │ Mobile App │        │   Server   │              │
│     │ (WebSocket)│        │ (WebSocket)│        │   (gRPC)   │              │
│     └─────┬──────┘        └─────┬──────┘        └─────┬──────┘              │
└───────────┼─────────────────────┼─────────────────────┼─────────────────────┘
            │ mTLS                │ JWT                  │ mTLS
┌───────────▼─────────────────────▼─────────────────────▼─────────────────────┐
│                          Transport Layer                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Transport Interface: Recv | Send | WriteMany | Deadlines | Close     │  │
│  └──────┬───────────────────────┬────────────────────────┬───────────────┘  │
│  ┌──────▼──────┐  ┌─────────────▼─────────┐  ┌──────────▼──────────┐      │
│  │  WebSocket  │  │   gRPC (future)       │  │  MQTT (future)      │      │
│  └─────────────┘  └───────────────────────┘  └─────────────────────┘      │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                      Per-Connection Pipeline                                 │
│                                                                              │
│  ┌──────────────────────┐          ┌──────────────────────────────────────┐  │
│  │   Reader Goroutine   │          │       Writer Goroutine               │  │
│  │                      │          │                                      │  │
│  │  Recv()              │          │  queue.Wait()                        │  │
│  │   → ValidateSize     │          │   → RemoveMany (batch dequeue)       │  │
│  │   → Decode (protobuf)│          │   → Overflowed? → DisconnectSlow     │  │
│  │   → Validate         │ cross    │   → SetWriteDeadline(10s)            │  │
│  │   → Stamp Identity   │ signal   │   → WriteMany (batch send)           │  │
│  │   → handler.OnMsg()  │◄───────►│   → ClearDeadline                     │  │
│  └──────────┬───────────┘          └─────────────▲───────────────────────┘   │
│             │                                    │                           │
│             │            ┌───────────────────────┘                           │
│             │            │                                                   │
│             │   ┌────────┴─────────┐  ┌───────────────────────┐              │
│             │   │   Ring Buffer    │  │  Heartbeat Ticker     │              │
│             │   │   Queue (FIFO)   │  │  Ping(15s) / Pong(5s) │              │
│             │   │   1MB byte limit │  │  ReadDeadline reset   │              │
│             │   └──────────────────┘  └───────────────────────┘              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │ handler.OnMessage()
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                        Domain Router (3-Domain)                              │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐            │
│  │   SECURITY     │  │   CONTROL      │  │   TELEMETRY          │            │
│  │  at-least-once │  │  at-most-once  │  │   at-most-once       │            │
│  │  ACK + retry   │  │  + UX retry    │  │   fire-and-forget    │            │
│  │  offline queue │  │  retriable     │  │   state cache        │            │
│  └───────┬────────┘  └───────┬────────┘  └───────────┬──────────┘            │
└──────────┼───────────────────┼───────────────────────┼───────────────────────┘
           │                   │                       │
┌──────────▼───────────────────▼───────────────────────▼───────────────────────┐
│                    Connection Registry (64-Shard Map)                        │
│                                                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐           ┌────────┐                       │
│  │Shard 0 │ │Shard 1 │ │Shard 2 │  · · ·   │Shard 63│                        │
│  │RWMutex │ │RWMutex │ │RWMutex │           │RWMutex │                       │
│  │map[id] │ │map[id] │ │map[id] │           │map[id] │                       │
│  └────────┘ └────────┘ └────────┘           └────────┘                       │
│                                                                              │
│  deviceID → FNV-1a hash → shard → O(1) lookup                                │
│  1:1 routing (no Hub/Pub-Sub needed)                                         │
│  Kick-on-reconnect: 1 Device = 1 Connection                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Inbound Message

```
 Client (Sender)
   │
   │  ① binary frame (protobuf)
   ▼
 Transport.Recv()           WebSocket ReadMessage
   │
   │  ② raw bytes
   ▼
 ValidateSize()             1MB 초과 시 거부
   │
   │  ③ size-checked bytes
   ▼
 Decode()                   proto.Unmarshal → Message 구조체
   │
   │  ④ decoded message
   ▼
 Validate()                 필수 필드, command_id 길이, TTL 범위
   │
   │  ⑤ validated message
   ▼
 Identity Stamp             msg.SenderID = conn.authenticatedID
 (Trust Boundary)           이 지점 이후: SenderID 무조건 신뢰
   │
   │  ⑥ stamped message
   ▼
 Domain Router              msg.Domain 기준 분기
   │
   │  ⑦ target deviceID 결정
   ▼
 Registry.Lookup()          O(1) shard lookup → target connection
   │
   │  ⑧ target found
   ▼
 Encode()                   Message → proto.Marshal → []byte
   │
   │  ⑨ serialized bytes
   ▼
 target.Enqueue()           Ring Buffer에 추가 (바이트 기반 역압)
   │
   │  (비동기: Writer goroutine)
   ▼
 queue.Wait() → RemoveMany  배치 디큐 (최대 16개)
   │
   ▼
 SetWriteDeadline(10s)      시간 기반 역압
   │
   ▼
 Transport.WriteMany()      배치 전송
   │
   ▼
 Client (Receiver)
```

## Recommended Package Structure

```
streaming-platform/
├── cmd/
│   └── server/
│       └── main.go                    # 진입점, 의존성 조립, graceful shutdown
│
├── internal/
│   ├── transport/                     # 전송 추상화 계층
│   │   ├── transport.go               #   Transport interface (7 methods)
│   │   ├── disconnect.go              #   연결 해제 코드 (Non-Terminal / Terminal)
│   │   └── websocket/                 #   WebSocket 구현체
│   │       ├── websocket.go           #     Transport interface 구현
│   │       └── server.go              #     HTTP → WebSocket 업그레이드
│   │
│   ├── connection/                    # 커넥션 라이프사이클 (1 conn = 2 goroutines)
│   │   ├── connection.go              #   Connection 구조체, Start/Close/Enqueue
│   │   ├── reader.go                  #   Reader goroutine (수신 → 검증 → 스탬핑 → 라우팅)
│   │   ├── writer.go                  #   Writer goroutine (큐 대기 → 배치 전송)
│   │   ├── heartbeat.go               #   Ping/Pong (ReadDeadline 리셋)
│   │   ├── status.go                  #   상태 머신 (Connecting→Connected→Closing→Closed)
│   │   ├── handler.go                 #   Handler interface (OnMessage 콜백)
│   │   └── router.go                  #   Domain Router (3-domain 분기)
│   │
│   ├── queue/                         # Per-connection 아웃바운드 큐
│   │   └── queue.go                   #   Ring Buffer (FIFO, 바이트 기반, 2x growth)
│   │
│   ├── command/                       # 도메인별 커맨드 처리
│   │   ├── security.go                #   SecurityHandler (at-least-once, ACK + retry)
│   │   ├── control.go                 #   ControlHandler (at-most-once, retriable flag)
│   │   └── locator.go                 #   ConnectionLocator (Registry 기반 조회)
│   │
│   ├── telemetry/                     # 텔레메트리 파이프라인
│   │   ├── handler.go                 #   TelemetryHandler (fire-and-forget, version dedup)
│   │   └── cache.go                   #   StateCache (최신값 캐시, version 기반 동시성 제어)
│   │
│   ├── socket/                        # 세션 관리 & 레지스트리
│   │   ├── manager.go                 #   SocketManager (Session Facade)
│   │   └── registry.go                #   Registry (64-shard map, FNV-1a, kick-on-reconnect)
│   │
│   ├── auth/                          # 인증
│   │   ├── mtls.go                    #   mTLS 인증서 기반 (CN → deviceID)
│   │   └── jwt.go                     #   JWT 토큰 기반
│   │
│   ├── vmsg/                          # 메시지 코덱
│   │   ├── encoder.go                 #   Message → []byte
│   │   ├── decoder.go                 #   []byte → Message
│   │   └── validator.go               #   구조적 검증
│   │
│   └── config/                        # 설정
│       └── config.go                  #   timeout, queue size, heartbeat 주기 등
│
├── pkg/
│   └── proto/                         # public API (생성된 protobuf 타입)
│
├── api/
│   └── proto/                         # .proto 소스 파일
│
└── go.mod
```

핵심 원칙:
- **internal/**: 모든 비즈니스 로직은 unexported. 외부 노출 최소화
- **패키지 = 책임**: 하나의 패키지는 하나의 본질을 담당한다 (transport, connection, queue, ...)
- **의존 방향**: transport ← connection → queue. connection이 transport와 queue를 조합한다

## Network Realities

프로덕션 환경에서 양방향 스트리밍 플랫폼은 이상적인 네트워크 위에서 동작하지 않는다. 아래는 반드시 대비해야 할 현실들이다.

### Half-Open Connections

TCP는 상태 기반 프로토콜이다. 양쪽이 SYN-ACK을 교환한 후 ESTABLISHED 상태에 진입하면, 실제로 데이터를 주고받기 전까지는 상대방의 상태를 알 수 없다 (RFC 9293 §3.5.2).

half-open이 발생하는 시나리오:
- **OS crash / 커널 패닉**: TCP FIN/RST 전송 불가
- **네트워크 케이블 분리 / 무선 연결 끊김**: 물리 계층 단절
- **모바일 기지국 핸드오버**: IP 변경 시 기존 TCP 세션 무효화
- **NAT/방화벽 타임아웃**: 무통신 세션의 매핑 제거

감지 방법: 애플리케이션 레벨 Heartbeat가 primary, TCP Keep-Alive는 secondary, Write 실패는 passive.

### Mobile / Vehicle Network Challenges

모바일 네트워크에서 기지국 핸드오버는 피할 수 없다:

| Handover Type | IP Change | Duration | TCP Impact |
|---------------|-----------|----------|------------|
| X2 (인접 기지국) | 없음 | 50-100ms | TCP 재전송으로 복구 |
| S1 (코어 경유) | 가능 | 100-300ms | TCP 세션 무효화 가능 |
| Inter-RAT (LTE↔5G) | 가능 | 0.5-2s | TCP 세션 무효화 높음 |

터널/지하 진입 시 셀룰러 신호가 차단되면 Ping/Pong 실패 → dead 판정 → 재연결이 필요하다.

### NAT Timeout

통신사 NAT 장비는 무통신 세션을 30초~5분 내에 매핑 테이블에서 제거한다. Ping 주기를 NAT 타임아웃보다 짧게 설정하면 NAT 매핑 유지와 liveness check을 동시에 달성할 수 있다.

### Reconnection Strategy

```
재연결 간격 = min(base × 2^attempt, max_interval) + random_jitter
```

- `base`: 1초 (첫 재연결은 빠르게)
- `max_interval`: 30초 (과도한 대기 방지)
- `jitter`: 0~1초 (uniform random)

**Full Jitter가 필수다.** 서버 재시작 시 수천 대의 디바이스가 동시에 재연결을 시도하면 thundering herd 문제가 발생한다. 서버에서 Close Code 1012 (Service Restart) + Retry-After를 전송하여 부하를 분산할 수 있다.

### Graceful Shutdown (Connection Draining)

```
1. 새 서버 인스턴스 시작 (health check 통과 대기)
2. 기존 서버: 새 연결 수신 중단 (listener close)
3. 기존 연결에 Close Frame (1012, "Service Restart") 전송
4. Grace period (30초) 동안 in-flight 메시지 처리
5. 미종료 연결 강제 종료
6. 기존 서버 프로세스 종료
```

핵심 원칙: SIGTERM → context cancellation → close channel → queue close + read deadline. **종료도 전파다.**

### Key Timeout Values

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Ping interval | 15s | NAT timeout(30s) - margin(15s) |
| Pong timeout | 5s | Mobile LTE RTT variance |
| Write deadline (data) | 10s | Allow 1-2 TCP retransmissions |
| Write deadline (ping) | 5s | Small frame, fast response expected |
| Dead connection detection | 20s | PingInterval + PongTimeout |
| Reconnect base | 1s | Fast first reconnect |
| Reconnect max | 30s | Prevent excessive wait |
| Drain grace period | 30s | In-flight message processing |

## Conclusion

9가지 본질을 한 문장씩 요약한다:

1. **Transport**: 시간 제한 있는 바이트 I/O만 추상화하면 상위 계층이 프로토콜에 독립적이다.
2. **Connection**: 수신과 송신은 독립된 흐름이다. 결합하면 느린 쪽이 빠른 쪽을 지배한다.
3. **Queue**: 유한한 경계 안에서 속도 차이를 흡수한다. 경계 없으면 느린 하나가 전체를 죽인다.
4. **Backpressure**: 시간(deadline)과 공간(byte limit) 두 축뿐이다. 나머지는 최적화이지 배압이 아니다.
5. **Termination**: 상대방의 블로킹을 깨뜨리는 것이 종료의 전부다.
6. **Heartbeat**: 주기적 신호 + 응답 타임아웃 = 생존 감지. 타임아웃 없는 신호는 무의미하다.
7. **Identity**: 인증 경계에서 한 번 확정하고, 이후 무조건 신뢰한다.
8. **Routing**: 전달 패턴(1:1, 1:N, N:M)이 자료구조를 결정한다.
9. **Delivery**: 재전송 비용 < 유실 비용인 도메인만 at-least-once.

이 9가지는 프로토콜이나 언어에 종속되지 않는다. WebSocket이든 gRPC이든, Go든 Rust든, 양방향 스트리밍 플랫폼의 핵심 파이프라인은 동일한 본질 위에 서 있다. 구현의 형태는 달라도 풀어야 할 문제의 본질은 변하지 않는다.
