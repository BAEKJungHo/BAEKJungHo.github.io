---
layout  : wiki
title   : Genesis Block, Coinbase Transaction
summary : 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
date    : 2026-01-04 18:54:32 +0900
updated : 2026-01-04 19:15:24 +0900
tag     : blockchain bitcoin
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Genesis Block

***[Genesis Block](https://learnmeabitcoin.com/explorer/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f)*** 은 
비트코인 블록체인의 **첫 번째 블록(Block Height 0)** 이다. 모든 블록체인은 ***[이전 블록의 해시(Previous Block Hash)](https://klarciel.net/wiki/blockchain/blockchain-bitcoin-block-tx/)*** 를 가리키며 연결되지만, 제네시스 블록은 그 이전에 아무것도 존재하지 않기 때문에 이전 블록 해시값이 0으로 채워져 있다.

- 블록 높이: 0
- 블록 해시: 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f
- 생성 시간: 2009년 1월 3일 18:15:05 UTC

제네시스 블록의 ***[코인베이스 트랜잭션(Coinbase Transaction)](https://en.wikipedia.org/wiki/Bitcoin#Supply)*** 에는 "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks" 메시지가 숨겨져 있다.

```
// 제네시스 블록의 코인베이스 데이터 (Hex)
04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73

// ASCII 변환 결과
...The Times 03/Jan/2009 Chancellor on brink of second bailout for banks
```

> 모든 블록에는 채굴 보상을 받는 첫 번째 거래인 '코인베이스 트랜잭션(Coinbase Transaction)'이 포함된다. 이 트랜잭션의 입력값(Input) 공간에는 임의의 데이터를 넣을 수 있다.

제네시스 블록의 가장 큰 특징은 **"채굴되어 전파된 것이 아니라, 소스 코드에 박제되어 있다"** 는 점이다. 즉, 제네시스 블록은 모든 노드가 합의하고 시작하는 '공리(Axiom)'와 같다.