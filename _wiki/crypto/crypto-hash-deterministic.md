---
layout  : wiki
title   : Deterministic
summary : 
date    : 2023-08-05 15:05:32 +0900
updated : 2023-08-05 15:15:24 +0900
tag     : crypto hash
toc     : true
comment : true
public  : true
parent  : [[/crypto]]
latex   : true
---
* TOC
{:toc}

## Deterministic

결정론적(deterministic)이란 동일한 입력이 주어지면 항상 동일한 결과를 생성한다는 뜻이다.

## Digest

다이제스트(digest)는 해시 함수의 출력을 의미한다. 해시(hash)라고도 한다.

> OpenSSL 은 네트워크를 통한 데이터 통신에 쓰이는 프로토콜인 TLS 와 SSL 의 오픈 소스 구현판이다. C 언어로 작성되어 있는 중심 라이브러리 안에는, 기본적인 암호화 기능 및 여러 유틸리티 함수들이 구현되어 있다.

같은 입력을 해시하면 같은 결과를 얻는다.

```ssh
$ echo -n "hello" | openssl dgst -sha256 // 2cf24db...
$ echo -n "hello" | openssl dgst -sha256 // 2cf24db...
```

## References

- Real-World Cryptography / David Wong / MANNING