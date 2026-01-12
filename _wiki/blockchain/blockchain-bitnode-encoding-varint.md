---
layout  : wiki
title   : BITCOIN NODE - Encoding VarInt
summary : 
date    : 2026-01-11 17:54:32 +0900
updated : 2026-01-11 18:15:24 +0900
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

# BITCOIN NODE - Encoding VarInt

## VarInt

비트코인 네트워크는 JSON 을 사용하지 않는다. 대신 **바이너리 데이터를 TCP로 직접 주고받는다**. 이 과정에서 다음과 같은 문제가 발생한다.

```
문제: 트랜잭션의 입력 개수를 어떻게 인코딩할까?

Option 1: 항상 8바이트(uint64) 사용
  - 입력 1개: [0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] → 8 bytes
  - 입력 2개: [0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00] → 8 bytes
  - 낭비: 대부분의 트랜잭션은 입력이 1-10개인데 항상 8바이트 사용!

Option 2: VarInt 사용
  - 입력 1개: [0x01] → 1 byte
  - 입력 2개: [0x02] → 1 byte
  - 입력 1000개: [0xFD, 0xE8, 0x03] → 3 bytes
  - 효율적! 작은 값은 1바이트, 큰 값만 더 많은 바이트 사용
```

***[VarInt](https://klarciel.net/wiki/blockchain/blockchain-bitcoin-varint/)***  는 비트코인 프로토콜 전반에 걸쳐 사용된다.

| 위치 | 용도 | 일반적인 값 범위 |
|------|------|------------------|
| **Transaction** | 입력(input) 개수 | 1-10개 (1 byte) |
| **Transaction** | 출력(output) 개수 | 1-10개 (1 byte) |
| **Transaction** | Script 길이 | 수십 바이트 (1 byte) |
| **Block** | 트랜잭션 개수 | 수백~수천 (3 bytes) |
| **P2P Message** | Inventory 개수 | 수백 개 (3 bytes) |

**핵심**: 대부분의 값이 252 이하이므로 VarInt 를 사용하면 **평균 80% 공간 절약** 하게된다.

### Bitcoin Protocol Specification

VarInt는 **첫 바이트(discriminator)** 를 보고 전체 길이를 판단한다.

```
┌─────────────────┬─────────────────────────────────────┐
│   값 범위       │   인코딩 형식                        │
├─────────────────┼─────────────────────────────────────┤
│ 0 ~ 252         │ [value]                    (1 byte)  │
│ 253 ~ 65535     │ [0xFD][uint16 LE]          (3 bytes) │
│ 65536 ~ 2^32-1  │ [0xFE][uint32 LE]          (5 bytes) │
│ 2^32 ~ 2^64-1   │ [0xFF][uint64 LE]          (9 bytes) │
└─────────────────┴─────────────────────────────────────┘

LE = Little-Endian (낮은 바이트가 먼저)
```

__Examples__:

```go
// Example 1: 작은 값 (1 byte)
Value: 10
Encoding: [0x0A]
         └─ 값 자체

// Example 2: 중간 값 (3 bytes)
Value: 1000 (0x03E8)
Encoding: [0xFD, 0xE8, 0x03]
         └─┬─┘ └────┬─────┘
           │        └─ 1000을 Little-Endian uint16으로 인코딩
           └─ "다음 2바이트를 읽어라" 신호

// Example 3: 큰 값 (5 bytes)
Value: 1000000 (0x000F4240)
Encoding: [0xFE, 0x40, 0x42, 0x0F, 0x00]
         └─┬─┘ └──────────┬───────────┘
           │              └─ 1000000을 Little-Endian uint32로 인코딩
           └─ "다음 4바이트를 읽어라" 신호

// Example 4: 매우 큰 값 (9 bytes)
Value: 1000000000000 (0x000000E8D4A51000)
Encoding: [0xFF, 0x00, 0x10, 0xA5, 0xD4, 0xE8, 0x00, 0x00, 0x00]
         └─┬─┘ └────────────────┬──────────────────────┘
           │                    └─ uint64 Little-Endian
           └─ "다음 8바이트를 읽어라" 신호
```

__왜 252가 경계값인가?__:

```
0x00 ~ 0xFC (0-252)   : 실제 값
0xFD (253)            : "다음은 uint16이다" 시그널
0xFE (254)            : "다음은 uint32이다" 시그널
0xFF (255)            : "다음은 uint64이다" 시그널

💡 253-255는 값이 아니라 '타입 플래그'로 예약됨!
```

## TDD

### RED

먼저 WriteVarInt 를 작성한다. 목표는 비트코인 프로토콜 규격에 맞게 인코딩하는지 검증하는 것이다.

```go
// TestWriteVarInt tests the VarInt encoding according to Bitcoin protocol specification.
//
// VarInt encoding rules (Bitcoin Protocol):
// Range                  | Encoding
// -----------------------|----------------------------------
// 0 ~ 252                | 1 byte: value as-is
// 253 ~ 65535            | 3 bytes: 0xFD + 2 bytes (LE)
// 65536 ~ 4294967295     | 5 bytes: 0xFE + 4 bytes (LE)
// 4294967296 ~ 2^64-1    | 9 bytes: 0xFF + 8 bytes (LE)
func TestWriteVarInt(t *testing.T) {
	tests := []struct {
		name     string
		value    uint64
		expected string // hex encoded expected output
	}{
		// 1-byte encoding (0 ~ 252)
		{"zero", 0, "00"},
		{"one", 1, "01"},
		{"max_1byte", 252, "fc"},

		// 3-byte encoding (253 ~ 65535)
		{"min_3byte", 253, "fdfd00"},         // 0xFD + 253 in LE
		{"mid_3byte", 1000, "fde803"},        // 0xFD + 1000 in LE
		{"max_3byte", 65535, "fdffff"},       // 0xFD + 65535 in LE

		// 5-byte encoding (65536 ~ 4294967295)
		{"min_5byte", 65536, "fe00000100"},   // 0xFE + 65536 in LE
		{"mid_5byte", 1000000, "fe40420f00"}, // 0xFE + 1000000 in LE
		{"max_5byte", 4294967295, "feffffffff"}, // 0xFE + max uint32 in LE

		// 9-byte encoding (4294967296+)
		{"min_9byte", 4294967296, "ff0000000001000000"},      // 0xFF + 4294967296 in LE
		{"large_9byte", 1000000000000, "ff0010a5d4e8000000"}, // 0xFF + 1000000000000 in LE
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var buf bytes.Buffer
			err := WriteVarInt(&buf, tt.value)  // ← 아직 없는 함수!
			if err != nil {
				t.Fatalf("WriteVarInt(%d) failed: %v", tt.value, err)
			}

			got := hex.EncodeToString(buf.Bytes())
			if got != tt.expected {
				t.Errorf("WriteVarInt(%d):\nexpected: %s\ngot:      %s",
					tt.value, tt.expected, got)
			}
		})
	}
}
```

중요한 점은 각 범위의 최소/최대값 포함 (0, 252, 253, 65535, 65536, ...) 하는 ***경계값 테스트*** 가 필요하며, 일반적인 사용 사례(1, 1000, 1000000)에 ***중간값 테스트*** 등이 필요하다.

인코딩된 데이터를 올바르게 디코딩하는지 검증하기 위한 ReadVarInt 테스트를 생성한다.

```go
// TestReadVarInt tests VarInt decoding according to Bitcoin protocol specification.
func TestReadVarInt(t *testing.T) {
	tests := []struct {
		name     string
		input    string // hex encoded input
		expected uint64
	}{
		// 1-byte decoding
		{"zero", "00", 0},
		{"one", "01", 1},
		{"max_1byte", "fc", 252},

		// 3-byte decoding
		{"min_3byte", "fdfd00", 253},
		{"mid_3byte", "fde803", 1000},
		{"max_3byte", "fdffff", 65535},

		// 5-byte decoding
		{"min_5byte", "fe00000100", 65536},
		{"mid_5byte", "fe40420f00", 1000000},
		{"max_5byte", "feffffffff", 4294967295},

		// 9-byte decoding
		{"min_9byte", "ff0000000001000000", 4294967296},
		{"large_9byte", "ff0010a5d4e8000000", 1000000000000},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			data, _ := hex.DecodeString(tt.input)
			r := bytes.NewReader(data)

			got, err := ReadVarInt(r)  // ← 아직 없는 함수!
			if err != nil {
				t.Fatalf("ReadVarInt(%s) failed: %v", tt.input, err)
			}

			if got != tt.expected {
				t.Errorf("ReadVarInt(%s): expected %d, got %d",
					tt.input, tt.expected, got)
			}
		})
	}
}
```

또한 인코딩 전에 필요한 바이트 수를 계산하기 위한 헬퍼 함수도 만든다.

```go
// TestVarIntSize tests the VarIntSize helper function.
func TestVarIntSize(t *testing.T) {
	tests := []struct {
		value uint64
		size  int
	}{
		{0, 1},
		{252, 1},
		{253, 3},
		{65535, 3},
		{65536, 5},
		{4294967295, 5},
		{4294967296, 9},
		{^uint64(0), 9}, // max uint64
	}

	for _, tt := range tests {
		t.Run("", func(t *testing.T) {
			got := VarIntSize(tt.value)  // ← 아직 없는 함수!
			if got != tt.size {
				t.Errorf("VarIntSize(%d): expected %d, got %d",
					tt.value, tt.size, got)
			}
		})
	}
}
```

인코딩 → 디코딩 했을 때 원본 값이 복원되는지 검증하기 위한 ***Round-Trip*** 테스트도 필요하다.

```go
// TestVarInt_RoundTrip ensures encoding and decoding are inverse operations.
func TestVarInt_RoundTrip(t *testing.T) {
	testValues := []uint64{
		0, 1, 100, 252,           // 1-byte
		253, 1000, 65535,         // 3-byte
		65536, 1000000, 4294967295, // 5-byte
		4294967296, 1000000000000,  // 9-byte
	}

	for _, original := range testValues {
		t.Run("", func(t *testing.T) {
			var buf bytes.Buffer

			// Encode
			if err := WriteVarInt(&buf, original); err != nil {
				t.Fatalf("WriteVarInt(%d) failed: %v", original, err)
			}

			// Decode
			decoded, err := ReadVarInt(&buf)
			if err != nil {
				t.Fatalf("ReadVarInt failed: %v", err)
			}

			// Verify
			if decoded != original {
				t.Errorf("Round-trip failed: %d != %d", original, decoded)
			}
		})
	}
}
```

이제 테스트를 실행하여 RED 단계를 확인한다.

![](/resource/wiki/blockchain-bitnode-encoding-varint/fail-test.png)

### Green: WriteVarInt 

이제 WriteVarInt 를 구현한다.

```go
// WriteVarInt writes a variable-length integer to the given io.Writer
// according to the Bitcoin protocol's VarInt specification.
//
// VarInt (Variable-length Integer) is a space-efficient encoding format
// defined in the Bitcoin protocol to represent unsigned integers using
// a minimal number of bytes. It is used extensively throughout Bitcoin's
// binary protocol for encoding counts and lengths, such as:
//   - Transaction input/output counts
//   - Script lengths
//   - Number of transactions in a block
//   - Inventory vector counts in network messages
//
// Encoding Rules (Bitcoin Protocol Specification):
//
//	Value Range            | Encoding Format
//	-----------------------|------------------------------------------
//	0 ~ 252                | 1 byte:  [value]
//	253 ~ 65535            | 3 bytes: [0xFD][uint16 in LE]
//	65536 ~ 4294967295     | 5 bytes: [0xFE][uint32 in LE]
//	4294967296 ~ 2^64-1    | 9 bytes: [0xFF][uint64 in LE]
//
// The prefix byte (0xFD, 0xFE, 0xFF) acts as a discriminator to indicate
// the width of the following integer value. All multi-byte values are
// encoded in Little-Endian byte order, consistent with Bitcoin's protocol.
//
// This encoding allows small values (which are common) to be represented
// efficiently with a single byte, while still supporting the full uint64
// range when necessary.
//
// Reference: https://en.bitcoin.it/wiki/Protocol_documentation#Variable_length_integer
func WriteVarInt(w io.Writer, n uint64) error {
	var buf [9]byte  // 최대 9바이트 필요
	var length int

	switch {
	case n <= 0xFC: // 252
		// 1-byte encoding: value as-is
		buf[0] = byte(n)
		length = 1

	case n <= 0xFFFF: // 65535
		// 3-byte encoding: 0xFD + uint16 in Little-Endian
		buf[0] = 0xFD
		binary.LittleEndian.PutUint16(buf[1:3], uint16(n))
		length = 3

	case n <= 0xFFFFFFFF: // 4294967295
		// 5-byte encoding: 0xFE + uint32 in Little-Endian
		buf[0] = 0xFE
		binary.LittleEndian.PutUint32(buf[1:5], uint32(n))
		length = 5

	default:
		// 9-byte encoding: 0xFF + uint64 in Little-Endian
		buf[0] = 0xFF
		binary.LittleEndian.PutUint64(buf[1:9], n)
		length = 9
	}

	_, err := w.Write(buf[:length])
	return err
}
```

- 최대 크기를 알고 있으므로 배열을 사용하여 스택(stack)에 저장 (not heap)
- 각 case가 비트코인 프로토콜 규격과 1:1 대응
- 표준 라이브러리인 `binary.LittleEndian`으로 정확한 바이트 순서 보장

만약 아래처럼 필요한 만큼만 매번 힙으로 할당하면 GC 대상에 포함되며 Stack 보다 CPU Cache, STW(Stop The World) 등으로 인해서 속도가 느려질 수 있다.

```go
// 필요한 만큼만 할당 (매번 힙 할당)
func WriteVarInt(w io.Writer, n uint64) error {
  size := varIntSize(n)
  buf := make([]byte, size)  // 힙 할당!
  // ...
}
```

이 최적화는 비트코인 노드처럼 수백만 번 호출되는 함수에서 특히 중요합니다. VarInt 는 트랜잭션/블록 파싱의 핵심이므로, 스택 할당으로 GC 압력을 줄이면 전체 블록체인 동기화 속도가 크게 향상된다.

### Green: ReadVarInt

```go
// ReadVarInt reads a variable-length integer from the given io.Reader
// according to the Bitcoin protocol's VarInt specification.
//
// This function is the inverse of WriteVarInt and decodes a VarInt-encoded
// value back into a uint64. It first reads a discriminator byte to determine
// the width of the encoded integer, then reads the appropriate number of
// additional bytes and interprets them as a Little-Endian integer value.
//
// Decoding Rules (Bitcoin Protocol Specification):
//
//	First Byte | Interpretation
//	-----------|------------------------------------------------------
//	0x00-0xFC  | The byte value itself (0 ~ 252)
//	0xFD       | Read next 2 bytes as uint16 (LE) → 253 ~ 65535
//	0xFE       | Read next 4 bytes as uint32 (LE) → 65536 ~ 4294967295
//	0xFF       | Read next 8 bytes as uint64 (LE) → 4294967296+
//
// This function will return an error if:
//   - The io.Reader reaches EOF before all expected bytes are read
//   - Any I/O error occurs during reading
//
// Round-trip guarantee:
//
//	original → WriteVarInt → bytes → ReadVarInt → original
//
// Usage in Bitcoin protocol parsing:
//   - Transaction deserialization (input/output counts)
//   - Block deserialization (transaction count)
//   - Script parsing (script length prefix)
//   - P2P message parsing (inventory counts, address counts)
//
// Reference: https://en.bitcoin.it/wiki/Protocol_documentation#Variable_length_integer
func ReadVarInt(r io.Reader) (uint64, error) {
	// Read the discriminator byte
	var discriminator [1]byte
	if _, err := io.ReadFull(r, discriminator[:]); err != nil {
		return 0, err
	}

	switch discriminator[0] {
	case 0xFF:
		// 9-byte encoding: read next 8 bytes as uint64 (LE)
		var buf [8]byte
		if _, err := io.ReadFull(r, buf[:]); err != nil {
			return 0, err
		}
		return binary.LittleEndian.Uint64(buf[:]), nil

	case 0xFE:
		// 5-byte encoding: read next 4 bytes as uint32 (LE)
		var buf [4]byte
		if _, err := io.ReadFull(r, buf[:]); err != nil {
			return 0, err
		}
		return uint64(binary.LittleEndian.Uint32(buf[:])), nil

	case 0xFD:
		// 3-byte encoding: read next 2 bytes as uint16 (LE)
		var buf [2]byte
		if _, err := io.ReadFull(r, buf[:]); err != nil {
			return 0, err
		}
		return uint64(binary.LittleEndian.Uint16(buf[:])), nil

	default:
		// 1-byte encoding: discriminator byte is the value itself
		return uint64(discriminator[0]), nil
	}
}
```

- **io.ReadFull 사용**: 정확히 N바이트 읽기 보장
- **에러 전파**: EOF나 I/O 에러를 호출자에게 전달
- **역순 switch**: 0xFF → 0xFE → 0xFD 순으로 체크 (효율성)

### Green: VarIntSize

```go
// VarIntSize returns the number of bytes required to encode the given
// value as a Bitcoin VarInt.
//
// This is a utility function that helps pre-calculate buffer sizes when
// serializing Bitcoin protocol structures. It implements the same size
// determination logic as WriteVarInt without actually performing the encoding.
//
// Size determination rules:
//
//	Value Range            | Encoded Size
//	-----------------------|-------------
//	0 ~ 252                | 1 byte
//	253 ~ 65535            | 3 bytes
//	65536 ~ 4294967295     | 5 bytes
//	4294967296 ~ 2^64-1    | 9 bytes
//
// Common use cases:
//   - Pre-allocating buffers for transaction serialization
//   - Calculating total serialized size before encoding
//   - Optimizing memory allocation in performance-critical paths
//
// Example usage:
//
//	txCount := uint64(1500)
//	size := VarIntSize(txCount)  // returns 3
//	buf := make([]byte, size + otherFieldsSizes)
func VarIntSize(n uint64) int {
	switch {
	case n <= 0xFC: // 252
		return 1
	case n <= 0xFFFF: // 65535
		return 3
	case n <= 0xFFFFFFFF: // 4294967295
		return 5
	default:
		return 9
	}
}
```

이제 테스트를 실행하여 결과를 확인한다.

```bash
$ go test -v ./pkg/encoding/

=== RUN   TestWriteVarInt
=== RUN   TestWriteVarInt/zero
=== RUN   TestWriteVarInt/one
=== RUN   TestWriteVarInt/max_1byte
...
=== RUN   TestWriteVarInt/large_9byte
--- PASS: TestWriteVarInt (0.00s)

=== RUN   TestReadVarInt
=== RUN   TestReadVarInt/zero
...
=== RUN   TestReadVarInt/large_9byte
--- PASS: TestReadVarInt (0.00s)

=== RUN   TestVarIntSize
--- PASS: TestVarIntSize (0.00s)

=== RUN   TestVarInt_RoundTrip
--- PASS: TestVarInt_RoundTrip (0.00s)

PASS
ok  	btcnode/pkg/encoding	0.352s
```

그 다음 커버리지를 확인한다.

```bash
$ go test -cover ./pkg/encoding/

ok  	btcnode/pkg/encoding	0.355s	coverage: 88.4% of statements
```

```bash
$ go test -coverprofile=coverage.out ./pkg/encoding/
$ go tool cover -func=coverage.out

btcnode/pkg/encoding/binary.go:28:  WriteUint32LE   100.0%
btcnode/pkg/encoding/binary.go:51:  ReadUint32LE    75.0%   ← 에러 경로 미테스트
btcnode/pkg/encoding/binary.go:89:  WriteVarInt     100.0%
btcnode/pkg/encoding/binary.go:154: ReadVarInt      76.5%   ← 에러 경로 미테스트
btcnode/pkg/encoding/binary.go:218: VarIntSize      100.0%
total:                               (statements)    88.4%
```

***[ReadUint32LE](https://klarciel.net/wiki/blockchain/blockchain-bitnode-encoding-endians/)*** 와 `ReadVarInt`의 **에러 핸들링 경로** 에 대해서 추가 테스트를 작성한다.

### Refactor

```go
// TestReadUint32LE_EOF tests error handling when insufficient bytes are available.
func TestReadUint32LE_EOF(t *testing.T) {
	tests := []struct {
		name  string
		input string // hex encoded, intentionally short
	}{
		{"empty", ""},
		{"1_byte", "01"},
		{"2_bytes", "0102"},
		{"3_bytes", "010203"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			data, _ := hex.DecodeString(tt.input)
			r := bytes.NewReader(data)

			_, err := ReadUint32LE(r)
			if err == nil {
				t.Error("Expected error for insufficient bytes, got nil")
			}
		})
	}
}
```

**테스트 의도**: uint32는 4바이트 필요한데, 그보다 적은 데이터가 오면 에러 발생해야 함

ReadVarInt 에러 케이스도 추가한다.

```go
// TestReadVarInt_EOF tests error handling for incomplete VarInt data.
func TestReadVarInt_EOF(t *testing.T) {
	tests := []struct {
		name  string
		input string // hex encoded, intentionally incomplete
	}{
		{"empty", ""},
		{"fd_incomplete_1byte", "fd"},      // Missing 2 bytes
		{"fd_incomplete_partial", "fd00"},  // Missing 1 byte
		{"fe_incomplete_1byte", "fe"},      // Missing 4 bytes
		{"fe_incomplete_partial", "fe0000"}, // Missing 2 bytes
		{"ff_incomplete_1byte", "ff"},      // Missing 8 bytes
		{"ff_incomplete_partial", "ff00000000"}, // Missing 4 bytes
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			data, _ := hex.DecodeString(tt.input)
			r := bytes.NewReader(data)

			_, err := ReadVarInt(r)
			if err == nil {
				t.Errorf("Expected error for incomplete VarInt %q, got nil", tt.input)
			}
		})
	}
}
```

**테스트 의도**:
- `0xFD`를 읽었는데 그 뒤 2바이트가 없으면 에러
- `0xFE`를 읽었는데 그 뒤 4바이트가 없으면 에러
- `0xFF`를 읽었는데 그 뒤 8바이트가 없으면 에러

모든 테스트가 보충되었으면 다시 테스트를 실행하여 테스트 결과를 확인하면 된다.