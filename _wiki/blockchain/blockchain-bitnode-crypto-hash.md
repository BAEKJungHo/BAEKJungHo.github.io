---
layout  : wiki
title   : BITCOIN NODE - Hash
summary : 
date    : 2026-01-12 17:54:32 +0900
updated : 2026-01-12 18:15:24 +0900
tag     : blockchain bitcoin tdd
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
toy     : Bitcoin
---
* TOC
{:toc}

# BITCOIN NODE - Hash

비트코인이 필요로 하는 해시 함수의 특성은 다음과 같다.

| 속성 | 설명 | 비트코인에서의 활용 |
|------|------|-------------------|
| **결정론적 (Deterministic)** | 같은 입력 → 항상 같은 출력 | 블록 해시 재현 가능 |
| **단방향 (One-way)** | 해시 → 원본 복원 불가능 | 채굴자도 역산 불가 |
| **충돌 저항성 (Collision Resistant)** | 다른 입력 → 같은 해시 찾기 극도로 어려움 | 트랜잭션 위조 방지 |
| **눈사태 효과 (Avalanche Effect)** | 입력 1비트 변경 → 출력 50% 변경 | 블록 변조 즉시 감지 |
| **빠른 계산** | 검증은 빨라야 함 | 전체 노드 동기화 |

__실제 사례: 블록 변조 불가능성__:

```
Original Block Header:
  Version: 0x01
  Previous Hash: 0x000...000
  Merkle Root: 0x3ba3ed...
  → Block Hash: 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
    (19개의 선행 0 비트 = 난이도 증명)

악의적인 변조 시도 (Merkle Root 1비트만 변경):
  Version: 0x01
  Previous Hash: 0x000...000
  Merkle Root: 0x3ba3ec... (마지막 비트 변경)
  → Block Hash: 8c3e9a4f2b7d6e1c0f8a5b9c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e
    (선행 0 없음 = 난이도 미달, 거부됨!)

💡 1비트 변경 → 완전히 다른 해시 → 채굴 처음부터 다시!
```

## The hash functions Bitcoin uses

### SHA-256 (Secure Hash Algorithm 256-bit), Double SHA-256

비트코인에서는 ***[SHA-256](https://en.wikipedia.org/wiki/SHA-2)*** 을 항상 두번 사용(DoubleSHA256) 한다. 

두 번 해시하는 이유는 다음과 같다.

길이 확장 공격은 주로 `H(Key || Message)` 형태의 ***MAC(Message Authentication Code)*** 구성에서 치명적이다.
비트코인은 비밀 키를 해시 입력값으로 쓰지 않으므로 직접적인 위협은 아니지만, "SHA-256 의 내부 상태가 노출되는 것을 막고, 향후 발견될 수 있는 모든 종류의 확장 공격을 원천 차단하기 위해"
Double Hash 를 채택했다.  즉, ***한 번 더 해시함으로써 원래 메시지의 내부 상태를 완전히 가리는 것***이다.

```
H1 = SHA256(message)
H2 = SHA256(H1)

# H2는 더 이상 message 길이, 패딩 구조, 내부 상태를 전혀 드러내지 않음
# 완전히 “고정 길이 랜덤값”으로 바뀜
```

__Bitcoin 에서 Double SHA256이 사용되는 곳__:

```
hash = SHA256(SHA256(data))
```

***[블록의 식별자인 '블록 해시(Block Hash)' 또한 Double Hash 를 사용](https://klarciel.net/wiki/blockchain/blockchain-merkle-tree/)*** 한다.

| 용도          | 이유         |
| ----------- | ---------- |
| Block Hash  | PoW 비교용 정수 |
| TXID        | 트랜잭션 식별자   |
| Merkle Tree | 트리 내부 노드   |
