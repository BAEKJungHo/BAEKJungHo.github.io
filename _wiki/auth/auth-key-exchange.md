---
layout  : wiki
title   : Key Exchange
summary : 
date    : 2025-04-10 10:08:32 +0900
updated : 2025-04-10 10:15:24 +0900
tag     : auth crypto
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Key Exchange

___[키 교환(Key Exchange)](https://en.wikipedia.org/wiki/Key_exchange)___ 은 앨리스와 밥이 각각 가상키(공개키/개인키 쌍)를 생성하고 공개키를 서로에게 보낸다. 그 다음 앨리스는 밥의 공개 키와 자신의 비밀 키를 사용하여 ___[공유 비밀(shared secret)](https://en.wikipedia.org/wiki/Shared_secret)___ 을 계산한다. 밥도 마찬가지다.

교환을 관찰하는 중간자(MITM) 공격자는 동일한 공유 비밀을 도출할 수 없기 때문에 통신을 복호화 할 수 없다. 하지만 앨리스와 밥이 키 교환을 할때 교환되는 공개 키는 인증되지 않았기 때문에 능동적인 MITM 공격자에게 취약하다. 실제로 공격자가 연결의 양쪽을 가정하고 두 개의 개별 키 교환을 수행할 수 있다.

그렇게 때문에 ___[인증된 키 교환(Authenticated Key Exchange)](https://en.wikipedia.org/wiki/Authenticated_Key_Exchange)___ 이 되어야 한다.

> 테슬라 ___[가상키 프로비저닝(Virtual Key Provisioning)](https://developer.tesla.com/docs/fleet-api/virtual-keys/overview)___ 에서 Third-Party Application 의 공개키를 차량에 세팅하는 이유가 Session Handshake 시 인증된 키 교환을 위해서이다.

양측이 인증받는 경우는 상호 인증된 키 교환(mutually authenticated key exchange) 라고 한다.

키 교환은 유용하지만, 그 자매품이라 할 수 있는 프리미티브인 ___[디지털 서명(Digital Signature)](https://klarciel.net/wiki/auth/auth-digital-signature/)___ 이 없으면 어떤 시나리오에서도 제대로 확장되지 않는다.

서명(sign) 의 주된 사용은 인증된 키 교환 이다.

앨리스와 밥이 보안 채널을 설정하려는데 밥이 앨리스의 검증키를 알고 있다고 가정해보자. 앨리스는 서명 키를 사용하여 키 교환을 인증할 수 있다. 앨리스는 키 교환으로 키 쌍을 생성하고 서명 키로 공개 키 부분에 서명한 다음, 서명과 함께 키 교환 공개키를 보낸다. 밥은 이미 알고 있는 연결된 검증 키를 사용하여 서명이 유효한지 확인한 다음, 키 교환 공개 키를 사용하여 키 교환을 수행할 수 있다.
이러한 키 교환을 인증된 키 교환 이라 한다.

서명 알고리즘으로 대표적인 것이 ___[ECDH(타원 곡선 디지털 서명 알고리즘)](https://ko.wikipedia.org/wiki/%EB%94%94%ED%94%BC-%ED%97%AC%EB%A8%BC_%ED%82%A4_%EA%B5%90%ED%99%98)___ 이다. 이는 ECDH 가 더 작은 키 때문에 DH 를 대체 했다.

## References

- Real-World Cryptography / David Wong / MANNING