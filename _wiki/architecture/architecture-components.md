---
layout  : wiki
title   : Components of Software Architectures
summary : Expectations for Architects
date    : 2023-03-05 15:02:32 +0900
updated : 2023-03-05 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Components of Software Architectures

1. 시스템 구조
2. 아키텍처 특성
3. 아키텍처 결정
4. 설계 원칙

### System Structure

- Q. 어떤 아키텍처인지 설명해주세요
- A. 마이크로 서비스 아키텍처입니다.

위 QNA 에서 아키텍트가 대답한 "마이크로 서비스 아키텍처" 가 시스템 구조(System Structure) 에 해당한다.

### Architectural Characteristics

아키텍처 특성(Architectural Characteristics)은  시스템의 기능과 직교(orthogonal)하는 시스템의 성공 기준(success criteria)을 결정한다.

시스템을 지원해야 하는 `~ 성` 을 의미한다.

- 가용성, 신뢰성, 시험성, 확장성, 보안, 민첩성, 내결함성, 탄력성, 복구성, 성능, 배포성, 학습성 등

### Architectural Decision

아키텍처 결정(Architectural Decision)은 시스템 구축에 필요한 __규칙__ 들을 정한 것이다. 예를 들면 "레이어드 아키텍처에서 프레젠테이션 레이어가 데이터베이스를 호출하지 못하게 한다" 처럼 결정하는 식이다.

아키텍처 결정은 시스템 제약조건(constraint)을 형성한다.

### Design Principle

아키텍처 결정이 반드시 지켜야할 규칙이라면, 설계 원칙(Design Principle)은 가이드라인(guideline) 이다. 예를 들면 마이크로서비스 아키텍처에서 성능 향상을 위해 서비스 간 통신을 비동기 메시징을 활용해야 한다라고 기술하는 것이 설계 원칙이다.

## Expectations for Architects

아키텍트에 대한 기대치는 다음과 같다.

1. 아키텍처 결정을 내린다.
2. 아키텍처를 지속적으로 분석한다.
3. 최신 트렌드를 계속 유지한다.
4. 아키텍처 결정의 컴플라이언스(compliance)를 보장한다. 
5. 다양한 기술과 경험에 노출된다.
6. 비지니스 도메인 지식을 보유한다.
7. 대인 관계 기술이 뛰어나다.
8. 정치를 이해하고 처세를 잘한다.

컴플라이언스 보장이란 아키텍트가 정의하고 문서화하여 전달한 아키텍처 결정과 설계 원칙들을 개발팀이 제대로 준수하고 있는지 지속적으로 확인한다는 뜻이다.

## References

- Software Architecture 101 / 마크 리처드, 닐포드 저 / O'REILLY