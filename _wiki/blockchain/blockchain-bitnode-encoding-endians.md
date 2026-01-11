---
layout  : wiki
title   : BITCOIN NODE - Encoding Endian
summary : 
date    : 2026-01-10 17:54:32 +0900
updated : 2026-01-10 18:15:24 +0900
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

## BITCOIN NODE - Encoding Endian

비트코인 네트워크에서는 HTTP 나 JSON 을 쓰지 않고 ***바이너리(Binary)*** 로 데이터를 TCP 로 직접 주고 받는다.
이때 모든 정수(Integer)는 ***[Little Endian](https://klarciel.net/wiki/blockchain/blockchain-endian/)*** 으로 통신한다. (일부 네트워크 포트나 IP 는 Big Endian 이지만 대부분은 Little Endian)
이 도구 없이는 Version 메시지(핸드셰이크) 조차 만들 수 없다. 

- transaction 패키지: 거래 금액(int64), 버전(int32)을 직렬화 해야 한다.
- block 패키지: 블록 헤더의 Nonce, Bits, Timestamp 를 직렬화 해야 한다.
- network 패키지: P2P 메시지 헤더를 읽어야 한다.

블록 해시를 계산할 때 바이트 순서가 하나라도 틀리면 전혀 다른 해시값이 나온다. 특히 비트코인은 내부적으로는 Little Endian 을 쓰지만, 블록 탐색기(Explorer)에서 볼 때는 Big Endian 으로 뒤집어서 보여주는 경우가 많다(예: 블록 해시). 이를 위한 변환 함수가 필수이다.

### Package Structure

- pkg/encoding 

### TDD

먼저 binary_test.go 파일을 만들고 테스트 코드를 아래와 같이 정의한다.

```go
package encoding

import (
	"bytes"
	"encoding/hex"
	"testing"
)

func TestWriteUint32LE(t *testing.T) {
	// 1. 테스트 케이스 정의
	// 1234567890 (Decimal) = 0x499602D2 (Hex)
	// Little Endian: D2 02 96 49
	expectedHex := "d2029649"
	val := uint32(1234567890)

	// 2. 실행 (버퍼에 쓰기)
	var buf bytes.Buffer
	err := WriteUint32LE(&buf, val)

	// 3. 검증
	if err != nil {
		t.Fatalf("WriteUint32LE failed: %v", err)
	}

	result := hex.EncodeToString(buf.Bytes())
	if result != expectedHex {
		t.Fatalf("WriteUint32LE failed: expected %s, got %s", expectedHex, result)
	}
}

func TestReadUint32LE(t *testing.T) {
	// 1. 테스트 데이터 준비 (Little Endian)
	data, _ := hex.DecodeString("d2029649")
	r := bytes.NewReader(data)

	// 2. 실행
	val, err := ReadUint32LE(r) // 아직 없는 함수

	// 3. 검증
	if err != nil {
		t.Fatalf("Failed to read: %v", err)
	}

	expected := uint32(1234567890)
	if val != expected {
		t.Errorf("Expected %d, got %d", expected, val)
	}
}
```

그리고 테스트를 돌리면 실패한다. 이후 binary.go 를 만들고 WriteUint32LE 를 먼저 작성한다.

```kotlin
package encoding

import (
	"encoding/binary"
	"io"
)

// WriteUint32LE writes a uint32 value to the given io.Writer
// using Little-Endian byte order.
//
// This function converts the in-memory uint32 value into its
// 4-byte binary representation and writes it to the underlying
// writer (e.g., file, network connection, or buffer).
//
// struct / int / float / bool
//
//	     ↓
//	[binary layout]
//	     ↓
//	[]byte
//	     ↓
//	file / socket / packet
//
// In Bitcoin and many binary network protocols, integer fields
// such as the "version" field are defined as uint32 and must be
// serialized in Little-Endian format. This function enforces
// that protocol rule at the serialization boundary.
func WriteUint32LE(w io.Writer, val uint32) error {
	return binary.Write(w, binary.LittleEndian, val)
}
```

이는 **비트코인 프로토콜 규약(endianness)을 코드 레벨에서 고정한다는 의미까지 전달** 하도록 설계하는 것이다.

`go test ./pkg/encoding/` 으로 테스트 실행하면 기존에 2개의 코드라인에서 문제가 되었던 부분이 1개로 줄어든 것을 볼 수 있다.

![](/resource/wiki/blockchain-bitnode-encoding-endians/tdd-fail-log.png)

이제 ReadUint32LE 함수를 구현한다.

```go
// ReadUint32LE reads a 4-byte unsigned integer from the given io.Reader
// using Little-Endian byte order and returns it as a uint32.
//
// This function deserializes a binary-encoded uint32 value from a
// byte stream such as a file, network connection, or in-memory buffer.
//
// In the Bitcoin protocol, all integer fields — including the "version"
// field in block headers and network messages — are encoded in
// Little-Endian format. This function enforces that protocol rule by
// interpreting the incoming 4 bytes according to Little-Endian
// semantics and reconstructing the original uint32 value.
//
// It is the inverse operation of WriteUint32LE and guarantees that a
// value serialized with Bitcoin-compatible Little-Endian encoding
// will be correctly restored to its in-memory representation.
//
// 바이너리 스트림(파일, 네트워크, 블록체인 데이터)에서 비트코인 규격의 uint32 필드를 안전하게 역직렬화하는 함수
//
// round-trip: uint32 → WriteUint32LE → bytes → ReadUint32LE → uint32
func ReadUint32LE(r io.Reader) (uint32, error) {
	var val uint32
	if err := binary.Read(r, binary.LittleEndian, &val); err != nil {
		return 0, err
	}
	return val, nil
}
```

go test ./pkg/encoding/ 으로 테스트 실행하면 ok 를 볼 수 있다.

![](/resource/wiki/blockchain-bitnode-encoding-endians/tdd-success-log.png)