---
layout  : wiki
title   : Mastering Developer's Guide to Seamless Social Logins
summary : Integrating Google, Apple, and Kakao with OpenIDConnect and OAuth
date    : 2024-09-15 00:05:32 +0900
updated : 2024-09-15 00:08:24 +0900
tag     : auth oidc
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## The Developer's Guide to Seamless Social Logins

OAuth 는 ___[open authorization](https://en.wikipedia.org/wiki/OAuth)___ 의 약자로, ___[Mechanism for Delegation of Authorization](https://security.stackexchange.com/questions/133065/why-is-it-a-bad-idea-to-use-plain-oauth2-for-authentication/134280#134280)___ 이다.

__OAuth 2.0 Abstract Flow__:

![](/resource/wiki/auth-social-login/abstract-flow.png)

OAuth 2.0 방식으로 Social Login 을 구현하는 경우 ___[Authorization Code Grant](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1)___ 방식을 사용하게 된다.

```
< Authorization Code Grant Flow >
1. 사용자가 App(client) 에 접근한다.
2. Client 는 사용자에게 접근 권한을 요청한다.
3. Client 는 사용자를 OAuthProvider 와 연결한다. 서비스 제공자는 사용자에게 Client 가 리소스에 접근할 권한에 대해 허용 여부를 직접 질의한다.
(사용자가 허락했다는 가정) 서비스 제공자는 Backend 에게 사용자의 리소스에 접근할 수 있는 액세스 토큰과 교환할 수 있는 태그(Authorization Code)를 전달한다.
4. Backend 는 Authorization Code 로 OAuthProvider 에게 AccessToken 을 요청한다.
5. Backend 는 OAuthProvider 가 준 AccessToken 을 이용해서, Application 을 이용할 수 있는 AccessToken, RefreshToken 등을 만들어서 Client 에게 응답한다.
6. Client 는 Backend 에서 발급한 AccessToken 을 가지고 Backend 에게 Resources 를 요청한다.
```

___Tag___ is known as an ___authorization code___ and it can be exchanged for an access token. The tag is a one-time-use tag, and so is said
to be ___consumable___.  OAuth 2.0에서는 인가 코드 만료시간을 10분으로 제한하도록 권장한다.

인가 요청 시 ___state(optional)___ 값을 담아서 보낼 수 있다. 클라이언트의 요청과 그에 따른 콜백 간의 상태를 유지하기 위해 사용되며, 클라이언트가 서비스 제공자에게 전달하면 서비스 제공자는 이 값을 다시 응답에 포함해서 전달한다. ___[Cross-site request forgery](https://en.wikipedia.org/wiki/Cross-site_request_forgery)___ 공격을 차단하가 위한 수단이 될 수 있다.

_Authorization Code Grant Flow_ 를 사용하는 경우 아래와 같은 프로퍼티들이 필요하다.

![](/resource/wiki/auth-social-login/properties.png)

_Authorization Code Grant Flow_ 에 보안이 조금 더 추가된 매커니즘이 ___[Authorization Code Flow with Proof Key for Code Exchange (PKCE)](https://baekjungho.github.io/wiki/auth/auth-oidc/)___ 이다.
악의적인 사용자에 의한 interception attacks 을 막을 수 있다.

이번엔 ___[OpenIdConnect](https://openid.net/developers/how-connect-works/)___ 에 대해서 알아보자.

___[OpenIDConnect(OIDC)](https://en.wikipedia.org/wiki/OpenID)___ 는 사용자가 안전하게 로그인하는 데 사용할 수 있는 OAuth 2.0 기반의 표준 ___Authentication___ 프로토콜이다.

표준 프로토콜이기 때문에 한 번만 구현 해두면, Apple, Google, Kakao 등 다양한 Provider 들에 대해서 서버에서 유연하게 처리할 수 있다.

OpenIDConnect 에서는 scope 를 ___openid, profile, email, address___ 로 표준화했다. ___[THE LAWS OF IDENTITY - Minimal Disclosure for a Constrained Use](https://baekjungho.github.io/wiki/auth/auth-the-laws-of-identity/)___ 원칙을 적용한 것이라고 보여진다.

IdToken 을 검증하기 위해서 OpenIdProvider 가 제공하는 공개키 목록을 조회한 후, 서버에서는 일정 기간 캐싱해두어서 사용한다. 공개키 목록이 필요한 이유는 IdToken(JWT Format) 을 검증해야하기 때문이다.

IdToken 은 그 자체로 로그인을 수행하게 만들 수 있기 때문에, 노출되어서는 안된다. 따라서 IdToken 을 Server Side 에서 얻도록 해야 한다.
또한 검증은 ___[IdTokenValidation](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)___ 을 따라야 한다.

다음으로는 ___OpenIdConnect Flow___ 를 살펴보자.

___[Google](https://developers.google.com/identity/openid-connect/openid-connect?hl=ko#java)___ 의 OpenIdConnect 구현 방법을 살펴보면 아래와 같은 순서로 가이드가 되어있다.

```
< OpenIdConnect Flow >
1. 위조 방지 상태 토큰 만들기
2. Google 에 인증 요청 보내기
3. 위조 방지 상태 토큰 확인
4. code을(를) 액세스 토큰 및 ID 토큰으로 교환
5. ID 토큰에서 사용자 정보 가져오기
6. 사용자 인증하기
```

여기서 code 는 ___Authorization Code___ 를 의미한다. 따라서 Client Side 에서 해야할 단계와 Server Side 에서 해야할 단계를 명확하게 구분 지을 수 있다.
1~3번까지는 Client Side 에서 진행할 수 있다. 4~6번은 Server Side 에서 진행한다. 

__OpenIdConnect Flow__:

![](/resource/wiki/auth-social-login/openidconnect-flow.png)

- ___[OpenID Authentication 2.0 - Final](https://openid.net/specs/openid-authentication-2_0.html)___ 

## References

- Mastering Oauth 2.0 / Charles Bihis