---
layout  : wiki
title   : Device Authorization Grant
summary : 
date    : 2024-05-20 22:57:32 +0900
updated : 2024-05-20 23:21:24 +0900
tag     : auth
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Device Authorization Grant

[OAuth 2.0 Device Authorization Grant](https://datatracker.ietf.org/doc/html/rfc8628) 란, 디바이스 권한 부여를 의미한다.
브라우저가 지원되지 않거나, 장치의 키보드 입력 기능이 제한된 경우 OAuth 를 사용하여 장치에 로그인하는 데 사용된다.

대표적인 예로 Apple TV 에서 Youtube 앱을 실행하는 경우가 있다.

- [Add the OAuth 2.0 Device Flow to any OAuth Server](https://developer.okta.com/blog/2019/02/19/add-oauth-device-flow-to-any-server)
- [OAuth 2.0 Device Flow Grant](https://alexbilbie.github.io/2016/04/oauth-2-device-flow-grant/)

__Device Authorization Grant Flow__

![](/resource/wiki/auth-device-authz-grant/device-authz-flow.png)

### Grant

OAuth 2.0 프레임워크에서 'Grant' 는 사용자의 인증 정보 혹은 권한을 안전하게 전달하는 방법을 의미한다.

OAuth 2.0 프로토콜에서 다루는 Grant 유형은 다음과 같다.

- [OAuth 2.0 Protocol - Grant Flows](https://baekjungho.github.io/wiki/auth/auth-oauth/#the-oauth-20-protocol)
- [Authorization Code Flow with Proof Key for Code Exchange](https://baekjungho.github.io/wiki/auth/auth-oidc/)

Device Authorization Grant 도 토큰 탈취등의 위험이 있을 수 있어 [Proof Key for Code Exchange](https://datatracker.ietf.org/doc/html/rfc7636) 방식을 같이 사용하는 것을 고민해보는 것도 좋다.

## Links

- [Spring Authorization Server](https://github.com/spring-projects/spring-authorization-server?tab=readme-ov-file)
- [OAuth 2.0 Device Grant - 기기 인증을 간편하게](https://devocean.sk.com//blog/techBoardDetail.do?ID=165966)