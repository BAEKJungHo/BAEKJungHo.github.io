---
layout  : wiki
title   : MQTT
summary : Message Queuing Telemetry Transport
date    : 2023-10-06 15:02:32 +0900
updated : 2026-02-13 15:12:24 +0900
tag     : architecture mqtt messaging iot protocol
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---

* TOC
{:toc}

## What is MQTT

[MQTT(Message Queuing Telemetry Transport)](https://en.wikipedia.org/wiki/MQTT) 는 1999년 IBM 의 Andy Stanford-Clark 과 Arlen Nipper 가 설계한 경량 메시징 프로토콜이다. 원래 목적은 ***석유 파이프라인의 센서 데이터를 위성 링크를 통해 전송***하는 것이었다. 위성 통신은 대역폭이 극도로 제한되고 비용이 비싸기 때문에, 프로토콜 자체가 최소한의 오버헤드로 동작해야 했다.

이 배경을 이해하면 MQTT 의 본질이 보인다. ***네트워크 대역폭이 제한되고, 디바이스의 컴퓨팅 리소스가 부족한 환경에서 신뢰성 있는 메시지 전달을 보장***하는 것이 핵심이다.

MQTT 는 현재 [OASIS](https://www.oasis-open.org/) 에서 관리하는 공개 표준이며, ISO 표준(ISO/IEC 20922)으로도 등록되어 있다. 가장 널리 사용되는 버전은 [MQTT 3.1.1](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html) 과 [MQTT 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html) 이다.

> MQTT 라는 이름에 "Message Queuing" 이 포함되어 있지만, ***MQTT 는 전통적인 메시지 큐(queue)가 아니다.*** 메시지 큐는 consumer 가 메시지를 가져갈 때까지 큐에 저장하는 point-to-point 모델이지만, MQTT 는 ***publish/subscribe 모델***을 사용한다. Topic 기반으로 메시지를 라우팅하며, 하나의 메시지가 여러 subscriber 에게 동시에 전달될 수 있다.

### Why TCP

MQTT 는 ***TCP/IP 위에서 동작***한다. 왜 UDP 가 아닌 TCP 를 선택했을까?

센서 데이터는 반드시 전달되어야 한다. 파이프라인의 압력 데이터가 유실되면 심각한 사고로 이어질 수 있다. ***[TCP 는 패킷 순서 보장과 재전송 메커니즘을 제공](https://klarciel.net/wiki/network/network-socket-protocol/#transmission-control-protocol)*** 하므로, MQTT 는 이 위에서 ***애플리케이션 레벨의 메시지 전달 보장(QoS)*** 을 추가로 구현하는 구조다.

TCP 가 이미 신뢰성을 보장하는데 왜 QoS 가 필요한지 의문이 들 수 있다. TCP 는 ***세그먼트 레벨***의 전달만 보장한다. 브로커가 메시지를 받아서 구독자에게 전달하는 과정, 또는 클라이언트가 재접속 후 이전 세션의 메시지를 받는 과정은 TCP 가 보장하지 못한다. MQTT 의 QoS 는 이 ***애플리케이션 레벨의 간극***을 메운다.

## Protocol Design and Packet Structure

MQTT 의 강점 중 하나는 ***극도로 간결한 패킷 구조***이다. 모든 MQTT Control Packet 은 최대 세 부분으로 구성된다.

```
┌──────────────┬──────────────────┬─────────┐
│ Fixed Header │ Variable Header  │ Payload │
│  (필수)       │  (일부 패킷만)      │ (일부)   │
└──────────────┴──────────────────┴─────────┘
```

### Fixed Header

Fixed Header 는 ***모든 MQTT 패킷에 존재***하며, 최소 2바이트로 구성된다.

```
Byte 1:
  Bit 7-4: Packet Type (4비트 → 최대 16종류의 패킷 타입)
  Bit 3-0: Flags (패킷 타입에 따라 의미가 다름)

Byte 2+:
  Remaining Length (가변 길이 인코딩)
```

***Remaining Length 인코딩***은 MQTT 설계의 핵심 아이디어 중 하나다. 각 바이트의 하위 7비트가 값을 나타내고, 최상위 비트(MSB)는 continuation bit 으로 사용된다. 최대 4바이트까지 사용할 수 있어, 하나의 MQTT 패킷은 최대 약 256MB(268,435,455 바이트)의 데이터를 담을 수 있다.

| 바이트 수 | 표현 가능 범위 |
|-----------|---------------|
| 1 | 0 ~ 127 |
| 2 | 128 ~ 16,383 |
| 3 | 16,384 ~ 2,097,151 |
| 4 | 2,097,152 ~ 268,435,455 |

이 방식 덕분에 대부분의 IoT 메시지(수십~수백 바이트)는 Remaining Length 에 ***1바이트만 사용***하여 오버헤드를 최소화한다.

### Variable Header

패킷 타입에 따라 Variable Header 의 내용이 달라진다. 대표적인 필드는 다음과 같다.

- ***Packet Identifier***: QoS 1, 2 에서 메시지를 추적하기 위한 2바이트 식별자. 동시에 진행 중인 메시지 플로우를 구분하는 데 사용된다.
- ***Topic Name***: PUBLISH 패킷에서 메시지의 목적지를 나타내는 UTF-8 인코딩 문자열.
- ***Properties*** (MQTT 5.0): Key-Value 형태의 확장 속성. User Properties, Message Expiry Interval 등이 여기에 포함된다.

### Payload

Payload 는 실제 전송할 애플리케이션 데이터이다. 모든 패킷에 Payload 가 있는 것은 아니다.

| Packet Type | Payload 유무 |
|------------|-------------|
| CONNECT | 필수 (Client ID, Will Message 등) |
| PUBLISH | 선택 (애플리케이션 메시지) |
| SUBSCRIBE | 필수 (구독할 토픽 필터 목록) |
| PINGREQ | 없음 |
| DISCONNECT | 없음 |

***PINGREQ 패킷은 Fixed Header 만으로 구성***되어 총 2바이트이다. 이것이 "가장 작은 MQTT 제어 메시지는 2바이트" 라고 하는 근거이다.

### Control Packet Types

MQTT 는 14가지 Control Packet 타입을 정의한다.

| 값 | 패킷 | 방향 | 용도 |
|---|------|------|------|
| 1 | CONNECT | Client → Broker | 연결 요청 |
| 2 | CONNACK | Broker → Client | 연결 응답 |
| 3 | PUBLISH | 양방향 | 메시지 발행 |
| 4 | PUBACK | 양방향 | QoS 1 응답 |
| 5 | PUBREC | 양방향 | QoS 2 수신 확인 |
| 6 | PUBREL | 양방향 | QoS 2 릴리즈 |
| 7 | PUBCOMP | 양방향 | QoS 2 완료 |
| 8 | SUBSCRIBE | Client → Broker | 구독 요청 |
| 9 | SUBACK | Broker → Client | 구독 응답 |
| 10 | UNSUBSCRIBE | Client → Broker | 구독 해제 |
| 11 | UNSUBACK | Broker → Client | 구독 해제 응답 |
| 12 | PINGREQ | Client → Broker | 연결 유지 핑 |
| 13 | PINGRESP | Broker → Client | 핑 응답 |
| 14 | DISCONNECT | 양방향 (5.0) | 연결 해제 |

## Publish/Subscribe Model in MQTT

MQTT 는 [publish/subscribe 아키텍처](https://baekjungho.github.io/wiki/architecture/architecture-pub-sub/)를 따른다. 모든 통신은 ***broker***를 중심으로 이루어지며, publisher 와 subscriber 는 서로의 존재를 알 필요가 없다.

> __Typical Architecture__:
>
> ![](/resource/wiki/architecture-mqtt/mqtt-base-architecture.png)
>
> 위와 같은 방식은 __브로커 운영 관리와 메시지 유실 방지를 위한 중복된 스토리지 운영 관리__ 가 필요하다.
>
> `저장 후 전달 (store and forward)` 전략이 MQTT 뿐만 아니라 모든 메시지 브로커들의 일반적인 설계 전략이라고 할 수 있다. 브로커가 전달한 메시지를 수신한 수집 애플리케이션은 서비스에 이용하기 편리한 구조로 변환하여 (RDBMS 나 NoSQL 과 같은 데이터베이스에) 저장한다. 시스템을 구축한 후에는 서비스를 안정적으로 운영하기 위해서 두 가지의 스토리지 (MQTT 의 저장소, 애플리케이션의 저장소)를 관리해야만 하며 장애에 대처해야 한다.
>
> 이러한 문제를 해결하기 위해, 센서가 텔레 메트릭 데이터를 MQTT 를 통해 직접 데이터베이스로 전송하는 방식인 [machbase-neo](https://machbase.com/neo/) 가 있다.
>
> __Machbase Architecture__:
>
> ![](/resource/wiki/architecture-mqtt/mqtt-machbase.png)

### Topic Structure and Wildcards

MQTT 에서 메시지 라우팅의 핵심은 ***Topic***이다. Topic 은 `/` 로 구분되는 계층 구조의 UTF-8 문자열이다.

```
building/floor1/room101/temperature
vehicle/vin12345/speed
factory/line-a/machine-03/status
```

MQTT 는 두 가지 와일드카드를 제공한다.

- ***Single-level Wildcard (`+`)***: 하나의 토픽 레벨을 대체한다.
  - `building/+/room101/temperature` → floor1, floor2 등 모든 층의 room101 온도를 구독
- ***Multi-level Wildcard (`#`)***: 나머지 모든 토픽 레벨을 대체하며, ***토픽 필터의 마지막에만*** 사용할 수 있다.
  - `building/floor1/#` → floor1 하위의 모든 토픽을 구독

> ***Topic 설계 원칙***:
> - `$` 로 시작하는 토픽은 시스템 예약이다. `$SYS/` 토픽은 브로커의 내부 정보를 제공한다.
> - Leading `/` 사용을 피하라. `/building/floor1` 은 빈 문자열 레벨이 하나 추가된 것이다.
> - 토픽에 공백이나 특수문자를 넣지 마라. UTF-8 이 허용되지만 디버깅이 어려워진다.
> - 구체적이고 예측 가능한 계층 구조를 설계하라. 나중에 와일드카드 구독으로 유연하게 활용할 수 있다.

## Connection Lifecycle

MQTT 클라이언트와 브로커 간의 연결은 명확한 라이프사이클을 따른다.

### CONNECT and CONNACK

클라이언트가 브로커에 TCP 연결을 맺은 후, ***가장 먼저 CONNECT 패킷***을 보내야 한다. 브로커는 CONNACK 으로 응답한다.

CONNECT 패킷에 포함되는 주요 필드:

| 필드 | 설명 |
|------|------|
| Client ID | 클라이언트를 고유하게 식별하는 문자열. 세션 관리의 핵심 |
| Clean Session / Clean Start | 이전 세션을 이어갈지 여부 |
| Keep Alive | 연결 유지를 위한 최대 대기 시간(초) |
| Username / Password | 인증 정보 (선택) |
| Will Topic / Will Message | 비정상 종료 시 발행할 메시지 (선택) |
| Will QoS / Will Retain | Will Message 의 QoS 와 Retain 플래그 |

***Client ID 는 브로커 내에서 유일***해야 한다. 같은 Client ID 로 두 번째 클라이언트가 접속하면, 브로커는 기존 연결을 끊고 새 연결을 수립한다. 이 동작은 의도적인 설계이며, ***같은 디바이스가 재접속할 때 이전 세션을 인계받기 위함***이다. 하지만 실수로 Client ID 가 충돌하면 두 클라이언트가 서로의 연결을 반복적으로 끊는 "flapping" 현상이 발생할 수 있으므로 주의가 필요하다.

### Will, Retained Message

- **Retained Message(보관 메시지)**
  - 보통 MQTT는 메시지를 전달하고 나면 브로커가 이를 버린다. 하지만 메시지를 보낼 때 retain 플래그를 true로 설정하면, 브로커는 해당 토픽의 마지막 메시지를 메모리에 저장해 둔다.
  - 작동 방식: 새로운 구독자(Subscriber)가 해당 토픽을 구독하는 순간, 브로커는 게시자가 새로 메시지를 보낼 때까지 기다리지 않고 저장해 둔 마지막 메시지를 즉시 전송한다.
  - 용도: 장치의 현재 상태(온도, 전원 On/Off 등)를 공유할 때 유용하다. 구독자가 언제 접속하더라도 "지금 상태가 어떤지" 바로 알 수 있기 때문이다.
- **Will Message (LWT, Last Will and Testament)**
  - 갑작스러운 이별을 대비한 '유언장' 이다. 클라이언트가 브로커에 처음 연결할 때 **"나한테 문제가 생겨서 연결이 끊기면, 대신 이 메시지를 뿌려줘"** 라고 미리 등록해두는 메시지이다.
  - 작동 방식:
    - 정상 종료(Graceful Disconnect): 클라이언트가 직접 DISCONNECT 패킷을 보내고 종료하면 유언장은 발동되지 않는다.
    - 비정상 종료(Ungraceful Disconnect): 네트워크 장애, 배터리 방전 등으로 연결이 툭 끊기면, 브로커는 일정 시간(Keep Alive) 동안 응답이 없을 때 미리 설정된 Will Message 를 해당 토픽에 배포한다.
  - 용도: "장치 A가 오프라인 상태가 됨"을 다른 장치나 서버에 알릴 때 사용한다.
- **Will Retain (유언장 보관 설정)**
  - Will Message를 설정할 때 함께 설정할 수 있는 옵션이다.
  - 설명: Will Message에 retain 플래그를 거는 것이다.
  - 왜 필요한가?: 만약 어떤 장치가 갑자기 꺼졌는데, 그 이후에 접속한 관리자 앱(Subscriber)이 해당 장치의 상태를 확인하려 한다고 가정해보자.
    - Will Retain이 False라면: 관리자는 장치가 꺼졌다는 사실을 알 방법이 없다(메시지가 이미 지나갔으므로).
    - Will Retain이 True라면: 브로커는 "장치 꺼짐"이라는 유언장을 Retained Message로 보관한다. 따라서 나중에 접속한 관리자도 **"아, 이 녀석 마지막 상태가 오프라인이구나"** 라고 바로 알 수 있다.

Retained Message는 신규 구독자에게 해당 토픽의 최신 상태를 즉시 전달하기 위해 브로커에 저장해두는 메시지이며, Will Message는 클라이언트의 비정상 종료 시 브로커가 대신 발행해 주는 '유언장' 같은 메시지이다. 이 둘을 조합하면 장치의 실시간 가용성 상태를 완벽하게 관리할 수 있다.

### Keep Alive Mechanism

MQTT 연결은 TCP 위에서 동작하지만, TCP 의 keepalive 는 타임아웃이 매우 길다(기본 2시간). MQTT 는 ***자체적인 Keep Alive 메커니즘***을 갖고 있다.

클라이언트는 CONNECT 시 Keep Alive 값(초)을 설정한다. 이 시간 내에 다른 패킷을 보내지 않으면, ***PINGREQ 를 보내고 브로커는 PINGRESP 로 응답***한다. 브로커는 Keep Alive 의 ***1.5배*** 시간 동안 아무 패킷도 받지 못하면 클라이언트의 연결이 끊어진 것으로 판단한다.

```
Client                         Broker
  │                               │
  │──── PINGREQ ─────────────────>│
  │                               │
  │<───── PINGRESP ───────────────│
  │                               │
```

실무에서 Keep Alive 값 설정 시 고려할 점:
- ***너무 짧으면*** (예: 5초) 네트워크 일시 지연으로도 연결이 끊어질 수 있다.
- ***너무 길면*** (예: 300초) 클라이언트의 비정상 종료를 감지하는 데 오래 걸린다.
- 일반적으로 ***30~60초***가 적절하며, 모바일 환경에서는 NAT 테이블 유지를 위해 더 짧게 설정하기도 한다.

### Last Will and Testament (LWT)

***LWT 는 클라이언트가 비정상적으로 연결이 끊어졌을 때*** 브로커가 대신 발행하는 메시지이다. CONNECT 패킷에 미리 등록해 둔다.

LWT 가 트리거되는 경우:
- 네트워크 장애로 연결이 끊어졌을 때
- Keep Alive 시간이 초과했을 때
- 클라이언트가 DISCONNECT 패킷 없이 TCP 연결을 닫았을 때

LWT 가 트리거되지 ***않는*** 경우:
- 클라이언트가 정상적으로 DISCONNECT 를 보낸 후 연결을 종료한 경우

> ***실무 활용 패턴***: LWT 와 Retained Message 를 조합하면 디바이스 온라인 상태 모니터링을 구현할 수 있다.
>
> 1. CONNECT 시 Will Topic 을 `device/abc/status`, Will Message 를 `offline`, Will Retain 을 `true` 로 설정
> 2. 연결 성공 후 `device/abc/status` 에 `online` 을 Retained Message 로 발행
> 3. 비정상 종료 시 브로커가 자동으로 `offline` Retained Message 를 발행
> 4. 새로운 subscriber 가 `device/abc/status` 를 구독하면 항상 최신 상태(online/offline)를 즉시 받을 수 있다

### Clean Session vs Clean Start

MQTT 3.1.1 에서는 ***Clean Session*** 플래그를 사용한다.

- `Clean Session = 1`: 브로커가 이전 세션 정보를 모두 삭제하고 새로운 세션을 시작한다.
- `Clean Session = 0`: 이전 세션이 존재하면 이어서 사용한다. 세션에는 ***구독 정보, 미전달 QoS 1/2 메시지, 미완료 QoS 2 플로우***가 포함된다.

MQTT 5.0 에서는 이를 ***Clean Start*** 와 ***Session Expiry Interval*** 로 분리했다.

- `Clean Start`: 이전 세션을 폐기할지 여부 (boolean)
- `Session Expiry Interval`: 연결이 끊어진 후 세션을 얼마나 유지할지 (초 단위)
  - `0`: 연결 종료 즉시 세션 삭제 (Clean Session = 1 과 동일)
  - `0xFFFFFFFF`: 세션이 만료되지 않음

이 분리로 ***"연결은 새로 시작하되 이전 세션의 구독과 미전달 메시지는 유지"*** 같은 유연한 조합이 가능해졌다.

## Quality of Service (QoS)

QoS 는 MQTT 에서 ***가장 중요한 개념***이다. publisher 와 broker 사이, 그리고 broker 와 subscriber 사이에서 ***메시지 전달 보장 수준***을 정의한다.

핵심적으로 이해해야 할 점이 있다. ***QoS 는 end-to-end 가 아니라 hop-to-hop 으로 적용***된다. Publisher → Broker 구간과 Broker → Subscriber 구간에 각각 독립적으로 적용되며, subscriber 가 실제로 받는 QoS 는 ***publisher 의 QoS 와 subscriber 의 구독 QoS 중 낮은 값***이 된다.

### QoS 0: At Most Once

***Fire and forget*** 방식이다. publisher 가 메시지를 보내면, 그것으로 끝이다. 어떤 응답도 기다리지 않는다.

```
Publisher                      Broker
    │                             │
    │──── PUBLISH (QoS 0) ───────>│
    │                             │
```

- 브로커의 PUBACK 이 없으므로 ***메시지가 전달되었는지 알 수 없다.***
- TCP 의 전달 보장에만 의존한다.
- ***가장 빠르고 오버헤드가 적다.***
- 센서 데이터처럼 약간의 손실이 허용되고 높은 빈도로 발생하는 데이터에 적합하다.

### QoS 1: At Least Once

메시지가 ***최소 한 번은 전달***됨을 보장한다. 대신 ***중복 전달이 발생할 수 있다.***

```
Publisher                      Broker
    │                             │
    │──── PUBLISH (QoS 1) ───────>│
    │                             │
    │<───── PUBACK ───────────────│
    │                             │
```

동작 과정:
1. Publisher 가 PUBLISH 패킷을 보내고, Packet Identifier 를 기록한다.
2. Broker 가 메시지를 수신하면 PUBACK 을 응답한다.
3. Publisher 가 PUBACK 을 받으면 해당 메시지의 전달이 완료된 것으로 간주한다.

***중복이 발생하는 시나리오***:

```
Publisher                      Broker
    │                             │
    │──── PUBLISH ───────────────>│  (브로커가 메시지를 받고 처리)
    │                             │
    │     X <── PUBACK ───────────│  (PUBACK 이 네트워크에서 유실)
    │                             │
    │──── PUBLISH (DUP=1) ───────>│  (타임아웃 후 재전송)
    │                             │  (브로커는 같은 메시지를 다시 수신)
    │<───── PUBACK ───────────────│
    │                             │
```

PUBACK 이 유실되면 publisher 는 타임아웃 후 PUBLISH 를 재전송한다. 이때 ***DUP 플래그를 1 로 설정***하지만, 브로커는 이를 새로운 메시지로 처리할 수도 있다. MQTT 스펙에서 DUP 플래그는 ***수신자의 중복 처리를 강제하지 않는다.***

### QoS 2: Exactly Once

메시지가 ***정확히 한 번만 전달***됨을 보장한다. ***4-way handshake***를 사용한다.

```
Publisher                      Broker
    │                             │
    │──── PUBLISH (QoS 2) ───────>│  ① 메시지 전송
    │                             │
    │<───── PUBREC ───────────────│  ② 수신 확인
    │                             │
    │──── PUBREL ────────────────>│  ③ 릴리즈 (이 시점에 브로커가 subscriber 에게 전달)
    │                             │
    │<───── PUBCOMP ──────────────│  ④ 완료
    │                             │
```

***왜 4단계가 필요한가?***

2단계(PUBLISH → PUBACK)만으로는 중복을 방지할 수 없다는 것을 QoS 1 에서 확인했다. 핵심 문제는 ***"수신자가 메시지를 처리했는데, 발신자가 그 사실을 모르는"*** 상태가 발생하기 때문이다.

QoS 2 의 4-way handshake 는 이 문제를 ***Packet Identifier 의 라이프사이클 관리***로 해결한다.

1. **PUBLISH → PUBREC**: 수신자가 메시지를 저장하고, Packet ID 를 기록한다. 이 시점에서 수신자는 해당 Packet ID 의 메시지를 "수신 완료" 상태로 마킹한다.
2. **PUBREL → PUBCOMP**: 발신자가 PUBREL 을 보내면, 수신자는 ***PUBREL 을 경계선***으로 사용한다. PUBREL 이전에 도착하는 같은 Packet ID 의 PUBLISH 는 ***중복으로 처리***하고, PUBREL 이후에 도착하는 것은 ***새로운 메시지로 처리***한다.

이것이 CS 관점에서 중요한 이유는, PUBREL 이 ***분산 시스템에서의 "commit" 역할***을 한다는 점이다. 수신자가 PUBREL 을 받는 것은 "발신자가 PUBREC 을 확인했으니, 이제 이 Packet ID 를 해제해도 안전하다" 는 의미이다.

### QoS Downgrade

Publisher 가 QoS 2 로 메시지를 발행하더라도, subscriber 가 QoS 1 로 구독했다면 ***subscriber 는 QoS 1 로 메시지를 받는다.***

| Publisher QoS | Subscriber QoS | 실제 전달 QoS |
|:---:|:---:|:---:|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 0 | 2 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |
| 1 | 2 | 1 |
| 2 | 0 | 0 |
| 2 | 1 | 1 |
| 2 | 2 | 2 |

규칙은 단순하다: ***min(Publisher QoS, Subscriber QoS)*** 가 적용된다.

### Practical Considerations for QoS

***QoS 2 의 현실적인 비용***:

QoS 2 는 하나의 메시지에 대해 최소 4개의 패킷이 오가며, 각 단계에서 상태를 저장해야 한다. 브로커 입장에서 수천~수만 개의 동시 QoS 2 플로우를 관리하는 것은 ***메모리와 I/O 에 상당한 부담***이 된다.

> ***실무에서의 권장 패턴***: 대부분의 프로덕션 환경에서는 ***QoS 1 + 애플리케이션 레벨의 멱등성(idempotency)*** 조합이 QoS 2 보다 선호된다.
>
> - QoS 2 의 4-way handshake 오버헤드를 피할 수 있다.
> - 메시지에 고유 ID 를 포함시키고, 수신측에서 중복을 체크하는 것이 더 유연하고 제어 가능하다.
> - [멱등성 설계](https://baekjungho.github.io/wiki/architecture/architecture-idempotency-design/)는 MQTT 뿐만 아니라 전체 시스템의 안정성을 높인다.
>
> ***QoS 2 가 적합한 경우***: 과금(billing), 명령 실행(actuator control) 등 ***중복 처리가 시스템에 심각한 부작용을 초래***하는 경우에만 사용을 고려하라.

***"Exactly Once" 의 한계***:

QoS 2 는 ***MQTT 프로토콜 레벨에서의 exactly-once*** 이다. 전체 시스템 관점에서 end-to-end exactly-once 가 아니다. Publisher → Broker → Subscriber 경로에서 Broker 가 중간에 개입하므로, ***각 hop 에서 독립적으로 QoS 가 적용***된다. 예를 들어 브로커가 crash 후 복구되는 동안 메시지가 유실되거나 중복될 수 있다. 진정한 end-to-end exactly-once 가 필요하다면 ***애플리케이션 레벨의 deduplication 과 acknowledgment 가 반드시 병행***되어야 한다.

## Retained Messages

Retained Message 는 ***브로커가 토픽당 마지막 한 개의 메시지를 보관***하는 기능이다.

- Publisher 가 PUBLISH 패킷의 Retain 플래그를 1 로 설정하면, 브로커는 해당 메시지를 저장한다.
- 새로운 subscriber 가 해당 토픽을 구독하면, ***구독 즉시 마지막 retained message 를 전달***받는다.
- 같은 토픽에 새로운 retained message 가 오면, 이전 것을 대체한다.
- ***빈 payload 의 retained message 를 보내면*** 브로커에 저장된 retained message 가 삭제된다.

주의할 점:
- Retained message 는 ***토픽당 하나***만 유지된다. 히스토리가 아닌 "현재 상태" 를 나타내는 용도이다.
- ***와일드카드 구독***으로 여러 토픽의 retained message 를 한 번에 받을 수 있다.
- 브로커가 재시작되어도 retained message 가 유지되는지는 ***브로커 구현체의 영속화 설정***에 따라 다르다.

## Session and Persistent Session

MQTT 의 Session 은 클라이언트와 브로커 사이의 ***상태 정보 집합***이다.

브로커 측 Session State 가 포함하는 것:
- 클라이언트의 구독 목록
- QoS 1, 2 에서 아직 클라이언트에게 전달되지 않은 메시지
- QoS 2 에서 아직 완료되지 않은 메시지 플로우

클라이언트 측 Session State 가 포함하는 것:
- QoS 1, 2 에서 아직 브로커에게 확인받지 못한 메시지
- QoS 2 에서 아직 완료되지 않은 메시지 플로우

> ***Persistent Session 의 실무적 가치***: IoT 디바이스는 네트워크 불안정으로 인해 빈번하게 연결이 끊어질 수 있다. Persistent Session 을 사용하면 ***재접속 시 구독을 다시 등록할 필요가 없고, 오프라인 동안 발행된 메시지도 받을 수 있다.*** 다만, 브로커가 대량의 오프라인 메시지를 저장하면 메모리 부담이 커지므로 MQTT 5.0 의 ***Message Expiry Interval*** 을 함께 설정하는 것이 좋다.

## MQTT 5.0 Enhancements

MQTT 5.0 은 3.1.1 대비 ***상당한 기능 향상***을 제공한다. 주요 변경사항은 다음과 같다.

### Shared Subscriptions

***메시지를 여러 subscriber 에게 분산***하는 로드밸런싱 기능이다. 같은 그룹의 subscriber 들이 하나의 토픽을 구독하면, 메시지는 그룹 내 ***하나의 subscriber 에게만*** 전달된다.

토픽 필터 형식: `$share/<GroupID>/<Topic>`

```
$share/worker-group/sensor/temperature
```

이 기능이 없던 MQTT 3.1.1 에서는 모든 subscriber 가 같은 메시지를 받았기 때문에, ***수평 확장(horizontal scaling)이 어려웠다.*** Shared Subscription 으로 consumer group 패턴을 구현할 수 있게 되었다.

### Flow Control

MQTT 5.0 은 ***Receive Maximum*** 속성을 통해 흐름 제어를 지원한다.

- CONNECT, CONNACK 패킷에 ***동시에 처리 가능한 QoS 1/2 메시지 수***를 명시한다.
- 발신자는 초기 sending quota 를 Receive Maximum 값으로 설정한다.
- QoS 1/2 PUBLISH 를 보낼 때마다 quota 가 1 감소하고, PUBACK 이나 PUBCOMP 를 받으면 1 증가한다.
- ***quota 가 0 이면 더 이상 QoS 1/2 메시지를 보낼 수 없다*** (QoS 0 은 제한 없음).

이는 느린 subscriber 가 빠른 publisher 에 의해 ***메시지 폭주를 당하지 않도록*** 보호하는 메커니즘이다.

### Reason Codes

MQTT 3.1.1 에서는 CONNACK 에만 return code 가 있었다. MQTT 5.0 에서는 ***거의 모든 응답 패킷에 Reason Code*** 가 포함되어, 성공/실패 원인을 상세히 파악할 수 있다. 예를 들어 PUBACK 에 "Quota exceeded", SUBACK 에 "Subscription Identifiers not supported" 등의 구체적인 이유가 포함된다.

### User Properties

***Key-Value 형태의 사용자 정의 속성***을 패킷에 추가할 수 있다. HTTP 의 커스텀 헤더와 유사한 개념이다. correlation data, content type 등의 메타데이터를 전달하는 데 유용하다.

### Topic Alias

자주 사용하는 긴 토픽 이름을 ***정수 값으로 매핑***하여 패킷 크기를 줄이는 기능이다. 제한된 대역폭 환경에서 반복적으로 같은 토픽에 메시지를 발행할 때 효과적이다.

### Request/Response Pattern

MQTT 5.0 은 ***Response Topic*** 과 ***Correlation Data*** 속성을 통해 요청/응답 패턴을 공식적으로 지원한다. 기존에는 pub/sub 위에 임의 규약으로 구현해야 했던 것을 프로토콜 레벨에서 표준화했다.

### Session Expiry Interval and Message Expiry Interval

- ***Session Expiry Interval***: 연결이 끊어진 후 세션을 유지할 시간을 지정한다.
- ***Message Expiry Interval***: 개별 메시지에 TTL 을 설정한다. 만료된 메시지는 브로커가 자동으로 삭제한다.

이 두 속성을 조합하면 ***브로커의 메모리 사용량을 효과적으로 제어***할 수 있다.

## Security Considerations

MQTT 자체는 보안 메커니즘을 최소한으로 정의한다. 프로토콜의 경량성을 유지하면서, ***보안은 전송 계층과 애플리케이션 계층에 위임***하는 설계이다.

### Transport Layer Security

***TLS/SSL 을 사용한 전송 암호화***가 가장 기본적인 보안 수단이다. MQTT 의 기본 포트는 1883 이고, TLS 를 사용하는 경우 8883 이다.

- 서버 인증서 검증을 통해 브로커의 신원을 확인할 수 있다.
- ***Mutual TLS (mTLS)*** 를 사용하면 클라이언트 인증서로 디바이스를 인증할 수 있다. IoT 환경에서 디바이스마다 고유한 인증서를 발급하여 ***디바이스 단위의 인증***을 구현한다.

### Authentication

- ***Username/Password***: CONNECT 패킷에 포함. 간단하지만 TLS 없이는 평문으로 전송되므로 반드시 TLS 와 함께 사용해야 한다.
- ***Client Certificate***: mTLS 를 통한 인증. Username/Password 보다 강력하지만, 인증서 관리(발급, 갱신, 폐기)의 운영 부담이 있다.
- ***Token-based (OAuth 2.0, JWT)***: MQTT 5.0 의 Enhanced Authentication 이나 Username 필드에 토큰을 전달하는 방식. 기존 인증 인프라와 통합이 용이하다.

### Authorization (Topic-level ACL)

인증된 클라이언트라도 ***모든 토픽에 접근 가능해서는 안 된다.*** Topic-level ACL(Access Control List)을 통해 클라이언트별로 publish/subscribe 가능한 토픽을 제한해야 한다.

예시:
```
client "sensor-001":
  publish:  allow  "building/floor1/room101/#"
  subscribe: allow "building/floor1/room101/command"

client "dashboard":
  publish:  deny   "#"
  subscribe: allow "building/#"
```

### Payload Encryption

TLS 는 전송 구간만 암호화한다. ***브로커에 저장된 메시지는 평문***이다. 민감한 데이터는 ***애플리케이션 레벨에서 payload 를 암호화***하는 것을 고려해야 한다. 다만 이 경우 브로커가 payload 를 검사하거나 필터링하는 기능은 사용할 수 없다.

## Scalability and High-Traffic Production Concerns

MQTT 를 프로덕션 환경에서 대규모로 운영할 때 고려해야 할 사항들이다.

### Broker Clustering

단일 브로커는 ***단일 장애 지점(SPOF)***이 된다. 프로덕션 환경에서는 반드시 ***브로커 클러스터***를 구성해야 한다.

대표적인 클러스터링 지원 브로커:
- ***[EMQX](https://github.com/emqx/emqx)***: Erlang/OTP 기반, masterless 아키텍처. 단일 클러스터에서 [1억 동시 연결을 지원](https://docs.emqx.com/en/emqx/latest/deploy/cluster/introduction.html)한다고 알려져 있다.
- ***[HiveMQ](https://docs.hivemq.com/hivemq/latest/user-guide/cluster.html)***: Java 기반, 엔터프라이즈급 클러스터링. 메시지 유실 없는 전달에 강점이 있다.
- ***[VerneMQ](https://vernemq.com/)***: Erlang 기반, 오픈소스. Clustering 과 bridge 를 지원한다.

> ***클러스터 구성 시 핵심 과제***:
> - ***세션 상태 동기화***: 클라이언트가 다른 노드로 재접속할 때, 이전 세션 정보가 새 노드에서도 사용 가능해야 한다.
> - ***구독 테이블 동기화***: 어떤 노드에 연결된 클라이언트가 어떤 토픽을 구독하는지, 클러스터 전체가 알아야 메시지를 올바른 노드로 라우팅할 수 있다.
> - ***Split-brain 방지***: 네트워크 파티션 시 두 그룹이 독립적으로 동작하면 데이터 불일치가 발생한다.

### Load Balancing with Shared Subscriptions

MQTT 5.0 의 Shared Subscription 을 활용하면 ***subscriber 측의 수평 확장***이 가능하다. 하나의 토픽에 대해 여러 subscriber 인스턴스가 메시지를 분산 처리할 수 있다.

```
Publisher ──── topic: sensor/data ────> Broker
                                          │
                      ┌───────────────────┼───────────────────┐
                      ▼                   ▼                   ▼
                Subscriber A        Subscriber B        Subscriber C
              ($share/group/sensor/data)
```

### Message Persistence and Durability

메시지 유실을 방지하기 위한 전략:

1. ***QoS 1 이상 사용***: QoS 0 은 메시지 전달을 보장하지 않는다.
2. ***Persistent Session 활용***: 오프라인 subscriber 를 위해 브로커가 메시지를 보관한다.
3. ***브로커의 디스크 영속화 설정***: 브로커가 재시작되어도 메시지가 유실되지 않도록 디스크에 기록한다. 다만 디스크 I/O 는 성능에 영향을 주므로, ***SSD 사용과 적절한 flush 주기 설정***이 중요하다.
4. ***Message Expiry Interval 설정***: 오래된 메시지가 무한히 쌓이는 것을 방지한다.

### Backpressure and Flow Control

대용량 트래픽 환경에서 ***느린 subscriber 가 빠른 publisher 를 따라가지 못하는 상황***은 반드시 발생한다.

대응 전략:
- ***MQTT 5.0 의 Receive Maximum***: 프로토콜 레벨에서 전송 속도를 제한한다.
- ***브로커의 메시지 큐 크기 제한***: subscriber 별 미전달 메시지 큐에 상한을 두고, 초과 시 가장 오래된 메시지를 버리거나 연결을 끊는다.
- ***Inflight window 설정***: 동시에 처리 중인 메시지 수를 제한한다.

### Monitoring

대부분의 MQTT 브로커는 ***`$SYS/` 토픽***을 통해 내부 메트릭을 제공한다.

모니터링해야 할 핵심 메트릭:
- `$SYS/broker/clients/connected`: 현재 연결된 클라이언트 수
- `$SYS/broker/messages/received`: 수신한 메시지 수
- `$SYS/broker/messages/sent`: 전송한 메시지 수
- `$SYS/broker/subscriptions/count`: 전체 구독 수
- `$SYS/broker/retained messages/count`: retained message 수

이 외에도 브로커별로 [Prometheus](https://baekjungho.github.io/wiki/architecture/architecture-prometheus/) exporter 를 제공하거나, 자체 대시보드를 지원한다.

### Bridge

브로커 간 ***bridge 연결***을 통해 서로 다른 위치의 브로커 클러스터를 연결할 수 있다. 예를 들어 에지(edge) 브로커에서 수집한 데이터를 클라우드 브로커로 전달하는 구성이 가능하다.

```
Edge Broker (공장)  ──── bridge ────>  Cloud Broker (AWS/Azure)
                                            │
                                      Applications
```

__[AWS IoT Core](https://aws.amazon.com/ko/iot-core/)__ 같은 관리형 서비스를 사용하면 브로커 클러스터 운영 부담을 줄일 수 있다.

## MQTT vs Other Messaging Protocols

| 항목 | MQTT | [AMQP](https://baekjungho.github.io/wiki/architecture/architecture-amqp/) | Kafka |
|------|------|------|-------|
| 설계 목적 | IoT, 제한된 네트워크 | 엔터프라이즈 메시징 | 대용량 이벤트 스트리밍 |
| 전송 프로토콜 | TCP | TCP | TCP (자체 프로토콜) |
| 메시징 패턴 | Pub/Sub | Pub/Sub, Point-to-Point, Routing | Pub/Sub (Consumer Group) |
| 패킷 오버헤드 | 최소 2바이트 | 수십 바이트 | 가변 |
| 메시지 보관 | Retained (토픽당 1개) | 큐에 보관 (consume 시 삭제) | 분산 커밋 로그 (영구 보관) |
| 이벤트 재생 | 불가 | 불가 | 가능 (offset 기반) |
| QoS | 0, 1, 2 | ACK 기반 | ACK 기반 (acks 설정) |
| 적합한 환경 | 대량의 디바이스, 저대역폭 | 복잡한 라우팅, 비즈니스 로직 | 대용량 데이터 파이프라인 |

> Kafka 는 AMQP, STOMP, MQTT 같은 표준 프로토콜을 지원하지 않고, 자체 바이너리 프로토콜을 사용한다. 그럼에도 뛰어난 성능과 이벤트 전달 보장 특성으로 널리 사용된다. MQTT 와 Kafka 를 함께 사용하는 아키텍처도 흔하다. ***MQTT 브로커가 디바이스의 메시지를 수집하고, 브로커가 이를 Kafka 로 전달***하여 스트림 처리하는 패턴이다.

## Links

- [OASIS MQTT 3.1.1 Specification](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [OASIS MQTT 5.0 Specification](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- [Introducing the MQTT Protocol - HiveMQ Essentials Part 1](https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/)
- [MQTT Packets: A Comprehensive Guide - HiveMQ](https://www.hivemq.com/blog/mqtt-packets-comprehensive-guide/)
- [MQTT QoS 0, 1, 2 Explained - EMQX](https://www.emqx.com/en/blog/introduction-to-mqtt-qos)
- [MQTT 5.0 Shared Subscriptions - EMQX](https://www.emqx.com/en/blog/introduction-to-mqtt5-protocol-shared-subscription)
- [MQTT 5.0 Flow Control - EMQX](https://www.emqx.com/en/blog/mqtt5-flow-control)
- [MQTT Will Message Explained - EMQX](https://www.emqx.com/en/blog/use-of-mqtt-will-message)
- [MQTT Session and Clean Session - EMQX](https://www.emqx.com/en/blog/mqtt-session)
- [MQTT Retained Messages - HiveMQ Essentials Part 8](https://www.hivemq.com/blog/mqtt-essentials-part-8-retained-messages/)
- [MQTT Session and Message Expiry - HiveMQ Essentials Part 4](https://www.hivemq.com/blog/mqtt5-essentials-part4-session-and-message-expiry/)
- [Amazon What is MQTT](https://aws.amazon.com/ko/what-is/mqtt/)
- [MQTT Essential Guide - EMQX](https://www.emqx.com/en/mqtt-guide)
- [EMQX Clustering](https://docs.emqx.com/en/emqx/latest/deploy/cluster/introduction.html)
- [HiveMQ Broker Clusters](https://docs.hivemq.com/hivemq/latest/user-guide/cluster.html)
- [IoT 센서 데이터 플랫폼 구축과 MQTT](https://machbase.com/kr/home/blog/blog10/)
