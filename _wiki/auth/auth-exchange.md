---
layout  : wiki
title   : Exchange
summary : Delegation Semantics
date    : 2024-06-29 10:08:32 +0900
updated : 2024-06-29 10:15:24 +0900
tag     : auth exchange
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Exchange with Client Credentials Flow

Exchange 란 말 그대로 교환을 의미한다. _[Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)_ 란 X 토큰 정보를 Y 로 교환하는 것을 의미한다.

대기업 혹은 [해당 사례](https://cloudentity.com/developers/basics/oauth-extensions/token-exchange/)에서 볼 수 있듯이, 보통 파트너십을 체결한 경우에 사용되곤 한다.

토큰 교환의 구체적인 흐름을 보기 전에 __subject_token__ 에 대해 알면 좋다. [Delegation vs. Impersonation Semantics](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-token-exchange-05#section-1.1) 해당 문서에 잘 나와있다.

__위임 의미론(Delegation Semantics)__ 은 주체(subject) A 는 B 와 별도로 자신의 정체성(identity)을 가지고 있으며, B 가 자신의 권리 일부를 A 에게 위임 했을 수 있다. 즉, A 는 B 의 대리인이라 볼 수 있다.
위임 의미론은 subject 와 actor 를 포함하는 __composite token__ 으로 표현된다. subject_token 은 토큰 교환을 요청하는 당사자의 신원을 나타내고 actor_token 은 교환된(발급된) 토큰의 액세스 권한이 위임되는 당사자의 신원을 나타낸다.
composite token 은 이 두 토큰 정보를 포함한다. 예를 들어 clientA, clientB 가 있고 clientA 에서 B 의 행동을 대신 하는 경우 토큰 교환 시 actor_token 을 전송해야 한다.

[RFC8693 - Token Exchange Example](https://datatracker.ietf.org/doc/html/rfc8693#name-example-token-exchange) 을 통해 표준 흐름을 살펴볼 수 있다.

__[How Token Exchange Works](https://cloudentity.com/developers/basics/oauth-extensions/token-exchange/)__:

![](/resource/wiki/auth-exchange/cloudentity-token-exchange.png)

Token Exchange 역할을 하는 서비스를 __Security Token Service(STS)__ 라고도 한다.
STS 는 제공된 토큰을 검증하고 응답에서 새 토큰을 발행하는 서비스로, 클라이언트 애플리케이션이 분산 환경 내에 있는 리소스에 대한 적절한 보안 토큰을 얻을 수 있도록 한다.

__Token Exchange Request Details__:
- token exhange 를 위한 actor server 의 endpoint
  - ```
    curl -v https://test.us.authz.stage.cloudentity.io/test/default/oauth2/token -d
    "grant_type=urn:ietf:params:oauth:grant-type:token-exchange&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&subject_token=$AT"
    ```
- client_id: 토큰 교환을 목적으로 Cloudentity 에 등록된 클라이언트 애플리케이션의 클라이언트 식별자
- client_secret: client_secret- 토큰 교환을 목적으로 Cloudentity 에 등록된 클라이언트 애플리케이션의 클라이언트 비밀
- subject_token: Cloudentity 의 액세스 토큰으로 교환될 제3자 인증 서버의 액세스 토큰입니다.
- subject_token_type: 매개변수에 포함된 보안 토큰의 유형을 나타냄
- actor_token(optional): 행동 당사자의 신원을 나타내는 보안 토큰
- actor_token_type(actor_token 존재하는 경우 필수): 액터 토큰의 토큰 유형

## Links

- [RFC 8693 OAuth 2.0 토큰 교환](https://www.authlete.com/developers/token_exchange/)