---
layout  : wiki
title   : Bitcoin - Block, Transaction, Bytes
summary : 
date    : 2026-01-02 13:54:32 +0900
updated : 2026-01-02 14:15:24 +0900
tag     : blockchain bitcoin network
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Block

Block is Container for bitcoin transactions. 

![](/resource/wiki/blockchain-bitcoin-network/block.png)

이러한 블록들이 사슬(chain) 형태로 구성되는 것을 BlockChain 이라 하며, ***Distributed Transaction Ledger*** 이다.
블록은 거래 내역의 모음이며, 맨 위에는 블록에 포함된 데이터를 요약한 블록 헤더가 있다.

__Block__:

```
0100000055bd840a78798ad0da853f68974f3d183e2bd1db6a842c1feecf222a00000000ff104ccb05421ab93e63f8c3ce5c2c2e9dbb37
de2764b3a3175c8166562cac7d51b96a49ffff001d283e9e70020100000001000000000000000000000000000000000000000000000000
0000000000000000ffffffff0704ffff001d0102ffffffff0100f2052a01000000434104d46c4968bde02899d2aa0963367c7a6ce34eec
332b32e42e5f3407e052d64ac625da6f0718e7b302140434bd725706957c092db53805b821a85b23a7ac61725bac000000000100000001
c997a5e56e104102fa209c6a852dd90660a20b2d9c352423edce25857fcd3704000000004847304402204e45e16932b8af514961a1d3a1
a25fdf3f4f7732e9d624c6c61548ab5fb8cd410220181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d0901ff
ffffff0200ca9a3b00000000434104ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7
df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84cac00286bee0000000043410411db93e1dcdb8a016b49840f8c53bc1eb68a38
2e97b1482ecad7b148a6909a5cb2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3ac00000000
```

## Transaction

중앙 기관에 의존하는 신뢰 기반의 모델이 아닌 암호학적 증명에 기반한 전자 화폐(electronic coin)를 사용하면 제3자 중개인을 신뢰할 필요 없이 돈을 안전하게 보호하고 
거래를 간편하게 할 수 있다. 이러한 시스템의 핵심 구성 요소 중 하나는 ***[디지털 서명(Digital Signatures)](https://klarciel.net/wiki/security/security-signed-certificates/)*** 이다.
디지털 코인(digital coin)에는 소유자(owner)의 공개키가 포함되어 있으며, 코인을 양도하려면 소유자는 다음 소유자의 공개키를 해시 처리한 값에 자신의 개인키로 서명해야 한다.
Next Owner 는 Previous Owner 의 공개키로 서명을 검증해 화폐 소유권의 체인을 검증할 수 있다.

하지만,위 개념만으로는 ***[이중 지출 문제(double spending problems)](https://klarciel.net/wiki/blockchain/)*** 를 해결할 수 없다. 비트코인은 이중 지출을 확인하기 위해서 P2P Network 를 사용한다. 
이 Network 는 Distributed Timestamp Server 처럼 작동하여 코인을 사용한 첫 번째 거래에 타임스탬프를 찍는다.
Timestamp Server 는 거래 순서 증명을 위한 것으로 여러 거래를 하나로 묶고 그 묶음에 '시간'과 '이전 기록'을 함께 고정한다.

***거래(Transaction)는 비트코인이 한 곳에서 다른 곳으로 이동하는 것을 설명하는 바이트 묶음이다.***

그 결과, SPOF(Single Point Of Failure)가 없는 분산 시스템이 탄생하였고,  사용자들은 자신의 암호화폐에 대한 암호화 키를 보유하고, P2P 네트워크를 통해 이중 지출을 방지하면서 서로 직접 거래한다. 

__Transaction__:

```
0100000001c997a5e56e104102fa209c6a852dd90660a20b2d9c352423edce25857fcd37
04000000004847304402204e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c6
1548ab5fb8cd410220181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221
a8768d1d0901ffffffff0200ca9a3b00000000434104ae1a62fe09c5f51b13905f07f06b
99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a
0626f1baded5c72a704f7e6cd84cac00286bee0000000043410411db93e1dcdb8a016b49
840f8c53bc1eb68a382e97b1482ecad7b148a6909a5cb2e0eaddfb84ccf9744464f82e16
0bfa9b8b64f9d4c03f999b8643f656b412a3ac00000000
```

## Bytes

비트코인 데이터를 다룰 때는 저수준 프로그래밍을 하게될 가능성이 높기 때문에 어떤 데이터를 보고 있는지 아는 것이 중요하다.
바이트는 공간을 절약하기 위해 8비트 대신 2개의 16진수 문자료 표현하기도 한다.

```
byte (binary):
┌─┬─┬─┬─┬─┬─┬─┬─┐
│0│1│1│0│1│0│1│1│
└─┴─┴─┴─┴─┴─┴─┴─┘

byte (hexadecimal):
┌─┬─┐
│6│B│
└─┴─┘
```

비트코인을 사용하다보면 가공되지 않은 ***[Bytes](https://learnmeabitcoin.com/technical/general/bytes/)*** 형태의 데이터를 자주 접하게 된다.
- __Private Key__: 32 Byte 의 데이터이다. (e.g 0a7c7d76b42cee7a85d6e30cc38682f5b0d9c41cbbdf7d4c5c0bd81d8a1e93a1) 
- __TXID__: 거래를 고유하게 실별하는 32 Byte(represented as 64 hexadecimal characters)의 데이터 이다. (e.g a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d)
  - A ***[TXID (Transaction ID)](https://learnmeabitcoin.com/technical/transaction/input/txid/)*** is a unique reference for a bitcoin transaction.
  - 사토시는 블록 해시의 바이트 순서를 뒤집는 것 외에도 거래 해시(TXID)의 바이트 순서도 뒤집기로 결정했다.

```
Transaction Hash: 169e1e83e930853391bc6f35f605c6754cfead57cf8387639d3b4096c54f18f4
TXID:             f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16
```

### Byte Order

***[Reverse Byte Order(RPC Byte Order, Network Byte Order)](https://learnmeabitcoin.com/technical/general/byte-order/#reverse-byte-order)*** 란, 비트코인 내부(Little-endian) 해시를 사용자와 RPC에서 쓰기 위해 바이트 단위로 뒤집은 표현이다.

```
SHA256 결과
  ↓
[Little-endian]  ← 내부 처리
  ↓ reverse bytes
[Big-endian]     ← 사용자 / RPC / Explorer
```

This is the reverse order of bytes as they come out of the hash function. This is the byte order you use when searching for transactions/blocks in block explorers, or making RPC requests to Bitcoin Core.

In other words, this is the byte order that Bitcoin users see and use. This byte order is sometimes referred to as ***["big-endian"](https://klarciel.net/wiki/blockchain/blockchain-endian/)***.

```
Block Hash:       000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
Transaction Hash: f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16
```

반면, 내부적으로 비트코인 원시 데이터를 처리할 때는 ***Natural Byte Order*** 를 사용한다.

바이트 순서를 뒤집는 이유는 무엇일까? 

SHA-256과 같은 해시 함수의 출력은 32바이트의 무작위 데이터이다. (e.g 6f e2 8c 0a b6 f1 b3 72 c1 a6 a2 46 ae 63 f7 4f ...)
이 값에는 방향도 없고 왼쪽이 더 중요하다는 의미도 없는 바이트 배열일 뿐이다.

사토시는 해시를 "정수(integer)"로 비교해야 했다. 비트코인 채굴에서는 ***[Target](https://learnmeabitcoin.com/technical/mining/target/)*** 보다 더 많은 금액을 확보해야한다.
Target 은 후보 블록의 해시 값이 블록체인에 추가되기 위해 도달 해야 하는 최소값이다.

```
block_hash < target
```

즉, 해시를 정수로 해석하여 목표값과 비교해야 한다.

사토시가 비트코인을 구현하던 환경은 x86 계열 Little-endian 아키텍처이며,
리틀 엔디안에서는 바이트 배열을 정수로 해석할 때 가장 낮은 바이트가 먼저 온다.

따라서 비트코인 내부에서는 해시를 다음과 같이 다룬다.

__Little Endian__:

```
Block Hash (bytes):
6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000

Target (bytes):
0000000000000000000000000000000000000000000000000000ffff00000000
```

하지만 사람 입장에서는 큰 숫자가 왼쪽에 오는 Big Endian 표기법이 익숙하다.
따라서 아래와 같이 표기를 하게 되면 Block Hash 가 ***[Target](https://learnmeabitcoin.com/technical/mining/target/)*** 보다 작은지 바로 판단이 가능하다.

```
Block Hash:
000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f

Target:
00000000ffff0000000000000000000000000000000000000000000000000000
```

## References

- [Bitcoin open source implementation of P2P currency](https://satoshi.nakamotoinstitute.org/posts/p2pfoundation/1/)
- [Learn me a bitcoin](https://learnmeabitcoin.com/technical/block/)