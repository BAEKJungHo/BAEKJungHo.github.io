---
layout  : wiki
title   : Decentralized Identifiers
summary : Core architecture, data model, and representations
date    : 2023-10-28 15:02:32 +0900
updated : 2023-10-28 15:12:24 +0900
tag     : architecture cloudnative
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Decentralized Identifiers

__[Decentralized identifiers](https://www.w3.org/TR/did-core/)__ (DIDs) are a new type of identifier that enables verifiable, decentralized digital identity.

DIDs are __[self-sovereign](https://www.lifewithalacrity.com/article/the-path-to-self-soverereign-identity/)__ Meaning that DID(분산 식별자) 를 생성하는 개인이나 조직이 DID 를 완전히 제어할 수 있다.

__Benefits__:
- 자율성
- 보안, 신뢰성

### Globally unique identifier

전역적으로 고유한 식별자 체계에 대한 필요성은 여러 번 해결되었다.

```
                IANA
                 ↓
https://example.com/page.html
           ↑           ↑
        Registrar   Licensee
```

위와 같은 URL 식별자는 발급 기관인 중앙 기관에 의존한다. 따라서, 식별자가 유효한지 검증하기 위해서는 중앙 기관에 문의를 해야 한다.

따라서, 특정 상황에서는 __발급 기관에 의존하지 않는 자기 주권(self-sovereign)적인 식별자__ 가 필요하다.

__Spec of self-sovereign identifier__:
- decentralized: there should be no central issuing agency;
- persistent: the identifier should be inherently persistent, not requiring the continued operation of an underling organization;
- cryptographically verifiable: it should be possible to prove control of the identifier cryptographically;
- resolvable: it should be possible to discover metadata about the identifier.

### [Data Model and Syntaxes](https://www.w3.org/2019/08/did-20190828/)

__A simple example of a Decentralized Identifier (DID)__:

```
did:method-name:specific-identifier
// did:example:123456789abcdefghi
```

여기서 "method-name"은 DID 를 생성하고 관리하는 방법을 나타내며, "specific-identifier" 는 해당 방법에 따라 고유하게 생성된 값이다.

## Links

- [DID USE CASES](https://www.w3.org/TR/did-core/#bib-did-use-cases)
- [Decentralised Identifiers: An Introduction](https://worldmobile.io/blog/post/decentralised-identifiers-an-introduction)
- [Uniform Resource Identifier (URI): Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986)
