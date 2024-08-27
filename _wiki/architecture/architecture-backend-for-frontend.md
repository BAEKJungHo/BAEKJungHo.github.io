---
layout  : wiki
title   : Backend For Frontend
summary : 
date    : 2024-08-27 18:02:32 +0900
updated : 2024-08-27 20:12:24 +0900
tag     : architecture designpattern
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Backend For Frontend

___[Backends for Frontends Pattern](https://aws.amazon.com/ko/blogs/mobile/backends-for-frontends-pattern/)___ 이란 Architecture 를 ___Frontend Friendly___ 하게 변경하는 것을 의미한다.

__Characteristics__:

- 프론트엔드 전용 API: 각 클라이언트 유형(웹, 모바일 등)에 최적화된 API 를 제공
- 데이터 집계: 여러 백엔드 서비스의 데이터를 클라이언트에 맞게 조합
- 프로토콜 변환: 백엔드 서비스와 클라이언트 간의 통신 프로토콜을 조정
- 인증 및 권한 관리: 클라이언트별 보안 요구사항을 처리

__When use BFF Patterns__:

- 다양한 클라이언트 지원: 웹, 모바일 앱, IoT 기기 등 다른 요구사항을 가진 클라이언트들을 지원할 때
- 레거시 시스템 통합: 새로운 프론트엔드와 기존 백엔드 시스템을 연결할 때
- 마이크로서비스 아키텍처: 여러 마이크로서비스의 데이터를 효율적으로 조합해야 할 때
- 성능 최적화: 클라이언트별로 최적화된 데이터 전송이 필요할 때
- API 버전 관리: 클라이언트별로 다른 API 버전을 관리해야 할 때


