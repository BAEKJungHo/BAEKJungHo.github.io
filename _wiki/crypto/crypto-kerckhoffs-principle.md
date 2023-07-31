---
layout  : wiki
title   : Kerckhoffs Principle
summary : 암호체계의 안전성은 키의 비밀성에만 의존해야 한다
date    : 2023-07-27 15:05:32 +0900
updated : 2023-07-27 15:15:24 +0900
tag     : crypto
toc     : true
comment : true
public  : true
parent  : [[/crypto]]
latex   : true
---
* TOC
{:toc}

## Kerckhoffs Principle

케르크호프스의 원칙(Kerckhoffs Principle)이란 __비밀키(secretKey)__ 를 제외한 시스템의 다른 모든 내용이 알려지더라도 암호체계는 안전해야 한다는 의미이다.

더 쉽게 요약하면 __암호체계의 안전성은 키의 비밀성에만 의존__ 해야 한다는 의미이다.

source 와 destination 이 secretKey 를 사용하여 메시지를 노이즈(noise)하여 주고 받는 암호화 알고리즘을 __대칭 암호화(symmetric encryption)__ 라고 한다.

책에서는 다음과 같이 설명이 되어있다.

공개된 암호화 표준을 구축하는 것은 케르크호프스의 원칙이라는 개념과 관련이 있다. 이 원칙은 대략 다음과 같다. '우리가 가장 많이 사용하는 알고리즘을 적이 발견하지 못하리라고 기대하는 건 어리석은 일이다. 차라리 적에게 공개적으로 개방하자.'

## References

- Real-World Cryptography / David Wong / MANNING