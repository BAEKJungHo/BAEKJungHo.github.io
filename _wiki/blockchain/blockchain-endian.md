---
layout  : wiki
title   : Little Endian, Big Endian
summary : 
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

Little Endian 과 Big Endian 은 멀티바이트 데이터(e.g int, long)를 메모리에 어떤 순서로 저장하느냐에 대한 규칙이다.

CPU 는 보통 1바이트 단위로 메모리에 접근하지만, int(4바이트), long(8바이트) 같은 데이터는 여러 바이트로 구성된다. 즉, 바이트를 순서대로 저장해야 한다.
"이 여러 바이트를 어느쪽 부터 저장할 것인가"가 Endian 문제이다. 

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