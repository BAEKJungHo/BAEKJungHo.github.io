---
layout  : wiki
title   : Security Properties Of Hash Functions
summary : 
date    : 2023-08-07 15:05:32 +0900
updated : 2023-08-07 15:15:24 +0900
tag     : crypto hash
toc     : true
comment : true
public  : true
parent  : [[/crypto]]
latex   : true
---
* TOC
{:toc}

## PreImage Resistance

역상 저항성(pre-image resistance)은 주어진 출력을 입력으로 바꾸는 역함수를 누구도 만들 수 없다는 성질이다.

주어진 입력이 __너무 작거나 예측 가능하다면__, 올바른 해시값을 찾아낼 수 있다는 단점이 있다.

## Second PreImage Resistance

제 2역상 저항성(second pre-image resistance)은 입력과 입력에 해당하는 다이제스트가 주어졌을 때 해당 다이제스트를 생성하는
다른 입력을 찾을 수 없다는 성질이다.

## Collision Resistance

충돌 저항성(collision resistance)은 아무도 동일한 출력을 만드는 두 개의 다른 입력을 생성할 수 없도록 보장한다는 성질이다.

## References

- Real-World Cryptography / David Wong / MANNING