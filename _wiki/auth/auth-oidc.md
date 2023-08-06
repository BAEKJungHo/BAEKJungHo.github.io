---
layout  : wiki
title   : SocialLogin with OpenIdConnect
summary : 
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

__Flow__:

![](/resource/wiki/auth-oidc/oidc-flow.png)

위 흐름은 SocialLogin 로그인을 위한 IdToken 발급 과정 + 서비스 로그인으로 나뉘어져있다. (하나의 Flow 로 통합할 수도 있다. 참고 - [Kakao Login with Javascript SDK](https://developers.kakao.com/docs/latest/ko/kakaologin/js)) 

OpenIdProvider 에서는 302 Redirect 로 서비스 백엔드로 Redirect 하게된다. 클라이언트가 아니라 서버로 하는 이유는 __보안__ 때문이다. Authorization Code 가 클라이언트에 노출되면 IdToken, AccessToken 을 악의적인 사용자가 발급 받아 사용할 수도 있다. 굳이 클라이언트로 넘겨야한다면 [Authorization Code Flow with Proof Key for Code Exchange (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636) 방식을 적용하는게 좋다.

IdToken 을 검증하기 위해서 OpenIdProvider 가 제공하는 공개키 목록을 조회한 후, 서버에서는 일정 기간 캐싱해두어서 사용한다.

공개키 목록이 필요한 이유는 IdToken(JWT Format) 을 검증해야하기 때문이다. 

kid 를 사용하여 JWT 를 검증할 때, 해당 토큰의 헤더에 있는 kid 값을 확인하고, 해당 값과 일치하는 공개키를 사용하여 서명(signature)을 검증해야 한다.

- [Implicit ID Token Validation](https://openid.net/specs/openid-connect-core-1_0.html#ImplicitIDTValidation)
- [ID Token Validation](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)

공식 문서에 나와있는 방식대로 검증을 해야한다. 보통 OpenIdProvider 에서 IdToken 정보를 넘겨주면 Payload 를 응답하는 조회 API 를 제공해주곤 하는데, 해당 API 를 사용해서
검증을 대체해서는 안된다.

## Links 

- [OpenID Connect Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)
- [How OpenID Connect Works](https://openid.net/developers/how-connect-works/)
- [Google Login Docs](https://developers.google.com/identity/sign-in/web/sign-in?hl=ko)

## References

- THE OPENID CONNECT HANDBOOK / Bruno Krebs / Auth0