---
layout  : wiki
title   : GRPC FUNDAMENTALS
summary :
date    : 2026-02-09 15:00:00 +0900
updated : 2026-02-28 15:00:00 +0900
tag     : grpc http protobuf network rpc architecture streaming kotlin coroutines http2
toc     : true
comment : true
public  : true
parent  : [[/grpc]]
latex   : true
---
* TOC
{:toc}

# GRPC FUNDAMENTALS

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
  - [HTTP/2 is smarter at scale
    ](https://www.cncf.io/blog/2018/07/03/http-2-smarter-at-scale/)
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

***[Varint](https://protobuf.dev/programming-guides/encoding/#varints)*** 는 가변 길이 정수 인코딩이다. 작은 숫자는 적은 바이트로, 큰 숫자는 많은 바이트로 표현한다.

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

gRPC는 ***[HTTP/2](https://datatracker.ietf.org/doc/html/rfc9113)*** 를 전송 계층으로 사용한다. HTTP/2의 핵심 특징들이 gRPC의 고성능을 가능하게 한다. HTTP/2 Binary Framing Layer에 대한 기본 내용은 ***[High Performance; Binary Packet Protocol](https://klarciel.net/wiki/network/network-binary-based-protocol/)*** 에서 다루고 있다.

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

| Type                                                                      | 값 | 설명 |
|---------------------------------------------------------------------------|------|------|
| ***DATA***                                                                | 0x0 | 실제 데이터(body) 전송. gRPC에서는 Protobuf로 직렬화된 메시지를 담는다 |
| ***HEADERS***                                                             | 0x1 | HTTP 헤더 전송. HPACK으로 압축된 헤더 블록을 담는다 |
| ***PRIORITY***                                                            | 0x2 | 스트림 우선순위 설정 (RFC 9113에서는 deprecated) |
| ***RST_STREAM***                                                          | 0x3 | 스트림을 즉시 종료. 에러 코드 포함. gRPC Cancellation에 사용 |
| ***SETTINGS***                                                            | 0x4 | 연결 수준 설정. 초기 윈도우 크기, 최대 프레임 크기, 최대 동시 스트림 수 등 |
| ***PING***                                                                | 0x6 | 연결 활성 확인 및 RTT 측정. 8바이트 페이로드. gRPC Keepalive에 사용 |
| ***[GOAWAY](https://datatracker.ietf.org/doc/html/rfc7540#section-6.8)*** | 0x7 | 연결 종료 예고. 마지막으로 처리한 스트림 ID와 에러 코드 포함. Graceful Shutdown에 사용 |
| ***WINDOW_UPDATE***                                                       | 0x8 | Flow Control 윈도우 크기 갱신. 스트림별 또는 연결 수준으로 설정 |

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

TCP는 바이트 스트림의 순서를 보장한다. 하나의 TCP 세그먼트가 유실되면, 그 뒤에 도착한 모든 데이터는 (다른 Stream의 데이터라 할지라도) 커널 버퍼에 갇혀서 애플리케이션에 전달되지 않는다. TCP에 대한 상세 내용은 ***[SOCKET, PROTOCOL](https://klarciel.net/wiki/network/network-socket-protocol/)*** 와 ***[Never Trust the Network Designing Ordered Systems](https://klarciel.net/wiki/network/network-ordered-system/)*** 에서 다루고 있다.

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

.proto 파일 자체를 공유하는 것보다, ***"컴파일된 라이브러리(Stub/SDK)"*** 를 공유하는 것이 정석이다. 클라이언트 개발자가 로컬에 protoc 컴파일러를 설치하고 버전을 맞추는 고통을 없애야 한다.

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

# Bidirectional Streaming in Production

이 장부터는 Cloud 환경에서 A(gRPC Server) ↔ B(gRPC Client) 구조의 ***Bidirectional Streaming gRPC*** 를 "운영 가능한 수준"으로 이해하고 구현하는 데 필요한 모든 내용을 다룬다. 세션 개념의 정확한 정의, HTTP/2 프레임 레벨의 동작 원리, 종료/장애 감지 메커니즘, 운영 패턴까지 CS 레벨로 깊이 설명한다.

## Session: Three-Layer Model

"세션"이라는 단어는 맥락에 따라 완전히 다른 의미를 가진다. 운영 수준의 Bidirectional Streaming을 설계하려면, 세션을 3개 계층으로 분리하여 이해해야 한다.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 3: Application Session                                       │
│  - sessionId, clientId, metadata, state machine                     │
│  - Managed by SessionRegistry (ConcurrentHashMap)                   │
│  - Lifecycle: Join → Active → Leave                                 │
│  - CAN survive stream failures (reconnect + rejoin)                 │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 2: gRPC Call (Stream)                                        │
│  - One bidi streaming RPC = one HTTP/2 stream                       │
│  - Stream ID (odd number, client-initiated)                         │
│  - Lifecycle: HEADERS → DATA* → Trailers (END_STREAM)              │
│  - CANNOT survive transport failure (stream dies with connection)   │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 1: Transport (TCP/TLS/HTTP/2 Connection)                     │
│  - Physical TCP connection + TLS handshake + HTTP/2 connection preface│
│  - Managed by ManagedChannel                                        │
│  - States: IDLE → CONNECTING → READY → TRANSIENT_FAILURE → SHUTDOWN│
│  - Multiple streams multiplexed on one connection                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Application Session

***Application Session*** 은 비즈니스 로직 관점의 세션이다. 사용자 세션, 디바이스 세션, 차량 세션 등이 이에 해당한다. 서버의 `SessionRegistry`(일반적으로 `ConcurrentHashMap<String, SessionInfo>`)에 저장되며, `sessionId`, 클라이언트 정보, 연결 시각, 마지막 활동 시각, outbound 채널 참조 등을 포함한다.

핵심적인 특성은, Application Session이 gRPC stream의 실패를 **살아남을 수 있다**는 것이다. 네트워크 단절로 stream이 끊어져도, 클라이언트가 재연결하여 새로운 stream을 열고 이전 세션 토큰으로 다시 Join하면 Application Session은 이어갈 수 있다.

### gRPC Call (Stream)

하나의 Bidirectional Streaming RPC 호출이 하나의 ***HTTP/2 Stream*** 에 매핑된다. Stream ID는 클라이언트가 생성하며 홀수(1, 3, 5, ...)이다. Stream의 Lifecycle은 `HEADERS → DATA* → Trailers(END_STREAM)`이며, `RST_STREAM` 프레임으로 취소되거나 `END_STREAM` 플래그가 설정된 Trailers로 정상 종료된다.

Stream은 Transport 연결에 종속된다. Transport가 끊어지면 그 위의 **모든** Stream이 함께 죽는다. 이것이 Layer 2와 Layer 1의 결합 관계이다.

### Transport Connection (TCP/TLS/HTTP/2)

***Transport Connection*** 은 물리적 TCP 연결 위에 TLS 핸드셰이크와 HTTP/2 Connection Preface(`PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n` + SETTINGS 프레임)를 수행하여 수립된다. `ManagedChannel`이 이를 관리하며, HTTP/2 Multiplexing 덕분에 여러 Stream이 하나의 Transport를 공유한다.

### Why This Separation Matters

이 3계층 분리가 중요한 이유는 **장애 대응 전략이 계층마다 다르기 때문**이다.

| 장애 유형 | 영향 범위 | 대응 전략 |
|-----------|----------|-----------|
| 하나의 Stream 오류 (RST_STREAM) | Layer 2만 영향 | 해당 Session만 재연결. 다른 Stream은 영향 없음 |
| Transport 연결 끊김 (TCP RST/FIN) | Layer 1-2 모두 영향 | 모든 Stream 사망. Channel이 자동 재연결 시도 |
| Transport 재연결 성공 (Channel READY) | Layer 1만 복구 | **App Session은 자동 복구 아님.** 클라이언트가 새 Stream을 열고 Hello/Join을 다시 보내야 함 |

<mark><em><strong>Transport가 재연결되었다고 Application Session이 복구된 것이 아니다. Channel이 READY 상태가 되어도, 클라이언트는 새로운 bidi stream을 열고 Hello/Join 메시지를 다시 보내야 Application Session이 재수립된다.</strong></em></mark>

### Common Mistakes: Session Layer Confusion

__실무에서 자주 하는 실수 TOP 5__:

1. **gRPC stream 끊김 = app session 종료로 즉시 처리**: 재연결 + 재참여로 복구 가능한데 세션 데이터를 모두 폐기한다. 대응: Session에 TTL을 두고, 일정 시간 내 재연결 시 기존 세션을 이어가도록 설계한다.

2. **Transport 재연결을 app session 복구와 동일시**: Channel이 READY 상태가 되면 "세션이 복구되었다"고 판단하지만, app session은 새로 Hello를 보내야 한다. 대응: Channel 상태와 app session 상태를 독립적으로 관리한다.

3. **하나의 app session에 하나의 transport를 1:1 대응**: HTTP/2 multiplexing의 이점을 활용하지 못한다. 대응: ManagedChannel을 공유하고, 여러 stub이 같은 channel을 사용한다.

4. **Stream ID와 Session ID를 혼동**: HTTP/2 Stream ID(홀수 정수)는 프로토콜 레벨 식별자이고, Session ID(UUID 등)는 앱 레벨 식별자이다. 대응: 로깅 시 두 ID를 모두 기록하되, 역할을 명확히 구분한다.

5. **Transport 상태(READY/CONNECTING)만 보고 app-level health를 판단**: Connection은 살아있지만 서버가 처리 불능(deadlock, GC pause, 의존 서비스 장애)일 수 있다. 대응: App-level heartbeat(Ping/Pong)으로 end-to-end liveness를 확인한다.

## Connection Establishment: Responsibility Separation

gRPC 클라이언트의 연결 수립은 세 가지 컴포넌트가 명확히 분리된 책임을 수행한다.

### ManagedChannel

***ManagedChannel*** 은 gRPC 클라이언트의 최상위 컴포넌트이다. 하나 이상의 ***Subchannel*** (실제 TCP 연결)을 관리하며, 다음 특성을 가진다.

- **Lazy connection**: Channel을 생성해도 즉시 TCP 연결을 맺지 않는다. 첫 번째 RPC 호출 시 또는 `getState(true)` 호출 시 연결을 시작한다.
- **Thread-safe**: 여러 스레드에서 동시에 사용해도 안전하다. 하나의 Channel을 애플리케이션 전체에서 공유해야 한다.
- **Subchannel 관리**: LoadBalancer가 결정한 정책에 따라 Subchannel을 생성/폐기한다.

### NameResolver

***NameResolver*** 는 target 문자열을 실제 서버 주소 목록으로 변환한다.

| Scheme | 예시 | 동작 |
|--------|------|------|
| `dns` | `dns:///my-service:50051` | DNS A/AAAA 레코드 조회. 주기적 재조회(기본 30분) |
| `xds` | `xds:///my-service` | xDS 컨트롤 플레인(Envoy 등)에서 엔드포인트 목록 수신 |
| `static` | `static:///host1:50051,host2:50051` | 고정 주소 목록 |

실무에서 주의할 점은, JVM의 DNS 캐싱(`networkaddress.cache.ttl`)이 NameResolver의 주소 업데이트를 무력화할 수 있다는 것이다. Kubernetes 환경에서 Pod IP가 변경되었는데 JVM이 이전 IP를 캐싱하고 있으면 연결 실패가 발생한다.

### LoadBalancer

***LoadBalancer*** 는 NameResolver가 반환한 주소 목록에서 실제 RPC를 보낼 Subchannel을 선택한다.

| 정책 | 동작 | 적합한 상황 |
|------|------|------------|
| `pick_first` (기본) | 주소 목록 중 첫 번째로 연결 성공한 Subchannel만 사용 | 단일 서버, 서비스 메시 |
| `round_robin` | 모든 주소에 연결하고 RPC를 순차적으로 분배 | 다중 서버, L4 LB 없는 환경 |
| xDS 기반 | 가중치, 지역성, 우선순위 기반 라우팅 | 대규모 서비스 메시, multi-region |

### Connection State Machine

Channel의 연결 상태는 다음과 같은 상태 머신으로 관리된다.

```
                    ┌──────────────┐
                    │     IDLE     │ ← 초기 상태. RPC 호출 없으면 유지
                    └──────┬───────┘
                           │ RPC 호출 또는 getState(true)
                    ┌──────▼───────┐
              ┌────→│  CONNECTING  │ ← TCP/TLS/HTTP/2 핸드셰이크 진행
              │     └──────┬───────┘
              │            │ 성공          실패
              │     ┌──────▼───────┐      │
              │     │    READY     │      │
              │     └──────┬───────┘      │
              │            │ 연결 끊김      │
              │     ┌──────▼──────────────▼──┐
              └─────│  TRANSIENT_FAILURE     │ ← Exponential Backoff 재시도
                    └────────────────────────┘

                    ┌──────────────┐
                    │   SHUTDOWN   │ ← channel.shutdown() 호출. 복구 불가
                    └──────────────┘
```

각 상태가 존재하는 이유는 다음과 같다.

- **IDLE**: 자원 보존. 사용하지 않는 연결을 유지하느라 TCP 소켓과 메모리를 낭비하지 않는다.
- **TRANSIENT_FAILURE + Exponential Backoff**: 서버 장애 시 모든 클라이언트가 동시에 재연결을 시도하면 ***Thundering Herd*** 문제가 발생한다. 지수 백오프(initial: 1초, max: 120초)에 ±20% Jitter를 추가하여 재연결 시점을 분산시킨다.

### Common Mistakes: Connection Management

__실무에서 자주 하는 실수 TOP 5__:

1. **RPC마다 새 ManagedChannel 생성**: 매 호출마다 TCP 핸드셰이크 비용이 발생하고 file descriptor가 누수된다. 한 번 만든 Channel을 애플리케이션 수명 동안 재사용해야 한다.

2. **ManagedChannel.shutdown() 미호출**: 애플리케이션 종료 시 Channel을 shutdown하지 않으면 TCP 연결이 좀비로 남는다. `shutdown()` 후 `awaitTermination()`을 호출해야 한다.

3. **IDLE 상태에서 첫 RPC 지연을 이해하지 못함**: IDLE에서 CONNECTING → READY까지 TCP + TLS + HTTP/2 핸드셰이크 시간(수십~수백 ms)이 소요된다. 첫 RPC의 latency가 높은 것은 정상이다.

4. **Channel 상태를 polling으로 확인**: `getState(false)`를 반복 호출하는 대신, `notifyWhenStateChanged()`를 사용하여 상태 변경 시 콜백을 받아야 한다.

5. **DNS 캐싱으로 NameResolver 업데이트 불가**: JVM의 `networkaddress.cache.ttl`이 서비스 디스커버리를 무력화한다. Kubernetes 환경에서는 headless service 사용 시 이 값을 짧게(5~30초) 설정해야 한다.

## gRPC Message Framing over HTTP/2

gRPC가 HTTP/2 위에서 메시지를 어떻게 전송하는지를 프레임 레벨에서 정확히 이해해야, 운영 중 발생하는 프레이밍 관련 장애를 진단할 수 있다.

### Request Frame Sequence

gRPC 요청은 다음 순서로 HTTP/2 프레임이 전송된다.

```
Client → Server:

1. HEADERS frame
   :method      POST
   :scheme      https
   :path        /session.v1.SessionService/Session
   :authority   my-server:50051
   content-type application/grpc+proto
   te           trailers              ← gRPC 필수. Trailers 지원 확인
   grpc-timeout 30S                   ← 선택. Deadline 전파
   grpc-encoding gzip                 ← 선택. 요청 메시지 압축 방식

2. DATA frame(s)
   [5-byte Length-Prefixed Message]   ← Protobuf 직렬화된 메시지
   [5-byte Length-Prefixed Message]   ← Streaming에서는 여러 DATA 프레임

3. END_STREAM (flag on last DATA frame or empty DATA)
   ← 클라이언트가 전송을 완료했음을 알림 (half-close)
```

### Response Frame Sequence

```
Server → Client:

1. HEADERS frame
   :status      200                   ← HTTP 상태 코드 (gRPC는 항상 200)
   content-type application/grpc+proto
   grpc-encoding gzip                 ← 선택. 응답 메시지 압축 방식
   grpc-accept-encoding gzip,identity ← 서버가 지원하는 압축 방식 광고

2. DATA frame(s)
   [5-byte Length-Prefixed Message]   ← Protobuf 응답 메시지

3. Trailers (HEADERS frame with END_STREAM flag)
   grpc-status  0                     ← 필수. gRPC 상태 코드 (0=OK)
   grpc-message                       ← 선택. Percent-encoded UTF-8 에러 메시지
```

에러가 발생한 경우, 서버는 DATA 프레임 없이 ***Trailers-Only*** 응답을 보낼 수 있다. 이 경우 초기 HEADERS와 Trailers가 하나의 HEADERS 프레임으로 합쳐져 전송된다.

### 5-Byte Length-Prefixed Message Framing

gRPC는 HTTP/2 DATA 프레임 안에서 자체적인 메시지 경계를 정의한다. 각 Protobuf 메시지 앞에 ***5-byte prefix*** 가 붙는다.

```
┌───────────────┬─────────────────────────┬────────────────────────┐
│ Compressed    │ Message Length           │ Serialized Protobuf    │
│ Flag (1 byte) │ (4 bytes, big-endian)   │ Message (N bytes)      │
└───────────────┴─────────────────────────┴────────────────────────┘
```

- **Byte 0 (Compressed Flag)**: `0` = 미압축, `1` = `grpc-encoding` 헤더에 명시된 알고리즘으로 압축됨
- **Bytes 1-4 (Message Length)**: Big-endian unsigned 32-bit integer. 직렬화된 메시지의 바이트 수 (5-byte prefix 자체 크기는 포함하지 않음)
- **Bytes 5+ (Message)**: Protobuf 직렬화된 메시지 바이트

**왜 5-byte prefix가 필요한가?** HTTP/2 DATA 프레임은 중간 프록시(Envoy, nginx 등)에 의해 임의로 분할되거나 병합될 수 있다. 하나의 Protobuf 메시지가 여러 DATA 프레임에 걸쳐 나뉘거나, 여러 메시지가 하나의 DATA 프레임에 합쳐질 수 있다. 5-byte prefix가 있으면 수신자가 프레임 경계와 무관하게 원래 메시지 경계를 복원할 수 있다.

### Compression Negotiation

압축 협상은 다음과 같이 이루어진다.

1. 클라이언트가 `grpc-encoding: gzip` 헤더와 함께 압축된 메시지를 전송한다
2. 서버가 `grpc-accept-encoding: gzip, identity`로 지원하는 인코딩을 광고한다
3. 만약 서버가 클라이언트가 보낸 인코딩을 지원하지 않으면 ***UNIMPLEMENTED*** 상태 코드를 반환한다

### Trailers: grpc-status and grpc-message

gRPC의 결과 상태는 HTTP 상태 코드(항상 200)가 아닌, ***Trailers*** 에 포함된 `grpc-status`로 전달된다. 이 설계가 필요한 이유는 명확하다. 스트리밍 RPC에서 서버는 응답 데이터를 모두 보낸 **이후에** 최종 상태를 결정할 수 있어야 하기 때문이다. HTTP 상태 코드는 응답의 처음에 보내야 하므로 이 용도에 부적합하다.

- `grpc-status`: 필수. 0~16 사이의 십진 ASCII 정수이다.
- `grpc-message`: 선택. Percent-encoded UTF-8 문자열이다. 공백은 `%20`, 한글은 UTF-8 바이트의 percent-encoding으로 표현된다.

### Common Mistakes: Message Framing

__실무에서 자주 하는 실수 TOP 5__:

1. **maxInboundMessageSize 미설정**: gRPC Java의 기본 최대 메시지 크기는 4MB(4 * 1024 * 1024 bytes)이다. 이를 초과하는 메시지를 수신하면 `RESOURCE_EXHAUSTED`가 발생한다. 대용량 데이터는 streaming으로 분할 전송해야 한다.

2. **Compression 양쪽 미합의**: 클라이언트가 `gzip`으로 압축하여 보내는데 서버가 `gzip`을 지원하지 않으면 `UNIMPLEMENTED`가 반환된다. 양쪽의 `grpc-encoding` / `grpc-accept-encoding`을 반드시 확인해야 한다.

3. **5-byte prefix를 직접 파싱하려는 시도**: gRPC 프레임워크가 자동으로 처리한다. 직접 건드리면 framing이 깨진다. 커스텀 codec이 필요한 경우에만 `MessageDeframer`를 확장한다.

4. **거대한 메시지를 streaming 대신 단일 메시지로 전송**: 100MB 파일을 하나의 Protobuf 메시지로 보내면 클라이언트와 서버 양쪽에서 메모리가 폭발한다. `stream FileChunk` 패턴으로 분할해야 한다.

5. **Trailers-Only 응답 미처리**: 에러 시 서버가 DATA 없이 Trailers-Only로 응답할 수 있다. 클라이언트 코드가 이를 정상적으로 핸들링하지 않으면 예상치 못한 예외가 발생한다.

## Bidirectional Streaming: Internal Mechanics

### Two Independent Half-Streams

Bidirectional Streaming에서 클라이언트→서버(request half)와 서버→클라이언트(response half)는 **독립적인 두 개의 반방향 스트림(half-stream)** 이다.

```
Client                                           Server
  │                                                 │
  │──── Request Half (Client → Server) ───────────→ │
  │  HEADERS + DATA frames + END_STREAM             │
  │                                                 │
  │←─── Response Half (Server → Client) ──────────  │
  │  HEADERS + DATA frames + Trailers(END_STREAM)   │
  │                                                 │
```

핵심적인 특성은, 어느 한쪽이 자신의 half-stream을 닫아도 반대쪽은 영향을 받지 않는다는 것이다. 클라이언트가 `END_STREAM`을 보내(half-close) 더 이상 보낼 메시지가 없음을 알려도, 서버는 계속 응답 메시지를 보낼 수 있다. 이 독립성이 양방향 스트리밍의 유연성을 만든다.

### Kotlin Flow-Based Implementation

gRPC Kotlin stub(`io.grpc.kotlin`)을 사용하면 Bidirectional Streaming을 코루틴의 `Flow`로 자연스럽게 표현할 수 있다.

```kotlin
// 서버 측: Flow<Request> → Flow<Response>
override fun session(requests: Flow<SessionMessage>): Flow<SessionMessage> = channelFlow {
    // inbound(수신)와 outbound(송신)를 분리하여 동시 처리
    val inboundJob = launch {
        requests.collect { message ->
            when {
                message.hasHello() -> {
                    // 세션 등록 + Welcome 응답
                    val welcome = createWelcome(message.hello)
                    send(welcome) // outbound로 전송
                }
                message.hasPing() -> {
                    val pong = createPong(message.ping)
                    send(pong)
                }
                message.hasData() -> handleData(message.data)
                message.hasGoodbye() -> {
                    // 정상 종료 처리
                }
            }
        }
    }

    // outbound: 서버에서 능동적으로 보내는 메시지
    // (예: 브로드캐스트, 푸시 알림)
    // 외부에서 channel에 send()하면 클라이언트에 전달됨

    inboundJob.join() // inbound 완료 대기
}
```

`channelFlow`를 사용하는 이유는, `launch`로 수신 처리를 별도 코루틴에서 실행하면서 동시에 송신도 할 수 있기 때문이다. 일반 `flow { }` 빌더는 단일 코루틴에서 순차적으로 실행되므로 양방향 동시 처리가 불가능하다.

### Backpressure Mechanism

Bidirectional Streaming에서 ***Backpressure*** 는 HTTP/2 Flow Control과 직접 연결된다.

```
Client (Consumer)                     Server (Producer)
  │                                      │
  │  ← DATA (32KB) ─────────────────────│  Stream Window: 65535 - 32768 = 32767
  │  ← DATA (32KB) ─────────────────────│  Stream Window: 32767 - 32768 < 0
  │                                      │
  │  (Client가 느리게 소비 중)            │  [Server 블로킹됨 - window 소진]
  │                                      │
  │  ── WINDOW_UPDATE (65535) ──────────→│  Stream Window 복구
  │  (Client가 데이터 소비 후 window 갱신)│
  │                                      │
  │  ← DATA (계속 전송) ────────────────│
```

- **HTTP/2 per-stream window**: 기본 65,535 bytes (`SETTINGS_INITIAL_WINDOW_SIZE`, [RFC 9113 Section 6.9.2](https://datatracker.ietf.org/doc/html/rfc9113#section-6.9.2))
- **HTTP/2 per-connection window**: 역시 기본 65,535 bytes. 모든 스트림이 공유한다.
- 수신자가 느리면: 수신자의 window가 소진 → 송신자의 DATA 전송이 블로킹/suspend
- 수신자가 데이터를 소비하면: `WINDOW_UPDATE` 프레임을 보내 window를 복구

gRPC 내부에서는 `isReady()` / `onReady()` 콜백으로 이 메커니즘을 관리한다. Kotlin 코루틴에서는 `Channel`의 버퍼 크기(기본 `BUFFERED = 64`)가 코루틴 레벨의 backpressure를 제공한다.

### Slow Consumer Problem

느린 consumer는 단일 스트림을 넘어 **전체 연결을 마비**시킬 수 있다. 이것이 가장 위험한 시나리오이다.

```
1. 서버가 클라이언트보다 빠르게 메시지를 전송한다
2. 클라이언트의 TCP 수신 버퍼가 채워진다
3. 클라이언트가 WINDOW_UPDATE를 보내지 않는다 → 스트림별 window 소진
4. 서버의 write 호출이 suspend/블로킹된다
5. [위험] Connection-level window도 소진되면:
   → 동일 연결의 모든 스트림이 정체된다
   → 해당 연결의 다른 unary RPC도 전송 불가
   → 연쇄적 DEADLINE_EXCEEDED 발생
6. [최악] Unbounded buffering을 사용하면:
   → 서버 메모리 폭발 → OOM Kill
```

대응 패턴:
- Streaming RPC와 Unary RPC에 별도의 Channel을 사용하여 연결 격리
- 서버 측에서 per-session 전송 큐에 크기 제한을 두고, 초과 시 오래된 메시지를 drop
- 클라이언트 측에서 수신 속도를 모니터링하고, 지연 시 서버에 throttle 신호를 전송

### Common Mistakes: Bidirectional Streaming

__실무에서 자주 하는 실수 TOP 5__:

1. **단일 코루틴에서 send/receive를 순차 처리**: `flow { }` 빌더 안에서 `collect()`를 호출하면 수신 완료까지 송신이 블로킹된다. `channelFlow` + `launch`로 inbound/outbound를 분리해야 한다. 안 하면 deadlock이 발생한다.

2. **Backpressure를 무시하고 무제한 전송**: 서버가 `isReady()` 확인 없이 메시지를 계속 쏟아부으면 HTTP/2 flow control window가 소진되고, 연결 전체가 정체된다. 심하면 OOM이 발생한다.

3. **`onError()` 후 추가 메시지 전송 시도**: 스트림이 에러로 종료된 후 `send()`를 호출하면 `IllegalStateException`이 발생한다. 에러/완료 상태를 추적하는 플래그를 관리해야 한다.

4. **Flow에서 예외 발생 시 스트림 전체 사망**: `collect { }` 안에서 하나의 메시지 처리 중 예외가 발생하면 전체 Flow가 취소된다. 개별 메시지 처리는 `try-catch`로 감싸야 한다.

5. **무한 스트림에서 cleanup 없이 방치**: 코루틴의 `Job`을 추적하지 않으면 서버 종료 시 좀비 코루틴이 남는다. `CoroutineScope`의 `cancel()`이나 structured concurrency를 활용해야 한다.

## Termination and Disconnection Detection

Bidirectional Streaming에서 "스트림이 끝났다"는 신호는 여러 가지 경로로 전달된다. 정상 종료와 비정상 종료를 정확히 구분하지 못하면 리소스 누수와 좀비 세션이 발생한다.

### Normal Termination

정상적인 스트림 종료는 `END_STREAM` 플래그와 Trailers를 통해 이루어진다.

```
Client                                           Server
  │                                                 │
  │ [Client가 보낼 메시지를 다 보냄]                   │
  │── DATA + END_STREAM ──────────────────────────→ │
  │                                                 │
  │ [Server가 처리 완료]                              │
  │←── DATA (마지막 응답) ─────────────────────────  │
  │←── Trailers (grpc-status=0) + END_STREAM ────── │
  │                                                 │
  │ [양쪽 모두 정상 종료]                              │
```

- 클라이언트가 `END_STREAM`을 보내면 → 서버의 `requests: Flow<T>` 가 완료된다 (onCompleted)
- 서버가 Trailers와 `END_STREAM`을 보내면 → 클라이언트의 `collect`가 완료된다 (status OK → onCompleted, 그 외 → onError)

### Abnormal Termination: RST_STREAM vs GOAWAY vs TCP FIN/RST

| 메커니즘 | HTTP/2 프레임 | 영향 범위 | 원인 | 클라이언트가 받는 Status |
|---------|-------------|----------|------|----------------------|
| ***RST_STREAM*** | Type 0x3, 32-bit error code | **단일 스트림** | Client cancel, Server reject, ENHANCE_YOUR_CALM | CANCELLED (client cancel), UNAVAILABLE (server reject) |
| ***GOAWAY*** | Type 0x7, Last-Stream-ID + error code + debug | **전체 연결** (새 스트림만 차단) | Graceful shutdown, too_many_pings, 서버 과부하 | In-flight 스트림은 계속, 미처리 스트림은 UNAVAILABLE |
| ***TCP FIN*** | TCP 레벨 (4-way close) | **전체 연결** | 정상 TCP 종료 (GOAWAY 후) | GOAWAY가 선행했으면 정상. 아니면 UNAVAILABLE |
| ***TCP RST*** | TCP 레벨 (즉시 종료) | **전체 연결** | NAT timeout, 프로세스 crash, OS buffer overflow | UNAVAILABLE |
| ***Network Partition*** | 없음 (silent) | **감지 불가** | 물리적 네트워크 단절 | keepalive timeout → UNAVAILABLE, 또는 deadline → DEADLINE_EXCEEDED |

### RST_STREAM Detail

`RST_STREAM` 프레임은 **스트림 하나만** 즉시 종료한다. 32-bit error code를 포함한다.

- **CANCEL (0x8)**: 클라이언트가 RPC를 취소했을 때. `context.cancel()`이나 `job.cancel()` 호출 시 전송된다.
- **REFUSED_STREAM (0x7)**: 서버가 스트림을 거부했을 때. 서버의 최대 동시 스트림 수(`SETTINGS_MAX_CONCURRENT_STREAMS`)를 초과한 경우.
- **ENHANCE_YOUR_CALM (0xb)**: 클라이언트의 PING 빈도가 서버의 `permitKeepAliveTime` 미만일 때.

### GOAWAY Detail

`GOAWAY` 프레임은 **연결 레벨의 정상적 종료 예고**이다.

```
+---------------------------------------------------------------+
|                 Last-Stream-ID (31 bits)                       |
+---------------------------------------------------------------+
|                 Error Code (32 bits)                           |
+---------------------------------------------------------------+
|                 Additional Debug Data (variable)               |
+---------------------------------------------------------------+
```

GOAWAY를 수신한 클라이언트의 동작:
- `Last-Stream-ID` 이하의 스트림: 계속 정상 처리
- `Last-Stream-ID` 초과의 스트림: 서버가 처리하지 않았으므로 **다른 연결에서 재시도 가능** (safe to retry)
- **새 스트림 생성 금지**: GOAWAY 수신 후 이 연결에서 새 스트림을 열면 안 된다

### Network Partition Detection

네트워크 파티션(silent drop)은 **어떤 프레임도 수신되지 않으므로** 가장 감지하기 어려운 장애이다. 감지 방법은 오직 세 가지이다.

1. **HTTP/2 PING timeout (gRPC keepalive)**: 가장 빠른 감지. `keepAliveTime` 간격으로 PING을 보내고, `keepAliveTimeout` 내에 응답이 없으면 연결을 끊는다. 전형적으로 30초 + 10초 = 최대 40초 내 감지.

2. **TCP keepalive**: OS 레벨. Linux 기본값: `tcp_keepalive_time=7200`(2시간), `tcp_keepalive_intvl=75`(75초), `tcp_keepalive_probes=9`(9회). 기본 설정으로는 약 2시간 11분 후에야 감지한다. 매우 느리다.

3. **Application-level heartbeat**: bidi stream 안에서 Ping/Pong 메시지를 주고받아 감지. 가장 세밀한 제어가 가능하지만, 앱 레벨 구현이 필요하다.

### Keepalive Timeout to Status Code Mapping

keepalive ping timeout이 발생하면 gRPC가 어떤 Status code로 매핑하는지 정확히 알아야 클라이언트의 재시도 로직을 올바르게 설계할 수 있다.

| 시나리오 | gRPC Status Code | 재시도 가능 여부 |
|---------|-----------------|---------------|
| PING ACK 미수신 (keepAliveTimeout 초과) | ***UNAVAILABLE*** | Yes (backoff) |
| ENHANCE_YOUR_CALM GOAWAY 수신 | ***UNAVAILABLE*** | Yes (설정 수정 필요) |
| 파티션 중 deadline 초과 | ***DEADLINE_EXCEEDED*** | Conditional |
| 클라이언트가 직접 cancel() 호출 | ***CANCELLED*** | No |
| 서버가 RST_STREAM CANCEL 전송 | ***CANCELLED*** | No |
| TCP RST 수신 | ***UNAVAILABLE*** | Yes (backoff) |
| GOAWAY 후 미처리 스트림 | ***UNAVAILABLE*** | Yes (다른 서버로) |

### Common Mistakes: Termination Detection

__실무에서 자주 하는 실수 TOP 5__:

1. **RST_STREAM과 GOAWAY 혼동**: RST_STREAM은 스트림 하나만 종료하고, GOAWAY는 전체 연결을 종료 예고한다. GOAWAY 수신 시 in-flight 스트림은 계속되지만 새 스트림은 열 수 없다.

2. **finally 블록 없는 stream handler**: 비정상 종료(클라이언트 disconnect, 예외, RST_STREAM) 시 `SessionRegistry` 정리가 되지 않아 좀비 세션이 누적된다. stream handler는 반드시 `try-finally`로 감싸야 한다.

3. **Network partition을 즉시 감지 가능하다고 가정**: keepalive가 설정되지 않으면 수 시간 동안 감지가 불가능하다. `keepAliveTime`을 반드시 설정하고, app-level heartbeat를 추가 안전망으로 사용한다.

4. **GOAWAY 수신 후 같은 연결에서 새 스트림 열기 시도**: GOAWAY는 "이 연결에서 새 스트림 금지" 신호이다. `ManagedChannel`은 이를 자동으로 처리하지만, 직접 HTTP/2 연결을 관리하는 경우 주의해야 한다.

5. **TCP FIN과 정상 gRPC 종료를 구분하지 못함**: 정상 gRPC 종료는 Trailers(grpc-status) 전송 후 TCP FIN이 온다. Trailers 없이 갑자기 TCP FIN이 오면 비정상 종료이며, `UNAVAILABLE`로 처리해야 한다.

## Keepalive vs Health Check vs Application Heartbeat

연결 상태를 확인하는 메커니즘은 세 가지가 있으며, 각각 목적과 동작 레이어가 다르다. 이 세 가지를 혼동하면 불필요한 오버헤드나 감지 누락이 발생한다.

| Aspect | HTTP/2 Keepalive (PING) | gRPC Health Check | App-level Heartbeat |
|--------|------------------------|-------------------|---------------------|
| **계층** | Transport (HTTP/2 프레임) | Application (gRPC 서비스) | Application (비즈니스 로직) |
| **목적** | 죽은 연결 감지 | 서비스 readiness 확인 | 앱 레벨 liveness, RTT 측정 |
| **메커니즘** | HTTP/2 PING 프레임 (8바이트 opaque data, [RFC 9113 Section 6.7](https://datatracker.ietf.org/doc/html/rfc9113#section-6.7)) | Unary/Streaming RPC to `grpc.health.v1.Health` | 커스텀 Ping/Pong 메시지 in bidi stream |
| **발신자** | 클라이언트 (또는 서버) | LB / 오케스트레이터 (K8s) | 스트림 내부의 양쪽 |
| **실패 감지** | 연결 레벨만 | 서비스 레벨 | 세션 레벨 |
| **과도한 빈도의 부작용** | ENHANCE_YOUR_CALM GOAWAY | 일반적 RPC 오버헤드 | 없음 (앱이 제어) |

### HTTP/2 Keepalive (PING)

HTTP/2 PING 프레임은 연결 레벨에서 "이 TCP 연결이 아직 살아있는가?"를 확인한다.

서버 설정 가이드라인:
```kotlin
// Server
NettyServerBuilder.forPort(50051)
    .permitKeepAliveTime(10, TimeUnit.SECONDS)  // 클라이언트 PING 최소 간격 허용
    .permitKeepAliveWithoutCalls(true)           // 활성 RPC 없어도 PING 허용
    .maxConnectionIdle(5, TimeUnit.MINUTES)      // 유휴 연결 자동 정리
    .maxConnectionAge(30, TimeUnit.MINUTES)      // 연결 최대 수명 (graceful 재연결 유도)
    .maxConnectionAgeGrace(5, TimeUnit.MINUTES)  // 연결 수명 초과 후 기존 RPC 완료 유예
```

클라이언트 설정 가이드라인:
```kotlin
// Client
ManagedChannelBuilder.forTarget("dns:///my-service:50051")
    .keepAliveTime(30, TimeUnit.SECONDS)      // PING 전송 간격
    .keepAliveTimeout(10, TimeUnit.SECONDS)   // PING 응답 대기 시간
    .keepAliveWithoutCalls(true)              // 활성 RPC 없어도 PING 전송
```

### too_many_pings: ENHANCE_YOUR_CALM

클라이언트의 `keepAliveTime`이 서버의 `permitKeepAliveTime`보다 짧으면 서버는 ***ENHANCE_YOUR_CALM*** 에러(HTTP/2 error code 0xb)와 함께 GOAWAY를 전송한다.

```
Client keepAliveTime=10s  |  Server permitKeepAliveTime=5min (기본값)

t=0:   Client → PING
t=10:  Client → PING
t=20:  Client → PING       ← Server: "너무 빈번하다"
                            ← Server → GOAWAY (ENHANCE_YOUR_CALM)
                            ← Client: UNAVAILABLE → TRANSIENT_FAILURE
t=21:  Channel 재연결 시도
t=22:  Client → PING
t=32:  Client → PING       ← 또 GOAWAY
                            ← 무한 반복 (설정 수정 전까지)
```

이 문제는 클라이언트와 서버의 keepalive 설정이 불일치할 때 발생하는 가장 흔한 운영 장애 중 하나이다. 대응: `keepAliveTime >= permitKeepAliveTime`을 반드시 보장한다.

### gRPC Health Check

표준 `grpc.health.v1.Health` 서비스는 로드밸런서와 오케스트레이터가 서비스의 readiness를 판단하는 데 사용된다. 이것은 "연결이 살아있는가?"가 아니라 "서비스가 요청을 처리할 준비가 되었는가?"를 확인한다.

- **Check RPC**: Unary. 즉시 현재 상태(`SERVING`, `NOT_SERVING`, `SERVICE_UNKNOWN`)를 반환한다.
- **Watch RPC**: Server Streaming. 상태가 변경될 때마다 스트리밍으로 알려준다.
- `NOT_SERVING` → LB가 해당 인스턴스를 rotation에서 제거 → 새 연결이 라우팅되지 않음

### Application-Level Heartbeat (Ping/Pong)

bidi stream 안에서 커스텀 Ping/Pong 메시지를 주고받는 것은 가장 세밀한 liveness 감지를 제공한다.

- **Per-session liveness**: HTTP/2 keepalive는 연결 레벨이지만, app heartbeat는 **개별 세션** 단위로 liveness를 감지한다.
- **App-level RTT 측정**: Ping에 timestamp를 포함하고 Pong에서 계산하면 end-to-end RTT를 측정할 수 있다.
- **논리적 장애 감지**: 서버 프로세스가 deadlock이나 GC pause 상태이면 연결은 살아있지만 app heartbeat 응답이 오지 않는다. HTTP/2 keepalive로는 이것을 감지할 수 없다.

### Common Mistakes: Keepalive Configuration

__실무에서 자주 하는 실수 TOP 5__:

1. **클라이언트 keepAliveTime < 서버 permitKeepAliveTime**: ENHANCE_YOUR_CALM GOAWAY가 반복 발생하며 무한 재연결 루프에 빠진다. 클라이언트-서버 설정을 반드시 조율해야 한다.

2. **TCP keepalive와 HTTP/2 PING keepalive를 혼동**: 완전히 다른 레이어이다. TCP keepalive는 OS 레벨(Linux 기본 2시간), HTTP/2 PING은 앱 레벨(gRPC 설정)이다. 대부분의 경우 HTTP/2 keepalive만으로 충분하다.

3. **keepAliveWithoutCalls=true인데 서버가 permitKeepAliveWithoutCalls=false**: 활성 RPC가 없을 때 클라이언트가 PING을 보내면 서버가 거부한다. 양쪽 설정을 일치시켜야 한다.

4. **maxConnectionAge만 설정하고 maxConnectionAgeGrace 미설정**: 장기 bidi stream이 maxConnectionAge 도달 시 grace 기간 없이 즉시 끊긴다. `maxConnectionAgeGrace`로 기존 스트림의 완료 유예 시간을 반드시 설정해야 한다.

5. **NAT/방화벽 idle timeout보다 긴 keepAliveTime 설정**: NAT 매핑이 소멸하여 좀비 커넥션이 발생한다. `keepAliveTime`을 NAT idle timeout의 절반 이하로 설정한다.

## Status Code Design for Bidirectional Streaming

Unary RPC에서의 Status code 사용은 비교적 단순하지만, Bidirectional Streaming에서는 **스트림 중간에 에러가 발생할 수 있다**는 점에서 설계가 복잡해진다.

### Server-Side Status Code Usage

| Status Code | Bidi Streaming에서의 사용 | 예시 |
|-------------|-------------------------|------|
| ***INVALID_ARGUMENT*** (3) | 스트림 중 수신한 메시지의 형식이 잘못됨 | Hello 메시지에 clientId 누락 |
| ***UNAUTHENTICATED*** (16) | 스트림 진행 중 토큰 만료 | JWT 유효기간 초과 |
| ***PERMISSION_DENIED*** (7) | 인가 실패 (인증은 됐으나 권한 없음) | 특정 topic에 대한 구독 권한 없음 |
| ***UNAVAILABLE*** (14) | 일시적 서비스 장애 (재시도 안전) | 의존 서비스 timeout, DB 연결 풀 소진 |
| ***RESOURCE_EXHAUSTED*** (8) | 동시 세션 수 초과, rate limit | maxConcurrentSessions 도달 |
| ***DEADLINE_EXCEEDED*** (4) | 스트림이 설정된 deadline을 초과 | grpc-timeout 초과 |
| ***CANCELLED*** (1) | 클라이언트가 정상적으로 취소 | 사용자가 연결 해제 버튼 클릭 |
| ***INTERNAL*** (13) | 서버 내부 버그 (재시도 무의미) | NullPointerException, 미처리 예외 |
| ***ABORTED*** (10) | 동시 수정 충돌 | 같은 엔티티에 대한 중복 세션 |

### Client Retry Decision Table

클라이언트가 Status code에 따라 어떤 행동을 해야 하는지를 결정하는 테이블이다. 이 테이블은 재시도 로직 구현의 핵심이다.

| Status Code | 재시도 | 행동 | 이유 |
|-------------|--------|------|------|
| OK (0) | No | - | 성공 |
| CANCELLED (1) | No | - | 클라이언트가 직접 취소함 |
| INVALID_ARGUMENT (3) | No | 요청 수정 | 같은 요청은 같은 결과 |
| NOT_FOUND (5) | No | - | 리소스 부재 |
| ALREADY_EXISTS (6) | No | - | 이미 존재 |
| PERMISSION_DENIED (7) | No | - | 인가 문제, 인증 아님 |
| UNAUTHENTICATED (16) | **1회** | 토큰 갱신 → 재시도 | 토큰 만료 가능성 |
| RESOURCE_EXHAUSTED (8) | **Yes** | Backoff 후 재시도 | 일시적 제한, 회복 가능 |
| ABORTED (10) | **Yes** | 재시도 | 동시성 충돌, 재시도로 해결 가능 |
| UNAVAILABLE (14) | **Yes** | Backoff 후 재시도 | 일시적 장애, 가장 흔한 재시도 대상 |
| DEADLINE_EXCEEDED (4) | **조건부** | 더 긴 deadline으로 재시도 | 상황에 따라 성공 가능 |
| INTERNAL (13) | No | Alert/로깅 | 서버 버그, 재시도 무의미 |
| DATA_LOSS (15) | No | Alert/에스컬레이션 | 치명적 데이터 문제 |
| UNKNOWN (2) | **조건부** | 로깅 후 판단 | 예측 불가 |

### UNAVAILABLE vs INTERNAL

이 두 코드의 구분은 재시도 정책에서 가장 중요한 판단 기준이다.

- **UNAVAILABLE**: "지금 일시적으로 처리할 수 없다. 나중에 다시 시도하라." 서버 과부하, 의존 서비스 장애, 네트워크 글리치. **항상 재시도 가능**하다.
- **INTERNAL**: "서버에 버그가 있다." NullPointerException, assertion failure, 미처리 예외. 같은 요청을 다시 보내도 **같은 결과**가 나올 가능성이 높다. 재시도하면 안 되고 alert를 발생시켜야 한다.

실무에서 "INTERNAL을 반환해야 할 곳에서 UNAVAILABLE을 반환하면", 클라이언트가 서버 버그를 무한 재시도하여 서버 부하를 가중시킨다. 반대로 "UNAVAILABLE을 반환해야 할 곳에서 INTERNAL을 반환하면", 클라이언트가 재시도를 포기하여 불필요한 에러율 증가가 발생한다.

### UNAUTHENTICATED Retry Pattern

```kotlin
// Token 만료 시 1회 갱신 후 재시도하는 패턴
suspend fun connectWithTokenRefresh() {
    try {
        runSession()
    } catch (e: StatusException) {
        if (e.status.code == Status.Code.UNAUTHENTICATED) {
            // 1회 토큰 갱신 시도
            val newToken = tokenProvider.refresh()
            if (newToken != null) {
                updateAuthMetadata(newToken)
                runSession()  // 1회만 재시도
            } else {
                throw e  // 갱신 실패 → 에러 전파
            }
        } else {
            throw e
        }
    }
}
```

### Common Mistakes: Status Code Usage

__실무에서 자주 하는 실수 TOP 5__:

1. **모든 에러를 INTERNAL로 반환**: 클라이언트가 재시도 가능 여부를 판단할 수 없다. Status code는 "클라이언트에게 다음 행동을 알려주는 신호"이다.

2. **UNAVAILABLE과 INTERNAL 구분 못함**: 일시적 장애(DB 연결 실패)를 INTERNAL로 반환하면 클라이언트가 재시도를 포기한다. 반대로 서버 버그를 UNAVAILABLE로 반환하면 무한 재시도가 발생한다.

3. **grpc-message에 민감 정보 포함**: 스택 트레이스, DB 쿼리, 내부 호스트명을 grpc-message에 넣으면 클라이언트에 내부 구현이 노출된다. grpc-message는 사용자가 볼 수 있는 메시지만 포함해야 한다.

4. **UNAUTHENTICATED와 PERMISSION_DENIED 혼동**: UNAUTHENTICATED(16)은 "누구인지 모르겠다"(인증 실패), PERMISSION_DENIED(7)는 "누구인지는 알지만 권한이 없다"(인가 실패)이다. 전자는 토큰 갱신으로 해결 가능하고, 후자는 권한 변경이 필요하다.

5. **RESOURCE_EXHAUSTED에 대한 즉시 재시도**: 서버가 이미 과부하 상태인데 backoff 없이 즉시 재시도하면 상황이 악화된다. 반드시 exponential backoff를 적용해야 한다.

## Graceful Shutdown: The Definitive Sequence

gRPC 서버의 안전한 종료는 단순히 `server.shutdown()`을 호출하는 것이 아니다. 장기 실행되는 Bidirectional Streaming이 있는 환경에서는 **6단계 시퀀스**를 따라야 한다.

### Step-by-Step Shutdown Sequence

```
Step 1. Health Status → NOT_SERVING
  │  healthManager.setStatus("", ServingStatus.NOT_SERVING)
  │  → LB가 health check 실패 감지 → 이 서버로의 새 연결 라우팅 중단
  │  → 5~10초 대기 (LB가 라우팅 테이블을 갱신할 시간)
  │
Step 2. Application-Level Shutdown Broadcast
  │  모든 활성 bidi stream에 ServerShutdown 메시지 전송
  │  retryAfterSeconds 포함 → 클라이언트가 다른 서버로 재연결할 시간 안내
  │
Step 3. server.shutdown()
  │  HTTP/2 GOAWAY 프레임 전송 (모든 연결에)
  │  새 스트림 수락 중단
  │  기존 스트림은 계속 처리 가능
  │  [non-blocking 호출]
  │
Step 4. Drain Period
  │  server.awaitTermination(30, TimeUnit.SECONDS)
  │  진행 중인 스트림이 정상 완료될 때까지 대기
  │  클라이언트들이 ServerShutdown을 수신하고 정상 종료 + 재연결
  │
Step 5. server.shutdownNow()  [timeout 초과 시]
  │  남은 스트림에 RST_STREAM 전송 (강제 종료)
  │  일부 클라이언트는 crash했거나 네트워크 파티션 상태일 수 있으므로
  │  영원히 기다릴 수 없다
  │
Step 6. Resource Cleanup
  │  SessionRegistry 정리
  │  메트릭 flush
  │  Connection pool 종료
```

### Why Each Step Matters

- **Step 1을 Step 3보다 먼저**: GOAWAY를 보내기 전에 Health를 NOT_SERVING으로 변경해야 한다. 그렇지 않으면 LB가 아직 이 서버로 라우팅하는 짧은 윈도우에서 새 연결이 즉시 GOAWAY로 거부되어 에러 스파이크가 발생한다.

- **Step 2가 필수인 이유**: GOAWAY는 **새 스트림 생성만 차단**한다. 이미 열려있는 bidi stream은 GOAWAY를 받아도 계속 동작한다. 장기 실행 스트림에게는 "곧 서버가 종료되니 정리하라"는 앱 레벨 알림이 필요하다.

- **Step 5가 필요한 이유**: 일부 클라이언트는 이미 crash했거나 네트워크 파티션 상태일 수 있다. 이런 스트림은 영원히 완료되지 않으므로 강제 종료가 필요하다.

### Kotlin Graceful Shutdown Implementation

```kotlin
fun configureShutdownHook(
    server: Server,
    registry: SessionRegistry,
    healthManager: HealthStatusManager
) {
    Runtime.getRuntime().addShutdownHook(Thread {
        val logger = LoggerFactory.getLogger("ShutdownHook")
        logger.info("Shutdown initiated")

        // Step 1: Health → NOT_SERVING
        healthManager.setStatus("", ServingStatus.NOT_SERVING)
        logger.info("Health set to NOT_SERVING, waiting for LB update...")
        Thread.sleep(5_000) // LB 라우팅 테이블 갱신 대기

        // Step 2: Broadcast ServerShutdown to all active sessions
        val shutdownMsg = SessionMessage.newBuilder()
            .setServerShutdown(
                ServerShutdown.newBuilder()
                    .setReason("Server shutting down for deployment")
                    .setRetryAfterSeconds(5)
            ).build()
        registry.getAll().forEach { session ->
            runCatching {
                runBlocking { session.outbound.send(shutdownMsg) }
            }.onFailure {
                logger.warn("Failed to notify session {}: {}", session.sessionId, it.message)
            }
        }
        logger.info("Notified {} active sessions", registry.activeCount())

        // Step 3: GOAWAY
        server.shutdown()
        logger.info("Server shutdown initiated (GOAWAY sent)")

        // Step 4: Drain
        try {
            if (!server.awaitTermination(30, TimeUnit.SECONDS)) {
                // Step 5: Force shutdown
                logger.warn("Drain timeout exceeded, forcing shutdown")
                server.shutdownNow()
                server.awaitTermination(5, TimeUnit.SECONDS)
            }
        } catch (e: InterruptedException) {
            server.shutdownNow()
        }

        // Step 6: Cleanup
        logger.info("Server terminated. Final session count: {}", registry.activeCount())
    })
}
```

### Common Mistakes: Graceful Shutdown

__실무에서 자주 하는 실수 TOP 5__:

1. **GOAWAY 없이 즉시 프로세스 종료(kill -9)**: 클라이언트가 in-flight 요청의 실패 원인을 알 수 없다. GOAWAY는 "안전하게 재시도 가능한 스트림"을 알려주는 중요한 정보이다.

2. **shutdownNow()만 사용**: 진행 중인 스트림이 정상 완료할 기회 없이 즉시 RST_STREAM으로 끊긴다. shutdown() → awaitTermination() → shutdownNow() 순서를 따라야 한다.

3. **장기 스트림(bidi streaming) 드레인 미고려**: Drain timeout이 30초인데 bidi stream이 완료에 1분이 걸리면 강제 종료된다. ServerShutdown 메시지로 클라이언트에게 정리 시간을 주어야 한다.

4. **Health를 NOT_SERVING으로 변경하기 전에 server.shutdown() 호출**: LB가 아직 이 서버로 라우팅하는 짧은 윈도우(수 초)에서 새 연결이 즉시 UNAVAILABLE로 거부되어 에러 스파이크가 발생한다.

5. **Shutdown hook에서 무한 대기**: JVM shutdown hook은 timeout이 없지만, 컨테이너 환경(K8s)에서는 `terminationGracePeriodSeconds`(기본 30초) 후 SIGKILL이 온다. 전체 shutdown 시퀀스가 이 시간 안에 완료되어야 한다.

## Session Registry and Cache Cleanup

Bidirectional Streaming 서버에서 ***SessionRegistry*** 는 활성 세션의 상태를 관리하는 핵심 컴포넌트이다. 등록/해제 시점과 좀비 세션 정리 전략이 서비스 안정성을 좌우한다.

### Registration: Hello/Join

세션 등록은 클라이언트가 bidi stream을 열고 첫 번째 메시지(Hello/Join)를 보낼 때 수행한다.

```kotlin
data class SessionInfo(
    val sessionId: String,
    val clientId: String,
    val connectedAt: Instant,
    var lastActivity: Instant,
    val outbound: SendChannel<SessionMessage>,
    val job: Job
)

class SessionRegistry {
    private val sessions = ConcurrentHashMap<String, SessionInfo>()

    fun register(info: SessionInfo) {
        sessions[info.sessionId] = info
        activeSessionsGauge.inc()
    }

    fun unregister(sessionId: String): SessionInfo? {
        val removed = sessions.remove(sessionId)
        if (removed != null) activeSessionsGauge.dec()
        return removed
    }

    fun updateActivity(sessionId: String) {
        sessions[sessionId]?.lastActivity = Instant.now()
    }

    fun getAll(): Collection<SessionInfo> = sessions.values
    fun activeCount(): Int = sessions.size
}
```

등록 시점에 저장하는 정보: `sessionId`, `clientId`, 연결 시각, 마지막 활동 시각, outbound `SendChannel` 참조(서버→클라이언트 메시지 전송용), 코루틴 `Job` 참조(강제 취소용).

### Deregistration: finally Block

세션 해제는 **반드시 `try-finally` 블록의 `finally`에서** 수행해야 한다. 이것이 가장 중요한 규칙이다.

```kotlin
override fun session(requests: Flow<SessionMessage>): Flow<SessionMessage> = channelFlow {
    val sessionId = UUID.randomUUID().toString()
    var registered = false

    try {
        requests.collect { message ->
            when {
                message.hasHello() -> {
                    val info = SessionInfo(
                        sessionId = sessionId,
                        clientId = message.hello.clientId,
                        connectedAt = Instant.now(),
                        lastActivity = Instant.now(),
                        outbound = channel,
                        job = coroutineContext.job
                    )
                    registry.register(info)
                    registered = true
                    send(createWelcome(sessionId))
                }
                message.hasPing() -> {
                    registry.updateActivity(sessionId)
                    send(createPong(message.ping))
                }
                message.hasData() -> {
                    registry.updateActivity(sessionId)
                    processData(sessionId, message.data)
                }
                message.hasGoodbye() -> {
                    logger.info("[{}] Client goodbye: {}", sessionId, message.goodbye.reason)
                }
            }
        }
    } finally {
        // 정상/비정상 종료 모두 여기를 통과한다
        if (registered) {
            val info = registry.unregister(sessionId)
            if (info != null) {
                val duration = Duration.between(info.connectedAt, Instant.now())
                logger.info("[{}] Session closed. Duration: {}s, Client: {}",
                    sessionId, duration.seconds, info.clientId)
            }
        }
    }
}
```

`finally`가 실행되는 경우: 정상 종료(onCompleted), 클라이언트 취소(RST_STREAM), 서버 예외, 네트워크 단절(keepalive timeout), deadline 초과. **모든 종료 경로에서** registry 정리가 보장된다.

### TTL and Reaper Pattern

`finally` 블록은 대부분의 경우에 동작하지만, JVM crash나 SIGKILL 같은 극단적 상황에서는 실행되지 않을 수 있다. 이에 대한 safety net으로 ***TTL + Reaper*** 패턴을 사용한다.

```kotlin
class SessionReaper(
    private val registry: SessionRegistry,
    private val scope: CoroutineScope,
    private val sessionTtl: Duration = Duration.ofMinutes(5),
    private val reaperInterval: Duration = Duration.ofSeconds(60)
) {
    fun start(): Job = scope.launch {
        while (isActive) {
            delay(reaperInterval.toMillis())
            val now = Instant.now()
            var reaped = 0
            registry.getAll().forEach { session ->
                if (Duration.between(session.lastActivity, now) > sessionTtl) {
                    session.job.cancel(CancellationException("Session TTL exceeded"))
                    registry.unregister(session.sessionId)
                    reaped++
                    logger.warn("[{}] Reaped zombie session (inactive {}s)",
                        session.sessionId,
                        Duration.between(session.lastActivity, now).seconds)
                }
            }
            if (reaped > 0) {
                logger.info("Reaper cycle: reaped {} zombie sessions", reaped)
            }
        }
    }
}
```

Reaper는 주기적으로 registry를 순회하면서, `lastActivity`가 TTL을 초과한 세션을 강제 종료하고 정리한다. 이는 finally가 실행되지 못한 좀비 세션을 제거하는 최후의 안전망이다.

### Common Mistakes: Session Registry

__실무에서 자주 하는 실수 TOP 5__:

1. **finally 블록 누락**: 비정상 종료 시 세션이 registry에 좀비로 남아 메모리가 누수된다. stream handler는 반드시 `try-finally`로 감싸야 한다.

2. **TTL reaper 미구현**: `finally`도 JVM crash 시에는 실행되지 않는다. Safety net으로 reaper가 필요하다. reaper 없으면 좀비 세션이 무한 누적된다.

3. **ConcurrentHashMap 순회 중 삭제 실수**: `ConcurrentHashMap.entries`는 weakly consistent iterator를 반환한다. `removeIf`는 안전하지만, 수동 `forEach` + `remove`는 `ConcurrentModificationException`은 발생하지 않지만 일부 항목을 놓칠 수 있다.

4. **SendChannel을 close하지 않고 registry에서만 제거**: 채널이 열린 채로 남으면 송신 코루틴이 suspend 상태로 좀비화된다. registry 해제 시 `Job.cancel()`로 관련 코루틴을 정리해야 한다.

5. **Hello 수신 전에 세션 등록**: 아직 인증/검증되지 않은 세션이 registry에 등록되면, 악의적 클라이언트가 연결만 열고 Hello를 보내지 않아 리소스를 고갈시킬 수 있다. 반드시 Hello 메시지 수신 + 검증 후 등록해야 한다.

## Observability and Debugging in Production

운영 환경에서 Bidirectional Streaming을 디버깅하려면 **세 가지 식별자**와 **핵심 메트릭**, **구조적 로깅**이 필수이다.

### Three Identifiers

| 식별자 | 레벨 | 용도 | 예시 |
|--------|------|------|------|
| ***Correlation ID*** | 요청 체인 | 서비스 간 요청 추적 | gRPC Metadata로 전파: `x-correlation-id` |
| ***Session ID*** | 앱 세션 | bidi stream 세션 식별 | UUID: `550e8400-e29b-41d4-...` |
| ***Stream ID*** | HTTP/2 | HTTP/2 스트림 식별 | 홀수 정수: 1, 3, 5, ... |

로깅 시 이 세 가지를 모두 포함해야 문제 발생 시 "어느 요청 체인의, 어느 세션의, 어느 스트림에서" 발생했는지를 추적할 수 있다.

### Essential Metrics

```
// Gauge (현재 값)
grpc_server_active_sessions              → 활성 세션 수
grpc_server_session_registry_size        → Registry 크기 (active_sessions와 불일치 시 좀비 존재)

// Counter (누적)
grpc_client_reconnect_total              → 재연결 횟수 (labels: client_id)
grpc_server_status_code_total            → 에러 코드별 카운트 (labels: code, method)
grpc_server_message_total                → 메시지 처리량 (labels: direction=inbound|outbound)
grpc_server_backpressure_events_total    → Backpressure 발생 횟수

// Histogram (분포)
grpc_session_duration_seconds            → 세션 지속 시간
grpc_session_ping_rtt_seconds            → Ping RTT
```

**주의**: 메트릭 label에 `session_id`를 포함하면 ***cardinality 폭발*** 이 발생한다. 세션이 수만 개이면 Prometheus 메모리가 폭발한다. `session_id`는 로그에만 포함하고, 메트릭에는 집계된 값만 사용한다.

### Structured Logging Pattern

```kotlin
// 구조적 로그 패턴
class SessionLoggingInterceptor : ServerInterceptor {
    override fun <ReqT, RespT> interceptCall(
        call: ServerCall<ReqT, RespT>,
        headers: Metadata,
        next: ServerCallHandler<ReqT, RespT>
    ): ServerCall.Listener<ReqT> {
        val correlationId = headers.get(CORRELATION_ID_KEY)
            ?: UUID.randomUUID().toString()
        val method = call.methodDescriptor.fullMethodName

        // MDC에 설정하여 이후 모든 로그에 자동 포함
        MDC.put("correlationId", correlationId)
        MDC.put("method", method)

        return next.startCall(call, headers)
    }
}
```

**로깅 규칙**:
- **항상 로깅**: 세션 시작, 세션 종료(사유 포함), 에러, 재연결, 상태 전이
- **샘플링 로깅**: 개별 데이터 메시지 (매 100번째 또는 상태 변경 시만)
- **절대 금지**: 프로덕션에서 모든 스트리밍 메시지 로깅. 초당 수백 메시지 × 수천 세션 = 디스크 폭발

### Common Mistakes: Observability

__실무에서 자주 하는 실수 TOP 5__:

1. **모든 스트리밍 메시지를 로깅**: 디스크/메모리가 즉시 폭발한다. 샘플링하거나 상태 변경 시에만 로깅해야 한다.

2. **Correlation ID 미전파**: 서비스 간 트레이싱이 불가능하여 장애 시 원인 추적이 어렵다. gRPC Metadata로 반드시 전파한다.

3. **메트릭 label에 session_id 포함**: Prometheus의 cardinality가 폭발하여 메모리 사용량이 급증한다. 고 cardinality 식별자는 로그에만 사용한다.

4. **에러 로그에 Status code만 기록**: `grpc-message`와 stack trace를 함께 기록하지 않으면 디버깅 정보가 부족하다.

5. **세션 수 메트릭과 실제 연결 수 불일치를 모니터링하지 않음**: `registry_size > active_connections`이면 좀비 세션이 존재한다는 신호이다. 이 불일치에 대한 alert를 설정해야 한다.

## Practice Project: Session Server and Client

이 절에서는 앞서 다룬 모든 개념을 적용한 실습 프로젝트를 제공한다. 다음 시나리오를 모두 재현하고 대응할 수 있는 "세션 서버"와 "세션 클라이언트"를 구현한다.

- a) 정상 종료
- b) 서버 SIGTERM graceful shutdown
- c) 네트워크 단절 시뮬레이션
- d) 느린 consumer로 backpressure 발생
- e) keepalive/app heartbeat로 half-open 탐지

### Proto Definition

```protobuf
syntax = "proto3";

package session.v1;

option java_package = "com.example.session.v1";
option java_multiple_files = true;

// Bidirectional streaming session service
service SessionService {
    rpc Session (stream SessionMessage) returns (stream SessionMessage);
}

message SessionMessage {
    oneof payload {
        Hello hello = 1;
        Welcome welcome = 2;
        Ping ping = 3;
        Pong pong = 4;
        Data data = 5;
        Goodbye goodbye = 6;
        ServerShutdown server_shutdown = 7;
    }
}

// Client → Server: 세션 시작 요청
message Hello {
    string session_token = 1;  // 재연결 시 이전 세션 토큰
    string client_id = 2;     // 클라이언트 식별자
}

// Server → Client: 세션 수립 확인
message Welcome {
    string session_id = 1;            // 서버가 할당한 세션 ID
    int32 heartbeat_interval_ms = 2;  // 클라이언트 Ping 주기 (ms)
}

// Client → Server: 앱 레벨 heartbeat
message Ping {
    int64 timestamp = 1;  // 클라이언트 발신 시각 (millis)
}

// Server → Client: heartbeat 응답
message Pong {
    int64 original_timestamp = 1;  // 클라이언트가 보낸 timestamp
    int64 server_timestamp = 2;    // 서버 처리 시각 (millis)
}

// 양방향 데이터 교환
message Data {
    string topic = 1;     // 데이터 주제
    bytes payload = 2;    // 실제 데이터
    int64 sequence = 3;   // 메시지 시퀀스 번호
}

// Client → Server: 정상 종료 알림
message Goodbye {
    string reason = 1;
}

// Server → Client: 서버 종료 예고
message ServerShutdown {
    string reason = 1;
    int32 retry_after_seconds = 2;  // 재연결 대기 시간
}
```

### Server Implementation (Kotlin + Coroutines)

```kotlin
class SessionServiceImpl(
    private val registry: SessionRegistry
) : SessionServiceGrpcKt.SessionServiceCoroutineImplBase() {

    private val logger = LoggerFactory.getLogger(javaClass)

    override fun session(requests: Flow<SessionMessage>): Flow<SessionMessage> = channelFlow {
        val sessionId = UUID.randomUUID().toString()
        var registered = false
        var clientId = "unknown"

        try {
            requests.collect { message ->
                when {
                    message.hasHello() -> {
                        clientId = message.hello.clientId
                        val info = SessionRegistry.SessionInfo(
                            sessionId = sessionId,
                            clientId = clientId,
                            connectedAt = Instant.now(),
                            lastActivity = Instant.now(),
                            outbound = channel, // channelFlow의 SendChannel
                            job = coroutineContext.job
                        )
                        registry.register(info)
                        registered = true
                        logger.info("[{}] Session established for client: {}", sessionId, clientId)

                        send(SessionMessage.newBuilder().setWelcome(
                            Welcome.newBuilder()
                                .setSessionId(sessionId)
                                .setHeartbeatIntervalMs(30_000)
                        ).build())
                    }
                    message.hasPing() -> {
                        registry.updateActivity(sessionId)
                        send(SessionMessage.newBuilder().setPong(
                            Pong.newBuilder()
                                .setOriginalTimestamp(message.ping.timestamp)
                                .setServerTimestamp(System.currentTimeMillis())
                        ).build())
                    }
                    message.hasData() -> {
                        registry.updateActivity(sessionId)
                        // 비즈니스 로직: 데이터 처리
                        logger.debug("[{}] Data received: topic={}, seq={}",
                            sessionId, message.data.topic, message.data.sequence)
                    }
                    message.hasGoodbye() -> {
                        logger.info("[{}] Client goodbye: {}", sessionId, message.goodbye.reason)
                    }
                }
            }
        } finally {
            if (registered) {
                val info = registry.unregister(sessionId)
                val duration = info?.let {
                    Duration.between(it.connectedAt, Instant.now()).seconds
                } ?: 0
                logger.info("[{}] Session cleaned up. Client: {}, Duration: {}s",
                    sessionId, clientId, duration)
            }
        }
    }
}
```

서버 초기화 및 실행:

```kotlin
fun main() {
    val registry = SessionRegistry()
    val healthManager = HealthStatusManager()
    val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    val server = NettyServerBuilder.forPort(50051)
        .addService(SessionServiceImpl(registry))
        .addService(healthManager.healthService)
        // Keepalive 설정
        .keepAliveTime(30, TimeUnit.SECONDS)
        .keepAliveTimeout(10, TimeUnit.SECONDS)
        .permitKeepAliveTime(10, TimeUnit.SECONDS)
        .permitKeepAliveWithoutCalls(true)
        // Connection lifecycle
        .maxConnectionIdle(5, TimeUnit.MINUTES)
        .maxConnectionAge(30, TimeUnit.MINUTES)
        .maxConnectionAgeGrace(5, TimeUnit.MINUTES)
        // Message size
        .maxInboundMessageSize(4 * 1024 * 1024)
        .build()

    // Health service 활성화
    healthManager.setStatus("", ServingStatus.SERVING)

    // Session reaper 시작
    val reaper = SessionReaper(registry, scope)
    reaper.start()

    // Graceful shutdown hook
    configureShutdownHook(server, registry, healthManager)

    server.start()
    println("Server started on port 50051")
    server.awaitTermination()
}
```

### Client Implementation (Kotlin + Coroutines)

```kotlin
class SessionClient(
    private val target: String,
    private val clientId: String = "client-${UUID.randomUUID().toString().take(8)}"
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    private val channel: ManagedChannel = ManagedChannelBuilder.forTarget(target)
        .keepAliveTime(30, TimeUnit.SECONDS)
        .keepAliveTimeout(10, TimeUnit.SECONDS)
        .keepAliveWithoutCalls(true)
        .maxInboundMessageSize(4 * 1024 * 1024)
        .build()

    private val stub = SessionServiceGrpcKt.SessionServiceCoroutineStub(channel)
    private var currentSessionId: String? = null

    /**
     * 재연결 루프. Status code에 따라 재시도 여부를 결정한다.
     */
    suspend fun connectWithRetry() {
        var attempt = 0
        while (true) {
            try {
                runSession()
                logger.info("Session completed normally")
                break
            } catch (e: StatusException) {
                val action = retryPolicy(e.status.code)
                when (action) {
                    RetryAction.RETRY -> {
                        val delay = calculateBackoff(attempt++)
                        logger.warn("Retryable error (attempt {}): {}. Retrying in {}ms",
                            attempt, e.status, delay)
                        delay(delay)
                    }
                    RetryAction.REFRESH_TOKEN -> {
                        logger.info("Token expired, refreshing...")
                        // refreshToken() 구현
                        attempt = 0 // 토큰 갱신 후 attempt 초기화
                    }
                    RetryAction.FAIL -> {
                        logger.error("Non-retryable error: {}", e.status)
                        throw e
                    }
                }
            }
        }
    }

    private suspend fun runSession() {
        val outboundFlow = flow {
            // 1. Hello 전송
            emit(SessionMessage.newBuilder().setHello(
                Hello.newBuilder()
                    .setClientId(clientId)
                    .setSessionToken(currentSessionId ?: "")
            ).build())

            // 2. Heartbeat 루프
            while (true) {
                delay(30_000)
                emit(SessionMessage.newBuilder().setPing(
                    Ping.newBuilder()
                        .setTimestamp(System.currentTimeMillis())
                ).build())
            }
        }

        stub.session(outboundFlow).collect { message ->
            when {
                message.hasWelcome() -> {
                    currentSessionId = message.welcome.sessionId
                    logger.info("Session established: {}", currentSessionId)
                }
                message.hasPong() -> {
                    val rtt = System.currentTimeMillis() - message.pong.originalTimestamp
                    logger.debug("Ping RTT: {}ms", rtt)
                }
                message.hasServerShutdown() -> {
                    val shutdown = message.serverShutdown
                    logger.info("Server shutdown: {}. Retry after {}s",
                        shutdown.reason, shutdown.retryAfterSeconds)
                    currentSessionId = null // 세션 캐시 클리어
                    delay(shutdown.retryAfterSeconds * 1000L)
                    // Flow가 완료되면 외부 재시도 루프에서 재연결
                }
                message.hasData() -> {
                    logger.debug("Data received: topic={}, seq={}",
                        message.data.topic, message.data.sequence)
                }
            }
        }
    }

    /**
     * Exponential backoff with jitter.
     * Initial: 1s, Max: 120s, Jitter: ±20%
     */
    private fun calculateBackoff(attempt: Int): Long {
        val base = minOf(1000L * (1L shl minOf(attempt, 7)), 120_000L)
        val jitter = (base * 0.2 * Random.nextDouble()).toLong()
        return base + jitter
    }

    enum class RetryAction { RETRY, REFRESH_TOKEN, FAIL }

    /**
     * Status code 기반 재시도 정책 테이블.
     */
    private fun retryPolicy(code: Status.Code): RetryAction = when (code) {
        Status.Code.UNAVAILABLE -> RetryAction.RETRY
        Status.Code.RESOURCE_EXHAUSTED -> RetryAction.RETRY
        Status.Code.ABORTED -> RetryAction.RETRY
        Status.Code.DEADLINE_EXCEEDED -> RetryAction.RETRY
        Status.Code.UNAUTHENTICATED -> RetryAction.REFRESH_TOKEN
        else -> RetryAction.FAIL
    }

    fun shutdown() {
        channel.shutdown()
        channel.awaitTermination(5, TimeUnit.SECONDS)
    }
}
```

### Loopback Testing with InProcessTransport

***InProcessTransport*** 는 네트워크 오버헤드 없이 gRPC 서버/클라이언트를 같은 JVM 내에서 테스트할 수 있게 해준다. `io.grpc.inprocess` 패키지의 `InProcessServerBuilder`와 `InProcessChannelBuilder`를 사용한다.

```kotlin
class SessionServiceTest {

    private lateinit var server: Server
    private lateinit var channel: ManagedChannel
    private lateinit var registry: SessionRegistry

    @BeforeEach
    fun setup() {
        val serverName = InProcessServerBuilder.generateName()
        registry = SessionRegistry()

        server = InProcessServerBuilder.forName(serverName)
            .directExecutor()
            .addService(SessionServiceImpl(registry))
            .build()
            .start()

        channel = InProcessChannelBuilder.forName(serverName)
            .directExecutor()
            .build()
    }

    @AfterEach
    fun teardown() {
        channel.shutdownNow()
        server.shutdownNow()
    }

    /**
     * Test 1: 정상 세션 라이프사이클
     * Hello → Welcome → Ping → Pong → Goodbye → 세션 정리 확인
     */
    @Test
    fun `normal session lifecycle`() = runTest {
        val stub = SessionServiceGrpcKt.SessionServiceCoroutineStub(channel)
        val received = mutableListOf<SessionMessage>()

        stub.session(flow {
            // Hello
            emit(SessionMessage.newBuilder().setHello(
                Hello.newBuilder().setClientId("test-client")
            ).build())
            // Ping
            emit(SessionMessage.newBuilder().setPing(
                Ping.newBuilder().setTimestamp(System.currentTimeMillis())
            ).build())
            // Goodbye
            emit(SessionMessage.newBuilder().setGoodbye(
                Goodbye.newBuilder().setReason("test complete")
            ).build())
        }).toList(received)

        // Welcome 수신 확인
        assertTrue(received[0].hasWelcome())
        assertNotNull(received[0].welcome.sessionId)

        // Pong 수신 확인
        assertTrue(received[1].hasPong())

        // 세션 정리 확인 (finally 블록 실행됨)
        assertEquals(0, registry.activeCount())
    }

    /**
     * Test 2: 서버 shutdown 중 활성 스트림 처리
     * 활성 세션이 있는 상태에서 서버 shutdown 시
     * 세션이 정상적으로 정리되는지 확인
     */
    @Test
    fun `session cleanup on server shutdown`() = runTest {
        val stub = SessionServiceGrpcKt.SessionServiceCoroutineStub(channel)
        val sessionEstablished = CompletableDeferred<String>()

        val clientJob = launch {
            try {
                stub.session(flow {
                    emit(SessionMessage.newBuilder().setHello(
                        Hello.newBuilder().setClientId("test-client")
                    ).build())
                    // 스트림을 유지하기 위해 Ping 반복
                    while (true) {
                        delay(1000)
                        emit(SessionMessage.newBuilder().setPing(
                            Ping.newBuilder().setTimestamp(System.currentTimeMillis())
                        ).build())
                    }
                }).collect { message ->
                    if (message.hasWelcome()) {
                        sessionEstablished.complete(message.welcome.sessionId)
                    }
                }
            } catch (e: StatusException) {
                // 서버 shutdown으로 인한 예외는 예상된 동작
            }
        }

        // 세션 수립 대기
        val sessionId = withTimeout(5000) { sessionEstablished.await() }
        assertNotNull(sessionId)
        assertEquals(1, registry.activeCount())

        // 서버 shutdown
        server.shutdown()
        server.awaitTermination(5, TimeUnit.SECONDS)

        // 클라이언트 작업 완료 대기
        clientJob.join()

        // 세션 정리 확인
        assertEquals(0, registry.activeCount())
    }
}
```

### Scenario Reproduction Guide

위 실습 프로젝트에서 다음 시나리오를 재현할 수 있다.

| 시나리오 | 재현 방법 | 확인 포인트 |
|---------|----------|-----------|
| a) 정상 종료 | 클라이언트가 Goodbye → 서버 onCompleted | registry에서 세션 제거 확인 |
| b) 서버 SIGTERM | `kill -TERM <pid>` 또는 shutdown hook 테스트 | ServerShutdown 메시지 수신 → 클라이언트 재연결 |
| c) 네트워크 단절 | `iptables` 또는 `tc netem`으로 패킷 drop | keepalive timeout → UNAVAILABLE → 재연결 |
| d) 느린 consumer | 클라이언트의 collect에 `delay(5000)` 추가 | WINDOW_UPDATE 지연 → 서버 write 블로킹 |
| e) half-open 탐지 | NAT timeout 시뮬레이션 (방화벽 규칙 삭제) | app heartbeat timeout → 세션 종료 |

## Failure Scenario Catalog

운영 환경에서 발생할 수 있는 대표적인 장애 시나리오 5가지를 정리한다.

### Scenario 1: ENHANCE_YOUR_CALM Reconnect Storm

__Setup__: Client `keepAliveTime=10s`, Server `permitKeepAliveTime=5min` (기본값)

__현상__: 서버가 GOAWAY(ENHANCE_YOUR_CALM) 전송 → 클라이언트 UNAVAILABLE → 자동 재연결 → 같은 PING 빈도 → 다시 GOAWAY → 무한 반복. 메트릭에서 reconnect 횟수가 폭증한다.

__감지__: `grpc_client_reconnect_total` 급증, 로그에 ENHANCE_YOUR_CALM 반복

__대응__: `keepAliveTime >= permitKeepAliveTime` 보장. 배포 전 클라이언트-서버 설정 조합을 검증한다.

### Scenario 2: Slow Consumer Cascading Failure

__Setup__: 서버가 클라이언트보다 빠르게 메시지를 전송

__현상__: Stream window 소진 → Connection window 소진 → 같은 연결의 **모든** 스트림 정체 → 무관한 Unary RPC도 DEADLINE_EXCEEDED → 연쇄 장애

__감지__: 특정 클라이언트 연결에서만 모든 RPC가 timeout, `grpc_server_backpressure_events_total` 증가

__대응__: Streaming RPC와 Unary RPC에 별도 Channel 사용. Per-session 전송 큐에 크기 제한 + overflow 시 오래된 메시지 drop.

### Scenario 3: Missing Finally Block Resource Leak

__Setup__: 서버 bidi handler에 `try-finally` 없음

__현상__: 클라이언트 disconnect, 예외 발생 시 세션이 registry에 좀비로 남음 → 메모리 지속 증가 → OOM

__감지__: `registry_size`와 `active_connections` 불일치 증가, 메모리 사용량 단조 증가

__대응__: 모든 stream handler에 `try-finally` 강제. TTL reaper를 safety net으로 구현.

### Scenario 4: Half-Open Connection in Network Partition

__Setup__: 네트워크 파티션 발생, keepalive 미설정

__현상__: 양쪽 모두 연결이 살아있다고 판단. 서버는 세션을 계속 유지하고, 클라이언트는 write를 시도하다 수 분~수 시간 후에야 에러를 감지한다. TCP keepalive 기본값이 2시간이므로 그동안 좀비 상태.

__감지__: 활성 세션 수는 유지되지만 실제 트래픽이 없는 세션이 존재

__대응__: `keepAliveTime=30s` 설정으로 최대 40초 내 감지. App-level heartbeat으로 이중 안전망 구축.

### Scenario 5: Graceful Shutdown Race Condition

__Setup__: K8s Pod 종료 시 SIGTERM, preStop hook 없음

__현상__: `server.shutdown()` → GOAWAY 전송 → LB가 아직 이 Pod로 라우팅 중(health check 갱신 지연) → 새 연결이 즉시 UNAVAILABLE → 배포 시 에러 스파이크

__감지__: 배포 시마다 일시적 에러율 증가

__대응__: Health → NOT_SERVING 먼저 변경 → LB 갱신 대기(5~10초) → GOAWAY. K8s에서는 `preStop` hook에서 이 시퀀스를 실행한다.

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
- [gRPC Keepalive](https://grpc.io/docs/guides/keepalive/)
- [gRPC Health Checking Protocol](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)
- [gRPC Connection Backoff Protocol](https://github.com/grpc/grpc/blob/master/doc/connection-backoff.md)
- [HTTP/2 Frame Types (RFC 9113 Section 6)](https://datatracker.ietf.org/doc/html/rfc9113#section-6)
- [gRPC over HTTP/2](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md)
- [gRPC Kotlin](https://grpc.io/docs/languages/kotlin/)
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
- Programming gRPC / Julien Phalip, Jeremy Mikola / O'Reilly
- Designing Data-Intensive Applications / Martin Kleppmann / O'Reilly
