---
layout  : wiki
title   : Zero Trust Architecture
summary : 
date    : 2025-05-02 15:02:32 +0900
updated : 2025-05-02 18:12:24 +0900
tag     : architecture sdv security
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Zero Trust Architecture

___[Zero Trust Architecture](https://en.wikipedia.org/wiki/Zero_trust_architecture)___ 는 ___Never Trust___, ___Always Verify(Continuous Verification)___, ___Least Privilege___, ___Dynamic Policies___ 원칙을 따른다.
즉, 어떤 요청이든, 인증과 권한 확인 전까지는 허용하지 않으며, 요청마다 데이터 소유자, 권한, 토큰, 장치 상태 등을 검증하고, 	필요한 범위 내 데이터만 제공하는 원칙이다.

제로 트러스트 원칙은 ___데이터 접근(data access)___ 및 ___데이터 관리(data management)___ 에 적용될 수 있다.

## Tesla Vehicle Profile Access Control with Zero Trust Architecture

__Virtual Scenario__:
- Tesla 는 유저의 차량 프로필 데이터(예: 즐겨찾는 네비 목적지, 오디오 선호 설정, 시트 포지션 등)를 서버에 저장
- IVI(차량 내 인포테인먼트 시스템)가 이 데이터를 불러와 사용자 경험을 맞춤화함
- 여러 유저가 동일 차량을 쓸 수 있는 상황이기 때문에, 정확한 사용자 식별과 권한 확인이 필요

1. 사용자 식별 + 인증 (Identity Verification)
- 차량 또는 IVI는 사용자가 로그인하거나 디바이스를 인증한 후, Tesla 서버에 요청을 보냄.
- 서버는 ID 토큰 + 디바이스 인증서를 통해 해당 유저가 누구인지 검증.

2. 권한 검증 (Authorization)
- Tesla 서버는 요청한 유저가:
    - 차량 프로필 데이터에 접근 가능한가?
    - 특정 필드(navi 설정, 음악 설정 등)에 접근 가능한가?
    - 차량 소유자, 게스트, 관리자 등 어떤 역할인가?
    - Role-based Access Control(RBAC) 혹은 ___[Attribute-Based Access Control (ABAC)](https://en.wikipedia.org/wiki/Attribute-based_access_control)___ 로 세분화된 권한 체크

3. 세션 조건 / 장치 상태 검증 (Context-Aware Access)
- 차량이 루팅되었거나, IVI 시스템이 이상 동작하는 상태라면 접근 거부
- 유저가 너무 오랜 시간 활동이 없었거나, 장치가 최근 갱신되지 않은 인증서를 사용한다면 추가 인증 요청

4. 데이터 최소화 (Least Privilege)
- e.g 게스트 유저는 개인 navi 설정은 못 보고, 일반 차량 정보만 조회 가능
- e.g 차량 내부 시스템은 ‘시트 위치 설정’만 받고 나머지 프로필은 불러오지 않음

## Mutual Authentication (mTLS)

Zero Trust Architecture 는 네트워크 내에서도 모든 통신을 암호화하고, 상호 인증을 수행하는 ___[mTLS (Mutual TLS)](https://en.wikipedia.org/wiki/Mutual_authentication)___ 를 선호한다. MSA 간 통신은 보안이 필수적일 뿐만 아니라, GDPR 및 HIPAA 와 같은 많은 규정에서도 전송 중인 모든 데이터를 보호하기 위해 종단 간 암호화를 권장합니다.
제로 트러스트 보안 시대에는 각 마이크로서비스 통신(요청-응답)이 인증, 승인 및 암호화되어야 한다.

하지만 mTLS 를 활성화할 수 없는 다른 팀이나 Third-Party 가 소유한 다른 애플리케이션에 API 호출을 보내거나 받아야 할 수 있다.
또한 Observability 를 위해서 원격 측정 데이터를 전송해야할 수도 있기 때문에 항상 mTLS 를 쓸 수 있는 것은 아니다.

__인증서 생성 순서__
- 자체 서명 루트 인증서(Root CA) 생성 (ca.crt)
- 서버 인증서 키 생성 (server.key): 서버가 TLS 통신에서 사용할 개인키
- 서버 인증서 CSR 생성 (server.csr): 서버 정보와 공개키가 포함된 서명 요청 문서
- 서버 인증서 생성 및 CA 루트 키로 서명: CA로 서명된 서버 인증서, CA의 신뢰 체계 내에 있으므로 클라이언트는 이 인증서를 신뢰할 수 있음
- 클라이언트 인증서 키 생성 (client.key)
- 클라이언트 인증서 CSR 생성 (client.csr)
- 클라이언트 인증서 생성 및 CA루트 키로 서명

## Attribute-Based Access Control

__[Timeline of Classical Access Control Models](https://profsandhu.com/dissert/Dissertation_Xin_Jin.pdf)__:

<img width="396" alt="스크린샷 2025-05-02 오후 7 06 36" src="https://github.com/user-attachments/assets/08eb3982-940d-483b-a273-87f2dc04c2df" />

ABAC 은 사용자의 역할뿐 아니라, 속성(Attribute) 기반으로 동적으로 접근 권한을 결정하는 방식이다. 상황 인지 기반 제어(Context-aware access)가 가능하다는 특징이 있다.

__구성 요소__:
- Subject Attributes: 사용자 속성 (예: 직책, 부서, 나이, 인증 수단 등)
- Resource Attributes: 자원 속성 (예: 민감도, 소유자 등)
- Environment Attributes: 환경 속성 (예: 시간, 위치, 디바이스 상태 등)
- Policy: 속성을 기준으로 접근 가능 여부를 정의한 규칙

```
Policy: if user.department == "dev" AND resource.sensitivity != "high" THEN allow READ
```

- "User.department == 'engineering'" 이고 "access_time < 18:00" 일 때만 코드를 볼 수 있음
- "User.age > 18" 이고 "Device.isTrusted == true" 인 경우에만 차량 원격 시동 가능

## Links

- [Mutual TLS: A Tutorial](https://builtin.com/software-engineering-perspectives/mutual-tls-tutorial)
- [Mutual TLS: Securing Microservices in Service Mesh](https://thenewstack.io/mutual-tls-microservices-encryption-for-service-mesh/)

## References

- [Zero Trust Architecture](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf)