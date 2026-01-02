---
layout  : wiki
title   : Satoshi
summary : Little Endian, Big Endian
date    : 2026-01-02 11:54:32 +0900
updated : 2026-01-02 12:15:24 +0900
tag     : blockchain bitcoin
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Little Endian, Big Endian

CPU 는 보통 1바이트 단위로 메모리에 접근하지만, int(4바이트), long(8바이트) 같은 데이터는 여러 바이트로 구성된다. 즉, 바이트를 순서대로 저장해야 한다.
시스템이 내부적으로 사용하는 바이트 순서를 ***internal byte order*** 라고 한다. Little-endian / Big-endian은 internal byte order 를 정의하는 규칙이다. 즉, 멀티바이트 데이터(e.g int, long)를 메모리에 어떤 순서로 저장하느냐에 대한 규칙이다.

예를 들어 숫자 0x12345678 를 메모리에 저장하는 경우 아래와 같이 된다.

| 방식            | 메모리 저장      |
| ------------- | ----------- |
| Big-endian    | 12 34 56 78 |
| Little-endian | 78 56 34 12 |

![](/resource/wiki/blockchain-endian/byte-order.png)

__Big Endian__:
- 가장 큰 자리수(MSB, Most Significant Byte)를 가장 낮은 메모리 주소에 저장한다.
- 사람이 숫자를 읽는 방식과 동일하다. (왼쪽에서 오른쪽)
- 디버깅, 패킷 분석에 직관적
- 네트워크 바이트 오더(Network Byte Order) = Big Endian

__Little Endian__:
- 가장 작은 자리수(LSB, Least Significant Byte)를 가장 낮은 메모리 주소에 저장한다.
- 계산 효율 중심
- 덧셈/뺄셈 등 연산에 유리
- 하위 바이트부터 처리 가능
- x86 / x64 (Intel, AMD) CPU는 Little Endian
- 타입 변환에도 유리 
  - 예를 들어 0x00000010 이라는 값을 저장할때 Little Endian 은 10 00 00 00 으로 저장한다. Big Endian 은 00 00 00 10 으로 저장한다. 이 값을 1바이트로 cast 하는 경우 Little Endian 은 뒤의 값을 잘라버리면 된다.

비트코인은 네트워크 전송 시 Little-endian 을 사용하며
사람이 보는 블록 해시는 Big-endian 으로 되어있다.

## Satoshi

비트코인의 거래는 P2P 기반 분산 데이터베이스에 의해 이루어지며, 공개 키 암호 방식 기반으로 거래를 수행한다. 비트코인은 공개성을 가지고 있다. 비트코인은 지갑 파일의 형태로 저장되며, 이 지갑에는 각각의 고유 주소가 부여되며, 그 주소를 기반으로 비트코인의 거래가 이루어진다.

사토시(satoshi)는 비트코인의 최소 화폐 단위이다. 비트코인은 소수점 8자리까지 나눌 수 있게 설계됐다. 암호화폐 거래소 업비트 등에서 비트코인을 소량 구매할때 소수점이 8자리로 되어있는 것을 볼 수 있다.

| 단위              | 값                    |
| --------------- | -------------------- |
| 1 Bitcoin (BTC) | 100,000,000 satoshis |
| 1 satoshi       | 0.00000001 BTC       |

비트코인의 창시자인 '사토시 나카모토(Satoshi Nakamoto)'의 이름에서 유래했다. 우리가 흔히 말하는 1BTC 는 사실 사용자 편의를 위한 표기일 뿐이며, 블록체인 내부(Raw Data)에서는 모든 거래가 사토시 단위의 정수로 처리된다.

왜 1억분에 1로 나누었을까?

__부동소수점 오류 방지__:
- 부동 소수점(Floating Point)이란 컴퓨터가 소수점이 있는 실수(Real Number)를 표현하는 방식으로, 소수점의 위치를 고정하지 않고 유효숫자(가수)와 소수점 위치를 나타내는 지수(exponent)로 나누어 저장하여 매우 크거나 작은 숫자까지 표현할 수 있게 한다. 단점으로 **정밀도 한계**가 존재하여 모든 실수를 정확히 표현하지 못하고 근사값을 저장하므로 오차가 발생할 수 있다.
- 컴퓨터는 소수(0.1, 0.01 등)를 처리할 때 '부동소수점(Floating Point)' 방식을 사용한다. 하지만 이 방식은 미세한 연산 오차를 발생시킬 수 있다.
  - 금융 시스템에서 0.00000001 + 0.00000002가 0.00000003000000004가 되는 상황은 용납될 수 없습니다.
  - 따라서 비트코인 코어(Bitcoin Core) 소스코드는 내부적으로 모든 금액을 '정수(Integer)'인 사토시 단위로 계산하고 저장한다. UI 에서만 사용자에게 BTC(소수점)로 보여줍니다.

__미래 가치 상승에 대비__:
- 비트코인이 전 세계적인 지불 수단이 되었을 때, 1 BTC의 가치가 매우 높아질 것을 대비했다. 만약 1 BTC가 10억 원이 된다면, 커피 한 잔(5,000원)을 사기 위해서는 0.000005 BTC를 보내야 한다. 이는 직관적이지 않다. 대신 "500 사토시(sats)를 보낸다"라고 표현하는 것이 훨씬 계산과 표기에 유리하다.

## Links

- [What does the little-endian notation improve for Bitcoin?](https://bitcoin.stackexchange.com/questions/103345/what-does-the-little-endian-notation-improve-for-bitcoin#answer-103349)