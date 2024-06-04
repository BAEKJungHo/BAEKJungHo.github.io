---
layout  : wiki
title   : Keycloak
summary : 
date    : 2024-06-03 22:57:32 +0900
updated : 2024-06-03 23:21:24 +0900
tag     : auth keycloak
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Keycloak

__[Keycloak](https://www.keycloak.org/)__ 은 Open Source 기반의 IAM(Identity and Access Management) 소프트웨어로 사용자에 대한 인증(Authentication)과 인가(Authorization) 관리기능을 국제 인증/인가 표준 프로토콜(OIDC, SAML, OAuth 2.0 등) 기반으로 제공한다.

Keycloak 은 __SSO(여러 시스템을 하나의 인증 체계로 묶기)__ 를 지원한다. 따라서 사용자는 개별 애플리케이션이 아닌 Keycloak 으로 인증하며, Keycloak 에 로그인하면 사용자는 다른 애플리케이션에 액세스하기 위해 다시 로그인할 필요가 없다. (로그아웃도 동일)

Social Login 도 가능하다. 또한 신원 중개(Identity Brokering) 도 가능하다. 즉, OpenID Connect or SAML 2.0 Identity Providers 를 사용하여 로그인할 수 있다. (Google, Github, Facebook, etc)

- 구축 사례
  - [AWS 에서 Keycloak 기반 서비스 인증 체계 구축 하기 (1편) - 키클록(Keycloak) 이란?](https://www.sktenterprise.com/bizInsight/blogDetail/dev/5710)
  - [Keycloak 를 이용한 SSO 구축(web + wifi + ssh)](https://tech.socarcorp.kr/security/2019/07/31/keycloak-sso.html)

## Links

- [Keycloak Github](https://github.com/keycloak/keycloak)
- [SAML 에 대해 알아야 할 것](https://www.itworld.co.kr/tags/7981/SAML/108736#csidxf9be98904fde4659ca83db6f337ebf4)