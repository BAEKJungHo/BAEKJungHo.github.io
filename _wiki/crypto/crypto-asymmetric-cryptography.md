---
layout  : wiki
title   : Asymmetric Cryptography
summary : 
date    : 2023-07-28 15:05:32 +0900
updated : 2023-07-28 15:15:24 +0900
tag     : crypto
toc     : true
comment : true
public  : true
parent  : [[/crypto]]
latex   : true
---
* TOC
{:toc}

## Asymmetric Cryptography

비대칭 암호학(asymmetric cryptography)은 공개키와 비밀키를 사용하는 방식이다.

- 공개키 = 열린 상자
- 비밀키 = 상자 열쇠

누구나 열린 상자에 담아서 비밀키 소유자에게 메시지를 보낼 수 있다. 열린 상자에 담겨진 메시지는 비밀키가 있어야 볼 수 있다. 아무나 열지 못한다.
즉, 공개키로 메시지를 암호화하고, 비밀키 소유자는 메시지를 받으면 비밀키로 복호화 하는 방식을 의미한다. 

## References

- Real-World Cryptography / David Wong / MANNING