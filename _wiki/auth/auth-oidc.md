---
layout  : wiki
title   : Authorization Code Flow with Proof Key for Code Exchange
summary : OpenIdConnect, Authorization Code Grant with PKCE
date    : 2023-08-02 15:54:32 +0900
updated : 2023-08-02 20:15:24 +0900
tag     : auth oidc
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## OpenIdConnect

OpenId is Open standard for authentication that allows applications to verify users' identities without collecting and storing login information.

OpenID Connect (OIDC) is an identity layer built on top of the OAuth 2.0 framework(Authorization framework that defines authorization protocols and workflows).

OpenID Connect 에서는 scope 를 __openid, profile, email, address__ 로 표준화했다.

IdToken 을 검증하기 위해서 OpenIdProvider 가 제공하는 공개키 목록을 조회한 후, 서버에서는 일정 기간 캐싱해두어서 사용한다.

공개키 목록이 필요한 이유는 IdToken(JWT Format) 을 검증해야하기 때문이다.

kid 를 사용하여 JWT 를 검증할 때, 해당 토큰의 헤더에 있는 kid 값을 확인하고, 해당 값과 일치하는 공개키를 사용하여 서명(signature)을 검증해야 한다.

- [Implicit ID Token Validation](https://openid.net/specs/openid-connect-core-1_0.html#ImplicitIDTValidation)
- [ID Token Validation](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)

공식 문서에 나와있는 방식대로 검증을 해야한다. 보통 OpenIdProvider 에서 IdToken 정보를 넘겨주면 Payload 를 응답하는 조회 API 를 제공해주곤 하는데, 해당 API 를 사용해서
검증을 대체해서는 안된다.

## Authorization Code Flow with Proof Key for Code Exchange (PKCE)

The Authorization Code grant, when combined with the PKCE standard (RFC 7636), is used when the client, usually a mobile or a JavaScript application, requires access to protected resources.

The flow is similar to the regular Authorization Code grant type, but the client must generate a code that will be part of the communication between the client and the OpenID provider. This code mitigates against interception attacks performed by malicious users.

__[Authorization Code Flow with Proof Key for Code Exchange (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636)__:

![](/resource/wiki/auth-oidc/oidc-authz-pkce.png)

## Links 

- [OpenID Connect Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)
- [How OpenID Connect Works](https://openid.net/developers/how-connect-works/)
- [Google Login Docs](https://developers.google.com/identity/sign-in/web/backend-auth?hl=ko)
- [Authorization Code Grant with PKCE](https://backstage.forgerock.com/docs/am/7.1/oidc1-guide/openid-connect-authorization-code-flow-pkce.html)

## References

- THE OPENID CONNECT HANDBOOK / Bruno Krebs / Auth0