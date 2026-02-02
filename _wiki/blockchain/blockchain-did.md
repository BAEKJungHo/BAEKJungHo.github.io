---
layout  : wiki
title   : Decentralized Identifiers, Zero-Knowledge Proof
summary : 
date    : 2026-02-02 15:02:32 +0900
updated : 2026-02-02 15:12:24 +0900
tag     : blockchain did zkp
toc     : true
comment : true
public  : true
parent  : [[/blockchain]]
latex   : true
---
* TOC
{:toc}

## Decentralized Identifiers

블록체인과 암호기술의 발전은 ***디지털 신원(Digital Identity)*** 을 근본적으로 재정의하고 있다. 그 중심에는 ***[DID(Decentralized Identifier, 탈중앙 식별자)](https://www.w3.org/TR/did-core/)*** 와 ***영지식 증명(Zero-Knowledge Proof, ZKP)*** 이 있다.

오늘날 대부분의 디지털 신원은 중앙 기관에 의해 발급되고 관리된다.
- 정부가 발급하는 주민등록번호
- 기업이 발급하는 계정 ID
- 플랫폼이 관리하는 OAuth Identity

이 구조의 공통점은 신원의 소유자(User)와 신원을 통제하는 주체(Issuer)가 다르다는 점이다. 이로 인해 다음과 같은 문제가 발생한다.
- 중앙 서버 침해 시 대규모 개인정보 유출
- 서비스 제공자가 계정을 일방적으로 정지·회수 가능
- 신원을 증명하기 위해 항상 제3자를 거쳐야 함

이러한 한계를 해결하기 위해 등장한 개념이 ***자기주권 신원(Self-Sovereign Identity, SSI)*** 이다.

DID 는 사용자가 중앙 기관의 개입 없이도 자신이 누구인지 스스로 증명할 수 있게 해준다.

핵심 철학은 다음과 같다.

<mark><em><strong>"The entity that creates a DID controls it."</strong></em></mark>

### Syntax

DID 는 URI 문법을 따른다.

__중앙기관에 의존하는 URL 식별자__:

```
                IANA
                 ↓
https://example.com/page.html
           ↑           ↑
        Registrar   Licensee
```

__DID Syntax__:

```
did:<method>:<method-specific-identifier>
```

- method: DID를 생성·해석·검증하는 규칙 (예: did:ethr, did:key, did:web)
- identifier: 해당 method 내에서 고유한 식별자

중요한 점은 DID 자체에는 개인정보가 포함되지 않는다는 것이다. DID 는 단순한 문자열이 아니다. DID 를 해석(resolve)하면 DID Document 를 얻는다.

DID Document 에는 다음 정보가 포함된다.
- 공개키
- 인증 방식
- 서명 방식
- 서비스 엔드포인트

즉, "이 DID를 누가 통제하는가" 를 암호학적으로 증명하기 위한 최소한의 메타데이터다.

DID는 "누구인지"를 식별할 수는 있지만, 현실의 서비스에서는 보통 이런 질문이 필요하다.

- 이 사용자는 성인인가?
- 이 사용자는 특정 자격을 보유했는가?

여기서 문제가 발생한다. 증명하려는 사실보다 더 많은 정보를 노출하게 된다.

이를 해결하는 기술이 ***영지식 증명(ZKP)*** 이다.

## Zero-Knowledge Proof

영지식 증명(Zero-Knowledge Proof) 이란, 어떤 명제가 참이라는 사실을, 그 이유나 추가 정보 없이 증명하는 암호기술이다.

예를 들면 다음과 같다.
- "나는 19세 이상이다" → 증명
- 실제 생년월일 → 공개하지 않음

검증자는 참/거짓 만 알 수 있고, 그 외 정보는 얻지 못한다.

DID 와 ZKP 가 결합되면 다음 구조가 가능해진다.

- 사용자는 DID 를 소유
- 신뢰 기관이 ***[검증 가능한 자격증명(Verifiable Credential, VC)](https://en.wikipedia.org/wiki/Verifiable_credentials)*** 발급
- 사용자는 ZKP 로 필요한 속성만 선택적 증명
- 서비스는 중앙 기관 조회 없이 검증

DID 와 ZKP 를 사용한 대표적인 예시가 모바일 신분증이다.

## Links

- [DID USE CASES](https://www.w3.org/TR/did-core/#bib-did-use-cases)
- [Decentralised Identifiers: An Introduction](https://worldmobile.io/blog/post/decentralised-identifiers-an-introduction)
- [Uniform Resource Identifier (URI): Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986)
- [대한민국 최초의 디지털신분증]()
