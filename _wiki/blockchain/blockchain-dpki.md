---
layout  : wiki
title   : DPKI
summary :
date    : 2026-03-01 10:54:32 +0900
updated : 2026-03-01 12:15:24 +0900
tag     : blockchain security cryptography architecture
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

# Enterprise-Grade DPKI: Decentralized PKI

## CS Level Fundamentals

### Asymmetric Cryptography: RSA and ECC

***Asymmetric Cryptography*** 는 서로 다른 두 개의 키(공개키, 개인키)를 사용하는 암호화 방식이다. 공개키로 암호화한 데이터는 개인키로만 복호화할 수 있고, 개인키로 서명한 데이터는 공개키로 검증할 수 있다.

***RSA*** 는 두 개의 큰 소수(prime number)를 곱하여 합성수를 만드는 것은 쉽지만, 그 합성수를 다시 소인수분해하는 것은 계산적으로 극히 어렵다는 수학적 원리에 기반한다. 예를 들어, 두 소수 p와 q의 곱 n = p × q 를 구하는 것은 간단하지만, 충분히 큰 n이 주어졌을 때 p와 q를 역산하는 것은 현재 알려진 알고리즘으로는 비현실적인 시간이 소요된다.

***ECC(Elliptic Curve Cryptography)*** 는 타원 곡선 이산 로그 문제(Elliptic Curve Discrete Logarithm Problem, ECDLP)에 기반한다. 타원 곡선 위의 점 P와 스칼라 k가 주어졌을 때 Q = kP 를 계산하는 것은 쉽지만, Q와 P가 주어졌을 때 k를 역산하는 것은 계산적으로 매우 어렵다. 이 문제의 난이도가 RSA의 소인수분해보다 훨씬 높기 때문에, 동일한 보안 수준을 더 짧은 키 길이로 달성할 수 있다.

| Property | RSA | ECC |
|----------|-----|-----|
| Mathematical Basis | Integer factorization | Elliptic curve discrete logarithm |
| 128-bit Security Key Length | 3072 bits | 256 bits |
| 256-bit Security Key Length | 15360 bits | 512 bits |
| Performance | 상대적으로 느림 | 빠름 (짧은 키 연산) |
| Bandwidth | 키와 서명 크기가 큼 | 키와 서명 크기가 작음 |
| Adoption | 레거시 시스템에 광범위 | 최신 시스템, 모바일, IoT |
| Standards | PKCS#1, FIPS 186 | NIST P-256, secp256k1, Ed25519 |

현대 시스템에서 ECC가 선호되는 이유는 명확하다. 동일한 보안 강도에서 키 길이가 RSA 대비 1/10 이하로 줄어들어, 연산 속도가 빠르고 네트워크 대역폭 소모가 적다. Hyperledger Fabric은 기본적으로 ECDSA(secp256r1)를 사용하며, 이는 DPKI에서 인증서 서명과 검증의 효율성에 직접적인 영향을 준다.

### Digital Signature

***Digital Signature*** 는 메시지의 무결성(integrity)과 발신자의 인증(authentication)을 동시에 보장하는 암호화 메커니즘이다. 전자서명은 비대칭키 암호화의 핵심 응용이다.

서명 과정은 다음과 같다. 먼저 원본 데이터를 해시 함수로 고정 길이의 다이제스트(digest)로 변환한다. 그 다음 이 해시값을 서명자의 개인키(private key)로 암호화하면, 이것이 디지털 서명이 된다.

검증 과정에서는 수신자가 서명을 발신자의 공개키(public key)로 복호화하여 해시값을 얻고, 수신한 원본 데이터를 동일한 해시 함수로 해싱한 결과와 비교한다. 두 해시값이 일치하면 데이터가 변조되지 않았고, 해당 개인키의 소유자가 서명했음이 증명된다.

```
Digital Signature Flow
=====================

[Signing Process]

  Original Data ──→ Hash Function ──→ Hash Digest
                                          │
                         Private Key ─────┘
                                          ↓
                                    ┌───────────┐
                                    │ Signature  │
                                    └───────────┘

[Verification Process]

  Original Data ──→ Hash Function ──→ Hash Digest (A)
                                          │
  Signature ──→ Public Key Decrypt ──→ Hash Digest (B)
                                          │
                                    A == B ?
                                    ├─ YES → Valid (무결성 + 인증 확인)
                                    └─ NO  → Invalid (변조 감지)
```

DPKI 시스템에서 디지털 서명은 인증서 발급, 트랜잭션 승인, 체인코드 실행 등 모든 핵심 동작의 신뢰 기반이 된다.

### Hash Functions

***Hash Function*** 은 임의 길이의 입력 데이터를 고정 길이의 출력값(해시값, digest)으로 변환하는 단방향 함수이다. ***SHA-256*** 은 현재 가장 널리 사용되는 암호학적 해시 함수로, 다음의 핵심 속성을 가진다.

- **Deterministic**: 동일한 입력은 항상 동일한 256비트 출력을 생성한다
- **One-way (Preimage Resistance)**: 해시값으로부터 원본 입력을 역산하는 것이 계산적으로 불가능하다
- **Collision Resistance**: 동일한 해시값을 생성하는 서로 다른 두 입력을 찾는 것이 계산적으로 불가능하다
- **Avalanche Effect**: 입력의 1비트만 변경되어도 출력의 약 50%가 변경된다

PKI에서 해시 함수는 인증서의 ***fingerprint*** 생성에 사용된다. 인증서 전체 내용을 SHA-256으로 해싱한 값이 해당 인증서의 고유 식별자 역할을 한다. 블록체인에서는 블록 해시, 트랜잭션 해시, Merkle Tree 구성 등에 활용되어 데이터의 무결성을 보장한다.

<mark><em><strong>DPKI에서 SHA-256은 인증서 해시를 블록체인에 앵커링하는 핵심 메커니즘으로, 인증서의 무결성을 탈중앙화된 방식으로 검증할 수 있게 한다.</strong></em></mark>

### Chain of Trust

***Chain of Trust*** 는 인증서의 신뢰를 계층적으로 연결하는 구조이다. 최상위 ***Root CA*** 의 자체 서명 인증서(self-signed certificate)를 시작으로, 중간 CA, 최종 엔티티 인증서까지 서명의 연쇄가 형성된다.

```
Chain of Trust
==============

┌─────────────────────────────────┐
│         Root CA Certificate     │  ← Self-signed, Trust Anchor
│   Issuer: Root CA               │
│   Subject: Root CA              │
│   Signed by: Root CA (자체서명) │
└──────────────┬──────────────────┘
               │ signs
               ↓
┌─────────────────────────────────┐
│    Intermediate CA Certificate  │  ← Root CA가 서명
│   Issuer: Root CA               │
│   Subject: Intermediate CA      │
│   Signed by: Root CA            │
└──────────────┬──────────────────┘
               │ signs
               ↓
┌─────────────────────────────────┐
│    End-Entity Certificate       │  ← Intermediate CA가 서명
│   Issuer: Intermediate CA       │
│   Subject: example.com          │
│   Signed by: Intermediate CA    │
└─────────────────────────────────┘
```

브라우저나 OS는 ***Trust Store*** 에 미리 설치된 Root CA 인증서 목록을 보유하고 있다. 서버로부터 인증서를 수신하면, 해당 인증서의 서명을 발급자의 공개키로 검증하고, 이를 체인의 상위로 반복하여 Trust Store의 Root CA까지 도달하면 신뢰가 확립된다.

전통적 PKI의 근본적 한계는 이 Trust Store가 중앙 집중적으로 관리된다는 점이다. Root CA가 침해되거나, Trust Store 관리 주체(브라우저 벤더, OS 벤더)의 정책 변경이 전체 신뢰 체계에 영향을 미친다. DPKI는 이 중앙 집중적 Trust Anchor를 분산 원장으로 대체하는 것을 목표로 한다.

### CRL and OCSP

인증서가 유효 기간 만료 전에 폐기되어야 하는 경우(개인키 유출, 소속 변경 등), 폐기 상태를 전파하는 메커니즘이 필요하다.

***CRL(Certificate Revocation List)*** 은 CA가 주기적으로 발행하는 폐기된 인증서 목록이다. 클라이언트는 이 목록을 다운로드하여 인증서의 폐기 여부를 확인한다. 문제는 CRL이 주기적으로(보통 수 시간~수 일) 갱신되므로, 인증서가 폐기된 직후에는 클라이언트가 이를 인지하지 못하는 ***freshness gap*** 이 존재한다는 것이다. 또한 CRL의 크기가 커질수록 다운로드와 파싱에 시간이 소요된다.

***OCSP(Online Certificate Status Protocol)*** 는 이 문제를 해결하기 위해 실시간 질의 방식을 도입한다. 클라이언트가 특정 인증서의 상태를 OCSP Responder에 직접 질의하면, Responder가 해당 인증서의 현재 상태(good, revoked, unknown)를 즉시 응답한다.

***OCSP Stapling*** 은 OCSP의 프라이버시 문제(클라이언트가 어떤 인증서를 검증하는지 OCSP Responder가 알 수 있음)와 성능 문제를 개선한 방식이다. 서버가 OCSP Responder로부터 미리 서명된 응답을 받아두고, TLS 핸드셰이크 시 이를 클라이언트에게 함께 전달(staple)한다.

| Property | CRL | OCSP | OCSP Stapling |
|----------|-----|------|---------------|
| Mechanism | 주기적 목록 다운로드 | 실시간 질의-응답 | 서버가 응답을 미리 확보 |
| Freshness | 낮음 (갱신 주기에 의존) | 높음 (실시간) | 높음 (캐시 주기에 의존) |
| Privacy | 양호 (로컬 확인) | 취약 (Responder가 질의 대상 인식) | 양호 (Responder에 질의 불필요) |
| Performance | 대규모 CRL 시 느림 | 매 요청마다 네트워크 호출 | 효율적 (TLS 핸드셰이크에 포함) |
| Single Point of Failure | CA 배포 서버 | OCSP Responder | 서버가 캐시하므로 완화 |
| Scalability | CRL 크기 증가 문제 | Responder 부하 | 서버 분산 처리 가능 |

DPKI에서는 블록체인 원장이 CRL과 OCSP를 모두 대체한다. 인증서 상태 변경이 트랜잭션으로 기록되고 블록 합의를 통해 전파되므로, 별도의 폐기 목록이나 실시간 질의 인프라가 불필요해진다.

### X.509 Certificate Structure

***X.509*** 는 공개키 인증서의 표준 형식으로, ITU-T에서 정의한다. 현재 v3이 가장 널리 사용된다.

```
X.509 v3 Certificate Structure
==============================

┌───────────────────────────────────────────┐
│ Certificate                               │
├───────────────────────────────────────────┤
│ Version:             v3 (0x2)             │
│ Serial Number:       고유 일련번호        │
│ Signature Algorithm: SHA256withECDSA      │
│ Issuer:              CN=Intermediate CA   │
│ Validity                                  │
│   ├─ Not Before:     2026-01-01 00:00 UTC │
│   └─ Not After:      2027-01-01 00:00 UTC │
│ Subject:             CN=example.com       │
│ Subject Public Key Info                   │
│   ├─ Algorithm:      EC (P-256)           │
│   └─ Public Key:     (hex encoded)        │
│ Extensions (v3)                           │
│   ├─ Key Usage:      digitalSignature     │
│   ├─ Extended Key Usage: serverAuth       │
│   ├─ Subject Alt Name: example.com        │
│   ├─ Authority Key ID: (hash)             │
│   ├─ Subject Key ID:   (hash)             │
│   ├─ Basic Constraints: CA:FALSE          │
│   └─ CRL Distribution Points: (URL)      │
├───────────────────────────────────────────┤
│ Signature Algorithm: SHA256withECDSA      │
│ Signature Value:     (발급 CA의 서명)     │
└───────────────────────────────────────────┘
```

핵심 필드를 설명하면:

- **Version**: 인증서 형식 버전. v3은 Extensions 지원
- **Serial Number**: 발급 CA 내에서 고유한 인증서 식별자
- **Issuer**: 인증서를 발급한 CA의 DN(Distinguished Name)
- **Validity**: 인증서의 유효 기간(Not Before ~ Not After)
- **Subject**: 인증서 소유자의 DN
- **Subject Public Key Info**: 소유자의 공개키와 알고리즘
- **Extensions**: Key Usage, SAN 등 추가 제약 및 정보
- **Signature**: 발급 CA가 위 모든 내용에 대해 생성한 디지털 서명

DPKI에서 X.509 인증서는 그대로 사용되지만, 인증서의 해시가 블록체인에 앵커링되어 중앙 CA에 의존하지 않는 무결성 검증이 가능해진다.

### CA Hierarchy

***CA(Certificate Authority) Hierarchy*** 는 인증서 발급 권한을 계층적으로 분리하여 보안과 운영 효율성을 동시에 확보하는 구조이다.

- ***Root CA***: 계층의 최상위로, 자체 서명 인증서를 보유한다. 오프라인으로 운영되며 HSM에 격리하는 것이 일반적이다. Root CA의 개인키 침해는 전체 PKI의 붕괴를 의미하므로, 극도로 제한된 환경에서만 접근한다
- ***Intermediate CA***: Root CA가 서명하여 발급한 CA이다. 실제 운영에서 인증서 발급을 담당하거나, 하위 CA에게 발급 권한을 위임한다. Root CA를 오프라인으로 격리할 수 있게 하는 핵심 구조적 장치이다
- ***Issuing CA***: 최종 엔티티(서버, 클라이언트, 사용자) 인증서를 직접 발급하는 CA이다. 보통 Intermediate CA가 이 역할을 겸한다

***Cross-certification*** 은 서로 다른 PKI 계층의 Root CA 간에 상호 인증서를 발급하여 신뢰 도메인을 연결하는 방식이다. 기업 간 통합이나 인수합병 시 기존 PKI 인프라를 유지하면서 상호 신뢰를 구축할 때 사용된다.

Intermediate CA가 존재하는 이유는 Root CA의 격리(isolation)이다. Root CA의 개인키가 온라인 시스템에 노출되면, 공격자가 해당 키로 임의의 인증서를 발급할 수 있다. Intermediate CA를 두면 Root CA를 물리적으로 오프라인에 격리하면서도 일상적인 인증서 발급 운영이 가능하다. Intermediate CA가 침해되면 해당 CA만 폐기하고 Root CA로 새 Intermediate CA를 발급하면 된다.

### HSM (Hardware Security Module)

***HSM(Hardware Security Module)*** 은 암호화 키를 생성, 저장, 사용하는 전용 하드웨어 장치이다. 키가 HSM 내부에서만 존재하고 외부로 추출이 불가능하도록 설계되어 있다.

***FIPS 140-2*** 는 미국 NIST가 정의한 암호화 모듈 보안 표준으로, Level 1부터 Level 4까지 4단계로 구분된다. PKI 운영에서는 최소 Level 3 이상이 요구되는데, Level 3은 물리적 탬퍼링(tampering) 시도를 감지하고 키를 자동 삭제하는 능력을 포함한다.

HSM이 CA 운영에서 핵심적인 이유:

- **키 보호**: Root CA와 Intermediate CA의 개인키를 HSM에 저장하여 소프트웨어 레벨의 키 유출을 방지한다
- **서명 연산**: 인증서 서명이 HSM 내부에서 수행되므로, 개인키가 메모리에 로드되지 않는다
- **감사 추적**: 모든 키 사용 기록이 HSM 내부에 로깅되어 규제 준수를 지원한다
- **성능**: 전용 암호화 프로세서가 소프트웨어 구현 대비 높은 처리량을 제공한다

DPKI에서 HSM은 Hyperledger Fabric 피어와 Vault 서버의 키 관리에 활용된다. Fabric은 BCCSP(Blockchain Crypto Service Provider)를 통해 PKCS#11 인터페이스로 HSM과 연동할 수 있다.

### Symmetric vs Asymmetric Keys

***Symmetric Key Cryptography*** 는 암호화와 복호화에 동일한 키를 사용하는 방식이다. AES-256이 대표적이다. ***Asymmetric Key Cryptography*** 는 공개키와 개인키 쌍을 사용하며, RSA와 ECC가 대표적이다.

| Property | Symmetric (AES-256) | Asymmetric (ECC P-256) |
|----------|---------------------|------------------------|
| Key Count | 1개 (공유 비밀) | 2개 (공개키 + 개인키) |
| Speed | 매우 빠름 | 상대적으로 느림 (100~1000x) |
| Key Distribution | 안전한 사전 공유 필요 | 공개키 자유 배포 가능 |
| Use Case | 대량 데이터 암호화 | 키 교환, 서명, 인증 |
| Key Length (128-bit security) | 128 bits | 256 bits |

실무에서는 ***Hybrid Encryption*** 이 표준이다. TLS 핸드셰이크가 대표적인 예시이다:

1. 클라이언트와 서버가 비대칭키(ECDHE)로 세션 키를 안전하게 교환한다
2. 교환된 세션 키(대칭키, AES-256-GCM)로 실제 데이터를 암호화한다
3. 비대칭키의 안전한 키 교환 능력과 대칭키의 빠른 암호화 성능을 결합한다

DPKI에서도 동일한 원리가 적용된다. 인증서 서명과 검증에는 비대칭키(ECDSA)를, 네트워크 통신 암호화에는 대칭키(AES)를 사용한다.

### Raft Consensus

***Raft*** 는 분산 시스템에서 노드 간 합의를 달성하기 위한 합의 알고리즘이다. Paxos의 복잡성을 해결하기 위해 설계되었으며, 이해 용이성(understandability)을 핵심 설계 목표로 한다.

Raft의 세 가지 핵심 메커니즘:

**Leader Election**: 클러스터의 모든 노드는 Leader, Follower, Candidate 중 하나의 상태를 가진다. Leader가 일정 시간(election timeout) 내에 heartbeat를 보내지 않으면, Follower가 Candidate로 전환되어 새로운 투표(election term)를 시작한다. 과반수의 투표를 얻은 Candidate가 새 Leader가 된다.

**Log Replication**: 모든 상태 변경은 Leader가 로그 엔트리로 기록하고, Follower들에게 복제한다. 과반수의 Follower가 해당 엔트리를 수신했음을 확인하면, Leader는 그 엔트리를 커밋하고 상태 머신에 적용한다.

**Safety**: Raft는 커밋된 엔트리가 절대 손실되지 않음을 보장한다. Leader 선출 시 가장 최신의 커밋된 로그를 가진 노드만 Leader가 될 수 있도록 제약한다.

PKI 인프라에서 Raft가 중요한 이유는 HashiCorp Vault가 HA(High Availability) 모드에서 Raft를 내장 스토리지 백엔드로 사용하기 때문이다. Vault의 PKI 시크릿 엔진이 인증서를 발급하고 관리하는 상태가 Raft를 통해 클러스터 노드 간에 일관되게 복제된다.

### BFT vs Raft

***CFT(Crash Fault Tolerance)*** 와 ***BFT(Byzantine Fault Tolerance)*** 는 분산 시스템이 허용하는 장애 유형이 근본적으로 다르다.

Raft(CFT)는 노드가 단순히 중단(crash)되는 장애만을 허용한다. 노드가 거짓 응답을 보내거나 악의적으로 동작하는 경우는 처리하지 않는다. n개의 노드에서 최대 (n-1)/2 개의 노드 중단을 허용한다.

BFT는 노드가 임의의 악의적 동작(거짓 메시지, 선택적 메시지 누락, 메시지 위조 등)을 하는 경우까지 허용한다. n개의 노드에서 최대 (n-1)/3 개의 비잔틴 노드를 허용한다. 대표적인 알고리즘으로 ***PBFT(Practical Byzantine Fault Tolerance)*** 가 있다.

| Property | Raft (CFT) | BFT (e.g., PBFT) |
|----------|-----------|-------------------|
| Fault Model | 노드 중단(crash)만 허용 | 악의적 동작까지 허용 |
| Fault Tolerance | (n-1)/2 노드 장애 허용 | (n-1)/3 노드 장애 허용 |
| Message Complexity | O(n) per round | O(n²) per round |
| Performance | 높음 | 상대적으로 낮음 |
| Use Case | 신뢰된 환경(내부 인프라) | 비신뢰 환경(블록체인) |
| Example | Vault, etcd, Consul | Hyperledger Fabric (일부 구성) |

Hyperledger Fabric은 v2.x부터 Raft 기반 ***Ordering Service*** 를 기본으로 채택했다. 이는 Permissioned 블록체인의 특성상 참여자가 사전에 인증된 조직이므로, 악의적 동작보다는 노드 장애에 대한 내성이 더 현실적인 요구사항이기 때문이다. 다만, 조직 간 신뢰 수준이 낮은 환경에서는 BFT 기반 Ordering Service(SmartBFT 등)를 고려해야 한다.

### Key Components and Their Relationships

DPKI 시스템을 구성하는 핵심 컴포넌트와 그 관계를 설명한다.

- ***Vault***: HashiCorp Vault는 시크릿 관리 플랫폼으로, PKI Secrets Engine을 통해 인증서를 동적으로 발급한다. Root CA와 Intermediate CA의 개인키를 관리하고, 인증서의 생명주기(발급, 갱신, 폐기)를 제어한다. Raft 기반 HA 클러스터로 운영된다
- ***CouchDB***: Hyperledger Fabric의 ***World State*** 데이터베이스로 사용된다. JSON 문서 기반 스토리지로, 인증서 메타데이터에 대한 리치 쿼리(rich query)를 지원한다. 상태별, 발급자별, 기간별 인증서 조회 등 복잡한 질의가 가능하다
- ***HSM***: Vault와 Fabric 피어의 암호화 키를 하드웨어 레벨에서 보호한다. PKCS#11 인터페이스를 통해 키 생성과 서명 연산을 HSM 내부에서 수행한다
- ***Ledger***: Hyperledger Fabric의 원장으로, World State(현재 상태, CouchDB)와 Transaction Log(변경 이력, 파일 기반)로 구성된다. 인증서의 모든 상태 변경이 불변(immutable)의 트랜잭션으로 기록된다
- ***Hyperledger Fabric***: 허가형(permissioned) 블록체인 플랫폼으로, MSP(Membership Service Provider)를 통한 신원 관리, 채널 기반 데이터 격리, 체인코드 기반 비즈니스 로직 실행을 제공한다

```
DPKI Component Architecture
============================

                    ┌──────────────┐
                    │   Client     │
                    │  (RA/Admin)  │
                    └──────┬───────┘
                           │ REST API
                           ↓
               ┌───────────────────────┐
               │       Vault           │
               │  ┌─────────────────┐  │
               │  │ PKI Engine      │  │─── Certificate Issuance
               │  │ (Root/Inter CA) │  │
               │  └────────┬────────┘  │
               │           │           │
               │  ┌────────┴────────┐  │
               │  │  Raft Storage   │  │─── HA Cluster
               │  └─────────────────┘  │
               └───────────┬───────────┘
                    │              │
                    │ PKCS#11      │ Cert Hash
                    ↓              ↓
              ┌──────────┐  ┌─────────────────────────┐
              │   HSM    │  │   Hyperledger Fabric     │
              │          │  │  ┌───────────────────┐   │
              │ Key Gen  │  │  │   Smart Contract  │   │
              │ Sign Op  │  │  │   (Chaincode)     │   │
              │          │  │  └─────────┬─────────┘   │
              └──────────┘  │            │              │
                            │  ┌─────────┴─────────┐   │
                            │  │      Ledger        │   │
                            │  │ ┌───────┐┌───────┐ │   │
                            │  │ │World  ││Tx Log │ │   │
                            │  │ │State  ││       │ │   │
                            │  │ └───┬───┘└───────┘ │   │
                            │  └─────┼──────────────┘   │
                            └────────┼──────────────────┘
                                     │
                                     ↓
                              ┌────────────┐
                              │  CouchDB   │
                              │ Rich Query │
                              └────────────┘
```

이 아키텍처에서 데이터의 흐름은 다음과 같다. Vault가 인증서를 발급하면, 인증서의 SHA-256 해시가 Hyperledger Fabric의 체인코드를 통해 원장에 기록된다. 원장의 World State는 CouchDB에 저장되어 리치 쿼리를 지원하고, Transaction Log는 모든 상태 변경의 불변 이력을 유지한다. HSM은 Vault의 CA 개인키와 Fabric 피어의 서명 키를 하드웨어 레벨에서 보호한다.

### Eventual Consistency vs PKI Synchronization

전통적 PKI와 블록체인 기반 DPKI의 일관성 모델은 근본적으로 다르다.

전통적 PKI에서 인증서 폐기 정보의 전파에는 내재적 지연이 존재한다. CRL은 갱신 주기(수 시간~수 일)에 의존하고, OCSP는 실시간이지만 Responder의 가용성에 의존한다. 즉, CRL 갱신 전이나 OCSP Responder 장애 시 폐기된 인증서가 유효한 것으로 판정될 수 있는 ***window of vulnerability*** 가 존재한다.

블록체인 기반 DPKI는 ***Eventual Consistency*** 모델을 따른다. 트랜잭션이 블록에 포함되고 합의를 통해 확정되기까지의 시간(block confirmation time)이 존재한다. Hyperledger Fabric의 경우 Execute-Order-Validate 아키텍처에 따라 트랜잭션이 처리되며, 블록 생성 주기(보통 2초 이내)와 네트워크 전파 시간이 일관성 달성까지의 지연을 결정한다.

| Property | Traditional PKI (CRL) | Traditional PKI (OCSP) | Blockchain DPKI |
|----------|-----------------------|------------------------|-----------------|
| Consistency Model | Periodic refresh | Query-response | Eventual consistency |
| Propagation Delay | 수 시간 ~ 수 일 | 실시간 (네트워크 지연) | 수 초 (블록 합의) |
| Single Point of Failure | CRL 배포 서버 | OCSP Responder | 없음 (분산 합의) |
| Tamper Resistance | CA 서명에 의존 | CA 서명에 의존 | 블록체인 불변성 |
| Offline Verification | 가능 (캐시된 CRL) | 불가능 | 가능 (로컬 원장 복사본) |

<mark><em><strong>DPKI는 전통적 PKI의 "중앙 집중적 실시간성"을 블록체인의 "탈중앙화된 최종적 일관성"으로 대체하여, 단일 장애점 없이 수 초 내의 상태 전파를 달성한다.</strong></em></mark>

---

## Problems with Traditional PKI

기존 ***PKI(Public Key Infrastructure)*** 는 수십 년간 인터넷 보안의 근간이 되어 왔지만, 구조적 한계가 반복적으로 드러나고 있다. 이 섹션에서는 전통적 PKI가 가진 핵심 문제들을 구체적인 사례와 함께 분석한다.

### Single Point of Failure

전통적 PKI의 가장 근본적인 문제는 ***CA(Certificate Authority)*** 에 신뢰가 집중된다는 것이다. CA 하나가 침해되면 해당 CA가 발급한 모든 인증서의 신뢰성이 무너진다.

__DigiNotar 사건 (2011)__:

2011년 6월 17일, 네덜란드의 CA인 DigiNotar의 외부 네트워크가 최초 침해되었다. 7월 10일, 공격자는 Google 도메인에 대한 와일드카드 인증서를 포함하여 344개 도메인에 대한 **531개의 위조 인증서**를 발급했다. 이 위조 인증서는 이란에서 약 **30만 명의 Gmail 사용자**에 대한 MITM(Man-in-the-Middle) 공격에 사용되었다.

DigiNotar는 7월 19일부터 위조 인증서를 폐기하기 시작했지만, 한 달 이상 이 사실을 공개하지 않았다. 8월 29일 모든 주요 브라우저에서 DigiNotar의 Root Certificate가 제거되었고, 네덜란드 정부의 전자인증 시스템(DigiD)과 차량등록기관(RDW) 등 핵심 공공 서비스가 마비되었다. DigiNotar는 같은 해 9월 파산을 선언했다.

__Symantec 인증서 불신 (2015-2018)__:

2015년부터 Symantec의 인증서 발급 관행에 대한 문제가 제기되었다. Google의 조사 결과, 지역 인증기관에 대한 감독 부실, 필수 검증 절차 우회 허용, CA/Browser Forum 업계 표준 미준수 등이 확인되었다. Chrome 66(2018년 4월)부터 2016년 6월 이전 발급된 Symantec 인증서를 불신하기 시작했고, Chrome 70(2018년 10월)에서 **모든 Symantec 인증서에 대한 신뢰를 완전히 제거**했다. Symantec은 2017년 12월 CA 사업부를 DigiCert에 매각했다.

이 두 사건은 공통된 교훈을 남긴다:

<mark><em><strong>전통적 PKI에서 CA는 단일 장애점(Single Point of Failure)이며, 하나의 CA 침해가 전체 신뢰 체계를 붕괴시킬 수 있다.</strong></em></mark>

정부 주도의 CA 개입도 무시할 수 없는 위협이다. 일부 국가는 자국 CA를 통해 특정 도메인에 대한 인증서를 강제 발급하거나, MITM 감청 인프라를 구축한 사례가 보고되었다. 이는 CA의 신뢰 모델이 기술적 보안뿐 아니라 정치적, 법적 환경에도 종속됨을 의미한다.

### CRL Distribution Delays

***CRL(Certificate Revocation List)*** 은 폐기된 인증서의 목록을 배포하는 전통적인 메커니즘이다. RFC 5280에 따르면, CRL 갱신 주기에 대한 명시적 표준은 없으며, CA 정책에 따라 **1시간에서 1주일**까지 다양하다.

```
Timeline: 인증서 폐기 → CRL 반영

t=0        인증서 침해 발생
t=1h       관리자 인지 및 폐기 요청
t=1h~24h   CA가 다음 CRL 갱신 주기에 폐기 정보 반영
t=24h~     CRL 소비자(브라우저, 서버)가 캐시된 CRL 만료 후 새 CRL 다운로드
           ↑
           이 구간이 "취약 구간(Window of Vulnerability)"
```

일반적으로 대형 CA의 SSL/TLS 인증서 CRL은 **2-12시간** 주기로 갱신되고, 오프라인 CA는 **주 1회** 갱신이 일반적이다. 인증서 폐기 시점부터 모든 CRL 소비자가 이를 인지하기까지의 시간 차이가 바로 취약 구간이다. 이 구간 동안 폐기된 인증서는 여전히 유효한 것으로 취급된다.

CRL의 또 다른 문제는 크기 증가이다. 폐기된 인증서가 누적되면서 CRL 파일 크기가 수 MB 이상으로 커질 수 있으며, 이를 다운로드하고 파싱하는 데 상당한 대역폭과 처리 비용이 소모된다.

### Global Synchronization Challenges

대규모 조직이 여러 지역에 CA 인프라를 배포할 때, 동기화 문제가 발생한다.

| Challenge | Description |
|-----------|-------------|
| Multi-Region Deployment | 각 지역 CA 간 인증서 상태 동기화 필요 |
| Clock Synchronization | 인증서 유효기간 검증 시 시계 오차 문제 |
| Database Replication Lag | CA 데이터베이스 복제 지연으로 인한 일시적 불일치 |
| Validity Period Management | 시간대별 인증서 만료 시점 관리 복잡성 |

특히 Database Replication Lag는 한 지역에서 폐기된 인증서가 다른 지역에서는 아직 유효한 것으로 표시되는 상황을 초래할 수 있다. 이는 글로벌 서비스에서 보안 허점을 만든다.

### Revocation Verification Costs

***OCSP(Online Certificate Status Protocol)*** 는 CRL의 대안으로 도입되었지만, 자체적인 문제를 가지고 있다.

__가용성 요구사항__: OCSP Responder는 99.999% 이상의 가동률이 요구된다. OCSP Responder가 다운되면 인증서 검증이 불가능해지며, 이때 두 가지 선택지가 있다:

- **Soft-fail**: OCSP 응답을 받지 못하면 인증서를 유효한 것으로 간주한다. 보안에 취약하다.
- **Hard-fail**: OCSP 응답을 받지 못하면 연결을 차단한다. 가용성에 취약하다.

대부분의 브라우저는 soft-fail 정책을 사용하는데, 이는 공격자가 OCSP 트래픽을 차단하는 것만으로 폐기된 인증서를 유효하게 만들 수 있음을 의미한다.

__Privacy 문제__: 기본 OCSP에서는 클라이언트가 인증서를 검증할 때마다 CA의 OCSP Responder에 요청을 보낸다. 이는 **CA가 사용자의 웹사이트 방문 기록을 수집할 수 있는 구조**이다.

### Trust Root Management Complexity

OS와 브라우저의 Trust Store에는 수백 개의 Root CA 인증서가 포함되어 있다. 이 Trust Store를 관리하는 것 자체가 복잡한 운영 과제이다.

- **Trust Store 업데이트**: OS 및 브라우저 벤더가 Root CA를 추가하거나 제거할 때, 모든 클라이언트에 업데이트가 전파되어야 한다
- **Root Rotation**: Root CA 키 교체는 **수 년에 걸쳐 진행**되는 프로세스이다
- **Cross-Certification**: 서로 다른 PKI 도메인 간 상호 인증을 위해 Cross-Certificate를 관리해야 하며, 이는 인증서 경로 검증의 복잡성을 크게 증가시킨다

---

## DPKI Concepts

### On-chain vs Off-chain Data Separation

DPKI 설계에서 어떤 데이터를 블록체인에 저장하고(on-chain), 어떤 데이터를 외부에 보관할 것인지(off-chain)의 결정은 핵심 아키텍처 판단이다.

**On-chain 저장 대상**:
- 인증서의 SHA-256 해시 (fingerprint)
- 인증서 상태 (ACTIVE, SUSPENDED, REVOKED, EXPIRED)
- 상태 변경 이력 및 타임스탬프
- 발급자 식별자, 시리얼 번호 등 메타데이터
- 폐기 사유 코드 (CRL Reason Code)

**Off-chain 보관 대상**:
- 실제 인증서 전문 (X.509 DER/PEM)
- 개인키 (HSM 또는 Vault에 보관)
- 인증서 요청 정보 (CSR 상세)
- 감사 로그의 상세 내용

이 분리가 필요한 이유는 세 가지이다.

첫째, **프라이버시**이다. 인증서 전문에는 Subject DN 등 민감한 식별 정보가 포함될 수 있다. 해시만 on-chain에 저장하면 원본 정보를 역산할 수 없으므로 프라이버시가 보호된다.

둘째, **성능**이다. 블록체인의 모든 노드가 전체 원장을 복제하므로, 저장 데이터량이 직접적으로 네트워크 비용과 스토리지 비용에 영향을 준다. X.509 인증서 전문(수 KB)보다 SHA-256 해시(32 bytes)를 저장하는 것이 훨씬 효율적이다.

셋째, **스토리지**이다. 블록체인 원장은 append-only로 계속 증가한다. 인증서 전문을 저장하면 원장 크기가 빠르게 증가하여 노드 운영 비용이 급등한다.

### Blockchain as Trust Anchor

전통적 PKI에서 ***Trust Anchor*** 는 Root CA의 자체 서명 인증서이다. DPKI에서 블록체인은 이 중앙 집중적 Trust Anchor를 분산 원장 합의로 대체한다. 인증서의 해시와 상태가 블록체인에 기록되면, 해당 데이터는 다음 속성을 가진다:

- **Immutability**: 한번 블록에 포함된 데이터는 변경이 불가능하다. 과반수 이상의 노드가 동시에 침해되지 않는 한, 기록된 인증서 해시나 상태를 위조할 수 없다
- **Transparency**: 모든 참여 노드가 동일한 원장을 보유하므로, 인증서 상태 변경이 투명하게 추적된다
- **Decentralized Consensus**: 단일 주체의 결정이 아닌, 분산된 노드 간 합의에 의해 인증서 상태가 결정된다

### Certificate Hash Anchoring

***Certificate Hash Anchoring*** 은 DPKI의 핵심 메커니즘으로, 인증서의 무결성을 블록체인에 고정(anchor)하는 과정이다.

```
Certificate Hash Anchoring Flow
================================

[Issuance Phase]

  Vault (CA)                Fabric Network
     │                           │
     │ 1. Issue X.509 Cert       │
     │──────────────────────→    │
     │                           │
     │ 2. SHA-256(cert) = hash   │
     │                           │
     │ 3. Submit Tx              │
     │   {certID, hash, status}  │
     │──────────────────────→    │
     │                           │
     │            4. Endorsement + Ordering + Validation
     │                           │
     │   5. Block Committed      │
     │←──────────────────────    │
     │                           │

[Verification Phase]

  Verifier                  Fabric Network
     │                           │
     │ 1. Obtain cert from       │
     │    off-chain storage      │
     │                           │
     │ 2. SHA-256(cert) = hash'  │
     │                           │
     │ 3. Query on-chain hash    │
     │──────────────────────→    │
     │                           │
     │ 4. Return stored hash     │
     │←──────────────────────    │
     │                           │
     │ 5. Compare:               │
     │    hash' == stored hash?  │
     │    ├─ YES → Cert Valid    │
     │    └─ NO  → Cert Tampered │
```

이 메커니즘의 강점은 인증서 전문을 블록체인에 저장하지 않으면서도, 인증서의 무결성을 탈중앙화된 방식으로 검증할 수 있다는 것이다.

### Smart Contract-based State Management

인증서의 생명주기는 명확한 상태 전이(state transition)로 모델링된다. 체인코드(Smart Contract)는 이 상태 전이의 규칙을 강제한다.

```
Certificate Lifecycle State Machine
=====================================

                 Issue
    ┌──────────────────────────────┐
    │                              ↓
    │   ┌────────┐  Suspend   ┌───────────┐
    │   │ ACTIVE │───────────→│ SUSPENDED │
    │   └───┬────┘            └─────┬─────┘
    │       │      Reinstate        │
    │       │  ←────────────────────┘
    │       │
    │       │ Revoke              Revoke
    │       ↓                       │
    │   ┌─────────┐                 │
    │   │ REVOKED │←────────────────┘
    │   └─────────┘
    │
    │   Expire (자동)
    │       ↓
    │   ┌─────────┐
    └──→│ EXPIRED │  (NotAfter 시각 경과)
        └─────────┘

  [Invalid Transitions - Rejected by Chaincode]
  - REVOKED → ACTIVE (폐기 취소 불가)
  - EXPIRED → ACTIVE (만료 취소 불가)
  - REVOKED → SUSPENDED (폐기 후 정지 불가)
```

<mark><em><strong>단일 주체가 일방적으로 인증서 상태를 변경할 수 없으며, 체인코드의 규칙과 Fabric의 보증 정책(Endorsement Policy)을 동시에 만족해야만 상태 변경이 원장에 반영된다.</strong></em></mark>

### Ledger-based Revocation

***Ledger-based Revocation*** 은 블록체인 원장을 인증서 폐기 정보의 유일한 출처(single source of truth)로 사용하는 방식이다. 전통적 PKI의 CRL과 OCSP를 완전히 대체한다.

전통적 폐기 메커니즘 대비 이점:

- **Near-real-time Propagation**: 블록 합의 시간(수 초) 내에 모든 피어가 폐기 상태를 인지한다
- **No Single Point of Failure**: CRL 배포 서버나 OCSP Responder 같은 단일 장애점이 없다
- **Tamper-proof History**: 폐기 기록이 블록체인에 불변으로 저장되므로, 폐기 이력의 조작이 불가능하다
- **Offline Verification**: 각 피어가 원장의 전체 복사본을 보유하므로, 외부 네트워크 연결 없이 로컬 원장 조회만으로 폐기 여부를 확인할 수 있다

---

## Enterprise Architecture Design

### Hyperledger Fabric-based DPKI Architecture

Enterprise DPKI를 구축할 때 ***[Hyperledger Fabric](https://en.wikipedia.org/wiki/Hyperledger)*** 은 가장 현실적인 선택지이다. Public Blockchain과 달리 ***Permissioned Blockchain*** 으로 동작하여 참여자 식별이 가능하고, Channel 기반의 데이터 격리를 지원하며, Pluggable Consensus를 통해 기업 환경에 맞는 합의 알고리즘을 선택할 수 있다.

__Channel Design__:

| Channel | Purpose | Participants |
|---------|---------|-------------|
| `dpki-cert-channel` | Certificate lifecycle events | All CAs, Validation Peers |
| `dpki-audit-channel` | Audit trail, compliance logging | Auditors, Compliance Nodes |
| `dpki-revocation-channel` | CRL/OCSP revocation data | All Peers (broad distribution) |
| `dpki-xorg-channel` | Cross-organization certificate trust | Partner Organization Peers |

__Peer Topology__:

```
┌─────────────────────────────────────────────────────────────┐
│                    DPKI Fabric Network                       │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │   Org1 (CA-Ops)  │    │  Org2 (Security) │              │
│  │                  │    │                  │              │
│  │  ┌────────────┐  │    │  ┌────────────┐  │              │
│  │  │ Endorsing  │  │    │  │ Endorsing  │  │              │
│  │  │  Peer 0    │──┼────┼──│  Peer 0    │  │              │
│  │  └────────────┘  │    │  └────────────┘  │              │
│  │  ┌────────────┐  │    │  ┌────────────┐  │              │
│  │  │ Committing │  │    │  │ Committing │  │              │
│  │  │  Peer 1    │  │    │  │  Peer 1    │  │              │
│  │  └────────────┘  │    │  └────────────┘  │              │
│  │  ┌────────────┐  │    │                  │              │
│  │  │  Anchor    │  │    │                  │              │
│  │  │   Peer     │  │    │                  │              │
│  │  └────────────┘  │    │                  │              │
│  └──────────────────┘    └──────────────────┘              │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │         Ordering Service (Raft)          │              │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │              │
│  │  │ OSN-1   │ │ OSN-2   │ │ OSN-3   │   │              │
│  │  │(Leader) │ │(Follower)│ │(Follower)│   │              │
│  │  └─────────┘ └─────────┘ └─────────┘   │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

- ***Endorsing Peer***: Chaincode를 실행하여 트랜잭션을 시뮬레이션하고, 실행 결과에 서명(Endorsement)을 부여한다
- ***Committing Peer***: 모든 Peer가 해당하며, Ordering Service로부터 전달받은 블록을 검증하고 원장에 기록한다
- ***Anchor Peer***: Organization 간 Gossip Protocol 통신의 진입점이다

### Vault + HSM Architecture

***[HashiCorp Vault](https://www.vaultproject.io/)*** 는 PKI Secret Engine을 통해 CA 역할을 수행할 수 있으며, ***[HSM](https://en.wikipedia.org/wiki/Hardware_security_module)*** 과 결합하면 Root Key가 소프트웨어 영역을 벗어나지 않는 하드웨어 기반 키 보호를 달성한다.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Vehicle  │  │ Code     │  │ mTLS     │  │ IoT      │       │
│  │ Key Svc  │  │ Sign Svc │  │ Gateway  │  │ Provisn  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       └──────────────┴──────┬───────┴──────────────┘             │
│                    ┌────────▼────────┐                          │
│                    │   API Gateway   │                          │
│                    │  (Rate Limit,   │                          │
│                    │   AuthN/AuthZ)  │                          │
│                    └────────┬────────┘                          │
├─────────────────────────────┼───────────────────────────────────┤
│                    Secret Management Layer                      │
│            ┌────────────────▼────────────────┐                 │
│            │       HashiCorp Vault           │                 │
│            │  ┌────────────────────────┐    │                 │
│            │  │   PKI Secret Engine    │    │                 │
│            │  │  - Root CA             │    │                 │
│            │  │  - Intermediate CAs    │    │                 │
│            │  │  - Leaf Cert Issuance  │    │                 │
│            │  └────────────────────────┘    │                 │
│            │  ┌────────────────────────┐    │                 │
│            │  │  Transit Secret Engine │    │                 │
│            │  │  - Encrypt/Decrypt     │    │                 │
│            │  │  - Key Wrapping        │    │                 │
│            │  │  - HMAC Operations     │    │                 │
│            │  └────────────────────────┘    │                 │
│            │  ┌────────────────────────┐    │                 │
│            │  │   Auto-Unseal (HSM)    │    │                 │
│            │  └────────────────────────┘    │                 │
│            └───────────────┬────────────────┘                 │
│                            │ PKCS#11                           │
│                   ┌────────▼────────┐                          │
│                   │   HSM Cluster   │                          │
│                   │  (Luna / AWS    │                          │
│                   │   CloudHSM)     │                          │
│                   │  Root Key: NEVER│                          │
│                   │  leaves HSM     │                          │
│                   └─────────────────┘                          │
├─────────────────────────────────────────────────────────────────┤
│                    Blockchain Layer                             │
│            ┌────────────────────────────────┐                 │
│            │    Hyperledger Fabric Network  │                 │
│            │    (Certificate Hash Records)  │                 │
│            └────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

<mark><em><strong>Root Private Key는 절대로 HSM 외부로 추출되어서는 안 된다. 모든 서명 연산은 HSM 내부에서 수행되며, Vault는 서명 요청만 HSM에 전달하는 중개자 역할을 한다.</strong></em></mark>

### Environment Separation: Stage vs Prod

Enterprise 환경에서 Stage와 Production의 완전한 격리는 필수이다.

| Dimension | Staging | Production |
|-----------|---------|------------|
| Fabric Network | 별도 Network 또는 격리된 Channel | 독립 Network, 전용 Orderer Cluster |
| Vault | 단일 노드, Stage Namespace | HA Cluster (3+ 노드), Prod Namespace |
| HSM | SoftHSM 또는 공유 HSM Partition | 전용 HSM Partition, FIPS 140-3 Level 3 인증 |
| Root CA | 별도 Root (Stage 전용) | Offline Root CA, 연 1회 미만 사용 |
| Certificate TTL | 짧은 주기 (1~7일) | 표준 주기 (90일~1년) |
| Chaincode | 자유로운 배포/업데이트 | 변경 관리 위원회(CAB) 승인 필수 |

중요한 점은 Stage와 Production의 ***Trust Anchor(Root CA)가 완전히 분리*** 되어야 한다는 것이다. Stage에서 발급된 인증서가 Production 환경에서 유효한 것으로 인식되면 심각한 보안 사고로 이어진다.

### CA Hierarchy Design

Enterprise급 ***CA Hierarchy*** 는 Tesla, NVIDIA, Google 등의 대규모 기술 기업이 운영하는 구조를 기반으로 설계해야 한다. 핵심은 **목적별(Purpose), 환경별(Environment), 지역별(Regional)** 분리이다.

```
Private Root CA (Offline, Air-gapped, HSM-backed)
│
├── Production Intermediate CA (Online, HSM-backed)
│   │
│   ├── Purpose CAs (용도별 분리)
│   │   ├── Vehicle Key Issuing CA
│   │   │   └── Leaf: Vehicle Digital Key Certificates
│   │   │       (Owner key, Family key, Valet key)
│   │   │
│   │   ├── Code Signing CA
│   │   │   └── Leaf: Firmware/OTA Update Signatures
│   │   │       (ECU firmware, Infotainment, ADAS models)
│   │   │
│   │   ├── TLS/mTLS CA
│   │   │   └── Leaf: Service-to-Service, API Gateway Certs
│   │   │       (Internal mTLS, External TLS)
│   │   │
│   │   └── IoT Device CA
│   │       └── Leaf: Device Identity Certificates
│   │           (Sensors, TCU, ECU, Charging Stations)
│   │
│   └── Regional CAs (지역별 분리)
│       ├── NA (North America)
│       │   └── Regional Issuing CAs
│       ├── EU (Europe)
│       │   └── Regional Issuing CAs (eIDAS 준수)
│       ├── APAC (Asia-Pacific)
│       │   └── Regional Issuing CAs
│       └── CN (China - 별도 격리)
│           └── China Issuing CAs (CSL/PIPL 준수)
│
├── Staging Intermediate CA (Online, SoftHSM)
│   └── (Production과 동일 구조, 축소 운영)
│
└── Cross-Certification CA (Partner Integration)
    ├── Partner-A Bridge CA
    └── Partner-B Bridge CA
```

각 기업의 CA Hierarchy 특성을 살펴보면 다음과 같다:

__Tesla__:
- ***Vehicle Identity Certificate***: 차량 출고 시 Secure Element에 프로비저닝되는 고유 인증서이다. VIN(Vehicle Identification Number)이 Subject에 포함된다
- ***Firmware Signing CA***: Autopilot 모델, ECU 펌웨어, OTA 업데이트 패키지에 서명한다. Code Signing은 반드시 별도 CA에서 발급해야 한다. TLS 인증서와 Code Signing 인증서를 동일 CA에서 발급하면, TLS CA가 침해되었을 때 악성 펌웨어 서명이 가능해진다

__NVIDIA__:
- ***GPU Firmware Signing***: GPU VBIOS, Driver에 서명한다. 위조된 드라이버는 Side-channel Attack의 진입점이 될 수 있어 엄격한 서명 검증이 필수이다
- ***DGX Cluster Authentication***: DGX SuperPOD 환경에서 노드 간 mTLS 통신에 사용되는 인증서를 발급한다

__Google__:
- ***Cloud KMS Integration***: Google Cloud KMS가 HSM 역할을 수행하며, CA Service(CAS)와 통합된다
- ***Certificate Transparency(CT) Log***: Spanner 기반의 분산 CT Log를 운영하여 인증서 오발급을 실시간 탐지한다
- ***BeyondCorp Device Certificate***: Zero Trust 아키텍처의 핵심으로, 기기 인증서 기반의 접근 제어를 수행한다

<mark><em><strong>블록체인은 "무엇이 발급되었는가"의 증거(해시)를 기록하는 공증인(Notary) 역할만 수행하고, 인증서 원본은 효율적인 Off-chain Storage에 보관하는 것이 Enterprise DPKI의 핵심 설계 원칙이다.</strong></em></mark>

### Certificate Issuance Transaction Flow

인증서 발급의 전체 트랜잭션 흐름을 단계별로 설명한다.

```
Client              API Gateway         Vault (PKI)        HSM           Fabric Network     Off-chain DB
  │                     │                   │               │                 │                  │
  │  1. Cert Request    │                   │               │                 │                  │
  │ ──────────────────> │                   │               │                 │                  │
  │                     │ 2. AuthN/AuthZ    │               │                 │                  │
  │                     │ (JWT/mTLS verify) │               │                 │                  │
  │                     │ 3. Issue Cert     │               │                 │                  │
  │                     │ ────────────────> │               │                 │                  │
  │                     │                   │ 4. Sign Req   │                 │                  │
  │                     │                   │ ────────────> │                 │                  │
  │                     │                   │ 5. Signature  │                 │                  │
  │                     │                   │ <──────────── │                 │                  │
  │                     │ 6. Cert + Chain   │               │                 │                  │
  │                     │ <──────────────── │               │                 │                  │
  │                     │ 7. Compute SHA-256 Hash           │                 │                  │
  │                     │ 8. Invoke Chaincode               │                 │                  │
  │                     │ ──────────────────────────────────────────────────> │                  │
  │                     │                   │               │  9. Endorse +   │                  │
  │                     │                   │               │     Commit Block│                  │
  │                     │ 10. TX Confirm    │               │                 │                  │
  │                     │ <────────────────────────────────────────────────── │                  │
  │                     │ 11. Store Full Cert (encrypted)   │                 │                  │
  │                     │ ──────────────────────────────────────────────────────────────────────>│
  │ 12. Cert + TX ID   │                   │               │                 │                  │
  │ <────────────────── │                   │               │                 │                  │
```

각 단계의 상세 설명:

- **Step 1~2**: CSR 전송 후 API Gateway에서 JWT/mTLS 기반 인증 및 RBAC 권한 확인
- **Step 3~5**: Vault PKI Engine이 인증서를 생성하고, Private Key 서명은 PKCS#11을 통해 HSM 내부에서 수행. Private Key는 HSM 밖으로 나오지 않는다
- **Step 7~9**: 인증서의 SHA-256 해시를 계산하여 Fabric Chaincode를 통해 블록에 기록
- **Step 11**: 인증서 원본을 Transit Secret Engine으로 암호화하여 Off-chain Database에 저장
- **Step 12**: 클라이언트에게 인증서와 Fabric Transaction ID를 반환

### Vehicle Digital Key Issuance Scenario

차량 디지털 키 발급은 DPKI의 대표적인 실무 적용 시나리오이다. ***[CCC(Car Connectivity Consortium)](https://carconnectivity.org/)*** Digital Key 표준을 기반으로 설명한다.

```
Car Owner           Mobile App        Backend (DPKI)      Blockchain        Vehicle (TCU)
   │                    │                   │                  │                  │
   │ 1. "디지털 키 발급"  │                   │                  │                  │
   │ ──────────────────>│                   │                  │                  │
   │                    │ 2. Identity       │                  │                  │
   │                    │    Verification   │                  │                  │
   │                    │ (KYC + Vehicle    │                  │                  │
   │                    │  Ownership Check) │                  │                  │
   │                    │ ────────────────> │                  │                  │
   │ 3. Biometric Auth  │                   │                  │                  │
   │ (Face ID/Touch ID) │                   │                  │                  │
   │ ──────────────────>│                   │                  │                  │
   │                    │ 4. Key Pair Gen   │                  │                  │
   │                    │ in Secure Element │                  │                  │
   │                    │ (TEE/SE)          │                  │                  │
   │                    │ 5. CSR + Device   │                  │                  │
   │                    │    Attestation    │                  │                  │
   │                    │ ────────────────> │                  │                  │
   │                    │                   │ 6. Issue Vehicle │                  │
   │                    │                   │    Key Cert      │                  │
   │                    │                   │ (Vault + HSM)    │                  │
   │                    │                   │ 7. Record Hash   │                  │
   │                    │                   │ ────────────────>│                  │
   │                    │ 8. Cert + Chain   │                  │                  │
   │                    │ <──────────────── │                  │                  │
   │                    │                   │ 9. Notify Vehicle│                  │
   │                    │                   │ ─────────────────────────────────> │
   │                    │ 10. NFC/BLE/UWB   │                  │                  │
   │ <──────────────────│ Key Ready         │                  │                  │
```

**Step 4. Secure Element Key Generation** 이 보안의 핵심이다. 키 쌍은 스마트폰의 ***TEE(Trusted Execution Environment)*** 또는 ***SE(Secure Element)*** 내부에서 생성되며, Private Key는 해당 하드웨어 보안 영역 밖으로 추출이 불가능하다.

__Key Delegation (가족 공유)__:

```
Owner Certificate (Full Access)
├── Family Member Certificate (Full Access, Delegated)
│   └── Signed by: Owner's Key + Backend CA Co-signature
├── Valet Certificate (Limited Access: Start/Drive only)
│   └── Constraints: Speed limit, Geo-fence, Time expiry
└── Temporary Guest Certificate (One-time use)
    └── Constraints: Single session, Auto-revoke after use
```

### Symmetric Key Lifecycle Management

DPKI 인프라에서 ***Symmetric Key*** 는 비대칭키와 보완적으로 사용된다. 주로 데이터 암호화, 세션 키, Key Wrapping에 활용되며, Vault Transit Secret Engine이 이를 관리한다.

| Phase | Method | Detail |
|-------|--------|--------|
| Generation | HSM 내부 생성 | NIST SP 800-133 준수, AES-256 기본 |
| Distribution | Key Wrapping | Asymmetric Key(RSA-OAEP, ECDH)로 Symmetric Key를 암호화하여 전달 |
| Usage | AES-256-GCM | Authenticated Encryption, Nonce 재사용 금지 |
| Rotation | 주기적 갱신 | 90일 주기 자동 회전, Vault의 `min_decryption_version` 관리 |
| Archival | 암호화 보관 | 규제 요구사항에 따라 암호화 상태로 보관 |
| Destruction | Crypto-Erase | 키 자체를 삭제하여 암호화된 데이터를 복호화 불가 상태로 만듦 |

__DPKI와 Symmetric Key의 관계__:

- **Key Wrapping**: Off-chain에 저장되는 인증서 원본은 Symmetric Key(AES-256)로 암호화된다. 이 Symmetric Key는 다시 Vault Transit Engine의 ***Key Encryption Key(KEK)*** 로 Wrapping 된다. 이 구조를 ***Envelope Encryption*** 이라 한다
- **Session Key**: 디바이스 간 통신에서 DPKI 인증서로 상호 인증 후, ***ECDH(Elliptic Curve Diffie-Hellman)*** 를 통해 Session Key를 합의한다
- **Firmware Encryption**: OTA 업데이트 패키지는 Symmetric Key로 암호화되고, 이 키는 차량의 인증서(Public Key)로 Wrapping 되어 함께 전달된다

---

## Smart Contract Design

### Go Chaincode Structure

Hyperledger Fabric의 체인코드는 Go, Java, Node.js로 작성할 수 있다. DPKI 체인코드의 핵심 구조를 Go로 설계한다.

```go
// CertificateRecord - 원장에 저장되는 인증서 레코드의 핵심 구조체
type CertificateRecord struct {
    CertID       string `json:"certID"`       // Unique certificate identifier
    SerialNumber string `json:"serialNumber"` // X.509 serial number
    Issuer       string `json:"issuer"`       // Issuing CA identifier (MSP ID)
    Subject      string `json:"subject"`      // Certificate subject DN
    CertHash     string `json:"certHash"`     // SHA-256 hash of full certificate
    Status       string `json:"status"`       // ACTIVE, SUSPENDED, REVOKED, EXPIRED
    NotBefore    string `json:"notBefore"`    // Validity start (RFC3339)
    NotAfter     string `json:"notAfter"`     // Validity end (RFC3339)
    KeyType      string `json:"keyType"`      // RSA, ECC
    CreatedAt    string `json:"createdAt"`    // Issuance timestamp
    RevokedAt    string `json:"revokedAt"`    // Revocation timestamp (empty if active)
    RevokeReason string `json:"revokeReason"` // CRL reason code (RFC 5280 Section 5.3.1)
}
```

### RegisterCA Function

CA 등록은 DPKI 시스템의 초기화 단계에서 수행되는 관리 작업이다. ***ABAC(Attribute-Based Access Control)*** 를 통해 특정 속성을 가진 주체만 CA를 등록할 수 있다.

```go
// RegisterCA - 신규 CA를 시스템에 등록
// 호출 권한: "dpki.admin" 속성을 가진 클라이언트만 허용
func (s *DPKIContract) RegisterCA(ctx contractapi.TransactionContextInterface,
    caID string, mspID string, caCertHash string) error {

    // 1. ABAC 권한 검증
    err := ctx.GetClientIdentity().AssertAttributeValue("dpki.role", "admin")
    if err != nil {
        return fmt.Errorf("unauthorized: admin role required for CA registration")
    }

    // 2. 중복 등록 방지
    existing, err := ctx.GetStub().GetState(caID)
    if existing != nil {
        return fmt.Errorf("CA already registered: %s", caID)
    }

    // 3. CA 레코드 생성 및 원장에 저장
    caRecord := CARecord{
        CAID:       caID,
        MSPID:      mspID,
        CACertHash: caCertHash,
        Status:     "ACTIVE",
        CreatedAt:  ctx.GetStub().GetTxTimestamp().AsTime().Format(time.RFC3339),
    }

    caJSON, _ := json.Marshal(caRecord)
    return ctx.GetStub().PutState(caID, caJSON)
}
```

### IssueCertificate Function

인증서 발급 함수는 Vault에서 발급된 인증서의 해시를 블록체인에 앵커링하는 과정이다.

```go
// IssueCertificate - 인증서 해시를 원장에 기록
// 호출 권한: 등록된 CA만 허용
func (s *DPKIContract) IssueCertificate(ctx contractapi.TransactionContextInterface,
    certID string, serialNumber string, subject string,
    certHash string, notBefore string, notAfter string, keyType string) error {

    // 1. 호출자가 등록된 CA인지 검증
    callerMSP, _ := ctx.GetClientIdentity().GetMSPID()
    err := ctx.GetClientIdentity().AssertAttributeValue("dpki.role", "ca")
    if err != nil {
        return fmt.Errorf("unauthorized: only registered CA can issue certificates")
    }

    // 2. 입력 검증
    if certHash == "" || len(certHash) != 64 { // SHA-256 hex = 64 chars
        return fmt.Errorf("invalid certificate hash")
    }

    // 3. 인증서 레코드 생성 및 원장에 기록
    record := CertificateRecord{
        CertID:       certID,
        SerialNumber: serialNumber,
        Issuer:       callerMSP,
        Subject:      subject,
        CertHash:     certHash,
        Status:       "ACTIVE",
        NotBefore:    notBefore,
        NotAfter:     notAfter,
        KeyType:      keyType,
        CreatedAt:    ctx.GetStub().GetTxTimestamp().AsTime().Format(time.RFC3339),
    }

    recordJSON, _ := json.Marshal(record)
    ctx.GetStub().PutState(certID, recordJSON)

    // 4. 이벤트 발행 - off-chain 시스템 알림용
    ctx.GetStub().SetEvent("CertificateIssued", recordJSON)
    return nil
}
```

### RevokeCertificate Function

인증서 폐기 함수는 상태 전이 규칙을 엄격하게 적용하여 유효한 폐기만을 허용한다.

```go
// RevokeCertificate - 인증서를 폐기 상태로 전이
func (s *DPKIContract) RevokeCertificate(ctx contractapi.TransactionContextInterface,
    certID string, reason string) error {

    // 1. 현재 상태 조회
    recordJSON, err := ctx.GetStub().GetState(certID)
    if recordJSON == nil {
        return fmt.Errorf("certificate not found: %s", certID)
    }

    var record CertificateRecord
    json.Unmarshal(recordJSON, &record)

    // 2. 상태 전이 유효성 검증
    if record.Status == "REVOKED" {
        return fmt.Errorf("certificate already revoked: %s", certID)
    }
    if record.Status == "EXPIRED" {
        return fmt.Errorf("cannot revoke expired certificate: %s", certID)
    }

    // 3. 권한 검증 - 발급 CA 또는 admin만 폐기 가능
    callerMSP, _ := ctx.GetClientIdentity().GetMSPID()
    isAdmin := ctx.GetClientIdentity().AssertAttributeValue("dpki.role", "admin") == nil
    if record.Issuer != callerMSP && !isAdmin {
        return fmt.Errorf("unauthorized: only issuing CA or admin can revoke")
    }

    // 4. 폐기 정보 기록
    now := ctx.GetStub().GetTxTimestamp().AsTime().Format(time.RFC3339)
    record.Status = "REVOKED"
    record.RevokedAt = now
    record.RevokeReason = reason // e.g., "keyCompromise", "affiliationChanged"

    updatedJSON, _ := json.Marshal(record)
    ctx.GetStub().PutState(certID, updatedJSON)

    // 5. 폐기 이벤트 발행
    ctx.GetStub().SetEvent("CertificateRevoked", updatedJSON)
    return nil
}
```

`RevokeReason` 은 RFC 5280 Section 5.3.1에 정의된 CRL Reason Code를 따른다. `CertificateRevoked` 이벤트는 off-chain 모니터링 시스템이 수신하여 즉각적인 대응(관련 시스템 접근 차단, 관리자 알림)을 트리거할 수 있다.

### CouchDB Index Strategy

Hyperledger Fabric에서 CouchDB를 World State 데이터베이스로 사용할 때, 인덱스는 쿼리 성능에 직접적인 영향을 준다. 인덱스 정의는 체인코드 배포 패키지의 `META-INF/statedb/couchdb/indexes/` 디렉토리에 JSON 파일로 포함한다.

```json
// indexIssuerStatus.json - 발급자별 + 상태별 복합 인덱스
{
    "index": {
        "fields": ["issuer", "status"]
    },
    "ddoc": "indexIssuerStatusDoc",
    "name": "indexIssuerStatus",
    "type": "json"
}
```

| Query Pattern | Index Fields | Use Case |
|---------------|-------------|----------|
| 상태별 인증서 조회 | `["status"]` | ACTIVE 인증서 목록, REVOKED 인증서 감사 |
| 발급자별 + 상태별 | `["issuer", "status"]` | 특정 CA가 발급한 활성 인증서 조회 |
| 만료 임박 인증서 | `["status", "notAfter"]` | 갱신 대상 인증서 식별 |
| 특정 기간 발급 이력 | `["issuer", "createdAt"]` | 감사 및 리포팅 |

주의할 점은, CouchDB 리치 쿼리는 ***phantom read*** 가능성이 있으므로 트랜잭션 내에서의 쓰기 연산에는 사용하지 않아야 한다는 것이다. 조회 전용(query-only) 용도로 사용하고, 상태 변경은 반드시 키 기반(GetState/PutState) 연산으로 수행해야 한다.

### ABAC Permission Model

Hyperledger Fabric의 ***MSP(Membership Service Provider)*** 는 네트워크 참여자의 신원과 권한을 관리하는 컴포넌트이다. ***ABAC(Attribute-Based Access Control)*** 은 MSP의 인증서에 포함된 속성(attribute)을 기반으로 체인코드 레벨에서 세밀한 접근 제어를 구현하는 모델이다.

```
ABAC Permission Model in DPKI
==============================

┌──────────────────────────────────────────────────┐
│                 Fabric Network                   │
│                                                  │
│  ┌──────────────┐     ┌──────────────────────┐   │
│  │  Org1 MSP    │     │  Org2 MSP            │   │
│  │  (CA Org)    │     │  (Auditor Org)       │   │
│  │              │     │                      │   │
│  │  Attributes: │     │  Attributes:         │   │
│  │  dpki.role=  │     │  dpki.role=auditor   │   │
│  │    ca/admin  │     │                      │   │
│  └──────┬───────┘     └──────────┬───────────┘   │
│         ↓                        ↓               │
│  ┌───────────────────────────────────────────┐   │
│  │           DPKI Chaincode                  │   │
│  │                                           │   │
│  │  RegisterCA()  ← dpki.role == "admin"     │   │
│  │  IssueCert()   ← dpki.role == "ca"        │   │
│  │  RevokeCert()  ← dpki.role == "ca|admin"  │   │
│  │  QueryCert()   ← dpki.role == "any"       │   │
│  │  AuditLog()    ← dpki.role == "auditor"   │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

이 모델은 ***Endorsement Policy*** 와 결합된다. 예를 들어, 인증서 폐기 트랜잭션의 Endorsement Policy를 `AND('Org1MSP.member', 'Org2MSP.member')` 로 설정하면, 체인코드 레벨의 ABAC 검증을 통과하더라도 두 조직의 피어가 모두 보증해야 트랜잭션이 유효해진다. 이 이중 검증 구조가 DPKI의 탈중앙화된 권한 관리를 실현한다.

---

## Real-world Use Cases

### Vehicle Digital Keys

***[CCC Digital Key](https://carconnectivity.org/)*** 표준은 NFC, BLE, UWB를 통한 차량 디지털 키 규격을 정의한다. DPKI는 이 디지털 키 시스템의 ***Trust Infrastructure*** 를 제공한다.

| Protocol | Range | Use Case | Security Level |
|----------|-------|----------|----------------|
| ***NFC*** | ~4cm | 도어 잠금/해제, 시동 | 물리적 근접 요구, Relay Attack 저항 |
| ***BLE*** | ~10m | Passive Entry, 차량 접근 감지 | Ranging 기반 거리 검증 필요 |
| ***UWB*** | ~30m | 정밀 위치 기반 접근, Hands-free Entry | Time-of-Flight 기반 정밀 거리 측정, Relay Attack 원천 차단 |

__Scenario 1: 스마트폰 분실__

소유자가 분실 신고를 하면, 해당 디바이스에 발급된 모든 Vehicle Key Certificate가 즉시 폐기된다. 폐기 이벤트는 블록체인에 기록되고, 차량의 TCU(Telematics Control Unit)에 OTA로 전달된다. 차량은 다음 NFC/BLE/UWB 접촉 시 인증서의 블록체인 폐기 상태를 확인하고 접근을 거부한다.

__Scenario 2: 차량 판매__

소유권 이전 시 이전 소유자의 모든 인증서 체인(가족 포함)이 일괄 폐기된다. 신규 소유자에게는 새로운 Root of Trust에서 인증서가 발급된다. 블록체인은 소유권 변경 이력을 불변으로 기록한다.

### IoT Device Authentication

대규모 IoT 디바이스 환경에서 ***Device Identity Certificate*** 는 제조 단계에서 프로비저닝된다.

```
┌──────────────────────────────────────────────────┐
│              Manufacturing Line                   │
│                                                  │
│  Device Assembly → HSM Injection → Cert Provision│
│                    (Secure Key Gen)  (Device CA)  │
│                                                  │
│  Output: Device with unique identity cert in     │
│          Secure Element, hash on blockchain      │
└──────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────┐
│              Field Deployment                     │
│                                                  │
│  First Boot → Cert Validation → Service Register │
│  (mTLS)       (Blockchain hash   (Device Registry│
│                verification)      enrollment)    │
└──────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────┐
│              Decommissioning                      │
│                                                  │
│  Cert Revocation → Key Zeroization → Blockchain  │
│  (Immediate)       (Crypto-erase SE)  Record     │
└──────────────────────────────────────────────────┘
```

수백만 대의 디바이스에 인증서를 프로비저닝하려면 ***Batch Issuance*** 와 ***Lazy On-chain Recording*** 전략이 필요하다. 1,000개의 인증서 해시를 Merkle Tree로 구성하고, Root Hash만 블록체인에 기록하면 트랜잭션 수를 1/1000로 줄일 수 있다.

### B2B API Authentication

***mTLS(mutual TLS)*** 기반의 B2B API 인증은 DPKI의 핵심 적용 분야이다. 파트너 조직 간 API 통신에서 양방향 인증서 검증을 수행한다.

실무에서는 ***Local Cache + Async Blockchain Verification*** 조합이 최적이다. API Gateway에서 인증서를 로컬 캐시로 즉시 검증하고, 비동기로 블록체인 상태를 확인한다. 블록체인 Event Listener가 폐기 이벤트를 수신하면 캐시를 즉시 무효화한다.

| Validation Method | Latency | Availability | DPKI Enhancement |
|-------------------|---------|-------------|------------------|
| CRL Download | 수 초 (CRL 크기에 비례) | CA 의존 (SPOF) | Blockchain 분산 저장, 캐싱 |
| OCSP | 50~200ms | CA 의존 (SPOF) | OCSP Stapling + Blockchain Fallback |
| Blockchain Hash Check | 100~500ms | 고가용 (분산 원장) | Peer 로컬 원장 조회 |
| Local Cache + Async Verify | <10ms | 매우 높음 | 캐시 무효화를 Blockchain Event로 트리거 |

### Global Multi-Region Deployment

글로벌 규모의 DPKI 배포에서는 ***데이터 주권(Data Sovereignty)*** 과 ***네트워크 지연(Latency)*** 이 핵심 과제이다.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Global DPKI Topology                        │
│                                                                 │
│  ┌───────────────┐      ┌───────────────┐      ┌─────────────┐│
│  │   NA Region   │      │   EU Region   │      │ APAC Region ││
│  │               │      │               │      │             ││
│  │ Fabric Peers  │<────>│ Fabric Peers  │<────>│ Fabric Peers││
│  │ Vault Cluster │      │ Vault Cluster │      │ Vault Cluster│
│  │ HSM (CloudHSM)│      │ HSM (Luna)    │      │ HSM          │
│  │ Regional CA   │      │ Regional CA   │      │ Regional CA ││
│  └───────────────┘      └───────────────┘      └─────────────┘│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CN Region (Isolated)                        │  │
│  │  Fabric Network (독립)  │  Vault Cluster  │  HSM (국산)  │  │
│  │  CN Regional CA         │  CN Data only   │  SM2/SM4     │  │
│  │  Cross-border sync: Hash-only replication                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

| Regulation | Region | Requirement | DPKI Approach |
|------------|--------|-------------|---------------|
| ***GDPR*** | EU | 개인 데이터 EU 내 처리/저장 | EU Regional CA, Off-chain 데이터 EU 내 저장, Blockchain에는 해시만 |
| ***China CSL/PIPL*** | CN | 데이터 국외 이전 제한, 국산 암호 의무 | 독립 Fabric Network, SM2/SM4/SM3 사용 |
| ***CCPA*** | US(CA) | 소비자 데이터 삭제 요청 권리 | Off-chain 데이터 삭제, On-chain 해시는 개인 데이터에 해당하지 않음 |

중국 리전은 특히 주의가 필요하다. 중국 ***사이버보안법(CSL)*** 과 ***개인정보보호법(PIPL)*** 은 데이터의 국외 이전을 엄격히 제한한다. 따라서 중국 리전은 물리적으로 독립된 Fabric Network를 운영하고, 글로벌 네트워크와는 ***Hash-only Replication*** 만 수행한다.

<mark><em><strong>DR 설계의 핵심 원칙은 "Root Key의 복구 가능성"과 "Root Key의 보안"을 동시에 만족시키는 것이다. HSM 백업과 M-of-N Key Ceremony는 이 두 요구사항의 균형점이다.</strong></em></mark>

---

## Security Considerations

### Private Key Protection

<mark><em><strong>Private Key를 블록체인에 저장하면 절대 안 된다.</strong></em></mark>

블록체인의 원장(Ledger)은 네트워크 참여자 전원이 복제본을 보유하며, 원장에 기록된 데이터는 **삭제가 불가능**하다. Private Key가 한 번이라도 원장에 기록되면, 해당 키는 영구적으로 노출된 것으로 간주해야 한다.

__Split Knowledge and Dual Control__: Root CA의 Private Key는 단일 개인이 접근할 수 없도록 해야 한다.

- ***Split Knowledge***: 키를 여러 조각으로 분할하여 각각 다른 담당자가 보관
- ***Dual Control***: 키 사용 시 최소 2인 이상의 참여 필요

### Root CA Offline Operations

Root CA는 네트워크에 연결되지 않은 ***Air-gapped*** 시스템에서 운영해야 한다. Root CA를 온라인으로 운영하면 공격 표면이 극대화된다. Root CA가 침해되면 전체 PKI 트리가 무력화되므로, Root CA는 Intermediate CA 인증서 서명 시에만 활성화하고, 그 외 시간에는 물리적으로 격리된 상태를 유지해야 한다.

### HSM Integration Requirements

프로덕션 환경에서는 최소 FIPS 140-2 Level 3 이상의 HSM을 사용해야 한다. Level 3은 다음을 보장한다:

- 물리적 접근 시도에 대한 **능동적 탐지 및 대응**(tamper-detection/response)
- 변조 감지 시 **평문 CSP 자동 삭제**(zeroization)
- 강한 물리적 인클로저와 침입 센서

| 기준 | Cloud HSM | On-premises HSM |
|------|-----------|-----------------|
| 초기 비용 | 낮음(종량제) | 높음(하드웨어 구매) |
| 운영 부담 | 클라우드 제공자가 관리 | 자체 운영팀 필요 |
| 물리적 통제 | 불가 | 완전한 통제 |
| Compliance | 클라우드 제공자의 인증에 의존 | 직접 감사 가능 |
| Vendor Lock-in | 높음 | 낮음 |

### Ledger Access Control

Hyperledger Fabric의 ***Channel*** 은 특정 네트워크 구성원 간의 "private subnet" 이다. 각 Channel은 독립된 원장을 가지며, 해당 Channel에 참여하지 않은 조직은 트랜잭션 데이터를 볼 수 없다.

인증서 메타데이터 중 민감한 정보는 ***Private Data Collection*** 에 저장하여 해당 정보에 접근 권한이 있는 조직만 열람할 수 있도록 한다. 원장에는 데이터의 해시만 기록되므로 무결성은 보장되면서 기밀성도 확보할 수 있다.

### Transaction Signature Integrity

DPKI에서는 인증서 발급이나 폐기와 같은 중요한 작업에 대해 **다중 조직 보증(Multi-org Endorsement)** 정책을 설정해야 한다. 예를 들어, "3개 조직 중 2개 이상의 보증 필요(2-of-3)" 정책을 설정하면, 단일 조직의 침해로 인한 무단 폐기를 방지할 수 있다.

Raft 기반 Ordering Service를 사용할 경우, 트랜잭션 순서에 대한 합의가 이루어지면 해당 결과는 **최종적(final)** 이다. 이는 Bitcoin이나 Ethereum의 확률적 Finality와 달리, 인증서 상태 변경이 즉시 확정됨을 의미한다.

### Audit and Compliance

블록체인의 가장 명확한 보안 이점 중 하나는 ***Immutable Audit Trail*** 이다. 인증서 발급, 갱신, 폐기의 모든 이력이 변경 불가능한 원장에 기록된다.

| Framework | DPKI 관련 요구사항 |
|-----------|-------------------|
| SOC 2 | 접근 통제, 변경 관리, 가용성 모니터링 |
| ISO 27001 | 정보보안 관리 체계, 위험 평가, 암호화 통제 |
| GDPR | 개인정보 처리 최소화, Private Data Collection 활용 |
| eIDAS | 전자서명의 법적 효력, 적격 트러스트 서비스 요건 |

블록체인은 데이터를 영구적으로 보존하므로 보존 기간 요건은 자연스럽게 충족되지만, GDPR의 "잊힐 권리(Right to be Forgotten)"와는 충돌할 수 있다. 이는 Private Data Collection과 off-chain 저장소를 활용하여 해결해야 한다.

---

## Trade-offs and Limitations

### What DPKI Does NOT Solve

DPKI는 PKI 인프라의 신뢰 분산과 투명성 향상에 기여하지만, 다음과 같은 문제는 해결하지 못한다:

- **Social Engineering**: 공격자가 CA 관리자를 속여 인증서를 발급받는 공격은 DPKI로도 방지할 수 없다
- **Weak Key Generation**: 엔드포인트에서 약한 난수 생성기를 사용하여 키를 생성하는 문제는 클라이언트 구현의 문제이다
- **Operational Complexity 증가**: 기존 PKI 위에 블록체인 네트워크 운영이라는 추가적인 복잡성을 쌓는다
- **모든 조직에 DPKI가 필요한 것은 아니다**: 단일 조직 내부 PKI에서는 DPKI 도입의 비용 대비 효과가 낮을 수 있다

### Realistic Design Constraints

__Throughput 제한__: Hyperledger Fabric은 최적화된 환경에서 3,500-4,500 TPS를 달성한다. 대규모 IoT 환경이나 CDN 인증서 관리처럼 초당 수만 건의 인증서 작업이 필요한 경우, 블록체인이 병목이 될 수 있다.

__Storage Growth__: 모든 Peer 노드가 원장의 전체 복사본을 유지해야 하므로, 인증서 발급량이 증가하면 각 노드의 저장 공간 요구사항도 비례하여 증가한다.

__Governance__: 블록체인 네트워크를 누가 통제하는가? 이것은 기술적 문제가 아니라 조직적, 정치적 문제이다. 컨소시엄 구성, 의사결정 구조, 비용 분담, 분쟁 해결 메커니즘 등을 사전에 합의해야 한다.

### Common Misconceptions

__"Blockchain makes PKI trustless"__: 아니다. 신뢰가 사라지는 것이 아니라 **신뢰의 위치가 이동**한다. CA에 집중되었던 신뢰가 블록체인 네트워크의 합의 메커니즘, Endorsement Policy, 네트워크 거버넌스 참여자들에게 분산된다.

__"DPKI eliminates the need for CAs"__: 아니다. DPKI에서도 인증서를 발급하는 주체(CA)는 여전히 존재한다. 다만 CA의 행위가 블록체인에 기록되어 투명하게 감사될 수 있다.

__"On-chain = more secure"__: 반드시 그런 것은 아니다. Smart Contract 취약점, 합의 알고리즘 공격, 네트워크 레벨 공격 등 새로운 위협이 생긴다. 보안이 "더 높아지는" 것이 아니라 "다른 형태의 보안"이 필요해지는 것이다.

__"Decentralized = no governance needed"__: 오히려 **더 많은 거버넌스가 필요**하다. 분산 시스템에서는 다수 참여자 간의 합의, 정책 수립, 분쟁 해결, 네트워크 업그레이드 절차 등이 모두 거버넌스 프레임워크 아래서 관리되어야 한다.

### When to Use DPKI vs Traditional PKI

| 기준 | Traditional PKI 적합 | DPKI 적합 |
|------|---------------------|-----------|
| 조직 수 | 단일 조직 또는 소수 | 다수 조직 컨소시엄 |
| 신뢰 모델 | 중앙 집중 가능 | 단일 신뢰점 불가 |
| 감사 요구사항 | 일반적 수준 | 높은 투명성 및 추적성 요구 |
| 운영 역량 | 제한적 | 블록체인 운영 가능 |
| 규제 환경 | 기존 PKI 기반 규제 | Cross-border 또는 다중 관할권 |

현실적으로 가장 실용적인 접근은 ***Hybrid Approach*** 일 수 있다. 기존 PKI 인프라는 유지하면서, 인증서 상태 정보와 감사 로그만 블록체인에 기록하는 방식이다.

---

# Links

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [HashiCorp Vault PKI Secrets Engine](https://developer.hashicorp.com/vault/docs/secrets/pki)
- [CCC Digital Key Specification](https://carconnectivity.org/digital-key/)
- [NIST SP 800-57: Key Management](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)

# References

- A Semi-Decentralized PKI Based on Blockchain With a Stake-Based Reward-Punishment Mechanism, IEEE Access, 2024
- RFC 5280: Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile
- RFC 6960: X.509 Internet Public Key Infrastructure Online Certificate Status Protocol (OCSP)
- FIPS 140-2: Security Requirements for Cryptographic Modules, NIST
- Hyperledger Fabric: A Distributed Operating System for Permissioned Blockchains, EuroSys 2018
