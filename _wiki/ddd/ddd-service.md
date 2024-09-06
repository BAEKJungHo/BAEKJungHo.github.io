---
layout  : wiki
title   : Domain Service
summary : 도메인 서비스간의 의존관계에 대하여
date    : 2022-07-20 22:57:32 +0900
updated : 2022-07-20 23:21:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## What is Domain Service ?

> When a significant process or transformation in the domain is not a natural responsibility of an ENTITY or VALUE OBJECT, add an operation to the model as standalone interface declared as a SERVICE. Define the interface in terms of the language of the model and make sure the operation name is part of the UBIQUITOUS LANGUAGE. Make the SERVICE stateless.
> 
> --- __Eric Evans Domain-Driven Design__ --- 
{:  .last_line_author}

## From: Domain Driven Design

> 도메인의 중대한 프로세스나 변환 과정이 ENTITY 나 VALUE OBJECT 의 고유한 책임이 아니라면 연산을 SERVICE 로 선언되는 독립 인터페이스 모델에 추가하라. 모델의 언어라는 측면에서 인터페이스를 정의하고 이름을 UBIQUITOUS LANGUAGE 의 일부가 되게끔 구성하라. SERVICE 는 상태를 갖지 않게 만들어라.

## 도메인 서비스간 의존 관계는 최대한 제거

도메인 레이어에 속하는 도메인 서비스간의 의존 관계는 최대한 제거하는게 좋다.

### 장점

- 도메인 레이어에 대한 테스트 코드 작성이 쉽다.
  -  Layered Architecture 에서 Domain Layer 에 대한 테스트 코드 작성이 가장 중요하다고 생각한다.
- 도메인 서비스간에 상하 관계를 제거할 수 있다.
  - 서비스간의 참조 관계를 두다 보면, Root Service 에 많은 의존성이 생겨서 테스트 코드 작성이 어려워질 수 있다. 또한, 도메인 로직 파악이 어려워진다.

### 도메인 서비스 구현

- 세세한 구현과, low-level 의 기술은 infrastructure 에 위임하고, 구현체를 사용하는 레이어에 interface 를 제공한다.
- 해당 레이어에서는 DIP(Dependency Inversion Principle, 의존 관계 역전 원칙)를 통해 구현체를 사용한다.

### Dependency Inversion Principle

- 구현체가 아닌 추상화에 의존한다. (= 구현이 아닌 역할에 의존)
- 추상화 레벨이 높은 상위 수준의 모듈이 추상화 레벨이 낮은 하위 모듈에 의존하면 안된다.
  - Domain Layer 가 상위 수준의 모듈, Infrastructure Layer 가 하위 수준의 모듈로 볼 수 있다.
  
DIP 를 적용했을때의 장점은 [Portable Service Abstraction](https://baekjungho.github.io/wiki/spring/spring-psa/) 의 장점과 같다. 

__서비스 추상화로 제공되는 기술을 다른 기술 스택으로 간편하게 바꿀 수 있는 확장성이 생긴다.__

## 애플리케이션 서비스의 네이밍에 대해서

보통의 경우에는 application layer 에서 Facade 형식의 xxxService 라는 네이밍을 사용하는 컨벤션을 사용하곤 한다. 하지만 DDD 개념을 적용하여 개발하는 경우에는 다른 네이밍을 가져가는게 좋다고 생각한다.

- Ex. xxxFacade, xxxApplicationService ... 

## Links

- [Services in Domain-Driven Design (DDD)](http://gorodinski.com/blog/2012/04/14/services-in-domain-driven-design-ddd/)
- [Portable Service Abstraction](https://baekjungho.github.io/wiki/spring/spring-psa/)

## References

- 도메인 주도 설계 / Eric Evans 저 / 위키북스