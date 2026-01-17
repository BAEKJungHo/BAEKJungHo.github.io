---
layout  : wiki
title   : The Mechanics of Blockchain
summary : 
date    : 2026-01-17 18:54:32 +0900
updated : 2026-01-17 19:15:24 +0900
tag     : blockchain bitcoin
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## The Mechanics of Blockchain

블록체인은 어떻게 중앙 서버 없이 신뢰를 만들어 내는 걸까? 

### Data structures

먼저 자료 구조 관점에서 살펴보자.

***[Block](https://klarciel.net/wiki/blockchain/blockchain-bitcoin-block-tx/)*** 에 대해서 설명하면 블록은 데이터를 담는 그릇이다.
비트코인의 경우 약 10분 동안 일어난 약 2,000~3,000개의 거래 내역(Transaction)이 하나의 블록에 담긴다.
그리고 각각의 블록은 독립적으로 존재하지 않는다. 모든 블록은 자신의 헤더에 **'직전 블록의 해시값(Previous Block Hash)'** 을 포함하여 체인(chain)을 구성한다.
이러한 연결 구조와 ***[Hash](https://klarciel.net/wiki/blockchain/blockchain-bitnode-crypto-hash/)*** 함수를 사용하는 덕분에 해커가 거래 내역을 단 1비트만 수정하더라도 블록 해시값이 변경되어 검증에 실패하게 된다.

### Network

다음으로는 네트워크 관점에서 살펴보자.

기존 시스템(Client-Server)에서는 하나의 중앙 서버가 원본을 가진다. 하지만 블록체인은 P2P(Peer-to-Peer) 네트워크를 사용한다. 전 세계 수만 개의 노드(컴퓨터)가 **모두 똑같은 장부(블록체인)** 를 복사해서 가지고 있다.
A가 B에게 1BTC 를 보내면, 이 사실이 전 세계 노드들에게 ***[전파(Broadcast)](https://klarciel.net/wiki/blockchain/blockchain-bitnode/)*** 되며, 모든 노드는 각자 이 거래가 유효한지(잔고는 있는지, 서명은 맞는지) 검증한다.

### Consensus: Pow

다음으로는 합의 관점에서 살펴보자.

P2P 네트워크의 치명적인 약점은 **["순서(Order)"](https://klarciel.net/wiki/blockchain/blockchain-double-spending-problem/)** 를 정하기 어렵다는 것이다. 한국에 있는 노드와 미국에 있는 노드가 서로 다른 순서로 거래를 기록하면 장부가 갈라진다.
이를 해결하기 위해 비트코인은 ***['리더 선출'](https://klarciel.net/wiki/blockchain/blockchain-double-spending-problem/)*** 시스템을 도입했다. 

__[수학 퍼즐 풀기(Mining)](https://klarciel.net/wiki/blockchain/blockchain-proof-of-work/)__:
- 모든 참여자(채굴자)는 블록을 생성할 권한을 얻기 위해 엄청난 컴퓨팅 파워를 써서 수학 문제(Nonce 찾기)를 푼다.
- 비트코인에서 리더를 선출하는 방법이 바로 ***[해시 퍼즐(Hash Puzzle)](https://klarciel.net/wiki/blockchain/blockchain-proof-of-work/)*** 이다. 특정 순간에 해시 퍼즐을 가장 먼저 해결한 단 하나의 노드에게만 기록할 수 있는 권리가 주어진다.
- 리더의 역할은 **'거래의 순서를 정하는 것'** 이다.

PoW 를 뚫고 선출된 리더(채굴자)가 멤풀(대기실)에 떠다니는 수천 개의 거래 중 유효한 것을 골라 블록에 담고 순서를 매긴다. 다른 모든 노드들은 이 블록을 검증할 때, 리더가 정한 순서대로 잔고를 계산한다.
- 리더 - "이번 10분 동안 일어난 거래의 순서는 내가 정한다. 내 블록 장부에 따르면 밥에게 보낸 거래(Tx A)가 첫 번째다. 그러므로 뒤늦게 발견된 찰리에게 보낸 거래(Tx B)는 잔고 부족으로 무효(Invalid)다."

__가장 긴 체인 규칙 (Longest Chain Rule)__:
- 누군가 문제를 풀고 블록을 전파하면, 다른 노드들은 이를 검증하고 자신의 장부에 추가한다. 만약 동시에 두 명의 리더가 나왔다면? **"더 많은 작업량(누적 난이도)이 들어간 체인"** 을 진짜로 인정하고 나머지는 버린다.

이 규칙 덕분에 전 세계 노드들은 중앙 관리자 없이도 단 하나의 **'합의된 진실(Consensus)'** 을 유지할 수 있다.

#### Why verification is necessary

검증이 필요한 이유는 리더가 정직하게 행동했는지, 위변조 등의 조작을 통해 자신에게 유리하도록 악위적인 행위를 하진 않았는지를 확인해야 한다. 즉, '신뢰'를 위해서 '검증'이 필요한 것이다.
즉, 검증은 ***리더가 정직하게 기록했는지 확인하는 과정*** 이다. 이 검증은 모두가 참여할 수 있다.

생성된 블록들이 브로드캐스팅되면 전체 노드에게 전달되고, 각 노드는 블록이 도달하는 즉시 ***블록의 무결성을 검증*** 한다. 무결성 검증은 크게 두 가지를 점검한다.
하나는 해시 퍼즐의 정답을 찾은 것이 맞는지 확인하고, 다른 하나는 블록에 기록된 트랜잭션이 조작되지 않고 원래 네트워크에 제출됐던 그대로인지 확인하는 것이다.

이 두 검증은 ***해시함수와 전자서명, 비대칭 암호화 기법을 활용해 순식간에 이뤄진다.***

## Lifecycle of a Transaction

- 서명(Sign): Alice 가 Bob 에게 1 BTC를 보내는 거래를 생성하고 개인키로 서명한다.
- 전파(Broadcast): 거래가 P2P 네트워크를 통해 전파되어 **멤풀(Mempool)** 이라는 대기실에 들어간다.
- 채굴(Mining): 채굴자가 멤풀에서 거래를 꺼내 블록을 만들고, PoW 퍼즐을 푼다.
- 검증(Validation): 퍼즐을 푼 채굴자가 블록을 전파하면, 다른 노드들이 이를 검증한다.
- 확정(Confirm): 검증된 블록이 체인에 연결되고, 이후 6개 이상의 블록이 더 쌓이면 거래는 되돌릴 수 없는 상태(Finality)가 된다.

## References

- 비트코인의 탄생부터 블록체인의 미래까지 명쾌하게 이해하는 비트코인·블록체인 바이블 / 장세형 저
- 비트코인과 블록체인 가상자산의 실체 2/e / 이병욱 저 