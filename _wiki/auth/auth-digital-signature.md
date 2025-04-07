---
layout  : wiki
title   : Digital Signature
summary : 
date    : 2024-04-02 10:08:32 +0900
updated : 2024-04-02 10:15:24 +0900
tag     : auth
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Digital Signature

___[디지털 서명(digital signature, digital 署名)](https://ko.wikipedia.org/wiki/%EB%94%94%EC%A7%80%ED%84%B8_%EC%84%9C%EB%AA%85)___ 은 송신자가 자신의 비밀키(private key)로 암호화한 메시지를 수신자가 송신자의 공개키(public key)로 해독하는 과정이다.
이때 공개키가 유출된다면 의도하지 않은 공격자에 의해 데이터가 복호화될 위험이 있지만, 디지털 서명은 데이터를 보호하는 것이 목적이 아니라 ___송신자의 신원을 증명하는 것이 목적___ 이다.

___[Digital Signature](https://en.wikipedia.org/wiki/Digital_signature)___ 은 일반적으로 다음의 세 가지 알고리즘으로 구성된다.

- 키 생성 알고리즘 G: 서명자의 키 쌍(PK, SK)을 생성한다. PK는 공개 검증 값, 그리고 SK는 비밀 서명 값이다.
- 서명 생성 알고리즘 S: 메시지 m과 서명 값 SK를 입력하고, 서명 σ를 생성한다.
- 서명 검증 알고리즘 V: 메시지 m, 검증 값 PK, 서명 σ을 입력하고, 승인 또는 거부를 출력한다.

디지털 서명은 문서의 원본 발신처를 ___인증(authentication)___ 하는 데에 사용할 수 있다. 디지털 서명에 사용되는 개인 키 값의 소유권을 특정 이용자에게 인증될 수 있을 때, 서명이 유효하다면 그 문서가 개인 키 값을 소유한 사람에게서 발신되었다는 것을 확인할 수 있게 된다. 발신자임을 높은 신뢰도로 확인하는 것은 금융에서 특히 중요하다.

## References

- [New Directions in Cryptography](https://ee.stanford.edu/~hellman/publications/24.pdf)