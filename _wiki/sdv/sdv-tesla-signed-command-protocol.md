---
layout  : wiki
title   : TESLA SIGNED COMMAND PROTOCOL
summary :
date    : 2026-02-08 19:02:32 +0900
updated : 2026-02-08 19:02:32 +0900
tag     : sdv tesla crypto protocol security tradeoff
toc     : true
comment : true
public  : true
parent  : [[/sdv]]
latex   : true
---

* TOC
{:toc}

## TESLA SIGNED COMMAND PROTOCOL

Tesla 는 2023년부터 차량 제어 명령에 대해 ***[End-to-End Command Authentication](https://github.com/teslamotors/vehicle-command)*** 을 도입했다. 이 프로토콜은 Tesla 의 공식 저장소에서 "vehicle-command" 로 명명되어 있으며, 본 문서에서는 이를 "Signed Command Protocol" 이라는 설명적 명칭으로 표기한다.

이전에는 차량 제어 명령이 Tesla 서버를 경유하면서 서버의 OAuth 인증만으로 실행되었지만, 이제는 **차량에 사전 등록된 공개 키에 대응하는 개인 키로 서명된 명령만** 차량이 수락한다.

> Command authentication takes place in two steps: Tesla's servers will only forward messages to a vehicle if the client has a valid OAuth token. The vehicle will only execute the command if it can be authenticated using a public key from the vehicle's keychain.
> — [Tesla vehicle-command Repository](https://github.com/teslamotors/vehicle-command)

이 프로토콜의 핵심 목표는 다음과 같다:

- **End-to-End 인증**: 서버가 아닌 차량 소유자만이 명령을 생성할 수 있음을 암호학적으로 보장한다
- **Anti-Replay**: 한 번 사용된 명령을 재사용할 수 없다
- **Epoch-boundary Anti-Replay**: Vehicle 도메인이 재부팅되면 새로운 epoch_id 가 생성되어, 이전 epoch 의 counter/expiresAt 으로 서명된 명령이 새 epoch 에서 거부된다. 이는 암호학적 키 격리가 아닌 **시간 기반 anti-replay 격리**이다
- **Transport Agnostic**: HTTPS(Fleet API), BLE 등 전송 계층에 독립적으로 동작한다

<mark><em><strong>Tesla Signed Command Protocol 은 "누가 명령을 보냈는가"를 암호학적으로 증명하는 프로토콜이다. 전송 계층이 아닌 메시지 자체에 인증과 무결성을 부여한다.</strong></em></mark>

## Secure Channel

차량 제어는 일반적인 웹 서비스와 근본적으로 다른 보안 요구사항을 갖는다. 문 잠금 해제, 원격 시동, 트렁크 열기 등의 명령은 **물리적 세계에 직접적인 영향**을 미친다.

__Remote Control Command Requirements__:
- 명령이 차량에 도달하기까지 누가 보냈는지 확인되어야 하고
- 명령이 도중에 변조되지 않아야 하며
- 제3자가 내용을 절대 볼 수 없어야 하고
- 같은 명령을 복사해 재전송해도 무효가 되어야 한다

HTTPS 만으로는 이 모든 요구사항을 충족할 수 없다:

```
Client  ──HTTPS──▶  Tesla Server  ──???──▶  Vehicle
          (TLS)       (trusted?)      (no TCP guarantee)
```

Tesla 서버가 compromise 되거나, 서버와 차량 사이의 통신이 변조될 경우 HTTPS 만으로는 보호되지 않는다. 특히 Tesla 의 공식 문서에 따르면:

> "communication channel between Tesla's servers and vehicles does not provide TCP transport guarantees; messages may be dropped or arrive out of order"

따라서 메시지 자체에 암호학적 서명을 포함하는 ***End-to-End Security*** 가 필수적이다. 원격 차량 제어 명령을 안전하게 처리하기 위해서는 양쪽(차량과 서버)이 믿고 안전하게 통신할 수 있도록 ___"인증 + 무결성 + 기밀성 + 리플레이 방지"___ 까지 종합적으로 갖춘 통신로를 만드는 것이 필요하다.

<mark><em><strong>Tesla 는 사전 등록된 공개 키(pre-enrolled public key)와 ECDH 기반 Shared Secret 으로 모든 명령의 인증과 무결성을 보장한다</strong></em></mark>

## Key Exchange: ECDH

***[ECDH(Elliptic Curve Diffie-Hellman)](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman_key_exchange)*** 는 두 당사자가 비밀 통신 채널 없이도 공유 비밀(Shared Secret)을 합의할 수 있는 키 교환 프로토콜이다. ECDH 는 **키 교환(Key Agreement) 프로토콜이지, 암호화 알고리즘이 아니다**. 데이터를 암호화하지 않으며, 양측이 안전하지 않은 채널 위에서 Shared Secret 을 합의하는 것만을 목적으로 한다.

Tesla 는 ***NIST P-256(secp256r1)*** 곡선을 사용한다. 이 선택의 기술적 근거는 다음과 같다:

- **128-bit security level**: NIST P-256 은 128-bit 대칭 키와 동등한 보안 강도를 제공한다. Tesla 의 KDF 가 최종적으로 128-bit AES 키를 도출하므로, 곡선의 보안 수준과 대칭 키 길이가 정확히 일치한다
- **Hardware 지원**: ARM TrustZone, Apple Secure Enclave, Android Keystore 등 대부분의 hardware secure element 에서 native 로 지원된다. 차량 MCU 와 client device 모두 hardware-accelerated ECDH 연산이 가능하다
- **표준 호환성**: TLS 1.3, WebAuthn, FIDO2 등 현대 보안 프로토콜에서 가장 널리 채택된 곡선이다

ECDH 의 핵심 수학적 원리는 다음과 같다:

```
Client (소유자 앱):
  - 개인 키: c (스칼라)
  - 공개 키: C = c × G (타원 곡선 위의 점)

Vehicle:
  - 개인 키: v (스칼라)
  - 공개 키: V = v × G (타원 곡선 위의 점)

Shared Secret:
  S = (Sx, Sy) = ECDH(c, V) = c × V = c × (v × G)
                = ECDH(v, C) = v × C = v × (c × G)
                = (c × v) × G
```

양쪽 모두 동일한 점 S 에 도달한다. 이것은 타원 곡선 위의 스칼라 곱셈의 **교환 법칙(Commutative Property)** 에 기반한다. 공격자는 공개 키 C, V 와 생성자 G 를 알더라도 ***[ECDLP(Elliptic Curve Discrete Logarithm Problem)](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)*** 의 어려움 때문에 c 나 v 를 역산할 수 없다.

공개 키 인코딩 형식은 비압축 곡선 점(uncompressed curve point) 형식을 사용한다:

```
0x04 || BIG_ENDIAN(x, 32) || BIG_ENDIAN(y, 32)
```

### Handshake: session_info_request / session_info

세션 수립은 다음 과정으로 진행된다:

```
Client                                    Vehicle
  │                                          │
  │──── session_info_request ───────────────▶│
  │     (client public key C)                │
  │                                          │
  │◀──── session_info ───────────────────────│
  │     (vehicle public key V,               │
  │      epoch, clock_time, counter,         │
  │      HMAC tag for authentication)        │
  │                                          │
  │  [Client derives K from ECDH(c, V)]      │
  │  [Client verifies session_info HMAC]     │
  │                                          │
  │──── signed command ─────────────────────▶│
  │     (payload + HMAC or AES-GCM tag)      │
```

1. Client 가 자신의 **사전 등록된(pre-enrolled)** 공개 키 C 를 포함한 `session_info_request` 를 RoutableMessage 에 담아 전송한다. Vehicle 은 이 C 를 keychain 에서 조회하여 해당 Client 의 역할(Role)을 결정한다
2. Vehicle 이 자신의 공개 키 V, ***epoch***(랜덤 16바이트), ***clock_time***(도메인별 타임스탬프), ***counter*** 를 포함한 `session_info` 로 응답한다
  - 도메인이 재부팅되면 timestamp/counter 같은 값들이 리셋될 수 있는데, 그때 과거 메시지를 다시 재전송(replay)하면 위험하다. 따라서 “시간의 기준점이 바뀌었다(재부팅)”를 나타내는 epoch_id를 같이 넣어, 이전 부팅(epoch_id_old)에서 만들어진 메시지는 현재 epoch_id_new에서 무조건 거절되게 만듭니다.
3. Client 는 ECDH(c, V) 로 Shared Secret 을 계산하고, session_info 의 HMAC 을 검증한다
4. 이후 모든 명령은 도출된 Session Key 로 서명된다

### Session Key Derivation

ECDH 에서 도출된 Shared Secret 으로부터 실제 사용할 Session Key K 를 다음과 같이 유도한다:

```
S = (Sx, Sy) = ECDH(c, V)
K = SHA-1(BIG_ENDIAN(Sx, 32))[:16]     // 앞 16바이트만 사용 → AES-128 키
```

이 KDF 에서 SHA-1 을 사용하는 것은 현대 암호학 기준에서 이상적이지 않다. SHA-1 의 충돌 저항성(Collision Resistance)은 2017년 SHAttered 공격에 의해 깨졌다. 그러나 여기서 SHA-1 은 KDF(Key Derivation Function)로 사용되며, 이 맥락에서는 ***preimage resistance*** 만 필요하다. SHA-1 의 preimage resistance 는 여전히 건재하다.

그럼에도 SHA-256 이나 ***[HKDF(RFC 5869)](https://datatracker.ietf.org/doc/html/rfc5869)*** 를 사용하지 않은 것은 Tesla 의 초기 차량 하드웨어와의 **하위 호환성(Backward Compatibility)** 을 위한 설계 결정이다. 새로운 프로토콜을 설계한다면 HKDF-SHA256 을 사용하는 것이 표준적이다.

`[:16]` — SHA-1 출력(160 bit)에서 앞 128 bit 만 절단(truncate)해서 사용하는 것은 AES-128 키로 사용하기 위함이며, 이 절단 자체는 보안상 문제가 없다. ***[NIST SP 800-108](https://csrc.nist.gov/publications/detail/sp/800-108/rev-1/final)*** 에서도 KDF 출력의 truncation 을 허용한다.

테스트 벡터(OpenSSL 기반)로 K 를 검증할 수 있다:

```bash
openssl pkeyutl -derive -inkey client.key -peerkey vehicle.pem \
    | openssl dgst -sha1 -binary | head -c 16 | xxd -p
```

### Session Info Authentication

Vehicle 이 반환하는 `session_info` 자체도 인증이 필요하다. 인증되지 않은 session_info 를 수락하면 ***[MITM(Man-in-the-Middle)](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)*** 공격에 노출된다.

```
SESSION_INFO_KEY = HMAC-SHA256(K, "session info")
tag = HMAC-SHA256(SESSION_INFO_KEY, metadata || session_info_bytes)
```

1. Session Key K 에서 `SESSION_INFO_KEY` 를 유도한다. `"session info"` 문자열을 사용한 ***Domain Separation*** 은 동일한 K 가 다른 용도(예: 명령 인증)에 사용될 때 키 충돌을 방지한다
2. 직렬화된 metadata(VIN, signature type, challenge UUID)와 session_info 바이트를 연결한 데이터에 대해 HMAC-SHA256 태그를 계산한다
3. Client 는 이 태그를 검증하여 session_info 가 실제 Vehicle 에서 생성되었음을 확인한다

Tesla 명세에서 강조하는 주의사항: **"Always use a constant-time comparison function when validating HMAC tags."** 비상수 시간 비교(early-exit comparison)를 사용하면 ***[Timing Attack](https://en.wikipedia.org/wiki/Timing_attack)*** 에 취약해진다.

공격자가 중간에 자신의 공개 키를 삽입하려 해도, 정당한 Vehicle 의 개인 키 없이는 올바른 K 를 도출할 수 없으므로, 유효한 HMAC 태그를 생성할 수 없다. 이는 Vehicle 이 사전 등록된 공개 키에 대응하는 개인 키를 소유하고 있다는 암묵적 증명이다.

## Cryptographic Primitives

Tesla Signed Command Protocol 에서 사용되는 핵심 암호학적 기본 요소(Cryptographic Primitives)를 정리한다.

### AES-GCM

***[AES-GCM(Advanced Encryption Standard - Galois/Counter Mode)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)*** 은 ***[AEAD(Authenticated Encryption with Associated Data)](https://en.wikipedia.org/wiki/Authenticated_encryption)*** 를 제공하는 암호화 모드이다. 단일 연산으로 **기밀성(Confidentiality)** 과 **무결성(Integrity)** 을 동시에 보장한다.

| 구성 요소 | 설명 | Tesla 적용 |
|-----------|------|-----------|
| Key | 대칭 암호화 키 | K (128-bit, ECDH 유도) |
| Nonce (IV) | 초기화 벡터, 12바이트 | 랜덤 생성 |
| Plaintext | 암호화할 데이터 | Protobuf 직렬화된 명령 |
| AAD | 인증만, 암호화 안 됨 | SHA256(metadata) |
| Ciphertext | 암호화된 데이터 | 전송되는 페이로드 |
| Auth Tag | 인증 태그 (16바이트) | 무결성 검증 |

AES-GCM 은 내부적으로 ***AES-CTR(Counter Mode)*** 를 사용하여 keystream 을 생성하고, 이 keystream 과 plaintext 를 XOR 하여 ciphertext 를 만든다:

```
keystream = AES(K, nonce || counter_block)
ciphertext = plaintext XOR keystream
```

AES-GCM 에서 ***Nonce Reuse*** 는 **치명적(catastrophic)** 이다. 동일한 (Key, Nonce) 쌍으로 두 개의 다른 메시지를 암호화하면:

```
C₁ = P₁ ⊕ keystream
C₂ = P₂ ⊕ keystream

C₁ ⊕ C₂ = P₁ ⊕ P₂    // 두 평문의 XOR 노출
```

공격자는 두 ciphertext 를 XOR 하는 것만으로 두 plaintext 의 XOR 을 얻는다. Known-plaintext 이 하나라도 있으면 다른 plaintext 를 완전히 복원할 수 있다. Tesla command 는 protobuf 로 직렬화되어 구조가 예측 가능하므로, nonce reuse 시 명령 내용 노출 위험이 매우 높다.

더 심각한 문제는 ***authentication key 의 유출***이다. AES-GCM 의 GHASH 에서 nonce reuse 는 authentication key `H = AES(K, 0^128)` 를 수학적으로 복원 가능하게 만든다. 이후 공격자는 임의의 메시지에 대한 valid authentication tag 를 위조(forge)할 수 있다. 즉, nonce reuse 는 기밀성과 무결성을 **동시에** 파괴한다.

### HMAC-SHA256

***[HMAC(Hash-based Message Authentication Code)](https://en.wikipedia.org/wiki/HMAC)*** 은 비밀 키를 사용하여 메시지의 무결성과 인증을 보장하는 구조이다.

```
HMAC-SHA256(K, M) = SHA256((K' ⊕ opad) || SHA256((K' ⊕ ipad) || M))
```

HMAC 은 **대칭 키 기반**이므로 키를 공유하는 양측 모두 태그를 생성하고 검증할 수 있다. 이는 ***[Digital Signature](https://klarciel.net/wiki/security/security-signed-certificates/)*** 와 구별되는 점이다:

| 속성 | HMAC | Digital Signature |
|------|------|------------------|
| 키 타입 | 대칭 키 (Shared Secret) | 비대칭 키 (Private/Public) |
| 생성 가능한 주체 | 키를 아는 모든 주체 | Private Key 소유자만 |
| 부인 방지 (Non-repudiation) | 불가능 | 가능 |
| 성능 | 빠름 | 느림 |

Tesla 는 명령 인증에 HMAC-SHA256 을 사용한다. 세션 키 K 를 공유하는 Client 와 Vehicle 만이 유효한 태그를 생성할 수 있으므로, 제3자의 명령 위조가 방지된다.

### Key Lifecycle: Static Client Key + Vehicle Key

Tesla 프로토콜에서 Client 키와 Vehicle 키의 성격은 다르다.

> "This section assumes the client public key C is already enrolled in the vehicle."
> — [Tesla vehicle-command protocol.md, Handshake section](https://github.com/teslamotors/vehicle-command/blob/main/pkg/protocol/protocol.md)

| 속성 | Client Key (c, C) | Vehicle Key (v, V) |
|------|-------------------|-------------------|
| 성격 | **Static** (장기 보관) | **Static 또는 Semi-Static** (명세 미확정) |
| 수명 | 폐기(revoke)될 때까지 영구 | 명세에 교체 주기 미명시. 차량 제조 시 주입된 인증서가 고정될 가능성이 높음 |
| 저장 | OS Keyring 또는 PEM 파일 | Vehicle 보안 모듈 (VCSEC 보안 마이크로컨트롤러, Infotainment 보안 프로세서) |
| 역할 바인딩 | C ↔ Role (Owner, Driver 등) | 도메인별 (VCSEC, Infotainment) — 각 도메인이 별도의 공개 키를 가짐 |
| 생성 시점 | `tesla-keygen` 으로 1회 생성, 차량에 등록(pairing) | 명세에 미명시. 차량 제조/프로비저닝 시 주입될 가능성이 높음 |

> "The vehicle associates each client public key with a _role_ that determines what commands that client can authorize."
> — [Tesla vehicle-command protocol.md, Roles section](https://github.com/teslamotors/vehicle-command/blob/main/pkg/protocol/protocol.md)

Client 키 (c, C) 는 **사전 등록된(pre-enrolled) 장기 키**이다. 차량의 keychain 에 등록된 공개 키 C 는 역할(Owner, Driver, Fleet Manager 등)과 바인딩되어 있으며, 이 역할이 해당 Client 가 실행할 수 있는 명령의 범위를 결정한다. 만약 Client 키가 세션마다 새로 생성된다면, 차량은 매 세션마다 "이 키가 누구의 키인지" 를 알 수 없게 되어 역할 기반 인가(Role-Based Authorization) 체계가 성립하지 않는다.

Tesla 프로토콜에서의 키 생명주기:

1. Client 가 `tesla-keygen` 으로 ECDH 키 쌍 `(c, C)` 를 생성한다 — **1회성 작업**
2. Client 가 C 를 Vehicle 의 keychain 에 등록한다 (NFC 카드 또는 기존 키를 통한 pairing)
3. 세션 시작 시 Client 가 **동일한 사전 등록 키 C** 를 `session_info_request` 에 포함하여 전송한다
4. Vehicle 이 자신의 공개 키 V 와 epoch_id/counter/clock_time 을 포함한 `session_info` 로 응답한다. epoch_id 는 도메인 부팅 시 새로 생성되지만, **V 가 부팅 시 재생성되는지는 명세에 명시되어 있지 않다**
5. 양측이 `K = SHA-1(BIG_ENDIAN(ECDH(c, V)_x, 32))[:16]` 으로 Session Key 를 도출한다
6. **K 는 c 와 V 가 동일한 한 변하지 않는다** — 동일 epoch 내에서는 동일한 K 가 유도된다

Client 의 개인 키 c 는 세션 종료 시 삭제되지 않는다. OS Keyring 또는 PEM 파일에 영구 저장되며, `tesla-keygen` 은 파일 기반에서 OS Keyring 으로 마이그레이션하는 `migrate` 명령까지 제공한다.

### Forward Secrecy 분석

***[Forward Secrecy](https://en.wikipedia.org/wiki/Forward_secrecy)*** (또는 Perfect Forward Secrecy, PFS)는 장기 비밀(long-term secret)이 유출되더라도 과거 세션의 통신이 안전하게 유지되는 속성이다.

Tesla 프로토콜은 **Forward Secrecy 를 제공하지 않는다**. Client 키 c 가 static 이고, Vehicle 키 V 도 static 일 가능성이 높다 (명세는 V 의 교체 주기를 명시하지 않으며, 차량 제조 시 주입된 인증서는 고정될 가능성이 높다). c 와 V 가 모두 static 이면 K = ECDH(c, V) 도 상수이므로, 어느 한쪽의 개인 키가 유출되면 해당 키와 관련된 모든 과거/미래 세션이 위험해진다.

| 시나리오 | 영향 | 설명 |
|----------|------|------|
| Client 개인 키 c 유출 | 해당 Client 의 **모든 과거/미래 세션** 위험 | c 가 static 이므로, 공격자가 handshake 응답에서 V 를 획득하면 K = ECDH(c, V) 를 계산 가능 |
| Vehicle 개인 키 v 유출 | **V 의 전체 수명** 동안 모든 Client 세션 위험 | 모든 Client 의 K 를 v 와 C 로부터 도출 가능. V 가 정적이면 v 유출은 Vehicle 의 모든 과거/미래 세션에 영향 |
| Vehicle 도메인 재부팅 (새 epoch) | **counter/expiresAt 공간 리셋에 의한 anti-replay 격리** | epoch_id 가 새로 생성되어 이전 epoch 의 counter 가 무효화됨. 명세는 재부팅 시 V 재생성을 명시하지 않으므로, K 가 변한다는 보장은 없음 |

> 만약 Vehicle 키가 부팅 시 재생성된다면 epoch 경계에서 부분적 Forward Secrecy 가 성립하겠지만, 이는 명세에 명시되어 있지 않으며, 차량 인증서가 제조 시 고정되는 일반적 자동차 PKI 관행과 상충한다.

**TLS 1.3 과의 비교:**

| 속성 | TLS 1.3 | Tesla Protocol |
|------|---------|----------------|
| Client 키 | Ephemeral (세션마다 새로 생성) | **Static** (장기 보관, 역할 바인딩) |
| Server/Vehicle 키 | Ephemeral (세션마다 새로 생성) | **Static** (명세에 교체 근거 없음, 차량 인증서 고정 가능성 높음) |
| K 유도 | ECDHE(ephemeral_c, ephemeral_s) | ECDH(static_c, static_V) → K 가 상수 |
| Client 키 유출 시 | 해당 세션만 영향 | **모든 세션** 영향 |
| Forward Secrecy | Per-session PFS | **없음** (anti-replay 보호는 epoch/counter/expiresAt 에 의존) |

이 설계의 근거는 프로토콜의 핵심 목표에서 찾을 수 있다. Tesla 명세는 Forward Secrecy 를 설계 목표로 명시하지 않는다. 프로토콜의 핵심 목표는 **End-to-End 명령 인증, Anti-Replay, Transport Independence** 이다. Static Client 키 설계는 다음과 같은 실용적 이점을 제공한다:

- **역할 기반 인가**: 차량이 C 를 통해 Client 의 역할(Owner, Driver 등)을 식별
- **세션 캐싱**: 동일 epoch 내에서 K 가 변하지 않으므로, 캐시된 세션 상태로 handshake 없이 즉시 명령 전송 가능
- **Resource-constrained 환경**: 차량 MCU 에서 매 세션마다 키 생성/등록 불필요

### Nonce

***[Nonce(Number used Once)](https://en.wikipedia.org/wiki/Cryptographic_nonce)*** 는 암호학적 연산에서 단 한 번만 사용되는 임의의 값이다.

Nonce 가 없거나 재사용되면:
- **AES-GCM**: 기밀성과 무결성이 모두 파괴된다 (위에서 설명)
- **Deterministic Encryption**: 동일한 Plaintext 가 항상 동일한 Ciphertext 를 생성하여 패턴이 노출된다

Tesla 는 AES-GCM 에서 12바이트(96-bit) 랜덤 Nonce 를 사용한다. AES-GCM 의 ***[NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final)*** 에서 권장하는 nonce 크기가 96 bit 이며, 이 크기에서는 AES-GCM 이 내부적으로 nonce 를 직접 IV 로 사용하여 추가 처리가 불필요하다.

**Random nonce 의 충돌 확률**: ***Birthday Paradox*** 에 의해 약 $2^{48}$ 개의 메시지 이후 50% 확률로 nonce collision 이 발생한다. 이는 약 281조 개의 메시지로, 현실적으로 도달 불가능한 수치다. nonce 고유성은 동일한 K 아래에서 보장되면 충분하다. 명세는 재부팅 시 V 가 변한다고 명시하지 않으므로, V 가 정적이면 K 의 수명은 epoch 단위가 아니라 **V 의 전체 수명**과 동일하다. 다만 $2^{48}$ 개의 메시지(약 281조)는 K 의 수명이 길더라도 현실적으로 도달 불가능한 수치이므로, nonce collision 위험은 무시할 수 있다.

Counter-based nonce 대신 random nonce 를 선택한 이유는 **stateless 구현** 의 용이성이다. Counter-based nonce 는 persistent storage 와 crash recovery 메커니즘이 필요하지만, random nonce 는 ***[CSPRNG(Cryptographically Secure Pseudo-Random Number Generator)](https://en.wikipedia.org/wiki/Cryptographically_secure_pseudorandom_number_generator)*** 만 있으면 된다.

### MITM (Man-in-the-Middle)

***[MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)*** 은 두 당사자 사이에 공격자가 끼어들어 통신을 가로채거나 변조하는 공격이다. 순수한 ECDH 는 unauthenticated key agreement 이므로 MITM 에 취약하다:

```
Client (C)  ◀────▶  Attacker (A)  ◀────▶  Vehicle (V)

1. C 가 Pc 를 V 에 전송 → A 가 가로채고 Pa 를 V 에 전달
2. V 가 Pv 를 C 에 전송 → A 가 가로채고 Pa' 를 C 에 전달
3. C-A 사이에 K₁, A-V 사이에 K₂ 생성
4. A 는 양쪽 통신을 복호화 → 변조 → 재암호화
```

Tesla 의 MITM 방어 메커니즘:

**1단계: Vehicle Public Key 의 사전 인증**

Vehicle 의 공개 키는 Tesla 서버 인프라를 통해 배포된다. Client 는 OAuth 인증된 HTTPS 연결로 Tesla 서버에서 Vehicle 의 공개 키를 획득하므로, 공격자가 Vehicle 의 공개 키를 자신의 키로 대체하기 어렵다.

**2단계: Session Info HMAC Verification**

```
SESSION_INFO_KEY = HMAC-SHA256(K, "session info")
```

Vehicle 이 session_info 를 응답할 때 이 키로 HMAC 을 생성한다. MITM 공격자는 Vehicle 의 개인 키 없이 올바른 K 를 도출할 수 없으므로, 유효한 session_info HMAC 을 생성할 수 없다.

**3단계: BLE 초기 Pairing 의 물리적 검증**

BLE key enrollment 시 차량의 물리적 확인(NFC 카드 태그 등)을 요구한다. 이는 ***Out-of-Band Authentication*** 으로, BLE 채널 자체의 MITM 을 방지한다.

**정리**: Tesla 의 MITM 방어는 "ECDH(static-client + semi-static-vehicle) + 사전 등록된 공개 키 + HMAC 기반 세션 검증" 의 조합이다. TLS 1.3 의 "ECDHE(ephemeral-ephemeral) + CA-signed certificate + Finished message MAC" 과 구조적으로 유사하지만, Tesla 는 Client 키가 static 이고 Vehicle 키가 semi-static 이라는 점에서 Forward Secrecy 특성이 다르다 (epoch-boundary 한정).

## Command Authentication

Tesla 는 명령 인증에 두 가지 방식을 제공한다: **HMAC 인증(Plaintext)** 과 **AES-GCM 인증(Encrypted)**. 전송 채널의 특성에 따라 적절한 방식이 선택된다.

### HMAC Authentication (Plaintext)

Fleet API(HTTPS) 를 통한 명령 전송에 사용된다. 명령 페이로드는 암호화되지 않고, HMAC 태그로 인증만 수행된다.

```
K' = HMAC-SHA256(K, "authenticated command")     // Domain Separation
tag = HMAC-SHA256(K', M || P)                     // M: metadata, P: payload
```

__Step 1. Key Derivation (Domain Separation)__

Session Key K 에서 명령 인증 전용 키 K' 를 유도한다. `"authenticated command"` 문자열을 사용한 Domain Separation 은 동일한 K 가 다른 용도(예: session_info 인증)에 사용될 때 키 충돌을 방지한다.

__Step 2. Tag Computation__

Metadata M 과 Payload P 를 연결(concatenate)한 데이터에 대해 HMAC-SHA256 태그를 계산한다. Metadata 에는 counter, epoch, expiration, VIN 등 Anti-Replay 정보가 포함된다.

__Step 3. Fleet API Transmission__

```
POST /api/1/vehicles/{vin}/signed_command
Content-Type: application/json

{
  "routable_message": "<base64-encoded RoutableMessage protobuf>"
}
```

RoutableMessage 의 `signature_data.signer_identity.public_key` 에 `ENCODE_PUBLIC(C)` 를 설정한다. 이를 통해 Vehicle 은 어떤 Client 의 키로 검증해야 하는지 식별한다. 태그는 `signature_data.HMAC_PersonalizedData` 에 포함된다.

### AES-GCM Authentication (Encrypted)

BLE 를 통한 직접 통신에 주로 사용된다. 기밀성과 무결성을 동시에 제공한다.

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
import os

plaintext = bytes.fromhex("120452020801")  # 예: HVAC 명령 protobuf
metadata = bytes.fromhex("...")             # 직렬화된 TLV metadata

# AAD = SHA256(metadata)
digest = hashes.Hash(hashes.SHA256())
digest.update(metadata)
aad = digest.finalize()

key = bytes.fromhex("1b2fce19967b79db696f909cff89ea9a")  # K (128-bit)
aesgcm = AESGCM(key)
nonce = os.urandom(12)                      # 12바이트 랜덤 nonce
ct = aesgcm.encrypt(nonce, plaintext, aad)  # ciphertext + auth tag
```

- **Key**: ECDH 에서 유도된 128-bit Session Key K
- **Nonce**: 매 메시지마다 새로 생성되는 12바이트 랜덤 값
- **AAD(Associated Authenticated Data)**: Metadata 의 SHA256 해시. AAD 는 암호화되지 않지만 인증된다. Vehicle 은 metadata 변조를 감지할 수 있다
- **Plaintext**: Protobuf 직렬화된 명령 페이로드

RoutableMessage 의 `signature_data` 필드 중 `AES_GCM_Personalized_Signature_Data` 에 nonce, ciphertext, auth tag 가 포함된다.

### Why Both HMAC and AES-GCM?

두 방식을 모두 지원하는 이유는 **Inspectability(검사 가능성) vs Privacy(기밀성)** 사이의 트레이드오프 때문이다.

| 속성 | HMAC (Plaintext) | AES-GCM (Encrypted) |
|------|-----------------|---------------------|
| 기밀성 | 없음 (페이로드 평문) | 있음 (페이로드 암호화) |
| 무결성 | 있음 (HMAC tag) | 있음 (GCM auth tag) |
| 중간자 검사 | 가능 (OAuth scope 검증) | 불가능 |
| 사용 채널 | Fleet API (HTTPS) | BLE |
| HTTPS 보호 | TLS 가 confidentiality 제공 | 불필요한 이중 암호화 |

```
HMAC (Fleet API):
Client → [평문 + HMAC tag] → Tesla Server → Vehicle
                               │
                               ├─ OAuth 토큰 scope 검사
                               └─ 명령 내용 읽어서 권한 대조

AES-GCM (BLE):
Client → [암호문 + auth tag] → Vehicle
           ↑
   RF sniffer 가 캡처해도 복호화 불가
```

Fleet API 경로에서 HMAC(Plaintext) 를 사용하는 이유: Tesla 서버가 중간에서 **OAuth scope enforcement** 를 수행해야 하기 때문이다. 예를 들어 "door_unlock" 권한이 없는 OAuth 토큰으로 잠금 해제 명령을 보내면, Tesla 서버가 평문 페이로드를 파싱하여 이를 거부한다. 만약 모든 명령이 AES-GCM 으로 암호화되면 서버는 이 검사를 수행할 수 없다.

BLE 경로에서 AES-GCM 을 사용하는 이유: BLE 는 2.4 GHz ISM band 에서 통신하며, 물리적 근접성(~10m) 내의 다른 디바이스가 패킷을 수신할 수 있다. BLE 링크 계층 암호화(특히 Legacy Pairing 의 Just Works 모드)는 MITM 에 취약한 것으로 알려져 있으므로, 프로토콜 수준에서 AES-GCM 암호화가 필요하다.

<mark><em><strong>Fleet API 는 서버가 명령 내용을 검사하여 OAuth 권한을 강제해야 하므로 평문 + HMAC 을 사용하고, BLE 는 물리적 근접성만으로는 기밀성이 보장되지 않으므로 AES-GCM 암호화를 사용한다. 이는 end-to-end security 와 intermediate inspection 사이의 고전적인 트레이드오프이다.</strong></em></mark>

## Anti-Replay Mechanism

서명된 명령이라도 공격자가 캡처하여 재전송(Replay)할 수 있다. Tesla 는 이를 방지하기 위해 메시지 metadata 에 Anti-Replay 정보를 ***TLV(Tag-Length-Value)*** 형식으로 바인딩한다.

### Counter, Epoch, ExpiresAt

Metadata TLV 구조는 다음과 같다:

| Tag | 코드 | 설명 |
|-----|------|------|
| TAG_SIGNATURE_TYPE | 0x00 | 서명 타입 (HMAC 또는 AES-GCM) |
| TAG_DOMAIN | 0x01 | 대상 도메인 (VCSEC 또는 Infotainment) |
| TAG_PERSONALIZATION | 0x02 | VIN (차량 식별 번호) |
| TAG_EPOCH | 0x03 | 도메인 clock 의 epoch_id (16바이트, 도메인 부팅 시 새로 생성) |
| TAG_EXPIRES_AT | 0x04 | 명령 만료 시각 |
| TAG_COUNTER | 0x05 | Monotonic counter |

TLV 인코딩 예시:

```
TLV(VIN: "abc") = TAG_PERSONALIZATION || LEN || "abc"
                = 0x02 || 0x03 || 0x616263
```

정수 값은 big-endian 4바이트로 인코딩되며, metadata 블록은 `0xFF` 로 종료된다. Tag 는 숫자 순서로 정렬된다.

각 필드의 역할:

- **Counter**: 단조 증가(Monotonic) 카운터. 이전에 사용된 counter 값의 재사용을 거부한다
- **Epoch**: 16바이트 랜덤 값으로 도메인 부팅 주기의 식별자 역할. 도메인이 재부팅되면 새 epoch_id 가 생성되고, 이전 epoch 의 모든 counter 와 expiresAt 이 무효화된다. "세션" 단위가 아니라 "도메인 부팅" 단위임에 주의. 하나의 epoch 내에서 여러 클라이언트 세션이 공존할 수 있다
- **ExpiresAt**: 명령의 유효 시간. 도메인별 클록 기반. 이 시간이 지나면 유효한 서명이라도 거부된다
- **VIN**: 차량 식별 번호. 다른 차량을 대상으로 한 명령이 재사용되는 것을 방지한다

이 metadata 는 HMAC 태그 계산 시 `M` 에 포함되거나 AES-GCM 의 AAD(`SHA256(M)`)에 포함되므로, 공격자가 metadata 를 변조하면 인증이 실패한다.

### Counter Window Design

Tesla 는 두 도메인(VCSEC, Infotainment)에 서로 다른 counter 정책을 적용한다. 이 차별화는 도메인별 보안 민감도와 전송 채널의 특성을 반영한다.

__DOMAIN_VEHICLE_SECURITY (VCSEC)__:

문 잠금/해제, 원격 시동, 트렁크 등 보안에 민감한 명령을 처리한다. **Strict Ordering** 정책을 사용한다:

```
수락 조건: counter > last_seen

State:
  last_seen = 42

Incoming counter = 43: 43 > 42 → ACCEPT, last_seen = 43
Incoming counter = 41: 41 > 43 → REJECT (out-of-order)
Incoming counter = 43: 43 > 43 → REJECT (replay)
```

VCSEC 이 strict ordering 을 사용하는 이유: "lock" → "unlock" 순서로 보냈는데 역순으로 도착하면, 사용자의 의도와 반대로 차량이 잠금 해제 상태가 된다. Safety-critical 명령에서는 순서 보장이 안 되는 메시지를 거부하는 것이 올바른 선택이다. Tesla 명세에서도 "clients should avoid making simultaneous requests" to VCSEC 도메인을 권고한다.

__DOMAIN_INFOTAINMENT__:

미디어 제어, 내비게이션, 공조 등 나머지 명령을 처리한다. **Sliding Window** 정책을 사용한다 (소스코드에서 `windowSize = 32`):

```
수락 조건: counter > (highest_seen - W) AND counter NOT IN seen_set
          (W = 32, sliding window 크기)

Window state:
  highest_seen = 42, W = 32
  seen_set = {38, 39, 40, 41, 42}

Incoming counter = 37:
  37 > (42 - 32) = 10? → Yes
  37 in seen_set? → No
  → ACCEPT, add 37 to seen_set

Incoming counter = 45:
  45 > highest_seen? → Yes
  → ACCEPT, highest_seen = 45, add 45
  → Evict entries below (45 - 32) = 13

Incoming counter = 40:
  40 > (45 - 32) = 13? → Yes
  40 in seen_set? → Yes (이미 처리됨)
  → REJECT (replay)
```

이 설계는 ***[IPsec Anti-Replay Window](https://datatracker.ietf.org/doc/html/rfc4302#section-3.4.3)*** 와 유사한 패턴이다. Window 크기 W 는 예상되는 최대 out-of-order(재정렬/순서 뒤바뀜) 정도와 메모리 사용량 사이의 트레이드오프로 결정된다.

Infotainment 명령(에어컨, 미디어 등)은 out-of-order 로 도착해도 safety-critical 하지 않다. "set temperature 22°C" 다음에 "set temperature 24°C" 가 역순으로 도착하면 최종 상태가 달라지지만, 인명에 대한 위험은 없다.

## Session Lifecycle

### Session Handoff

세션 전환은 **Vehicle 도메인의 재부팅(새 epoch_id 생성)** 에 의해 발생한다. epoch_id 가 변하면 counter 공간이 리셋되고 이전 epoch 의 명령이 거부된다. K = ECDH(c, V) 이므로 K 가 변하려면 c 또는 V 가 변해야 하지만, **명세는 재부팅 시 V 가 재생성된다고 명시하지 않으며, V 가 정적이라면 K 는 epoch 변경과 무관하게 동일하다**.

```
[V 가 정적인 경우 — 명세 근거상 가능성 높음]
Epoch 1: K = ECDH(c, V), epoch = e₁, counter range [0..N]
    │
    ▼  [Vehicle 도메인 재부팅 → 새 epoch_id e₂ 생성, counter 초기화]
Epoch 2: K = ECDH(c, V), epoch = e₂, counter = 0
    ── K 는 동일하지만, e₁ 기반 metadata 로 서명된 명령은 e₂ 에서 거부
    ── (V 가 재부팅 시 재생성되는 경우 K₂ ≠ K₁ 이 추가 보장됨 — 명세 미확정)
```

핵심 원리: **새 epoch = 새 epoch_id + counter 초기화**. V 의 교체 여부는 명세에 미명시되어 있으며, V 가 고정이면 K 도 동일하게 유지된다. 이 경우 epoch 간 격리는 epoch_id 기반 metadata 변경에 의한 anti-replay 에 의존한다. 반면, **동일 epoch 내에서 재핸드셰이크를 수행하면 c 와 V 가 모두 동일하므로 K 도 동일하다**.

Epoch 변경 시 다음이 발생한다:

1. Vehicle 도메인이 재부팅되어 새 epoch_id e₂ 를 생성한다
2. Client 가 session_info_request 전송 → Vehicle 이 V 와 새 e₂ 를 포함한 session_info 응답
3. Client 가 ECDH(c, V) 로 K 를 도출한다 (V 가 정적이면 이전과 동일한 K)
4. epoch 가 e₂ 로 변경되고 counter 가 0 으로 초기화
5. 이전 epoch e₁ 에 대한 모든 counter 가 무효화

epoch 경계의 보안은 전적으로 epoch_id/counter/expiresAt metadata 기반 Anti-Replay 메커니즘에 있다. V 가 정적이더라도 anti-replay 는 유효하다: epoch_id 가 metadata M 에 포함되므로 `HMAC(K, M₁||P) ≠ HMAC(K, M₂||P)` (e₁ ≠ e₂ 이므로 M₁ ≠ M₂). 이것이 Tesla 가 counter, epoch, expiresAt 를 metadata 에 강제하는 이유이다.

### Handoff Safety: Two Sessions Coexisting

실제 환경에서는 세션 전환이 atomic 하지 않다. Network latency 와 message reordering 으로 인해 두 세션이 잠시 공존하는 기간이 있다.

```
Time →
Client:  [─── Session 1 ───][─── transition ───][─── Session 2 ───]
Vehicle: [─── Session 1 ────────][─── S1 + S2 ───][─── Session 2 ───]
```

이 기간 동안의 안전성:

- Vehicle 은 각 incoming message 의 **epoch 를 확인**하여 어느 세션에 속하는지 판별한다. `verifier.go` 에서 epoch 불일치 시 `INCORRECT_EPOCH` 오류를 반환한다
- Session 1 의 명령은 K₁ 과 e₁ 으로 검증하고, Session 2 의 명령은 K₂ 와 e₂ 로 검증한다
- 일정 시간 이후 Vehicle 은 이전 세션을 **만료(invalidate)** 시킨다

__잠재적 취약 시나리오__:

```
조건: 이전 세션 K₁ 이 유출됨 AND Vehicle 이 아직 epoch e₁ 을 무효화하지 않음
결과: 공격자가 K₁ 과 e₁ 으로 유효한 명령을 생성 가능
```

이 window 가 이론적으로 존재하지만, 실제 exploit 가능성은 매우 낮다:

1. K 는 c 와 V 로부터 결정론적으로 유도되므로, K 를 직접 탈취하려면 c 또는 v 를 먼저 획득해야 한다. Client 의 c 는 OS Keyring 또는 파일에 보호되어 있고, Vehicle 의 v 는 보안 마이크로컨트롤러에 저장된다
2. K 유출은 memory dump, side-channel attack 등 별도의 선행 공격이 필요하다
3. Vehicle 의 세션 타임아웃이 이 window 를 최소화한다
4. `expiresAt` metadata 가 시간 기반 추가 경계를 제공한다 (명세에서 `maxSecondsWithoutCounter = 30`)

### Session Key Storage

Session Key K 의 보호는 보안의 핵심 요소이다. K 가 유출되면 해당 epoch 내의 모든 명령을 위조할 수 있다. K 는 c 와 V 로부터 결정론적으로 유도되므로(`K = SHA-1(BIG_ENDIAN(ECDH(c, V)_x, 32))[:16]`), c 또는 v 가 유출되면 K 도 자동으로 위험해진다. Tesla 명세는 세션 상태(K 관련 정보 포함)를 **디스크에 캐시할 것을 권장**한다.

__위험 시나리오__:

- **메모리 덤프**: 프로세스 크래시 시 코어 덤프에 K 가 포함될 수 있다
- **Swap File**: OS 가 메모리 페이지를 디스크로 swap 하면 K 가 디스크에 기록될 수 있다
- **Cold Boot Attack**: DRAM 의 data remanence 를 이용한 물리적 공격
- **Side-Channel Attack**: Spectre/Meltdown 류의 CPU 취약점을 이용한 cross-process memory read

__안전한 대안__:

| 방식 | 설명 | 보안 수준 |
|------|------|----------|
| ***HSM*** | 하드웨어 보안 모듈, 키가 칩 외부로 노출되지 않음 | 최상 |
| ***Secure Enclave*** | ARM TrustZone, Apple Secure Enclave 등 격리된 실행 환경 | 상 |
| OS Keyring | OS 제공 키 관리 (Keychain, Credential Manager) | 중 |
| 파일 시스템 | 평문 저장, 권한 제한(0600) | 하 |

__Tesla 의 실제 접근 방식__:

Tesla SDK(`tesla-keygen`) 는 두 가지 저장 메커니즘을 제공한다:

1. **OS Keyring (권장)**: macOS Keychain, Linux credential manager 등 OS 수준 키 관리에 개인 키를 저장한다
2. **파일 기반**: PEM 형식 파일로 저장하며, 권한을 0600(소유자만 읽기/쓰기)으로 제한한다

Tesla SDK 는 파일 기반에서 OS Keyring 으로 마이그레이션하는 `migrate` 명령을 제공하여, 파일 기반 저장에서의 전환을 지원한다.

세션 캐시(session info)는 `TESLA_CACHE_FILE` 환경 변수로 지정된 파일에 직렬화하여 저장할 수 있다. 이는 세션 재사용을 위한 것으로, raw key 가 아닌 직렬화된 세션 정보(생성 시각, 도메인, 세션 바이트)를 포함한다.

Vehicle 측에서는 VCSEC 모듈이 별도의 보안 마이크로컨트롤러에서 독립적으로 키를 관리하며, hardware-backed secure storage 를 사용한다.

## Transport Layer

Tesla Signed Command Protocol 은 전송 계층에 독립적(***Transport Agnostic***)으로 설계되었다. 동일한 RoutableMessage 구조가 어떤 채널을 통해서든 전달될 수 있다.

### Fleet API (HTTPS)

Fleet API 는 Tesla 서버를 경유하는 HTTPS 기반 원격 명령 채널이다.

```
POST /api/1/vehicles/{vin}/signed_command
Content-Type: application/json

{
  "routable_message": "<base64-encoded RoutableMessage protobuf>"
}
```

```
Client App  ──HTTPS──▶  Tesla Fleet API  ──(internal)──▶  Vehicle
                         │
                         ├─ OAuth 토큰 검증
                         ├─ scope enforcement (HMAC 방식일 때)
                         └─ 명령을 차량에 relay
```

Tesla 서버-차량 간 채널은 **TCP 전송 보장을 제공하지 않으므로** 메시지 유실 및 순서 변경이 가능하다. 이 때문에 Anti-Replay 메커니즘이 transport level 이 아닌 **application level** 에서 구현된다.

#### Why No TCP Guarantee?

Tesla 의 프로토콜 명세는 다음과 같이 명시한다:

> "Although communication between clients and Tesla's servers use TLS/TCP, the communication channel between Tesla's servers and vehicles does not provide TCP transport guarantees; messages may be dropped or arrive out of order."
> — [Tesla vehicle-command protocol.md](https://github.com/teslamotors/vehicle-command/blob/main/pkg/protocol/protocol.md)

위 명세에서 말하는 "TCP 보장 부재"는 **애플리케이션 메시지 관점**에서 다음을 의미한다:

- **drop(유실)**: 서버가 차량에 전달하려 한 메시지가 차량 측에 도달하지 않는 것. 예: 서버가 cmd-1 을 차량에 relay 했지만, 차량이 오프라인/연결 불안정/중간 릴레이 오류 등으로 메시지를 수신하지 못하는 경우
- **out-of-order(순서 역전)**: 보낸 순서와 다른 순서로 도착하는 것. 예: cmd-1 을 먼저, cmd-2 를 나중에 보냈는데, 차량은 cmd-2 를 먼저 받고 cmd-1 을 나중에 받는 상황

TCP 는 "바이트 스트림" 관점에서 단일 연결 내 정렬(in-order)을 보장하지만, **여러 hop / 재접속 / 재전송**이 개입하는 종단-종단(end-to-end) 경로에서는 애플리케이션 메시지 수준의 drop/out-of-order 가 발생할 수 있다.

클라이언트-Tesla 서버 구간은 표준 HTTPS(TLS over TCP) 이므로 TCP 보장이 적용된다. 문제는 **Tesla 서버-차량 구간**이다. 이 구간에서 TCP 전송 보장이 성립하지 않는 원인으로는 ***end-to-end TCP 세션의 부재***를 추론할 수 있다. Tesla 명세는 내부 아키텍처를 공개하지 않지만, 서버-차량 구간에서 TCP 보장이 없다는 사실 자체는 명세로 확정되어 있으며, 그 전형적 원인 중 하나가 다중 hop 및 독립 세션 구조이다.

__End-to-End TCP Semantics Break__. ***[TCP(RFC 9293)](https://www.rfc-editor.org/rfc/rfc9293)*** 는 두 endpoint 간 ***reliable, in-order byte-stream service*** 를 제공한다. TCP 의 순서 보장과 신뢰성은 **단일 TCP 연결의 양 끝점 사이에서만** 유효하다. RFC 9293 은 "A connection is defined by a pair of sockets" 라고 명시하며, 소켓 쌍이 달라지면 같은 TCP 연결이 아니므로 그 보장도 이어지지 않는다. 일반적인 multi-hop 릴레이 구조에서, 클라이언트-서버 구간의 TCP 세션과 서버-차량 구간의 TCP 세션은 **별개의 독립적인 세션**이 된다.

아래는 이러한 TCP 보장 부재가 발생하는 전형적인 구조를 도식화한 것이다(Tesla 의 실제 내부 아키텍처와 다를 수 있다):

```
[Client]                    [Tesla Cloud]                    [Vehicle]
    │                            │                               │
    ├── TCP Session A ──────────▶│                               │
    │   (HTTPS, reliable)        │                               │
    │                            │  [application-layer relay]    │
    │                            │                               │
    │                            ├── TCP Session B ─────────────▶│
    │                            │   (separate session)          │
    │                            │                               │
```

서버가 TCP Session A 에서 메시지를 수신한 후, 내부 처리를 거쳐 TCP Session B 로 차량에 전달하는 구조에서는 end-to-end TCP 보장이 성립하지 않는다. Session A 의 TCP sequence number 와 Session B 의 TCP sequence number 는 완전히 독립적이며, 서버 내부에서 메시지가 어떤 순서로 처리되고 전달되는지는 TCP 가 관여하는 영역이 아니다. 이것은 HTTP reverse proxy 에서 TCP 연결이 분리되는 것과 유사한 원리이다 — 각 hop 은 독립적인 TCP 세션이며, 전체 경로의 메시지 순서와 전달 보장은 application layer 의 책임이 된다. 다만 차량 환경은 셀룰러 네트워크 불안정, 차량 sleep mode 등 reverse proxy 구간에서는 발생하지 않는 추가적인 전달 불확실성이 존재한다.

"gRPC(HTTP/2 over TCP), WebSocket(TCP) 기반이므로 TCP 보장이 있지 않느냐?"는 흔한 질문이다. 이들 프로토콜이 각 hop 에서 TCP 를 사용하는 것은 사실이지만, **hop-by-hop TCP 가 end-to-end TCP 를 의미하지는 않는다.** 예를 들어:

```
Vehicle ↔ (Cellular) ↔ Edge Gateway ↔ 내부 서비스 ↔ Fleet API
```

이 경로에서 Vehicle↔Gateway 는 TCP 연결 1개, Gateway↔내부 서비스는 별개의 TCP 연결이다. RFC 9293 이 말하는 "연결은 소켓 쌍으로 정의된다"는 문장이 이를 정확히 뒷받침한다. 결과적으로:
- Gateway 내부 큐/스케줄링/재시도로 인해 메시지 순서가 바뀔 수 있음 → **out-of-order**
- 특정 hop 에서만 타임아웃/폐기 정책이 걸리면 종단에서는 **drop** 처럼 관찰됨

이 문제는 ***[End-to-End Arguments in System Design(Saltzer, Reed, Clark, 1984)](https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf)*** 이 제시한 원칙과 잘 부합한다: 하위 계층이 end-to-end 요구사항을 완전히 충족하지 못하면, 해당 기능은 애플리케이션에서 구현되어야 한다는 요지다. Tesla 명세가 server↔vehicle 구간에서 drop/out-of-order 가능성을 명시한 이상, 애플리케이션 레벨에서 anti-replay/ordering/validity 를 설계하는 것은 이 원칙의 자연스러운 적용이다.

__Vehicle Connectivity and Session Lifecycle__. 차량 환경은 TCP 연결의 장기 유지를 어렵게 만드는 특수한 조건을 갖는다. 터널, 지하주차장 진입, 차량 sleep mode 등으로 인해 차량이 **장시간 오프라인 상태**에 놓일 수 있으며, 이 경우 기존 TCP 연결은 종료된다. TCP 자체는 셀룰러 네트워크의 일반적인 신호 변동이나 경미한 패킷 손실은 재전송 메커니즘으로 처리할 수 있지만, 장시간 연결 단절 후 재수립된 TCP 세션은 이전 세션과 완전히 별개이다. 이전 세션에서의 순서 보장이나 전달 상태는 새 세션으로 이어지지 않는다.

***[RFC 9293](https://datatracker.ietf.org/doc/html/rfc9293)*** 은 연결이 끊겼다가 다시 수립되면 이전 연결과는 다른 **incarnation** 이라고 정의하며, 이전 incarnation 의 중복/지연 세그먼트가 새 incarnation 에 혼입되는 문제를 직접 다룬다:

> "A connection is defined by a pair of sockets." — RFC 9293
> "New instances of a connection will be referred to as incarnations of the connection." — RFC 9293

구체적으로, 차량 재접속 시 애플리케이션 메시지 수준의 out-of-order 는 다음과 같이 발생할 수 있다:

1. 서버가 cmd-1 을 차량에 전송 (연결 #1)
2. 연결 #1 이 끊김 (차량 cellular handoff / 터널 진입)
3. 서버가 timeout 후 cmd-1 의 재전송을 큐에 적재
4. 동시에 사용자가 cmd-2 도 전송
5. 차량이 재접속하여 연결 #2 가 수립됨 (새 incarnation)
6. 스케줄링/재전송 타이밍에 의해 cmd-2 가 먼저 전달되고, 재전송된 cmd-1 이 나중에 도착 → 차량 입장에서 **out-of-order**

재접속/세션 변경으로 인해 "이전 세션에서 만들어진 메시지"가 나중에 도착할 수 있으므로, 수신 측은 현재 세션/현재 시간/현재 카운터 기준으로 메시지를 검증하고 거절할 장치가 필요하다.

__Inferred: Store-and-Forward Architecture__. Tesla 명세는 서버-차량 간 내부 아키텍처를 공개하지 않는다. 그러나 "메시지가 유실되거나 순서가 바뀔 수 있다"는 명세의 기술과, 차량이 오프라인일 때도 명령을 전송할 수 있는 동작 특성으로부터, 서버 내부에 ***[Store-and-Forward](https://en.wikipedia.org/wiki/Store_and_forward)*** 방식의 메시지 릴레이 또는 큐잉 메커니즘이 존재하는 것으로 추론할 수 있다. 이러한 구조에서는:

- 큐에 적재된 순서와 차량에 도달하는 순서가 다를 수 있다 (reordering)
- 전달 실패 시 메시지가 유실될 수 있다 (drop)
- 재전송 로직에 의해 동일 메시지가 중복 도달할 수 있다 (duplication)

이는 ***[Message Queue](https://en.wikipedia.org/wiki/Message_queue)*** 기반 시스템에서 관찰되는 전형적인 전달 특성과 일치하는 동작이다.

결과적으로 Signed Command Protocol 은 transport layer 의 신뢰성에 의존하지 않도록 설계되었다. End-to-end TCP 보장이 구조적으로 성립하지 않는 multi-hop 아키텍처에서, **counter + epoch + expiresAt** 조합은 메시지의 **전달 자체를 보장(delivery guarantee)하는 것이 아니라**, 유실·재정렬 가능성을 인정한 상태에서 **재생 공격(replay attack)·중복 실행(duplicate execution)·만료된 명령(expired command)을 차단**하여 안전 요구사항을 충족한다. 이 설계 덕분에 프로토콜이 HTTPS, BLE, 또는 미래의 어떤 transport 위에서든 동일한 보안 보장을 제공할 수 있다.

### BLE (Bluetooth Low Energy)

BLE 는 차량과 직접 통신하는 근거리 무선 채널이다.

```
Service UUID:        00000211-b2d1-43f0-9b88-960cebf8b91e
Write Characteristic: 00000212-b2d1-43f0-9b88-960cebf8b91e
Read Characteristic:  00000213-b2d1-43f0-9b88-960cebf8b91e
Advertisement Name:   S + <SHA1(VIN) 앞 8바이트 hex> + C
```

BLE 메시지는 2바이트 big-endian 길이 접두사로 프레이밍된다. BLE MTU 제한으로 메시지가 분할되며, 수신 측에서 길이 접두사를 기반으로 재조립한다.

VCSEC 은 동시에 최대 3개의 BLE 연결만 허용하며, 이는 키폽과 공유된다.

### WebSocket and gRPC in Tesla Architecture

Tesla 의 전체 아키텍처에서 Signed Command Protocol 이외에 다른 프로토콜도 사용된다. 이들은 **별개의 시스템**이므로 혼동하지 않아야 한다.

__Tesla Fleet Telemetry (WebSocket)__:

***[Tesla Fleet Telemetry](https://github.com/teslamotors/fleet-telemetry)*** 는 차량에서 클라우드로 텔레메트리 데이터를 스트리밍하기 위한 **별도의 시스템**이다. 이 시스템은 ***WebSocket*** 을 사용한다.

```
Vehicle ──[WebSocket]──▶ Fleet Telemetry Server ──▶ Consumer
           (telemetry streaming: 위치, 배터리, 센서 등)
```

WebSocket 이 선택된 이유:
- 양방향 지속 연결(persistent connection)로 실시간 텔레메트리 스트리밍에 적합하다
- HTTP request-response overhead 없이 frame 단위로 데이터를 전송할 수 있다
- HTTP upgrade 를 통해 연결을 수립하므로 기존 HTTP 인프라를 활용할 수 있다

**Fleet Telemetry 는 명령 전송이 아닌 데이터 수집(Data Ingestion) 용도이다.** Signed Command Protocol 과는 완전히 별개의 시스템이다.

__Protobuf Serialization__:

Tesla 는 메시지 직렬화에 ***[Protocol Buffers(protobuf)](https://protobuf.dev/)*** 를 사용한다. Protobuf 는 gRPC 의 기본 직렬화 형식으로 알려져 있지만, protobuf 자체는 **transport-agnostic 한 직렬화 라이브러리**이다. Tesla 는 protobuf 로 RoutableMessage 를 직렬화하되, 전송은 HTTP REST 와 BLE 를 사용한다. 즉, **protobuf 사용이 gRPC 사용을 의미하지 않는다**.

```
[Signed Command Protocol]     [Fleet Telemetry]
  ├─ Serialization: protobuf    ├─ Transport: WebSocket
  ├─ Transport: HTTPS REST      └─ Direction: Vehicle → Cloud
  ├─ Transport: BLE
  └─ Direction: Client → Vehicle
```

이 Transport Agnostic 설계의 핵심: RoutableMessage 는 transport 에 대한 어떤 가정도 하지 않는다. 같은 protobuf 메시지가 HTTPS body 에 base64 로 인코딩되어 실릴 수도 있고, BLE GATT characteristic 에 binary 로 실릴 수도 있다. 이것이 Anti-Replay 메커니즘이 TCP sequence number 에 의존하지 않고 **application level** 에서 counter + epoch + expiresAt 로 구현된 이유이다.

## RoutableMessage: Universal Message

***RoutableMessage*** 는 Tesla Signed Command Protocol 의 범용 메시지 형식이다. 모든 명령과 응답이 이 Protobuf 구조체로 래핑된다.

```protobuf
message RoutableMessage {
    reserved 1 to 5;
    reserved 16 to 40;
    reserved 11;
    Destination to_destination = 6;
    Destination from_destination = 7;

    oneof payload {
        bytes protobuf_message_as_bytes = 10;
        SessionInfoRequest session_info_request = 14;
        bytes session_info = 15;
    }

    oneof sub_sigData {
        Signatures.SignatureData signature_data = 13;
    }

    MessageStatus signedMessageStatus = 12;
    bytes request_uuid           = 50;
    bytes uuid                   = 51;
    uint32 flags = 52;
}
```

각 필드의 역할:

- **to_destination / from_destination**: 메시지 라우팅 정보. Domain(VCSEC, Infotainment)과 라우팅 주소를 지정한다. `from_destination` 의 라우팅 주소는 16바이트 랜덤 값으로 생성되며, 응답 메시지를 올바른 요청자에게 전달하는 데 사용된다
- **payload (oneof)**: 실제 페이로드. `protobuf_message_as_bytes` 는 서명된 명령, `session_info_request` 와 `session_info` 는 세션 핸드셰이크에 사용된다
- **signature_data (oneof sub_sigData)**: HMAC 태그 또는 AES-GCM 의 Nonce + Ciphertext + Auth Tag 가 포함된다
- **signedMessageStatus**: 응답 메시지에서 프로토콜 계층의 오류를 나타낸다
- **request_uuid / uuid**: 요청-응답 매칭을 위한 식별자 (최대 16바이트). uuid 는 요청 시 설정하면 응답의 request_uuid 에 복사된다. **UUID 는 예측 불가능(unpredictable)해야 한다** — 이는 replayed handshake response 를 방지하기 위함이다
- **flags**: 메시지 플래그 비트마스크. `FLAG_ENCRYPT_RESPONSE` 비트를 항상 설정하여, 호환 펌웨어(2024.38+)의 차량이 응답을 암호화하도록 지시해야 한다. Vehicle 은 인식하지 못하는 비트를 무시한다

`oneof payload` 구조는 하나의 메시지 형식으로 명령 전송과 세션 핸드셰이크를 모두 처리할 수 있게 한다. 새로운 payload 타입을 추가하더라도 기존 구조를 변경할 필요가 없어 프로토콜의 확장성이 확보된다.

## Domains and Access Roles

Tesla 는 차량 내부를 두 개의 보안 도메인으로 분리한다:

| 도메인 | 역할 | Counter 정책 | 명령 예시 |
|--------|------|-------------|----------|
| DOMAIN_VEHICLE_SECURITY (VCSEC) | 물리적 보안 | Strict ordering | lock, unlock, remote start, trunk |
| DOMAIN_INFOTAINMENT | 나머지 기능 | Sliding window | HVAC, media, navigation |

각 도메인은 독립적인 클록(epoch, timestamp)과 counter 를 유지한다.

접근 역할(Access Roles)은 다음과 같이 세분화된다:

| Role | 설명 | 제한 |
|------|------|------|
| Owner | 모든 명령, 키 관리 | 없음 |
| Driver | 대부분의 명령 | 키 관리 불가, PIN 변경 불가 |
| Fleet Manager | 클라우드 기반 owner key | 키 관리 불가, BLE 불가 (2023.38+) |
| Vehicle Monitor | 읽기 전용 (위치, 차량 데이터) | 제어 명령 불가 |
| Charging Manager | 충전 관련 명령만 | 충전 외 불가 |
| Guest | 임시 Driver 키, 자동화된 생명주기 | 차량 렌탈 용도, Driver 와 유사 |
| Service | 최초 페어링, 긴급 출동 | 인터넷 명령 기본 차단 |

각 역할은 **Client 의 공개 키 C 에 바인딩**된다. Vehicle 은 handshake 시 수신한 C 를 keychain 에서 조회하여 역할을 결정하고, 해당 역할이 허용하는 범위 내에서만 명령을 수락한다. Service 키는 다른 키의 페어링을 부트스트랩하는 신뢰의 루트(root of trust)이며, 원격으로 잠금/해제(긴급 출동)와 Driver, Guest, Fleet Manager 키의 삭제(추가는 불가)가 가능하다.

## Deep Questions and Answers

### Q. 왜 HMAC(평문)과 AES-GCM(암호문)을 둘 다 고려해야 했나요?

Fleet API 는 Tesla 서버를 경유한다. 서버는 OAuth 토큰의 scope 를 검사하여, 해당 토큰이 요청된 명령을 실행할 권한이 있는지 검증해야 한다. 이를 위해 서버는 **명령 내용을 읽을 수 있어야** 하므로 암호화가 아닌 HMAC(평문 인증)을 사용한다. 서버가 명령을 볼 수는 있지만, HMAC 이 무결성을 보장하므로 수정할 수는 없다.

BLE 는 차량과 직접 통신한다. BLE 의 물리적 근접성은 접근을 제한하지만, RF sniffing 으로 패킷을 캡처할 수 있다. BLE 링크 계층 암호화(Legacy Pairing 의 Just Works 모드)는 MITM 에 취약하므로, 프로토콜 수준에서 AES-GCM 암호화가 필요하다.

HTTPS 채널에서는 TLS 가 이미 transport-level confidentiality 를 제공하므로, application-level 에서 다시 암호화할 필요가 없다. 오히려 평문을 유지해야 서버 측 authorization 이 가능하다.

### Q. Out-of-order 가 가능한 채널에서 counter window 는 어떻게 설계하나요?

핵심 설계 원칙은 **"보안 민감도에 따라 다른 정책을 적용"** 하는 것이다.

VCSEC(보안 민감): `counter > last_seen` — strict ordering. Out-of-order 메시지를 무조건 거부한다. "lock" → "unlock" 이 역순으로 도착하면 차량이 의도와 반대로 잠금 해제되는 것을 방지한다.

Infotainment(보안 비민감): sliding window(`windowSize = 32`) — `counter > (highest_seen - W) AND counter NOT IN seen_set`. Window 내에서 out-of-order 를 허용하되 replay 를 방지한다.

Window 크기 W=32 는 다음 트레이드오프를 반영한다:
- W 가 너무 작으면: 약간의 reordering 에도 정상 명령이 거부된다
- W 가 너무 크면: seen_set 의 메모리 사용량이 증가하고, 오래된 replay 가 수락될 수 있다
- 32 는 일반적인 네트워크 reordering 범위를 충분히 수용하면서 메모리 효율적인 값이다

이는 ***[IPsec Anti-Replay Window(RFC 4302)](https://datatracker.ietf.org/doc/html/rfc4302#section-3.4.3)*** 와 동일한 패턴이다.

### Q. Handoff 순간(두 세션이 잠깐 공존)에도 안전한가요? 어떤 조건에서 깨지나요?

**epoch 변경 시 anti-replay 관점에서 안전하다.** 재부팅으로 새 epoch_id 가 생성되면 이전 epoch 의 counter/expiresAt 이 무효화된다. 단, **동일 epoch 내에서 재핸드셰이크를 수행하면 같은 c 와 같은 V 에서 ECDH 를 수행하므로 K 는 동일하다**.

안전 보장의 근거:
1. 이전 epoch 의 명령은 epoch_id 가 metadata M 에 포함되므로, **epoch 불일치**로 HMAC 검증이 실패한다
2. Epoch 변경은 counter 공간을 완전히 초기화한다 — 이전 epoch 의 replay 가 새 epoch 에서 수락될 가능성은 없다

> 참고: V 가 재부팅 시 재생성되는 경우 K₂ ≠ K₁ 이라는 추가 격리가 존재하겠지만, V 의 교체 여부는 명세에 명시되어 있지 않다. V 가 고정인 경우 K₂ = K₁ 이며, 안전성은 전적으로 위 두 메커니즘에 의존한다.

**깨지는 조건**: K 가 유출되었고(c 또는 v 탈취가 선행), Vehicle 이 아직 이전 epoch 을 무효화하지 않은 극히 짧은 시간 동안 공격자가 K 와 이전 epoch 으로 유효한 명령을 생성할 수 있다. 그러나 이는 (1) K 유출을 위한 별도 공격 선행 필요, (2) Vehicle 세션 타임아웃에 의한 window 최소화, (3) expiresAt 에 의한 시간 기반 경계 로 인해 실제 exploit 가능성은 극히 낮다.

**동일 epoch 내에서의 한계**: 같은 epoch 내에서는 K 가 동일하므로, 보안은 전적으로 epoch/counter/expiresAt 기반 Anti-Replay 메커니즘에 의존한다. Client 키 c 가 유출되면 모든 과거 및 미래 세션이 위험하다 (V 가 정적이면 K 는 상수). 이는 TLS 1.3 의 per-session Forward Secrecy 와 구별되는 Tesla 프로토콜의 특성이다.

### Q. Session Key 를 레지스트리에 저장하면 보안상 위험하지 않나요? 대안은?

위험하다. 평문으로 저장된 Session Key K 는 메모리 덤프, 권한 상승, 디스크 swap, cold boot attack 등으로 유출될 수 있다.

Tesla 의 실제 접근 방식:
- **Client 측**: OS Keyring(macOS Keychain, Android Keystore 등)을 기본 저장소로 사용한다. `tesla-keygen` 도구는 파일 기반 → keyring 마이그레이션 명령(`migrate`)을 제공한다
- **Vehicle 측**: VCSEC 모듈의 보안 마이크로컨트롤러, Infotainment 의 보안 프로세서 등 hardware-backed secure storage 를 사용한다
- **세션 캐시**: `TESLA_CACHE_FILE` 환경 변수로 직렬화된 세션 정보를 캐싱할 수 있지만, 이는 raw key 가 아닌 세션 메타데이터(`CacheEntry`: 생성 시각, 도메인, 직렬화된 세션 바이트)이다

대안 기술:
- ***HSM***: ECDH 연산 자체가 HSM 내부에서 수행되어 키가 외부에 노출되지 않는다
- ***ARM TrustZone***: Vehicle MCU 에서 Secure World 와 Normal World 를 hardware level 로 분리한다. Key material 은 Secure World 에만 존재하며, Normal World 의 compromised OS 에서도 접근 불가능하다
- ***AMD SEV / Intel TME***: 클라우드 환경에서 memory encryption 을 통해 Tesla 서버의 key material 을 보호할 수 있다

## Session State Caching and Recovery

### Caching Session State

Tesla 명세는 Client 가 지속적으로 실행되지 않는 경우, **세션 상태를 디스크에 캐시**할 것을 권장한다.

> "If a client is not running continuously, it should cache session state to disk, along with the time difference between the local clock and the vehicle clock. Loading the session from cache removes the need to send session info requests, which reduces the latency of the first command and, when using Fleet API, reduces the number of Fleet API requests made by the client."
> — [Tesla vehicle-command protocol.md](https://github.com/teslamotors/vehicle-command/blob/main/pkg/protocol/protocol.md)

이 설계가 가능한 이유는 Client 키 c 가 static 이고, 동일 epoch 내에서 K 가 변하지 않기 때문이다. 캐시된 세션 상태에는 epoch, counter, clock_time 차이값 등이 포함되며, 이를 로드하면 handshake 없이 즉시 명령을 전송할 수 있다.

캐시가 더 이상 유효하지 않은 경우(Vehicle 재부팅으로 epoch 변경 등)에도, 아래의 동기화 오류 복구 메커니즘을 통해 자동으로 복구된다. 복구 비용은 처음부터 handshake 를 수행하는 것과 동일하므로, **낙관적으로 캐시가 유효하다고 가정하는 전략에 패널티가 없다**.

Tesla SDK 에서는 `TESLA_CACHE_FILE` 환경 변수로 세션 캐시 파일 경로를 지정한다.

### Recovering from Synchronization Errors

Vehicle 도메인이 재부팅되면 epoch 가 변경되어 Client 와 Vehicle 의 세션 상태가 불일치할 수 있다. Tesla 명세는 이 상황에 대한 구체적인 복구 규칙을 정의한다.

Vehicle 은 인증 오류가 동기화 문제에 기인할 수 있는 경우, **오류 메시지에 최신 세션 상태를 포함**하여 응답한다. Client 는 수신한 세션 정보를 다음 조건에 따라 처리해야 한다:

**세션 정보를 폐기(discard)해야 하는 경우:**

- 해당 request UUID 를 최근 몇 초 이내에 사용하지 않은 경우 (위조된 응답 가능성)
- session_info HMAC 태그가 올바르지 않은 경우 (변조된 응답)
- 동일 epoch 에서 이전에 인증된 session_info 의 clock_time 보다 clock_time 이 더 이른 경우 (시간 역행)

**세션 정보를 업데이트해야 하는 경우:**

위 조건이 모두 거짓이면 세션 상태를 업데이트한다. 단, **epoch 가 변경되지 않는 한 anti-replay counter 를 롤백(rollback)해서는 안 된다**. 이 규칙은 보안 요구사항이 아니라(Vehicle 이 replay 된 메시지 거부의 책임을 지므로), 불안정한 네트워크 환경에서 Client 가 더 안정적으로 동작하기 위한 것이다.

## Response Handling

### Response Decryption (FLAG_ENCRYPT_RESPONSE)

Tesla 명세는 Client 가 항상 `FLAG_ENCRYPT_RESPONSE` 비트를 설정할 것을 권장한다.

> "Clients should always set the `FLAG_ENCRYPT_RESPONSE` bit, which instructs vehicles with compatible firmware (2024.38+) to encrypt the response."
> — [Tesla vehicle-command protocol.md](https://github.com/teslamotors/vehicle-command/blob/main/pkg/protocol/protocol.md)

응답이 `signature_data.AES_GCM_Response_data` 필드를 포함하면 `protobuf_message_as_bytes` 페이로드가 암호화된 것이다. 해당 필드가 없으면 평문이다. 구 펌웨어(2024.38 미만) 차량은 이 플래그를 무시하므로, Client 는 펌웨어 버전을 확인하지 않고 항상 설정할 수 있다.

응답 복호화를 위해 Client 는 **Request Hash** 를 계산해야 한다:

- Request Hash = 1바이트(인증 방식) + 요청의 authentication tag
- VCSEC 도메인의 경우 Request Hash 는 17바이트로 절단 (1바이트 + tag 의 앞 16바이트)
- 이 값은 응답 복호화 시 AAD(Associated Authenticated Data) metadata 에 포함된다

### Counter Verification for Responses

Client 는 응답에 포함된 counter 값이 **동일 요청에 대한 이전 응답에서 사용되지 않았는지** 반드시 검증해야 한다.

> "Clients that fail to implement this check are vulnerable to replay attacks."
> — [Tesla vehicle-command protocol.md](https://github.com/teslamotors/vehicle-command/blob/main/pkg/protocol/protocol.md)

하나의 요청이 여러 응답을 유발할 수 있으며, 응답이 순서대로 도착하지 않을 수 있다. 따라서 Client 는 요청별로 수신한 응답 counter 의 집합을 관리하여 replay 를 감지해야 한다.

### VCSEC Application-Layer Responses

VCSEC 도메인은 하나의 요청에 대해 **최대 3개의 응답**을 전송할 수 있다. Fleet API 를 사용하는 Client 는 최종 응답만 수신하지만, **BLE Client 는 어떤 응답이 최종인지 판단하는 별도 로직**이 필요하다.

| 응답 유형 | 의미 | Client 처리 |
|-----------|------|-------------|
| `OPERATIONSTATUS_WAIT` | NFC 카드 탭 대기 중 (키 페어링 시), 또는 VCSEC 이 다른 요청을 처리 중 | 대기 후 재시도 |
| `OPERATIONSTATUS_ERROR` | 레거시 Client 를 위한 호환성 메시지 | **무시** — 후속 메시지에서 더 구체적인 에러 코드가 온다 |
| `whitelistOperationStatus` 설정됨 | 키 등록/삭제 요청의 최종 응답 | 처리 완료 |
| 빈 메시지(empty) | 비-whitelist 작업의 성공 | 성공으로 처리 |
| `nominalError` 설정됨 | 비-whitelist 작업의 에러 | 에러 처리 |

VCSEC 은 메모리 제약으로 인해 응답의 `request_uuid` 필드를 일반적으로 설정하지 않는다. 따라서 Client 는 VCSEC 도메인에 대한 **동시 요청을 피해야** 한다.

## Links

- [Tesla Vehicle Command SDK (GitHub)](https://github.com/teslamotors/vehicle-command)
- [Tesla Fleet API Documentation](https://developer.tesla.com/docs/fleet-api)
- [Tesla Fleet Telemetry (GitHub)](https://github.com/teslamotors/fleet-telemetry)
- [NIST SP 800-38D: AES-GCM](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [RFC 5869: HKDF](https://datatracker.ietf.org/doc/html/rfc5869)
- [RFC 4302: IPsec Anti-Replay](https://datatracker.ietf.org/doc/html/rfc4302)

## References

- NIST FIPS 197: Advanced Encryption Standard (AES)
- NIST SP 800-38D: Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC
- NIST SP 800-108: Recommendation for Key Derivation Using Pseudorandom Functions
- SEC 1: Elliptic Curve Cryptography, Certicom Research
- RFC 5869: HMAC-based Extract-and-Expand Key Derivation Function (HKDF)
- RFC 9293: Transmission Control Protocol (TCP)
- Saltzer, Reed, Clark, "End-to-End Arguments in System Design", ACM TOCS, 1984
- Halderman et al., "Lest We Remember: Cold Boot Attacks on Encryption Keys", USENIX Security 2008
- Stevens et al., "The First Collision for Full SHA-1", CRYPTO 2017
