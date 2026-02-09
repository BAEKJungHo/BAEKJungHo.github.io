---
layout  : wiki
title   : GRPC FUNDAMENTALS
summary :
date    : 2026-02-09 15:00:00 +0900
updated : 2026-02-09 15:00:00 +0900
tag     : grpc http protobuf network rpc architecture
toc     : true
comment : true
public  : true
parent  : [[/grpc]]
latex   : true
---
* TOC
{:toc}

# gRPC Fundamentals

## History of RPC

***[RPC(Remote Procedure Call)](https://en.wikipedia.org/wiki/Remote_procedure_call)*** 는 네트워크 상의 다른 컴퓨터에 있는 함수를 마치 로컬 함수처럼 호출하는 기술이다. 이 아이디어는 1984년 Birrell과 Nelson의 논문 "Implementing Remote Procedure Calls"에서 처음 체계화되었다.

RPC의 진화 과정은 다음과 같다.

| 시대 | 기술 | 특징 |
|------|------|------|
| 1984 | ***Sun RPC (ONC RPC)*** | 최초의 실용적 RPC. NFS(Network File System)의 기반. XDR로 직렬화 |
| 1991 | ***CORBA*** | OMG 표준. IDL 기반, 언어 독립적. 지나치게 복잡한 스펙이 단점 |
| 1998 | ***XML-RPC → SOAP*** | HTTP + XML 기반. WSDL로 스펙 정의. 엔터프라이즈에서 유행했으나 무거움 |
| 2000s | ***REST*** | HTTP 메서드와 URL 기반. JSON 사용. 단순하지만 타입 안전성이 없음 |
| 2015 | ***gRPC*** | Google이 내부 시스템(Stubby)을 오픈소스화. HTTP/2 + Protobuf |

CORBA와 SOAP의 실패에서 얻은 교훈은 명확하다. "스펙은 단순해야 하고, 구현은 자동화되어야 한다." gRPC는 이 교훈을 그대로 반영한다. .proto 파일 하나로 스펙과 코드를 동시에 해결한다.

## Core Philosophy

gRPC의 핵심 철학은 **"원격 함수 호출을 로컬 함수처럼"** 이다. 개발자는 네트워크 프로토콜, 직렬화, 연결 관리를 신경 쓰지 않고, 그냥 함수를 호출하면 된다.

```protobuf
// 서버에 정의된 서비스
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
}
```

```kotlin
// 클라이언트 코드 - 마치 로컬 함수처럼 호출
val user = userServiceStub.getUser(
    GetUserRequest.newBuilder().setUserId("user-123").build()
)
```

이 단순한 코드 뒤에서 gRPC는 Protobuf 직렬화, HTTP/2 전송, 연결 관리, 에러 처리를 모두 자동으로 수행한다.

## Architecture: Channel, Stub, Service

gRPC의 아키텍처는 세 가지 핵심 컴포넌트로 구성된다.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Stub (Generated Code)                                   │   │
│  │  - Blocking Stub / Async Stub / Future Stub              │   │
│  │  - 메서드 호출 → Protobuf 직렬화 → HTTP/2 프레임 전송      │   │
│  └──────────────┬───────────────────────────────────────────┘   │
│                 │                                               │
│  ┌──────────────▼───────────────────────────────────────────┐   │
│  │  Channel                                                 │   │
│  │  - TCP 연결 관리 (Connection Pool)                        │   │
│  │  - Load Balancing (pick_first, round_robin)              │   │
│  │  - Name Resolution (DNS, xDS)                            │   │
│  │  - Interceptor Chain                                     │   │
│  └──────────────┬───────────────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────────────┘
                  │  HTTP/2 (Binary Framing)
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Server Application                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Service Implementation                                  │   │
│  │  - proto에서 정의한 RPC 메서드의 실제 비즈니스 로직           │   │
│  │  - ServerInterceptor로 공통 관심사 처리                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

- ***Channel***: gRPC 클라이언트의 핵심이다. 하나 이상의 TCP 연결을 관리하며, 로드밸런싱과 네임 리졸루션을 담당한다. Channel은 **Thread-safe** 하며, 하나의 Channel을 여러 Stub이 공유할 수 있다. 애플리케이션 수명 동안 재사용하는 것이 권장된다.
- ***[Stub](https://en.wikipedia.org/wiki/Stub_(distributed_computing))***: protoc 컴파일러가 .proto 파일로부터 자동 생성하는 클라이언트 코드이다. 개발자가 호출하는 인터페이스 역할을 한다. 자세한 내용은 [Protobuffer](https://klarciel.net/wiki/grpc/grpc-protobuffer/)를 참고하면 된다.
- ***Service***: 서버 측에서 실제 비즈니스 로직을 구현하는 클래스이다. proto 파일에서 정의한 RPC 메서드를 오버라이드한다.

# Protocol Buffers

## What is Protobuf

***[Protocol Buffers(Protobuf)](https://protobuf.dev/)*** 는 Google이 개발한 언어 중립적, 플랫폼 중립적인 ***바이너리 직렬화(binary serialization)*** 포맷이다. 구조화된 데이터를 효율적으로 직렬화/역직렬화하기 위해 설계되었다.

Protobuf의 핵심 가치는 두 가지이다.

1. **성능**: JSON 대비 직렬화/역직렬화 속도가 월등히 빠르고, 패킷 크기가 작다.
2. **Source of Truth**: .proto 파일이 API의 ***[Single Source of Truth](https://en.wikipedia.org/wiki/Single_source_of_truth)*** 가 된다. 문서이자 코드이자 계약서이다.

## Proto3 Syntax

proto3의 핵심 문법을 살펴보자.

```protobuf
syntax = "proto3";

package example.user.v1;

option java_package = "com.example.user.v1";
option java_multiple_files = true;

import "google/protobuf/timestamp.proto";
import "google/protobuf/field_mask.proto";

// Enum: 사용자 상태
enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0;  // proto3에서 0번은 항상 기본값
  USER_STATUS_ACTIVE = 1;
  USER_STATUS_INACTIVE = 2;
  USER_STATUS_SUSPENDED = 3;
}

// Message: 사용자 정보
message User {
  string user_id = 1;
  string name = 2;
  string email = 3;
  UserStatus status = 4;
  repeated string roles = 5;              // 배열 (List)
  map<string, string> metadata = 6;       // Key-Value Map
  google.protobuf.Timestamp created_at = 7;

  // oneof: 알림 방식 중 하나만 선택
  oneof notification_channel {
    string phone_number = 8;
    string slack_webhook = 9;
    PushConfig push_config = 10;
  }
}

message PushConfig {
  string device_token = 1;
  string platform = 2;   // "ios" | "android"
}

// 서비스 정의
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc UpdateUser (UpdateUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);  // Server Streaming
}

message GetUserRequest {
  string user_id = 1;
}

message UpdateUserRequest {
  User user = 1;
  google.protobuf.FieldMask update_mask = 2;  // 부분 업데이트
}

message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
}
```

주요 타입별 특징을 정리하면 다음과 같다.

| 타입 | 설명 | 주의사항 |
|------|------|---------|
| `message` | 구조체. 필드 번호로 식별 | 필드 번호는 삭제하면 안 됨 (reserved 사용) |
| `enum` | 열거형. 0번이 기본값 | 첫 번째 값은 반드시 `UNSPECIFIED = 0` |
| `repeated` | 배열/리스트 | 빈 리스트가 기본값 |
| `map` | Key-Value 맵 | Key는 정수 또는 string만 가능 |
| `oneof` | Union 타입. 하나만 선택 | repeated 사용 불가, 기본값 감지 주의 |
| `optional` | 명시적 존재 여부 추적 | proto3에서 재도입됨 (has_field 확인 가능) |

## Wire Format

Protobuf가 빠른 이유를 이해하려면 ***Wire Format*** 을 알아야 한다. Protobuf는 각 필드를 `(field_number << 3) | wire_type` 형태의 ***Tag*** 와 값(Value)의 쌍으로 인코딩한다.

```
Tag = (field_number << 3) | wire_type
```

Wire Type은 값의 인코딩 방식을 결정한다.

| Wire Type | 값 | 사용하는 Protobuf 타입 |
|-----------|------|----------------------|
| 0 | Varint | int32, int64, uint32, uint64, sint32, sint64, bool, enum |
| 1 | 64-bit (fixed) | fixed64, sfixed64, double |
| 2 | Length-delimited | string, bytes, embedded messages, repeated fields (packed) |
| 3, 4 | Start/End Group | deprecated (proto2의 group 타입. 사용하지 않음) |
| 5 | 32-bit (fixed) | fixed32, sfixed32, float |

### Varint Encoding

***Varint*** 는 가변 길이 정수 인코딩이다. 작은 숫자는 적은 바이트로, 큰 숫자는 많은 바이트로 표현한다.

인코딩 규칙은 단순하다. 각 바이트의 ***MSB(Most Significant Bit)*** 가 1이면 "다음 바이트가 더 있다"는 뜻이고, 0이면 "이 바이트가 마지막"이라는 뜻이다.

예를 들어, 숫자 300을 Varint로 인코딩하는 과정을 보자.

```
300 = 100101100 (이진수, 9비트)

7비트씩 나눔 (Little Endian):
  하위 7비트: 0101100
  상위 7비트: 0000010

MSB 추가:
  첫 바이트: 1_0101100 = 0xAC  (MSB=1, 다음 바이트 있음)
  둘째 바이트: 0_0000010 = 0x02  (MSB=0, 마지막)

결과: 0xAC 0x02 (2 bytes)
```

비교하면, JSON에서 "300"은 3바이트(문자 '3', '0', '0')이다. Protobuf는 2바이트이다. 숫자 1은 Varint로 단 1바이트(0x01)이다. JSON에서는 필드명까지 포함하면 `"age":1` 처럼 6바이트 이상이 된다.

### Encoding Example

`User` 메시지에서 `user_id = "abc"` (field_number=1, wire_type=2)를 인코딩하면 다음과 같다.

```
Tag:   0x0A  →  (1 << 3) | 2  = 10  →  0x0A
Length: 0x03  →  3 bytes
Value:  0x61 0x62 0x63  →  "abc"

Wire: 0A 03 61 62 63  (총 5 bytes)
```

JSON으로 동일한 데이터를 표현하면 `{"user_id":"abc"}` 로 16바이트이다. Protobuf는 5바이트이다. 이 차이가 대량 트래픽에서 대역폭과 CPU 사용량의 차이로 직결된다.

## Schema Evolution

Protobuf의 실무적 강점 중 하나는 ***스키마 호환성(Schema Evolution)*** 이다. 서버와 클라이언트를 동시에 배포할 수 없는 환경(모바일 앱, 차량 소프트웨어 등)에서 이 특성은 필수적이다.

**Backward Compatibility (하위 호환)**: 새 코드가 이전 데이터를 읽을 수 있다.
- 새 필드 추가: 이전 데이터에 해당 필드가 없으면 기본값(0, "", false)으로 처리된다.

**Forward Compatibility (상위 호환)**: 이전 코드가 새 데이터를 읽을 수 있다.
- 이전 코드는 모르는 필드 번호를 만나면 무시(skip)한다. Wire Type을 보고 몇 바이트를 건너뛸지 판단할 수 있기 때문이다.

<mark><em><strong>Protobuf의 호환성은 "필드 이름"이 아니라 "필드 번호"로 식별하기 때문에 가능하다. 필드 이름은 Wire Format에 포함되지 않으며, 오직 필드 번호와 Wire Type만 전송된다.</strong></em></mark>

스키마 변경 시 지켜야 할 규칙은 다음과 같다.

| 허용 | 금지 |
|------|------|
| 새 필드 추가 (새 번호 사용) | 기존 필드 번호 변경 |
| 필드 이름 변경 (Wire에 영향 없음) | 기존 필드 번호 재사용 |
| 필드 삭제 (번호를 reserved로 등록) | Wire Type 변경 (int32 → string 등) |
| int32 ↔ int64 변환 (동일 Wire Type: Varint) | fixed32 → int32 (Wire Type 불일치: 5 vs 0) |
| string ↔ bytes 변환 (동일 Wire Type: Length-delimited) | enum ↔ string 변환 (Wire Type 불일치: 0 vs 2) |

```protobuf
message User {
  reserved 4, 8;             // 삭제된 필드 번호를 예약
  reserved "old_field_name"; // 삭제된 필드 이름을 예약
  string user_id = 1;
  string name = 2;
  // field 4 was 'status' - 삭제됨
}
```

## Oneof Semantics

`oneof`는 여러 필드 중 ***하나만*** 값을 가질 수 있는 Union 타입이다. C++ 구현에서는 실제로 메모리를 공유(union)하므로 메모리 효율적이다. 하나의 필드에 값을 설정하면 같은 oneof 내의 나머지 필드는 자동으로 초기화된다. oneof 필드에는 `repeated`를 사용할 수 없다.

주의할 점이 있다.

```java
// oneof 필드에 기본값을 설정하면?
User.newBuilder()
    .setPhoneNumber("")  // 빈 문자열 설정
    .build();

// hasPhoneNumber() == true  →  값이 설정된 것으로 판단
// 빈 문자열이더라도 "설정됨" 으로 인식됨
```

일반 필드에서 `""` (빈 문자열)은 기본값이므로 Wire에 포함되지 않지만, `oneof` 필드에서는 **어떤 값이든 설정하면** Wire에 포함된다. 이 차이를 인지하지 못하면 버그가 발생한다.

## Well-Known Types

Google은 자주 사용되는 타입들을 ***Well-Known Types*** 로 제공한다.

| 타입 | 용도 | 예시 |
|------|------|------|
| `google.protobuf.Timestamp` | 시간 표현 (seconds + nanos) | 생성일시, 수정일시 |
| `google.protobuf.Duration` | 시간 간격 | 타임아웃, TTL |
| `google.protobuf.FieldMask` | 부분 업데이트 | PATCH 연산 |
| `google.protobuf.Any` | 임의의 메시지 래핑 | 이벤트 페이로드 |
| `google.protobuf.Struct` | JSON 호환 구조 | 비정형 데이터 |
| `google.protobuf.Empty` | 빈 메시지 | 반환값 없는 RPC |

***[FieldMask](https://protobuf.dev/reference/csharp/api-docs/class/google/protobuf/well-known-types/field-mask.html)*** 는 특히 실무에서 중요하다. Netflix의 [Practical API Design at Netflix](https://netflixtechblog.com/practical-api-design-at-netflix-part-1-using-protobuf-fieldmask-35cfdc606518) 시리즈에서 상세하게 다루고 있다.

```protobuf
message UpdateUserRequest {
  User user = 1;
  google.protobuf.FieldMask update_mask = 2;
}
```

```java
// 이름만 업데이트
UpdateUserRequest request = UpdateUserRequest.newBuilder()
    .setUser(User.newBuilder().setName("New Name").build())
    .setUpdateMask(FieldMask.newBuilder().addPaths("name").build())
    .build();
// update_mask = { paths: ["name"] }
// → 서버는 name 필드만 업데이트하고 나머지는 건드리지 않는다.
```

## Protobuf vs JSON

| 항목 | Protobuf | JSON |
|------|----------|------|
| 포맷 | Binary | Text |
| 크기 | 작음 (JSON 대비 약 30~50%) | 큼 (필드명이 매번 포함) |
| 직렬화 속도 | 빠름 (CPU 부하 낮음) | 느림 (문자열 파싱 필요) |
| 타입 안전성 | 강함 (컴파일 타임 체크) | 약함 (런타임 검증 필요) |
| 사람이 읽기 | 불가능 (바이너리) | 가능 |
| 스키마 필수 | 예 (.proto 파일) | 아니오 (자유형) |
| 브라우저 지원 | 제한적 | 네이티브 (JSON.parse) |
| 호환성 관리 | 필드 번호 기반 자동 호환 | 수동 관리 |
| 디버깅 | 어려움 (도구 필요) | 쉬움 (curl로 확인 가능) |

# HTTP/2 as gRPC Transport

gRPC는 ***[HTTP/2](https://datatracker.ietf.org/doc/html/rfc9113)*** 를 전송 계층으로 사용한다. HTTP/2의 핵심 특징들이 gRPC의 고성능을 가능하게 한다. HTTP/2 Binary Framing Layer에 대한 기본 내용은 [High Performance; Binary Packet Protocol](https://klarciel.net/wiki/network/network-binary-based-protocol/)에서 다루고 있다.

## Binary Framing Layer

HTTP/2의 모든 통신은 ***프레임(Frame)*** 단위로 이루어진다. 프레임은 9바이트의 고정 헤더와 가변 길이의 페이로드로 구성된다.

```
+-----------------------------------------------+
|                 Length (24)                     |
+---------------+---------------+----------------+
|   Type (8)    |   Flags (8)   |
+-+-------------+---------------+----------------+
|R|         Stream Identifier (31)               |
+=+==============================================+
|              Frame Payload (0...)             ...
+------------------------------------------------+

총 헤더 크기: 3 + 1 + 1 + 4 = 9 bytes
```

- ***Length (24 bits)***: 페이로드의 크기. 최대 16,384 바이트 (기본값). SETTINGS_MAX_FRAME_SIZE로 변경 가능하며, 최대 16,777,215 바이트(약 16MB)까지 허용된다.
- ***Type (8 bits)***: 프레임의 종류를 나타낸다.
- ***Flags (8 bits)***: 프레임 타입에 따른 부가 정보. 예: END_STREAM, END_HEADERS, PADDED, PRIORITY.
- ***R (1 bit)***: 예약 비트. 항상 0이다.
- ***Stream Identifier (31 bits)***: 프레임이 속한 스트림의 ID. 0은 연결 전체에 대한 프레임(SETTINGS, PING, GOAWAY 등)을 의미한다.

## Frame Types

HTTP/2에서 정의하는 주요 프레임 타입은 다음과 같다.

| Type | 값 | 설명 |
|------|------|------|
| ***DATA*** | 0x0 | 실제 데이터(body) 전송. gRPC에서는 Protobuf로 직렬화된 메시지를 담는다 |
| ***HEADERS*** | 0x1 | HTTP 헤더 전송. HPACK으로 압축된 헤더 블록을 담는다 |
| ***PRIORITY*** | 0x2 | 스트림 우선순위 설정 (RFC 9113에서는 deprecated) |
| ***RST_STREAM*** | 0x3 | 스트림을 즉시 종료. 에러 코드 포함. gRPC Cancellation에 사용 |
| ***SETTINGS*** | 0x4 | 연결 수준 설정. 초기 윈도우 크기, 최대 프레임 크기, 최대 동시 스트림 수 등 |
| ***PING*** | 0x6 | 연결 활성 확인 및 RTT 측정. 8바이트 페이로드. gRPC Keepalive에 사용 |
| ***GOAWAY*** | 0x7 | 연결 종료 예고. 마지막으로 처리한 스트림 ID와 에러 코드 포함. Graceful Shutdown에 사용 |
| ***WINDOW_UPDATE*** | 0x8 | Flow Control 윈도우 크기 갱신. 스트림별 또는 연결 수준으로 설정 |

gRPC 통신의 흐름을 프레임 수준에서 보면 다음과 같다.

```
Client                              Server
  │                                    │
  │─── HEADERS (Stream 1) ───────────→ │  :method POST, :path /UserService/GetUser
  │─── DATA (Stream 1) ──────────────→ │  Length-Prefixed Protobuf Message
  │                                    │
  │←── HEADERS (Stream 1) ─────────── │  :status 200, content-type application/grpc
  │←── DATA (Stream 1) ────────────── │  Length-Prefixed Protobuf Response
  │←── HEADERS (Stream 1, Trailers) ─ │  grpc-status 0 (OK)
  │                                    │
```

gRPC는 응답의 마지막에 ***Trailers*** (후행 헤더)를 사용하여 `grpc-status`와 `grpc-message`를 전달한다. 이는 HTTP/2의 Trailers 기능을 활용한 것이며, 스트리밍 RPC에서 응답 데이터를 모두 보낸 후에 상태 코드를 결정할 수 있게 해준다.

## Stream, Message, Frame Hierarchy

HTTP/2의 통신 계층 구조를 이해해야 gRPC의 동작 방식을 정확히 파악할 수 있다.

```
Connection (하나의 TCP 연결)
  └── Stream 1 (하나의 gRPC 호출)
  │     ├── HEADERS Frame (요청 헤더)
  │     ├── DATA Frame (Protobuf 메시지 1)
  │     ├── DATA Frame (Protobuf 메시지 2)  ← Streaming
  │     └── HEADERS Frame (Trailers)
  │
  └── Stream 3 (다른 gRPC 호출, 동시 진행)
  │     ├── HEADERS Frame
  │     └── DATA Frame
  │
  └── Stream 5 (또 다른 gRPC 호출)
        ├── HEADERS Frame
        └── DATA Frame
```

- ***Connection***: 하나의 TCP 연결. 클라이언트와 서버 사이에 보통 하나의 Connection만 유지한다.
- ***Stream***: Connection 안의 가상 채널. 각 gRPC 호출이 하나의 Stream에 매핑된다. Stream ID는 클라이언트가 생성하면 홀수, 서버가 생성하면 짝수이다.
- ***Message***: 논리적인 HTTP 요청/응답. 하나 이상의 Frame으로 구성된다.
- ***Frame***: 통신의 최소 단위. 서로 다른 Stream의 Frame이 뒤섞여(interleaved) 전송된다.

## Multiplexing

***Multiplexing*** 은 HTTP/2의 가장 중요한 특징이다. 하나의 TCP 연결 위에서 여러 Stream이 동시에, 프레임 단위로 뒤섞여 전송된다.

```
TCP Connection
  ┌─────────────────────────────────────────────────┐
  │ [S1:HEADERS] [S3:HEADERS] [S1:DATA] [S5:HEADERS]│
  │ [S3:DATA] [S1:DATA] [S5:DATA] [S3:HEADERS(T)]   │
  └─────────────────────────────────────────────────┘
  S1, S3, S5: 서로 다른 Stream의 Frame들이 뒤섞여 전송
```

HTTP/1.1에서는 하나의 연결에서 요청-응답이 순차적으로 처리되어 앞선 요청이 지연되면 뒤의 모든 요청이 차단되는 ***애플리케이션 레벨 HoL Blocking*** 이 발생했다. HTTP/2의 Multiplexing은 이 문제를 해결한다.

## HPACK Header Compression

***[HPACK](https://datatracker.ietf.org/doc/html/rfc7541)*** 은 HTTP/2 전용 헤더 압축 알고리즘이다. gRPC 호출에서 반복되는 헤더(:method POST, content-type application/grpc 등)를 효율적으로 압축한다.

HPACK의 핵심 메커니즘은 두 가지이다.

1. ***Static Table***: 자주 사용되는 헤더 61개를 미리 정의해둔다. `:method GET`은 인덱스 2번, `:status 200`은 인덱스 8번이다. 1바이트로 전체 헤더를 표현할 수 있다.
2. ***Dynamic Table***: 연결 과정에서 반복되는 헤더를 동적으로 추가한다. 첫 요청에서 `authorization: Bearer xxx`를 보내면 동적 테이블에 추가되고, 이후 요청에서는 인덱스 번호(1바이트)만 전송하면 된다.

추가로 ***Huffman Encoding*** 으로 문자열 값 자체도 압축한다. 영문 기준으로 5~8비트로 한 문자를 표현한다.

## Flow Control

HTTP/2는 TCP의 Flow Control과 별도로 ***애플리케이션 레벨 Flow Control*** 을 제공한다.

- ***Per-Stream Flow Control***: 각 스트림별로 독립적인 윈도우 크기를 가진다. 하나의 스트림이 느리게 처리되어도 다른 스트림에 영향을 주지 않는다.
- ***Per-Connection Flow Control***: 연결 전체의 흐름도 제어한다.

`WINDOW_UPDATE` 프레임으로 윈도우 크기를 조절한다.

```
초기 윈도우 크기: 65,535 bytes (SETTINGS_INITIAL_WINDOW_SIZE)

Client                              Server
  │                                    │
  │─── DATA (Stream 1, 32KB) ───────→ │  남은 윈도우: 65535 - 32768 = 32767
  │─── DATA (Stream 1, 32KB) ───────→ │  남은 윈도우: 32767 - 32768 < 0 → 전송 차단!
  │         (대기)                      │
  │←── WINDOW_UPDATE (Stream 1) ────── │  윈도우 크기 복구
  │─── DATA (Stream 1, 계속) ────────→ │
```

이 메커니즘 덕분에, gRPC에서 대용량 파일 스트리밍이 채팅 메시지 스트리밍을 방해하지 않도록 ***Backpressure*** 를 프레임워크 레벨에서 제어할 수 있다.

## TCP Head-of-Line Blocking

HTTP/2의 Multiplexing이 애플리케이션 레벨의 HoL Blocking을 해결하지만, ***L4(TCP) 레벨의 HoL Blocking은 여전히 존재한다.***

TCP는 바이트 스트림의 순서를 보장한다. 하나의 TCP 세그먼트가 유실되면, 그 뒤에 도착한 모든 데이터는 (다른 Stream의 데이터라 할지라도) 커널 버퍼에 갇혀서 애플리케이션에 전달되지 않는다. TCP에 대한 상세 내용은 [SOCKET, PROTOCOL](https://klarciel.net/wiki/network/network-socket-protocol/)에서 다루고 있다.

```
Stream 1: [Segment A] [Segment B lost] [Segment C arrived]
Stream 3: [Segment D arrived] [Segment E arrived]

→ Segment B가 재전송되어 도착할 때까지 Stream 3의 D, E도 대기
→ 모든 Stream이 멈춤 (TCP HoL Blocking)
```

이 문제를 근본적으로 해결하기 위해 HTTP/3는 TCP 대신 ***QUIC(UDP 기반)*** 을 사용한다. QUIC에서는 스트림 간 독립적인 패킷 전달이 가능하므로, 하나의 스트림 패킷 유실이 다른 스트림에 영향을 주지 않는다.

# gRPC Communication Patterns

gRPC는 네 가지 통신 패턴을 지원한다. 각 패턴은 HTTP/2의 스트리밍 특성을 활용한다.

## Unary RPC

가장 기본적인 패턴이다. 하나의 요청에 하나의 응답을 반환한다. 전통적인 HTTP REST 호출과 유사하다.

```protobuf
service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);
}
```

```
Client                              Server
  │── HEADERS ────────────────────→ │
  │── DATA (Request) ─────────────→ │
  │                                  │
  │←── HEADERS ──────────────────── │
  │←── DATA (Response) ───────────  │
  │←── HEADERS (Trailers) ──────── │
```

**Use Case**: 단건 조회, 생성, 수정, 삭제. 대부분의 API 호출에 적합하다.

## Server Streaming RPC

클라이언트가 하나의 요청을 보내면, 서버가 여러 개의 응답을 스트림으로 반환한다.

```protobuf
service StockService {
  rpc WatchPrice (WatchPriceRequest) returns (stream PriceUpdate);
}
```

```kotlin
// Server (Kotlin)
override fun watchPrice(
    request: WatchPriceRequest,
    responseObserver: StreamObserver<PriceUpdate>
) {
    // 주가 변동 시마다 클라이언트에 전송
    while (!responseObserver.isCancelled) {
        val update = getLatestPrice(request.symbol)
        responseObserver.onNext(update)
        Thread.sleep(1000)
    }
    responseObserver.onCompleted()
}
```

**Use Case**: 실시간 시세 구독, 로그 테일링, 대량 데이터 점진적 전송.

## Client Streaming RPC

클라이언트가 여러 개의 메시지를 스트림으로 보내고, 서버는 모든 메시지를 받은 후 하나의 응답을 반환한다.

```protobuf
service UploadService {
  rpc UploadFile (stream FileChunk) returns (UploadResult);
}

message FileChunk {
  string file_name = 1;
  bytes content = 2;
  int64 offset = 3;
}
```

**Use Case**: 파일 업로드, 센서 데이터 배치 전송, 클라이언트 측 집계(aggregation).

## Bidirectional Streaming RPC

클라이언트와 서버가 동시에 스트림을 주고받는다. 두 스트림은 독립적으로 동작하므로, 순서에 제약이 없다.

```protobuf
service ChatService {
  rpc Chat (stream ChatMessage) returns (stream ChatMessage);
}
```

```kotlin
// Client (Kotlin)
val requestObserver = chatStub.chat(object : StreamObserver<ChatMessage> {
    override fun onNext(response: ChatMessage) {
        println("Received: ${response.text}")
    }
    override fun onError(t: Throwable) {
        logger.error("Stream error", t)
    }
    override fun onCompleted() {
        println("Stream completed")
    }
})

// 메시지 전송 (독립적으로 가능)
requestObserver.onNext(ChatMessage.newBuilder().setText("Hello").build())
requestObserver.onNext(ChatMessage.newBuilder().setText("World").build())
requestObserver.onCompleted()
```

**Use Case**: 채팅, 차량 텔레매틱스(양방향 제어+상태 보고), 실시간 협업.

# Client and Server Implementation

## Channel Management

***[Channel](https://bcho.tistory.com/1294)*** 은 gRPC 클라이언트의 핵심이다. ***하나의 Channel을 애플리케이션 전체에서 공유***하는 것이 권장된다. Channel 생성 시 TCP 연결이 수립되므로, 매 호출마다 Channel을 생성하면 성능이 급격히 저하된다.

```java
// Channel 생성 - 애플리케이션 수명 동안 재사용
ManagedChannel channel = ManagedChannelBuilder.forTarget("dns:///my-service:50051")
    .defaultLoadBalancingPolicy("round_robin")
    .keepAliveTime(30, TimeUnit.SECONDS)
    .keepAliveTimeout(10, TimeUnit.SECONDS)
    .keepAliveWithoutCalls(true)
    .maxInboundMessageSize(4 * 1024 * 1024) // 4MB
    .build();

// 하나의 Channel에서 여러 Stub 생성
UserServiceGrpc.UserServiceBlockingStub blockingStub =
    UserServiceGrpc.newBlockingStub(channel);
UserServiceGrpc.UserServiceFutureStub futureStub =
    UserServiceGrpc.newFutureStub(channel);
UserServiceGrpc.UserServiceStub asyncStub =
    UserServiceGrpc.newStub(channel);
```

## Stub Types

| Stub 종류 | 특징 | 사용 상황 |
|-----------|------|----------|
| ***Blocking Stub*** | 동기 호출. 응답이 올 때까지 스레드가 블로킹된다 | 단순 Unary RPC, 스크립트, CLI |
| ***Async Stub*** | 비동기 호출. StreamObserver 콜백으로 응답을 받는다 | Streaming RPC, 고성능 서버 |
| ***Future Stub*** | ListenableFuture를 반환. 비동기이지만 Unary만 지원 | Unary RPC의 비동기 처리 |

## Interceptor

***Interceptor*** 는 gRPC 호출의 전후에 공통 로직을 삽입하는 메커니즘이다. HTTP 서블릿 필터나 Spring AOP와 유사한 개념이다.

```java
// Client Interceptor - 모든 호출에 인증 토큰 추가
public class AuthInterceptor implements ClientInterceptor {
    @Override
    public <ReqT, RespT> ClientCall<ReqT, RespT> interceptCall(
            MethodDescriptor<ReqT, RespT> method,
            CallOptions callOptions,
            Channel next) {
        return new ForwardingClientCall.SimpleForwardingClientCall<>(
                next.newCall(method, callOptions)) {
            @Override
            public void start(Listener<RespT> responseListener, Metadata headers) {
                headers.put(
                    Metadata.Key.of("authorization", Metadata.ASCII_STRING_MARSHALLER),
                    "Bearer " + getAccessToken()
                );
                super.start(responseListener, headers);
            }
        };
    }
}

// Interceptor 적용
ManagedChannel channel = ManagedChannelBuilder.forTarget("my-service:50051")
    .intercept(new AuthInterceptor())
    .build();
```

```java
// Server Interceptor - 요청 로깅
public class LoggingInterceptor implements ServerInterceptor {
    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {
        String methodName = call.getMethodDescriptor().getFullMethodName();
        long startTime = System.nanoTime();
        logger.info("gRPC call started: {}", methodName);

        ServerCall.Listener<ReqT> listener = next.startCall(call, headers);

        return new ForwardingServerCallListener.SimpleForwardingServerCallListener<>(listener) {
            @Override
            public void onComplete() {
                long duration = System.nanoTime() - startTime;
                logger.info("gRPC call completed: {} ({}ms)",
                    methodName, duration / 1_000_000);
                super.onComplete();
            }
        };
    }
}
```

## Deadline and Timeout Propagation

gRPC의 ***Deadline*** 은 클라이언트가 "이 시간까지 응답이 오지 않으면 포기하겠다"는 ***절대 시간***을 설정하는 것이다. 이는 단순한 Timeout과 다르다. Deadline은 서비스 간 호출 체인에서 ***자동으로 전파***된다.

```
Service A → Service B → Service C

Deadline = 5초

A → B 호출에 2초 소요
B → C 호출 시 Deadline은 자동으로 3초로 줄어듦
C에서 3초 내에 응답하지 않으면 전체 체인이 DEADLINE_EXCEEDED
```

```java
// Deadline 설정
UserServiceGrpc.UserServiceBlockingStub stub = userStub
    .withDeadlineAfter(3, TimeUnit.SECONDS);

try {
    User user = stub.getUser(request);
} catch (StatusRuntimeException e) {
    if (e.getStatus().getCode() == Status.Code.DEADLINE_EXCEEDED) {
        // Deadline 초과 처리
    }
}
```

Deadline을 설정하지 않으면 RPC 호출이 **영원히** 대기할 수 있다. 프로덕션에서는 반드시 Deadline을 설정해야 한다.

## Metadata

***Metadata*** 는 gRPC 호출에 첨부되는 Key-Value 형태의 부가 정보이다. HTTP 헤더와 유사하며, ***Headers*** (요청/응답 시작 시)와 ***Trailers*** (응답 종료 시)로 나뉜다.

```java
// Metadata 전송 (Client)
Metadata metadata = new Metadata();
metadata.put(
    Metadata.Key.of("x-request-id", Metadata.ASCII_STRING_MARSHALLER),
    UUID.randomUUID().toString()
);
metadata.put(
    Metadata.Key.of("x-trace-id-bin", Metadata.BINARY_BYTE_MARSHALLER),
    traceIdBytes  // 바이너리 값은 -bin 접미사 사용
);

UserServiceGrpc.UserServiceBlockingStub stub =
    MetadataUtils.attachHeaders(userStub, metadata);
```

## Health Check

gRPC는 표준 Health Check 프로토콜(***grpc.health.v1***)을 제공한다. 로드밸런서나 Kubernetes의 헬스 체크에서 사용된다.

```protobuf
// 표준 Health Check 서비스 (google 제공)
service Health {
  rpc Check (HealthCheckRequest) returns (HealthCheckResponse);
  rpc Watch (HealthCheckRequest) returns (stream HealthCheckResponse);
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;
  }
  ServingStatus status = 1;
}
```

```java
// Server: Health Check 서비스 등록
HealthStatusManager healthManager = new HealthStatusManager();
Server server = ServerBuilder.forPort(50051)
    .addService(new UserServiceImpl())
    .addService(healthManager.getHealthService())
    .build();

// 서비스 상태 변경
healthManager.setStatus("UserService", ServingStatus.SERVING);
```

## Graceful Shutdown

gRPC 서버의 안전한 종료는 ***GOAWAY*** 프레임을 활용한다.

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    // 1. 새로운 RPC 수락 중지 (GOAWAY 프레임 전송)
    server.shutdown();

    try {
        // 2. 진행 중인 RPC가 완료될 때까지 대기 (최대 30초)
        if (!server.awaitTermination(30, TimeUnit.SECONDS)) {
            // 3. 시간 초과 시 강제 종료
            server.shutdownNow();
            server.awaitTermination(5, TimeUnit.SECONDS);
        }
    } catch (InterruptedException e) {
        server.shutdownNow();
    }
}));
```

GOAWAY 프레임은 "더 이상 새 스트림을 열지 마라"는 신호이다. 마지막으로 처리한 Stream ID를 포함하므로, 클라이언트는 처리되지 않은 요청을 다른 서버로 재시도할 수 있다.

## Error Handling and Status Codes

gRPC는 ***[표준 Status Code](https://grpc.io/docs/guides/status-codes/)*** 를 정의하고 있다.

| Code | 이름 | 설명 |
|------|------|------|
| 0 | ***OK*** | 성공 |
| 1 | ***CANCELLED*** | 클라이언트가 취소함 |
| 2 | ***UNKNOWN*** | 알 수 없는 에러 |
| 3 | ***INVALID_ARGUMENT*** | 잘못된 인자 (400에 해당) |
| 4 | ***DEADLINE_EXCEEDED*** | Deadline 초과 (408에 해당) |
| 5 | ***NOT_FOUND*** | 리소스를 찾을 수 없음 (404에 해당) |
| 6 | ***ALREADY_EXISTS*** | 리소스가 이미 존재함 (409에 해당) |
| 7 | ***PERMISSION_DENIED*** | 권한 없음 (403에 해당) |
| 8 | ***RESOURCE_EXHAUSTED*** | 리소스 부족, 할당량 초과 (429에 해당) |
| 9 | ***FAILED_PRECONDITION*** | 전제 조건 불충족 |
| 10 | ***ABORTED*** | 동시성 충돌 등으로 중단됨 |
| 11 | ***OUT_OF_RANGE*** | 범위 초과 |
| 12 | ***UNIMPLEMENTED*** | 미구현 (501에 해당) |
| 13 | ***INTERNAL*** | 내부 서버 에러 (500에 해당) |
| 14 | ***UNAVAILABLE*** | 서비스 일시 불능. 재시도 가능 (503에 해당) |
| 15 | ***DATA_LOSS*** | 복구 불가능한 데이터 손실 |
| 16 | ***UNAUTHENTICATED*** | 인증 실패 (401에 해당) |

```java
// 서버: 에러 반환
@Override
public void getUser(GetUserRequest request, StreamObserver<User> responseObserver) {
    User user = userRepository.findById(request.getUserId());
    if (user == null) {
        responseObserver.onError(Status.NOT_FOUND
            .withDescription("User not found: " + request.getUserId())
            .asRuntimeException());
        return;
    }
    responseObserver.onNext(user);
    responseObserver.onCompleted();
}
```

실무에서 주의할 점은, `UNAVAILABLE`과 `INTERNAL`의 구분이다. `UNAVAILABLE`은 ***재시도 가능***한 일시적 에러이며, `INTERNAL`은 재시도해도 같은 결과가 나올 가능성이 높은 에러이다. Retry Policy 설정 시 이 구분이 중요하다.

# Proto Repository Management

실무에서 .proto 파일 관리 전략은 gRPC 도입의 성패를 가른다. .proto 파일은 단순한 코드가 아니라 **"API 명세서이자 계약서(Contract)"** 이다.

## Separate Git Repository

.proto 파일들만 모아둔 ***별도의 Git Repository*** 를 운영하는 것이 권장된다. 서버, 클라이언트, 모바일 팀이 각각 다른 레포지토리에서 개발하되, .proto 파일은 하나의 레포지토리에서 중앙 관리한다.

```
company-proto/                    ← 별도 Git Repository
  ├── proto/
  │   ├── user/v1/
  │   │   └── user_service.proto
  │   ├── order/v1/
  │   │   └── order_service.proto
  │   └── common/v1/
  │       └── types.proto
  ├── buf.yaml                    ← buf lint/breaking 설정
  ├── buf.gen.yaml                ← 코드 생성 설정
  └── .github/workflows/
      └── ci.yml                  ← CI 파이프라인
```

## CI/CD Pipeline

.proto 파일 자체를 공유하는 것보다, ***"컴파일된 라이브러리(Stub/SDK)"***를 공유하는 것이 정석이다. 클라이언트 개발자가 로컬에 protoc 컴파일러를 설치하고 버전을 맞추는 고통을 없애야 한다.

```
Commit (.proto 변경)
    │
    ▼
CI Trigger (GitHub Actions / Jenkins)
    │
    ├── Lint (buf lint)
    ├── Breaking Change Detection (buf breaking)
    │
    ▼
Code Generation (protoc / buf generate)
    │
    ├── Java/Kotlin → .jar 빌드
    ├── Swift (iOS) → CocoaPods / Swift Package 빌드
    ├── TypeScript (Web) → NPM Package 빌드
    └── Go → Go Module 빌드
    │
    ▼
Publish (Versioned Artifact)
    │
    ├── Maven/Nexus → com.company.proto:user-service:1.2.0
    ├── NPM Private Registry → @company/user-service@1.2.0
    └── CocoaPods → CompanyProto (1.2.0)
    │
    ▼
Consume
    ├── Android: implementation 'com.company.proto:user-service:1.2.0'
    ├── iOS: pod 'CompanyProto', '~> 1.2.0'
    └── Web: npm install @company/user-service@1.2.0
```

클라이언트 팀은 .proto 파일이 어떻게 생겼는지 몰라도 된다. 그냥 함수(메서드)가 업데이트된 라이브러리를 받아다 쓰면 된다.

## Breaking Change Detection

***[buf](https://buf.build/)*** 또는 ***protolock*** 같은 도구로 CI에서 Breaking Change를 자동 감지해야 한다.

```yaml
# buf.yaml
version: v1
breaking:
  use:
    - FILE
  # 다음 변경을 Breaking으로 감지:
  # - 필드 번호 변경
  # - 필드 타입 변경
  # - 서비스/메서드 삭제
  # - 메시지 삭제
```

Breaking Change가 불가피한 경우에는 ***패키지 버전 전략***을 사용한다.

```protobuf
// v1은 유지하면서 v2를 병렬로 운영
package example.user.v1;  // 기존 클라이언트용
package example.user.v2;  // 새로운 클라이언트용
```

# Network Resilience

## Keepalive Mechanism

gRPC의 Keepalive는 HTTP/2의 ***PING 프레임***을 사용하여 연결이 살아있는지 확인한다. 이는 TCP Keepalive와는 별개의 애플리케이션 레벨 메커니즘이다.

| 파라미터 | 설명 | 기본값 |
|---------|------|--------|
| `KEEPALIVE_TIME` | PING을 보내는 간격 | 무한 (비활성) |
| `KEEPALIVE_TIMEOUT` | PING 응답 대기 시간. 초과 시 연결 종료 | 20초 |
| `KEEPALIVE_WITHOUT_CALLS` | 활성 RPC가 없어도 PING을 보낼지 여부 | false |
| `MAX_CONNECTION_IDLE` | (서버) 유휴 연결 유지 시간 | 무한 |
| `MAX_CONNECTION_AGE` | (서버) 연결 최대 수명. Graceful 재연결 유도 | 무한 |
| `MAX_CONNECTION_AGE_GRACE` | (서버) MAX_CONNECTION_AGE 이후 기존 RPC 완료 유예 시간 | 무한 |
| `PERMIT_KEEPALIVE_WITHOUT_CALLS` | (서버) 클라이언트의 활성 RPC 없는 PING 허용 여부 | false |
| `KEEPALIVE_ENFORCEMENT_MIN_TIME` | (서버) 클라이언트 PING 최소 간격. 이보다 짧으면 GOAWAY 전송 | 5분 |

클라이언트가 서버의 `KEEPALIVE_ENFORCEMENT_MIN_TIME`보다 짧은 간격으로 PING을 보내면 서버는 ***ENHANCE_YOUR_CALM*** 에러와 함께 GOAWAY를 전송한다. 클라이언트와 서버의 Keepalive 파라미터를 반드시 조율해야 한다.

```java
// Client
ManagedChannel channel = ManagedChannelBuilder.forTarget("my-service:50051")
    .keepAliveTime(30, TimeUnit.SECONDS)
    .keepAliveTimeout(10, TimeUnit.SECONDS)
    .keepAliveWithoutCalls(true)
    .build();

// Server - 클라이언트의 PING 간격을 허용하도록 설정
Server server = ServerBuilder.forPort(50051)
    .permitKeepAliveTime(10, TimeUnit.SECONDS)  // 최소 10초 간격 허용
    .permitKeepAliveWithoutCalls(true)
    .maxConnectionIdle(5, TimeUnit.MINUTES)
    .maxConnectionAge(30, TimeUnit.MINUTES)
    .maxConnectionAgeGrace(5, TimeUnit.MINUTES)
    .build();
```

## Tunnel and Handover Scenarios

차량이 터널에 진입하거나 기지국 핸드오버가 발생하면, ***[SOCKET, PROTOCOL](https://klarciel.net/wiki/network/network-socket-protocol/)*** 에서 다룬 것처럼 TCP 연결이 끊어질 수 있다.

__터널 / Handover에서 실제 발생하는 현상__:
- 차량 이동 시:
  - 단말 IP 변경
  - NAT mapping 소멸
  - TCP 세션 state 불일치
  - HTTP/2 스트림 끊김
  - gRPC channel 상태 변경
  - 특히 LTE → 5G 핸드오버에서 L4는 유지하려 하지만 실제로는 NAT state가 깨지면서 RST 발생하는 경우 많음
  - 이 때문에 모바일 환경에서는 keepalive 설정이 매우 중요

- Case A: RST 수신
  - 기지국 handover 중 NAT state 손실
  - 서버가 RST 응답
  - → TCP 즉시 종료
  - → gRPC는 write/read 에러로 감지
- Case B: Silent drop (더 흔함)
  - 터널 진입
  - 패킷 손실
  - TCP는 끊어진 걸 모름
  - keepalive PING timeout까지 대기
  - 이 경우 TCP 상태: ESTABLISHED 유지, 하지만 실제로는 통신 불가

즉, gRPC가 연결 단절을 감지하는 시점은 다음 중 하나이다.
- write 실패
- HTTP/2 PING timeout
- TCP keepalive 실패

gRPC Channel의 자동 재연결 과정은 다음과 같다.

```
정상 통신 (READY)
    │
    ▼ TCP 연결 끊김 감지 (PING timeout 또는 write 실패)
    │
TRANSIENT_FAILURE
    │
    ├─ 1차 재연결 시도 (즉시)
    │   실패 → 대기 (initial backoff: 1초)
    │
    ├─ 2차 재연결 시도
    │   실패 → 대기 (backoff: 2초)
    │
    ├─ 3차 재연결 시도
    │   실패 → 대기 (backoff: 4초)
    │   ...
    │   (max backoff: 120초, with jitter)
    │
    ▼ 연결 성공
READY (재연결 완료)
```

차량이 터널 진입 또는 기지국 handover 시 TCP 세션이 즉시 RST로 종료되거나, 패킷 손실로 인해 keepalive timeout 후 단절이 감지될 수 있다.
gRPC Channel은 연결 단절을 감지하면 TRANSIENT_FAILURE 상태로 전이하고, exponential backoff 전략에 따라 재연결을 시도한다. 재연결 시도 시 상태는 CONNECTING으로 전환되며, 성공 시 다시 READY 상태가 된다.

Channel의 상태 전이는 다음과 같다.

| 상태 | 설명 |
|------|------|
| ***IDLE*** | 초기 상태. RPC 호출이 없으면 유지 |
| ***CONNECTING*** | TCP 연결 시도 중 |
| ***READY*** | 연결 완료. RPC 전송 가능 |
| ***TRANSIENT_FAILURE*** | 연결 실패. Exponential backoff로 재시도 중 |
| ***SHUTDOWN*** | Channel이 명시적으로 종료됨 |

### Streaming RPC Recovery

Unary RPC는 Channel이 재연결되면 자동으로 재시도할 수 있지만, ***Streaming RPC는 자동 복구가 되지 않는다.*** 스트림의 상태(어디까지 보냈고, 어디까지 받았는지)를 gRPC가 추적하지 않기 때문이다.

애플리케이션 레벨에서 복구 전략을 구현해야 한다.

```kotlin
// Streaming RPC 복구 전략 예시
class ResilientStreamClient(private val stub: TelemetryServiceStub) {
    private var lastReceivedSequence: Long = 0

    fun startStream() {
        val request = StreamRequest.newBuilder()
            .setResumeFromSequence(lastReceivedSequence)  // 마지막 수신 지점부터 재개
            .build()

        stub.streamData(request, object : StreamObserver<TelemetryData> {
            override fun onNext(data: TelemetryData) {
                lastReceivedSequence = data.sequence
                process(data)
            }
            override fun onError(t: Throwable) {
                val status = Status.fromThrowable(t)
                if (status.code == Status.Code.UNAVAILABLE) {
                    // 재연결 후 스트림 재시작
                    scheduleReconnect { startStream() }
                }
            }
            override fun onCompleted() { /* 정상 종료 */ }
        })
    }
}
```

## NAT and Firewall Idle Timeout

NAT 장비와 방화벽은 일정 시간(보통 30~120초) 동안 트래픽이 없는 연결의 매핑을 삭제한다. 이 경우 [좀비 커넥션](https://klarciel.net/wiki/network/network-socket-protocol/#zombie-connection) 문제가 발생한다. 서버는 연결이 살아있다고 생각하지만, NAT 매핑이 사라져서 실제로는 통신이 불가능한 상태이다.

대응 방법은 Keepalive 간격을 NAT idle timeout보다 짧게 설정하는 것이다.

```java
// NAT idle timeout이 60초라면, Keepalive는 30초 이하로 설정
ManagedChannel channel = ManagedChannelBuilder.forTarget("my-service:50051")
    .keepAliveTime(30, TimeUnit.SECONDS)     // NAT timeout의 절반
    .keepAliveWithoutCalls(true)             // RPC가 없어도 PING 전송
    .build();
```

## Retry Policy and Hedging

gRPC는 ***Service Config***를 통해 자동 재시도 정책을 설정할 수 있다.

```json
{
  "methodConfig": [{
    "name": [{"service": "example.UserService"}],
    "retryPolicy": {
      "maxAttempts": 3,
      "initialBackoff": "0.1s",
      "maxBackoff": "1s",
      "backoffMultiplier": 2,
      "retryableStatusCodes": ["UNAVAILABLE", "RESOURCE_EXHAUSTED"]
    }
  }]
}
```

***Hedging*** 은 재시도와 다른 전략이다. 첫 번째 요청의 응답을 기다리지 않고, 일정 시간 후 ***동일한 요청을 추가로*** 보내는 것이다. 먼저 도착한 응답을 사용하고 나머지는 취소한다.

```json
{
  "methodConfig": [{
    "name": [{"service": "example.UserService", "method": "GetUser"}],
    "hedgingPolicy": {
      "maxAttempts": 3,
      "hedgingDelay": "0.5s",
      "nonFatalStatusCodes": ["UNAVAILABLE"]
    }
  }]
}
```

Hedging은 Tail Latency를 줄이는 데 효과적이지만, 서버 부하가 증가하므로 ***멱등성(Idempotent)이 보장되는 읽기 전용 메서드***에만 적용해야 한다.

## Mobile and Vehicle Considerations

모바일/차량 환경에서 gRPC를 사용할 때의 주의사항을 정리하면 다음과 같다.

| 상황 | 문제 | 대응 |
|------|------|------|
| 터널 진입 | TCP 연결 끊김, PING timeout | Channel 자동 재연결 + Streaming 복구 로직 |
| 기지국 핸드오버 | RTT 증가, 패킷 Drop | Deadline 여유 확보, Retry Policy |
| NAT idle timeout | 좀비 커넥션 | Keepalive < NAT timeout |
| 네트워크 전환 (Wi-Fi → LTE) | IP 변경, 기존 연결 무효화 | Channel 재생성 또는 QUIC 기반 gRPC 고려 |
| 대역폭 제한 | 패킷 크기 민감 | Protobuf의 compact encoding이 유리 |

# Protobuf Pros and Cons

## Advantages

- ***Compact***: JSON 대비 30~50% 수준의 패킷 크기. 필드 이름이 Wire에 포함되지 않고, Varint로 작은 숫자를 적은 바이트로 표현한다.
- ***Fast***: 바이너리 직렬화/역직렬화는 텍스트 파싱보다 월등히 빠르다. 문자열 파싱, 이스케이프 처리, 숫자 변환 등의 오버헤드가 없다.
- ***Typed***: 컴파일 타임에 타입 에러를 잡을 수 있다. 런타임에 "필드가 string인줄 알았는데 number였다" 같은 에러가 발생하지 않는다.
- ***Cross-Language***: 하나의 .proto 파일로 Java, Kotlin, Go, Python, Swift, TypeScript 등 다양한 언어의 코드를 생성할 수 있다.
- ***Backward/Forward Compatible***: 필드 번호 기반의 인코딩 덕분에, 스키마를 변경해도 기존 클라이언트/서버와 호환된다.

## Disadvantages

- ***Not Human-Readable***: 바이너리 형식이므로 curl이나 브라우저에서 직접 읽을 수 없다. 디버깅 시 grpcurl, Postman, BloomRPC 같은 전용 도구가 필요하다.
- ***Debugging Difficulty***: 네트워크 패킷을 캡처해도 내용을 바로 확인할 수 없다. Wireshark에서 .proto 파일을 등록해야 디코딩이 가능하다.
- ***Learning Curve***: proto3 문법, 코드 생성 파이프라인, Stub 패턴, Streaming 처리 등 학습해야 할 것이 많다. JSON/REST에 비해 진입 장벽이 높다.
- ***Schema Required***: .proto 파일 없이는 메시지를 해석할 수 없다. JSON처럼 자기 서술적(self-describing)이지 않다. 이 특성은 장점(강제된 계약)이자 단점(유연성 부족)이다.
- ***Browser Support***: 브라우저는 HTTP/2 프레임을 직접 제어하는 API를 제공하지 않는다. 브라우저에서 gRPC를 사용하려면 ***gRPC-Web*** 프록시(Envoy 등)가 필요하며, Server Streaming만 지원되고 Bidirectional Streaming은 사용할 수 없다.

# gRPC Gateway and gRPC-Web

## gRPC Gateway

***[gRPC Gateway](https://github.com/grpc-ecosystem/grpc-gateway)*** 는 gRPC 서비스를 RESTful JSON API로 자동 변환하는 리버스 프록시 생성기이다. .proto 파일에 HTTP 매핑 어노테이션을 추가하면, 하나의 서비스 구현으로 gRPC와 REST를 동시에 제공할 수 있다.

```protobuf
import "google/api/annotations.proto";

service UserService {
  rpc GetUser (GetUserRequest) returns (User) {
    option (google.api.http) = {
      get: "/v1/users/{user_id}"
    };
  }
}
```

이 방식은 내부 마이크로서비스 간에는 gRPC의 고성능 통신을 유지하면서, 외부 클라이언트(브라우저, 모바일 앱)에게는 친숙한 REST API를 제공해야 하는 상황에서 유용하다.

## gRPC-Web

브라우저는 HTTP/2 프레임을 JavaScript에서 직접 제어하는 API를 제공하지 않는다. 따라서 브라우저에서 gRPC를 사용하려면 ***gRPC-Web*** 프로토콜과 프록시(Envoy 등)가 필요하다.

gRPC-Web의 제약 사항은 다음과 같다.

| 기능 | 지원 여부 |
|------|---------|
| Unary RPC | 지원 |
| Server Streaming RPC | 지원 |
| Client Streaming RPC | 미지원 |
| Bidirectional Streaming RPC | 미지원 |

Client Streaming과 Bidirectional Streaming이 불가능한 이유는, 브라우저의 Fetch API와 XMLHttpRequest가 요청 본문의 스트리밍 전송을 지원하지 않기 때문이다.

# Links

- [gRPC Official Documentation](https://grpc.io/docs/)
- [Protocol Buffers Language Guide (proto3)](https://protobuf.dev/programming-guides/proto3/)
- [gRPC on HTTP/2 Engineering a Robust, High-performance Protocol](https://grpc.io/blog/grpc-on-http2/)
- [HTTP/2 Specification (RFC 9113)](https://datatracker.ietf.org/doc/html/rfc9113)
- [HPACK: Header Compression for HTTP/2 (RFC 7541)](https://datatracker.ietf.org/doc/html/rfc7541)
- [gRPC Status Codes](https://grpc.io/docs/guides/status-codes/)
- [gRPC-Web](https://github.com/grpc/grpc-web)
- [gRPC Gateway](https://github.com/grpc-ecosystem/grpc-gateway)
- [buf - Protobuf tooling](https://buf.build/)
- [AWS - The difference between grpc and rest](https://aws.amazon.com/ko/compare/the-difference-between-grpc-and-rest/)
- [NAVER CLOUD PLATFORM - 시대의 흐름, gRPC 깊게 파고들기 #1](https://medium.com/naver-cloud-platform/nbp-%EA%B8%B0%EC%88%A0-%EA%B2%BD%ED%97%98-%EC%8B%9C%EB%8C%80%EC%9D%98-%ED%9D%90%EB%A6%84-grpc-%EA%B9%8A%EA%B2%8C-%ED%8C%8C%EA%B3%A0%EB%93%A4%EA%B8%B0-1-39e97cb3460)
- [Banksalad - 프로덕션 환경에서 사용하는 golang과 gRPC](https://blog.banksalad.com/tech/production-ready-grpc-in-golang/)
- [Practical API Design at Netflix, Part 1 - Using Protobuf FieldMask](https://netflixtechblog.com/practical-api-design-at-netflix-part-1-using-protobuf-fieldmask-35cfdc606518)
- [Practical API Design at Netflix, Part 2 - Protobuf FieldMask for Mutation Operations](https://netflixtechblog.com/practical-api-design-at-netflix-part-2-protobuf-fieldmask-for-mutation-operations-2e75e1d230e4)
- [High Performance; Binary Packet Protocol](https://klarciel.net/wiki/network/network-binary-based-protocol/)
- [SOCKET, PROTOCOL](https://klarciel.net/wiki/network/network-socket-protocol/)
- [Protobuffer](https://klarciel.net/wiki/grpc/grpc-protobuffer/)

# References

- gRPC: Up and Running / Kasun Indrasiri, Danesh Kuruppu / O'Reilly
- HTTP/2 In Action / Barry Pollard / MANNING
- 성공과 실패를 결정하는 1% 의 네트워크 원리 / Tsutomu Tone 저 / 성안당
