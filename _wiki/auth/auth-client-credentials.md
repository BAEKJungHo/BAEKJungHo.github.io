---
layout  : wiki
title   : Client Credentials Grant
summary : 
date    : 2024-06-22 10:08:32 +0900
updated : 2024-06-22 10:15:24 +0900
tag     : auth
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Client Credentials Grant

Client Credentials Grant 란 클라이언트의 자격증명만으로 Token 을 획득하는 방식을 의미한다.

__Client Credentials Flow__:

![](/resource/wiki/auth-client-credentials/client_credentials_flow.png)

### CCG 인증의 일반적인 특징

- 사용자 인증 불필요
    - 애플리케이션 대 애플리케이션 통신에 사용되며, 최종 사용자 인증은 필요하지 않습니다. -클라이언트(애플리케이션)는 사전에 발급된 Client ID와 Client Secret을 사용하여 인증을 요청합니다.
- 토큰 발급 및 사용
    - 클라이언트는 인증 서버에 Client ID와 Client Secret을 포함한 요청을 보냅니다.
    - 인증 서버는 이를 검증 후 Access Token을 발급합니다.
    - 클라이언트는 API 호출 시 이 Access Token을 인증 헤더에 포함시켜 사용합니다.
- 보안
    - Client Secret이 유출되지 않도록 보호해야 하며, HTTPS를 통해 통신하여 데이터가 안전하게 전달되도록 합니다.
    - 일반적으로 IP 화이트리스트 또는 VPN과 같은 네트워크 수준의 보안 장치와 함께 사용됩니다.

### 대기업에서 CCG 활용 흐름

- 사전 등록 및 승인
    - 기업 내부의 API 게이트웨이에 외부 시스템 또는 내부 서비스가 등록됩니다.
    - Client ID와 Client Secret은 서비스 등록 시 발급됩니다.
- 인증 및 토큰 발급
    - 외부 애플리케이션이 기업의 인증 서버로 Client Credential Grant 요청을 보냅니다.
    - 요청에 포함된 자격 정보가 유효하면 인증 서버는 Access Token을 발급합니다.
- API 호출
    - 외부 애플리케이션은 API 요청 시 발급받은 Access Token을 포함시켜 호출합니다.
    - 게이트웨이는 Access Token의 유효성을 확인한 후 요청을 내부 API로 전달합니다.
- 토큰 갱신
    - CCG 방식에서는 리프레시 토큰을 사용하지 않으며, 기존 토큰이 만료되면 새로 요청해야 합니다.

### B2B 환경에서 CCG 활용

- 고객사 관리
    - B2B 고객사를 식별하기 위해 각 고객사에 고유한 Client ID와 Client Secret을 발급합니다.
    - 필요 시 고객사별로 API 접근 범위를 제한하는 스코프(Scope)를 설정합니다.
- 인증 플로우
    - 고객사 시스템에서 Client ID와 Client Secret을 이용해 인증 요청을 보냅니다.
    - 인증 서버에서 발급한 Access Token을 사용하여 게이트웨이에서 API 호출을 처리합니다.
- 접근 제어 및 감사 로그
    - 각 고객사의 요청은 Access Token을 기반으로 인증 및 권한 검사가 이루어집니다.
    - 고객사의 모든 요청은 감사 로그로 기록되며, 요청 추적 및 분석에 사용됩니다.
- 보안 강화
    - 고객사와의 통신은 HTTPS를 사용하여 암호화하며, 필요한 경우 IP 화이트리스트를 설정하거나 고객사에 별도의 VPN을 요구할 수 있습니다.
    - 일정 주기로 Client Secret을 갱신하여 보안을 강화합니다.

### CCG의 한계와 대안

- 클라이언트 보안
    - Client Secret 관리가 어렵거나 유출될 가능성이 있다면, 추가적인 보안 계층(ex. MTLS)을 적용할 수 있습니다.
- __사용자 기반 인증 불가능__
    - 특정 사용자 정보를 기반으로 인증해야 한다면 Authorization Code Grant를 사용해야 합니다.

사용자 기반 인증이 불가능하기 때문에, 토큰에서 사용자 정보(sub 등) 를 추출할 수 없다.