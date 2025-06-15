---
layout  : wiki
title   : How Spring Brings Object-Oriented Principles to Life
summary : 
date    : 2025-06-12 20:28:32 +0900
updated : 2025-06-12 21:15:24 +0900
tag     : spring oop
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## How Spring Brings Object-Oriented Principles to Life

스프링(Spring)은 자바 기반의 프레임워크로, ___[Object Oriented Programming](https://klarciel.net/tag/#oop)___ 의 원칙과 철학을 구현하고 실현하는 데 실질적인 도움을 준다.
스프링의 핵심 요소들이 객체지향에 어떤 도움을 주는지를 살펴보자.

- DI: 의존 역전, 낮은 결합도
- IoC: 책임 분리, 높은 응집도
- AOP: 관심사 분리, SRP
- Bean Lifecycle: 캡슐화, 객체 책임 정리
- Abstraction: 추상화, 기술 독립성
- Design Pattern: Decoupling

### Dependency Injection

스프링이 객체의 생성과 주입을 대신 해줌으로써, 클래스 간 직접적인 의존을 제거하고, 인터페이스에 의존하도록 유도한다.

__OOP 측면의 효과__:
- 객체는 구체 클래스에 의존하지 않고, 인터페이스에 의존하게 됨 → 역할 기반 설계 가능
- 구현 교체가 쉬움 (테스트용 객체, Mock 등 삽입 가능)
- 유연한 아키텍처 설계 가능 (전략 패턴, 데코레이터 패턴 등과 잘 어울림)

### Inversion of Control

애플리케이션의 제어 흐름(객체 생성, 생명주기 관리 등)을 개발자가 아닌 스프링 컨테이너가 담당한다.

__OOP 측면의 효과__:
- 객체는 자기 역할에만 집중할 수 있음 → 응집도 상승
- 객체 생성과 관리 책임이 분리되어 → 단일 책임 원칙(SRP) 준수 용이

### Aspect Oriented Programming

공통 기능(로깅, 트랜잭션, 보안 등)을 핵심 로직과 분리하여 횡단 관심사(cross-cutting concern)를 모듈화한다.

__OOP 측면의 효과__:
- 핵심 로직과 부가 로직이 분리됨 → 클래스는 본연의 책임만 수행
- 코드 중복 제거 → 유지보수성 향상
- 여러 객체에 공통 행위를 동적으로 적용 가능 → 객체 합성 개념에 유리

### Bean Lifecycle

객체의 생성, 초기화, 소멸까지 스프링이 관리하며, 필요 시 원하는 스코프 (singleton, prototype 등)로 동작시킬 수 있다.

__OOP 측면의 효과__:
- 객체의 생명주기 관리 코드 분리 → 코드 간결 & 테스트 용이
- 재사용성과 캡슐화를 높이는 구조로 유도

### Abstraction

스프링은 트랜잭션 ___[추상화(Abstraction)](https://klarciel.net/wiki/architecture/architecture-abstraction/)___ 와 같이 구현 기술과 비즈니스 로직을 분리시키는 적절한 ___[DESIGNPATTERN](https://klarciel.net/wiki/designpattern/)___ 들이 적용되어있다. 이는 고품질 코드를 작성하는데 도움을 준다.

__OOP 측면의 효과__:
- 구현 은닉, 추상화 기반 프로그래밍
- 구현 기술(JDBC, JPA, Hibernate 등)과 무관하게 트랜잭션을 추상화하고 어노테이션 기반으로 선언적 관리 가능하다. 세부 구현기술로 부터 DECOUPLING 하게 해준다. 따라서, 구현 기술과 비즈니스 로직이 분리됨
- 클라이언트는 추상화된 인터페이스만 신경 쓰면 됨 → 인터페이스 기반 설계 강화