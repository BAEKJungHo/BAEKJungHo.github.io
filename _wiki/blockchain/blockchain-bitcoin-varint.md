---
layout  : wiki
title   : VarInt
summary : CompactSize
date    : 2026-01-08 17:54:32 +0900
updated : 2026-01-08 18:15:24 +0900
tag     : blockchain bitcoin distributed
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## VarInt

비트코인 블록체인에서 공간(space)는 곧 돈이다. 1MB(혹은 4M Weight)라는 ***한정된 블록 공간에 최대한 많은 트랜잭션을 담아야 수수료를 아끼고 처리량을 높일 수 있기 때문*** 이다.
그래서 비트코인은 정수를 표현할 때 고정된 8바이트(uint64)를 무작정 사용하지 않는다. 숫자의 크기에 따라 길이가 늘어났다 줄어드는 가변 길이 정수(Variable Length Integer), 줄여서 ***[VarInt](https://wiki.bitcoinsv.io/index.php/VarInt)*** 를 사용한다.
즉, VarInt 는 ***비트코인을 ‘작고, 빠르고, 전 세계에서 동기화 가능하게 만든 데이터 압축형 정수 포맷’*** 이다.
비트코인은 P2P 글로벌 시스템이라 1바이트라도 줄이는 게 탈중앙성 비용을 줄인다.

VarInt 는 비트코인에서 ***[거래(transaction), 블록(block)](https://klarciel.net/wiki/blockchain/blockchain-bitcoin-block-tx/)*** 및 P2P 네트워크 데이터 내 필드의 길이를 나타내는 데 널리 사용되는 정수 형식이다.
비트코인 코드베이스에서는 이를 ***CompactSize*** 라고 부르기도 한다.

VarInt 는 정의되는 객체의 크기에 따라 1, 3, 5 또는 9바이트 길이의 가변 길이 필드이다. 가변 길이 객체를 사용할 때 8바이트 필드를 사용하는 것보다 공간 효율성이 뛰어나기 때문에 VarInt 형식을 사용한다. VarInt 값은 거의 항상 ***[Little Endian](https://klarciel.net/wiki/blockchain/blockchain-endian/)*** 방식으로 표현됩니다.

__인코딩 규칙__:
- VarInt 의 핵심은 **"첫 번째 바이트(Prefix)"** 를 보면 전체 길이가 얼마인지 알 수 있다는 점이다.
- ```
   1 Byte: [ Value ]

   3 Bytes: [ 0xFD ] [ Value(2 bytes) ]
  
   5 Bytes: [ 0xFE ] [ Value(4 bytes) ]
  
   9 Bytes: [ 0xFF ] [ Value(8 bytes) ]
  ```

| 값의 범위 (Value) | 첫 바이트 (Prefix) | 추가 데이터 길이 | 총 길이 | 엔디안 |
| :--- | :--- | :--- | :--- | :--- |
| **0 ~ 252** (`0xFC`) | **없음** (값 자체가 데이터) | 0 바이트 | **1 바이트** | - |
| **253 ~ 65,535** (`0xFFFF`) | **`0xFD`** | 2 바이트 (`uint16`) | **3 바이트** | Little |
| **65,536 ~ 42억** (`0xFFFFFFFF`) | **`0xFE`** | 4 바이트 (`uint32`) | **5 바이트** | Little |
| **42억 ~ 최대** (`uint64 Max`) | **`0xFF`** | 8 바이트 (`uint64`) | **9 바이트** | Little |


- 1바이트 구간 (0~252):
  - 가장 흔한 케이스이다. 트랜잭션 입력 개수가 1개라면 그냥 `0x01`이라고 쓴다. 8바이트를 쓸 때보다 7바이트나 절약된다.
- 3바이트 구간 (Prefix 0xFD):
  - 숫자가 253 이상이면 1바이트로 표현할 수 없다.
  - 이때 비트코인은 "자, 이제부터 2바이트 더 읽어!"라는 신호로 `0xFD`를 먼저 보낸다.
  - e.g 숫자 255 (0x00FF) -> FD FF 00 (Little Endian 이므로 FF 00 순서)
- 5바이트 (0xFE), 9바이트 (0xFF) 구간:
  - 같은 원리로 각각 uint32, uint64를 뒤에 붙인다.

__VarInt 는 어디에 사용되는가?__:
- 비트코인 블록을 뜯어보면 VarInt 가 없는 곳이 없다.
- 트랜잭션 입력/출력 개수 인코딩 시: "이 트랜잭션은 입력이 2개야" 할 때 0x02 (VarInt)를 쓴다.
- 스크립트 길이 표시: 잠금 스크립트(ScriptPubKey) 앞에 "이 스크립트는 25바이트짜리야"라고 알릴 때 쓴다.
- 블록 내 트랜잭션 개수 표시: 블록 헤더 바로 뒤에 "이 블록에는 2,500개의 트랜잭션이 있어"라고 알릴 때 쓴다.