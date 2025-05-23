---
layout: page
title: BAEK JUNG HO
permalink: /resume/
comment: false
latex: true
---
* TOC
{:toc}

## BAEK JUNG HO

<p align="center">
<img src="/resource/value/profile.jpeg" class="wp-image-8924 size-thumbnail" width="100" height="100" />
<br/><em><strong>BAEK JUNG HO</strong></em>
</p>

"문제를 정의하고, 데이터로 검증하며, 확장 가능한 솔루션을 설계하는" 엔지니어입니다. 특히 실시간 분산 시스템과 모빌리티 도메인에서의 깊은 경험은 저에게 많은 도움이 되었습니다.

## 핵심 성과 및 기술 역량

### 42dot (2022.08 ~ ing)

__SDV OS 와 Connection 을 맺는 환경에서 차량별 제어 명령 라우팅 모듈 설계__
- 목적: 차량 제어 명령을 해당 차량과 연결된 적절한 서버 인스턴스로 정확히 전달
- 환경: SDV OS 와 실시간 연결을 유지하는 다중 서버 클러스터
- 통신: SDV OS Remote Control Service ↔ Vehicle Connection Router 클러스터, gRPC Bidirectional Streaming 을 통한 실시간 양방향 데이터 교환
- 라우팅 모듈 설계: 차량별 제어 명령을 적절한 VCR 인스턴스로 라우팅하는 Message Routing Module 설계
- Tech Stack: Go, gRPC

__42dot 차량 제어 인증 시스템 혁신에 기여__
- Tesla Vehicle Control & Fleet Telemetry 오픈소스 분석 및 분석 결과로 시스템 재설계에 기여 (전담 주도)
- 연구 및 분석: Tesla 의 Vehicle Control 및 Fleet Telemetry 오픈소스 코드 심층 분석을 통한 Tesla 의 설계 사상 도출
- 시스템 재구축: 42dot 의 근거리(BLE)/원거리(Remote) 제어를 위한 인증 및 명령 플로우 재설계에 기여
- 보안 강화: 기존 시스템 대비 보안성과 사용자 경험을 동시에 향상시킨 새로운 인증 체계 방향성을 수립하는데 기여

__FCM 기반 통합 알림 플랫폼 구축__
- 다양한 Service Application Server 에서 사용가능한 FCM 기반의 알림 플랫폼 구축
- 플랫폼 설계: Firebase Cloud Messaging 을 활용한 확장 가능한 알림 플랫폼 아키텍처 설계
- 데이터 모델링: User, Token, Device 관리를 위한 테이블 설계
- 고가용성 시스템 구축 및 SPOF 해결: FCM 과 함께 Firestore 를 병렬로 활용하여 알림 유실에 대한 방지 및 고가용성 확보
- Tech Stack: Kotlin, Spring Boot, Kotest, Google Firestore, Firebase Cloud Messaging,  PostgreSQL, Datadog, Kubernetes

__개발 환경에서 차량 제어 테스트를 원활하게 하기 위한 Mock Device Server 구축__
- VEHICLE SIGNAL SPECIFICATION 기반으로 정의된 차량 데이터를 Mocking 하고 상태를 변경하는 서버
- 목적: 실제 차량 없이도 차량 제어 테스트를 용이하게 하기 위한 서버
- Tech Stack: Go, Redis

__차량 제어 도메인 모델링 및 시스템 아키텍처 설계__
- 확장 가능한 차량 제어 및 데이터 동기화 플랫폼
- 도메인 모델링: 복잡한 차량 제어 명령을 Type 기반으로 정의하여 Type Driven Architecture 를 도출, 문서화 및 설계
- 시스템 아키텍처: 마이크로서비스 기반의 분산 시스템으로 차량 제어와 실시간 데이터 동기화를 지원하는 플랫폼 구축
- Tech Stack: Kotlin, Spring Boot, Kotest, Google Firestore, Orda, PostgreSQL, Datadog, Kubernetes, Redis

__청계천 자율주행 버스 동시 배차 요청으로 인한 동시성 문제 해결__
- TAP! 자율 주행 호출 서비스
- 데이터 기반으로 개발과정에서 의사결정을 하고 문제 해결: 에러율 0% 달성
- 문제 정의: 동시 배차 요청으로 인한 시스템 충돌 및 에러 발생 현상 분석. 공유 자원인 운행 중인 차량의 무분별한 상태 변경을 보호하기 위해 Distributed Lock 을 적용했지만, 락이 점유 중일 경우 Exception 을 발생시키는 구조가 문제
- 해결 과정
  - 1. 동시성 이슈 해결 방법 검토
    - Database 격리 수준을 **Serializable Read** 로 올리는 방안을 검토했으나, 데이터의 무결성을 유지할 순 있지만 성능 저하가 예상되어 적합하지 않다고 판단.
  - 2. 재시도 락(tryLock)을 사용하는 것이 변경 사항이 가장 적고 효율적인 해결책이라 판단
    - 서비스 특성(운행 시간표, 회차 수, 차량 탑승 가능 인원, 예상 대기 시간 등)을 고려할 때 트래픽이 크지 않아 **TryLock** 을 사용하는 것이 효율적이고, 변경 사항이 최소화되는 해결책이라고 판단. 또한 서비스 확장성을 생각했을 때 오버엔지니어링 할 필요가 없다고 판단.
  - 3. 최적의 waitTime, leaseTime 설정
    - **leaseTime**: 운영 환경의 한 달간 로그 데이터를 분석해, 가장 오래 걸린 Task Duration(4.7초)을 기준으로 설정.
    - **waitTime**: 배차 요청 외에 락을 사용하는 다른 API들이 허용 가능한 대기 시간을 검토하여 결정.
  - 4. Test Code 를 통해서 가설 검증
    - 2번 과정에서 예상되는 트래픽과 3번 과정에서 얻은 설정 값이 효과적일지 테스트 코드를 통해서 검증
  - 5. 문서화 및 공유
    - 모든 문제 해결 과정을 사내 Wiki 에 문서화하고 공유
- 성과 검증: 데이터 기반 모니터링을 통해 에러율 0% 달성 및 시스템 안정성 확보
- 비즈니스 임팩트: 자율주행 버스 서비스의 신뢰성 향상으로 사용자 만족도 및 운영 효율성 극대화
- Tech Stack: Java, JUnit, Spring Boot, Google Firestore, Orda, PostgreSQL, Datadog, Kubernetes, Redis

### TableManager (2022.03 ~ 2022.08)

- KT 통화 비서 인증 기능 구현 (2022.05 ~ 2022.07)
  - KT 와 TableManager 의 협업 프로젝트이며, KT 통화비서라는 앱을 통해 예약 관련 매장 관리 등의 기능들을 제공해주는 서비스
  - KT-TableManager 서버간 통신을 위한 인증 체계 구축 시 HMAC 단방향 암호화 사용
  - Webview-TableManager 간 통신을 위한 인증 체계 구축 시 JWT Token 사용
  - NodeJS, MySQL, Typescript
  - AWS Elastic BeanStalk, Cloud Watch, Whatap
- 결제 서비스 유지보수 (2022.05)
    - 픽업 주문 서비스 개발과 함께 카카오페이 원클릭 결제 플로우 및, 아워홈 RF 결제 플로우 유지보수
    - Kotlin 1.6.0, Spring Boot 2.6.0, Spring Data JPA 2.6.1
- 픽업 주문 서비스 개발 (2022.04 ~ 2022.06)
    - 온라인 서비스의 기술을 적용해 오프라인 매장에서 새로운 매출을 창출해내는 O4O(Online for Offline) Service
    - 주문/정산 로직 개발 및 결제 서비스 유지보수
    - Kotlin 1.6.10, Spring Boot 2.6.3, Spring Data JDBC, Spring Security, Spring AOP
    - MySQL, AWS Elastic BeanStalk, Cloud Watch, Whatap

### Mayeye (2019.07 ~ 2021.10)

- 보령시청 가맹점  온/오프라인 신청 기능 개발 (2021.08 ~ 2021.09)
- 오픈소스 simplecaptcha 를 활용한 CAPTCHA 기능 개발 (2021.07)
- 일제강제동원 피해자지원재단 신규 구축 (2021.03 ~ 2021.05)
- 소상공인 교육 나눔터 시스템 구축 (2020.12 ~ 2021.03)
- 수자원 단비톡톡 마일리지 적립/차감 기능 개발 (2020.10 ~ 2020.11)
- 소상공인 임차인 확인서 발급 시스템 구축 (2020.06 ~ 2020.09)
- 보령시청 긴급재난지원금 신청/관리 기능 개발 (2020.04 ~ 2020.05)
- 공주대학교 홈페이지 개편 (2019.07 ~ 2019.12)