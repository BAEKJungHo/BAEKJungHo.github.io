---
layout  : wiki
title   : BITCOIN NODE
summary : 
date    : 2026-01-09 17:54:32 +0900
updated : 2026-01-09 18:15:24 +0900
tag     : blockchain bitcoin tdd broadcasting
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
toy     : Bitcoin
---
* TOC
{:toc}

## BITCOIN NODE

![](/resource/wiki/blockchain/bitcoin.png)

Bitcoin ***[Node](https://learnmeabitcoin.com/beginners/guide/network/)*** 를 구현하는 Toy Project 이다.
프로젝트의 본질은 비트코인 네트워크의 일원(Node)이 되는 것이다.

기본적으로 Node, Peer, Broadcasting 의미를 알아야 한다.

![](/resource/wiki/blockchain/node.png)

***노드(Node)*** A 에게 ***피어(Peer)*** B, C 이다. 그리고 A 가 생성한 데이터는 각 피어에게 전달되고, 전달된 피어들이 또 자신의 피어들에게 전달하게되어 궁극적으로 모든 노드에게 전달된다.
이를 ***브로드캐스팅(Broadcasting)*** 이라고 한다. 블록체인에서 모든 노드는 결과적으로 동일한 데이터를 갖게 된다.

