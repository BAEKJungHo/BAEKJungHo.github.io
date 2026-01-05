---
layout  : wiki
title   : Segwit Locking Script
summary : Bech32, Remove Transaction Malleability
date    : 2026-01-05 11:54:32 +0900
updated : 2026-01-05 12:15:24 +0900
tag     : blockchain bitcoin
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Segwit Locking Script

기존의 비트코인(Legacy) 트랜잭션에서는 서명(Signature) 데이터가 트랜잭션 입력(Input)의 scriptSig 필드 안에 포함되어 있었다. 이 서명 데이터는 트랜잭션 전체 크기의 약 65%를 차지할 정도로 거대했다.
크기도 문제이지만 ***트랜잭션 가변성(Malleability)*** 도 문제였다. 기존 TXID 는 서명(ScriptSig)이 포함된 상태로 해시를 만들기 때문에 서명이 바뀌면 TXID가 바뀐다.(가변성 문제)

SegWit (Segregated Witness, ***[BIP 141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki)***) 의 핵심 아이디어는
***"증명(Witness, 서명) 데이터를 기존 블록 구조에서 분리(Segregate)하여 별도의 공간에 저장하자"*** 이다. 즉, 서명을 분리한 새로운 ID인 **wTXID**를 도입하고, 기존 TXID 계산에서는 서명을 제외하였다.
이 덕분에 누군가 서명 데이터를 조작해도 트랜잭션의 고유 ID(TXID)는 변하지 않게 되었다.

### P2PKH, P2WPKH

가장 흔한 거래 형태인 P2PKH(Legacy)와 P2WPKH(Native SegWit)의 잠금 스크립트(ScriptPubKey)를 비교해보자.

***[P2PKH(Pay To Public Key Hash)](https://learnmeabitcoin.com/technical/script/p2pkh/)*** 는 비트코인을 "전송"하는 데 사용되는 구식 스크립트 패턴이며 구조는 다음과 같다.

![](/resource/wiki/blockchain-segwit-locking-script/p2pkh.png)

```
OP_DUP OP_HASH160 <20-byte-PubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

- 크기: 약 25바이트
- 해석: 스택 머신이 위 오퍼코드들을 하나씩 실행하며 검증한다. 복잡하고 연산 비용이 든다.

Native SegWit - P2WPKH (Pay To Witness Public Key Hash) 의 구조는 다음과 같다.

```
OP_0 <20-byte-PubKeyHash>
```

- 크기: 약 22바이트
- 해석: **OP_0** 과 20바이트 데이터 딱 두 개만 존재한다.
- 작동 원리:
  - Version 0 (SegWit): OP_0으로 시작한다.
    - 뒤에 20바이트 데이터가 오면 → P2WPKH (Legacy의 P2PKH 대응)
    - 뒤에 32바이트 데이터가 오면 → P2WSH (Legacy의 P2SH 대응)
  - Soft Fork 안전장치: 구형 노드(Old Node)는 OP_0 뒤에 데이터가 있는 것을 보고 이를 단순한 스크립트로 해석하여 블록을 유효하다고 인식하여 검증을 통과시킨다. 하지만 신형 노드는 이를 "Witness 데이터를 검증하라"는 명령으로 인식한다.

SegWit 잠금 스크립트가 `OP_0 <Hash>` 형태로 극도로 단순화되면서 얻은 이점은 다음과 같다.
- UTXO 셋(Set) 크기 감소: 모든 풀 노드는 UTXO를 RAM에 올려두고 관리해야 한다. 잠금 스크립트가 짧아진다는 것은 전 세계 노드들의 메모리 부하를 줄여준다는 뜻이다.
- 검증 로직의 이동: 기존 노드(SegWit 미지원)는 이를 단순한 스크립트로 해석하여 블록을 유효하다고 인식하여 호환성을 유지한다. 하지만 SegWit 지원 노드는 OP_0를 보고 **"잠깐, 이건 Witness 필드에 있는 별도의 서명을 검증해야 해"** 라고 인식하여 새로운 검증 로직을 수행한다.

## Bech32

SegWit이 '엔진'의 업그레이드라면, Bech32는 그 엔진에 걸맞은 새로운 '인터페이스'이다. Segwit 잠금 스크립트를 나타내는 데 사용되는 주소 형식 이다.
따라서 기존 P2PKH 및 P2SH 잠금 스크립트는 Base58 주소를 계속 사용하는 반면, 새로운 P2WPKH 및 P2WSH 잠금 스크립트는 Bech32 주소를 사용한다.

기존의 1...이나 3...으로 시작하는 ***[Base58Check](https://klarciel.net/wiki/blockchain/blockchain-base58/)*** 주소 방식은 SegWit 의 잠금 스크립트(`OP_0 <Hash>`)를 담기에 비효율적이었다. 그래서 등장한 것이 bc1q...로 시작하는 ***[Bech32](https://learnmeabitcoin.com/technical/keys/bech32/)*** 포맷이다.

![](/resource/wiki/blockchain-segwit-locking-script/segwit.png)