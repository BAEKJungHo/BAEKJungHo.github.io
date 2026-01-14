---
layout  : wiki
title   : BITCOIN NODE - Double Hash
summary : Bitcoin Address, Genesis Block
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

비트코인이 필요로 하는 ***[해시 함수(Hash Function)](https://klarciel.net/wiki/altorithm/algorithm-hash/)*** 의 특성은 다음과 같다.

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

***[블록의 식별자인 '블록 해시(Block Hash)' 또한 Double Hash 를 사용](https://klarciel.net/wiki/blockchain/blockchain-merkle-tree/)*** 한다.

| 용도 | 설명 | 예시 |
|------|------|------|
| **Block Hash** | Proof-of-Work 대상 | Genesis: `000000000019d6...` |
| **Transaction ID (TXID)** | 트랜잭션 고유 식별자 | `3ba3edfd7a7b12b2...` |
| **Merkle Tree Node** | 트랜잭션 집계 | 부모 = H(left\|\|right) |

__공식__:

```
DoubleSHA256(x) = SHA-256(SHA-256(x))
```

## RIPEMD-160

Bitcoin은 공개키를 해시하여 비트코인 주소로 사용한다.

__공식__:

```
HASH160(pubkey) = RIPEMD160(SHA256(pubkey))

┌────────────────────────────────┐
│  Public Key (65 bytes)         │
│       ↓                        │
│  SHA-256 (32 bytes)            │
│       ↓                        │
│  RIPEMD-160 (20 bytes)         │
│       ↓                        │
│  Bitcoin Address               │
└────────────────────────────────┘
```

이 결과가 바로 P2PKH 주소의 핵심 데이터이며, P2WPKH 주소의 witness program 이다.

***[비트코인 주소(Bitcoin Address)는 "공개키의 RIPEMD160(SHA256()) 해시" 이다.](https://klarciel.net/wiki/blockchain/blockchain-checksum/)***

```
┌──────────────────────────────────────────────────┐
│  Public Key (33 or 65 bytes)                     │
│       ↓                                          │
│  SHA-256 (32 bytes)                              │
│    • 표준화되고 널리 검증됨                        │
│    • 충돌 저항성 강함                             │
│       ↓                                          │
│  RIPEMD-160 (20 bytes)                           │
│    • 주소 크기 단축 (QR 코드, 저장 공간)           │
│    • SHA-2와 다른 설계 = 이중 방어                │
│       ↓                                          │
│  Bitcoin Address (after Base58Check)             │
│    1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa            │
└──────────────────────────────────────────────────┘
```

## TDD

이번 TDD 는 다음과 같은 사이클로 진행한다.

```
    RED: 실제 비트코인 데이터로 테스트 작성
        ├─ Genesis Block Hash
        ├─ Satoshi's Public Key
        └─ 알려진 트랜잭션들

    GREEN: 최소 구현
        └─ 표준 라이브러리 활용

    REFACTOR: 문서화 및 최적화
        └─ 비트코인 프로토콜 규격 명시
```

__[Genesis Block](https://klarciel.net/wiki/blockchain/blockchain-genesis-block/) 검증__:

```go
// TestDoubleSHA256 tests the Bitcoin-specific double SHA-256 hashing.
//
// Double SHA-256 is the core hashing algorithm used in Bitcoin:
//   - Block hashes
//   - Transaction IDs (TXID)
//   - Merkle tree nodes
//
// Formula: DoubleSHA256(x) = SHA-256(SHA-256(x))
func TestDoubleSHA256(t *testing.T) {
	tests := []struct {
		name     string
		input    string // hex encoded input
		expected string // hex encoded hash
	}{
		{
			name:     "empty_bytes",
			input:    "",
			expected: "5df6e0e2761359d30a8275058e299fcc0381534545f55cf43e41983f5d4c9456",
		},
		{
			name:     "hello",
			input:    "68656c6c6f", // "hello" in hex
			expected: "9595c9df90075148eb06860365df33584b75bff782a510c6cd4883a419833d50",
		},
		{
			name:     "genesis_block_header",
			// Genesis block header (80 bytes)
			// Version(4) + PrevHash(32) + MerkleRoot(32) + Timestamp(4) + Bits(4) + Nonce(4)
			input: "0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c",
			// Expected: Internal format (little-endian)
			expected: "6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input, _ := hex.DecodeString(tt.input)
			result := DoubleSHA256(input)  // ← 아직 없는 함수!

			got := hex.EncodeToString(result)
			if got != tt.expected {
				t.Errorf("DoubleSHA256(%s):\nexpected: %s\ngot:      %s",
					tt.input[:min(len(tt.input), 40)], tt.expected, got)
			}
		})
	}
}
```

- Version (4 bytes): 01000000 (Version 1)
- Previous Hash (32 bytes): 00...00 (제네시스 블록이므로 0)
- Merkle Root (32 bytes): 3ba3edfd... (유명한 제네시스 머클 루트의 리틀 엔디안 표현)
- Timestamp (4 bytes): 29ab5f49
  - 뒤집으면 0x495fab29 = 1231006505
  - 변환: 2009년 1월 3일 18:15:05 UTC
- Bits (4 bytes): ffff001d (난이도 목표)
- Nonce (4 bytes): 1dac2b7c
  - 뒤집으면 0x7c2bac1d = 2083236893 (사토시가 찾은 그 Nonce)

__Hash160 Red Test__:

```go
// TestHash160 tests the Bitcoin address hashing function.
//
// Hash160 is used to generate Bitcoin addresses from public keys:
//   Formula: Hash160(x) = RIPEMD-160(SHA-256(x))
func TestHash160(t *testing.T) {
	tests := []struct {
		name     string
		input    string // hex encoded input
		expected string // hex encoded hash (20 bytes)
	}{
		{
			name:     "empty_bytes",
			input:    "",
			expected: "b472a266d0bd89c13706a4132ccfb16f7c3b9fcb",
		},
		{
			name:     "hello",
			input:    "68656c6c6f",
			expected: "b6a9c8c230722b7c748331a8b450f05566dc7d0f",
		},
		{
			name: "satoshi_pubkey",
			// Genesis block coinbase output public key (uncompressed, 65 bytes)
			input:    "0496b538e853519c726a2c91e61ec11600ae1390813a627c66fb8be7947be63c52da7589379515d4e0a604f8141781e62294721166bf621e73a82cbf2342c858ee",
			expected: "119b098e2e980a229e139a9ed01a469e518e6f26",
			// → After Base58Check: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input, _ := hex.DecodeString(tt.input)
			result := Hash160(input)  // ← 아직 없는 함수!

			got := hex.EncodeToString(result)
			if got != tt.expected {
				t.Errorf("Hash160: expected %s, got %s", tt.expected, got)
			}

			// Verify hash length is always 20 bytes
			if len(result) != 20 {
				t.Errorf("Hash160 length: expected 20, got %d", len(result))
			}
		})
	}
}
```

__Reverse Bytes__:

```go
// TestReverseBytes tests byte order reversal for display formatting.
func TestReverseBytes(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "empty",
			input:    "",
			expected: "",
		},
		{
			name:     "single_byte",
			input:    "01",
			expected: "01",
		},
		{
			name:     "simple_sequence",
			input:    "0102030405",
			expected: "0504030201",
		},
		{
			name: "genesis_block_hash_internal_to_display",
			// Internal format (little-endian)
			input: "6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000",
			// Display format (big-endian) - what you see on block explorers
			expected: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input, _ := hex.DecodeString(tt.input)
			result := ReverseBytes(input)  // ← 아직 없는 함수!

			got := hex.EncodeToString(result)
			if got != tt.expected {
				t.Errorf("ReverseBytes: expected %s, got %s", tt.expected, got)
			}
		})
	}
}
```

위 input 을 DoubleSHA256 을 수행하면 Little-Endian 으로 `6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000` 값이 나오며
이 값을 바이트 단위로 뒤집으면(ReverseBytes), 우리가 익히 알고 있는 Big-Endian 형태의 `000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f` 제네시스 블록의 해시값이 나온다. 

__Integration Test - Genesis Block 전체 검증__:

```go
// TestGenesisBlockHash is a comprehensive integration test.
//
// This verifies that our cryptographic functions correctly implement
// Bitcoin's protocol by reproducing the exact Genesis Block hash.
//
// Genesis Block details:
//   - Block Height: 0
//   - Date: 2009-01-03 18:15:05 UTC
//   - Block Hash: 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
//   - Coinbase message: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
func TestGenesisBlockHash(t *testing.T) {
	// Genesis block header (80 bytes)
	headerHex := "0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c"
	header, _ := hex.DecodeString(headerHex)

	// Step 1: Compute double SHA-256 hash (internal format)
	hashInternal := DoubleSHA256(header)
	expectedInternal := "6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000"
	gotInternal := hex.EncodeToString(hashInternal)

	if gotInternal != expectedInternal {
		t.Errorf("Genesis block hash (internal):\nexpected: %s\ngot:      %s",
			expectedInternal, gotInternal)
	}

	// Step 2: Reverse bytes for display format
	hashDisplay := ReverseBytes(hashInternal)
	expectedDisplay := "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
	gotDisplay := hex.EncodeToString(hashDisplay)

	if gotDisplay != expectedDisplay {
		t.Errorf("Genesis block hash (display):\nexpected: %s\ngot:      %s",
			expectedDisplay, gotDisplay)
	}

	t.Logf("✓ Genesis Block Hash verified!")
	t.Logf("  Internal: %s", gotInternal)
	t.Logf("  Display:  %s", gotDisplay)
}
```

__DoubleSHA256 구현__:

```go
// DoubleSHA256 computes SHA-256(SHA-256(data)), the core hash function in Bitcoin.
//
// Double SHA-256 is Bitcoin's primary hashing algorithm, used for:
//   - Block hashes: Proof-of-Work validation
//   - Transaction IDs (TXID): Unique transaction identifiers
//   - Merkle tree construction: Aggregating transaction hashes
//
// Why double hashing?
//  1. Defense against length extension attacks on SHA-256
//  2. Additional layer of security (defense in depth)
//  3. Historical consistency with Bitcoin's original design
//
// Returns: 32-byte hash value
//
// Reference:
//   - https://en.bitcoin.it/wiki/Block_hashing_algorithm
func DoubleSHA256(data []byte) []byte {
	// First SHA-256
	firstHash := sha256.Sum256(data)

	// Second SHA-256 on the result of the first
	secondHash := sha256.Sum256(firstHash[:])

	return secondHash[:]
}
```

__Hash160 구현__:

```go
import (
	"crypto/sha256"
	"golang.org/x/crypto/ripemd160"
)

// Hash160 computes RIPEMD-160(SHA-256(data)), used for Bitcoin address generation.
//
// Formula: Hash160(x) = RIPEMD-160(SHA-256(x))
//
// Returns: 20-byte hash value
//
// Reference:
//   - https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses
func Hash160(data []byte) []byte {
	// Step 1: SHA-256
	sha := sha256.Sum256(data)

	// Step 2: RIPEMD-160
	ripe := ripemd160.New()
	ripe.Write(sha[:])

	return ripe.Sum(nil)
}
```

__ReverseBytes 구현__:

```go
// ReverseBytes reverses the byte order of a byte slice.
//
// This function is essential for converting between Bitcoin's internal
// representation (little-endian) and the display format (big-endian).
//
// Returns: A new byte slice with reversed byte order
func ReverseBytes(data []byte) []byte {
	// Create a new slice with the same length
	result := make([]byte, len(data))

	// Copy bytes in reverse order
	for i := range data {
		result[i] = data[len(data)-1-i]
	}

	return result
}
```